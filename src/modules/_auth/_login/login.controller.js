const User = require('../../../models/_structure/User');
const loginService = require('./login.service');
const { validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');
const asyncHandler = require('../../../utils/asyncHandler');

class AuthController {
  // 用户登录
  login = asyncHandler(async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        return res.status(400).json(ApiResponse.error(firstError.msg, errors.array()));
      }

      const { code, password } = req.body;
      try {
        const data = await loginService.login(code, password);
        res.json(ApiResponse.success(data));
      } catch (error) {
        if (error.message.includes('用户不存在') || error.message.includes('密码错误')) {
          return res.status(401).json(ApiResponse.unauthorizedError(error.message));
        }
        throw error; // 其他错误交给错误中间件处理
      }
    } catch (error) {
      next(error);
    }
  });

  // 刷新访问令牌
  refreshToken = asyncHandler(async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        return res.status(400).json(ApiResponse.error(firstError.msg));
      }

      const { refreshToken } = req.body;
      try {
        const data = await loginService.refreshToken(refreshToken);
        res.json(ApiResponse.success(data));
      } catch (error) {
        if (error.message.includes('无效的刷新令牌')) {
          return res.status(401).json(ApiResponse.unauthorizedError(error.message));
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });

  // 登出
  logout = asyncHandler(async (req, res) => {
    const result = await loginService.logout(req.user._id, req.token);
    if (!result) {
      res.status(400).json(ApiResponse.error('退出失败'));
      return;
    }
    res.json(ApiResponse.success(null, '登出成功'));
  });

  getProfile = async (req, res) => {
    try {
      // req.user 是由 auth 中间件添加的
      const user = await User.findById(req.user._id).select('-password -refreshToken');
      if (!user) {
        return res.status(404).json(ApiResponse.error('用户不存在'));
      }
      res.json(ApiResponse.success(user));
    } catch (error) {
      res.status(500).json(ApiResponse.error(error.message));
    }
  };
}

module.exports = new AuthController(); 