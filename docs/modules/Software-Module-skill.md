# Software Module - Skill 库

## 软件管理技能集

---

## SKILL-S01: 软件上传与版本管理

**目的**: 管理软件软件版本

**实现文件**: `controller/software.controller.js`

**核心代码**:
```javascript
const uploadSoftware = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, version, category, description } = req.body;

    if (!req.files || !req.files.file) {
      return res.status(400).json(
        errorResponse('File required')
      );
    }

    const file = req.files.file;
    const softwareId = uuidv4();
    const ext = path.extname(file.name);
    const filename = `${softwareId}${ext}`;
    const uploadPath = path.join(
      __dirname,
      '../uploads/software',
      filename
    );

    // 创建uploads目录
    const uploadDir = path.dirname(uploadPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 保存文件
    await file.mv(uploadPath);

    // 创建软件记录
    const software = {
      id: softwareId,
      name,
      version,
      description,
      category,
      fileUrl: `/uploads/software/${filename}`,
      downloadCount: 0,
      uploadedBy: userId,
      uploadedAt: Date.now(),
      updatedAt: Date.now()
    };

    const softwareList = readSoftware();
    softwareList.push(software);
    writeSoftware(softwareList);

    return res.status(201).json(
      successResponse(software, 'Software uploaded')
    );
  } catch (error) {
    logger.error('Upload software error:', error);
    return res.status(500).json(
      errorResponse('Upload failed')
    );
  }
};
```

---

## 版本历史

- **v1.0**: 初始软件模块
