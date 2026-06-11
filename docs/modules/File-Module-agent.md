# File Module - Agent 开发指南

## 模块概述

**模块名**: File Module  
**功能**: 文件传输和管理系统  
**核心能力**: 文件上传、下载、删除、分片上传、文件列表、文件共享  
**存储位置**: `uploads/` 目录

---

## 系统架构

### 目录结构
```
file/
├── file.controller.js       # HTTP接口控制器
├── file.service.js          # 业务逻辑服务
├── file.model.js            # 数据访问层
├── middware/
│   └── upload.middleware.js # 文件上传中间件
└── model/
    └── files.json           # 文件元数据

uploads/
├── files/                   # 完整文件
├── chunks/                  # 分片临时目录
└── avatars/                 # 用户头像 (用户模块)
```

### 数据流向
```
上传流程:
Client → HTTP POST → Middleware → Chunk Storage → Merge → File Storage → Model

下载流程:
Client ← HTTP GET ← File Stream ← File Storage

删除流程:
Client ← HTTP DELETE ← File System ← Model
```

---

## 核心接口设计

### 1. 上传文件分片
**接口**: `POST /api/file/upload-chunk`

**认证**: 需要JWT Token

**请求类型**: multipart/form-data

**参数**:
```javascript
{
  file: File,               // 分片文件
  fileId: string,          // 文件唯一ID
  chunkIndex: number,      // 分片索引 (0开始)
  chunkTotal: number,      // 总分片数
  chunkSize: number,       // 每片大小 (字节)
  filename: string         // 原始文件名
}
```

**响应**:
```javascript
{
  code: 200,
  message: "Chunk uploaded",
  data: {
    fileId: string,
    chunkIndex: number,
    chunkTotal: number,
    uploadedSize: number
  }
}
```

---

### 2. 合并分片
**接口**: `POST /api/file/merge-chunks`

**认证**: 需要JWT Token

**请求参数**:
```javascript
{
  fileId: string,          // 文件ID
  filename: string,        // 最终文件名
  chunkTotal: number,      // 总分片数
  fileType: string         // 文件类型 (MIME)
}
```

**响应**:
```javascript
{
  code: 200,
  message: "File merged successfully",
  data: {
    fileId: string,
    filename: string,
    fileUrl: string,
    size: number,
    uploadedAt: timestamp
  }
}
```

---

### 3. 获取文件列表
**接口**: `GET /api/file/list`

**认证**: 需要JWT Token

**查询参数**:
- `limit`: 每页数量 (默认20)
- `offset`: 分页偏移 (默认0)
- `type`: 文件类型 (可选)
- `search`: 文件名搜索 (可选)

**响应**:
```javascript
{
  code: 200,
  data: {
    files: [
      {
        id: "uuid",
        filename: string,
        size: number,
        type: "document|image|video|other",
        mimeType: string,
        uploadedBy: string,
        uploadedAt: timestamp,
        downloadCount: number,
        fileUrl: string
      }
    ],
    total: number,
    page: number,
    limit: number
  }
}
```

---

### 4. 下载文件
**接口**: `GET /api/file/download/:fileId`

**认证**: 需要JWT Token

**响应**: 文件二进制流

**业务规则**:
- 支持断点续传
- 记录下载统计
- 限制下载速度 (可选)

---

### 5. 删除文件
**接口**: `DELETE /api/file/:fileId`

**认证**: 需要JWT Token

**业务规则**:
- 只有上传者可以删除
- 删除后清理磁盘空间
- 记录删除日志

**响应**:
```javascript
{
  code: 200,
  message: "File deleted"
}
```

---

### 6. 获取文件详情
**接口**: `GET /api/file/:fileId`

**认证**: 需要JWT Token

**响应**:
```javascript
{
  code: 200,
  data: {
    id: string,
    filename: string,
    size: number,
    type: string,
    mimeType: string,
    uploadedBy: string,
    uploadedAt: timestamp,
    downloadCount: number,
    lastDownloadAt: timestamp,
    fileUrl: string,
    description: string
  }
}
```

---

## 文件类型分类

```javascript
const FILE_TYPES = {
  'document': ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt'],
  'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  'video': ['mp4', 'avi', 'mov', 'mkv', 'flv'],
  'audio': ['mp3', 'wav', 'aac', 'm4a'],
  'archive': ['zip', 'rar', '7z', 'tar', 'gz'],
  'other': []  // 其他��型
};
```

---

## 数据模型

### files.json
```json
[
  {
    "id": "uuid",
    "filename": "document.pdf",
    "originalFilename": "my-document.pdf",
    "size": 1024000,
    "type": "document",
    "mimeType": "application/pdf",
    "uploadedBy": "user-id",
    "uploadedAt": 1234567890,
    "downloadCount": 5,
    "lastDownloadAt": 1234567890,
    "fileUrl": "/uploads/files/uuid-document.pdf",
    "description": "",
    "isPublic": false,
    "tags": ["important", "contract"],
    "hash": "md5-hash"  // 用于重复检测
  }
]
```

---

## 开发检查清单

### Phase 1: 需求理解
- [ ] 理解分片上传流程
- [ ] 确认文件类型限制
- [ ] 明确存储容量限制
- [ ] 了解断点续传需求
- [ ] 阅读Skill文档: `docs/skill.md` 的SKILL-003

### Phase 2: 设计
- [ ] 设计文件命名规则
- [ ] 定义分片大小 (推荐5MB)
- [ ] 设计文件检验机制
- [ ] 定义上传超时时间
- [ ] 规划磁盘清理策略

### Phase 3: 实现
- [ ] 创建 `file.model.js`
- [ ] 创建 `file.service.js`
- [ ] 创建 `file.controller.js`
- [ ] 实现分片上传
- [ ] 实现分片合并
- [ ] 实现文件下载
- [ ] 实现文件删除
- [ ] 实现文件列表

### Phase 4: 中间件
- [ ] 文件上传中间件
- [ ] 文件大小验证
- [ ] 文件类型验证
- [ ] 磁盘空间检查

### Phase 5: 优化
- [ ] 断点续传支持
- [ ] 文件压缩 (可选)
- [ ] 缓存策略
- [ ] CDN集成 (可选)
- [ ] 并发上传控制

### Phase 6: 测试
- [ ] 小文件上传测试
- [ ] 大文件分片上传测试
- [ ] 分片合并测试
- [ ] 分片遗漏处理
- [ ] 文件下载测试
- [ ] 断点续传测试
- [ ] 并发上传测试
- [ ] 磁盘满情况处理

---

## 性能优化

### 分片大小建议
- 小文件 (< 10MB): 1MB 分片
- 中等文件 (10-100MB): 5MB 分片
- 大文件 (> 100MB): 10-20MB 分片

### 并发控制
- 限制同时上传的分片数 (推荐3-5个)
- 限制单用户的上传数量
- 实现上传队列

### 存储优化
- 定期清理超期临时分片 (48小时)
- 压缩文件备份
- 分层存储 (热数据/冷数据)

---

## 安全考虑

1. ✅ **文件类型验证** - 检查MIME类型，避免恶意文件
2. ✅ **文件大小限制** - 防止磁盘溢出
3. ✅ **权限检查** - 只能删除自己的文件
4. ✅ **文件隔离** - 用户只能访问自己的文��
5. ✅ **病毒扫描** - 集成杀毒引擎 (可选)
6. ✅ **下载限流** - 防止滥用带宽
7. ✅ **访问日志** - 记录所有文件操作

---

## 相关文档

- 👉 [File Module Skill库](./File-Module-skill.md)
- 👉 [项目Agent指南](../agent.md)
- 👉 [通用Skill库](../skill.md)
