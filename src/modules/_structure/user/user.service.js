const User = require("../../../models/_structure/User");
const {
  UserNotFoundError,
  DuplicateUserError,
  DeleteCurrentUserError,
  DeleteAdminError,
  UserOperationError,
  UserError,
} = require("./utils/user.errors");
const mongoose = require("mongoose");

const PROTECTED_FIELDS = [
  "refreshToken",
  "password",
  "_id",
  "createdAt",
  "updatedAt",
];
const IGNORED_VALUES = [undefined, "", null];

function filterUserUpdates(updates) {
  if (!updates || typeof updates !== "object") {
    throw new Error("无效的更新数据");
  }

  const filteredUpdates = { ...updates };
  Object.keys(filteredUpdates).forEach((key) => {
    if (
      IGNORED_VALUES.includes(filteredUpdates[key]) ||
      PROTECTED_FIELDS.includes(key)
    ) {
      delete filteredUpdates[key];
    }
  });

  return filteredUpdates;
}

class UserService {
  async createUser(userData) {
    try {
      if (!userData || typeof userData !== "object") {
        throw new Error("无效的用户数据");
      }

      const existingUser = await User.findOne({
        code: userData.code.toUpperCase(),
      });

      if (existingUser) {
        throw new DuplicateUserError();
      }

      // const payload = req.user;
      // userData.companyId = userData.companyId || "666666666666666666666666";
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUsers({ page = 1, limit = 10, keyword, companyId, departmentId }) {
    try {
      const query = {};
      
      // 按公司筛选
      if (companyId) {
        query.companyId = companyId;
      }
      
      // 按部门筛选
      if (departmentId) {
        query.departmentIds = departmentId;
      }

      // 关键字搜索
      if (keyword) {
        query.$or = [
          { name: new RegExp(keyword, 'i') },
          { code: new RegExp(keyword, 'i') }
        ];
      }

      const total = await User.countDocuments(query);
      const items = await User.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .populate('companyId', 'name code')
        .populate('departmentIds', 'name code')
        .select('-password');  // 排除密码字段
        
      return {
        total,
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, updates) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("无效的用户ID");
    }

    const filteredUpdates = filterUserUpdates(updates);

    if (filteredUpdates.code) {
      const existingUser = await User.findOne({
        code: filteredUpdates.code.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingUser) {
        throw new DuplicateUserError();
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        ...filteredUpdates,
        updatedAt: Date.now(),
        code: filteredUpdates.code
          ? filteredUpdates.code.toUpperCase()
          : undefined,
      },
      {
        new: true,
        runValidators: true,
        context: "query",
        select: "-password -refreshToken",
      }
    );

    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }

  async deleteUser(userId, currentUserId) {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(currentUserId)
    ) {
      throw new Error("无效的用户ID");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (userId === currentUserId) {
      throw new DeleteCurrentUserError();
    }

    if (user.role === "admin") {
      throw new DeleteAdminError();
    }

    await User.findByIdAndDelete(userId);
    return { success: true, message: "用户删除成功" };
  }

  // 辅助方法，提高可读性
  validateIds(...ids) {
    ids.forEach((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new UserError("无效的用户ID");
      }
    });
  }

  async findUserOrThrow(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  isCurrentUser(userId, currentUserId) {
    return userId === currentUserId;
  }

  isAdminUser(user) {
    return user.role === "admin";
  }
}

module.exports = new UserService();
