const {resolve} = require("node:path");
const fs = require("fs")

const GroupDataStruct = function (group) {
  return {
    id: group.id,
    name: group.name,
    createTime: group.createTime,
    updateTime: group.updateTime,
    userList: group.userList || [],
    createUserId: group.createUserId,
  }
}
/**
 * 建聊天群
 * @type {Base|{}}
 */
const Base = require('../base.model')
const moment = require("moment");

class GroupModel extends Base {
  constructor() {
    super();
    this.filePath = resolve(__dirname, './group.json')
  }


  async findGroupById(id) {
    if (!id) return []
    let groupModel = await this.getModelData()
    let findResult = groupModel[id]
    return findResult || ''
  }

  /**
   * @description 创建群数据
   * @param groupData
   * @returns {Promise<void>}
   */
  async createGroupData(groupData = {}) {
    groupData.id = crypto.randomUUID()
    groupData.createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    groupData.updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
    // 存储当前创建人
    groupData.userList =  [].concat([
        groupData.createUserId,
      ...groupData.userList
    ])
    let group = GroupDataStruct(groupData)
    let groupModelData = await this.getModelData()
    groupModelData[group.id] = group
    await this.save(groupModelData)
    return '创建成功'
  }

  async findOwnInnerGroup(userId) {
    let groupModelData = await this.getModelData()
    let result = []
    for (const groupModelDataKey in groupModelData) {
      let bool = groupModelData[groupModelDataKey].userList.includes(userId)
      if (bool) {
        result.push(groupModelData[groupModelDataKey])
      }
    }
    return result
  }

  async addUserToGroup(groupId, userId) {
    let groupModelData = await this.getModelData()
    let set = new Set(groupModelData[groupId].userList)
    set.add(userId)
    groupModelData[groupId].userList = [...Array.from(set)]
    await this.save(groupModelData)
    return '添加成功'
  }

}

module.exports = GroupModel
