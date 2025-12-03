/**
 * 叮一叮模块
 */
const {AUTHORIZATION} = require("../middware/Authorization");
const {ERROR, SUCCESS} = require("../_requestResponse/setResponse");
const routeName = '/ding'
const {DingModel: dingModel} = require('../model/ding/ding.model')
let userModel = require('../model/user/user.model')
const {validatorMiddleware} = require("../middware/Validator");
const ding_add_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await dingModel.saveModel(req.body, userId, req.body.toUserId)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e))
  }

}
const ding_add = {
  method: 'post',
  path: `${routeName}/add`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => (
    {
      dingMsg:{
        required: true,
        type: 'String',
        value: req.body.dingMsg
      },
      toUserId:{
        required: true,
        type: 'String',
        value: req.body.toUserId
      }
    }
  ))],
  func: ding_add_func,
  desc: '添加叮信息'
}


const ding_find_user_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await dingModel.findMyDing(userId)
    if (data.length) {
      let user = await userModel.findUserPool(data.map(item => item.fromUser))
      data.forEach(item => {
        let filterUser = user.filter(it => it.id === item.fromUser)
        if (filterUser.length) {
          item.fromUserName = filterUser[0].username
        }
      })
    }
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e))
  }
}
const ding_find_user = {
  method: 'get',
  path: `${routeName}/find`,
  midFun: [AUTHORIZATION],
  func: ding_find_user_func,
  desc: '查找用户叮信息'
}

const ding_delete_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await dingModel.deleteDing(userId, req.body)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e))
  }
}
const ding_delete = {
  method: 'post',
  path: `${routeName}/delete`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    id: {
      required: true,
      type: 'String',
      value: req.body.id
    }
  }))],
  func: ding_delete_func,
  desc: '删除叮信息'
}

module.exports = [
  ding_add,
  ding_find_user,
  ding_delete,
]
