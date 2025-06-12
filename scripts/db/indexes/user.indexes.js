const { createIndexIfNotExists } = require('./utils');

async function createUserIndexes(db) {
  try {
    // User 索引
    await createIndexIfNotExists(
      db,
      'users',
      { code: 1 },
      { 
        unique: true,
        collation: { locale: 'zh', strength: 2 }
      }
    );
    await createIndexIfNotExists(db, 'users', { status: 1 });
    await createIndexIfNotExists(db, 'users', { role: 1 });
    await createIndexIfNotExists(db, 'users', { 'refreshToken.token': 1 });
    await createIndexIfNotExists(db, 'users', { 'refreshToken.expiresAt': 1 });

    console.log('用户索引创建完成');
  } catch (error) {
    console.error('用户索引创建失败:', error);
    throw error;
  }
}

module.exports = createUserIndexes; 