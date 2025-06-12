exports.generateTestToken = (userData) => {
  return jwt.sign(
    { 
      userId: userData._id,
      role: userData.role,
      permissions: userData.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}; 


const User = require('../../models/User');

/**
 * 初始化测试用户数据
 */
async function initializeUsers() {
  try {
    // 清理已有数据
    await User.deleteMany({});

    // 创建测试用户
    const users = await User.create([
      {
        code: 'ADMIN001',
        password: 'admin123',
        name: '管理员',
        role: 'admin',
        status: 'active'
      },
      {
        code: 'TEST001',
        password: 'password123',
        name: '测试用户',
        role: 'staff',
        status: 'active'
      },
      {
        code: 'INACTIVE001',
        password: 'password123',
        name: '禁用用户',
        role: 'staff',
        status: 'inactive'
      }
    ]);

    return users;
  } catch (error) {
    console.error('初始化测试用户失败:', error);
    throw error;
  }
}

/**
 * 创建单个测试用户
 */
async function createTestUser(userData) {
  try {
    const user = await User.create({
      code: 'TEST001',
      password: 'password123',
      name: '测试用户',
      role: 'staff',
      status: 'active',
      ...userData
    });
    return user;
  } catch (error) {
    console.error('创建测试用户失败:', error);
    throw error;
  }
}

/**
 * 创建认证测试用户
 */
async function createTestAuthUser(overrides = {}) {
  return createTestUser({
    code: 'AUTH001',
    password: 'auth123',
    name: '认证测试用户',
    role: 'staff',
    status: 'active',
    ...overrides
  });
}

/**
 * 清理测试用户数据
 */
async function clearUsers() {
  try {
    await User.deleteMany({});
  } catch (error) {
    console.error('清理测试用户失败:', error);
    throw error;
  }
}

module.exports = {
  initializeUsers,
  createTestUser,
  createTestAuthUser,
  clearUsers
}; 