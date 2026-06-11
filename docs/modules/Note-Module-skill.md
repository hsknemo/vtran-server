# Note Module - Skill 库

## 笔记管理技能集

---

## SKILL-N01: 实時全文搜索

**目的**: 不传検郸笔记内容

**实现文件**: `model/note.model.js`

**核心代码**:
```javascript
function searchNotes(keyword, limit = 50) {
  const notes = readNotes()
    .filter(n => n.isPublic)  // 仅搜索公开笔记
    .filter(n => 
      n.title.toLowerCase().includes(keyword.toLowerCase()) ||
      n.content.toLowerCase().includes(keyword.toLowerCase()) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase())))
    )
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);

  return {
    notes,
    total: notes.length
  };
}
```

---

## SKILL-N02: Markdown导出

**目的**: 为Markdown格式导出

**实现文件**: `controller/note.controller.js`

**核心代码**:
```javascript
const exportMarkdown = (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.userId;

    const note = noteModel.getNoteById(noteId);
    if (!note) {
      return res.status(404).json(
        errorResponse('Note not found')
      );
    }

    // 权限检查
    if (note.createdBy !== userId) {
      return res.status(403).json(
        errorResponse('Cannot export other user\'s note')
      );
    }

    // 构建完整的Markdown内容
    const markdown = `# ${note.title}

${note.content}

---

**创建于**: ${new Date(note.createdAt).toLocaleString()}

**修改于**: ${new Date(note.updatedAt).toLocaleString()}
`;

    // 设置响应头
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${note.title}.md"`
    );

    return res.send(markdown);
  } catch (error) {
    logger.error('Export markdown error:', error);
    return res.status(500).json(
      errorResponse('Export failed')
    );
  }
};
```

---

## SKILL-N03: 标签管理

**目的**: 管理笔记标签、按标签筛选

**核心操作**:
```javascript
// 查询每个标签有料笔记
function getTagStats(userId) {
  const notes = readNotes()
    .filter(n => n.createdBy === userId);

  const tagStats = {};

  notes.forEach(note => {
    if (note.tags) {
      note.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    }
  });

  return Object.entries(tagStats).map(([tag, count]) => ({
    tag,
    count
  }));
}

// 按标签筛选
function getNotesByTag(userId, tag, limit = 20, offset = 0) {
  const notes = readNotes()
    .filter(n => n.createdBy === userId)
    .filter(n => n.tags && n.tags.includes(tag))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const total = notes.length;
  const paginated = notes.slice(offset, offset + limit);

  return {
    notes: paginated,
    total,
    page: Math.floor(offset / limit) + 1
  };
}
```

---

## SKILL-N04: 笔记版本管理

**目的**: 卫护笔记改动历史 (可选)

**核心代码**:
```javascript
// 记录笔记版本
function saveVersion(noteId) {
  const note = getNoteById(noteId);
  const versions = readVersions();

  const version = {
    id: uuidv4(),
    noteId,
    title: note.title,
    content: note.content,
    tags: note.tags,
    createdAt: Date.now()
  };

  versions.push(version);
  writeVersions(versions);
  return version;
}

// 恢复版本
function restoreVersion(versionId, noteId) {
  const versions = readVersions();
  const version = versions.find(v => v.id === versionId);

  if (!version) {
    throw new Error('Version not found');
  }

  const note = getNoteById(noteId);
  note.title = version.title;
  note.content = version.content;
  note.tags = version.tags;
  note.updatedAt = Date.now();

  const notes = readNotes();
  const index = notes.findIndex(n => n.id === noteId);
  notes[index] = note;
  writeNotes(notes);

  return note;
}
```

---

## 版本历史

- **v1.0**: 初始笔记模块
- **v1.1**: 添加搜索功能
