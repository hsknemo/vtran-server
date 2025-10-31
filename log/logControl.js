const fs = require("fs");
const path = require("path");
const morgan = require('morgan');
var FileStreamRotator = require('file-stream-rotator')
var logDirectory = path.join(__dirname, '../log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})


function customFormat(tokens, req, res) {
  console.log(res, 'morgan')
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: tokens['response-time'](req, res), // 请求响应时间
    date: tokens.date(req, res),
    userAgent: tokens['user-agent'](req, res),
    data: tokens.res(req, res, "content-length")
  }, null, 2);
}
module.exports = app => {
  app.use(morgan(customFormat, { stream: accessLogStream }));
}

