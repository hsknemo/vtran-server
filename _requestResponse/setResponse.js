const now = () => new Date().toISOString();

const SUCCESS = function(data, msg = '服务调用成功') {
  return {
    // 新协议字段（推荐前端使用）
    success: true,
    code: 0,
    message: msg,
    data,
    timestamp: now(),
    // 兼容旧协议字段
    status: 1,
    msg,
  }
}
const ERROR = function(msg = '服务调用失败', code = 1, data = null) {
  return {
    // 新协议字段（推荐前端使用）
    success: false,
    code,
    message: msg,
    data,
    timestamp: now(),
    // 兼容旧协议字段
    status: 0,
    msg,
  }
}

const ERROR_CODE = function(code, msg = '服务调用失败', data = null) {
  return {
    success: false,
    code,
    message: msg,
    data,
    timestamp: now(),
    status: 0,
    msg,
  }
}
module.exports = {
  SUCCESS,
  ERROR,
  ERROR_CODE,
}
