const Base = require("../base.model");
const {resolve} = require("node:path");
const fs = require('fs')

const FileDataStruct = function (o = {}) {
  return {
    id: o.id,
    fileName: o.fileName,
    insertTime: o.insertTime,
    toUser: o.toUser,
    fromUser: o.fromUser,
  }
}

class FileModel extends Base {
  constructor() {
    super();
    this.filePath = resolve(__dirname, './file.json')
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createOrUpdate(file) {
    await this.delay(500)
    let fileModel = await this.getFileData()
    fileModel.push(file)
    await this.save(fileModel)
  }

  /**
   * @description 根据用户id,文件id 删除文件 并且删除用户文件列表数据
   * @param userId
   * @param fileId
   * @returns {Promise<void>}
   */
  async deleteFileById(userId, fileId) {
    let fileList = await this.getFileListByUserId(userId)
    if (!fileList.length) {
      throw new Error('用户列表数据不存在')
    }
    let file = fileList.filter(item => item.id === fileId)
    if (!file.length) {
      throw new Error('文件不存在')
    }
    try {
      let file_path = resolve(process.cwd() + `/uploads/${userId}/` + file[0].fileName)
      console.log('file_path', file_path)
      let isExitFile = await fs.existsSync(file_path)
      if (!isExitFile) {
        throw new Error('文件不存在')
      }
      // 注意这里! 因为上传的路由是用当前发送用户的id 作为文件夹存储的， 所以这边删除的话去删发送用户的目录里面的文件
      await fs.unlinkSync(file_path)
      let modelData = await this.getModelData()
      console.log('modelData', modelData)
      modelData = modelData.filter(item => item.id !== fileId)
      await this.save(modelData)
      return '删除成功'
    } catch (e) {
      throw new Error(e.message)
    }

  }

  async getDoubleUser(userId, request) {
    let fromUserId = request.fromUserId
    let modelData = await this.getModelData()
    // 获取当前用户发送给我的数据
    let toMeData = modelData.filter(item => item.fromUser === fromUserId && item.toUser === userId)
    // 获取我发给当前用户的数据
    let toHisData = modelData.filter(item => item.fromUser === userId && item.toUser === fromUserId)

    return {
      toMeData,
      toHisData
    }
  }


}

module.exports = {
  FileDataStruct,
  FileModel
}
