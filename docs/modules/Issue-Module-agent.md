# Issue Module - Agent 开发指南

## 模块概述

**模块名**: Issue Module  
**功能**: Issue反馈与管理系统  
**核心能力**: 提交Issue、Issue评论、Issue是否解决、提防控制

---

## 核心接口设计

### 1. 提交Issue
**接口**: `POST /api/issue/create`

**认证**: 需要JWT Token

**请求参数**:
```javascript
{
  title: string,           // 标题 (必填)
  description: string,     // 描述 (Markdown)
  category: string,        // 类别: bug|feature|question|other
  priority: string,        // 优先级: low|medium|high|critical
  attachments: [object]    // 附件
}
```

**响应**:
```javascript
{
  code: 201,
  data: {
    id: "uuid",
    title: string,
    description: string,
    category: string,
    priority: string,
    status: "open",
    submittedBy: string,
    createdAt: timestamp
  }
}
```

---

### 2. 获取Issue列表
**接口**: `GET /api/issue/list`

**查询参数**:
- `status`: open|closed|resolved
- `category`: bug|feature|question|other
- `priority`: low|medium|high|critical
- `limit`: 每页数量
- `offset`: 分页偏移

**响应**:
```javascript
{
  code: 200,
  data: {
    issues: [
      {
        id: string,
        title: string,
        category: string,
        priority: string,
        status: string,
        submittedBy: string,
        commentCount: number,
        createdAt: timestamp
      }
    ],
    total: number
  }
}
```

---

### 3. 获取Issue详情
**接口**: `GET /api/issue/:issueId`

**响应**:
```javascript
{
  code: 200,
  data: {
    id: string,
    title: string,
    description: string,
    category: string,
    priority: string,
    status: string,
    submittedBy: string,
    comments: [
      {
        id: string,
        content: string,
        author: string,
        createdAt: timestamp
      }
    ],
    attachments: [...],
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

---

### 4. 提交Issue评论
**接口**: `POST /api/issue/:issueId/comment`

**认证**: 需要JWT Token

**请求参数**:
```javascript
{
  content: string,       // 评论内容 (Markdown)
  attachments: [object]  // 附件
}
```

---

### 5. 更新Issue状态
**接口**: `PUT /api/issue/:issueId/status`

**认证**: 需要JWT Token

**请求参数**:
```javascript
{
  status: "open|closed|resolved",
  resolution: string  // 解决方案
}
```

---

## 数据模型

### issues.json
```json
[
  {
    "id": "uuid",
    "title": "Bug: ...",
    "description": "...",
    "category": "bug",
    "priority": "high",
    "status": "open|closed|resolved",
    "submittedBy": "user-id",
    "comments": [],
    "attachments": [],
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

---

## 开发检查清单

- [ ] Issue提交功能
- [ ] Issue管理功能
- [ ] 评论功能
- [ ] Markdown支持
- [ ] 图片上传
- [ ] Issue云查询

---

## 相关文档

- 👉 [Issue Module Skill库](./Issue-Module-skill.md)
- 👉 [项目Agent指南](../agent.md)
