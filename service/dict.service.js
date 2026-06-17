const DictModel = require('../model/dict.model')
const crypto = require('crypto')

let dictModel = new DictModel()
class DictService {
  constructor(props) {
    this.dictModel = dictModel
  }

  async addDict(formDict) {
    formDict.id = crypto.randomUUID()
    return await this.dictModel.addDict(formDict)
  }

  async dictList(filterProp = {}) {
    let pageConfig = typeof filterProp.page === 'object' && filterProp.page !== null ? filterProp.page : {}
    filterProp.page = Number(filterProp.pageNum || pageConfig.pageNum || filterProp.page || 1)
    filterProp.pageSize = Number(filterProp.pageSize || pageConfig.pageSize || 10)

    return await this.dictModel.dictList(filterProp)
  }


}

module.exports = DictService
