const redis = require('../config/redis_config.js')

class UserRedis {
  constructor() {
    this.key = 'tran_user'
  }

  async onload() {
    let user = await redis.get(this.key)
    if (!user) {
      console.log('初始化tran_user redis 数据')
      await redis.set(this.key, JSON.stringify({}))
    }
  }

  async setUser(id, value) {
    let user = await this.getUser()
    user[id] = value
    redis.set(this.key, JSON.stringify(user))
  }

  saveUser(value) {
    return redis.set(this.key, JSON.stringify(value))
  }

  async getUser() {
    let user = await redis.get(this.key)
    return user ? JSON.parse(user) : {}
  }

  async deleteUserById(userId) {
    console.log('redis 删除', userId)
    let user = await this.getUser()
    delete user[userId]
    return this.saveUser( user)
  }
}


module.exports = {
  userRedis: new UserRedis()
}
