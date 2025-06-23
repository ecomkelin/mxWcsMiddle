const axios = require('axios');

exports.lightPostInfo = async (data) => {
    const { TwinkleTime, Details } = data;

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
    return result;
}

exports.shelf_locations_status = async (ShelfCode) => {
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