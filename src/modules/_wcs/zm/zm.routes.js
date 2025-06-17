const express = require("express");
const router = express.Router();
const zmController = require("./zm.controller");
// const { authenticate, authorize } = require("../../../middlewares/auth");
const { lightTurnOnValidator, lightTurnOnAllValidator, locationStatusValidator, feedbackSensorValidator } = require("./utils/zm.validator");

// router.use(authenticate);
/** 点亮货位： 亮灯引导出库 */
// 亮灯循环 缓存
// 自动灭灯
router.post('/light/turnOn',
  // authorize('/department', 'post'),
  lightTurnOnValidator,
  zmController.lightTurnOn
);

router.get('/light/turnOnAll',
  // authorize('/department', 'post'),
  lightTurnOnAllValidator,
  zmController.lightTurnOnAll
);
router.get('/light/turnOffAll',
  // authorize('/department', 'post'),
  lightTurnOnAllValidator,
  zmController.lightTurnOffAll
);

/** 获取货位状态 */
router.get('/location/status',
  locationStatusValidator,
  zmController.getLocationStatus
);

/** 感应式反馈 */
router.post('/feedback/sensor',
  // authorize('/department', 'post'),
  feedbackSensorValidator,
  zmController.feedbackSensor
);

module.exports = router; 