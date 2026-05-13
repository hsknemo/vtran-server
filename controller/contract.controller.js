const routeName = "/contract";
const { SUCCESS } = require("../_requestResponse/setResponse");
const noteOpenapiContract = require("../contract/note.openapi");

const note_contract_get_func = async (req, res) => {
  res.send(SUCCESS(noteOpenapiContract));
};

const note_contract_get = {
  method: "get",
  path: `${routeName}/note`,
  midFun: [],
  func: note_contract_get_func,
  desc: "获取便签模块 OpenAPI 契约",
};

const response_contract_get_func = async (req, res) => {
  res.send(
    SUCCESS({
      success: "boolean",
      code: "number",
      message: "string",
      data: "any",
      timestamp: "ISO string",
      status: "number(legacy)",
      msg: "string(legacy)",
    }),
  );
};

const response_contract_get = {
  method: "get",
  path: `${routeName}/response`,
  midFun: [],
  func: response_contract_get_func,
  desc: "获取统一响应协议说明",
};

module.exports = [note_contract_get, response_contract_get];
