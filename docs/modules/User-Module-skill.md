# User Module - Skill 库

## 用户管理技能集

---

## SKILL-U01: 用户注册与密码加密

**目的**: 安全地注册新用户

**实现文件**: `controller/user.controller.js`, `model/user.model.js`

**依赖包**: `md5`, `uuid`

**核心代码**:
```javascript
// model/user.model.js
const md5 = require('md5');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, './users.json');

// 读取用户数据
function readUsers() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// 写入用户数据
function writeUsers(users) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(users, null, 2),
    'utf8'
  );
}

// 创建新用户
function createUser(userData) {
  const { username, password, email } = userData;

  // 检查用户名是否已存在
  const existingUser = getUserByUsername(username);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // 创建新用户对象
  const newUser = {
    id: uuidv4(),
    username,
    password: md5(password),  // 加密密码
    email: email || '',
    avatar: '',
    isOnline: false,
    lastLoginAt: null,
    lastActiveAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 保存到JSON文件
  const users = readUsers();
  users.push(newUser);
  writeUsers(users);

  // 返回用户信息 (不含密码)
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

// 按用户名查询
function getUserByUsername(username) {
  const users = readUsers();
  return users.find(user => user.username === username);
}

// 按ID查询
function getUserById(id) {
  const users = readUsers();
  return users.find(user => user.id === id);
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  readUsers,
  writeUsers
};
```

**Controller实现**:
```javascript
// controller/user.controller.js
const userModel = require('../model/user.model');
const { successResponse, errorResponse } = require('../_requestResponse/response');

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 参数验证
    if (!username || !password) {
      return res.status(400).json(
        errorResponse('Username and password required')
      );
    }

    // 用户名规则验证
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json(
        errorResponse('Username must be 3-20 chars, alphanumeric and underscore only')
      );
    }

    // 密码长度验证
    if (password.length < 6) {
      return res.status(400).json(
        errorResponse('Password must be at least 6 characters')
      );
    }

    // 邮箱验证 (可选)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json(
          errorResponse('Invalid email format')
        );
      }
    }

    // 创建用户
    const user = userModel.createUser({ username, password, email });

    return res.status(201).json(
      successResponse(user, 'User registered successfully')
    );

  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json(
        errorResponse('Username already exists')
      );
    }
    console.error('Register error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};

module.exports = { register };
```

**验证规则**:
- 用户名: 3-20个字符，仅支持字母/数字/下划线
- 密码: 至少6个字符
- 邮箱: 有效的邮箱格式 (可选)

**最佳实践**:
- 密码必须加密存储
- 不返回密码字段到客户端
- 检查用户名唯一性
- 验证所有输入参数
- 记录注册失败的尝试

---

## SKILL-U02: 用户登录与JWT生成

**目的**: 验证用户身份并生成Token

**实现文件**: `controller/user.controller.js`

**依赖包**: `jsonwebtoken`, `md5`

**核心代码**:
```javascript
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const userModel = require('../model/user.model');
const { successResponse, errorResponse } = require('../_requestResponse/response');
const logger = require('../logControl/logger');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      return res.status(400).json(
        errorResponse('Username and password required')
      );
    }

    // 查找用户
    const user = userModel.getUserByUsername(username);
    if (!user) {
      logger.warn(`Login failed: user ${username} not found`);
      return res.status(404).json(
        errorResponse('User not found')
      );
    }

    // 验证密码
    const hashedPassword = md5(password);
    if (hashedPassword !== user.password) {
      logger.warn(`Login failed: invalid password for ${username}`);
      return res.status(401).json(
        errorResponse('Invalid password')
      );
    }

    // 更新登录时间
    user.lastLoginAt = Date.now();
    user.isOnline = true;
    user.lastActiveAt = Date.now();
    user.updatedAt = Date.now();
    userModel.updateUser(user.id, user);

    // 生成JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`User ${username} logged in successfully`);

    return res.json(
      successResponse(
        {
          token,
          userId: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          expiresIn: 86400  // 24小时，单位秒
        },
        'Login successful'
      )
    );

  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};

module.exports = { login };
```

**JWT Payload结构**:
```javascript
{
  userId: string,
  username: string,
  email: string,
  iat: number,      // 签发时间 (自动添加)
  exp: number       // 过期时间 (自动添加)
}
```

**中间件验证Token**:
```javascript
// middware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { errorResponse } = require('../_requestResponse/response');

const authMiddleware = (req, res, next) => {
  try {
    // 从header获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json(
        errorResponse('Token required')
      );
    }

    // 提取Bearer token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json(
        errorResponse('Invalid token format')
      );
    }

    // 验证token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // 将用户信息附加到request
    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        errorResponse('Token expired')
      );
    }
    
    return res.status(401).json(
      errorResponse('Invalid token')
    );
  }
};

module.exports = authMiddleware;
```

**使用示例**:
```javascript
const authMiddleware = require('./middware/auth.middleware');

// 保护需要认证的路由
router.get('/user/profile', authMiddleware, getUserProfile);

// 在控制器中访问用户信息
const getUserProfile = (req, res) => {
  const userId = req.user.userId;  // 从middleware附加的对象获取
  // ...
};
```

**安全考虑**:
- 使用HTTPS传输Token
- Token应该存储在httpOnly Cookie或localStorage
- 定期刷新Token
- Token过期后需要重新登录
- 记录登录失败的尝试

---

## SKILL-U03: 用户在线状态维护

**目的**: 实时维护用户在线/离线状态

**实现文件**: `cron/updateUser.js`, `Event/userStatus.js`

**核心逻辑**:
```javascript
// cron/updateUser.js
const cron = require('node-cron');
const userModel = require('../model/user.model');
const logger = require('../logControl/logger');
const eventBus = require('../Event');

// 每10秒检查一次用户在线状态
cron.schedule('*/10 * * * * *', () => {
  try {
    const users = userModel.getAllUsers();
    const now = Date.now();
    const timeoutMs = 30000;  // 30秒无活动则离线

    users.forEach(user => {
      const lastActive = user.lastActiveAt || user.createdAt;
      const inactivityTime = now - lastActive;

      // 如果无活动时间超过30秒且仍标记为在线，则标记为离线
      if (inactivityTime > timeoutMs && user.isOnline) {
        user.isOnline = false;
        user.updatedAt = now;
        userModel.updateUser(user.id, user);

        // 发送离线事件
        eventBus.emit('user-offline', {
          userId: user.id,
          username: user.username,
          timestamp: now
        });

        logger.info(`User ${user.username} marked as offline`);
      }
    });
  } catch (error) {
    logger.error('Error updating user status:', error);
  }
});
```

**在WebSocket中更新活动时间**:
```javascript
// Socket/index.js
const WebSocket = require('ws');
const userModel = require('../model/user.model');
const jwt = require('jsonwebtoken');

const wsServer = new WebSocket.Server({
  port: process.env.WEBSOCKET_PORT || 9998
});

wsServer.on('connection', (ws, req) => {
  try {
    // 从URL获取token
    const url = new URL(`http://${req.headers.host}${req.url}`);
    const token = url.searchParams.get('token');

    // 验证token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    const userId = decoded.userId;
    ws.userId = userId;

    // 标记用户为在线
    const user = userModel.getUserById(userId);
    if (user) {
      user.isOnline = true;
      user.lastActiveAt = Date.now();
      userModel.updateUser(userId, user);
    }

    logger.info(`User ${userId} connected via WebSocket`);

    // 监听消息
    ws.on('message', (data) => {
      try {
        // 每次接收消息都更新活动时间
        const user = userModel.getUserById(userId);
        if (user) {
          user.lastActiveAt = Date.now();
          userModel.updateUser(userId, user);
        }

        const message = JSON.parse(data);
        // 处理消息...
      } catch (err) {
        logger.error('Error handling message:', err);
      }
    });

    // 断开连接
    ws.on('close', () => {
      const user = userModel.getUserById(userId);
      if (user) {
        user.isOnline = false;
        userModel.updateUser(userId, user);
      }
      logger.info(`User ${userId} disconnected`);
    });

  } catch (error) {
    logger.error('WebSocket connection error:', error);
    ws.close();
  }
});
```

**事件系统**:
```javascript
// Event/userStatus.js
const EventEmitter = require('events');

class UserStatusEmitter extends EventEmitter {}
const eventBus = new UserStatusEmitter();

// 监听用户上线事件
eventBus.on('user-online', (data) => {
  console.log(`${data.username} is now online`);
  // 通知其他在线用户
});

// 监听用户离线事件
eventBus.on('user-offline', (data) => {
  console.log(`${data.username} is now offline`);
  // 通知其他在线用户
});

module.exports = eventBus;
```

**最佳实践**:
- 使用合理的超时时间 (建议30秒)
- 频繁发送心跳包保持连接活跃
- WebSocket断开时立即标记为离线
- 使用事件通知其他用户状态变化
- 记录在线/离线事件日志

---

## SKILL-U04: 用户资料更新与头像上传

**目的**: 允许用户修改个人信息和头像

**实现文件**: `controller/user.controller.js`, `middware/upload.middleware.js`

**核心代码**:
```javascript
// controller/user.controller.js
const userModel = require('../model/user.model');
const { successResponse, errorResponse } = require('../_requestResponse/response');
const fs = require('fs');
const path = require('path');

// 更新用户资料
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;  // 从JWT获取
    const { email, bio } = req.body;

    // 验证用户存在
    const user = userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json(
        errorResponse('User not found')
      );
    }

    // 如果更新邮箱，检查唯一性
    if (email && email !== user.email) {
      const existingUser = userModel.getAllUsers()
        .find(u => u.email === email);
      
      if (existingUser) {
        return res.status(409).json(
          errorResponse('Email already exists')
        );
      }
    }

    // 更新用户信息
    if (email) user.email = email;
    if (bio) user.bio = bio;
    user.updatedAt = Date.now();

    userModel.updateUser(userId, user);

    // 返回更新后的用户信息 (不含密码)
    const { password: _, ...userWithoutPassword } = user;
    return res.json(
      successResponse(userWithoutPassword, 'Profile updated')
    );

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};

// 上传头像
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 检查文件是否上传
    if (!req.files || !req.files.file) {
      return res.status(400).json(
        errorResponse('File required')
      );
    }

    const file = req.files.file;

    // 验证文件类型
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(415).json(
        errorResponse('Invalid file type. Allowed: jpg, png, gif')
      );
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(413).json(
        errorResponse('File too large. Max size: 10MB')
      );
    }

    // 生成文件名
    const ext = path.extname(file.name).toLowerCase();
    const filename = `${userId}-${Date.now()}${ext}`;
    const uploadPath = path.join(
      __dirname,
      '../uploads/avatars',
      filename
    );

    // 创建uploads目录 (如果不存在)
    const uploadDir = path.dirname(uploadPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 保存文件
    await file.mv(uploadPath);

    // 更新用户头像
    const user = userModel.getUserById(userId);
    
    // 删除旧头像
    if (user.avatar) {
      const oldPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // 设置新头像
    const avatarUrl = `/uploads/avatars/${filename}`;
    user.avatar = avatarUrl;
    user.updatedAt = Date.now();

    userModel.updateUser(userId, user);

    return res.json(
      successResponse(
        { avatarUrl },
        'Avatar uploaded successfully'
      )
    );

  } catch (error) {
    console.error('Upload avatar error:', error);
    return res.status(500).json(
      errorResponse('Upload failed')
    );
  }
};

module.exports = { updateProfile, uploadAvatar };
```

**文件上传中间件**:
```javascript
// middware/upload.middleware.js
const fileUpload = require('express-fileupload');

const uploadMiddleware = fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  abortOnLimit: true,
  responseOnLimit: '文件过大',
  useTempFiles: true,
  tempFileDir: '/tmp/',
  safeFileNames: true,
  preserveExtension: true
});

module.exports = uploadMiddleware;
```

**最佳实践**:
- 验证文件类型和大小
- 使用UUID或用户ID作为文件名前缀
- 删除旧文件以节省空间
- 创建必要的目录结构
- 记录文件操作日志
- 使用异步文件操作
- 提供清晰的错误消息

---

## 快速参考

### 常用方法
```javascript
// Model操作
userModel.createUser(userData)
userModel.getUserById(id)
userModel.getUserByUsername(username)
userModel.updateUser(id, updates)
userModel.deleteUser(id)
userModel.getAllUsers()

// 密码相关
md5(password)
jwt.sign(payload, secret, options)
jwt.verify(token, secret)

// 文件操作
file.mv(uploadPath)
fs.unlinkSync(filePath)

// 事件
eventBus.emit('event-name', data)
eventBus.on('event-name', (data) => {})
```

### 错误处理
```javascript
if (!username || !password) {
  return errorResponse('Parameters required', 400);
}

if (!existingUser) {
  return errorResponse('User not found', 404);
}

if (md5(password) !== user.password) {
  return errorResponse('Invalid password', 401);
}
```

---

## 测试用例

### 单元测试
```javascript
describe('User Module', () => {
  
  test('Should create a new user', () => {
    const userData = {
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com'
    };
    
    const user = userModel.createUser(userData);
    expect(user.id).toBeDefined();
    expect(user.username).toBe('testuser');
  });
  
  test('Should not create duplicate username', () => {
    expect(() => {
      userModel.createUser({
        username: 'testuser',
        password: 'password123'
      });
    }).toThrow('User already exists');
  });
  
  test('Should login with correct credentials', () => {
    const result = login('testuser', 'password123');
    expect(result.token).toBeDefined();
    expect(result.userId).toBeDefined();
  });
});
```

---

## 版本历史

- **v1.0**: 初始用户模块实现
- **v1.1**: 添加头像上传功能
- **v1.2**: 优化在线状态维护
- **v1.3**: 添加参数校验和错误处理
