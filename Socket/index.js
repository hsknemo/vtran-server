var WebSocket = require('ws')
const {port} = require("../config/Port");
const path = require("path");
const eventEmitter = require('../Event/index')
const userEventService = require('../Event/user.event.service')
const chalk = require('chalk')
const {ClearUserWs_Event} = require("./type/socket.event.type");
const {authorizeToken} = require("../middware/Authorization");
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, "../.env") });
require('console-png').attachTo(console);
let terminalInputTextStyle = new chalk.Chalk()

const padding = num => {
  return new Array(num).fill(' ').join('')
}
const greenMsg = (msg, paddingLeft = 2, paddingRight = 2, showBr) => {
  let pl = padding(paddingLeft)
  let pr = padding(paddingRight)

  console.log(terminalInputTextStyle.bgGreenBright(terminalInputTextStyle.black(pl + msg + pr)))
  if (showBr) {
    console.log('')
  }
  return msg.length + paddingLeft + paddingRight
}

module.exports = app => {
  const wsPort = Number(process.env.WEBSOCKET_PORT || 9998)
  if (!Number.isInteger(wsPort) || wsPort <= 0) {
    throw new Error(`Invalid WEBSOCKET_PORT: ${process.env.WEBSOCKET_PORT}`)
  }

  let server = require('http').createServer(app)
  server.listen(port, () => {
    let len = greenMsg('🦖 TONE_SERVER VERSION v1.0 LOVE AND PEACE 🦖', 2, 2)
    greenMsg('端口监听如下：', 2, len - 18)
    greenMsg(`监听端口在: ${process.env.TONE_PORT}`, 2,len - 20)
    greenMsg(`webSocket 端口监听在:  ${wsPort}`,2, len - 31)
  })
  let wss = new WebSocket.Server({
    port: wsPort
  })


  wss.on('connection', (ws, req) => {
    let url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`)
    let urlSchema = new URLSearchParams(url.search)
    // 验证链接地址
    if (url.pathname !== '/tranWs') {
      ws.close()
      return
    }

    // 验证token
    if (!urlSchema.get('token')) {
      ws.close()
      return
    }
    // 验证 token有效期
    try {
      let verRes = authorizeToken(urlSchema.get('token'))
      if (verRes === 'jwt expired') {
        ws.close()
        return
      }
    } catch (e) {
      ws.close()
      return
    }

    // 当前链接用户的访问令牌，由前台传递生成，处理用户登录多端 同步推送
    let accessWebToken = urlSchema.get('curAccessToken')

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
              accessWebToken,
              clientId: ws.clientId,
            })
            eventEmitter.emit('update-user', user)
          }
          // 添加时间戳
          ws.send(JSON.stringify({
            type: 'pong',
            accessWebToken,
            timestamp: Date.now()
          }))
        }
        if (user.type === 'client-chat-message') {
          // 修复：兼容“首条消息早于首次心跳”的场景，先兜底绑定当前 ws 到发送用户
          if (!ws.clientId && user?.data?.from?.id) {
            ws.clientId = user.data.from.id
            eventEmitter.emit('set-ws-client', {
              ws,
              user: user.data.from,
              accessWebToken,
              clientId: ws.clientId,
            })
          }
          eventEmitter.emit('client-chat-message', {
            user: user.data,
            accessWebToken,
          })
          ws.send(JSON.stringify({
            type: 'chat-end',
            accessWebToken,
            timestamp: Date.now()
          }))
        }

        if (user.type === 'client-chat-group-message') {
          // 修复：群聊消息同样增加兜底绑定，避免连接刚建立时广播目标丢失
          if (!ws.clientId && user?.data?.from?.id) {
            ws.clientId = user.data.from.id
            eventEmitter.emit('set-ws-client', {
              ws,
              user: user.data.from,
              accessWebToken,
              clientId: ws.clientId,
            })
          }
          eventEmitter.emit('client-chat-group-message', {
            user: user.data,
            accessWebToken,
          })
          ws.send(JSON.stringify({
            type: 'chat-group-end',
            accessWebToken,
            timestamp: Date.now()
          }))
        }
      } catch (error) {
        console.error('Message parse error:', error);
        ws.send(JSON.stringify({
          type: 'server-error',
          accessWebToken,
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
          onlineStatus: false,
          accessWebToken,
        })

        eventEmitter.emit(ClearUserWs_Event, {
          userId: ws.clientId,
          onlineStatus: false,
          accessWebToken,
        })
      }
    })
  })
  global.wss = wss
}
