const Base = require('../base.model');
const {resolve, join} = require("node:path");
const moment = require("moment");
const fs = require('node:fs')
const crypto = require('crypto')
const DefineIssueModel = function (obj) {
  return {
    id: crypto.randomUUID(),
    // 创建时间
    insertTime: obj.insertTime || moment().format('YYYY-MM-DD HH:mm:ss'),
    // 问题描述
    content: obj.content,
    // 问题创建者
    issueCreateUser: obj.issueCreateUser,
    // 问题状态
    issueType: obj.issueType,
    // 问题评论id
    issueCommentsId: obj.issueCommentsId || '',
    uploadImg: [],
  }
}
class IssueModel extends Base {
  constructor() {
    super();
    this.filePath = resolve(__dirname, './issue.json')
    // 评论数据
    this.commentsPath = resolve(__dirname, '../issueComments.json')
    this.uploadsIssuePath = join(this.rootPath, '/uploads/issue')
  }

  async writeImg(imgArray, userId) {
    if (!imgArray.length) return
    let imgArr = []
    for (let i = 0; i < imgArray.length; i++) {
      let img = imgArray[i]
      let fileName = img.fileName
      let filePath = join(this.uploadsIssuePath, `/${userId}/${fileName}`)
      await fs.writeFileSync(filePath, img.bufferData, 'binary')
      imgArr.push(fileName)
    }
    return imgArr
  }

  _getImgArr(uploadImgs) {
    let arr = []
    if (!Array.isArray(uploadImgs)) {
      let md5Key = uploadImgs.md5
      let miniTypeSplit = uploadImgs.mimetype.split('/')[1]
      arr.push({
        fileName: md5Key + '.' + miniTypeSplit,
        bufferData: uploadImgs.data
      })
    } else {
      uploadImgs.forEach(item => {
        let md5Key = item.md5
        let miniTypeSplit = item.mimetype.split('/')[1]
        arr.push({
          fileName: md5Key + '.' + miniTypeSplit,
          bufferData: item.data
        })
      })
    }

    return arr
  }

  async _writeMarkdown(markdownStr, userId) {
    let fileName = crypto.randomUUID() + '.md'
    let filePath = join(this.uploadsIssuePath, `/${userId}/${fileName}`)
    await fs.writeFileSync(filePath, markdownStr, 'utf-8')
    return fileName
  }

  async addIssue(userId, model, imgs) {
    model.issueCreateUser = userId
    let m = new DefineIssueModel(model)
    let modelData = await this.getModelData()
    // 保存佐证附件
    if (imgs) {
      let processImgArr = this._getImgArr(imgs)
      let mkdir_path = join(this.uploadsIssuePath, `${userId}`)
      fs.mkdirSync(mkdir_path, {recursive: true})
      let uploadFilePathArr = await this.writeImg(processImgArr, userId)
      m.uploadImg = uploadFilePathArr
    }
    // 添加markdown
    if (model.markdownStr) {
      let markdownName = await this._writeMarkdown(model.markdownStr, userId)
      m.markdownPath = markdownName
    }
    modelData.push(m)
    await this.save(modelData)
    return '添加成功'
  }

  async getIssueList() {
    return await this.getModelData()
  }

  async findIssueById(id) {
    let modelData = await this.getModelData()
    let findData = modelData.filter(item => item.id === id)
    if (!findData.length) return null
    let findD = findData[0]
    if (findD.markdownPath) {
      findD.markdownStr = fs.readFileSync(join(this.uploadsIssuePath, `${findD.issueCreateUser}/${findD.markdownPath}`), 'utf-8')
      delete findD.markdownPath
    }

    return findD
  }
}


module.exports = {
  issueModel: IssueModel.new()
}
