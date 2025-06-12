const express = require("express");
const router = express.Router();
const apiPermissionController = require("./apiPermission.controller");
const { authenticate, authorize } = require("../../../middlewares/auth");
const { 
  createApiPermissionValidator, 
  updateApiPermissionValidator 
} = require("./utils/apiPermission.validator");

router.use(authenticate);

router.post('/', 
  authorize('mustAdmin'),
  createApiPermissionValidator,
  apiPermissionController.createApiPermission
);

router.get('/', 
  authorize('mustAdmin'),
  apiPermissionController.getApiPermissions
);

router.get('/:id', 
  authorize('mustAdmin'),
  apiPermissionController.getApiPermission
);

router.put('/:id', 
  authorize('mustAdmin'),
  updateApiPermissionValidator,
  apiPermissionController.updateApiPermission
);

router.delete('/:id', 
  authorize('mustAdmin'),
  apiPermissionController.deleteApiPermission
);

module.exports = router; 