var WebSocket = require('ws')
const {port} = require("../config/Port");
const eventEmitter = require('../Event/index')
const userEventService = require('../Event/user.event.service')
const chalk = require('chalk')
const {ClearUserWs_Event, PROFILE_MESSAGE_EVENT} = require("./type/socket.event.type");
const {authorizeToken} = require("../middware/Authorization");
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
    let url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`)
    let urlSchema = new URLSearchParams(url.search)
    // 验证链接地址
    if (url.pathname !== '/tranWs') {
      ws.close()
    }

    // 验证token
    if (!urlSchema.get('token')) {
      ws.close()
    }
    // 验证 token有效期
    try {
      let verRes = authorizeToken(urlSchema.get('token'))
      if (verRes === 'jwt expired') {
        ws.close()
      }
    } catch (e) {
      ws.close()
    }


    // 处理消息
    ws.on('message', async evt => {
      try {
        let user = JSON.parse(evt.toString())
        let ip = req.headers['x-real-ip'] || req.connection.remoteAddress
        user.ip = ip
        if (user.type === 'ping') {
          if (user.id) {
            ws.clientId = user.id || crypto.randomUUID()
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

        if (user.type === 'client-chat-group-message') {
          eventEmitter.emit('client-chat-group-message', {
            user: user.data
          })
          ws.send(JSON.stringify({
            type: 'chat-group-end',
            timestamp: Date.now()
          }))
        }
      } catch (error) {
        console.error('Message parse error:', error);
        ws.send(JSON.stringify({
          type: 'server-error',
          timestamp: Date.now()
        }))
      }
    });
    ws.on('close', function () {
      console.log('断开链接', ws.clientId)
      // 离线
      if (ws.clientId) {
        eventEmitter.emit('update-user-onlineStatus', {
          userId: ws.clientId,
          onlineStatus: false
        })

        eventEmitter.emit(ClearUserWs_Event, {
          userId: ws.clientId,
          onlineStatus: false
        })
      }
    })
  })
  global.wss = wss
}
