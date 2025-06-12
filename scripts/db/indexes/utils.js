// 创建工具函数来检查和创建索引
async function createIndexIfNotExists(db, collectionName, indexSpec, options = {}) {
  try {
    // 先检查集合是否存在
    try {
      // 使用 listCollections 来检查集合是否存在
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        // 集合不存在，创建一个临时文档
        const collection = db.collection(collectionName);
        await collection.insertOne({ _temp: true });
        await collection.deleteOne({ _temp: true });
        console.log(`集合 ${collectionName} 不存在，已创建`);
        return await createIndex();
      }
    } catch (error) {
      console.error('检查集合时出错:', error);
      throw error;
    }
    
    // 提取检查和创建索引的逻辑到单独的函数
    return await checkAndCreateIndex();
  } catch (error) {
    console.error(`创建索引 ${JSON.stringify(indexSpec)} 失败:`, error);
    throw error;
  }

  // 内部函数：创建索引
  async function createIndex() {
    const collection = db.collection(collectionName);
    await collection.createIndex(indexSpec, options);
    console.log(`索引 ${JSON.stringify(indexSpec)} 创建成功`);
    return true;
  }

  // 内部函数：检查并创建索引
  async function checkAndCreateIndex() {
    const collection = db.collection(collectionName);
    const existingIndexes = await collection.listIndexes().toArray();
    
    // 检查是否已存在相同的索引
    const indexExists = existingIndexes.some(index => {
      // 比较索引字段
      const sameKeys = Object.keys(indexSpec).every(
        key => index.key[key] === indexSpec[key]
      );
      
      // 如果是唯一索引，还需要比较unique选项
      const sameUnique = options.unique ? index.unique === options.unique : true;
      
      return sameKeys && sameUnique;
    });

    if (indexExists) {
      console.log(`索引 ${JSON.stringify(indexSpec)} 已存在，跳过创建`);
      return false;
    }

    return await createIndex();
  }
}

module.exports = {
  createIndexIfNotExists
}; 