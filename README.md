# 启动方法

# 基本环境变量配置

# 系统初始化 启动
## 1. 创建超级管理员
## 2. 创建公司
## 3. 创建部门
## 4. 创建用户
## 5. 创建角色
## 6. 创建权限
## 7. 创建用户角色
## 8. 创建部门角色
## 9. 创建公司角色



## 环境变量
PORT=8000
MONGODB_URI=mongodb://localhost:27017/wcs
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRED=5d
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_REFRESH_EXPIRED=7d
NODE_ENV=development 

MX_SERVER_URL=http://192.168.10.8:123123
ZM_SERVER_URL=http://192.168.10.8:9090


# main API
hostname=http://localhost
## 1 货位亮灯
### 根据给的货位位置控制亮或灭灯
url: hostname/api/zm/light/turnOn 
method: POST
request: 
{
    "type": "object",
    "properties": {
        "TwinkleTime": {
            "type": "integer",
            "minimum": 0,
            "maximum": 10,
            "examples": [
                0
            ],
            "title": "亮灯秒数",
            "description": "0为常亮， 最大值为10秒"
        },
        "LightColor": {
            "type": "string",
            "default": "circle",
            "description": "不传参数，传递空字符串，值为circle 为循环亮灯。值为0 则为灭灯， 其余值为 [\"红色\",\"蓝色\",\"黄色\",\"绿色\",\"品红\"]"
        },
        "LocationIds": {
            "type": "array",
            "items": {
                "type": "string",
                "description": "字符串为10个字符"
            },
            "description": "至少有一个值"
        }
    },
    "required": [
        "LocationIds"
    ],
    "x-apifox-orders": [
        "TwinkleTime",
        "LightColor",
        "LocationIds"
    ]
}
export interface Request {
    /**
     * 不传参数，传递空字符串，值为circle 为循环亮灯。值为0 则为灭灯， 其余值为 ["红色","蓝色","黄色","绿色","品红"]
     */
    lightColor?: string;
    /**
     * 至少有一个值
     */
    locationIds: string[];
    /**
     * 亮灯秒数，0为常亮， 最大值为10秒
     */
    twinkleTime?: number;
    [property: string]: any;
}

## 2 货架亮灯
### 根据给的货架中货位的状态控制亮或灭灯
url: /api//zm/light/lightShelf
method: POST
request: 
{
    "type": "object",
    "properties": {
        "turn": {
            "type": "string",
            "enum": [
                "on",
                "off"
            ],
            "x-apifox": {
                "enumDescriptions": {
                    "on": "",
                    "off": ""
                }
            },
            "description": "枚举：['on', 'off'] on为亮灯， off为灭灯"
        },
        "status": {
            "type": "string",
            "enum": [
                "0",
                "1",
                "all"
            ],
            "x-apifox": {
                "enumDescriptions": {
                    "0": "",
                    "1": "",
                    "all": ""
                }
            },
            "description": "枚举：[0, 1, 'all'] 0为空货位， 1为非空货位，all为全货位"
        },
        "ShelfIds": {
            "type": "array",
            "items": {
                "type": "string",
                "description": "字符串为 5位"
            },
            "description": "至少一个元素"
        },
        "quantity": {
            "type": "integer",
            "description": "如果为0或者为空 则不限制数量",
            "title": "亮灯的数量"
        }
    },
    "required": [
        "ShelfIds"
    ],
    "x-apifox-orders": [
        "turn",
        "quantity",
        "status",
        "ShelfIds"
    ]
}

/**
 * Request
 */
export interface Request {
    /**
     * 亮灯的数量，如果为0或者为空 则不限制数量
     */
    quantity?: number;
    /**
     * 至少一个元素
     */
    shelfIds: string[];
    /**
     * 枚举：[0, 1, 'all'] 0为空货位， 1为非空货位，all为全货位
     */
    status?: Status;
    /**
     * 枚举：['on', 'off'] on为亮灯， off为灭灯
     */
    turn?: Turn;
    [property: string]: any;
}

/**
 * 枚举：[0, 1, 'all'] 0为空货位， 1为非空货位，all为全货位
 */
export enum Status {
    All = "all",
    The0 = "0",
    The1 = "1",
}

/**
 * 枚举：['on', 'off'] on为亮灯， off为灭灯
 */
export enum Turn {
    Off = "off",
    On = "on",
}