const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const { DATA_RANGE } = require("../../../config/permission.config");

const docSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "User" },

    apiPermissionCode: { type: String, ref: "ApiPermission" },
    range: {
      type: Number,
      enum: [
        DATA_RANGE.SELF,
        DATA_RANGE.DEPARTMENT,
        DATA_RANGE.COMPANY,
        DATA_RANGE.SYSTEM,
      ],
      default: DATA_RANGE.SYSTEM,
    },
    // 如果是部门级别，则需要指定部门
    departmentIds: [{ type: ObjectId, ref: "Department" }],

    createdAt: { type: Date, default: Date.now },

    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserApiPermission", docSchema);
