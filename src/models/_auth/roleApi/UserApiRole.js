const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;


const docSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "User" },

    // 用户自定义的 apiRoleIds
    customRoleIds: [{ type: ObjectId, ref: "ApiRole" }],

    // 主要用于屏蔽 user.departmentIds.apiRoleIds组合的 最终得到 depApiRoleIds 
    maskRoleIds: [{ type: ObjectId, ref: "ApiRole" }],

    // 由 customRoleIds 和 depApiRoleIds 计算组成的
    apiRoleIds: [{ type: ObjectId, ref: "ApiRole" }], 

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserApiRole", docSchema);
