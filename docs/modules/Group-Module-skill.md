# Group Module - Skill 库

## 群组管理技能集

---

## SKILL-G01: 群组创建与初始化

**目的**: 创建新群组并初始化成员列表

**实现文件**: `controller/group.controller.js`, `model/group.model.js`

**核心代码**:
```javascript
// model/group.model.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const GROUPS_FILE = path.join(__dirname, './groups.json');

function readGroups() {
  try {
    const data = fs.readFileSync(GROUPS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeGroups(groups) {
  fs.writeFileSync(
    GROUPS_FILE,
    JSON.stringify(groups, null, 2),
    'utf8'
  );
}

function createGroup(groupData, creatorId) {
  const group = {
    id: uuidv4(),
    name: groupData.name,
    description: groupData.description || '',
    avatar: groupData.avatar || '',
    createdBy: creatorId,
    members: [
      {
        userId: creatorId,
        role: 'admin',
        joinedAt: Date.now()
      }
    ],
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 添加其他成员
  if (groupData.memberIds && Array.isArray(groupData.memberIds)) {
    groupData.memberIds.forEach(userId => {
      if (userId !== creatorId) {
        group.members.push({
          userId,
          role: 'member',
          joinedAt: Date.now()
        });
      }
    });
  }

  const groups = readGroups();
  groups.push(group);
  writeGroups(groups);

  return group;
}

function getGroupById(groupId) {
  const groups = readGroups();
  return groups.find(g => g.id === groupId);
}

function addMember(groupId, userId, role = 'member') {
  const groups = readGroups();
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    throw new Error('Group not found');
  }

  // 检查成员是否已存在
  if (group.members.some(m => m.userId === userId)) {
    throw new Error('User already in group');
  }

  group.members.push({
    userId,
    role,
    joinedAt: Date.now()
  });

  group.updatedAt = Date.now();
  writeGroups(groups);

  return group;
}

function removeMember(groupId, userId) {
  const groups = readGroups();
  const group = groups.find(g => g.id === groupId);

  if (!group) {
    throw new Error('Group not found');
  }

  group.members = group.members.filter(m => m.userId !== userId);
  group.updatedAt = Date.now();
  writeGroups(groups);

  return group;
}

module.exports = {
  createGroup,
  getGroupById,
  addMember,
  removeMember,
  readGroups,
  writeGroups
};

// controller/group.controller.js
const groupModel = require('../model/group.model');
const { successResponse, errorResponse } = require('../_requestResponse/response');
const logger = require('../logControl/logger');

const createGroup = (req, res) => {
  try {
    const creatorId = req.user.userId;
    const { name, description, avatar, memberIds } = req.body;

    // 验证
    if (!name) {
      return res.status(400).json(
        errorResponse('Group name required')
      );
    }

    const group = groupModel.createGroup(
      { name, description, avatar, memberIds },
      creatorId
    );

    logger.info(`Group ${group.id} created by ${creatorId}`);

    return res.status(201).json(
      successResponse(group, 'Group created')
    );
  } catch (error) {
    logger.error('Create group error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};

module.exports = { createGroup };
```

---

## SKILL-G02: 成员殡权管理

**目的**: 管理群组成员的权限和角色

**业务规则**:
```javascript
// 权限校验
function hasPermission(group, userId, action) {
  const member = group.members.find(m => m.userId === userId);
  
  if (!member) {
    return false;  // 不是成员
  }

  // 只有admin可以编辑群组信息和管理成员
  if (['edit-group', 'manage-members', 'delete-group'].includes(action)) {
    return member.role === 'admin';
  }

  // 所有成员都可以发送消息
  if (['send-message'].includes(action)) {
    return true;
  }

  return false;
}

// 添加成员
function addMember(req, res) {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.userId;

    const group = groupModel.getGroupById(groupId);
    if (!group) {
      return res.status(404).json(
        errorResponse('Group not found')
      );
    }

    // 权限检查／只有admin可以添加成员
    if (!hasPermission(group, currentUserId, 'manage-members')) {
      return res.status(403).json(
        errorResponse('Permission denied')
      );
    }

    const updatedGroup = groupModel.addMember(groupId, userId);

    logger.info(`User ${userId} added to group ${groupId}`);

    return res.json(
      successResponse(
        {
          groupId: updatedGroup.id,
          userId,
          memberCount: updatedGroup.members.length
        },
        'Member added'
      )
    );
  } catch (error) {
    if (error.message === 'User already in group') {
      return res.status(409).json(
        errorResponse('User already in group')
      );
    }
    logger.error('Add member error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
}
```

---

## SKILL-G03: 群组信息查询

**目的**: 查询群组信息和成员列表

**核心操作**:
```javascript
const getGroupList = (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0, search } = req.query;

    let groups = groupModel.readGroups()
      .filter(g => g.members.some(m => m.userId === userId));

    // 搜索
    if (search) {
      groups = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = groups.length;
    const paginated = groups
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(offset, offset + limit);

    return res.json(successResponse({
      groups: paginated.map(g => ({
        id: g.id,
        name: g.name,
        avatar: g.avatar,
        memberCount: g.members.length,
        createdBy: g.createdBy,
        createdAt: g.createdAt
      })),
      total,
      page: Math.floor(offset / limit) + 1
    }));
  } catch (error) {
    logger.error('Get group list error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};

const getGroupDetail = (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const group = groupModel.getGroupById(groupId);
    if (!group) {
      return res.status(404).json(
        errorResponse('Group not found')
      );
    }

    // 检查用户是否是成员
    const isMember = group.members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json(
        errorResponse('Not a member of this group')
      );
    }

    return res.json(successResponse(group));
  } catch (error) {
    logger.error('Get group detail error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};
```

---

## SKILL-G04: 群组信息更新与删除

**目的**: 改简群组信息或删除群组

**核心操作**:
```javascript
const updateGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, avatar } = req.body;
    const userId = req.user.userId;

    const group = groupModel.getGroupById(groupId);
    if (!group) {
      return res.status(404).json(
        errorResponse('Group not found')
      );
    }

    // 权限检查／只有创建者可以修改
    if (group.createdBy !== userId) {
      return res.status(403).json(
        errorResponse('Only creator can edit group')
      );
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (avatar) group.avatar = avatar;
    group.updatedAt = Date.now();

    const groups = groupModel.readGroups();
    const index = groups.findIndex(g => g.id === groupId);
    groups[index] = group;
    groupModel.writeGroups(groups);

    logger.info(`Group ${groupId} updated by ${userId}`);

    return res.json(
      successResponse(group, 'Group updated')
    );
  } catch (error) {
    logger.error('Update group error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};

const deleteGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const group = groupModel.getGroupById(groupId);
    if (!group) {
      return res.status(404).json(
        errorResponse('Group not found')
      );
    }

    // 权限检查／只有创建者可以删除
    if (group.createdBy !== userId) {
      return res.status(403).json(
        errorResponse('Only creator can delete group')
      );
    }

    const groups = groupModel.readGroups()
      .filter(g => g.id !== groupId);
    groupModel.writeGroups(groups);

    logger.info(`Group ${groupId} deleted by ${userId}`);

    return res.json(
      successResponse(null, 'Group deleted')
    );
  } catch (error) {
    logger.error('Delete group error:', error);
    return res.status(500).json(
      errorResponse('Server error')
    );
  }
};
```

---

## 版本历史

- **v1.0**: 初始群组模块实现
- **v1.1**: 添加权限管理
