const { body, query } = require("express-validator");

exports.lightTurnOnValidator = [
  // 校验 TwinkleTime 字段
  body("TwinkleTime")
    .optional()
    .default(30)
    .isInt({ min: 0, max: 10 })
    .withMessage("TwinkleTime 必须是 0 到 10 之间的数字")
    .toInt(),
  // body("LightColor")
  //   .optional()
  //   .custom((value) => {
  //     const validColors = {
  //       "0": 0, "灭灯": 0,
  //       "32": 32, "红色": 32,
  //       "64": 64, "绿色": 64,
  //       "96": 96, "蓝色": 96,
  //       "128": 128, "黄色": 128,
  //       "160": 160, "品红": 160
  //     };

  //     // 将值转换为字符串进行比较
  //     const valueStr = value.toString();

  //     // 如果不在枚举中，使用默认值 160
  //     return validColors[valueStr] !== undefined ? validColors[valueStr] : 160;
  //   }),

  // 校验 items 数组
  body("LocationIds")
    .isArray({ min: 1 })
    .withMessage("LocationIds 必须是包含至少一个元素的数组")


];

exports.lightTurnOnMultipleValidator = [
  // 校验 items 数组
  body("ShelfIds")
    .isArray({ min: 1 })
    .withMessage("LocationIds 必须是包含至少一个元素的数组"),

  body("status")
    .optional()
    .isIn(['0', '1', 'all', 0, 1])
    .withMessage("status 必须是 0 或 1"),

  body("turn")
    .notEmpty()
    .isIn(['on', 'off'])
    .withMessage("turn 必须是 'on' 或 'off'")
];


exports.locationStatusValidator = [
  // 校验 TwinkleTime 字段
  query("LocationId")
    .notEmpty()
    .withMessage("LocationId 不能为空")
    .isLength({ min: 10, max: 10 })
    .withMessage("LocationId 必须是 10 位字符")
];

exports.feedbackSensorValidator = [
  // 校验 TwinkleTime 字段
  body("LocationId")
    .notEmpty()
    .withMessage("LocationId 不能为空")
    .isLength({ min: 10, max: 10 })
    .withMessage("LocationId 必须是 10 位字符"),

  body("State")
    .notEmpty()
    .withMessage("State不能为空")
    .isIn(['0', '1', 0, 1])
    .withMessage("State必须是0或1"),

  body("time")
    .optional()
    .isString()
    .withMessage("time必须是字符串")
    .custom((value) => {
      // 模拟你服务器中的格式化操作
      const formattedTimeString = value
        .replace(/\s/g, ' ')
        .replace(' ', 'T');

      // 验证格式化后的字符串是否为有效的ISO日期格式
      const isValidDate = !isNaN(Date.parse(formattedTimeString));
      if (!isValidDate) {
        throw new Error("time格式不正确，无法转换为有效日期");
      }
      return true;
    })
];
