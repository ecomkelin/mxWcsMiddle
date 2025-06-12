const jwt = require('jsonwebtoken');

exports.generateTokens = (userId) => {
  // 生成访问令牌 (5分钟)
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRED }
  );

  // 生成刷新令牌 (7天)
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRED }
  );

  // 计算刷新令牌过期时间
  const refreshTokenExpiresAt = new Date();
  refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

  return {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt
  };
};

exports.verifyToken = (token, isRefreshToken = false) => {
  try {
    return jwt.verify(
      token, 
      isRefreshToken ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET
    );
  } catch (error) {
    return null;
  }
}; 