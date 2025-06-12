const Department = require("../../../models/_structure/Department");

class DepartmentService {
  /**
   * 创建部门
   */
  async createDepartment(departmentData, userId) {
    const department = new Department({
      ...departmentData,
      createdBy: userId
    });
    return await department.save();
  }

  /**
   * 获取部门列表
   */
  async getDepartments({ page = 1, limit = 10, keyword, companyId }) {
    try {
      const query = {};
      
      // 按公司筛选
      if (companyId) {
        query.companyId = companyId;
      }

      // 关键字搜索
      if (keyword) {
        query.name = new RegExp(keyword, 'i');
      }

      const total = await Department.countDocuments(query);
      const items = await Department.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name code')
        .populate('companyId', 'name code');

      return {
        total,
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取单个部门
   */
  async getDepartmentById(id) {
    return await Department.findById(id)
      .populate('createdBy', 'name code')
      .populate('companyId', 'name code');
  }

  /**
   * 更新部门
   */
  async updateDepartment(id, updateData, userId) {
    return await Department.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedBy: userId 
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * 删除部门
   */
  async deleteDepartment(id) {
    return await Department.findByIdAndDelete(id);
  }

  /**
   * 检查部门名称在同一公司下是否存在
   */
  async isNameExistsInCompany(name, companyId, excludeId = null) {
    const query = { 
      name: name,
      companyId: companyId
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Department.exists(query);
  }
}

module.exports = new DepartmentService(); 