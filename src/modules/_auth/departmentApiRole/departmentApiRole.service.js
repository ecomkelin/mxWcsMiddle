const DepartmentApiRole = require("../../../models/_auth/roleApi/DepartmentApiRole");
const Department = require("../../../models/_structure/Department");
const ApiRole = require("../../../models/_auth/roleApi/ApiRole");
const User = require("../../../models/_structure/User");
const UserApiRole = require("../../../models/_auth/roleApi/UserApiRole");
const { error } = require("../../../utils/response");

class DepartmentApiRoleService {
  async createDepartmentApiRole(data) {
    const departmentId = data.departmentId;
    const isExistDepartment = await Department.findOne({ _id: departmentId });
    if (!isExistDepartment) throw new Error("此部门不存在");

    const isItemRepeat = await DepartmentApiRole.findOne({ departmentId });
    if (isItemRepeat)
      throw new Error("此部门已经存在角色关系， 不能再次为其创建部门角色关系");

    const apiRoleIds = data.apiRoleIds;
    if (!apiRoleIds || !(apiRoleIds instanceof Array))
      throw new Error("请传递参数 apiRoleIds 为数组");
    // 去重
    const filterApiRoleIds = [...new Set(apiRoleIds)];
    const apiRoleCount = await ApiRole.countDocuments({
      _id: { $in: filterApiRoleIds },
    });
    if (apiRoleCount !== filterApiRoleIds.length)
      throw new Error("apiRoleIds 中 有不存在的角色 请检查");

    const departmentApiRole = new DepartmentApiRole({departmentId, apiRoleIds: filterApiRoleIds});
    await departmentApiRole.save();
    await this.updateRelatedUserApiRoles(departmentApiRole.departmentId);
    return departmentApiRole;
  }

  async getDepartmentApiRoles(query) {
    const {
      page = 1,
      limit = 10,
      keyword,
      departmentId,
      sort = "-createdAt",
    } = query;

    const filter = {};

    if (keyword) {
      filter.$or = [{ "department.name": new RegExp(keyword, "i") }];
    }

    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const total = await DepartmentApiRole.countDocuments(filter);
    const items = await DepartmentApiRole.find(filter)
      .populate("departmentId", "name code")
      .populate("apiRoleIds", "code description")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sort);

    return {
      total,
      items,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  async getDepartmentApiRole(id) {
    return await DepartmentApiRole.findOne({ departmentId: id })
      .populate("departmentId", "name code")
      .populate("apiRoleIds", "code description");
  }

  async updateDepartmentApiRole(id, updates, userId) {
    // 先通过 departmentId 查找记录
    const existingRole = await DepartmentApiRole.findOne({ departmentId: id });
    if (!existingRole) {
      throw new Error("部门角色关系不存在");
    }

    // 使用找到的记录的 _id 进行更新
    const departmentApiRole = await DepartmentApiRole.findByIdAndUpdate(
      existingRole._id,
      {
        ...updates,
        updatedBy: userId,
      },
      { new: true }
    );

    if (departmentApiRole) {
      await this.updateRelatedUserApiRoles(departmentApiRole.departmentId);
    }

    return departmentApiRole;
  }

  async deleteDepartmentApiRole(id) {
    const departmentApiRole = await DepartmentApiRole.findById(id);
    if (!departmentApiRole) return null;

    const result = await DepartmentApiRole.findByIdAndDelete(id);
    if (result) {
      await this.updateRelatedUserApiRoles(departmentApiRole.departmentId);
    }
    return result;
  }

  // 更新相关用户的角色
  async updateRelatedUserApiRoles(departmentId) {
    // 获取部门的所有用户
    const users = await User.find({ departmentIds: departmentId });

    // 更新每个用户的角色
    for (const user of users) {
      await this.calculateAndUpdateUserApiRoles(user._id);
    }
  }

  // 计算并更新用户的角色
  async calculateAndUpdateUserApiRoles(userId) {
    const user = await User.findById(userId).populate("departmentIds");

    const userApiRole =
      (await UserApiRole.findOne({ userId })) || new UserApiRole({ userId });

    // 获取用户所有部门的角色
    const departmentApiRoles = await DepartmentApiRole.find({
      departmentId: { $in: user.departmentIds },
    });

    // 先合并所有部门的角色
    const depApiRoleIds = new Set();
    departmentApiRoles.forEach((deptRole) => {
      deptRole.apiRoleIds.forEach((roleId) => {
        depApiRoleIds.add(roleId.toString());
      });
    });

    // 从部门角色中去掉被屏蔽的角色
    const filteredDepRoleIds = Array.from(depApiRoleIds).filter(
      (roleId) =>
        !userApiRole.maskRoleIds.map((id) => id.toString()).includes(roleId)
    );

    // 最后合并自定义角色
    const allRoleIds = new Set([
      ...userApiRole.customRoleIds.map((id) => id.toString()),
      ...filteredDepRoleIds,
    ]);

    // 更新用户的角色
    userApiRole.apiRoleIds = Array.from(allRoleIds);
    await userApiRole.save();
  }
}

module.exports = new DepartmentApiRoleService();
