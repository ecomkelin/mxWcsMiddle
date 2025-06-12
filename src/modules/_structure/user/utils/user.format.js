exports.formatUserBasic = (user) => ({
  id: user._id,
  code: user.code,
  name: user.name,
  role: user.role,
  status: user.status,
  permissions: user.permissions || [],
  createdAt: user.createdAt
});