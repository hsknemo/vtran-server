# Note Module - Agent 开发指南

## 模块概述

**模块名**: Note Module  
**功能**: 笔记管理系统  
**核心能力**: 笔记增削改查、分笔记类別、不传検郸、导出为Markdown、公开搜索

---

## 系统架构

### 目录结构
```
note/
├── note.controller.js      # HTTP控制器
├── note.service.js         # 业务逻辑服务
├── note.model.js           # 数据访问层
└── model/
    └── notes.json           # 笔记数据
```

### 数据流向
```
创建笔记:
Client → HTTP POST → Controller → Service → Model → notes.json

搜索笔记:
Client ← HTTP GET + 关键词 ← 全文搜索
```

---

## 核心接口设计

### 1. 创建笔记
**接口**: `POST /api/note/create`

**认证**: 需要JWT Token

**请求参数**:
```javascript
{
  title: string,           // 标题 (必填)
  content: string,         // 内容 (可是Markdown)
  tags: [string],          // 标签 (可选)
  isPublic: boolean        // 是否公开 (默认false)
}
```

**响应**:
```javascript
{
  code: 201,
  data: {
    id: "uuid",
    title: string,
    content: string,
    tags: [string],
    isPublic: boolean,
    createdBy: string,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

---

### 2. 获取我的笔记列表
**接口**: `GET /api/note/list`

**认证**: 需要JWT Token

**查询参数**:
- `limit`: 每页数量 (默认20)
- `offset`: 分页偏移
- `tags`: 按标签筛选 (可选)
- `isPublic`: 布尔值 (可选)

**响应**:
```javascript
{
  code: 200,
  data: {
    notes: [
      {
        id: string,
        title: string,
        content: string,
        tags: [string],
        isPublic: boolean,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ],
    total: number,
    page: number
  }
}
```

---

### 3. 获取笔记详情
**接口**: `GET /api/note/:noteId`

**认证**: 需要JWT Token (公开笔记不需要)

**响应**:
```javascript
{
  code: 200,
  data: {
    id: string,
    title: string,
    content: string,
    tags: [string],
    isPublic: boolean,
    createdBy: string,
    viewCount: number,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

---

### 4. 改笔记
**接口**: `PUT /api/note/:noteId`

**认证**: 需要JWT Token

**业务规则**:
- 只有的所有者可以修改

**请求参数**:
```javascript
{
  title: string,      // 可选
  content: string,    // 可选
  tags: [string],     // 可选
  isPublic: boolean   // 可选
}
```

---

### 5. 删除笔记
**接口**: `DELETE /api/note/:noteId`

**认证**: 需要JWT Token

**业务规则**:
- 只有所有者可以删除

---

### 6. 搜索权牡笔记
**接口**: `GET /api/note/search`

**认证**: 无需认证 (仅搜索公开笔记)

**查询参数**:
- `keyword`: 搜索关键词 (必填)
- `limit`: 每页数量 (默认20)
- `tags`: 按标签筛选 (可选)

**响应**:
```javascript
{
  code: 200,
  data: {
    notes: [...],
    total: number
  }
}
```

---

### 7. 导出Markdown
**接口**: `GET /api/note/:noteId/export`

**认证**: 需要JWT Token

**响应**: Markdown文件

---

## 数据模型

### notes.json
```json
[
  {
    "id": "uuid",
    "title": "Note Title",
    "content": "# Markdown Content\n...",
    "tags": ["tag1", "tag2"],
    "isPublic": true,
    "viewCount": 15,
    "createdBy": "user-id",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

---

## 开发检查清单

- [ ] 创建笔记功能
- [ ] 改删笔记功能
- [ ] 分笔记类別
- [ ] 全文搜索
- [ ] 公开笔记搜索
- [ ] Markdown导出
- [ ] 查看数统计

---

## 相关文档

- 👉 [Note Module Skill库](./Note-Module-skill.md)
- 👉 [项目Agent指南](../agent.md)
