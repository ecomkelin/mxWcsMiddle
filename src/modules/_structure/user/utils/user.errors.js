class UserNotFoundError extends Error {
  constructor(message = '用户不存在') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

class DeleteCurrentUserError extends Error {
  constructor(message = '不能删除当前登录用户') {
    super(message);
    this.name = 'DeleteCurrentUserError';
  }
}

class DeleteAdminError extends Error {
  constructor(message = '无权限删除管理员用户') {
    super(message);
    this.name = 'DeleteAdminError';
  }
}

class DuplicateUserError extends Error {
  constructor(message = '用户账号已存在') {
    super(message);
    this.name = 'DuplicateUserError';
  }
}

module.exports = {
  UserNotFoundError,
  DeleteCurrentUserError,
  DeleteAdminError,
  DuplicateUserError
}; 