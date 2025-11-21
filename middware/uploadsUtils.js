const path= require("path")
const multer = require("multer");
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

module.exports = multer({storage});
