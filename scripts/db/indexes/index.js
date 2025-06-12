const createUserIndexes = require('./user.indexes');
const createProductIndexes = require('./product.indexes');
const createTokenBlacklist = require('./tokenblacklist.indexes');

const MODULE_INDEXES = {
  user: createUserIndexes,
  product: createProductIndexes,
  tokenblacklist: createTokenBlacklist
};

async function createIndexes(db) {
  try {
    // 按顺序创建各模块的索引
    await createUserIndexes(db);
    await createProductIndexes(db);
    await createTokenBlacklist(db);

    console.log('所有索引创建完成');
  } catch (error) {
    console.error('创建索引失败:', error);
    throw error;
  }
}

async function createSpecificIndexes(module, db) {
  const createIndexFn = MODULE_INDEXES[module.toLowerCase()];
  if (!createIndexFn) {
    throw new Error(`未找到模块 "${module}" 的索引配置`);
  }

  try {
    await createIndexFn(db);
  } catch (error) {
    console.error(`创建 ${module} 索引失败:`, error);
    throw error;
  }
}

module.exports = {
  createIndexes,
  createSpecificIndexes
}; 