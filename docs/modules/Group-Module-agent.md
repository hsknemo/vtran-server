# Group Module - Agent 开发指南

## 模块概述

**模块名**: Group Module  
**功能**: 群组管理系统  
**核心能力**: 群组概念、成员管理、权限控制、群群信息更新  
**包含模块**: Chat Module

---

## 系统架构

### 目录结构
```
group/
├── group.controller.js      # HTTP控制器
├── group.service.js         # 业务逻辑服务
├── group.model.js           # 数据访问层
└── model/
    └── groups.json           # 群组数据
```

### 数据流向
```
创建群组:
Client → HTTP POST → Controller → Service → Model → groups.json

增加成员:
Client → HTTP POST → Controller → Service → Model → groups.json
         ↓
    Event Bus → Broadcast to Group
```

---

## 核心接口设计

### 1. 创建群组
**接口**: `POST /api/group/create`

**认证**: 需要JWT Token

**请求参数**:
```javascript
{
  name: string,              // 群组名称 (必填)
  description: string,       // 描述 (可选)
  avatar: string,           // 群管着URL (可选)
  memberIds: [string]       // 群组成员ID数组 (可选)
}
```

**响应**:
```javascript
{
  code: 200,
  data: {
    id: "uuid",
    name: string,
    description: string,
    avatar: string,
    createdBy: string,
    members: [string],
    memberCount: number,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

---

### 2. 获取群组列表
**接口**: `GET /api/group/list`

**认证**: 需要JWT Token

**查询参数**:
- `limit`: 每页数量 (默认20)
- `offset`: 分页偏移 (默认0)
- `search`: 群组名搜索 (可选)

**响应**:
```javascript
{
  code: 200,
  data: {
    groups: [
      {
        id: string,
        name: string,
        avatar: string,
        memberCount: number,
        createdBy: string,
        createdAt: timestamp
      }
    ],
    total: number,
    page: number
  }
}
```

---

### 3. 获取群组详情
**接口**: `GET /api/group/:groupId`

**认证**: 需要JWT Token

**响应**:
```javascript
{
  code: 200,
  data: {
    id: string,
    name: string,
    description: string,
    avatar: string,
    createdBy: string,
    members: [
      {
        userId: string,
        username: string,
        avatar: string,
        joinedAt: timestamp
      }
    ],
    memberCount: number,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

---

### 4. 更新群组信息
**接口**: `PUT /api/group/:groupId`

**认证**: 需要JWT Token

**业务规则**:
- 只有群组创建者可以修改

**请求参数**:
```javascript
{
  name: string,           // 可选
  description: string,    // 可选
  avatar: string         // 可选
}
```

---

### 5. 添加群组成员
**接口**: `POST /api/group/:groupId/member`

**认证**: 需要JWT Token

**请求参数**:
```javascript
{
  userId: string,        // 要添加的用户ID (必填)
  role: "member|admin"  // 成员角色 (默认member)
}
```

**响应**:
```javascript
{
  code: 200,
  message: "Member added",
  data: {
    groupId: string,
    userId: string,
    memberCount: number
  }
}
```

---

### 6. 移除群组成员
**接口**: `DELETE /api/group/:groupId/member/:userId`

**认证**: 需要JWT Token

**业务规则**:
- 只有群组创建者或既有管理员可以移除
- 群组仅拉去详情页面不是正辛离会

**响应**:
```javascript
{
  code: 200,
  message: "Member removed",
  data: {
    groupId: string,
    userId: string,
    memberCount: number
  }
}
```

---

### 7. 删除群组
**接口**: `DELETE /api/group/:groupId`

**认证**: 需要JWT Token

**业务规则**:
- 只有群组创建者可以删除
- 删除既有群组和相关消息
- 或仅罫废群组（保留成员和消息）

---

## 数据模型

### groups.json
```json
[
  {
    "id": "uuid",
    "name": "Group Name",
    "description": "Group description",
    "avatar": "/uploads/avatars/group-id.jpg",
    "createdBy": "user-id",
    "members": [
      {
        "userId": "user-id",
        "role": "admin|member",
        "joinedAt": 1234567890
      }
    ],
    "isArchived": false,
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

---

## 开发检查清单

### Phase 1: 需求理解
- [ ] 理解群组成员关系
- [ ] 明确管理员权限
- [ ] 了解群群哨频
- [ ] 阅读Chat Module文档

### Phase 2: 设计
- [ ] 设计群组数据结构
- [ ] 定义成员角色（admin, member）
- [ ] 特别特别设情处理（殙逃）

### Phase 3: 实现
- [ ] 创建 `group.model.js`
- [ ] 创建 `group.service.js`
- [ ] 创建 `group.controller.js`
- [ ] 实现群组管理API

### Phase 4: 事件与通知
- [ ] 处理成员变更事件
- [ ] WebSocket推送群组哨频

### Phase 5: 测试
- [ ] 测试群组创建
- [ ] 测试成员管理
- [ ] 测试权限控制

---

## 安全考虑

1. ✅ **权限检查** - 只有事北人可以管理群组
2. ✅ **成员变更** - 广播群群哨频变更
3. ✅ **概念管理** - 支持上传历史版本
4. ✅ **排查** - 支持群组排查功能

---

## 相关文档

- 👉 [Group Module Skill库](./Group-Module-skill.md)
- 👉 [Chat Module Agent](./Chat-Module-agent.md)
- 👉 [项目Agent指南](../agent.md)
