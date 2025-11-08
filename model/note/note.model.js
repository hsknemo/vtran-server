const Base = require("../base.model")
const {resolve} = require( "node:path")
const crypto = require('crypto')
const moment = require("moment");
const fs = require('fs')
const {getRandomStr} = require("../../utils/Js_Tool");
const DefineNoteModel = function (args = {}) {
  return {
    id: args.id,
    // 标题
    name: args.name,
    // 文件路径
    contentUrl: args.contentUrl,
    // 用户id
    userId: args.userId,
    // 简述文章
    desc: args.desc,
    // 创建时间
    createTime: args.createTime,
    // 更新时间
    updateTime: args.updateTime,
    // 标记颜色
    markColor: args.markColor || 'gold',
  }
}
// 定义 Note 数据模型
module.exports.DefineNoteModel = DefineNoteModel

// 定义 Note 模型操作类
module.exports.NoteModel = class NoteModel extends Base {
  constructor() {
    super()
    this.filePath = resolve(__dirname, './note.json')
  }

  async saveOrUpdateNoteFileForUser(userId, content, path_name) {
    let dirName = resolve(process.cwd() + `/model/note/user_note/${userId}`)
    fs.mkdirSync(dirName, {recursive: true})
    // 文件命名规则 用户id_时间戳_随机6位字符串
    if (!path_name) {
      path_name = Date.now() + '_' + getRandomStr() + '.md'
    }
    let mdPath = resolve(process.cwd() + `/model/note/user_note/${userId}/${path_name}`)
    fs.writeFileSync(mdPath, content, 'utf-8')
    return path_name
  }

  async findNotePool(userId) {
    let modelData = await this.getModelData()
    return modelData.filter(item => item.userId === userId)
  }

  async saveNoteModel(userId, modelData = {}) {
    modelData.id = crypto.randomUUID()
    modelData.updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
    modelData.createTime = modelData.createTime || moment().format('YYYY-MM-DD HH:mm:ss')
    modelData.userId = userId
    if (modelData.content) {
      modelData.contentUrl = await this.saveOrUpdateNoteFileForUser(modelData.userId, modelData.content)
    }
    let model = new DefineNoteModel(modelData)
    let noteModelData = await this.getModelData()
    noteModelData.push(model)
    await this.save(noteModelData)
    return '创建成功'
  }

  /**
   * @description 根据文件名称找出文件
   * @param userId
   * @param fileName 文件名称
   * @returns {string}
   */
  async findNoteByFileName(userId, fileName) {
    // 是否存在文件夹
    if (!fs.existsSync(resolve(process.cwd() + `/model/note/user_note/${userId}`))) {
      return '文件不存在'
    }

    let path = resolve(process.cwd() + `/model/note/user_note/${userId}/${fileName}`)
    // return fs.readFileSync(path, 'utf-8')

    let stream = fs.createReadStream(path, {
      highWaterMark: 10 * 1024 // 每次读取 64KB（可根据文件类型调整）
    })
    return stream
  }

}
