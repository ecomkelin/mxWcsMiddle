const mongoose = require("mongoose");
const { DATA_RANGE } = require("../../../config/permission.config");
const docSchema = new mongoose.Schema(
  {
    
    code: { type: String, required: true, unique: true, trim: true }, // 唯一标识
    apiPath: { type: String, required: true },
    apiMethod: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },

    // 分类 如： structure:user auth:login. 用来区分是哪个模块的权限方便前端查看
    categoryTags: [{ type: String }], 
    description: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ApiPermission", docSchema);
