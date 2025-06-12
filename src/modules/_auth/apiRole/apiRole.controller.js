const ApiResponse = require("../../../utils/response");
const asyncHandler = require("../../../utils/asyncHandler");
const { validationResult } = require("express-validator");
const apiRoleService = require("./apiRole.service");

exports.createApiRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  try {
    const apiRole = await apiRoleService.createApiRole(req.body);
    res.status(201).json(ApiResponse.success(apiRole, "API角色创建成功"));
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
});

exports.getApiRoles = asyncHandler(async (req, res) => {
  const result = await apiRoleService.getApiRoles(req.query);
  return res.json(ApiResponse.success(result));
});

exports.getApiRole = asyncHandler(async (req, res) => {
  const apiRole = await apiRoleService.getApiRoleById(req.params.id);
  if (!apiRole) {
    return res.status(404).json(ApiResponse.error("API角色不存在"));
  }
  res.json(ApiResponse.success(apiRole));
});

exports.updateApiRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  try {
    const apiRole = await apiRoleService.updateApiRole(req.params.id, req.body);
    if (!apiRole) {
      return res.status(404).json(ApiResponse.error("API角色不存在"));
    }
    res.json(ApiResponse.success(apiRole, "API角色更新成功"));
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
});

exports.deleteApiRole = asyncHandler(async (req, res) => {
  const apiRole = await apiRoleService.deleteApiRole(req.params.id);
  if (!apiRole) {
    return res.status(404).json(ApiResponse.error("API角色不存在"));
  }
  res.json(ApiResponse.success(null, "API角色删除成功"));
}); 