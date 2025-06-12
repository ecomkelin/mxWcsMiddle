const mongoose = require("mongoose");

const docSchema = new mongoose.Schema(
  {

    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },

    // 部门自定义的 apiRoleIds 如果部门的apiRoleIds变动 则 要重新计算 UserApiRole.apiRoleIds
    apiRoleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "ApiRole" }], 

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DepartmentApiRole", docSchema);
