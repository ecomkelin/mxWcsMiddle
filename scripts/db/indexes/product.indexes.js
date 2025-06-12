const { createIndexIfNotExists } = require('./utils');

async function createProductIndexes(db) {
  try {
    // Product 索引
    await createIndexIfNotExists(
      db,
      'products',
      { code: 1 },
      { unique: true }
    );
    await createIndexIfNotExists(db, 'products', { category: 1 });
    await createIndexIfNotExists(db, 'products', { status: 1 });
    await createIndexIfNotExists(db, 'products', { createdBy: 1 });

    console.log('产品索引创建完成');
  } catch (error) {
    console.error('产品索引创建失败:', error);
    throw error;
  }
}

module.exports = createProductIndexes; 