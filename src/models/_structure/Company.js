const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          return /^[A-Za-z0-9]{3,20}$/.test(v);
        },
        message: "公司编号只能包含字母和数字，长度在3-20之间",
      },
    },

    name: { type: String, trim: true },

    address: { type: String, trim: true },

    phone: { type: String, trim: true },

    isActive: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,  // 自动管理 createdAt 和 updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
