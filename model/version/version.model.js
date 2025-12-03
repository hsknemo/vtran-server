/**
 *  版本发布层数据
 */

const BaseModel = require('../base.model')
const {resolve} = require("node:path");
const crypto = require('crypto')
const moment = require("moment");
const DefineVersionModel = function (model) {
  return {
    id: model.id || crypto.randomUUID(),
    insertTime: model.insertTime || moment().format('YYYY-MM-DD HH:mm:ss'),
    versionTitle: model.versionTitle,
    versionList: model.versionList || [],
  }
}


class VersionModel extends BaseModel {
  constructor() {
    super();
    this.filePath = resolve(__dirname, './version.json')
  }

  async getVersionList() {
    let modelData = await this.getModelData()
    if (modelData.length) {
      modelData.sort((a, b) => {
        return moment(b.insertTime).unix() - moment(a.insertTime).unix()
      })
    }
    return modelData
  }

  async saveVersion(versionModel) {
    let model = new DefineVersionModel(versionModel)
    let modelData = await this.getModelData()
    modelData.push(model)
    await this.save(modelData)
    return '保存成功'
  }
}

module.exports = {
  vesrionModel: VersionModel.new()
}
