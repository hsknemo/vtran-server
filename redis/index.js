const {userRedis} = require("./userRedis");
module.exports = {
  async load() {
    await userRedis.onload()
  }
}
