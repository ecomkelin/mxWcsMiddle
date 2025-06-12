const { body } = require('express-validator');

exports.createCompanyValidator = [
  body('code')
    .trim()
    .notEmpty().withMessage('公司编号不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('公司编号长度应在3-20之间')
    .matches(/^[A-Za-z0-9-]+$/).withMessage('公司编号只能包含字母、数字和连字符'),
  
  body('name')
    .trim()
    .notEmpty().withMessage('公司名称不能为空')
    .isLength({ min: 2, max: 50 }).withMessage('公司名称长度应在2-50之间'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('地址长度不能超过200'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9-+()]*$/).withMessage('无效的电话号码格式'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive必须是布尔值')
];

exports.updateCompanyValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('公司名称长度应在2-50之间'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('地址长度不能超过200'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9-+()]*$/).withMessage('无效的电话号码格式'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive必须是布尔值')
]; 