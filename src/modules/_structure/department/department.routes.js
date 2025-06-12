const express = require("express");
const router = express.Router();
const departmentController = require("./department.controller");
const { authenticate, authorize } = require("../../../middlewares/auth");
const { createDepartmentValidator, updateDepartmentValidator } = require("./utils/department.validator");

router.use(authenticate);

router.post('/', 
  authorize('/department', 'post'),
  createDepartmentValidator,
  departmentController.createDepartment
);

router.get('/', 
  authorize('/department', 'get'),
  departmentController.getDepartments
);

router.get('/:id', 
  authorize('/department/:id'),
  departmentController.getDepartment
);

router.put('/:id', 
  authorize('/department', 'put'),
  updateDepartmentValidator,
  departmentController.updateDepartment
);

router.delete('/:id', 
  authorize('/department', 'delete'),
  departmentController.deleteDepartment
);

module.exports = router; 