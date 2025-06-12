const Company = require('../../../../src/models/_structure/Company');
const User = require('../../../../src/models/_structure/User');

const companySeedData = [
  {
    code: 'HQ001',
    name: '总公司',
    address: '北京市朝阳区xxx街道',
    phone: '010-12345678',
    isActive: true
  },
  {
    code: 'BR001',
    name: '上海分公司',
    address: '上海市浦东新区xxx路',
    phone: '021-87654321',
    isActive: true
  },
  {
    code: 'BR002',
    name: '广州分公司',
    address: '广州市天河区xxx路',
    phone: '020-12345678',
    isActive: true
  },
  {
    code: 'BR003',
    name: '深圳分公司',
    address: '深圳市南山区xxx路',
    phone: '0755-12345678',
    isActive: true
  }
];

async function initializeCompanies() {
  try {
    // 清空现有数据
    await Company.deleteMany({});

    // 批量插入数据
    await Company.insertMany(companySeedData);
    console.log('公司数据初始化成功');
  } catch (error) {
    console.error('公司数据初始化失败:', error);
    throw error;
  }
}

module.exports = {
  initializeCompanies,
  companySeedData
}; 