const {FileModel} = require("../model/file.model");

class FileService {
  constructor() {
    this.fileModel = new FileModel()

  }

  // 获取我发送的文件列表
  async getFileListByUserId(userId, body) {
    return await this.fileModel.getFileListByUserId(userId, body)
  }
  // 获取发送给我的文件列表
  async getMineSendFileList(userId, body) {
    return await this.fileModel.getMineSendFileList(userId, body)
  }
  // 添加文件发送记录
  async addRecord(form) {
    return await this.fileModel.addRecord(form)
  }

}

module.exports = new FileService()
