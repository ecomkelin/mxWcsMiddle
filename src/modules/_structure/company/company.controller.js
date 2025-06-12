const ApiResponse = require("../../../utils/response");
const asyncHandler = require("../../../utils/asyncHandler");
const { validationResult } = require("express-validator");
const companyService = require("./company.service");

exports.createCompany = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  // 检查公司编号是否已存在
  const codeExists = await companyService.isCodeExists(req.body.code);
  if (codeExists) {
    return res.status(400).json(ApiResponse.error("公司编号已存在"));
  }

  const company = await companyService.createCompany(req.body, req.user?._id);
  res.status(201).json(ApiResponse.success(company, "公司创建成功"));
});

exports.getCompanies = asyncHandler(async (req, res) => {
  try {
    const result = await companyService.getCompanies(req.query);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return res.status(500).json(ApiResponse.error(error.message));
  }
});

exports.getCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  if (!company) {
    return res.status(404).json(ApiResponse.error("公司不存在"));
  }
  res.json(ApiResponse.success(company));
});

exports.updateCompany = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  // 如果更新包含code，检查是否与其他公司重复
  if (req.body.code) {
    const codeExists = await companyService.isCodeExists(
      req.body.code,
      req.params.id
    );
    if (codeExists) {
      return res.status(400).json(ApiResponse.error("公司编号已存在"));
    }
  }

  const company = await companyService.updateCompany(
    req.params.id,
    req.body,
    req.user._id
  );

  if (!company) {
    return res.status(404).json(ApiResponse.error("公司不存在"));
  }

  res.json(ApiResponse.success(company, "公司更新成功"));
});

exports.deleteCompany = asyncHandler(async (req, res) => {
  const company = await companyService.deleteCompany(req.params.id);
  if (!company) {
    return res.status(404).json(ApiResponse.error("公司不存在"));
  }
  res.json(ApiResponse.success(null, "公司删除成功"));
});
