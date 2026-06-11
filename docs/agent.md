# Vtran-Server Agent 指南

## 项目概述

**项目名称**: Vtran-Server  
**技术栈**: Node.js + Express + WebSocket  
**主要功能**: 文件转发、实时通信、用户管理、群组协作
**当前版本**: 1.1.7
**仓库地址**: https://github.com/hsknemo/vtran-server

---

## Agent 角色定义

### 核心职责
- 🤖 **需求理解Agent**: 解析用户需求，映射到相应模块
- 🔧 **开发执行Agent**: 实现功能，遵循项目架构规范
- 🧪 **测试验证Agent**: 编写测试用例，验证功能完整性
- 📦 **部署发布Agent**: 管理版本、部署流程

### 项目架构认知
```
Request Flow:
客户端 → Route(路由) → Controller(控制器) → Service(服务) → Model(数据模型)
       ↓
    Middleware(中间件): 鉴权、参数校验、文件上传
       ↓
    Response(统一响应格式)
```

---

## 核心开发规范

### 1. 路由与控制器
- **路由文件**: `route/init_routes.js`
- **控制器配置**: `controller/controllerConfig/controllerExport.config.js`
- **命名规范**: `moduleType.controller.js`
- **API前缀**: 自动加上 `/api` (来自 `.env` 的 `API_PREFIX`)

**示例**:
```javascript
// user.controller.js 中的 /user/login
// 实际访问路径: POST /api/user/login
```

### 2. 数据模型
- **存储方式**: JSON 文件（位于 `model/`）
- **读写方法**: 直接文件操作，无数据库中间层
- **配置**: MySQL和Redis配置存在，但目前未使用
- **文件位置**: `model/**/*.json`

### 3. WebSocket 通信
- **端口**: `9998` (可通过 `WEBSOCKET_PORT` 配置)
- **路径**: `/tranWs`
- **认证**: JWT token 校验
- **连接字符串**: `ws://localhost:9998/tranWs?token=<jwt>&curAccessToken=<client-token>`
- **支持消息类型**:
  - `ping` - 心跳
  - `client-chat-message` - 单聊消息
  - `client-chat-group-message` - 群聊消息

### 4. 中间件体系
**关键中间件目录**: `middware/`
- JWT 鉴权
- 参数校验
- 文件上传处理
- CORS 跨域处理

### 5. 日志与监控
- **日志库**: log4js
- **日志目录**: `log/` 和 `logControl/`
- **日志级别**: error, warn, info, debug
- **使用示例**: `logger.info()`, `logger.error()`, `logger.warn()`, `logger.debug()`

### 6. 定时任务
- **任务库**: node-cron
- **任务目录**: `cron/`
- **现有任务**: `updateUser.js` (每10秒检查用户在线状态)
- **Cron表达式**: `* * * * * *` (秒 分 时 日 月 周)

---

## 开发流程

### Phase 1: 需求分析
- [ ] 理解功能需求
- [ ] 确定涉及的模块
- [ ] 设计数据模型
- [ ] 参考相关文档: `docs/modules/*/agent.md`

### Phase 2: 设计
- [ ] 定义API契约
- [ ] 设计数据结构 (JSON schema)
- [ ] 规划WebSocket消息格式 (如需)
- [ ] 定义错误码

### Phase 3: 实现
- [ ] 创建Model (数据模型): `model/xxxx.model.js`
- [ ] 创建Service (业务逻辑): `Service/xxxx.service.js`
- [ ] 创建Controller (接口实现): `controller/xxxx.controller.js`
- [ ] 创建Middleware (如需): `middware/xxxx.middleware.js`
- [ ] 在 `route/init_routes.js` 注册路由
- [ ] 在 `controller/controllerConfig/controllerExport.config.js` 注册控制器

### Phase 4: 测试
- [ ] 单元测试
- [ ] 集成测试
- [ ] WebSocket消息测试 (如需)
- [ ] 测试文件: `test/` 目录

### Phase 5: 部署
- [ ] 代码审查
- [ ] 版本更新: 修改 `package.json` 中的 `version`
- [ ] 上线部署

---

## 环境配置

### 必要环境变量 (.env)
```env
# 服务端口
TONE_PORT=3000
WEBSOCKET_PORT=9998
API_PREFIX=/api

# 数据库 (可选，目前未使用)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=test12
DB_NAME=parking
DB_PORT=3306

# Redis (可选)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# 文件上传
UPLOAD_PATH=/uploads
```

### 启动命令
```bash
npm install       # 安装依赖
npm run serve    # 启动服务 (使用nodemon)
```

---

## 目录结构详解

```
├── app.js                           # 应用入口
├── controller/                      # HTTP接口控制器
│   ├── user.controller.js
│   ├── chat.controller.js
│   └── controllerConfig/
│       └── controllerExport.config.js   # 控制器注册表
├── model/                          # 数据模型和JSON数据文件
│   ├── user.model.js
│   ├── chat.model.js
│   └── users.json, chats.json    # 数据文件
├── Service/                        # 业务逻辑服务层
│   ├── user.service.js
│   └── chat.service.js
├── route/                          # 路由初始化
│   └── init_routes.js
├── middware/                       # 中间件 (注意拼写)
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   └── upload.middleware.js
├── Socket/                         # WebSocket服务
│   ├── index.js
│   └── handlers.js
├── Event/                          # 事件总线
│   └── index.js
├── cron/                           # 定时任务
│   ├── updateUser.js
│   └── index.js
├── config/                         # 配置文件
│   ├── Port.js
│   ├── database.config.js
│   └── redis.config.js
├── logControl/                     # 日志控制
│   └── logger.js
├── _requestResponse/               # 统一响应封装
│   └── response.js
├── utils/                          # 工具函数
│   ├── common.js
│   └── validators.js
├── uploads/                        # 上传文件目录 (nodemon忽略)
├── public/                         # 静态资源目录
├── views/                          # 页面模板目录
├── test/                           # 测试文件
├── docs/                           # 项目文档
│   ├── agent.md (本文件)
│   ├── skill.md
│   └── modules/
├── .env                            # 环境变量
├── .gitignore
├── nodemon.json
├── package.json
└── README.md
```

---

## 常见任务

### ✅ 添加新的API接口
1. 在 `controller/` 创建控制器文件: `feature.controller.js`
2. 在控制器中定义路由处理函数
3. 在 `controller/controllerConfig/controllerExport.config.js` 中注册
4. 如需中间件，在 `middware/` 中添加
5. 参考模块文档: `docs/modules/*/agent.md`

### ✅ 添加WebSocket消息处理
1. 在 `Socket/` 中添加消息监听器
2. 在 `Event/` 中定义事件
3. 使用事件总线推送消息
4. 参考: `docs/modules/Chat-Module-agent.md`

### ✅ 添加定时任务
1. 在 `cron/` 中创建任务文件
2. 在 `app.js` 中注册任务
3. 使用 `node-cron` 定义执行计划

### ✅ 添加数据模型
1. 在 `model/` 中创建JSON数据文件
2. 创建数据访问层: `model/xxxx.model.js`
3. 实现读写更新删除操作

---

## 技术栈速查

| 功能 | 库 | 版本 | 用途 |
|------|-----|------|------|
| Web框架 | express | ^4.17.1 | HTTP服务器 |
| WebSocket | ws | ^8.18.3 | 实时通信 |
| 认证 | jsonwebtoken | ^9.0.2 | JWT Token管理 |
| 文件上传 | express-fileupload | ^1.4.0 | 文件上传处理 |
| 定时任务 | node-cron | ^3.0.3 | 后台定时任务 |
| 日志 | log4js | ^6.9.1 | 日志记录 |
| 环境配置 | dotenv | ^16.4.7 | 环境变量管理 |
| 密码加密 | md5 | ^2.3.0 | 密码哈希 |
| 时间处理 | moment | ^2.29.4 | 日期时间处理 |
| CORS | cors | ^2.8.5 | 跨域处理 |
| 数据库 (可选) | mysql2 | ^3.6.3 | MySQL驱动 |
| 缓存 (可选) | ioredis | ^5.4.1 | Redis客户端 |

---

## 统一响应格式

### 成功响应
```javascript
{
  code: 200,
  message: "操作成功",
  data: { ... },
  timestamp: 1234567890
}
```

### 错误响应
```javascript
{
  code: 400,                    // 或 401, 404, 500 等
  message: "参数错误",
  timestamp: 1234567890
}
```

### 标准HTTP状态码
- **200**: 成功
- **400**: 参数错误
- **401**: 未授权/Token无效
- **403**: 禁止访问
- **404**: 资源不存在
- **409**: 冲突 (如用户已存在)
- **500**: 服务器错误

---

## 模块导航

- 📖 [用户模块](./modules/User-Module-agent.md)
- 💬 [聊天模块](./modules/Chat-Module-agent.md)
- 👥 [群组模块](./modules/Group-Module-agent.md)
- 📁 [文件模块](./modules/File-Module-agent.md)
- 📝 [笔记模块](./modules/Note-Module-agent.md)
- 🔔 [提醒模块](./modules/Reminder-Module-agent.md)
- 📦 [软件模块](./modules/Software-Module-agent.md)
- 🐛 [Issue模块](./modules/Issue-Module-agent.md)

---

## 联系与支持

- 项目仓库: https://github.com/hsknemo/vtran-server
- 默认分支: master
- 文档分支: docs/agent-skill-guide
- 当前版本: 1.1.7
