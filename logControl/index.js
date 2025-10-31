const log4js = require('log4js')
const logConfig = require('./config.js')
const moment = require("moment");


// 调用配置文件
log4js.configure(logConfig)


class CommonHandle {
  constructor() { }
  // 格式化请求日志
  static formatReqLog(ctx, time) {
    let text = `------------request start ${moment().format('YYYY-MM-DD HH:mm:ss')}------------`
    let method = ctx.method
    text += `request method: ${method} \n request url: ${ctx.originalUrl} \n`

    if (method === 'GET') {
      text += `request data: ${JSON.stringify(ctx.query)} \n`
    } else {
      text += `request data: ${JSON.stringify(ctx.body)} \n`
    }

    return text
  }
  // 格式化相应日志
  static formatResLog(realResBody, time) {
    let text = `
      response_time: ${moment().format('YYYY-MM-DD HH:mm:ss')} 
    `
    text += `response result:\n ${JSON.stringify(realResBody)} \n`

    text += `response time: ${time} \n`
    return text
  }
  // 格式化错误日志
  static formatErrorLog(ctx, resRealBody, error, time) {
    let text = '------------error start------------'
    text += this.formatResLog(resRealBody, time)
    text += `error content: ${JSON.stringify(error)}`

    return text
  }
}

class HandleLogger extends CommonHandle {
  constructor() {
    super()
  }

  // 请求日志
  static reqLogger(ctx) {
    log4js.getLogger('reqLogger').info(this.formatReqLog(ctx))
  }

  // 相应日志
  static resLogger(ctx, realResBody,time) {
    // console.log(res, '响应')
    log4js.getLogger('resLogger').info(this.formatResLog(realResBody, time))
  }

  // 错误日志
  static errorLogger(ctx, resRealBody ,error, time) {
    log4js.getLogger('errLogger').info(this.formatErrorLog(ctx, resRealBody, error, time))
  }

}

module.exports =() => (req, res, next) => {
  let ctx = req
  const oldSend = res.send
  let startTime = new Date().getTime()
  res.send = function () {
    oldSend.apply(res, arguments)
    if (typeof [...arguments][0] === 'object') {
      res.once('finish', () => {
        let period;
        try {
          // 请求日志
          HandleLogger.reqLogger(ctx)
          next()
          period = new Date().getTime() - startTime
          startTime = period
          // 响应日志
          HandleLogger.resLogger(ctx, arguments, period + 'ms')
        } catch (err) {
          period = new Date().getTime() - startTime
          startTime = period
          // 错误日志
          HandleLogger.errorLogger(req, arguments, err, period + 'ms')
          next()
        }
      })
    }
  }
  return next()
}
