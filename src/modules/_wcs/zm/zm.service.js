const axios = require('axios');
// process.env.ZM_SERVER_URL

class ZmService {
  /** 亮灯， 灯光引导 */
  async lightTurnOn(data, userId) {
    const { TwinkleTime, items } = data;

    const url = process.env.ZM_SERVER_URL + '/api/Light/PostInfo/'
    const result = (await axios({
      method: "POST",
      url,
      data: JSON.stringify({
        TwinkleTime,
        Details: items
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })).data;
    return result;
  }

  async getLocationStatus(data, userId) {
    const { LocationId } = data;
    const ShelfCode = LocationId.substring(0, 5);

    const url = process.env.ZM_SERVER_URL + '/api/Light/GetLocationState/';
    const zmRes = await axios({
      method: "POST",
      url,
      data: JSON.stringify({ ShelfCode }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    // console.log("zmRes", zmRes);
    if (zmRes.status !== 200) {
      throw new Error("获取状态失败");
    }
    const { LocationList } = zmRes.data;
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
    const { LocationId, State, LightColor, time } = data;

    const formattedTimeString = time
      .replace(/\s/g, ' ') // 替换所有空格字符为普通空格
      .replace(' ', 'T');  // 将第一个空格替换为T
    const updateTime = new Date(formattedTimeString);

    const stockIO = State == 1 ? 1 : -1; // 1:入库, -1:出库

    const url = process.env.MX_SERVER_URL + '/api/stockIO';

    const result = (await axios({
      method: "POST",
      url,
      data: JSON.stringify({ LocationId, stockIO, updateTime }),
      headers: {
        "Content-Type": "application/json"
      }
    })).data;
    return result;
  }
}

module.exports = new ZmService(); 