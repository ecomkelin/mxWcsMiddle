require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const { createIndexes, createSpecificIndexes } = require('./indexes');

async function initIndexes() {
  // 获取命令行参数
  const args = process.argv.slice(2);
  const module = args[0];  // 如果指定了模块名称
  let client;

  try {
    console.log('正在连接数据库...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('数据库连接成功');

    // 获取原生数据库连接
    const db = client.db();

    console.log('开始创建索引...');
    if (module) {
      await createSpecificIndexes(module, db);
    } else {
      await createIndexes(db);
    }
    console.log('索引创建完成');
  } catch (error) {
    console.error('初始化索引失败:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    console.log('数据库连接已关闭');
    process.exit(0);
  }
}

initIndexes(); 