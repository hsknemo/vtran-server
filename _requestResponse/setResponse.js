const SUCCESS = function(data) {
  return {
    status: 1,
    msg: '服务调用成功',
    data,
  }
}
const ERROR = function(msg) {
  return {
    status: 0,
    msg,
  }
}

const ERROR_CODE = function(code, msg) {
  return {
    status: code,
    msg,
  }
}
module.exports = {
  SUCCESS,
  ERROR,
  ERROR_CODE
}
