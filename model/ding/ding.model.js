const Base = require("../base.model");
const {resolve} = require("node:path");
const moment = require("moment/moment");
const crypto = require("crypto");


const DingDataStruct = function (o = {}) {
  return {
    id: o.id || crypto.randomUUID(),
    dingMsg: o.dingMsg,
    insertTime: o.insertTime || moment().format('YYYY-MM-DD HH:mm:ss'),
    toUser: o.toUser,
    fromUser: o.fromUser,
    isCancel: o.isCancel,
  }
}


class DingModel extends Base {
  constructor() {
    super();
    this.filePath = resolve(__dirname, './ding.json')
  }

  async saveModel(dingModel, fromUserId, toUserId) {
    dingModel.fromUser = fromUserId
    dingModel.toUser = toUserId
    let dMdodel = new DingDataStruct(dingModel)
    let modelData = await this.getModelData()
    modelData.push(dMdodel)
    await this.save(modelData)
    return '保存成功'
  }

  /**
   * 查询我的叮
   * @param userId
   * @returns {Promise<void>}
   */
  async findMyDing(userId) {
    let modelData = await this.getModelData()
    return modelData.filter(item => item.toUser === userId)
  }

  // 更新叮状态
  async updateDingStatus(userId, requestBody) {
    let modelData = await this.getModelData()
    modelData.forEach(item => {
      if (item.id === requestBody.id) {
        item.isCancel = requestBody.isCancel
      }
    })
    await this.save(modelData)
    return '更新成功'
  }

  /**
   * 删除叮
   * @description 必须是自己删除自己的叮
   * @param userId
   * @param requestBody
   * @returns {Promise<string>}
   */
  async deleteDing(userId, requestBody) {
    let modelData = await this.getModelData()
    // 防止其他人删除已知的叮id
    modelData = modelData.filter(item => item.id !== requestBody.id)
    await this.save(modelData)
    return '删除成功'
  }
}

module.exports = {
  DingModel: new DingModel(),
  DingDataStruct,
}
