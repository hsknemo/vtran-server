/**
 * 标签模块
 */
const { AUTHORIZATION } = require("../middware/Authorization");
const { validatorMiddleware } = require("../middware/Validator");
const { ERROR, SUCCESS } = require("../_requestResponse/setResponse");
const fs = require("fs");
const routeName = "/note";
const { NoteModel } = require("../model/note/note.model");
const userModel = require("../model/user/user.model");
const noteModel = NoteModel.new();
const note_get_func = async (req, res) => {
  try {
    let userId = req.tokenResolveResult.id;
    let data = await noteModel.findNotePool(userId);
    res.send(SUCCESS(data));
  } catch (e) {
    res.send(ERROR(e.message));
  }
};
const note_get = {
  method: "get",
  path: `${routeName}/list`,
  midFun: [AUTHORIZATION],
  func: note_get_func,
  desc: "获取用户笔记列表",
};

const note_save_func = async (req, res) => {
  try {
    let userId = req.tokenResolveResult.id;
    let data = await noteModel.saveNoteModel(userId, req.body);
    res.send(SUCCESS(data));
  } catch (e) {
    res.send(ERROR(e.message));
  }
};

const note_save = {
  method: "post",
  path: `${routeName}/save`,
  midFun: [
    AUTHORIZATION,
    validatorMiddleware((req) => ({
      name: {
        required: true,
        type: "String",
        value: req.body.name,
      },
      content: {
        required: true,
        type: "String",
        value: req.body.content,
      },
    })),
  ],
  func: note_save_func,
  desc: "保存用户笔记",
};

/**
 * 返回流式文件
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const note_get_one_func = async (req, res) => {
  try {
    let loginUserId = req.tokenResolveResult.id;
    let ownerUserId = req.body.userId;
    let fileName = req.body.fileName;

    // 兼容前端未传或传错 userId：优先本人，其次按公开便签反查分享人
    if (!ownerUserId) {
      let ownFile = await noteModel.hasFile(loginUserId, fileName);
      if (ownFile && ownFile.isHasFile) {
        ownerUserId = loginUserId;
      } else {
        ownerUserId = await noteModel.findSearchableOwnerByFileName(fileName);
      }
    }

    if (!ownerUserId) {
      throw new Error("文件不存在");
    }

    // 查看他人便签时，必须是公开便签
    if (ownerUserId !== loginUserId) {
      let isSearchable = await noteModel.isUserSearchableNote(
        ownerUserId,
        fileName,
      );
      if (!isSearchable) {
        throw new Error("该便签不存在或未公开");
      }
    }

    let stream = await noteModel.findNoteByFileName(ownerUserId, fileName);

    res.setHeader("Transfer-Encoding", "chunked"); // 分块传输
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Accept-Ranges", "bytes");

    stream.pipe(res);
    stream.on("error", (err) => {
      // 错误处理
      res.status(500).json(ERROR("File not found or read error"));
    });
    res.on("close", () => {
      if (!stream.destroyed) {
        stream.destroy(); // 停止读取，避免资源浪费
      }
    });
  } catch (e) {
    res.send(ERROR(e.message));
  }
};
const note_get_one = {
  method: "post",
  path: `${routeName}/one`,
  midFun: [
    AUTHORIZATION,
    validatorMiddleware((req) => ({
      fileName: {
        required: true,
        type: "String",
        value: req.body.fileName,
      },
      userId: {
        required: false,
        type: "String",
        value: req.body.userId,
      },
    })),
  ],
  func: note_get_one_func,
};

const note_update_func = async (req, res) => {
  try {
    let userId = req.tokenResolveResult.id;
    let data = await noteModel.updateNoteModel(userId, req.body);
    res.send(SUCCESS(data));
  } catch (e) {
    res.send(ERROR(e.message));
  }
};
const note_update = {
  method: "post",
  path: `${routeName}/update`,
  midFun: [
    AUTHORIZATION,
    validatorMiddleware((req) => ({
      id: {
        required: true,
        type: "String",
        value: req.body.id,
      },
      content: {
        required: true,
        type: "String",
        value: req.body.content,
      },
      fileName: {
        required: true,
        type: "String",
        value: req.body.fileName,
      },
    })),
  ],
  func: note_update_func,
};

const note_switch_searchable_func = async (req, res) => {
  try {
    let userId = req.tokenResolveResult.id;
    let data = await noteModel.updateNoteSearchable(userId, req.body);
    res.send(SUCCESS(data));
  } catch (e) {
    res.send(ERROR(e.message));
  }
};
const note_switch_searchable = {
  method: "post",
  path: `${routeName}/searchable/update`,
  midFun: [
    AUTHORIZATION,
    validatorMiddleware((req) => ({
      id: {
        required: true,
        type: "String",
        value: req.body.id,
      },
      searchable: {
        required: true,
        type: "Boolean",
        value: req.body.searchable,
      },
    })),
  ],
  func: note_switch_searchable_func,
  desc: "更新便签可检索状态",
};

const note_searchable_list_func = async (req, res) => {
  try {
    let data = await noteModel.findSearchableNotePool();
    let users = await userModel.getUser();
    let userMap = {};
    users.forEach((item) => {
      userMap[item.id] = item.username || item.id;
    });
    let withSharedUser = data.map((item) => ({
      ...item,
      sharedBy: userMap[item.userId] || item.userId,
    }));
    res.send(SUCCESS(withSharedUser));
  } catch (e) {
    res.send(ERROR(e.message));
  }
};
const note_searchable_list = {
  method: "get",
  path: `${routeName}/searchable/list`,
  midFun: [AUTHORIZATION],
  func: note_searchable_list_func,
  desc: "获取可检索便签列表",
};

const note_delete_func = async (req, res) => {
  try {
    let userId = req.tokenResolveResult.id;
    let data = await noteModel.deleteNoteModel(userId, req.body);
    res.send(SUCCESS(data));
  } catch (e) {
    res.send(ERROR(e.message));
  }
};
const note_delete = {
  method: "post",
  path: `${routeName}/delete`,
  midFun: [
    AUTHORIZATION,
    validatorMiddleware((req) => ({
      id: {
        required: true,
        type: "String",
        value: req.body.id,
      },
      fileName: {
        required: true,
        type: "String",
        value: req.body.fileName,
      },
    })),
  ],
  func: note_delete_func,
};

const note_export_func = async (req, res) => {
  try {
    let userId = req.tokenResolveResult.id;
    let fileInfo = await noteModel.exportNoteByFileName(
      userId,
      req.body.fileName,
    );

    res.setHeader("Content-Type", "text/markdown");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(req.body.fileName)}"`,
    );

    const stream = fs.createReadStream(fileInfo.path_name);
    stream.pipe(res);

    stream.on("error", (err) => {
      res.status(500).json(ERROR("File not found or read error"));
    });

    res.on("close", () => {
      if (!stream.destroyed) {
        stream.destroy();
      }
    });
  } catch (e) {
    res.send(ERROR(e.message));
  }
};

const note_export = {
  method: "post",
  path: `${routeName}/export`,
  midFun: [
    AUTHORIZATION,
    validatorMiddleware((req) => ({
      fileName: {
        required: true,
        type: "String",
        value: req.body.fileName,
      },
    })),
  ],
  func: note_export_func,
  desc: "导出便签文件",
};

module.exports = [
  note_get,
  note_save,
  note_get_one,
  note_update,
  note_switch_searchable,
  note_searchable_list,
  note_delete,
  note_export,
];
