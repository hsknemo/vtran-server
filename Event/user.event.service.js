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



