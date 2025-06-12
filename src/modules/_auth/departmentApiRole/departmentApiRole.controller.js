const ApiResponse = require("../../../utils/response");
const asyncHandler = require("../../../utils/asyncHandler");
const { validationResult } = require("express-validator");
const departmentApiRoleService = require("./departmentApiRole.service");

exports.createDepartmentApiRole = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json(ApiResponse.error(firstError.msg));
    }

    const departmentApiRole =
      await departmentApiRoleService.createDepartmentApiRole({
        ...req.body,
        createdBy: req.user._id,
      });

    res
      .status(201)
      .json(ApiResponse.success(departmentApiRole, "部门角色关系创建成功"));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message));
  }
});

exports.getDepartmentApiRoles = asyncHandler(async (req, res) => {
  const result = await departmentApiRoleService.getDepartmentApiRoles(
    req.query
  );
  res.json(ApiResponse.success(result));
});

exports.getDepartmentApiRole = asyncHandler(async (req, res) => {
  const departmentApiRole = await departmentApiRoleService.getDepartmentApiRole(
    req.params.id
  );
  if (!departmentApiRole) {
    return res.json(ApiResponse.success({
      departmentId: req.params.id,
      apiRoleIds: []
    }));
  }
  res.json(ApiResponse.success(departmentApiRole));
});

exports.updateDepartmentApiRole = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json(ApiResponse.error(firstError.msg));
  }

  const departmentApiRole =
    await departmentApiRoleService.updateDepartmentApiRole(
      req.params.id,
      req.body,
      req.user._id
    );

  if (!departmentApiRole) {
    return res.status(404).json(ApiResponse.error("部门角色关系不存在"));
  }

  res.json(ApiResponse.success(departmentApiRole, "部门角色关系更新成功"));
});

exports.deleteDepartmentApiRole = asyncHandler(async (req, res) => {
  const result = await departmentApiRoleService.deleteDepartmentApiRole(
    req.params.id
  );
  if (!result) {
    return res.status(404).json(ApiResponse.error("部门角色关系不存在"));
  }
  res.json(ApiResponse.success(null, "部门角色关系删除成功"));
});
