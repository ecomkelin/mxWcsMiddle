const mongoose = require("mongoose");

const docSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pagePermissions: [
      {
        permission: String,
        range: {
          type: Number,
          enum: [DATA_RANGE.SELF, DATA_RANGE.DEPARTMENT, DATA_RANGE.COMPANY, DATA_RANGE.SYSTEM],
          default: DATA_RANGE.SYSTEM
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserPagePermissions", docSchema);
