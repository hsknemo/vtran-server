const {SUCCESS, ERROR} = require("../_requestResponse/setResponse");
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { FileModel, FileDataStruct } = require("../model/file/file.model");
const moment = require("moment");
const {AUTHORIZATION} = require("../middware/Authorization");
const fileModel = FileModel.new()
const userModel = require('../model/user/user.model')
const routeName = '/file'
const getRandomStr = () => {
  let str = `asasffvkvsrqeqwcasdad`
  return str.split('').sort(() => Math.random() - 0.5).join('')
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 指定文件存储的目标目录
    cb(null, path.join(__dirname, '/uploads'));
  },
  filename: function (req, file, cb) {
    // 自定义文件名
    cb(null, Date.now() + '-' + file.originalname);
  },
});
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
  fs.writeFileSync(writeFilePath, file.data, 'binary')


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
      writeFile(req.files.file, Date.now() + '-' + getRandomStr() + req.body.name, req.body)
    }

    res.send(SUCCESS(req.files))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const upload = multer({storage});
const file_send = {
  method: 'post',
  path: `${routeName}/send/user`,
  midFun: upload.array('file', 5),
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
module.exports = [
  file_send,
  file_get
]
