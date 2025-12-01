
const Base = require("../base.model")
const moment = require("moment");
const {resolve} = require("node:path");
class IssueCommentsModel extends Base {
  constructor() {
    super();
    this.filePath = resolve(__dirname, './issueComments.json')
  }

  async findComments(issueId) {
    let modelData = await this.getModelData()
    modelData[issueId]['issueId'] = issueId
    return modelData[issueId]
  }

  async addComments(issue_config = {}) {
    let modelData = await this.getModelData()
    modelData[issue_config.issueId] = modelData[issue_config.issueId] || {
      comments: [],
      insertTime: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    modelData[issue_config.issueId].updateTime = moment().format('YYYY-MM-DD HH:mm:ss')

    modelData[issue_config.issueId].comments.push({
      id: crypto.randomUUID(),
      content: issue_config.content,
      fromUser: issue_config.fromUser,
      insertTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    })
    await this.save(modelData)
    return '添加成功'
  }

  /**
   * 回复
   * @param issue_config
   * @param userId 当前登录人id
   * @returns {Promise<void>}
   */
  async replyComments(userId, issue_config = {}) {
    let modelData = await this.getModelData()
    let f = modelData[issue_config.issueId]

    if (!f) {
      throw new Error('评论不存在')
    }
    f.comments.forEach(item => {
      if (item.id === issue_config.id) {
        item.reply = item.reply || []
        item.reply.push({
          id: crypto.randomUUID(),
          content: issue_config.content,
          fromUser: userId,
          replyId: issue_config.replyId || issue_config.id,
          replyUser: issue_config.replyUser,
          insertTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        })
      }
    })
    modelData[issue_config.issueId].updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
    await this.save(modelData)
    return '回复成功'
  }
}

module.exports = new IssueCommentsModel()
