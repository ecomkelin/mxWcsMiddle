const { body } = require("express-validator");

exports.createDepartmentValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("部门名称不能为空")
    .isLength({ max: 50 })
    .withMessage("部门名称不能超过50个字符"),
  
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("描述不能超过200个字符"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive必须是布尔值")
];

exports.updateDepartmentValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("部门名称不能为空")
    .isLength({ max: 50 })
    .withMessage("部门名称不能超过50个字符"),
  
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("描述不能超过200个字符"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive必须是布尔值")
]; 