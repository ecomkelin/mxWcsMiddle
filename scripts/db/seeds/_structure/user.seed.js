const User = require('../../../../src/models/_structure/User');
const Company = require('../../../../src/models/_structure/Company');
const Department = require('../../../../src/models/_structure/Department');
const argon2 = require('argon2');

const userSeedData = [
  {
    code: 'ADMIN001',
    name: '系统管理员',
    password: 'Test1234',
    isAdmin: true,
    isActive: true,
  },
  {
    code: 'MGR001',
    name: '销售经理',
    password: 'Test1234',
    isAdmin: false,
    isActive: true,
  },
  {
    code: 'SALE001',
    name: '销售员A',
    password: 'Test1234',
    isAdmin: false,
    isActive: true,
  },
  {
    code: 'PURCH001',
    name: '采购员A',
    password: 'Test1234',
    isAdmin: false,
    isActive: true,
  },
  {
    code: 'FIN001',
    name: '财务人员',
    password: 'Test1234',
    isAdmin: false,
    isActive: true,
  },
  {
    code: 'TEST001',
    name: '测试账号',
    password: 'Test1234',
    isAdmin: false,
    isActive: false,
  }
];

async function initializeUsers() {
  try {
    // 清空现有数据
    await User.deleteMany({});

    // 获取总公司
    const headquarters = await Company.findOne({ code: 'HQ001' });
    if (!headquarters) {
      throw new Error('未找到总公司，请先初始化公司数据');
    }

    // 获取部门信息
    const departments = await Department.find({
      companyId: headquarters._id
    });

    const getDepartmentByName = (name) => 
      departments.find(dept => dept.name === name);

    const salesDept = getDepartmentByName('销售部');
    const purchDept = getDepartmentByName('采购部');
    const finDept = getDepartmentByName('财务部');
    const itDept = getDepartmentByName('信息技术部');

    if (!salesDept || !purchDept || !finDept || !itDept) {
      throw new Error('未找到必要的部门数据，请先初始化部门数据');
    }

    // 对密码进行加密并添加公司和部门信息
    const usersWithFullInfo = await Promise.all(
      userSeedData.map(async (user) => {
        const hashedPassword = await argon2.hash(user.password);
        let departmentIds = [];
        let companyId = headquarters._id;

        // 根据用户角色分配部门
        switch (user.code) {
          case 'ADMIN001':
            departmentIds = [itDept._id];
            break;
          case 'MGR001':
            departmentIds = [salesDept._id, purchDept._id];
            break;
          case 'SALE001':
            departmentIds = [salesDept._id];
            break;
          case 'PURCH001':
            departmentIds = [purchDept._id];
            break;
          case 'FIN001':
            departmentIds = [finDept._id];
            break;
          case 'TEST001':
            departmentIds = [itDept._id];
            break;
        }

        return {
          ...user,
          password: hashedPassword,
          companyId,
          departmentIds
        };
      })
    );

    // 批量插入数据
    await User.insertMany(usersWithFullInfo);
    console.log('用户数据初始化成功');
  } catch (error) {
    console.error('用户数据初始化失败:', error);
    throw error;
  }
}

module.exports = {
  initializeUsers,
  userSeedData  // 导出未加密的种子数据供测试使用
}; 