const mongoose = require("mongoose");
const { DATA_RANGE } = require("../../../config/permission.config");
const apiRoleSchema = new mongoose.Schema(
  {
    
    code: {
      type: String,
      required: true,
      unique: true,
    },
    
    description: String,

    apiPermissions: [
      {
        code: { type: String, ref: "ApiPermission" },
        range: {
          type: Number,
          enum: [DATA_RANGE.SELF, DATA_RANGE.DEPARTMENT, DATA_RANGE.COMPANY, DATA_RANGE.SYSTEM],
          default: DATA_RANGE.SYSTEM
        }
      }
    ],

    createdAt: { type: Date, default: Date.now },

    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("ApiRole", apiRoleSchema);
