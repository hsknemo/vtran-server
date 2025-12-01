const {issueModel} = require("../model/issue/issue.model");
const {SUCCESS, ERROR} = require("../_requestResponse/setResponse");
const {validatorMiddleware} = require("../middware/Validator");
const {AUTHORIZATION} = require("../middware/Authorization");
const routeName = '/issue'

const issue_list_func = async (req, res) => {
  try {
    let data = await issueModel.getIssueList()
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const issue_list = {
  method: 'get',
  path: `${routeName}/list`,
  midFun: [AUTHORIZATION],
  func: issue_list_func,
  desc: '获取issue列表'
}

const issue_add_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await issueModel.addIssue(userId, req.body, req.files?.imgs)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const issue_add = {
  method: 'post',
  path: `${routeName}/add`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    // 描述内容
    content: {
      required: true,
      type: 'String',
      value: req.body.content
    },
    // 是否有markdown 传递过来
    markdownStr: {
      type: 'String',
      value: req.body.markdownStr
    },
    // issue类型
    issueType: {
      required: true,
      type: 'String',
      value: req.body.issueType
    }
  }))],
  func: issue_add_func,
  desc: '添加issue'
}

const issue_find_func = async (req, res) => {
  try {
    let data = await issueModel.findIssueById(req.body.id)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const issue_find = {
  method: 'post',
  path: `${routeName}/find`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    id: {
      required: true,
      type: 'String',
      value: req.body.id
    }
  }))],
  func: issue_find_func,
}

const issue_comments_add_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await issueModel.addComments(userId, req.body)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const issue_comments_add = {
  method: 'post',
  path: `${routeName}/comments/add`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    issueId: {
      required: true,
      type: 'String',
      value: req.body.issueId
    },
    content: {
      required: true,
      type: 'String',
      value: req.body.content
    }
  }))],
  func: issue_comments_add_func,
}


const issue_comments_find_func = async (req, res) => {
  try {
    let data = await issueModel.findComments(req.body.issueId)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const issue_comments_find = {
  method: 'post',
  path: `${routeName}/comments/find`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    issueId: {
      required: true,
      type: 'String',
      value: req.body.issueId
    }
  }))],
  func: issue_comments_find_func,
}

const issue_comments_reply_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await issueModel.replyComments(userId, req.body)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const issue_comments_reply = {
  method: 'post',
  path: `${routeName}/comments/reply`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    issueId: {
      required: true,
      type: 'String',
      value: req.body.issueId
    },
    id:{
      required: true,
      type: 'String',
      value: req.body.id
    },
    content: {
      required: true,
      type: 'String',
      value: req.body.content
    }
  }))],
  func: issue_comments_reply_func
}
module.exports = [
  issue_list,
  issue_add,
  issue_find,
  issue_comments_add,
  issue_comments_find,
  issue_comments_reply,
]
