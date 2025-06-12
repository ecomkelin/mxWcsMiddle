const ApiPermission = require("../../../models/_auth/roleApi/ApiPermission");
const ApiRole = require("../../../models/_auth/roleApi/ApiRole");

const ApiPermissionService = {
  /**
   * 创建API权限
   */
  async createApiPermission(data) {
    // 检查是否存在
    const exists = await this.exists(data.code);
    if (exists) {
      throw new Error("该API权限已存在");
    }

    const apiPermission = new ApiPermission(data);
    return await apiPermission.save();
  },

  /**
   * 获取API权限列表
   */
  async getApiPermissions(query) {
    const { page = 1, limit = 10, keyword, code, apiPath, apiMethod, categoryTags } = query;
    const filter = {};

    if (keyword) {
      filter.$or = [
        { code: new RegExp(keyword, "i") },
      ];
    }

    if (code) {
      filter.code = code;
    }
    if(categoryTags) {
      filter.categoryTags = { $in: categoryTags };
    }

    if (apiPath) {
      filter.apiPath = apiPath;
    }

    if (apiMethod) {
      filter.apiMethod = apiMethod;
    }

    const total = await ApiPermission.countDocuments(filter);
    const items = await ApiPermission.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ apiPath: 1, apiMethod: 1 });

    return {
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
      items,
    };
  },

  /**
   * 获取单个API权限
   */
  async getApiPermissionById(id) {
    return await ApiPermission.findById(id);
  },

  /**
   * 更新API权限
   */
  async updateApiPermission(id, updateData) {
    const apiPermission = await ApiPermission.findById(id);
    if (!apiPermission) {
      throw new Error("API权限不存在");
    }
    delete updateData.code;
    const _apiPermission = Object.assign(apiPermission, updateData);

    return await _apiPermission.save();
  },

  /**
   * 删除API权限
   */
  async deleteApiPermission(id) {
    const apiPermission = await ApiPermission.findById(id);
    if (!apiPermission) {
      throw new Error("API权限不存在");
    }
    const apiRole = await ApiRole.findOne({ apiPermissions: { $elemMatch: { apiPermissionCode: apiPermission.code } } });
    if (apiRole) {
      throw new Error("该API权限已被角色使用，无法删除");
    }

    return await ApiPermission.findByIdAndDelete(id);
  },

  /**
   * 检查API权限是否存在
   * @param {string} excludeId - 排除的ID（用于更新时检查）
   * @param {string} apiMethod - API方法
   * @param {string} apiPath - API路径
   */
  async exists(code) {
    const filter = {
      code,
    };

    return await ApiPermission.exists(filter);
  },
};

module.exports = ApiPermissionService;
