const { createIndexIfNotExists } = require('./utils');

async function createTokenBlacklistIndexes(db) {
  try {
    // TokenBlacklist 索引
    await createIndexIfNotExists(
      db,
      'tokenblacklists',
      { token: 1 },
      { unique: true }
    );
    await createIndexIfNotExists(
      db,
      'tokenblacklists',
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }  // TTL索引
    );

    console.log('Token黑名单索引创建完成');
  } catch (error) {
    console.error('Token黑名单索引创建失败:', error);
    throw error;
  }
}

module.exports = createTokenBlacklistIndexes; 