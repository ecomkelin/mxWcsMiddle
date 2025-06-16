const ApiResponse = require("../../../utils/response");
const asyncHandler = require("../../../utils/asyncHandler");
const { validationResult } = require("express-validator");
const zmService = require("./zm.service");


exports.lightTurnOn = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }
  const { TwinkleTime, items } = req.body;

  const data = zmService.lightTurnOn(
    { TwinkleTime, items },
    // req.user._id
  );

  res.status(200).json(ApiResponse.success(data, "灯光亮起成功"));
});

exports.getLocationStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  const { LocationId } = req.query;
  const data = await zmService.getLocationStatus(
    { LocationId },
    // req.user._id
  );
  res.status(200).json(ApiResponse.success(data, "获取状态成功"));
});


exports.feedbackSensor = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }
  const { LocationId, State, LightColor, time } = req.body;

  const isSuccess = zmService.feedbackSensor(
    { LocationId, State, LightColor, time },
    // req.user._id
  );
  if (!isSuccess) {
    return res.status(404).json({
      Result: 0,
      Message: "指令接收失败！"
    });
  }
  res.status(200).json({
    Result: 1,
    Message: "指令接收成功！"
  });
});