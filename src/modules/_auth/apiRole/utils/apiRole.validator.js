const { body } = require("express-validator");
const { DATA_RANGE } = require("../../../../config/permission.config");

exports.createApiRoleValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("角色代码不能为空")
    .isLength({ min: 1, max: 20 })
    .withMessage("角色代码长度必须在1到20个字符之间"),
  // 添加其他字段的验证规则
  body("apiPermissions")
    .isArray()
    .withMessage("API权限必须是一个数组")
    .custom((value) => {
      return value.every((item) => 
        typeof item.apiPermissionCode === "string" && 
        item.apiPermissionCode.trim() !== "" &&
        Object.values(DATA_RANGE).includes(item.range)
      );
    })
    .withMessage("API权限必须是一个包含有效apiPermissionCode和range的对象数组"),
];

exports.updateApiRoleValidator = [
  body("code")
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("角色代码长度必须在1到20个字符之间"),
  // 添加其他字段的验证规则
  body("apiPermissions")
    .optional()
    .isArray()
    .withMessage("API权限必须是一个数组")
    .custom((value) => {
      return value.every((item) => 
        typeof item.apiPermissionCode === "string" && 
        item.apiPermissionCode.trim() !== "" &&
        Object.values(DATA_RANGE).includes(item.range)
      );
    })
    .withMessage("API权限必须是一个包含有效apiPermissionCode和range的对象数组"),
]; 