# Software Module - Agent 开发指南

## 模块概述

**模块名**: Software Module  
**功能**: 软件管理系统  
**核心能力**: 软件列表、软件上传、软件版本管理、下载计数

---

## 核心接口设计

### 1. 获取软件列表
**接口**: `GET /api/software/list`

**查询参数**:
- `category`: 软件分类
- `limit`: 每页数量
- `offset`: 分页偏移

**响应**:
```javascript
{
  code: 200,
  data: {
    software: [
      {
        id: string,
        name: string,
        version: string,
        description: string,
        downloadUrl: string,
        downloadCount: number,
        uploadedBy: string,
        uploadedAt: timestamp
      }
    ],
    total: number
  }
}
```

---

### 2. 上传软件
**接口**: `POST /api/software/upload`

**认证**: 需要JWT Token

**请求类型**: multipart/form-data

**参数**:
- `file`: 软件文件
- `name`: 软件名称
- `version`: 版本号
- `category`: 分类
- `description`: 描述

---

### 3. 下载软件
**接口**: `GET /api/software/:softwareId/download`

**响应**: 软件文件二进制

---

## 数据模型

### software.json
```json
[
  {
    "id": "uuid",
    "name": "Software Name",
    "version": "1.0.0",
    "description": "...",
    "category": "utility|application|tool",
    "fileUrl": "/uploads/software/...",
    "downloadCount": 10,
    "uploadedBy": "user-id",
    "uploadedAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

---

## 相关文档

- 👉 [Software Module Skill库](./Software-Module-skill.md)
- 👉 [File Module Agent](./File-Module-agent.md)
