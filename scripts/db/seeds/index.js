const { initializeUsers } = require('./_structure/user.seed');
const { initializeCompanies } = require('./_structure/company.seed');
const { initializeDepartments } = require('./_structure/department.seed');
const { initializeProducts } = require('./product.seed');
const { initializeApiPermissions } = require('./_auth/apiPermission.seed');

// 定义模块初始化顺序
const INIT_ORDER = [
  'apiPermissions',  // 添加API权限初始化
  'companies', 
  'departments', 
  'users', 
  'products',
];

const INIT_FUNCTIONS = {
  apiPermissions: initializeApiPermissions,  // 添加初始化函数
  users: initializeUsers,
  companies: initializeCompanies,
  departments: initializeDepartments,
  products: initializeProducts,
};

async function initializeAll(modules = INIT_ORDER) {
  for (const module of modules) {
    if (INIT_FUNCTIONS[module]) {
      console.log(`初始化${module}数据...`);
      await INIT_FUNCTIONS[module]();
      console.log(`${module}数据初始化完成`);
    }
  }
}

module.exports = {
  initializeAll,
  initializeSpecific: async (moduleNames) => {
    if (!Array.isArray(moduleNames)) {
      moduleNames = [moduleNames];
    }
    return initializeAll(moduleNames);
  }
}; 