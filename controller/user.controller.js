const {SUCCESS, ERROR} = require("../_requestResponse/setResponse");
const userModel = require('../model/user/user.model')
const {createJwtToken, secretKey, AUTHORIZATION} = require("../middware/Authorization");
const routeName = '/user'
const eventEmitter = require('../Event/index')
const userSocketService = require('../Socket/user.socket.service')

const ReturnTokenUser = (res, data) => {
  let token = createJwtToken(data, secretKey, '24h')
  res.header({
    'Authorization': token
  }).send(SUCCESS({
    token,
    data
  }))
}

const addUser_func = async (req, res) => {
  try {
    let user = req.body
    let data = await userModel.addUser(user)
    ReturnTokenUser(res, data)
  } catch (e) {
    console.log('进来', e)
    res.send(ERROR(e.message))
  }
}
const addUser = {
  method: 'post',
  path: `${routeName}/add`,
  func: addUser_func,
  desc: '添加用户',
}

const updateUser_func = async (req, res) => {
  try {
    let user = req.body
    let data = await userModel.updateUser(user)
    res.send(SUCCESS(data))
  } catch (e) {
    console.log('进来', e)
    res.send(ERROR(e.message))
  }
}
const updateUser = {
  method: 'post',
  path: `${routeName}/update`,
  func: updateUser_func,
  desc: '更新用户',
}



const loginUser_func = async (req, res) => {
  try {
    let username = req.body.username
    let data = await userModel.findUserByName(username)
    ReturnTokenUser(res, data)
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const loginUser = {
  method: 'post',
  path: `${routeName}/login`,
  func: loginUser_func
}

const getUserAll_func = async (req, res) => {
  try {
    let user = req.Token解析结果
    let data = await userModel.findUserAll(user)
    res.send(SUCCESS(data))
  } catch (e) {
    console.log('进来', e)
    res.send(ERROR(e.message))
  }
}
const getUserAll = {
  method: 'get',
  path: `${routeName}/online`,
  midFun: [AUTHORIZATION],
  func: getUserAll_func,
  desc: '获取用户列表',
}


module.exports = [
  addUser,
  loginUser,
  updateUser,
  getUserAll,
]
