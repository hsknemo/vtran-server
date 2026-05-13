const cron = require('node-cron');
const moment = require('moment');
const userModel = require("../model/user/user.model");



const updateUserOnlineStatusCron = () => {
  // 每 10 秒执行一次任务
  cron.schedule('*/10 * * * * *', () => {
    console.log('每10秒执行一次 →', new Date().toLocaleString());
    userModel.getUser().then(async (users) => {
      users.forEach(item => {
        let diff = moment().diff(moment(item.updateTime), 'second')
        delete item.headerBeatTime
        item.heartBeatTime = moment().format('YYYY-MM-DD HH:mm:ss')
        if (diff > 5000) {
          item.isOnline = false
        }
      })
      await userModel.save(users)
    });
  });
};

module.exports = () => {
  // 更新用户在线状态信息
  updateUserOnlineStatusCron()
};
