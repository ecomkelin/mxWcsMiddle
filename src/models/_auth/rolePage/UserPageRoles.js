const mongoose = require("mongoose");

const docSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pageRoleIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiRole",
    }],
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

module.exports = mongoose.model("UserPageRoles", docSchema);
