const { body } = require('express-validator');

// 创建用户验证规则
exports.createUserValidation = [
  body('code')
    .notEmpty()
    .trim()
    .matches(/^[A-Za-z0-9]+$/).withMessage('用户账号只能包含字母和数字')
    .isLength({ min: 3, max: 20 }).withMessage('用户账号长度必须在3-20之间'),
  body('password')
    .isLength({ min: 6 }).withMessage('密码长度至少6位'),
  body('name')
    .notEmpty().withMessage('姓名不能为空')
    .trim(),
];

// 更新用户验证规则
exports.updateUserValidation = [
  body('code')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9]+$/).withMessage('用户账号只能包含字母和数字')
    .isLength({ min: 3, max: 20 }).withMessage('用户账号长度必须在3-20之间'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('姓名不能为空'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'staff']).withMessage('无效的角色类型'),
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('无效的状态'),
  body('permissions')
    .optional()
    .isArray().withMessage('权限必须是数组')
    .custom((value) => {
      const validPermissions = [
        'product:read', 'product:write',
        'purchase:read', 'purchase:write',
        'sale:read', 'sale:write',
        'inventory:read', 'inventory:write',
        'user:read', 'user:write'
      ];
      return value.every(p => validPermissions.includes(p));
    }).withMessage('包含无效的权限')
]; 