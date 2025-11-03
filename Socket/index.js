var WebSocket = require('ws')
const {port} = require("../config/Port");
const eventEmitter = require('../Event/index')
const userEventService = require('../Event/user.event.service')
const chalk = require('chalk')
require('dotenv').config();
require('console-png').attachTo(console);
let terminalInputTextStyle = new chalk.Chalk()

module.exports = app => {
  let server = require('http').createServer(app)
  server.listen(port, () => {
    // console.png(require('fs').readFileSync(process.cwd() + '/config/project/Tran.png'));
    console.log(terminalInputTextStyle.black(`🦖【TONE-SOCKET Version 1.0】:`))
    console.log([
      '-🦖 配置信息',
      `-🦖 port: ${process.env.TONE_PORT}`,
      `-🦖 websocketPort:  ${process.env.WEBSOCKET_PORT}`
      ].join('\r\n')
    )
  })
  let wss = new WebSocket.Server({
    port: process.env.WEBSOCKET_PORT
  })


  wss.on('connection', (ws, req) => {
    // 处理消息
    ws.on('message', async evt => {
      try {
        let user = JSON.parse(evt.toString())
        if (user.type === 'ping') {
          if (user.id) {
            ws.clientId = ws.clientId || crypto.randomUUID()
            eventEmitter.emit('set-ws-client', {
              ws,
              user,
              clientId: ws.clientId,
            })
            eventEmitter.emit('update-user', user)
          }
          // 添加时间戳
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
          }))
        }
        if (user.type === 'client-chat-message') {
          eventEmitter.emit('client-chat-message', {
            user: user.data
          })
          ws.send(JSON.stringify({
            type: 'chat-end',
            timestamp: Date.now()
          }))
        }
      } catch (error) {
        console.error('Message parse error:', error);
      }
    });
  })
  global.wss = wss
}
