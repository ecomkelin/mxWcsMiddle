const autocannon = require('autocannon');
const { promisify } = require('util');

const run = promisify(autocannon);

async function runLoadTest() {
  console.log('Starting load test...');

  try {
    // 健康检查测试
    console.log('\nRunning health check test...');
    const healthResult = await run({
      url: 'http://localhost:8000/api/health',
      connections: 100,
      duration: 10,
      title: 'Health Check Test'
    });

    console.log('\nHealth Check Results:');
    console.log(autocannon.printResult(healthResult));

    // 登录测试
    console.log('\nRunning login test...');
    const loginResult = await run({
      url: 'http://localhost:8000/api/auth/login',
      connections: 50,
      duration: 20,
      title: 'Login Test',
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        code: 'ADMIN001',
        password: 'admin123'
      })
    });

    console.log('\nLogin Test Results:');
    console.log(autocannon.printResult(loginResult));

    // 获取登录token
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: 'ADMIN001',
        password: 'admin123'
      })
    });

    const { data: { token } } = await loginResponse.json();

    // 用户列表测试
    console.log('\nRunning users API test...');
    const usersResult = await run({
      url: 'http://localhost:8000/api/users',
      connections: 50,
      duration: 20,
      title: 'Users API Test',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\nUsers API Results:');
    console.log(autocannon.printResult(usersResult));

    // 添加产品接口测试
    const productResult = await run({
      url: 'http://localhost:8000/api/products',
      connections: 50,
      duration: 20,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

  } catch (error) {
    console.error('Load test error:', error);
  }
}

runLoadTest().catch(console.error); 