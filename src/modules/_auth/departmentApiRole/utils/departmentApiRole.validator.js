const { body } = require("express-validator");

exports.createDepartmentApiRoleValidator = [
  body("departmentId")
    .notEmpty()
    .withMessage("部门ID不能为空")
    .isMongoId()
    .withMessage("无效的部门ID"),

  body("apiRoleIds")
    .isArray()
    .withMessage("角色ID列表必须是数组")
    .custom(value => {
      if (!value.every(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))) {
        throw new Error('存在无效的角色ID');
      }
      return true;
    })
];

exports.updateDepartmentApiRoleValidator = [
  body("apiRoleIds")
    .optional()
    .isArray()
    .withMessage("角色ID列表必须是数组")
    .custom(value => {
      if (!value.every(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))) {
        throw new Error('存在无效的角色ID');
      }
      return true;
    })
]; 