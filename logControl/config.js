
let path = require('path');

// 日志根目录
let baseLogPath = path.resolve(__dirname, '../../log3s');
// 请求日志目录
let reqPath = '/request'
// 请求日志文件名
let reqFileName = 'request'
// 请求日志输出完整路径
let reqLogPath = baseLogPath + reqPath + '/' + reqFileName


// 响应日志目录
let resPath = '/response'
// 响应日志文件名
let resFileName = 'response'
// 响应日志输出完整路径
let resLogPath = baseLogPath + resPath + '/' + resFileName

// 错误日志目录
let errPath = '/error'
// 错误日志文件名
let errFileName = 'error'
// 错误日志输出完整路径
let errLogPath = baseLogPath + errPath + '/' + errFileName

const MAX_FILE_FIZE = 1024 * 1024 * 10
const FILE_PATTERN = '-yyyy-MM-dd.log'
const FILE_CONFIG = {
  pattern: FILE_PATTERN,
  alwaysIncludePattern: true,
  encoding: 'utf-8',
  maxLogSize: MAX_FILE_FIZE, // 最大存储内容
  compress: true,
  daysToKeep: 4,
  keepFileExt: false,
  numBackups: 100,
}

module.exports = {
  pm2: true, // 是否使用pm2管理进程
  pm2InstanceVar: "INSTANCE_ID", // pm2的实例变量名
  disableCluster: true,
  appenders: {
    // 所有的日志
    'console': { type: 'console' },
    // 请求日志
    'reqLogger':Object.assign({},{
      type: 'dateFile',
      filename: reqLogPath,
    }, FILE_CONFIG),
    // 响应日志
    'resLogger':
      Object.assign({},{
        type: 'dateFile',
        filename: resLogPath,
      }, FILE_CONFIG),
    // 错误日志
    'errLogger': Object.assign({},{
      type: 'dateFile',
      filename: errLogPath,
    }, FILE_CONFIG)
  },
  // 分类以及日志等级
  categories: {
    default: {
      appenders: ['console'],
      level: 'all'
    },
    reqLogger: {
      appenders: ['reqLogger'],
      level: 'info'
    },
    resLogger: {
      appenders: ['resLogger'],
      level: 'info'
    },
    errLogger: {
      appenders: ['errLogger'],
      level: 'error'
    }
  },
}
