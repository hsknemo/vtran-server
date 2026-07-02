const userModel = require('../model/user.model')
class UserService {
  constructor() {
    this.userModel = userModel
  }

  async countUser() {
    return {
      total: await this.userModel.countUser()
    }
  }

  async uploadPropfile(user, req) {
    if (!user.id) {
      throw new Error('用户不存在')
    }
    return await this.userModel.uploadProfile(user, req)
  }

  async findUserById(id) {
    return await this.userModel.findUserById(id)
  }


}

module.exports = new UserService()
