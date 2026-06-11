# Vtran-Server Skill 库

## Skill 定义

**Skill** 是可复用的开发技能集合，包含具体的代码模式、最佳实践和实现方案。

---

## 通用技能

### SKILL-001: 响应封装

**目的**: 统一API响应格式

**使用场景**: 所有HTTP接口返回

**实现位置**: `_requestResponse/response.js`

**标准响应格式**:
```javascript
{
  code: 200,              // 状态码
  message: "success",     // 消息
  data: { ... },          // 数据
  timestamp: 1234567890   // 时间戳
}
```

**使用示例**:
```javascript
const { successResponse, errorResponse } = require('../_requestResponse/response');

// 成功响应
res.json(successResponse(data, "操作成功"));

// 错误响应
res.status(400).json(errorResponse("参数错误"));
```

---

### SKILL-002: JWT 认证

**目的**: 验证用户身份

**使用场景**: 需要鉴权的接口

**实现位置**: `middware/auth.middleware.js`

**Token结构**:
```javascript
{
  userId: "user-id",
  username: "username",
  iat: 1234567890,    // 签发时间
  exp: 1234671490     // 过期时间
}
```

**生成Token**:
```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: user.id, username: user.username },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '24h' }
);
```

**验证Token**:
```javascript
const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
```

**在中间件中使用**:
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json(errorResponse('Token required'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json(errorResponse('Invalid token'));
  }
};
```

---

### SKILL-003: 文件分片上传与合并

**目的**: 支持大文件上传

**使用场景**: 文件、软件上传

**实现位置**: `controller/file.controller.js`, `model/file.model.js`

**流程**:
```
1. 客户端分片发送文件
2. 服务端临时存储分片
3. 客户端发送合并请求
4. 服务端合并分片为完整文件
5. 删除临时分片
```

**关键参数**:
```javascript
{
  fileId: "唯一标识",
  chunkIndex: 0,        // 分片序号
  chunkTotal: 10,       // 总分片数
  chunkSize: 1024*1024  // 每片大小
}
```

**核心实现**:
```javascript
// 上传分片
async function uploadChunk(req, res) {
  const { fileId, chunkIndex, chunkTotal } = req.body;
  const file = req.files.file;
  
  const chunkPath = path.join(
    __dirname,
    '../uploads/chunks',
    `${fileId}-${chunkIndex}`
  );
  
  await file.mv(chunkPath);
  
  return res.json(successResponse({
    fileId, chunkIndex, chunkTotal
  }));
}

// 合并分片
async function mergeChunks(req, res) {
  const { fileId, chunkTotal, filename } = req.body;
  const chunksDir = path.join(__dirname, '../uploads/chunks');
  const outputPath = path.join(__dirname, '../uploads/files', filename);
  
  const writeStream = fs.createWriteStream(outputPath);
  
  for (let i = 0; i < chunkTotal; i++) {
    const chunkPath = path.join(chunksDir, `${fileId}-${i}`);
    const data = fs.readFileSync(chunkPath);
    writeStream.write(data);
    fs.unlinkSync(chunkPath);  // 删除分片
  }
  
  writeStream.end();
  
  return res.json(successResponse({
    filePath: outputPath,
    size: fs.statSync(outputPath).size
  }));
}
```

---

### SKILL-004: WebSocket 消息处理

**目的**: 实时双向通信

**使用场景**: 聊天、消息推送、状态同步

**实现位置**: `Socket/index.js`

**消息格式**:
```javascript
{
  type: "client-chat-message",  // 消息类型
  data: {
    userId: "user-id",
    content: "消息内容",
    timestamp: 1234567890
  }
}
```

**支持的消息类型**:
- `ping` - 心跳
- `client-chat-message` - 单聊消息
- `client-chat-group-message` - 群聊消息

**核心实现**:
```javascript
const WebSocket = require('ws');

const wsServer = new WebSocket.Server({ port: 9998 });

wsServer.on('connection', (ws, req) => {
  // 验证token
  const token = new URL(`http://${req.headers.host}${req.url}`).searchParams.get('token');
  const user = verifyToken(token);
  
  ws.userId = user.userId;
  
  // 消息监听
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      
      case 'client-chat-message':
        handleChatMessage(message, ws);
        break;
      
      case 'client-chat-group-message':
        handleGroupChatMessage(message, ws);
        break;
    }
  });
  
  // 断开连接
  ws.on('close', () => {
    console.log(`User ${ws.userId} disconnected`);
  });
});

// 广播消息
function broadcast(message) {
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// 发送给特定用户
function sendToUser(userId, message) {
  wsServer.clients.forEach(client => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
```

---

### SKILL-005: 定时任务

**目的**: 周期性执行后台任务

**使用场景**: 用户在线状态更新、数据清理、报表生成

**实现位置**: `cron/` 目录

**依赖**: `node-cron`

**核心实现**:
```javascript
const cron = require('node-cron');

// 每10秒执行一次
cron.schedule('*/10 * * * * *', () => {
  console.log('每10秒执行一次');
  // 任务逻辑
});

// 每天早上8点执行
cron.schedule('0 8 * * *', () => {
  console.log('每天早上8点执行');
});

// 每周一上午9点执行
cron.schedule('0 9 * * 1', () => {
  console.log('每周一上午9点执行');
});
```

**Cron表达式**:
```
* * * * * *
┬ ┬ ┬ ┬ ┬ ┬
│ │ │ │ │ │
│ │ │ │ │ 周 (0-6) 0=周日
│ │ │ │ 月 (1-12)
│ │ │ 日 (1-31)
│ │ 时 (0-23)
│ 分 (0-59)
秒 (0-59)
```

**示例**:
```javascript
'*/10 * * * * *'  // 每10秒
'0 * * * * *'    // 每分钟
'0 0 * * * *'    // 每小时
'0 0 0 * * *'    // 每天
'0 0 0 * * 1'    // 每周一
```

---

### SKILL-006: JSON 数据持久化

**目的**: 使用JSON文件存储数据

**使用场景**: 所有业务数据存储

**实现位置**: `model/` 目录

**最佳实践**:
```javascript
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../model/data.json');

// 读取
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('读取数据失败:', err);
    return [];
  }
}

// 写入
function writeData(data) {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(data, null, 2),
      'utf8'
    );
  } catch (err) {
    console.error('写入数据失败:', err);
    throw err;
  }
}

// 创建
function create(newItem) {
  const items = readData();
  newItem.id = generateUUID();
  newItem.createdAt = Date.now();
  items.push(newItem);
  writeData(items);
  return newItem;
}

// 读取
function getById(id) {
  const items = readData();
  return items.find(item => item.id === id);
}

// 更新
function update(id, updateData) {
  let items = readData();
  items = items.map(item =>
    item.id === id
      ? { ...item, ...updateData, updatedAt: Date.now() }
      : item
  );
  writeData(items);
  return items.find(item => item.id === id);
}

// 删除
function delete(id) {
  let items = readData();
  items = items.filter(item => item.id !== id);
  writeData(items);
}

// 列表
function getAll() {
  return readData();
}

module.exports = {
  create, getById, update, delete: delete, getAll
};
```

---

### SKILL-007: 日志记录

**目的**: 记录应用运行日志

**使用场景**: 调试、监控、错误追踪

**实现位置**: `logControl/logger.js`

**依赖**: `log4js`

**核心实现**:
```javascript
const log4js = require('log4js');

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: {
      type: 'file',
      filename: './log/app.log',
      maxLogSize: 10485760,
      backups: 5
    }
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'info' }
  }
});

const logger = log4js.getLogger();

module.exports = logger;
```

**使用示例**:
```javascript
const logger = require('../logControl/logger');

logger.info('操作成功');
logger.warn('警告信息');
logger.error('错误信息', error);
logger.debug('调试信息');
```

**日志级别**:
- `trace` - 最详细
- `debug` - 调试信息
- `info` - 信息
- `warn` - 警告
- `error` - 错误
- `fatal` - 最严重

---

### SKILL-008: 参数校验

**目的**: 验证请求参数的有效性

**使用场景**: 所有需要参数的接口

**实现位置**: `middware/validation.middleware.js`

**核心实现**:
```javascript
const validateUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRequired = (value) => {
  return value !== undefined && value !== null && value !== '';
};

// 中间件
const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = {};
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      for (const rule of rules) {
        if (!rule(value)) {
          errors[field] = `Invalid ${field}`;
          break;
        }
      }
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errorResponse('Validation failed', 400, errors));
    }
    
    next();
  };
};

// 使用示例
router.post('/register', 
  validateRequest({
    username: [validateRequired, validateUsername],
    password: [validateRequired, validatePassword],
    email: [validateRequired, validateEmail]
  }),
  registerController
);
```

---

## 模块特定技能

### User Module Skills
- SKILL-U01: 用户注册与密码哈希
- SKILL-U02: 用户登录与JWT生成
- SKILL-U03: 用户在线状态维护
- SKILL-U04: 用户资料更新与头像上传

👉 详见: [User Module Skill](./modules/User-Module-skill.md)

### Chat Module Skills
- SKILL-C01: WebSocket连接管理
- SKILL-C02: 消息路由与分发
- SKILL-C03: 群聊消息广播
- SKILL-C04: 消息历史查询

👉 详见: [Chat Module Skill](./modules/Chat-Module-skill.md)

### File Module Skills
- SKILL-F01: 文件上传管理
- SKILL-F02: 分片上传与合并
- SKILL-F03: 文件下载流处理
- SKILL-F04: 文件元数据管理

👉 详见: [File Module Skill](./modules/File-Module-skill.md)

---

## 快速参考

### 常用导入
```javascript
const express = require('express');
const { Router } = express;
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const cron = require('node-cron');
const log4js = require('log4js');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
```

### 常用中间件
```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')());
app.use(require('express-fileupload')());
app.use(authMiddleware);
```

### 常用工具函数
```javascript
// UUID生成
const { v4: uuidv4 } = require('uuid');
const id = uuidv4();

// 时间处理
const moment = require('moment');
const now = moment().format('YYYY-MM-DD HH:mm:ss');

// 密码加密
const md5 = require('md5');
const hash = md5(password);

// 响应
const { successResponse, errorResponse } = require('../_requestResponse/response');
```

---

## 最佳实践

✅ **DO**
- 使用统一的响应格式
- 验证所有用户输入
- 记录关键操作日志
- 使用JWT进行身份验证
- 在中间件中集中处理横切关注点
- 使用JSON Schema定义数据结构
- 异步操作中使用try-catch

❌ **DON'T**
- 直接返回未格式化的响应
- 忽略参数校验
- 在控制器中混入业务逻辑
- 硬编码配置值
- 暴露敏感信息到日志
- 同步写入大型文件

---

## 文档导航

- 📖 [项目Agent指南](./agent.md)
- 📖 [用户模块Agent](./modules/User-Module-agent.md)
- 🎯 [用户模块Skill](./modules/User-Module-skill.md)
- 📖 [聊天模块Agent](./modules/Chat-Module-agent.md)
- 🎯 [聊天模块Skill](./modules/Chat-Module-skill.md)

---

## 更新日志

- **v1.0** (2024-01) 初始版本，包含8个核心Skills
- **v1.1** (2024-02) 添加参数校验Skill
