const { body, query } = require("express-validator");

exports.lightTurnOnValidator = [
  // 校验 TwinkleTime 字段
  body("TwinkleTime")
    .optional()
    .default(30)
    .isInt({ min: 0, max: 10 })
    .withMessage("TwinkleTime 必须是 0 到 10 之间的数字")
    .toInt(),

  // 校验 items 数组
  body("items")
    .isArray({ min: 1 })
    .withMessage("items 必须是包含至少一个元素的数组"),

  // 校验 items 数组中的每个元素
  body("items.*.LocationId")
    .notEmpty()
    .withMessage("LocationId 不能为空")
    .isString()
    .withMessage("LocationId 必须是字符串")
    .isLength({ min: 10, max: 10 })
    .withMessage("LocationId 长度必须为10位"),

  body("items.*.LightColor")
    .optional()
    .custom((value) => {
      const validColors = {
        "0": 0, "灭灯": 0,
        "32": 32, "红色": 32,
        "64": 64, "绿色": 64,
        "96": 96, "蓝色": 96,
        "128": 128, "黄色": 128,
        "160": 160, "品红": 160
      };

      // 将值转换为字符串进行比较
      const valueStr = value.toString();

      // 如果不在枚举中，使用默认值 160
      return validColors[valueStr] !== undefined ? validColors[valueStr] : 160;
    }),
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
  query("LocationId")
    .notEmpty()
    .withMessage("LocationId 不能为空")
    .isLength({ min: 10, max: 10 })
    .withMessage("LocationId 必须是 10 位字符")
];
