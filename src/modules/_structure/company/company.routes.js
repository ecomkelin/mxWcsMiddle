const express = require("express");
const router = express.Router();
const companyController = require("./company.controller");
const { authenticate, authorize } = require("../../../middlewares/auth");
const { createCompanyValidator, updateCompanyValidator } = require("./utils/company.validator");


router.use(authenticate);

router.post('/', 
  authorize('/company', 'post'),
  createCompanyValidator,
  companyController.createCompany
);

router.get('/', 
  authorize('/company', 'get'),
  companyController.getCompanies
);

router.get('/:id', 
  authorize('/company', 'get'),
  companyController.getCompany
);

router.put('/:id', 
  authorize('/company', 'put'),
  updateCompanyValidator,
  companyController.updateCompany
);

router.delete('/:id', 
  authorize('/company', 'delete'),
  companyController.deleteCompany
);

module.exports = router; 