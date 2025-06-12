const Company = require("../../../models/_structure/Company");

class CompanyService {
  /**
   * 创建公司
   */
  async createCompany(companyData, userId) {
    const company = new Company({
      ...companyData,
      createdBy: userId
    });
    return await company.save();
  }

  /**
   * 获取公司列表
   */
  async getCompanies({ page = 1, limit = 10, keyword }) {
    try {

      const query = {};
      if (keyword) {
        query.$or = [
          { name: new RegExp(keyword, 'i') },
          { code: new RegExp(keyword, 'i') }
        ];
      }
  
      const total = await Company.countDocuments(query);
      const items = await Company.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name code');
  
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
   * 获取单个公司
   */
  async getCompanyById(id) {
    return await Company.findById(id)
      .populate('createdBy', 'name code');
  }

  /**
   * 更新公司
   */
  async updateCompany(id, updateData, userId) {
    return await Company.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedBy: userId 
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * 删除公司
   */
  async deleteCompany(id) {
    return await Company.findByIdAndDelete(id);
  }

  /**
   * 检查公司编号是否存在
   */
  async isCodeExists(code, excludeId = null) {
    const query = { code: code.toUpperCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Company.exists(query);
  }
}

module.exports = new CompanyService(); 