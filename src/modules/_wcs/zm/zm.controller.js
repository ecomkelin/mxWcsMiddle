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
  const { TwinkleTime, LightColor, LocationIds } = req.body;
  const result = await zmService.lightTurnOn(
    { TwinkleTime, LightColor, LocationIds },
  );
  res.status(200).json(ApiResponse.success(result, "灯光亮起成功"));
});

exports.turnOnMultiple = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }
  const { ShelfIds, status, turn } = req.body;
  const data = zmService.turnOnMultiple({ ShelfIds, status, turn });

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

  let updateTime = new Date();
  if (time) {
    const formattedTimeString = time
      .replace(/\s/g, ' ') // 替换所有空格字符为普通空格
      .replace(' ', 'T');  // 将第一个空格替换为T
    updateTime = new Date(formattedTimeString);
  }

  const isSuccess = zmService.feedbackSensor(
    { LocationId, State, LightColor, updateTime },
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