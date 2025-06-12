const User = require('../../../models/_structure/User');
const { generateTokens, verifyToken } = require('../../../utils/tokenUtil');
const TokenBlacklist = require('../../../models/_auth/token/TokenBlacklist');

class AuthService {
  async login(code, password) {
    const user = await User.findOne({ code: code.toUpperCase() })
      .select('+password')
      .exec();

    if (!user || user.isActive !== true) {
      throw new Error('用户不存在或已禁用');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('密码错误');
    }

    const { accessToken, refreshToken, refreshTokenExpiresAt } = generateTokens(user._id);
    
    user.refreshToken = {
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt
    };
    user.lastLoginAt = new Date();
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        code: user.code,
        name: user.name,
        isAdmin: user.isAdmin,
      }
    };
  }

  async refreshToken(refreshToken) {
    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      throw new Error('无效的刷新令牌');
    }

    const user = await User.findOne({
      _id: decoded.userId,
      'refreshToken.token': refreshToken,
      'refreshToken.expiresAt': { $gt: new Date() }
    });

    if (!user || user.status !== 'active') {
      throw new Error('用户不存在或已禁用');
    }

    const tokens = generateTokens(user._id);
    
    user.refreshToken = {
      token: tokens.refreshToken,
      expiresAt: tokens.refreshTokenExpiresAt
    };
    await user.save();

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        code: user.code,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      }
    };
  }

  async logout(userId, token) {
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    await User.findByIdAndUpdate(userId, {
      $unset: { 
        'refreshToken.token': "",
        'refreshToken.expiresAt': "" 
      }
    }, { new: true });

    if (token) {
      await TokenBlacklist.create({
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }

    return true;
  }
}

module.exports = new AuthService(); 