# Tone / Tran

基于 Node.js + Express 的后端服务，采用 MVC 风格组织代码，提供用户、实时聊天、群组、文件传输、笔记、提醒、软件包、版本和 Issue 反馈等接口能力。

## 功能模块

- 用户系统：注册、登录、资料更新、头像上传、JWT 鉴权、在线状态维护。
- 实时通信：基于 WebSocket 的单聊、群聊、用户列表刷新、资料变更通知。
- 群组管理：创建群组、查询群组、查询群成员、添加群成员。
- 文件传输：发送文件、文件列表、删除、下载、分片上传和合并。
- 笔记管理：笔记列表、新增、详情、更新、删除、公开搜索、导出。
- Ding 提醒：发送提醒、查询提醒、删除提醒、未读提醒数量。
- 软件管理：软件列表、分片上传、记录新增、下载。
- Issue 反馈：问题列表、新增问题、详情、评论、回复，支持 Markdown 和图片。
- 版本管理：版本列表和版本保存。
- 分类管理：应用分类列表和新增。
- 接口契约：提供部分接口契约描述。

## 技术栈

- Node.js
- Express
- ws
- JWT
- express-fileupload
- node-cron
- log4js
- dotenv
- JSON 文件存储

项目中包含 MySQL 和 Redis 配置，但当前主要业务模型的数据读写集中在 `model/**/*.json` 文件。

## 启动

安装依赖：

```bash
npm install
```

启动服务：

```bash
npm run serve
```

默认配置：

- HTTP 服务端口：`3000`
- API 前缀：`/api`
- WebSocket 端口：`9998`
- WebSocket 路径：`/tranWs`

这些配置主要来自 `.env` 和 `config/Port.js`。

## 环境变量

`.env` 示例：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=test12
DB_NAME=parking
DB_PORT=3306
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
UPLOAD_PATH=/uploads
API_PREFIX=/api
WEBSOCKET_PORT=9998
TONE_PORT=3000
```

## 目录结构

```text
.
├── app.js                  # 应用入口，注册中间件、路由、WebSocket 和定时任务
├── controller/             # HTTP 接口控制器
├── model/                  # 数据模型，主要读写 JSON 数据文件
├── route/                  # 路由初始化和控制器注册
├── middware/               # 鉴权、参数校验、上传等中间件
├── Socket/                 # WebSocket 服务和消息推送逻辑
├── Event/                  # 事件总线和用户状态事件
├── cron/                   # 定时任务
├── config/                 # 端口、MySQL、Redis、上传配置
├── uploads/                # 上传文件目录
├── public/                 # 静态资源目录
├── views/                  # 页面模板目录
├── _requestResponse/       # 统一响应封装
└── utils/                  # 工具函数
```

## 路由注册

路由由 `route/init_routes.js` 统一注册，实际导出的控制器配置在：

```text
controller/controllerConfig/controllerExport.config.js
```

新增控制器后，需要把不带 `.js` 后缀的文件名加入该配置，例如：

```js
"user.controller"
```

控制器中的接口会自动拼接 `.env` 里的 `API_PREFIX`。例如 `user.controller.js` 中的 `/user/login` 实际访问路径为：

```text
POST /api/user/login
```

## WebSocket

WebSocket 服务监听独立端口，默认：

```text
ws://localhost:9998/tranWs?token=<jwt>&curAccessToken=<client-token>
```

连接要求：

- 路径必须是 `/tranWs`
- 必须携带 `token`
- `token` 会经过 JWT 校验

支持的消息类型包括：

- `ping`
- `client-chat-message`
- `client-chat-group-message`

## 定时任务

`cron/updateUser.js` 每 10 秒执行一次用户在线状态检查，会根据用户更新时间维护 `isOnline` 状态。

## 说明

- 静态目录包括 `uploads`、`public`、`views`。
- 请求体大小限制为 `100mb`。
- 文件和软件上传支持分片上传与合并。
- `nodemon.json` 已忽略 JSON 数据文件、上传目录和静态资源目录，避免开发时频繁重启。
