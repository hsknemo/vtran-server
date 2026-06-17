const {AUTHORIZATION} = require("../middware/Authorization");
const {validatorMiddleware} = require("../middware/Validator");
const DictService = require("../service/dict.service");
const {ERROR, SUCCESS} = require("../_requestResponse/setResponse");
const routeName = 'dict'
const dictService = new DictService()
const addFunc = async (req, res) => {
  try {
    let dict = req.body
    dict.userId = req.tokenResolveResult.id
    let d = await dictService.addDict(dict)
    res.send(SUCCESS(d))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const dictAdd = {
  method: 'post',
  path: `/${routeName}/add`,
  func: addFunc,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    name: {
      type: 'String',
      required: true,
      message: '字典名称必填',
      value: req.body.name
    },
    code: {
      type: 'String',
      required: true,
      message: '字典编码必填',
      value: req.body.code
    },
  }))]
}

const dictListFunc = async (req, res) => {
  try {
    let filterProp = req.body
    let d = await dictService.dictList(filterProp)
    res.send(SUCCESS(d))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const dictList = {
  method: 'post',
  path: `/${routeName}/list`,
  func: dictListFunc,
  midFun: [AUTHORIZATION]
}
module.exports = [
  dictAdd,
  dictList,
]
