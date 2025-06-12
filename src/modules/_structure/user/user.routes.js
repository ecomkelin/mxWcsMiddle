const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate, authorize } = require('../../../middlewares/auth');
const { createUserValidation, updateUserValidation } = require('./utils/user.validator');


// 用户管理路由
router.post('/', [
  authenticate,
  authorize('/user'),
  createUserValidation
], userController.createUser);

router.get('/', [
  authenticate,
  authorize('user:read')
], userController.getUsers);

router.put('/:id', [
  authenticate,
  authorize('user:write'),
  updateUserValidation
], userController.updateUser);

router.delete('/:id', [
  authenticate,
  authorize('user:delete')
], userController.deleteUser);

module.exports = router; 