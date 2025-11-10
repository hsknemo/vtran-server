const {AUTHORIZATION} = require("../middware/Authorization");
const {validatorMiddleware} = require("../middware/Validator");
const {ERROR, SUCCESS} = require("../_requestResponse/setResponse");
const routeName = '/note'
const {NoteModel} = require('../model/note/note.model')
const noteModel = NoteModel.new()
const note_get_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await noteModel.findNotePool(userId)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const note_get = {
  method: 'get',
  path: `${routeName}/list`,
  midFun: [AUTHORIZATION],
  func: note_get_func,
  desc: '获取用户笔记列表'
}

const note_save_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await noteModel.saveNoteModel(userId, req.body)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}

const note_save = {
  method: 'post',
  path: `${routeName}/save`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    name: {
      required: true,
      type: 'String',
      value: req.body.name
    },
    content: {
      required: true,
      type: 'String',
      value: req.body.content
    }
  }))],
  func: note_save_func,
  desc: '保存用户笔记'
}

/**
 * 返回流式文件
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const note_get_one_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let stream = await noteModel.findNoteByFileName(userId, req.body.fileName)
    console.log(stream)
    res.setHeader('Transfer-Encoding', 'chunked'); // 分块传输
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    stream.pipe(res);
    stream.on('error', (err) => {
      console.log(err)
      // 错误处理
      res.status(500).json(ERROR('File not found or read error'));
    })
    res.on('close', () => {
      if (!stream.destroyed) {
        stream.destroy(); // 停止读取，避免资源浪费
      }
    });
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const note_get_one = {
  method: 'post',
  path: `${routeName}/one`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    fileName: {
      required: true,
      type: 'String',
      value: req.body.fileName
    }
  }))],
  func: note_get_one_func,
}


const note_update_func = async (req, res) => {
  try {
    let userId = req.Token解析结果.id
    let data = await noteModel.updateNoteModel(userId, req.body)
    res.send(SUCCESS(data))
  } catch (e) {
    res.send(ERROR(e.message))
  }
}
const note_update = {
  method: 'post',
  path: `${routeName}/update`,
  midFun: [AUTHORIZATION, validatorMiddleware(req => ({
    id: {
      required: true,
      type: 'String',
      value: req.body.id
    },
    content: {
      required: true,
      type: 'String',
      value: req.body.content
    },
    fileName: {
      required: true,
      type: 'String',
      value: req.body.fileName
    }
  }))],
  func: note_update_func,
}

module.exports = [
  note_get,
  note_save,
  note_get_one,
  note_update,
]
