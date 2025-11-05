const fs = require('fs')

module.exports = class Base {
  constructor() {
    this.filePath = null
    this.modelData = []
  }

  static new() {
    return new this()
  }

  getFileData() {
    let d = fs.readFileSync(this.filePath, 'utf-8')
    return JSON.parse(d.toString())
  }

  async getModelData() {
    this.modelData = await this.getFileData()
    return this.modelData
  }

  /**
   * 根据id 获取文件列表
   * @param id
   * @returns {Promise<*>}
   */
  async getFileListByUserId(id) {
    let fileList = await this.getFileData()
    return fileList.filter(item => item.toUser === id)
  }

  async getFileListByFromUserId(id) {
    let fileList = await this.getFileData()
    return fileList.filter(item => item.fromUser === id)
  }

  save(modelData) {
    fs.writeFileSync(this.filePath, JSON.stringify(modelData, null, 2), 'utf-8')
  }



}
