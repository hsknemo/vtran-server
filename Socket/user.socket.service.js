const eventEmitter = require('../Event/index')
let userMap = new Map()

let setWsClientEventKey = 'set-ws-client'
eventEmitter.on(setWsClientEventKey, (client) => {
  if (!userMap.has(client.user.username)) {
    userMap.set(client.user.username, {
      ws: client.ws,
      clientId: client.clientId,
      user: client.user
    })
    console.log('新用户进来')
    eventEmitter.emit('call-user-refresh', client)
  }
  console.log('【所有用户】', userMap.keys())
})

let callUserWsClientEventKey = 'call-user-refresh'
eventEmitter.on(callUserWsClientEventKey, client => {
  let user = userMap.get(client.clientId)
  user.ws.send(JSON.stringify({
    type: 'refreshMessage',
    data: 'refresh-user-list',
    value: client.user.username
  }))
})
