const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const argon2 = require("argon2");

const userSchema = new mongoose.Schema(
  {
    // 用户编号
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          return /^[A-Za-z0-9]{3,20}$/.test(v);
        },
        message: "用户账号只能包含字母和数字，长度在3-20之间",
      },
    },

    // 密码
    password: { type: String, required: true},

    // 用户名称
    name: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "姓名不能为空",
      },
    },

    // 是否管理员
    isAdmin: { type: Boolean, default: false },

    // 是否启用
    isActive: { type: Boolean, default: true },
    
    // 刷新令牌
    refreshToken: {
      token: String,
      expiresAt: Date,
    },

    // 最后登录时间
    lastLoginAt: { type: Date },

    // 所属公司
    companyId: { type: ObjectId, ref: "Company", required: true },

    // 所属部门
    departmentIds: [{ type: ObjectId, ref: "Department"}],

    // 创建时间
    createdAt: { type: Date, default: Date.now},

    // 更新时间
    updatedAt: { type: Date, default: Date.now },

    // 创建人
    createdBy: { type: ObjectId, ref: "User" },

    // 更新人
    updatedBy: { type: ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 密码加密中间件
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await argon2.hash(this.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    } catch (error) {
      next(error);
      return;
    }
  }
  next();
});

// 验证密码的方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    throw new Error("密码验证失败");
  }
};

module.exports = mongoose.model("User", userSchema);
