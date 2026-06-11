# File Module - Skill 库

## 文件管理技能集

---

## SKILL-F01: 文件上传验证

**目的**: 验证上传文件的有效性

**实现文件**: `middware/upload.middleware.js`

**核心代码**:
```javascript
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const logger = require('../logControl/logger');

// 配置
const MAX_FILE_SIZE = 100 * 1024 * 1024;  // 100MB
const ALLOWED_TYPES = {
  document: ['application/pdf', 'application/msword', 'text/plain'],
  image: ['image/jpeg', 'image/png', 'image/gif'],
  video: ['video/mp4', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav']
};

const uploadMiddleware = fileUpload({
  limits: { fileSize: MAX_FILE_SIZE },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
});

// 验证中间件
const validateFileUpload = (req, res, next) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        code: 400,
        message: 'File required'
      });
    }

    const file = req.files.file;

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        code: 413,
        message: `File too large. Max: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }

    // 验证MIME类型
    const allowedMimes = Object.values(ALLOWED_TYPES).flat();
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(415).json({
        code: 415,
        message: 'File type not allowed'
      });
    }

    // 检查文件扩展名 (防止绕过MIME检查)
    const ext = path.extname(file.name).toLowerCase();
    const allowedExts = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.mp4'];
    if (!allowedExts.includes(ext)) {
      return res.status(415).json({
        code: 415,
        message: 'File extension not allowed'
      });
    }

    next();
  } catch (error) {
    logger.error('File validation error:', error);
    res.status(500).json({
      code: 500,
      message: 'Server error'
    });
  }
};

module.exports = { uploadMiddleware, validateFileUpload };
```

**验证规则**:
- 检查文件大小
- 验证MIME类型
- 验证文件扩展名
- 检查文件签名 (可选)

---

## SKILL-F02: 分片上传与合并

**目的**: 支持大文件分片上传和合并

**实现文件**: `controller/file.controller.js`, `model/file.model.js`

**核心代码**:
```javascript
// model/file.model.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const CHUNKS_DIR = path.join(__dirname, '../uploads/chunks');
const FILES_DIR = path.join(__dirname, '../uploads/files');
const METADATA_FILE = path.join(__dirname, './files.json');

// 确保目录存在
[CHUNKS_DIR, FILES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 读取元数据
function readMetadata() {
  try {
    const data = fs.readFileSync(METADATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// 写入元数据
function writeMetadata(files) {
  fs.writeFileSync(
    METADATA_FILE,
    JSON.stringify(files, null, 2),
    'utf8'
  );
}

// 上传分片
function uploadChunk(fileId, chunkIndex, chunkFile) {
  const chunkPath = path.join(CHUNKS_DIR, `${fileId}-${chunkIndex}`);
  
  // 移动文件到块目录
  chunkFile.mv(chunkPath);
  
  return {
    fileId,
    chunkIndex,
    saved: true
  };
}

// 合并分片
function mergeChunks(fileId, chunkTotal, filename, uploadedBy) {
  return new Promise((resolve, reject) => {
    try {
      // 生成最终文件名
      const ext = path.extname(filename);
      const finalFilename = `${fileId}${ext}`;
      const finalPath = path.join(FILES_DIR, finalFilename);

      // 创建写入流
      const writeStream = fs.createWriteStream(finalPath);
      let totalSize = 0;

      // 按顺序读取并合并分片
      const processChunk = (index) => {
        if (index >= chunkTotal) {
          writeStream.end();
          return;
        }

        const chunkPath = path.join(CHUNKS_DIR, `${fileId}-${index}`);
        const readStream = fs.createReadStream(chunkPath);

        readStream.on('data', (chunk) => {
          totalSize += chunk.length;
        });

        readStream.on('end', () => {
          // 删除分片
          fs.unlinkSync(chunkPath);
          processChunk(index + 1);
        });

        readStream.pipe(writeStream, { end: false });
      };

      writeStream.on('finish', () => {
        // 计算文件哈希
        const hash = calculateFileHash(finalPath);

        // 创建元数据
        const fileMetadata = {
          id: fileId,
          filename,
          originalFilename: filename,
          size: totalSize,
          type: getFileType(ext),
          mimeType: getMimeType(ext),
          uploadedBy,
          uploadedAt: Date.now(),
          downloadCount: 0,
          lastDownloadAt: null,
          fileUrl: `/uploads/files/${finalFilename}`,
          description: '',
          isPublic: false,
          tags: [],
          hash
        };

        // 保存元数据
        const files = readMetadata();
        files.push(fileMetadata);
        writeMetadata(files);

        resolve(fileMetadata);
      });

      writeStream.on('error', reject);
      processChunk(0);
    } catch (error) {
      reject(error);
    }
  });
}

// 计算文件哈希
function calculateFileHash(filePath) {
  const hash = crypto.createHash('md5');
  const stream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// 获取文件类型
function getFileType(ext) {
  const types = {
    '.pdf': 'document',
    '.doc': 'document',
    '.docx': 'document',
    '.xls': 'document',
    '.xlsx': 'document',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.mp4': 'video',
    '.avi': 'video',
    '.mp3': 'audio',
    '.wav': 'audio'
  };
  return types[ext.toLowerCase()] || 'other';
}

// 获取MIME类型
function getMimeType(ext) {
  const types = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav'
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

module.exports = {
  uploadChunk,
  mergeChunks,
  calculateFileHash,
  getFileType,
  getMimeType,
  readMetadata,
  writeMetadata
};

// controller/file.controller.js
const fileModel = require('../model/file.model');
const { successResponse, errorResponse } = require('../_requestResponse/response');
const { v4: uuidv4 } = require('uuid');

// 上传分片
const uploadChunk = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fileId = uuidv4(),
      chunkIndex,
      chunkTotal,
      filename
    } = req.body;

    if (chunkIndex === undefined || chunkTotal === undefined) {
      return res.status(400).json(
        errorResponse('chunkIndex and chunkTotal required')
      );
    }

    // 验证分片索引
    if (chunkIndex < 0 || chunkIndex >= chunkTotal) {
      return res.status(400).json(
        errorResponse('Invalid chunk index')
      );
    }

    // 上传分片
    const result = fileModel.uploadChunk(fileId, chunkIndex, req.files.file);

    return res.json(successResponse(
      {
        fileId,
        chunkIndex,
        chunkTotal,
        uploadedSize: req.files.file.size
      },
      'Chunk uploaded'
    ));
  } catch (error) {
    console.error('Upload chunk error:', error);
    return res.status(500).json(
      errorResponse('Upload failed')
    );
  }
};

// 合并分片
const mergeChunks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fileId, filename, chunkTotal } = req.body;

    if (!fileId || !filename || chunkTotal === undefined) {
      return res.status(400).json(
        errorResponse('fileId, filename and chunkTotal required')
      );
    }

    // 合并分片
    const fileMetadata = await fileModel.mergeChunks(
      fileId,
      chunkTotal,
      filename,
      userId
    );

    return res.json(successResponse(
      fileMetadata,
      'File merged successfully'
    ));
  } catch (error) {
    console.error('Merge chunks error:', error);
    return res.status(500).json(
      errorResponse('Merge failed')
    );
  }
};

module.exports = { uploadChunk, mergeChunks };
```

**最佳实践**:
- 验证分片索引有效性
- 按顺序合并分片
- 合并后删除临时分片
- 计算文件哈希用于完整性检查
- 记录上传日志

---

## SKILL-F03: 文件下载处理

**目的**: 支持文件下载和断点续传

**实现文件**: `controller/file.controller.js`

**核心代码**:
```javascript
const fs = require('fs');
const path = require('path');

const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.userId;
    const FILES_DIR = path.join(__dirname, '../uploads/files');

    // 查找文件元数据
    const files = fileModel.readMetadata();
    const fileMetadata = files.find(f => f.id === fileId);

    if (!fileMetadata) {
      return res.status(404).json(
        errorResponse('File not found')
      );
    }

    // 权限检查 (如果文件私密)
    if (!fileMetadata.isPublic && fileMetadata.uploadedBy !== userId) {
      return res.status(403).json(
        errorResponse('Access denied')
      );
    }

    const filePath = path.join(FILES_DIR, path.basename(fileMetadata.fileUrl));

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json(
        errorResponse('File not found on server')
      );
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // 处理断点续传
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return res.status(416).json(
          errorResponse('Range not satisfiable')
        );
      }

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', end - start + 1);
      res.setHeader('Accept-Ranges', 'bytes');

      const stream = fs.createReadStream(filePath, { start, end });
      return stream.pipe(res);
    }

    // 完整下载
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileMetadata.originalFilename}"`
    );
    res.setHeader('Content-Type', fileMetadata.mimeType);

    // 更新下载统计
    fileMetadata.downloadCount++;
    fileMetadata.lastDownloadAt = Date.now();
    const updatedFiles = files.map(f =>
      f.id === fileId ? fileMetadata : f
    );
    fileModel.writeMetadata(updatedFiles);

    // 流式下载
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json(
      errorResponse('Download failed')
    );
  }
};
```

**断点续传支持**:
- 处理Range请求头
- 返回206 Partial Content状态码
- 设置Content-Range响应头
- 使用流式传输

---

## SKILL-F04: 文件元数据管理

**目的**: 管理和查询文件元数据

**核心操作**:
```javascript
// 获取文件列表
const getFileList = async (req, res) => {
  const { limit = 20, offset = 0, type, search } = req.query;
  const userId = req.user.userId;

  let files = fileModel.readMetadata()
    .filter(f => f.uploadedBy === userId);

  // 类型过滤
  if (type) {
    files = files.filter(f => f.type === type);
  }

  // 搜索过滤
  if (search) {
    files = files.filter(f =>
      f.originalFilename.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = files.length;
  const paginated = files
    .sort((a, b) => b.uploadedAt - a.uploadedAt)
    .slice(offset, offset + limit);

  return res.json(successResponse({
    files: paginated,
    total,
    page: Math.floor(offset / limit) + 1,
    limit: parseInt(limit)
  }));
};

// 删除文件
const deleteFile = async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.userId;

  const files = fileModel.readMetadata();
  const file = files.find(f => f.id === fileId);

  if (!file) {
    return res.status(404).json(
      errorResponse('File not found')
    );
  }

  // 权限检查
  if (file.uploadedBy !== userId) {
    return res.status(403).json(
      errorResponse('Cannot delete other user\'s file')
    );
  }

  // 删除物理文件
  const filePath = path.join(
    __dirname,
    '..',
    file.fileUrl
  );
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // 更新元数据
  const updated = files.filter(f => f.id !== fileId);
  fileModel.writeMetadata(updated);

  return res.json(successResponse(null, 'File deleted'));
};
```

---

## 版本历史

- **v1.0**: 初始文件模块实现
- **v1.1**: 添加分片上传
- **v1.2**: 添加断点续传
- **v1.3**: 优化并发上传
