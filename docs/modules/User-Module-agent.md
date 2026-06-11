# User Module - Agent 开发指南

## 模块概述

**模块名**: User Module  
**功能**: 用户管理系统  
**核心功能**: 注册、登录、资料更新、头像上传、在线状态维护  
**相关文件**:
- Controller: `controller/user.controller.js`
- Model: `model/user.model.js`
- Data: `model/users.json`
- Service: `Service/user.service.js`

---

## 系统架构

### 目录结构
```
user/
├── user.controller.js       # HTTP接口控制器
├── user.service.js          # 业务逻辑服务
├── user.model.js            # 数据访问层
└── model/users.json         # 数据文件
```

### 数据流向
```
Request → Route → Controller → Service → Model → users.json
   ↓
Response ← _requestResponse
```

---

## 核心接口设计

### 1. 用户注册
**接口**: `POST /api/user/register`

**请求参数**:
```javascript
{
  username: string,      // 用户名 (必填)
  password: string,      // 密码 (必填)
  email: string         // 邮箱 (可选)
}
```

**响应格式**:
```javascript
{
  code: 200,
  message: "注册成功",
  data: {
    userId: "uuid",
    username: string,
    createdAt: timestamp
  }
}
```

**关键步骤**:
1. 验证用户名是否存在
2. 密码加密 (MD5)
3. 生成唯一userId (UUID)
4. 存储到 `model/users.json`

**参数规则**:
- 用户名: 3-20个字符，仅支持字母/数字/下划线
- 密码: 至少6个字符
- 邮箱: 有效的邮箱格式 (可选)

**错误处理**:
- `400`: 参数错误
- `409`: 用户名已存在
- `500`: 服务器错误

---

### 2. 用户登录
**接口**: `POST /api/user/login`

**请求参数**:
```javascript
{
  username: string,      // 用户名
  password: string       // 密码
}
```

**响应格式**:
```javascript
{
  code: 200,
  message: "登录成功",
  data: {
    token: "jwt-token",
    userId: "uuid",
    username: string,
    expiresIn: 86400    // 过期时间(秒)
  }
}
```

**关键步骤**:
1. 查找用户
2. 验证密码
3. 生成JWT Token (有效期24小时)
4. 更新最后登录时间
5. 标记用户为在线

**错误处理**:
- `400`: 参数错误
- `404`: 用户不存在
- `401`: 密码错误

---

### 3. 用户资料获取
**接口**: `GET /api/user/:userId`

**认证**: 需要JWT Token

**URL参数**:
- `userId`: 用户ID

**响应格式**:
```javascript
{
  code: 200,
  data: {
    userId: string,
    username: string,
    email: string,
    avatar: string,     // 头像URL
    isOnline: boolean,
    lastLoginAt: timestamp,
    createdAt: timestamp
  }
}
```

**错误处理**:
- `401`: 未授权
- `404`: 用户不存在

---

### 4. 用户资料更新
**接口**: `PUT /api/user/:userId`

**认证**: 需要JWT Token

**URL参数**:
- `userId`: 用户ID

**请求参数**:
```javascript
{
  email: string,         // 邮箱 (可选)
  avatar: string,        // 头像URL (可选)
  bio: string           // 个人简介 (可选)
}
```

**响应**:
```javascript
{
  code: 200,
  message: "资料已更新",
  data: { ... }
}
```

**业务规则**:
- 用户只能修改自己的资料
- 邮箱必须唯一
- 所有字段都是可选的

---

### 5. 头像上传
**接口**: `POST /api/user/:userId/avatar`

**认证**: 需要JWT Token

**URL参数**:
- `userId`: 用户ID

**请求类型**: multipart/form-data

**参数**:
- `file`: 图片文件 (必填)

**文件要求**:
- 支持格式: jpg, jpeg, png, gif
- 最大大小: 10MB

**响应**:
```javascript
{
  code: 200,
  message: "头像已上传",
  data: {
    avatarUrl: "/uploads/avatars/uuid.jpg"
  }
}
```

**文件存储**:
- 存储路径: `uploads/avatars/`
- 文件命名: `{userId}-{timestamp}.{ext}`
- 自动删除旧头像

---

### 6. 用户列表
**接口**: `GET /api/user/list`

**认证**: 需要JWT Token

**查询参数**:
- `page`: 页码 (默认1)
- `limit`: 每页数量 (默认20)
- `search`: 搜索用户名 (可选)
- `isOnline`: 筛选在线状态 (可选)

**响应**:
```javascript
{
  code: 200,
  data: {
    users: [
      {
        userId: string,
        username: string,
        avatar: string,
        isOnline: boolean,
        lastLoginAt: timestamp
      }
    ],
    total: number,
    page: number,
    limit: number
  }
}
```

---

## 数据模型

### users.json 结构
```json
[
  {
    "id": "uuid-format",
    "username": "john_doe",
    "password": "hashed-password",
    "email": "john@example.com",
    "avatar": "/uploads/avatars/uuid.jpg",
    "isOnline": true,
    "lastLoginAt": 1234567890,
    "lastActiveAt": 1234567890,
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

### 字段说明
- `id`: 唯一标识 (UUID格式)
- `username`: 用户名 (唯一)
- `password`: 加密后的密码 (MD5)
- `email`: 邮箱 (唯一)
- `avatar`: 头像URL
- `isOnline`: 是否在线
- `lastLoginAt`: 上次登录时间
- `lastActiveAt`: 上次活动时间
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

---

## 开发检查清单

### Phase 1: 需求理解
- [ ] 理解用户生命周期
- [ ] 确认支持的操作
- [ ] 明确数据存储位置
- [ ] 阅读相关Skill文档: `docs/skill.md`

### Phase 2: 设计
- [ ] 设计API契约 (已列出)
- [ ] 设计JSON数据结构 (已设计)
- [ ] 定义错误码 (已定义)
- [ ] 设计验证规则

### Phase 3: 实现
- [ ] 创建 `model/user.model.js` (数据访问)
  - `create(userData)`
  - `getById(id)`
  - `getByUsername(username)`
  - `update(id, updates)`
  - `delete(id)`
  - `getAll()`
  - `search(keyword, limit, offset)`
- [ ] 创建 `Service/user.service.js` (业务逻辑)
  - `register(username, password, email)`
  - `login(username, password)`
  - `getProfile(userId)`
  - `updateProfile(userId, updates)`
  - `uploadAvatar(userId, file)`
- [ ] 创建 `controller/user.controller.js` (HTTP接口)
  - `register(req, res)`
  - `login(req, res)`
  - `getProfile(req, res)`
  - `updateProfile(req, res)`
  - `uploadAvatar(req, res)`
  - `getUserList(req, res)`
- [ ] 在 `route/init_routes.js` 注册路由
- [ ] 在 `controller/controllerConfig/controllerExport.config.js` 注册

### Phase 4: 中间件
- [ ] JWT验证中间件
- [ ] 参数校验中间件
- [ ] 文件上传中间件

### Phase 5: 测试
- [ ] 测试注册功能
  - 正常注册
  - 用户名已存在
  - 密码过短
  - 邮箱格式错误
- [ ] 测试登录功能
  - 正常登录
  - 用户不存在
  - 密码错误
  - Token生成
- [ ] 测试资料查询和更新
- [ ] 测试头像上传
- [ ] 测试用户列表和搜索
- [ ] 测试在线状态维护
- [ ] 测试Token过期

---

## 错误码参考

```javascript
200  // 成功
400  // 参数错误
401  // 未授权/Token无效
403  // 禁止访问
404  // 用户不存在
409  // 用户名已存在
413  // 文件过大
415  // 不支持的文件类型
500  // 服务器错误
```

**示例错误响应**:
```javascript
{
  code: 409,
  message: "用户名已存在"
}
```

---

## 安全考虑

1. ✅ **密码加密存储** - 使用MD5加密 (考虑升级到bcrypt)
2. ✅ **JWT Token验证** - 所有受保护接口必须验证Token
3. ✅ **参数校验** - 所有输入参数都要验证
4. ✅ **CORS配置** - 跨域请求需要配置
5. ✅ **文件上传验证** - 验证文件类型和大小
6. ✅ **权限检查** - 用户只能操作自己的资料
7. ✅ **日志记录** - 记录登录失败、异常操作
8. ✅ **请求频率限制** - 防止暴力破解

---

## 已实现的相关组件

### 定时任务
**文件**: `cron/updateUser.js`

功能: 每10秒检查一次用户在线状态
```javascript
// 检查逻辑:
// 如果用户30秒内无活动 -> 标记为离线
// 如果用户有活动 -> 更新lastActiveAt
```

### 事件系统
**文件**: `Event/userStatus.js`

功能: 用户状态变更事件
- `user-online`: 用户上线
- `user-offline`: 用户离线
- `user-profile-updated`: 用户资料更新

---

## 相关文档

- 👉 [Skill库 - User Module](../modules/User-Module-skill.md)
- 👉 [项目Agent指南](../agent.md)
- 👉 [通用Skill库](../skill.md)
