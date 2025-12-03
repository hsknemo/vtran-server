/**
 * 商店模块
 */
const {SUCCESS, ERROR} = require("../_requestResponse/setResponse");
const {AUTHORIZATION} = require("../middware/Authorization");
const {softwareModel, DefineSoftwareModel} = require("../model/software/software.model");
const path = require("path");
const fileChunkModel = require("../model/fileChunk/fileChunk.model");
const {validatorMiddleware} = require("../middware/Validator");
const userModel = require("../model/user/user.model");
const { FileModel } = require("../model/file/file.model");
const {saveFileChunk, sendFileDownloadResponse} = require("../utils/Js_Tool");
const fileModel = FileModel.new()
const routeName = '/software'
const software_list_func = async (req, res) => {
  try {
    let softWareList = await softwareModel.getSoftwareList({
      appName: req.query.appName
    })
    if (softWareList) {
      softWareList.sort((a, b) => {
        return new Date(b.insertTime).getTime() - new Date(a.insertTime).getTime()
      })

      let user = await userModel.findUserPool(softWareList.map(item => item.appUploadUser))
      softWareList.forEach(item => {
        let filterUser = user.filter(it => it.id === item.appUploadUser)
        if (filterUser.length) {
          item.fromUserName = filterUser[0].username
        }
      })
    }
    res.send(SUCCESS(softWareList))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const software_list = {
  method: 'get',
  path: `${routeName}/list`,
  midFun: [AUTHORIZATION],
  func: software_list_func,
  desc: '获取商店文件'
}


const software_upload_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let md5Key = req.body.md5Key
    let chunk_index = req.body.index
    let chunk = req.files.chunk
    let fileTotalLen = req.body.fileTotalLen
    let chunkSliceNum = req.body.chunkSliceNum
    let fileName = req.body.fileName
    let time = Date.now()
    // const file_path = path.join(process.cwd(), `/uploads/chunk/${userId}`)
    // fs.mkdirSync(file_path, {recursive: true})
    // fs.mkdirSync(file_path + `/${md5Key}`, {recursive: true})
    // let lastPosition = file_path + `/${md5Key}`
    // const chunk_write_path = path.join(lastPosition, `/${chunk_index}_${md5Key}_${time}_uploadApp`)
    // fs.writeFileSync(chunk_write_path, chunk.data, 'binary')
    // 使用工具函数保存切片
    const uploadBasePath = path.join(process.cwd(), "/uploads/chunk");
    const chunkWritePath = saveFileChunk({
      baseDir: uploadBasePath,
      md5Key,
      userId,
      chunkIndex: chunk_index,
      chunkData: chunk.data,
      time,
      chunkLastPrefix: '_uploadApp'
    });
    // 记录切片数据上传状态
    let loaded = await fileChunkModel.chunkSaveAndUpdate({
      id: md5Key,
      toUser: userId,
      fromUser: userId,
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


const software_upload = {
  method: 'post',
  path: `${routeName}/upload`,
  midFun: [AUTHORIZATION],
  func: software_upload_func,
  desc: '切片上传app'
}

const software_add_func = async (req, res) => {
  try {
    let md5Key = req.body.md5Key
    let userId = req.Token解析结果.id
    let file = await fileChunkModel.chunkMerge({
      md5Key, userId, fromUserId: userId
    }, path.join(softwareModel.fileStorePath, `/${userId}`))
    // 写入 发送文件数据
    let data = await softwareModel.uploadApp(new DefineSoftwareModel({
      appName: req.body.appName,
      appSize: req.body.appSize,
      appDesc: req.body.appDesc,
      appUploadUser: userId,
      appRealName: file.fileName,
      appCategory: req.body.appCategory,
    }))

    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const software_record_add = {
  method: 'post',
  path: `${routeName}/recordAdd`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    appName: {
      type: 'String',
      required: true,
      message: '请输入app名称',
      value: req.body.appName
    },
    appSize: {
      type: 'Number',
      required: true,
      message: '请输入app大小',
      value: req.body.appSize
    },
    appCategory: {
      type: 'String',
      required: true,
      message: '请输入app分类',
      value: req.body.appCategory
    }
  }))],
  func: software_add_func,
  desc: '记录上架app'
}

const software_download_func = async (req, res) => {
  try {
    let downloadFilePath = path.join(process.cwd(), `/uploads/uploadApp/${req.body.uploadUserId}/${req.body.fileName}`)
    let stream = await fileModel.downloadFile(req.body, downloadFilePath)
    let cutArr = req.body.fileName.split('_').slice(1)
    // 针对用户的名称下划线处理
    const fileStr = cutArr.length > 1 ? cutArr.join('_') : cutArr.join('');
    sendFileDownloadResponse(res, stream, fileStr);
  } catch (e) {
    res.status(500).send(ERROR(e.message))
  }
}

const software_download = {
  method: 'post',
  path: `${routeName}/download`,
  midFun: [AUTHORIZATION],
  func: software_download_func,
}

module.exports = [
  software_list,
  software_upload,
  software_record_add,
  software_download,
]
