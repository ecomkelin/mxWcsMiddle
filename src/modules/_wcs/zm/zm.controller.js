const ApiResponse = require("../../../utils/response");
const asyncHandler = require("../../../utils/asyncHandler");
const { validationResult } = require("express-validator");
const zmService = require("./zm.service");

const validColors = {
  "0": 0, "灭灯": 0,
  "32": 32, "红色": 32,
  "64": 64, "绿色": 64,
  "96": 96, "蓝色": 96,
  "128": 128, "黄色": 128,
  "160": 160, "品红": 160
};

exports.lightTurnOn = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(ApiResponse.validationError("验证失败", errors.array()));
  }
  let { TwinkleTime, items } = req.body;
  if (!TwinkleTime) TwinkleTime = 10; // 默认值
  // console.log("items", items);
  for (const item of items) {
    if (item.LightColor && validColors[item.LightColor] !== undefined) {
      item.LightColor = validColors[item.LightColor];
    } else {
      item.LightColor = 160; // 默认值
    }
  }
  // console.log("items after processing", items);

  const data = zmService.lightTurnOn(
    {
      TwinkleTime,
      items
    },
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
  const data = req.body;

  const isSuccess = zmService.feedbackSensor(
    data,
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