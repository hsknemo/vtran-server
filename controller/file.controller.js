const {SUCCESS, ERROR} = require("../_requestResponse/setResponse");
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const routeName = '/file'

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
const writeFile = (file, fileName) => {
  console.log(process.cwd())
  fs.writeFileSync(path.resolve(process.cwd(), `uploads/${fileName}`), file.data, 'binary')
}
const file_send_func = async (req, res) => {
  try {
    if (!req.files.file) {
      throw new Error('文件为空')
    }
    if (Array.isArray(req.files.file)) {
      req.files.file.forEach((item, index) => {
         writeFile(item, req.body.name[index])
      })
    } else {
      writeFile(req.files.file, req.body.name)
    }

    res.send(SUCCESS(req.files))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const upload = multer({ storage });
const file_send = {
  method: 'post',
  path: `${routeName}/send/user`,
  midFun: upload.array('file', 5),
  func: file_send_func,
  desc: '接收前台文件发送到具体用户'
}
module.exports = [
  file_send,
]
