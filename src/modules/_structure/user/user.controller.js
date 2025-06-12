const userService = require('./user.service');
const {formatUserBasic} = require('./utils/user.format');
const { validationResult } = require('express-validator');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/response');
const { UserNotFoundError, DuplicateUserError, DeleteCurrentUserError, DeleteAdminError, UserOperationError } = require('./utils/user.errors');

exports.createUser = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json(ApiResponse.error(firstError.msg, errors.array()));
    }

    const user = await userService.createUser(req.body);
    return res.status(201).json(ApiResponse.success(
      formatUserBasic(user),
      '用户创建成功'
    ));
  } catch (error) {
    if (error instanceof DuplicateUserError) {
      return res.status(400).json(ApiResponse.error(error.message));
    }
    res.status(500).json(ApiResponse.error(error.message));
  }
});

exports.getUsers = async (req, res) => {
  try {
    const result = await userService.getUsers(req.query);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json(ApiResponse.error(firstError.msg));
    }

    const { id } = req.params;
    const updates = req.body;
    
    try {
      const user = await userService.updateUser(id, updates);
      res.json(ApiResponse.success(formatUserBasic(user)));
    } catch (error) {
      if (error instanceof DuplicateUserError) {
        return res.status(400).json(ApiResponse.error('用户账号已存在'));
      }
      if (error instanceof UserNotFoundError) {
        return res.status(404).json(ApiResponse.error('用户不存在'));
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const result = await userService.deleteUser(id, req.user._id);
      res.json(ApiResponse.success(null, result.message));
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json(ApiResponse.error(error.message));
      }
      if (error instanceof DeleteCurrentUserError) {
        return res.status(400).json(ApiResponse.error(error.message));
      }
      if (error instanceof DeleteAdminError) {
        return res.status(403).json(ApiResponse.error(error.message));
      }
      throw error;
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(ApiResponse.error(error.message));
  }
}; 