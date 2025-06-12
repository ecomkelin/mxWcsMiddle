const ApiRole = require("../../../models/_auth/roleApi/ApiRole");
const UserApiRole = require("../../../models/_auth/roleApi/UserApiRole");
const DepartmentApiRole = require("../../../models/_auth/roleApi/DepartmentApiRole");
const ApiPermission = require("../../../models/_auth/roleApi/ApiPermission");

const ApiRoleService = {
  async createApiRole(data) {
    const apiRole = new ApiRole(data);
    const existingRole = await ApiRole.findOne({ code: data.code });
    if (existingRole) {
      throw new Error("API角色代码已存在");
    }
    // 检查API权限是否存在
    for (const permission of data.apiPermissions) {
      const apiPermission = await ApiPermission.findOne({ code: permission.apiPermissionCode });
      if (!apiPermission) {
        throw new Error(`API权限 ${permission.apiPermissionCode} 不存在`);
      }
    }
    return await apiRole.save();
  },

  async getApiRoles(query) {
    const { page = 1, limit = 10, keyword } = query;
    const filter = {};

    if (keyword) {
      filter.$or = [
        { code: new RegExp(keyword, "i") },
      ];
    }

    const total = await ApiRole.countDocuments(filter);
    const items = await ApiRole.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ code: 1 });

    return {
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
      items,
    };
  },

  async getApiRoleById(id) {
    return await ApiRole.findById(id);
  },

  async updateApiRole(id, updateData) {
    const apiRole = await ApiRole.findById(id);
    if (!apiRole) {
      throw new Error("API角色不存在");
    }
    // 检查API角色代码是否已存在
    const existingRole = await ApiRole.findOne({ code: updateData.code });
    if (existingRole && existingRole._id.toString() !== id) {
      throw new Error("API角色代码已存在");
    }
    // 检查API权限是否存在
    for (const permission of updateData.apiPermissions) {
      const apiPermission = await ApiPermission.findOne({ code: permission.apiPermissionCode });
      if (!apiPermission) {
        throw new Error(`API权限 ${permission.apiPermissionCode} 不存在`);
      }
    }
    Object.assign(apiRole, updateData);
    return await apiRole.save();
  },

  async deleteApiRole(id) {
    // 检查API角色是否被用户使用
    const userApiRole = await UserApiRole.findOne({ apiRoleIds: id });
    if (userApiRole) {
      throw new Error("该API角色已被用户使用，无法删除");
    }
    // 检查API角色是否被部门使用
    const depApiRole = await DepartmentApiRole.findOne({ apiRoleIds: id });
    if (depApiRole) {
      throw new Error("该API角色已被部门使用，无法删除");
    }
    return await ApiRole.findByIdAndDelete(id);
  },
};

module.exports = ApiRoleService; 