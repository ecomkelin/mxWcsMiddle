const axios = require('axios');
const { success } = require('../../../utils/response');
const { lightColors, lightMap, validColorValues } = require('./utils/zm.conf');

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
  /** 亮灯， 灯光引导 */
  async lightTurnOn(data, userId) {
    let { TwinkleTime, LightColor, LocationIds } = data;
    if (!TwinkleTime) TwinkleTime = 0; // 默认值 常量
    // 如果前端给了值
    if (LightColor !== undefined && LightColor !== null && LightColor !== '' && LightColor !== 'circle') {
      // 如果 LightColor 存在且有效，使用 lightColors 映射
      if (lightColors[LightColor] !== undefined) {
        LightColor = lightColors[LightColor];
      } else {
        LightColor = 160; // 默认值
      }
    } else {
      LightColor = nextColor(); // 获取下一个颜色值
    }

    // 赋值
    const Details = [];
    for (const LocationId of LocationIds) {
      Details.push({ LocationId, LightColor })
    }

    const url = process.env.ZM_SERVER_URL + '/api/Light/PostInfo/'
    const result = (await axios({
      method: "POST",
      url,
      data: JSON.stringify({
        TwinkleTime,
        Details
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })).data;
    return { color: lightMap[LightColor] };
  }

  async turnOnMultiple(data, userId) {
    let { ShelfIds, status, turn, quantity } = data;
    if (status !== 1 && status !== 0) status = 'all'; // 默认值
    if (turn !== 'off') turn = 'on'; // 默认值

    let LocationList = [];
    for (const ShelfCode of ShelfIds) {
      // 获取每个货架的货位状态信息
      const items = await this.getShelfStatus(ShelfCode, userId);
      LocationList = LocationList.concat(items);
    }

    let LocationIds = [];
    if (status == 0) {
      // 只获取状态为0的货位
      LocationIds = LocationList.filter(item => item.State === 0).map(item => item.locationCode);
    } else if (status == 1) {
      // 只获取状态为1的货位
      LocationIds = LocationList.filter(item => item.State === 1).map(item => item.locationCode);
    } else {
      // 获取所有货位
      LocationIds = LocationList.map(item => item.locationCode);
    }
    if (LocationIds.length === 0) {
      throw new Error("没有符合条件的货位");
    }
    if (quantity > 0 && LocationIds.length > quantity) {
      LocationIds = shuffled.slice(0, quantity);
    }

    const LightColor = turn === 'on' ? nextColor() : 0; // 如果是开灯，获取下一个颜色值，否则灭灯
    await this.lightTurnOn({
      TwinkleTime: 0,
      LightColor,
      LocationIds
    }, userId);
    return { color: lightMap[LightColor] };
  }

  async getShelfStatus(ShelfCode, userId) {
    const url = process.env.ZM_SERVER_URL + '/api/Light/GetLocationState/';
    const zmRes = await axios({
      method: "POST",
      url,
      data: JSON.stringify({ ShelfCode }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (zmRes.status !== 200) {
      throw new Error("获取状态失败");
    }
    const { LocationList } = zmRes.data;
    if (!LocationList || !Array.isArray(LocationList)) {
      throw new Error("获取状态失败，返回数据格式不正确");
    }
    return LocationList;
  }

  async getLocationStatus(data, userId) {
    const { LocationId } = data;
    const ShelfCode = LocationId.substring(0, 5);

    const LocationList = await this.getShelfStatus(ShelfCode, userId);

    if (!LocationList || !Array.isArray(LocationList)) {
      throw new Error("获取状态失败，返回数据格式不正确");
    }
    const location = LocationList.find(item => item.locationCode == LocationId);
    if (!location) {
      throw new Error("获取状态失败，未找到对应位置");
    }
    return { status: location.State };
  }

  async feedbackSensor(data, userId) {
    const { LocationId, State, LightColor, updateTime } = data;
    this.lightTurnOn({ TwinkleTime: 0, LightColor: 0, LocationIds: [LocationId] }, userId);

    const stockIO = State == 1 ? 1 : -1; // 1:入库, -1:出库

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