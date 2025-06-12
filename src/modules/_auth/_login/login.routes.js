const express = require('express');
const router = express.Router();
const loginController = require('./login.controller');
const { authenticate } = require('../../../middlewares/auth');
const { loginValidation, refreshTokenValidation } = require('./utils/login.validator');

// 登录路由
router.post('/login', loginValidation, loginController.login);

// 刷新令牌路由
router.post('/refresh-token', refreshTokenValidation, loginController.refreshToken);

// 登出路由
router.post('/logout', authenticate, loginController.logout);

// 添加获取用户信息的路由
router.get('/profile', authenticate, loginController.getProfile);

/** 获取 永久token, 只有admin才能获取 */
router.post('/login', authenticate, loginController.login);

module.exports = router; 