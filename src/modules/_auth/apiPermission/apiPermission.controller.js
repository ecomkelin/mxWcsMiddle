const ApiResponse = require("../../../utils/response");
const asyncHandler = require("../../../utils/asyncHandler");
const { validationResult } = require("express-validator");
const apiPermissionService = require("./apiPermission.service");
const mongoose = require("mongoose");


exports.createApiPermission = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  try {
    const apiPermission = await apiPermissionService.createApiPermission(
      req.body
    );
    res.status(201).json(ApiResponse.success(apiPermission, "API权限创建成功"));
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
});

exports.getApiPermissions = asyncHandler(async (req, res) => {
  const result = await apiPermissionService.getApiPermissions(req.query);
  return res.json(ApiResponse.success(result));
});

exports.getApiPermission = asyncHandler(async (req, res) => {
  const apiPermission = await apiPermissionService.getApiPermissionById(
    req.params.id
  );
  if (!apiPermission) {
    return res.status(404).json(ApiResponse.error("API权限不存在"));
  }
  res.json(ApiResponse.success(apiPermission));
});

exports.updateApiPermission = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  try {
    delete req.body.code;
    
    const apiPermission = await apiPermissionService.updateApiPermission(
      req.params.id,
      req.body
    );

    if (!apiPermission) {
      return res.status(404).json(ApiResponse.error("API权限不存在"));
    }

    res.json(ApiResponse.success(apiPermission, "API权限更新成功"));
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message));
  }
});

exports.deleteApiPermission = asyncHandler(async (req, res) => {
  // 判断 req.params.id 是ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json(ApiResponse.error("无效的ID"));
  }
  const apiPermission = await apiPermissionService.deleteApiPermission(
    req.params.id
  );
  if (!apiPermission) {
    return res.status(404).json(ApiResponse.error("API权限不存在"));
  }
  res.json(ApiResponse.success(null, "API权限删除成功"));
});
