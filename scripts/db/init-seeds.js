require('dotenv').config();
const mongoose = require('mongoose');
const { initializeAll } = require('./seeds');

async function initSeeds() {
  try {
    console.log('正在连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功');

    console.log('开始初始化种子数据...');
    await initializeAll();
    console.log('种子数据初始化完成');
  } catch (error) {
    console.error('初始化种子数据失败:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
    process.exit(0);
  }
}

initSeeds(); 