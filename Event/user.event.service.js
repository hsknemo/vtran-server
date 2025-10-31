const eventEmitter = require('./index');
const userModel = require('../model/user.model')

eventEmitter.on('update-user', async user => {
  console.log('【event: 】update-user', user)
  await userModel.updateUser(user)
})
