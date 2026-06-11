# Issue Module - Skill 库

## Issue反馈技能集

---

## SKILL-I01: Issue提交与管理

**目的**: 处理Issue的整个生命周期

**实现文件**: `controller/issue.controller.js`, `model/issue.model.js`

**核心代码**:
```javascript
const createIssue = (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, category, priority } = req.body;

    const issue = {
      id: uuidv4(),
      title,
      description,
      category,
      priority,
      status: 'open',
      submittedBy: userId,
      comments: [],
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const issues = readIssues();
    issues.push(issue);
    writeIssues(issues);

    return res.status(201).json(
      successResponse(issue, 'Issue created')
    );
  } catch (error) {
    logger.error('Create issue error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};
```

---

## SKILL-I02: Issue评论管理

**目的**: 添加、修改、删除评论

**核心代码**:
```javascript
const addComment = (req, res) => {
  try {
    const { issueId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const issues = readIssues();
    const issue = issues.find(i => i.id === issueId);

    if (!issue) {
      return res.status(404).json(
        errorResponse('Issue not found')
      );
    }

    const comment = {
      id: uuidv4(),
      content,
      author: userId,
      createdAt: Date.now()
    };

    issue.comments.push(comment);
    issue.updatedAt = Date.now();

    const index = issues.findIndex(i => i.id === issueId);
    issues[index] = issue;
    writeIssues(issues);

    return res.status(201).json(
      successResponse(comment, 'Comment added')
    );
  } catch (error) {
    logger.error('Add comment error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};
```

---

## 版本历史

- **v1.0**: 初始 Issue模块
