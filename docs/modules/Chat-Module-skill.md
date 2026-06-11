# Chat Module - Skill 库

## 聊天模块技能集

---

## SKILL-C01: WebSocket 连接管理

**目的**: 管理WebSocket客户端连接，维护在线用户列表

**实现文件**: `Socket/index.js`

**核心代码**:
```javascript
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');
const logger = require('../logControl/logger');

// 存储在线用户
const onlineUsers = new Map();

const wsServer = new WebSocket.Server({
  port: process.env.WEBSOCKET_PORT || 9998
});

wsServer.on('connection', (ws, req) => {
  try {
    // 从URL获取token
    const url = new URL(`http://${req.headers.host}${req.url}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    // 验证token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    const userId = decoded.userId;
    const username = decoded.username;

    // 注册用户连接
    ws.userId = userId;
    ws.username = username;
    onlineUsers.set(userId, {
      ws,
      username,
      connectedAt: Date.now()
    });

    logger.info(`User ${username} (${userId}) connected`);

    // 广播用户上线
    broadcastUserStatus({
      type: 'user-online',
      data: {
        userId,
        username,
        timestamp: Date.now()
      }
    });

    // 监听消息
    ws.on('message', (data) => {
      try {
        handleMessage(ws, data);
      } catch (err) {
        logger.error('Error handling message:', err);
      }
    });

    // 处理错误
    ws.on('error', (error) => {
      logger.error(`WebSocket error for ${userId}:`, error);
    });

    // 连接关闭
    ws.on('close', () => {
      onlineUsers.delete(userId);
      logger.info(`User ${username} (${userId}) disconnected`);

      // 广播用户离线
      broadcastUserStatus({
        type: 'user-offline',
        data: {
          userId,
          username,
          timestamp: Date.now()
        }
      });
    });

  } catch (error) {
    logger.error('Connection error:', error);
    ws.close(1008, 'Authentication failed');
  }
});

// 获取在线用户列表
function getOnlineUsers() {
  return Array.from(onlineUsers.entries()).map(([userId, info]) => ({
    userId,
    username: info.username,
    connectedAt: info.connectedAt
  }));
}

// 广播用户状态
function broadcastUserStatus(message) {
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// 获取特定用户的WebSocket连接
function getUserSocket(userId) {
  const user = onlineUsers.get(userId);
  return user ? user.ws : null;
}

module.exports = {
  wsServer,
  onlineUsers,
  getOnlineUsers,
  broadcastUserStatus,
  getUserSocket
};
```

**最佳实践**:
- 使用Map存储用户连接，快速查找
- 验证token后才接受连接
- 记录连接/断开日志
- 处理连接错误和异常
- 定期检查并清理僵尸连接

---

## SKILL-C02: 消息路由与分发

**目的**: 根据消息类型将消息发送到正确的目标

**实现文件**: `Socket/handlers.js`

**核心代码**:
```javascript
const chatModel = require('../model/chat.model');
const { onlineUsers, wsServer, getUserSocket } = require('./index');
const logger = require('../logControl/logger');
const { v4: uuidv4 } = require('uuid');

// 处理消息
function handleMessage(ws, data) {
  try {
    const message = JSON.parse(data);

    switch (message.type) {
      case 'ping':
        handlePing(ws);
        break;

      case 'client-chat-message':
        handleSingleChatMessage(ws, message.data);
        break;

      case 'client-chat-group-message':
        handleGroupChatMessage(ws, message.data);
        break;

      case 'user-typing':
        handleTypingStatus(ws, message.data);
        break;

      case 'message-read':
        handleMessageRead(ws, message.data);
        break;

      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
  } catch (err) {
    logger.error('Error parsing message:', err);
  }
}

// 心跳
function handlePing(ws) {
  ws.send(JSON.stringify({
    type: 'pong',
    timestamp: Date.now()
  }));
}

// 单聊消息
function handleSingleChatMessage(ws, data) {
  const {
    toUserId,
    content,
    contentType = 'text',
    messageId = uuidv4()
  } = data;

  const fromUserId = ws.userId;
  const timestamp = Date.now();

  // 保存到数据库
  const chatMessage = {
    id: messageId,
    fromUserId,
    toUserId,
    content,
    contentType,
    status: 'sent',
    timestamp,
    readAt: null
  };

  chatModel.saveMessage(chatMessage);

  // 发送确认
  ws.send(JSON.stringify({
    type: 'server-chat-message-ack',
    data: {
      messageId,
      status: 'success',
      timestamp
    }
  }));

  // 尝试发送给接收者
  const receiverSocket = getUserSocket(toUserId);
  if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
    receiverSocket.send(JSON.stringify({
      type: 'receive-chat-message',
      data: {
        id: messageId,
        fromUserId,
        content,
        contentType,
        timestamp
      }
    }));

    // 更新消息状态为已发送
    chatModel.updateMessageStatus(messageId, 'delivered');
  } else {
    logger.info(`User ${toUserId} is offline, message stored`);
  }
}

// 群聊消息
function handleGroupChatMessage(ws, data) {
  const {
    groupId,
    content,
    contentType = 'text',
    messageId = uuidv4()
  } = data;

  const fromUserId = ws.userId;
  const timestamp = Date.now();

  // 保存到数据库
  const chatMessage = {
    id: messageId,
    groupId,
    fromUserId,
    content,
    contentType,
    status: 'sent',
    timestamp,
    readAt: null
  };

  chatModel.saveGroupMessage(chatMessage);

  // 发送确认
  ws.send(JSON.stringify({
    type: 'server-chat-message-ack',
    data: {
      messageId,
      status: 'success',
      timestamp
    }
  }));

  // 广播给群组所有成员
  wsServer.clients.forEach(client => {
    if (
      client !== ws &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(JSON.stringify({
        type: 'receive-group-chat-message',
        data: {
          id: messageId,
          groupId,
          fromUserId,
          content,
          contentType,
          timestamp
        }
      }));
    }
  });
}

// 输入状态
function handleTypingStatus(ws, data) {
  const { toUserId, groupId, isTyping } = data;
  const fromUserId = ws.userId;

  if (toUserId) {
    // 单聊输入状态
    const receiverSocket = getUserSocket(toUserId);
    if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
      receiverSocket.send(JSON.stringify({
        type: 'user-is-typing',
        data: {
          userId: fromUserId,
          isTyping
        }
      }));
    }
  } else if (groupId) {
    // 群聊输入状态
    wsServer.clients.forEach(client => {
      if (
        client !== ws &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(JSON.stringify({
          type: 'user-is-typing',
          data: {
            userId: fromUserId,
            groupId,
            isTyping
          }
        }));
      }
    });
  }
}

// 标记消息已读
function handleMessageRead(ws, data) {
  const { messageIds } = data;
  const userId = ws.userId;
  const now = Date.now();

  messageIds.forEach(messageId => {
    chatModel.markMessageAsRead(messageId, userId, now);
  });
}

module.exports = { handleMessage };
```

**消息路由逻辑**:
1. 解析消息JSON
2. 根据type字段路由到对应处理器
3. 验证数据有效性
4. 保存到数据模型
5. 发送确认/响应
6. 转发给目标用户

---

## SKILL-C03: 群聊消息广播

**目的**: 将消息分发给群组内所有成员

**实现文件**: `Socket/handlers.js`

**核心概念**:
```javascript
// 广播给所有客户端
function broadcastMessage(message, excludeUserId = null) {
  wsServer.clients.forEach(client => {
    // 排除发送者 (可选)
    if (excludeUserId && client.userId === excludeUserId) {
      return;
    }

    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// 广播给特定群组
function broadcastToGroup(groupId, message, excludeUserId = null) {
  wsServer.clients.forEach(client => {
    // 检查用户是否在群组中
    const isInGroup = checkUserInGroup(client.userId, groupId);

    if (
      isInGroup &&
      client.readyState === WebSocket.OPEN &&
      (!excludeUserId || client.userId !== excludeUserId)
    ) {
      client.send(JSON.stringify(message));
    }
  });
}

// 广播给特定用户列表
function broadcastToUsers(userIds, message) {
  wsServer.clients.forEach(client => {
    if (
      userIds.includes(client.userId) &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(JSON.stringify(message));
    }
  });
}
```

**最佳实践**:
- 检查WebSocket连接状态
- 排除发送者避免重复接收
- 验证用户权限
- 处理广播失败情况
- 记录广播日志

---

## SKILL-C04: 消息历史查询

**目的**: 查询和分页返回聊天历史

**实现文件**: `model/chat.model.js`, `controller/chat.controller.js`

**核心代码**:
```javascript
// model/chat.model.js
const fs = require('fs');
const path = require('path');

const CHAT_FILE = path.join(__dirname, './chats.json');

function readChats() {
  try {
    const data = fs.readFileSync(CHAT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeChats(chats) {
  fs.writeFileSync(
    CHAT_FILE,
    JSON.stringify(chats, null, 2),
    'utf8'
  );
}

// 获取两个用户之间的消息
function getMessages(userId1, userId2, limit = 50, offset = 0) {
  const chats = readChats();

  const messages = chats.filter(chat =>
    (chat.fromUserId === userId1 && chat.toUserId === userId2) ||
    (chat.fromUserId === userId2 && chat.toUserId === userId1)
  );

  // 按时间排序 (最新的在后)
  messages.sort((a, b) => a.timestamp - b.timestamp);

  // 分页
  const total = messages.length;
  const paginated = messages.slice(
    total - offset - limit,
    total - offset
  ).reverse();

  return {
    messages: paginated,
    total,
    page: Math.floor(offset / limit) + 1,
    limit
  };
}

// 获取群组消息
function getGroupMessages(groupId, limit = 50, offset = 0) {
  const chats = readChats();

  const messages = chats
    .filter(chat => chat.groupId === groupId)
    .sort((a, b) => a.timestamp - b.timestamp);

  const total = messages.length;
  const paginated = messages.slice(
    total - offset - limit,
    total - offset
  ).reverse();

  return {
    messages: paginated,
    total,
    page: Math.floor(offset / limit) + 1,
    limit
  };
}

// 搜索消息
function searchMessages(userId, keyword, limit = 50) {
  const chats = readChats();

  const results = chats
    .filter(chat =>
      (chat.fromUserId === userId || chat.toUserId === userId) &&
      chat.content.toLowerCase().includes(keyword.toLowerCase())
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  return {
    messages: results,
    total: results.length
  };
}

// 保存消息
function saveMessage(message) {
  const chats = readChats();
  chats.push(message);
  writeChats(chats);
  return message;
}

module.exports = {
  getMessages,
  getGroupMessages,
  searchMessages,
  saveMessage,
  readChats,
  writeChats
};

// controller/chat.controller.js
const chatModel = require('../model/chat.model');
const { successResponse, errorResponse } = require('../_requestResponse/response');

const getChatHistory = (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, type = 'single' } = req.query;
    const currentUserId = req.user.userId;

    // 权限检查
    if (userId !== currentUserId) {
      return res.status(403).json(
        errorResponse('Cannot view other user\'s messages')
      );
    }

    let result;
    if (type === 'single') {
      // 与所有用户的消息
      const chats = chatModel.readChats();
      const filtered = chats
        .filter(c =>
          (c.fromUserId === userId || c.toUserId === userId) &&
          !c.groupId
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(offset, offset + limit);

      result = {
        messages: filtered,
        total: chats.length
      };
    } else {
      // 群组消息
      result = chatModel.getGroupMessages(
        userId,
        parseInt(limit),
        parseInt(offset)
      );
    }

    return res.json(successResponse(result, 'Messages retrieved'));
  } catch (error) {
    console.error('Get chat history error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};

const searchChat = (req, res) => {
  try {
    const { keyword, limit = 50 } = req.query;
    const userId = req.user.userId;

    if (!keyword) {
      return res.status(400).json(
        errorResponse('Keyword required')
      );
    }

    const result = chatModel.searchMessages(
      userId,
      keyword,
      parseInt(limit)
    );

    return res.json(successResponse(result, 'Search results'));
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};

module.exports = { getChatHistory, searchChat };
```

**查询优化**:
- 使用分页避免一次加载所有数据
- 按时间戳排序
- 支持关键词搜索
- 缓存频繁查询结果

---

## 快速参考

### 常用方法
```javascript
// 消息操作
chatModel.saveMessage(message)
chatModel.getMessages(userId1, userId2, limit, offset)
chatModel.getGroupMessages(groupId, limit, offset)
chatModel.searchMessages(userId, keyword)
chatModel.updateMessageStatus(messageId, status)
chatModel.markMessageAsRead(messageId, userId, timestamp)

// WebSocket操作
getUserSocket(userId)
getOnlineUsers()
broadcastUserStatus(message)
```

### 错误处理
```javascript
if (!toUserId || !content) {
  return errorResponse('Invalid parameters', 400);
}

if (!getUserSocket(toUserId)) {
  return errorResponse('User not online', 404);
}
```

---

## 版本历史

- **v1.0**: 初始聊天模块实现
- **v1.1**: 添加群聊功能
- **v1.2**: 添加消息搜索功能
- **v1.3**: 优化WebSocket连接管理
