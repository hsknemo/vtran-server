const cron = require('node-cron');
const {userRedis} = require("../redis/userRedis");
const moment = require("moment");


const updateUserOnlineStatusCron = () => {
  // 每 10 秒执行一次任务
  cron.schedule('*/10 * * * * *', async () => {
    console.log('每10秒执行一次 →', new Date().toLocaleString());
    let user = await userRedis.getUser()
    for (const userKey in user) {
      let item = user[userKey]
      let diff = moment().diff(moment(item.heartBeatTime), 'second')
      item.heartBeatTime = moment().format('YYYY-MM-DD HH:mm:ss')
      item.isOnline = diff <= 5000
    }
    userRedis.saveUser(user)
  });
};

module.exports = () => {
  // 更新用户在线状态信息
  updateUserOnlineStatusCron()
};
