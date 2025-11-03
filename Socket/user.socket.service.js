const eventEmitter = require('../Event/index')
const { CALL_USER_REFRESN_EVENT, PROFILE_MESSAGE_EVENT, Chat_CLIENT_MESSAGE_EVENT} = require("./type/socket.event.type");
let userMap = new Map()

let setWsClientEventKey = 'set-ws-client'
eventEmitter.on(setWsClientEventKey, (client) => {
  if (!userMap.has(client.user.id)) {
    userMap.set(client.user.id, {
      clientId: client.clientId,
      user: client.user
    })
    eventEmitter.emit(CALL_USER_REFRESN_EVENT, client)
  }
  // 链接换成新的链接
  let map = userMap.get(client.user.id)
  map.ws = client.ws
  userMap.set(client.user.id, map)
  // console.log('【所有用户】', userMap.keys())
})

eventEmitter.on(CALL_USER_REFRESN_EVENT, client => {
  let user = userMap.get(client.user.id)
  user.ws.send(JSON.stringify({
    type: 'refreshMessage',
    data: 'refresh-user-list',
    value: client.user.id
  }))
})

eventEmitter.on(PROFILE_MESSAGE_EVENT, client => {
  let user = userMap.get(client.user.id)
  user.ws.send(JSON.stringify({
    type: 'profile-message',
    data: 'profile-message',
    value: client.user.id
  }))
  console.log('事件传过来的参数是', client)
  console.log('发送用户', client.user.id)
})

eventEmitter.on(Chat_CLIENT_MESSAGE_EVENT, (client) => {
  console.log(client.user)
  let user = userMap.get(client.user.id)
  user.ws.send(JSON.stringify({
    type: Chat_CLIENT_MESSAGE_EVENT,
    data: {
      sendMsg: client.user.sendMsg,
      session_id: client.user.session_id,
      fromUser: client.user.from,
    }
  }))
})
