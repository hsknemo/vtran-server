const {FileModel} = require("../model/file.model");

class FileService {
  constructor() {
    this.fileModel = new FileModel()

  }

  async getFileListByUserId(userId, body) {
    return await this.fileModel.getFileListByUserId(userId, body)
  }

  async getMineSendFileList(userId, body) {
    return await this.fileModel.getMineSendFileList(userId, body)
  }


}

module.exports = new FileService()
