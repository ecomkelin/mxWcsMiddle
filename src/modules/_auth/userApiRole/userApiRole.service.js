const UserApiRole = require("../../../models/_auth/roleApi/UserApiRole");
const User = require("../../../models/_structure/User");
const DepartmentApiRole = require("../../../models/_auth/roleApi/DepartmentApiRole");
const mongoose = require("mongoose");
const UserApiPermission = require("../../../models/_auth/roleApi/UserApiPermission");
const ApiRole = require("../../../models/_auth/roleApi/ApiRole");
const { DATA_RANGE } = require("../../../config/permission.config");

class UserApiRoleService {
  async getUserApiRoles(query) {
    const {
      page = 1,
      limit = 10,
      keyword,
      sort = '-createdAt'
    } = query;

    const filter = {};

    if (keyword) {
      // 获取匹配关键词的用户ID
      const userIds = await User.find({
        $or: [
          { name: new RegExp(keyword, 'i') },
          { code: new RegExp(keyword, 'i') }
        ]
      }).distinct('_id');

      filter.userId = { $in: userIds };
    }

    const total = await UserApiRole.countDocuments(filter);
    const items = await UserApiRole.find(filter)
      .populate('userId', 'name code')
      .populate('customRoleIds', 'code description')
      .populate('maskRoleIds', 'code description')
      .populate('apiRoleIds', 'code description')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sort);

    return {
      total,
      items,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  async getUserApiRole(userId) {
    return await UserApiRole.findOne({ userId })
      .populate('userId', 'name code')
      .populate('customRoleIds', 'code description')
      .populate('maskRoleIds', 'code description')
      .populate('apiRoleIds', 'code description');
  }

  async updateUserApiRole(userId, updates, operatorId) {
    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.isAdmin) {
      throw new Error('不能修改管理员的角色配置');
    }

    const userApiRole = await this.getUserApiRole(userId);
    if (!userApiRole) {
      userApiRole = new UserApiRole({ userId });
    }

    // 更新自定义角色和屏蔽角色
    if (updates.customRoleIds !== undefined) {
      if (!Array.isArray(updates.customRoleIds) || !updates.customRoleIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error('customRoleIds 必须是 ObjectId 数组');
      }
      userApiRole.customRoleIds = updates.customRoleIds;
    }
    if (updates.maskRoleIds !== undefined) {
      if (!Array.isArray(updates.maskRoleIds) || !updates.maskRoleIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error('maskRoleIds 必须是 ObjectId 数组');
      }
      userApiRole.maskRoleIds = updates.maskRoleIds;
    }

    // 重新计算最终的角色列表
    await this.recalculateApiRoles(userApiRole);
    await userApiRole.save();

    // 重新计算并更新用户的API权限
    await this.recalculateAndUpdateUserApiPermissions(userApiRole);

    return userApiRole;
  }

  async recalculateApiRoles(userApiRole) {
    // 获取用户信息
    const user = await User.findById(userApiRole.userId)
      .populate('departmentIds');

    // 获取用户所有部门的角色
    const departmentApiRoles = await DepartmentApiRole.find({
      departmentId: { $in: user.departmentIds }
    });

    // 先合并所有部门的角色
    const depApiRoleIds = new Set();
    departmentApiRoles.forEach(deptRole => {
      deptRole.apiRoleIds.forEach(roleId => {
        depApiRoleIds.add(roleId.toString());
      });
    });

    // 从部门角色中去掉被屏蔽的角色
    const filteredDepRoleIds = Array.from(depApiRoleIds)
      .filter(roleId => !userApiRole.maskRoleIds
        .map(id => id.toString())
        .includes(roleId)
      );

    // 最后合并自定义角色
    const allRoleIds = new Set([
      ...userApiRole.customRoleIds.map(id => id.toString()),
      ...filteredDepRoleIds
    ]);

    // 更新最终的角色列表
    userApiRole.apiRoleIds = Array.from(allRoleIds);
  }

  async recalculateAndUpdateUserApiPermissions(userApiRole) {
    // 1. 获取用户信息和相关角色
    const user = await User.findById(userApiRole.userId).populate('departmentIds');
    if (!user) {
      throw new Error('用户不存在');
    }

    // 2. 获取用户的自定义角色
    const customRoles = await ApiRole.find({
      _id: { $in: userApiRole.customRoleIds }
    });

    // 3. 获取用户所在部门的角色
    const departmentApiRoles = await DepartmentApiRole.find({
      departmentId: { $in: user.departmentIds }
    });

    // 过滤掉被屏蔽的部门角色
    const maskRoleIds = userApiRole.maskRoleIds.map(id => id.toString());
    const effectiveDepartmentRoles = await ApiRole.find({
      _id: {
        $in: departmentApiRoles.flatMap(deptRole => 
          deptRole.apiRoleIds.filter(roleId => 
            !maskRoleIds.includes(roleId.toString())
          )
        )
      }
    });

    // 4. 收集所有权限和它们的范围
    const permissionRanges = new Map(); // Map<permissionCode, Map<departmentId, range>>

    // 处理自定义角色的权限
    for (const role of customRoles) {
      for (const permission of role.apiPermissions) {
        if (!permissionRanges.has(permission.code)) {
          permissionRanges.set(permission.code, new Map());
        }
        const ranges = permissionRanges.get(permission.code);
        // 自定义角色的权限适用于所有部门
        ranges.set('custom', {
          range: permission.range,
          fromCustomRole: true
        });
      }
    }

    // 处理部门角色的权限
    for (const role of effectiveDepartmentRoles) {
      for (const permission of role.apiPermissions) {
        if (!permissionRanges.has(permission.code)) {
          permissionRanges.set(permission.code, new Map());
        }
        const ranges = permissionRanges.get(permission.code);
        
        // 找到这个角色所属的部门
        const relatedDeptRoles = departmentApiRoles.filter(deptRole => 
          deptRole.apiRoleIds.some(roleId => roleId.toString() === role._id.toString())
        );

        // 为每个相关部门设置权限范围
        for (const deptRole of relatedDeptRoles) {
          ranges.set(deptRole.departmentId.toString(), {
            range: permission.range,
            departmentId: deptRole.departmentId
          });
        }
      }
    }

    // 5. 优化权限范围并生成最终权限列表
    const optimizedPermissions = [];
    for (const [permissionCode, rangeMap] of permissionRanges.entries()) {
      const rangeInfo = this.optimizePermissionRanges(Array.from(rangeMap.values()));
      
      // 如果需要保持部门级别的权限
      if (rangeInfo.keepDepartmentLevel) {
        // 为每个部门创建单独的权限记录
        for (const [deptId, range] of rangeMap.entries()) {
          if (deptId !== 'custom' && range.range === DATA_RANGE.DEPARTMENT) {
            optimizedPermissions.push({
              userId: userApiRole.userId,
              apiPermissionCode: permissionCode,
              range: DATA_RANGE.DEPARTMENT,
              departmentIds: [range.departmentId]
            });
          }
        }
        // 如果存在个人级别权限，也要保留
        if (rangeInfo.keepPersonal) {
          optimizedPermissions.push({
            userId: userApiRole.userId,
            apiPermissionCode: permissionCode,
            range: DATA_RANGE.SELF,
            departmentIds: []
          });
        }
      } else {
        // 使用最高权限级别
        optimizedPermissions.push({
          userId: userApiRole.userId,
          apiPermissionCode: permissionCode,
          range: rangeInfo.range,
          departmentIds: rangeInfo.range === DATA_RANGE.DEPARTMENT ? 
            Array.from(rangeMap.values())
              .filter(r => r.departmentId)
              .map(r => r.departmentId) : 
            []
        });
      }
    }

    // 6. 批量更新权限
    await this.batchUpdateUserPermissions(userApiRole.userId, optimizedPermissions);
  }

  optimizePermissionRanges(ranges) {
    // 找出最大范围
    const maxRange = Math.max(...ranges.map(r => r.range));
    
    // 检查是否有来自自定义角色的权限
    const hasCustomRolePermission = ranges.some(r => r.fromCustomRole);

    // 如果有更高级别的自定义权限，直接使用最高级别
    if (hasCustomRolePermission && maxRange > DATA_RANGE.DEPARTMENT) {
      return {
        range: maxRange,
        keepDepartmentLevel: false,
        keepPersonal: false
      };
    }

    // 特殊情况处理：部门级别权限
    if (maxRange === DATA_RANGE.DEPARTMENT && !hasCustomRolePermission) {
      return {
        range: DATA_RANGE.DEPARTMENT,
        keepDepartmentLevel: true,
        keepPersonal: true
      };
    }

    // 常规情况：返回最高权限级别
    return {
      range: maxRange,
      keepDepartmentLevel: false,
      keepPersonal: false
    };
  }

  async batchUpdateUserPermissions(userId, permissions) {
    // 1. 删除旧的权限
    await UserApiPermission.deleteMany({ userId });

    // 2. 批量创建新的权限
    if (permissions.length > 0) {
      await UserApiPermission.insertMany(permissions);
    }
  }
}

module.exports = new UserApiRoleService(); 