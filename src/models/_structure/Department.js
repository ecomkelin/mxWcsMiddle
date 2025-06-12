const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "名称不能为空",
      },
    },

    description: { type: String, trim: true },
    
    isActive: { type: Boolean, default: true },

    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 添加索引
departmentSchema.index({ name: 1, companyId: 1 }, { unique: true });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ createdBy: 1 });

module.exports = mongoose.model("Department", departmentSchema);
