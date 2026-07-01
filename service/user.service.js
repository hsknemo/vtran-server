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


}

module.exports = new UserService()
