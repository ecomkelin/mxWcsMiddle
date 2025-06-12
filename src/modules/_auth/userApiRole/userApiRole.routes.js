const express = require("express");
const router = express.Router();
const userApiRoleController = require("./userApiRole.controller");
const { authenticate, authorize } = require("../../../middlewares/auth");
const { 
  updateUserApiRoleValidator 
} = require("./utils/userApiRole.validator");

// 用户API角色管理路由
router.get('/', [
  authenticate,
  authorize('/userApiRole', 'get')
], userApiRoleController.getUserApiRoles);

router.get('/:userId', [
  authenticate,
  authorize('/userApiRole', 'get')
], userApiRoleController.getUserApiRole);

router.put('/:userId', [
  authenticate,
  authorize('/userApiRole', 'put'),
  updateUserApiRoleValidator
], userApiRoleController.updateUserApiRole);

module.exports = router; 