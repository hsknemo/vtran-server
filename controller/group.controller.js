/**
 * 群组模块
 */
const { ERROR, SUCCESS} = require("../_requestResponse/setResponse");
const routeName = '/group'
const GroupModel = require('../model/group/group.model')
const userModel = require('../model/user/user.model')
const {validatorMiddleware} = require("../middware/Validator");
const {AUTHORIZATION} = require("../middware/Authorization");
const eventEmitter = require("../Event");
const {Chat_Group_Add_User_Event} = require("../Socket/type/socket.event.type");
const groupModel = GroupModel.new()
const group_create_func = async (req, res) => {
  try {
    let groupData = req.body
    let data = await groupModel.createGroupData(groupData)
    if (groupData.userList) {
      eventEmitter.emit(Chat_Group_Add_User_Event, groupData)
    }
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const group_create = {
  method: 'post',
  path: `${routeName}/create`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    name: {
      required: true,
      type: 'String',
      value: req.body.name
    },
    createUserId: {
      required: true,
      type: 'String',
      value: req.body.createUserId
    }
  }))],
  func: group_create_func,
  desc: '创建群'
}

const group_find_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await groupModel.findOwnInnerGroup(userId)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const group_find = {
  method: 'get',
  path: `${routeName}/find`,
  midFun: [AUTHORIZATION],
  func: group_find_func,
  desc: '查询用户群'
}

const group_find_user_list_func = async (req, res) => {
  try {
    let groupId = req.query.groupId
    let data = await groupModel.findGroupById(groupId)
    let u = []
    if (data) {
      u = await userModel.findUserPool(data.userList)
    }
    // 查找用户列表
    res.send(SUCCESS(u))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}

const group_find_user_list = {
  method: 'get',
  path: `${routeName}/find/userList`,
  midFun: [AUTHORIZATION],
  func: group_find_user_list_func,
  desc: '查询群用户列表'
}


const group_add_user_func = async (req, res) => {
  try {
    let groupId = req.body.groupId
    let userId = req.body.userId
    let data = await groupModel.addUserToGroup(groupId, userId)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const group_add_user = {
  method: 'post',
  path: `${routeName}/add/user`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    groupId: {
      required: true,
      type: 'String',
      value: req.body.groupId
    },
    userId: {
      required: true,
      type: 'String',
      value: req.body.userId
    }
  }))],
  func: group_add_user_func,
  desc: '添加用户到群'
}

module.exports = [
  group_create,
  group_find,
  group_find_user_list,
  group_add_user,
]
