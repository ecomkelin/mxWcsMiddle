class ApiResponse {
  static success(data = null, message = '操作成功') {
    return {
      code: 200,
      success: true,
      message,
      data
    };
  }

  static error(message = '操作失败', data = null, code = 500) {
    return {
      code,
      success: false,
      message,
      data
    };
  }

  // 添加一些常用的错误响应方法
  static validationError(message = '数据验证失败', data = null) {
    return this.error(message, data, 400);
  }

  static unauthorizedError(message = '未授权访问') {
    return this.error(message, null, 401);
  }

  static forbiddenError(message = '无权限访问') {
    return this.error(message, null, 403);
  }

  static notFoundError(message = '资源不存在') {
    return this.error(message, null, 404);
  }
}

module.exports = ApiResponse; 