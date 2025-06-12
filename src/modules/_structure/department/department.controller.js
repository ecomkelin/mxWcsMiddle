const ApiResponse = require("../../../utils/response");
const asyncHandler = require("../../../utils/asyncHandler");
const { validationResult } = require("express-validator");
const departmentService = require("./department.service");

exports.createDepartment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  const currentUser = req.user;
  req.body.companyId = currentUser.companyId;

  // 检查部门名称在同一公司是否已存在
  const nameExists = await departmentService.isNameExistsInCompany(
    req.body.name,
    req.body.companyId
  );
  if (nameExists) {
    return res.status(400).json(ApiResponse.error("该公司下已存在同名部门"));
  }

  const department = await departmentService.createDepartment(
    req.body,
    req.user._id
  );
  res.status(201).json(ApiResponse.success(department, "部门创建成功"));
});

exports.getDepartments = asyncHandler(async (req, res) => {
  const result = await departmentService.getDepartments(req.query);
  return res.status(200).json(ApiResponse.success(result));
});

exports.getDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  if (!department) {
    return res.status(404).json(ApiResponse.error("部门不存在"));
  }
  res.json(ApiResponse.success(department));
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  delete req.body.companyId;

  // 如果更新包含name，检查是否与同公司其他部门重复
  if (req.body.name) {
    const nameExists = await departmentService.isNameExistsInCompany(
      req.body.name,
      req.body.companyId ||
        (
          await departmentService.getDepartmentById(req.params.id)
        ).companyId,
      req.params.id
    );
    if (nameExists) {
      return res.status(400).json(ApiResponse.error("该公司下已存在同名部门"));
    }
  }

  const department = await departmentService.updateDepartment(
    req.params.id,
    req.body,
    req.user._id
  );

  if (!department) {
    return res.status(404).json(ApiResponse.error("部门不存在"));
  }

  res.json(ApiResponse.success(department, "部门更新成功"));
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.deleteDepartment(req.params.id);
  if (!department) {
    return res.status(404).json(ApiResponse.error("部门不存在"));
  }
  res.json(ApiResponse.success(null, "部门删除成功"));
});
