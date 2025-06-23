const { success } = require('../../../utils/response');
const { lightColors, lightMap, validColorValues } = require('./utils/zm.conf');
const { lightPostInfo, shelf_locations_status } = require('./utils/zm.wcs');

let lastIndex = 0; // 最后一个有效颜色值

const nextColor = () => {
  if (lastIndex >= validColorValues.length - 1) {
    lastIndex = 0; // 重置索引
  } else {
    lastIndex++;
  }
  return validColorValues[lastIndex];
}

class ZmService {
  /**
   * 货位灯光控制
   * @param {*} data 
   * @param {*} userId 
   * @returns 
   */
  async lightLocation(data, userId) {
    let { twinkleTime, lightColor, locationIds } = data;

    /** 初始化数据 */
    if (!twinkleTime) twinkleTime = 0; // 默认值 常量
    if (lightColor !== undefined && lightColor !== null && lightColor !== '' && lightColor !== 'circle') {
      // 如果 lightColor 存在且有效，使用 lightColors 映射
      if (lightColors[lightColor] !== undefined) {
        lightColor = lightColors[lightColor];
      } else {
        lightColor = 160; // 默认值
      }
    } else {
      lightColor = nextColor(); // 获取下一个颜色值
    }

    // 赋值 并调用wcs接口
    const Details = [];
    for (const LocationId of locationIds) {
      Details.push({ LocationId, LightColor: lightColor });
    }
    const result = await lightPostInfo({ TwinkleTime: twinkleTime, Details });

    return { color: lightMap[lightColor], zmResult: result }; // 返回颜色和ZM的结果
  }

  /**
   * 货架上的灯光控制
   * @param {*} data 
   * @param {*} userId 
   * @returns 
   */
  async lightShelf(data, userId) {
    let { shelfIds = [], status = 'all', turn = 'on', lightQuantity = 0 } = data;
    // 输入验证
    if (!Array.isArray(shelfIds) || shelfIds.length === 0) {
      throw new Error("货架ID数组不能为空");
    }

    // 状态值标准化
    const validStatus = ['all', 0, 1];
    if (!validStatus.includes(status)) {
      console.warn(`无效的状态值: ${status}, 已设置为默认值 'all'`);
      status = 'all';
    }

    // 开关状态标准化
    const validTurn = ['on', 'off'];
    if (!validTurn.includes(turn)) {
      console.warn(`无效的开关状态: ${turn}, 已设置为默认值 'on'`);
      turn = 'on';
    }
    try {
      // 获取所有货位状态 
      const locationStatusList = [];
      for (const shelfId of shelfIds) {
        const items = await shelf_locations_status(shelfId);
        locationStatusList.push(...items);
      }

      // 筛选货位ID
      let locationIds = [];
      switch (typeof status === 'number' ? status : status) {
        case 0:
          locationIds = locationStatusList
            .filter(item => item.State === 0)
            .map(item => item.locationCode);
          break;
        case 1:
          locationIds = locationStatusList
            .filter(item => item.State === 1)
            .map(item => item.locationCode);
          break;
        default:
          locationIds = locationStatusList.map(item => item.locationCode);
      }
      // 错误处理
      if (locationIds.length === 0) {
        throw new Error("没有找到符合条件的货位");
      }

      // 处理灯光数量限制
      if (lightQuantity > 0 && locationIds.length > lightQuantity) {
        locationIds = shuffled.slice(0, lightQuantity);
      }

      // 确定灯光颜色
      const lightColor = turn === 'on' ? nextColor() : 0;

      // 执行相应货位的灯光控制
      await this.lightLocation({
        twinkleTime: 0,
        lightColor,
        locationIds
      }, userId);


      return { color: lightMap[lightColor] };

    } catch (error) {
      // 统一错误处理，记录详细错误信息
      console.error(`灯光控制失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 获取单个货位的状态
   * @param {*} data 
   * @param {*} userId 
   * @returns 
   */
  async getLocationStatus(data, userId) {
    const { locationId } = data;
    const shelfCode = locationId.substring(0, 5);

    const LocationList = await shelf_locations_status(shelfCode);

    if (!LocationList || !Array.isArray(LocationList)) {
      throw new Error("获取状态失败，返回数据格式不正确");
    }
    const location = LocationList.find(item => item.locationCode == locationId);
    if (!location) {
      throw new Error("获取状态失败，未找到对应位置");
    }
    return { status: location.State };
  }

  /**
   * 感应式反馈
   * @param {Object} data - wcs的反馈 包含 LocationId, State, LightColor, updateTime
   * @param {String} userId - 用户ID
   */
  async feedbackSensor(data, userId) {
    const { LocationId, State, LightColor, updateTime } = data;
    // 自动灭灯
    this.lightLocation({ twinkleTime: 0, lightColor: LightColor, locationIds: [LocationId] }, userId);

    // 传递给 WMS 校验 暂时不做
    // const stockIO = State == 1 ? 1 : -1; // 1:入库, -1:出库
    // const url = process.env.MX_SERVER_URL + '/api/stockIO';
    // const result = (await axios({
    //   method: "POST",
    //   url,
    //   data: JSON.stringify({ LocationId, stockIO, updateTime }),
    //   headers: {
    //     "Content-Type": "application/json"
    //   }
    // })).data;
    // return result;
    return { success: 1 }
  }
}

module.exports = new ZmService(); 