/**
 * 事件： 更新用户在线状态
 * @type {module:events.EventEmitter<DefaultEventMap> | {}}
 */
const eventEmitter = require('./index');
const userModel = require('../model/user/user.model')

eventEmitter.on('update-user', async user => {
  // console.log('【event: 】update-user', user)
  user.userId = user.id
  await userModel.updateUserOnlineStatus(user.id, true, user.ip)
})


eventEmitter.on('update-user-onlineStatus', async (userConfig) => {
  await userModel.updateUserOnlineStatus(userConfig.userId, userConfig.onlineStatus)
})



