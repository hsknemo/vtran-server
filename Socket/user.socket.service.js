const eventEmitter = require('../Event/index')
const { CALL_USER_REFRESN_EVENT, PROFILE_MESSAGE_EVENT, Chat_CLIENT_MESSAGE_EVENT, Chat_GROUP_MESSAGE_EVENT,
  Chat_Group_Add_User_Event, ClearUserWs_Event
} = require("./type/socket.event.type");
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
  if (!user.ws) {
    return
  }
  user.ws.send(JSON.stringify({
    type: 'refreshMessage',
    data: 'refresh-user-list',
    value: client.user.id
  }))
})

eventEmitter.on(PROFILE_MESSAGE_EVENT, client => {
  console.log('事件传过来的参数是', client)
  // console.log('发送用户', client.user.id)
  let user = userMap.get(client.user.id)
  // 用户不在线
  if (!user || !user.ws) {
    return
  }

  user.ws.send(JSON.stringify({
    type: 'profile-message',
    data: 'profile-message',
    value: client.user.id
  }))

})

eventEmitter.on(Chat_CLIENT_MESSAGE_EVENT, (client) => {
  let user = userMap.get(client.user.id)
  if (!user || !user.ws) {
     return
  }
  user.ws.send(JSON.stringify({
    type: Chat_CLIENT_MESSAGE_EVENT,
    data: {
      sendMsg: client.user.sendMsg,
      session_id: client.user.session_id,
      fromUser: client.user.from,
    }
  }))
})


/**
 * 群组消息推送
 */
eventEmitter.on(Chat_GROUP_MESSAGE_EVENT, (client) => {
  let clientUserList = client.user.userList
  console.log('clientUserList is ******', clientUserList)
  if (clientUserList.length === 1) {
    // 发送自己
    return
  }
  let filterId = clientUserList.filter(item => item !== client.user.from.id)
  filterId.forEach(item => {
    let user = userMap.get(item)
    console.log(user)
    if (!user) {
      return;
    }
    if (!user && !user.ws) {
      return
    }

    user.ws.send(JSON.stringify({
      type: Chat_GROUP_MESSAGE_EVENT,
      data: {
        sendMsg: client.user.sendMsg,
        session_id: client.user.session_id,
        fromUser: client.user.from,
      }
    }))
  })
})

eventEmitter.on(Chat_Group_Add_User_Event, groupData => {
  groupData.userList.forEach(item => {
    let user = userMap.get(item)
    if (!user || !user.ws) {
      return
    }
    user.ws.send(JSON.stringify({
      type: Chat_Group_Add_User_Event,
      data: {
        name: groupData.name,
        userId: item,
        createUserId: groupData.createUserId,
      }
    }))
  })
})

// 离线剔除缓存用户
eventEmitter.on(ClearUserWs_Event, groupData => {
  if (userMap.has(groupData.userId)) {
    userMap.delete(groupData.userId)
  }
  console.log(`剔除用户后 ${ groupData.userId}`, userMap.keys())
})

