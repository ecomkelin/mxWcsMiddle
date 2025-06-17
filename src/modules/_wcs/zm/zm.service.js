const axios = require('axios');


const lightColors = {
  "0": 0, "灭灯": 0,
  "32": 32, "红色": 32,
  "64": 64, "绿色": 64,
  "96": 96, "蓝色": 96,
  "128": 128, "黄色": 128,
  "160": 160, "品红": 160
};

const validColorValues = [32, 64, 96, 128, 160]; // 有效颜色值
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
    let { TwinkleTime, items } = data;
    if (!TwinkleTime) TwinkleTime = 0; // 默认值 常量
    // console.log("items", items);

    let isCircular = false; // 是否循环
    for (const item of items) {
      if (item.LightColor !== undefined && item.LightColor !== null) {
        // 如果 LightColor 存在且有效，使用 lightColors 映射
        if (lightColors[item.LightColor] !== undefined) {
          item.LightColor = lightColors[item.LightColor];
        } else {
          isCircular
        }
      } else {
        isCircular
      }
    }

    // 赋值
    if (isCircular) {
      const nextColorValue = nextColor(); // 获取下一个颜色值
      for (const item of items) {
        item.LightColor = nextColorValue; // 如果是灭灯，使用下一个颜色值
      }
    }

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

    lightTurnOn({ TwinkleTime: 0, items: [{ LocationId, LightColor: 0 }] }, userId);

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