const { verifyToken } = require("../utils/tokenUtil");
const User = require("../models/_structure/User");
const TokenBlacklist = require("../models/_auth/token/TokenBlacklist");
const ApiPermission = require("../models/_auth/roleApi/ApiPermission");
const UserApiPermission = require("../models/_auth/roleApi/UserApiPermission");

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "未认证" });
    }

    const token = authHeader.startsWith("Bearer ")? authHeader.split(" ")[1]: authHeader;
    const blacklistedToken = await TokenBlacklist.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });
    if (blacklistedToken) {
      return res.status(401).json({ message: "令牌已失效" });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "令牌无效或已过期" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.isActive !== true) {
      return res.status(401).json({ message: "用户不存在或已被禁用" });
    }
    // 避免重复登录
    if (!user.refreshToken || !user.refreshToken.token) {
      return res.status(401).json({ message: "未认证或已登出" });
    }

    req.user = {
      _id: user._id,
      isAdmin: user.isAdmin,
      departmentIds: user.departmentIds,
      companyId: user.companyId,
    };

    next();
  } catch (error) {
    res.status(500).json({ message: "authenticate 认证服务器错误" });
  }
};

exports.authorize = (apiPermission) => async (req, res, next) => {
  try {
    const user = req.user;

    // 如果是管理员，直接通过
    if (user.isAdmin) {
      return next();  // 使用 return 确保后面的代码不会执行
    }

    const apiPath = apiPermission || req.originalUrl;
    const apiMethod = req.method;
    const apiPermission = await ApiPermission.findOne({ apiMethod, apiPath });
    if (!apiPermission) {
      return res.status(500).json({ message: `数据库中没有找到此路由的apiPermission数据，请联系管理员添加` });
    }

    const userApiPermission = await UserApiPermission.findOne({
      userId: user._id,
      apiPermissionId: apiPermission._id,
    });
    if (!userApiPermission) {
      return res.status(401).json({ message: `此人没有访问此api的权限` });
    }

    user.apiPermission = {
      range: userApiPermission.range,
      departmentIds: userApiPermission.departmentIds,
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "authorize 认证服务器错误" });
  }
};
