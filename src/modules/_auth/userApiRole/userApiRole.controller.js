const ApiResponse = require("../../../utils/response");
const asyncHandler = require("../../../utils/asyncHandler");
const { validationResult } = require("express-validator");
const userApiRoleService = require("./userApiRole.service");

exports.getUserApiRoles = asyncHandler(async (req, res) => {
  const result = await userApiRoleService.getUserApiRoles(req.query);
  res.json(ApiResponse.success(result));
});

exports.getUserApiRole = asyncHandler(async (req, res) => {
  const userApiRole = await userApiRoleService.getUserApiRole(req.params.userId);
  if (!userApiRole) {
    return res.status(404).json(ApiResponse.error('用户角色配置不存在'));
  }
  res.json(ApiResponse.success(userApiRole));
});

exports.updateUserApiRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json(ApiResponse.error(firstError.msg));
  }

  const { customRoleIds, maskRoleIds } = req.body;
  const userApiRole = await userApiRoleService.updateUserApiRole(
    req.params.userId,
    { customRoleIds, maskRoleIds },
    req.user._id
  );

  if (!userApiRole) {
    return res.status(404).json(ApiResponse.error('用户角色配置不存在'));
  }

  res.json(ApiResponse.success(userApiRole, '用户角色配置更新成功'));
}); 