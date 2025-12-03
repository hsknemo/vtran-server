/**
 * 文件上传
 */
const {SUCCESS, ERROR} = require("../_requestResponse/setResponse");
const path = require('path')
const fs = require('fs')
const upload = require("../middware/uploadsUtils");
const { FileModel, FileDataStruct } = require("../model/file/file.model");
const moment = require("moment");
const {AUTHORIZATION} = require("../middware/Authorization");
const fileModel = FileModel.new()
const userModel = require('../model/user/user.model')
const eventEmitter = require("../Event");
const {PROFILE_MESSAGE_EVENT} = require("../Socket/type/socket.event.type");
const fileChunkModel = require("../model/fileChunk/fileChunk.model")
const {validatorMiddleware} = require("../middware/Validator");
const {saveFileChunk, sendFileDownloadResponse} = require("../utils/Js_Tool");
const routeName = '/file'
const getRandomStr = () => {
  let str = `asasffvkvsrqeqwcasdad`
  return str.split('').sort(() => Math.random() - 0.5).join('')
}

const writeFile = async (file, fileName, reqBody) => {
  let basePath = path.resolve(process.cwd(), `uploads/`)
  // 获取接收人id
  let userId = reqBody.toUserId
  // 获取发送人id
  let fromUserId = reqBody.fromUserId

  await fileModel.createOrUpdate(new FileDataStruct({
    id: crypto.randomUUID(),
    fileName: fileName,
    toUser: userId,
    fromUser: fromUserId,
    insertTime: moment().format('YYYY-MM-DD HH:mm:ss'),
  }))

  // 创建用户文件夹
  fs.mkdirSync(`${basePath}/${userId}`, {recursive: true})
  let writeFilePath = `${basePath}/${userId}/${fileName}`
  // 写入用户文件
  fs.writeFile(writeFilePath, file.data, 'binary', (error, result) => {
    if (!error) {
      eventEmitter.emit(PROFILE_MESSAGE_EVENT, {
        user: {
          id: userId
        }
      })
    }
  })
}
const file_send_func = async (req, res) => {
  try {
    if (!req.files.file) {
      throw new Error('文件为空')
    }
    if (Array.isArray(req.files.file)) {
      // 名称拼接规则 时间戳加随机字符串
      req.files.file.forEach((item, index) => {
        writeFile(item, Date.now() + '-' + getRandomStr() + '-' + req.body.name[index], req.body)
      })
    } else {
      await writeFile(req.files.file, Date.now() + '-' + getRandomStr() + req.body.name, req.body)
    }


    // eventEmitter.emit(PROFILE_MESSAGE_EVENT, {
    //   user: {
    //     id: req.body.toUserId
    //   }
    // })

    res.send(SUCCESS(req.files))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const file_send = {
  method: 'post',
  path: `${routeName}/send/user`,
  midFun: [AUTHORIZATION],
  func: file_send_func,
  desc: '接收前台文件发送到具体用户'
}

const getFile_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let fileList = await fileModel.getFileListByUserId(userId)
    if (fileList.length) {
      for (let i = 0; i < fileList.length; i++) {
        let item = fileList[i]
        let user = await userModel.findUserById(item.fromUser)
        if (user.length) {
          fileList[i].fromUserName = user[0].username
        }
      }
    }
    fileList.sort((a, b) => {
      return new Date(b.insertTime).getTime() - new Date(a.insertTime).getTime()
    })
    res.send(SUCCESS(fileList))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const file_get = {
  method: 'get',
  path: `${routeName}/list`,
  midFun: [AUTHORIZATION],
  func: getFile_func,
  desc: '获取用户文件列表'
}

const file_delete_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let fileId = req.body.fileId
    let data = await fileModel.deleteFileById(userId, fileId)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const file_delete = {
  method: 'post',
  path: `${routeName}/delete`,
  midFun: [AUTHORIZATION],
  func: file_delete_func,
  desc: '删除用户文件'
}


const getFile_func_mine = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let fileList = await fileModel.getFileListByFromUserId(userId)
    if (fileList.length) {
      for (let i = 0; i < fileList.length; i++) {
        let item = fileList[i]
        let user = await userModel.findUserById(item.toUser)
        if (user.length) {
          fileList[i].toUserName = user[0].username
        }
      }
    }
    fileList.sort((a, b) => {
      return new Date(b.insertTime).getTime() - new Date(a.insertTime).getTime()
    })
    res.send(SUCCESS(fileList))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const file_get_mine = {
  method: 'get',
  path: `${routeName}/mine/list`,
  midFun: [AUTHORIZATION],
  func: getFile_func_mine,
  desc: '获取当前用户发送的文件列表'
}


const file_get_double_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let fileList = await fileModel.getDoubleUser(userId, req.body)
    res.send(SUCCESS(fileList))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}

const file_get_double = {
  method: 'post',
  path: `${routeName}/doubleUser`,
  midFun: [AUTHORIZATION],
  func: file_get_double_func,
  desc: '获取聊天双方用户发送和接收的文件列表'
}

const file_chunk_upload_func = async (req, res) => {
  try {
    let md5Key = req.body.md5Key
    let userId = req.body.toUserId
    let chunk_index = req.body.index
    let chunk = req.files.chunk
    let fromUserId = req.body.fromUserId
    let fileTotalLen = req.body.fileTotalLen
    let chunkSliceNum = req.body.chunkSliceNum
    let fileName = req.body.fileName

    let time = Date.now()

    const uploadBasePath = path.join(process.cwd(), "/uploads/chunk");
    const chunkWritePath = saveFileChunk({
      baseDir: uploadBasePath,
      md5Key,
      userId,
      chunkIndex: chunk_index,
      chunkData: chunk.data,
      time,
    });

    // 记录切片数据上传状态
    let loaded = await fileChunkModel.chunkSaveAndUpdate({
      id: md5Key,
      toUser: userId,
      fromUser: fromUserId,
      chunkPath: chunkWritePath,
      chunkTotalLen: fileTotalLen,
      chunkSliceNum,
      fileName,
    })
    res.send(SUCCESS({
      chunk_index,
      md5Key,
      time,
      isUploaded: loaded.fileIsUploaded
    }))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const file_chunk_upload = {
  method: 'post',
  path: `${routeName}/chunk`,
  desc: '单文件切片上传',
  midFun: [AUTHORIZATION],
  func: file_chunk_upload_func,
}


const file_chunk_merge_func = async (req, res) => {
  try {
    let md5Key = req.body.md5Key
    let userId = req.body.toUserId
    let fromUserId = req.body.fromUserId
    let file = await fileChunkModel.chunkMerge({
      md5Key, userId, fromUserId
    })
    // 写入 发送文件数据
    await fileModel.createOrUpdate(new FileDataStruct({
      id: crypto.randomUUID(),
      fileName: file.fileName,
      toUser: userId,
      fromUser: fromUserId,
      insertTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    }))
    // 将新文件通知到用户
    eventEmitter.emit(PROFILE_MESSAGE_EVENT, {
      user: {
        id: userId
      }
    })
    res.send(SUCCESS(file.msg))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const file_chunk_merge = {
  method: 'post',
  path: `${routeName}/chunk/merge`,
  midFun: [AUTHORIZATION],
  desc: '单文件切片合并',
  func: file_chunk_merge_func
}


const file_download_func = async (req, res) => {
  try {
    let stream = await fileModel.downloadFile(req.body)
    let cutArr = req.body.fileName.split('_').slice(1)
    // 针对用户的名称下划线处理
    const fileStr = cutArr.length > 1 ? cutArr.join('_') : cutArr.join('');
    sendFileDownloadResponse(res, stream, fileStr);
  } catch (e) {
    res.status(500).send(ERROR(e.message))
  }
}

const file_download = {
  method: 'post',
  path: `${routeName}/download`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    fileId: {
      type: 'String',
      required: true,
      message: 'fileId不能为空',
      value: req.body.fileId
    },
    fileName: {
      type: 'String',
      required: true,
      message: 'fileName不能为空',
      value: req.body.fileName
    }
  }))],
  desc: '文件下载',
  func: file_download_func,
}

module.exports = [
  // file_send,
  file_get,
  file_delete,
  file_get_mine,
  file_get_double,
  file_chunk_upload,
  file_chunk_merge,
  file_download,
]
