const ApiResponse = require("../../../utils/response");
const asyncHandler = require("../../../utils/asyncHandler");
const { validationResult } = require("express-validator");
const zmService = require("./zm.service");
const { shelfCodes } = require('./utils/zm.conf');



exports.lightLocation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }
  const { twinkleTime, lightColor, locationIds } = req.body;
  const result = await zmService.lightLocation(
    { twinkleTime, lightColor, locationIds },
  );
  res.status(200).json(ApiResponse.success(result, "灯光亮起成功"));
});

exports.lightShelf = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  const { shelfIds, status, turn, lightQuantity } = req.body;
  if (!lightQuantity) lightQuantity = 0;
  if (!shelfIds || shelfIds.length === 0) {
    shelfIds = shelfCodes; // 确保 ShelfIds 是一个数组
  }

  const data = zmService.lightShelf({ shelfIds, status, turn, lightQuantity });

  res.status(200).json(ApiResponse.success(data, "灯光亮起成功"));
});


exports.getLocationStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }

  const { locationId } = req.query;
  const data = await zmService.getLocationStatus(
    { locationId },
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