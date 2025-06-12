const express = require("express");
const router = express.Router();
const departmentApiRoleController = require("./departmentApiRole.controller");
const { authenticate, authorize } = require("../../../middlewares/auth");
const { 
  createDepartmentApiRoleValidator, 
  updateDepartmentApiRoleValidator 
} = require("./utils/departmentApiRole.validator");

// 部门API角色管理路由
router.post('/', [
  authenticate,
  authorize('/departmentApiRole', 'post'),
  createDepartmentApiRoleValidator
], departmentApiRoleController.createDepartmentApiRole);

router.get('/', [
  authenticate,
  authorize('/departmentApiRole', 'get')
], departmentApiRoleController.getDepartmentApiRoles);

router.get('/:id', [
  authenticate,
  authorize('/departmentApiRole', 'get')
], departmentApiRoleController.getDepartmentApiRole);

router.put('/:id', [
  authenticate,
  authorize('/departmentApiRole', 'put'),
  updateDepartmentApiRoleValidator
], departmentApiRoleController.updateDepartmentApiRole);

router.delete('/:id', [
  authenticate,
  authorize('/departmentApiRole', 'delete')
], departmentApiRoleController.deleteDepartmentApiRole);

module.exports = router; 