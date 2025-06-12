const express = require("express");
const router = express.Router();
const apiRoleController = require("./apiRole.controller");
const { authenticate, authorize } = require("../../../middlewares/auth");
const { 
  createApiRoleValidator, 
  updateApiRoleValidator 
} = require("./utils/apiRole.validator");

router.use(authenticate);

router.post('/', 
  authorize('mustAdmin'),
  createApiRoleValidator,
  apiRoleController.createApiRole
);

router.get('/', 
  authorize('mustAdmin'),
  apiRoleController.getApiRoles
);

router.get('/:id', 
  authorize('mustAdmin'),
  apiRoleController.getApiRole
);

router.put('/:id', 
  authorize('mustAdmin'),
  updateApiRoleValidator,
  apiRoleController.updateApiRole
);

router.delete('/:id', 
  authorize('mustAdmin'),
  apiRoleController.deleteApiRole
);

module.exports = router; 