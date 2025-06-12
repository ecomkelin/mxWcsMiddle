const ApiResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json(ApiResponse.error('数据验证失败', err.errors));
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(ApiResponse.error('未授权访问'));
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json(ApiResponse.error('无权限访问'));
  }

  // 默认500错误
  res.status(500).json(ApiResponse.error('服务器内部错误'));
};

module.exports = errorHandler; 