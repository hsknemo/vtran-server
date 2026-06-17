const {userRedis} = require("./userRedis");
module.exports = {
  load() {
    userRedis.onload()
  }
}
