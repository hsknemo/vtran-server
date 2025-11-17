const Base = require('../base.model')
const path = require('path')
const crypto =require('crypto')
const moment = require("moment");
const fs = require("fs");
const ChunkDataModel = function (obj) {
  return {
    // 切片id 前端统一定义
    id: obj.id,
    // 切片插入时间
    insertTime: obj.insertTime || moment().format('YYYY-MM-DD HH:mm:ss'),
    // 切片是否上传完毕
    fileIsUploaded: obj.fileIsUploaded || false,
    // 切片文件路径
    chunkPathArr: [],
    // 接收者
    toUser: obj.toUser,
    // 发送者
    fromUser: obj.fromUser,
    // 切边数量
    chunkTotalLen: obj.chunkTotalLen,
    fileName: obj.fileName,
    updateTime: obj.updateTime || moment().format('YYYY-MM-DD HH:mm:ss'),
  }
}
class FileChunkModel extends Base {
  constructor() {
    super();
    this.filePath = path.resolve(__dirname, './chunk.json')
  }

  async chunkSaveAndUpdate(fileRecord) {
    let fileIsUploaded = false
    let modelData = await this.getModelData()
    let chunkRecord = modelData.filter(item => item.id === fileRecord.id)
    // 第一次记录
    if (!chunkRecord.length) {
      let chunkModel = new ChunkDataModel(fileRecord)
      chunkModel.chunkPathArr.push(fileRecord.chunkPath)
      modelData.push(chunkModel)
    } else {
      let set = new Set(chunkRecord[0].chunkPathArr)
      set.add(fileRecord.chunkPath)
      if (Number(fileRecord.chunkSliceNum) === set.size) {
        fileIsUploaded = true
      }
      modelData.forEach(item => {
        if (item.id === fileRecord.id) {
          item.chunkPathArr = Array.from(set)
          item.updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
          item.fileIsUploaded = fileIsUploaded
        }
      })
    }
    await this.save(modelData)
    return {
      fileIsUploaded,
    }
  }

  async chunkMerge(mergeConfig) {
    let modelData = await this.getModelData()
    let chunkRecord = modelData.filter(item => item.id === mergeConfig.md5Key)
    if (!chunkRecord.length) {
      throw new Error('合并文件不存在！')
    }
    if (!chunkRecord[0].fileIsUploaded) {
      throw new Error('文件上传不完整！无法合并')
    }
    let pathArray = chunkRecord[0].chunkPathArr
    // 创建用户文件夹
    let user_upload_file_path = path.join(process.cwd(), `/uploads/${mergeConfig.userId}`)
    fs.mkdirSync(`${user_upload_file_path}`, {recursive: true})
    let now = Date.now()
    try {
      let writeStream = fs.createWriteStream(user_upload_file_path + '/' + now + '_' + chunkRecord[0].fileName)

      pathArray.sort((a, b) => {
        return a.split('_')[0] - b.split('_')[0]
      })

      for (let i = 0; i < pathArray.length; i++) {
        const chunkBuffer = fs.readFileSync(pathArray[i]);
        writeStream.write(chunkBuffer); // 数据可能还在缓冲区
      }

      writeStream.end();
      return '合并成功'
    } catch (e) {
      console.log(`【error: 】${chunkRecord[0].fileName}------合并失败`)
      throw new Error('合并失败')
    }

  }
}

module.exports = FileChunkModel.new()
