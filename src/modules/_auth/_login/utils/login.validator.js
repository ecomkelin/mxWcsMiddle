const { body } = require('express-validator');

// 登录验证规则
exports.loginValidation = [
  body('code')
    .notEmpty().withMessage('用户账号不能为空')
    .trim(),
  body('password')
    .notEmpty().withMessage('密码不能为空')
];

// 刷新令牌验证规则
exports.refreshTokenValidation = [
  body('refreshToken')
    .notEmpty().withMessage('刷新令牌不能为空')
]; 