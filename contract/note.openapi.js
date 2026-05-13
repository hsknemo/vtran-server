const noteOpenapiContract = {
  openapi: "3.0.3",
  info: {
    title: "Tran Note API Contract",
    version: "1.0.0",
    description: "便签模块接口契约（含公开广场能力）",
  },
  servers: [
    {
      url: "/api",
      description: "Default API Prefix",
    },
  ],
  components: {
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          code: { type: "integer", example: 0 },
          message: { type: "string", example: "服务调用成功" },
          data: {},
          timestamp: { type: "string", example: "2026-04-23T09:10:11.000Z" },
          status: { type: "integer", example: 1 },
          msg: { type: "string", example: "服务调用成功" },
        },
        required: ["success", "code", "message", "timestamp", "status", "msg"],
      },
      NoteItem: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          desc: { type: "string" },
          markColor: { type: "string" },
          createTime: { type: "string" },
          updateTime: { type: "string" },
          contentUrl: { type: "string" },
          searchable: { type: "boolean" },
          sharedBy: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/note/list": {
      get: {
        summary: "获取当前用户便签列表",
        security: [{ bearerAuth: [] }],
      },
    },
    "/note/save": {
      post: {
        summary: "创建便签",
        security: [{ bearerAuth: [] }],
      },
    },
    "/note/update": {
      post: {
        summary: "更新便签内容",
        security: [{ bearerAuth: [] }],
      },
    },
    "/note/delete": {
      post: {
        summary: "删除便签",
        security: [{ bearerAuth: [] }],
      },
    },
    "/note/one": {
      post: {
        summary: "按文件名读取便签内容（stream，可传分享人userId）",
        security: [{ bearerAuth: [] }],
      },
    },
    "/note/export": {
      post: {
        summary: "导出便签 markdown 文件",
        security: [{ bearerAuth: [] }],
      },
    },
    "/note/searchable/update": {
      post: {
        summary: "更新便签公开检索状态",
        security: [{ bearerAuth: [] }],
      },
    },
    "/note/searchable/list": {
      get: {
        summary: "获取便签广场公开便签列表",
        security: [{ bearerAuth: [] }],
      },
    },
  },
};

module.exports = noteOpenapiContract;
