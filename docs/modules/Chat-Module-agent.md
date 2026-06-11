# Chat Module - Agent 开发指南

## 模块概述

**模块名**: Chat Module  
**功能**: 实时聊天系统  
**核心能力**: 单聊、群聊、消息历史、消息推送、在线状态同步  
**通信方式**: WebSocket (ws://localhost:9998/tranWs)

---

## 系统架构

### 目录结构
```
chat/
├── chat.controller.js       # HTTP接口控制器
├── chat.service.js          # 业务逻辑服务
├── chat.model.js            # 数据访问层
├── Socket/                  # WebSocket消息处理
│   ├── index.js
│   └── handlers.js
├── Event/                   # 事件总线
│   ├── index.js
│   └── messageEvents.js
└── model/
    ├── chats.json           # 聊天消息
    ├── chatRooms.json       # 聊天室/群组
    └── messageHistory.json  # 消息历史
```

### 数据流向
```
单聊流向:
Client A → WebSocket → Socket Handler → Event Bus → Model → chats.json
        ↓
      Client B

群聊流向:
Client A → WebSocket → Socket Handler → Event Bus → Broadcast → All Clients
        ↓
      Model → chats.json
```

---

## 核心接口设计

### 1. 获取聊天历史
**接口**: `GET /api/chat/history/:userId`

**认证**: 需要JWT Token

**查询参数**:
- `limit`: 返回条数 (默认50)
- `offset`: 分页偏移 (默认0)
- `type`: 消息类型 (single/group)

**响应**:
```javascript
{
  code: 200,
  data: {
    messages: [
      {
        id: "uuid",
        fromUserId: string,
        toUserId: string,        // 单聊
        groupId: string,         // 群聊
        content: string,
        type: "text|image|file",
        timestamp: number,
        readAt: number           // null表示未读
      }
    ],
    total: number,
    page: number
  }
}
```

---

### 2. 标记消息已读
**接口**: `POST /api/chat/read`

**认证**: 需要JWT Token

**请求参数**:
```javascript
{
  messageIds: ["id1", "id2", ...],  // 消息ID数组
  type: "single|group"
}
```

**响应**:
```javascript
{
  code: 200,
  message: "Messages marked as read"
}
```

---

### 3. 获取未读消息数
**接口**: `GET /api/chat/unread`

**认证**: 需要JWT Token

**响应**:
```javascript
{
  code: 200,
  data: {
    totalUnread: number,
    unreadByUser: {
      "userId": 5,
      "userId2": 3
    }
  }
}
```

---

### 4. 搜索消息
**接口**: `GET /api/chat/search`

**认证**: 需要JWT Token

**查询参数**:
- `keyword`: 搜索关键词 (必填)
- `type`: 消息类型 (可选)
- `limit`: 返回条数

**响应**:
```javascript
{
  code: 200,
  data: {
    messages: [...],
    total: number
  }
}
```

---

### 5. 删除消息
**接口**: `DELETE /api/chat/:messageId`

**认证**: 需要JWT Token

**业务规则**:
- 用户只能删除自己发送的消息
- 删除后其他用户仍可看到 (标记为已删除)
- 删除后无法恢复

**响应**:
```javascript
{
  code: 200,
  message: "Message deleted"
}
```

---

## WebSocket 消息处理

### 支持的消息类型

#### 1. ping 心跳
```javascript
{
  type: "ping"
}

// 响应
{
  type: "pong"
}
```

#### 2. 单聊消息
```javascript
{
  type: "client-chat-message",
  data: {
    toUserId: string,
    content: string,
    contentType: "text|image|file",  // 默认text
    messageId: string                 // 可选，用于重试
  }
}

// 服务器响应
{
  type: "server-chat-message-ack",
  data: {
    messageId: string,
    status: "success|failed",
    timestamp: number
  }
}

// 推送给接收者
{
  type: "receive-chat-message",
  data: {
    id: string,
    fromUserId: string,
    content: string,
    contentType: string,
    timestamp: number
  }
}
```

#### 3. 群聊消息
```javascript
{
  type: "client-chat-group-message",
  data: {
    groupId: string,
    content: string,
    contentType: "text|image|file",
    messageId: string
  }
}

// 广播给群组所有成员
{
  type: "receive-group-chat-message",
  data: {
    id: string,
    groupId: string,
    fromUserId: string,
    content: string,
    contentType: string,
    timestamp: number
  }
}
```

#### 4. 用户在线状态
```javascript
// 推送给其他在线用户
{
  type: "user-online",
  data: {
    userId: string,
    username: string,
    timestamp: number
  }
}

// 推送给其他在线用户
{
  type: "user-offline",
  data: {
    userId: string,
    username: string,
    timestamp: number
  }
}
```

#### 5. 输入状态
```javascript
{
  type: "user-typing",
  data: {
    toUserId: string,  // 单聊
    groupId: string,   // 群聊
    isTyping: boolean
  }
}

// 推送给对方
{
  type: "user-is-typing",
  data: {
    userId: string,
    isTyping: boolean
  }
}
```

---

## 数据模型

### chats.json
```json
[
  {
    "id": "uuid",
    "fromUserId": "user-id",
    "toUserId": "user-id",      // 单聊
    "groupId": "group-id",      // 群聊 (二选一)
    "content": "message content",
    "contentType": "text|image|file",
    "contentUrl": "url",         // 文件/图片URL
    "status": "sent|read|deleted",
    "timestamp": 1234567890,
    "readAt": 1234567900         // null表示未读
  }
]
```

### chatRooms.json
```json
[
  {
    "id": "group-id",
    "name": "group name",
    "description": "group description",
    "avatar": "url",
    "createdBy": "user-id",
    "members": ["user-id1", "user-id2"],
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

---

## 开发检查清单

### Phase 1: 需求理解
- [ ] 理解单聊和群聊的区别
- [ ] 了解消息状态流转 (sent → read → deleted)
- [ ] 明确WebSocket消息格式
- [ ] 阅读Skill文档: `docs/skill.md` 的SKILL-004

### Phase 2: 设计
- [ ] 设计消息数据结构
- [ ] 定义WebSocket消息类型
- [ ] 设计消息查询和分页
- [ ] 定义错误码和异常情况

### Phase 3: HTTP接口实现
- [ ] 创建 `chat.model.js` (数据访问)
- [ ] 创建 `chat.service.js` (业务逻辑)
- [ ] 创建 `chat.controller.js` (HTTP接口)
- [ ] 实现获取历史消息
- [ ] 实现标记已读
- [ ] 实现未读数统计
- [ ] 实现消息搜索
- [ ] 实现消息删除

### Phase 4: WebSocket实现
- [ ] 创建 `Socket/handlers.js`
- [ ] 实现心跳处理 (ping/pong)
- [ ] 实现单聊消息处理
- [ ] 实现群聊消息处理
- [ ] 实现用户在线状态同步
- [ ] 实现输入状态显示
- [ ] 实现消息确认机制

### Phase 5: 事件系统
- [ ] 创建 `Event/messageEvents.js`
- [ ] 定义消息事件
- [ ] 实现事件发布/订阅
- [ ] 连接HTTP和WebSocket

### Phase 6: 测试
- [ ] 单聊消息收发测试
- [ ] 群聊消息广播测试
- [ ] 消息历史查询测试
- [ ] 未读消息统计测试
- [ ] 消息搜索测试
- [ ] WebSocket连接管理测试
- [ ] 消息重试机制测试
- [ ] 并发消息处理测试

---

## 性能考虑

1. **消息查询优化**
   - 使用分页，避免一次加载大量数据
   - 定期清理过期消息
   - 对频繁查询的字段建立索引

2. **WebSocket优化**
   - 实现消息队列，防止消息丢失
   - 使用心跳保持连接活跃
   - 限制单个连接的消息频率

3. **存储优化**
   - 分离热数据和冷数据
   - 定期归档旧消息
   - 压缩存储的消息

---

## 安全考虑

1. ✅ **消息加密** - 考虑在传输层加密敏感消息
2. ✅ **权限检查** - 确保用户只能访问自己的消息
3. ✅ **速率限制** - 防止消息轰炸
4. ✅ **内容过滤** - 过滤不当内容
5. ✅ **消息验证** - 验证消息来源和完整性

---

## 相关文档

- 👉 [Chat Module Skill库](./Chat-Module-skill.md)
- 👉 [项目Agent指南](../agent.md)
- 👉 [通用Skill库](../skill.md)
