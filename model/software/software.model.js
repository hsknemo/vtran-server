/**
 *  软件层数据
 */

const Base = require('../base.model');
const {resolve, join} = require("node:path");
const moment = require("moment");
const crypto = require("crypto");
const DefineSoftwareModel = function (obj) {
  return {
    id: crypto.randomUUID(),
    insertTime: obj.insertTime || moment().format('YYYY-MM-DD HH:mm:ss'),
    appUploadUser: obj.appUploadUser,
    appName: obj.appName,
    appDesc: obj.appDesc,
    appCategory: obj.appCategory,
    appRealName: obj.appRealName,
  }
}
class SoftwareModel extends Base {
  constructor() {
    super();
    this.filePath = resolve(__dirname, './software.json')
    this.fileStorePath = join(this.rootPath, '/uploads/uploadApp')
  }

  async getSoftwareList(query = {}) {
    let modelData = await this.getModelData()
    if (query.appName) {
      return modelData.filter(item => item.appName.includes(query.appName))
    }
    return modelData
  }

  /**
   *
   * @param appData DefineSoftwareModel
   * @returns {Promise<string>}
   */
  async uploadApp(appData) {
    try {
      let modelData = await this.getModelData()
      modelData.push(appData)
      await this.save(modelData)
      return '上架成功'
    } catch (e) {
      throw new Error(e.message)
    }
  }
}


module.exports = {
  softwareModel: SoftwareModel.new(),
  DefineSoftwareModel,
}
