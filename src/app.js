const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/error');
const monitorMiddleware = require('./middlewares/monitor');
require('dotenv').config();
const ApiResponse = require('./utils/response');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(monitorMiddleware);

// 添加健康检查端点
app.get('/health', (req, res) => {
  res.json(ApiResponse.success({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }));
});

// 数据库连接
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB连接成功'))
    .catch((err) => console.error('MongoDB连接失败:', err));
}

// 引入路由索引
const routes = require('./routers');

// 使用API路由
app.use('/api', routes);

// 统一错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
let server;

// 只在非测试环境启动服务器
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}

// 导出 app 用于测试
module.exports = { app, server }; 