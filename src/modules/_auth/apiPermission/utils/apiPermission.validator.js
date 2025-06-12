const { body } = require("express-validator");

exports.createApiPermissionValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("code不能为空")
    .isLength({ min: 1, max: 20 })
    .withMessage("code长度必须在1到20个字符之间"),

  body("apiMethod")
    .trim()
    .notEmpty()
    .withMessage("API方法不能为空")
    .isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
    .withMessage("无效的API方法"),

  body("apiPath")
    .trim()
    .notEmpty()
    .withMessage("API路径不能为空")
    .matches(/^\/[a-zA-Z0-9\-_\/:\?]*$/)
    .withMessage("无效的API路径格式"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("描述不能超过200个字符")
];

exports.updateApiPermissionValidator = [
  body("apiMethod")
    .optional()
    .trim()
    .isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
    .withMessage("无效的API方法"),

  body("apiPath")
    .optional()
    .trim()
    .matches(/^\/[a-zA-Z0-9\-_\/:\?]*$/)
    .withMessage("无效的API路径格式"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("描述不能超过200个字符")
]; 