// 统一的 API 业务状态码
export enum ApiCode {
  // 成功
  SUCCESS = 0,

  // 客户端错误 (1xx)
  PARAM_ERROR = 1,           // 参数校验失败
  PARAM_MISSING = 2,         // 缺少必要参数
  PARAM_FORMAT_ERROR = 3,    // 参数格式错误

  // 认证授权 (10xx)
  UNAUTHORIZED = 1001,       // 未登录/Token 过期
  TOKEN_EXPIRED = 1002,      // Token 已过期
  TOKEN_INVALID = 1003,      // Token 无效
  FORBIDDEN = 1004,          // 无权限访问
  ACCOUNT_DISABLED = 1005,   // 账号已禁用
  PASSWORD_ERROR = 1006,     // 用户名或密码错误
  LOGIN_FAIL = 1007,         // 登录失败

  // 资源错误 (20xx)
  NOT_FOUND = 2001,          // 资源不存在
  ALREADY_EXISTS = 2002,     // 资源已存在
  CONFLICT = 2003,           // 数据冲突
  DELETE_DENIED = 2004,      // 不允许删除（有关联数据）

  // 服务器错误 (50xx)
  INTERNAL_ERROR = 5000,     // 服务器内部错误
  DB_ERROR = 5001,           // 数据库错误
  EXTERNAL_ERROR = 5002,     // 外部服务调用失败
  RATE_LIMIT = 5003,       // 请求过于频繁
}

// 错误码对应的消息
export const ApiCodeMessage: Record<ApiCode, string> = {
  [ApiCode.SUCCESS]: 'success',
  [ApiCode.PARAM_ERROR]: '参数校验失败',
  [ApiCode.PARAM_MISSING]: '缺少必要参数',
  [ApiCode.PARAM_FORMAT_ERROR]: '参数格式错误',
  [ApiCode.UNAUTHORIZED]: '未登录或登录已过期',
  [ApiCode.TOKEN_EXPIRED]: 'Token 已过期',
  [ApiCode.TOKEN_INVALID]: 'Token 无效',
  [ApiCode.FORBIDDEN]: '无权限访问',
  [ApiCode.ACCOUNT_DISABLED]: '账号已禁用',
  [ApiCode.PASSWORD_ERROR]: '用户名或密码错误',
  [ApiCode.LOGIN_FAIL]: '登录失败',
  [ApiCode.NOT_FOUND]: '资源不存在',
  [ApiCode.ALREADY_EXISTS]: '资源已存在',
  [ApiCode.CONFLICT]: '数据冲突',
  [ApiCode.DELETE_DENIED]: '存在关联数据，无法删除',
  [ApiCode.INTERNAL_ERROR]: '服务器内部错误',
  [ApiCode.DB_ERROR]: '数据库操作失败',
  [ApiCode.EXTERNAL_ERROR]: '外部服务调用失败',
  [ApiCode.RATE_LIMIT]: '请求过于频繁，请稍后重试',
};
