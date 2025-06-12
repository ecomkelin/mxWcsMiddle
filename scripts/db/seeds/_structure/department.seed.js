const Department = require('../../../../src/models/_structure/Department');
const Company = require('../../../../src/models/_structure/Company');
const User = require('../../../../src/models/_structure/User');

const departmentSeedData = [
  {
    name: '销售部',
    description: '负责产品销售和客户管理'
  },
  {
    name: '采购部',
    description: '负责原材料采购和供应商管理'
  },
  {
    name: '人力资源部',
    description: '负责人员招聘和培训'
  },
  {
    name: '财务部',
    description: '负责公司财务管理'
  },
  {
    name: '信息技术部',
    description: '负责公司IT系统维护'
  }
];

async function initializeDepartments() {
  try {
    // 清空现有数据
    await Department.deleteMany({});

    // 获取总公司
    const headquarters = await Company.findOne({ code: 'HQ001' });
    if (!headquarters) {
      throw new Error('未找到总公司，请先初始化公司数据');
    }

    // 为每个部门添加公司和创建者信息
    const departmentsWithCompany = departmentSeedData.map(dept => ({
      ...dept,
      companyId: headquarters._id,
      isActive: true
    }));

    // 批量插入数据
    const departments = await Department.insertMany(departmentsWithCompany);
    console.log('部门数据初始化成功');

    // 返回创建的部门，供其他种子数据使用
    return departments;
  } catch (error) {
    console.error('部门数据初始化失败:', error);
    throw error;
  }
}

module.exports = {
  initializeDepartments,
  departmentSeedData
}; 