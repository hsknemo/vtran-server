const {AUTHORIZATION} = require("../middware/Authorization");
const {ERROR, SUCCESS} = require("../_requestResponse/setResponse");
const {vesrionModel} = require("../model/version/version.model");
const {validatorMiddleware} = require("../middware/Validator");


const currentRoute = '/version'

const version_list_func = async (req, res) => {
  try {
    let data = await vesrionModel.getVersionList()
    return res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}

const version_list = {
  method: 'get',
  path: `${currentRoute}/list`,
  midFun: [AUTHORIZATION],
  func: version_list_func,
  desc: '获取版本列表',
}

const save_version_func = async (req, res) => {
  try {
    let data = await vesrionModel.saveVersion(req.body)
    return res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const save_version = {
  method: 'post',
  path: `${currentRoute}/save`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    versionTitle: {
      type: 'String',
      required: true,
      value: req.body.versionTitle,
      message: '请输入版本号'
    },
    versionList: {
      type: 'Array',
      required: true,
      message: '请输入版本内容',
      value: req.body.versionList,
    }
  }))],
  func: save_version_func,
  desc: '保存版本'
}

module.exports = [
  version_list,
  save_version,
]
