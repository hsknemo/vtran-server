const eventEmitter = require('../Event/index')
const { CALL_USER_REFRESN_EVENT, PROFILE_MESSAGE_EVENT, Chat_CLIENT_MESSAGE_EVENT, Chat_GROUP_MESSAGE_EVENT,
  Chat_Group_Add_User_Event, ClearUserWs_Event
} = require("./type/socket.event.type");
let userMap = new Map()

const sendUserMorePart = (userId, info) => {
  console.log(userMap, 'userMap')
  for (const u of userMap.entries()) {
    let key = u[0]
    console.log(u, 'key')
    if (key.includes( userId)) {
      console.log(u[1], 'uuuuuuuuuuuuuuuu111111111')
      u[1].ws.send(JSON.stringify(info))
    }
  }
}

let setWsClientEventKey = 'set-ws-client'
eventEmitter.on(setWsClientEventKey, (client) => {
  let key = client.user.id + '_' + client.accessWebToken
  if (!userMap.has(key)) {
    userMap.set(key, {
      clientId: client.clientId,
      user: client.user,
      ws: client.ws
    })
    eventEmitter.emit(CALL_USER_REFRESN_EVENT, client)
  }
  // 链接换成新的链接
  let map = userMap.get(key)
  map.ws = client.ws
  userMap.set(key, map)
  // console.log('【所有用户】', userMap.keys())
})

eventEmitter.on(CALL_USER_REFRESN_EVENT, client => {
  let key = client.user.id + '_' + client.accessWebToken

  sendUserMorePart(client.user.id, {
    type: 'refreshMessage',
    data: 'refresh-user-list',
    value: key
  })
})

eventEmitter.on(PROFILE_MESSAGE_EVENT, client => {
  console.log('事件传过来的参数是', client)
  // console.log('发送用户', client.user.id)
  let userId = client.user.id
  let key = userId + '_' + client.accessWebToken

  sendUserMorePart(client.user.id, {
    type: 'profile-message',
    data: 'profile-message',
    value: key
  })
})

eventEmitter.on(Chat_CLIENT_MESSAGE_EVENT, (client) => {
  sendUserMorePart(client.user.id, {
    type: Chat_CLIENT_MESSAGE_EVENT,
    data: {
      sendMsg: client.user.sendMsg,
      session_id: client.user.session_id,
      fromUser: client.user.from,
    }
  })
})


/**
 * 群组消息推送
 */
eventEmitter.on(Chat_GROUP_MESSAGE_EVENT, (client) => {
  let clientUserList = client.user.userList
  if (clientUserList.length === 1) {
    // 发送自己
    return
  }
  let filterId = clientUserList.filter(item => item !== client.user.from.id)
  filterId.forEach(userId => {
    sendUserMorePart(userId, {
      type: Chat_GROUP_MESSAGE_EVENT,
      data: {
        sendMsg: client.user.sendMsg,
        session_id: client.user.session_id,
        fromUser: client.user.from,
      }
    })
  })
})

eventEmitter.on(Chat_Group_Add_User_Event, groupData => {
  groupData.userList.forEach(userId => {
    sendUserMorePart(userId, {
      type: Chat_Group_Add_User_Event,
      data: {
        name: groupData.name,
        userId: item,
        createUserId: groupData.createUserId,
      }
    })
  })
})

// 离线剔除缓存用户
eventEmitter.on(ClearUserWs_Event, groupData => {
  let key = groupData.userId + '_' + groupData.accessWebToken
  if (userMap.has(key)) {
    userMap.delete(key)
  }
  console.log(`剔除用户后 ${ groupData.userId}`, userMap.keys())
})

