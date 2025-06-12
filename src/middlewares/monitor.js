const responseTime = require('response-time');

const monitorMiddleware = responseTime((req, res, time) => {
  if (time > 500) {
    console.warn(`Slow request: ${req.method} ${req.url} - ${time}ms`);
  }
});

module.exports = monitorMiddleware; 