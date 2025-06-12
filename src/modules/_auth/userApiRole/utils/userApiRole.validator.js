const { body } = require("express-validator");

exports.updateUserApiRoleValidator = [
  body("customRoleIds")
    .optional()
    .isArray()
    .withMessage("自定义角色ID列表必须是数组")
    .custom(value => {
      if (!value.every(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))) {
        throw new Error('存在无效的角色ID');
      }
      return true;
    }),

  body("maskRoleIds")
    .optional()
    .isArray()
    .withMessage("屏蔽角色ID列表必须是数组")
    .custom(value => {
      if (!value.every(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/))) {
        throw new Error('存在无效的角色ID');
      }
      return true;
    })
]; 