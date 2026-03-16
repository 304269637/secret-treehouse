# 📚 匿名情绪树洞 - API文档

**版本**: 1.0.0  
**基础URL**: `https://secret-treehouse-api.onrender.com`  
**本地开发**: `http://localhost:3000`

## 📋 概述

匿名情绪树洞提供RESTful API接口，支持前后端分离架构。所有API返回JSON格式数据。

## 🔐 认证

当前版本为公开API，无需认证。未来版本可能添加API密钥或用户认证。

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功描述",
  "data": { ... }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误描述",
  "message": "详细错误信息（开发环境）"
}
```

### HTTP状态码
- `200` - 成功
- `201` - 创建成功
- `400` - 请求错误
- `401` - 未授权
- `404` - 资源不存在
- `429` - 请求过多
- `500` - 服务器错误

## 🌐 API端点

### 健康检查

#### GET `/api/health`
检查服务器状态。

**请求示例**:
```bash
curl https://secret-treehouse-api.onrender.com/api/health
```

**响应示例**:
```json
{
  "success": true,
  "status": "healthy",
  "message": "匿名情绪树洞服务器运行正常",
  "timestamp": "2026-03-16T01:16:00.000Z",
  "version": "2.0.0"
}
```

### 留言管理

#### GET `/api/messages`
获取公开留言列表。

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `category` | string | `all` | 分类筛选 |
| `emotion` | string | `all` | 情绪筛选 |
| `sort` | string | `newest` | 排序方式：`newest`, `popular`, `oldest` |
| `page` | number | `1` | 页码 |
| `limit` | number | `20` | 每页数量 |

**请求示例**:
```bash
curl "https://secret-treehouse-api.onrender.com/api/messages?category=工作学习&emotion=焦虑&sort=newest&page=1&limit=10"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "nickname": "匿名朋友",
        "content": "今天工作压力很大...",
        "emotion": "焦虑",
        "category": "工作学习",
        "view_count": 42,
        "like_count": 5,
        "created_at": "2026-03-16T00:30:00.000Z",
        "reply_content": "压力是成长的信号...",
        "reply_at": "2026-03-16T01:00:00.000Z",
        "reply_by": "treehouse"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "filters": {
      "category": "工作学习",
      "emotion": "焦虑",
      "sort": "newest"
    }
  }
}
```

#### POST `/api/messages`
提交新留言。

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "nickname": "可选昵称",
  "emotion": "平静",
  "content": "留言内容，至少10个字符，最多1000字符",
  "category": "general",
  "is_public": 0,
  "is_anonymous": 1
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `nickname` | string | 否 | 用户昵称，留空显示"匿名朋友" |
| `emotion` | string | 否 | 情绪标签，默认"平静" |
| `content` | string | 是 | 留言内容，10-1000字符 |
| `category` | string | 否 | 分类，默认"general" |
| `is_public` | number | 否 | 是否公开，0=不公开，1=公开 |
| `is_anonymous` | number | 否 | 是否匿名，0=不匿名，1=匿名 |

**请求示例**:
```bash
curl -X POST https://secret-treehouse-api.onrender.com/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "小龙虾",
    "emotion": "快乐",
    "content": "今天天气真好，心情也很愉快！",
    "category": "生活日常",
    "is_public": 1,
    "is_anonymous": 1
  }'
```

**响应示例**:
```json
{
  "success": true,
  "message": "留言已提交！我们会尽快回复你 💖",
  "data": {
    "id": 26,
    "nickname": "小龙虾",
    "emotion": "快乐",
    "category": "生活日常",
    "content": "今天天气真好，心情也很愉快！",
    "created_at": "2026-03-16T01:20:00.000Z",
    "view_count": 0,
    "like_count": 0
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "留言内容不能为空"
}
```

#### GET `/api/messages/:id`
获取单个留言详情（会增加浏览量）。

**路径参数**:
- `id`: 留言ID

**请求示例**:
```bash
curl https://secret-treehouse-api.onrender.com/api/messages/1
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nickname": "匿名朋友",
    "content": "留言内容...",
    "emotion": "焦虑",
    "category": "工作学习",
    "view_count": 43,
    "like_count": 5,
    "created_at": "2026-03-16T00:30:00.000Z",
    "reply_content": "温暖回复...",
    "reply_at": "2026-03-16T01:00:00.000Z",
    "reply_by": "treehouse",
    "category_name": "工作学习",
    "category_color": "#4C8BF5",
    "category_icon": "💼"
  }
}
```

#### POST `/api/messages/:id/like`
给留言点赞。

**请求体**:
```json
{
  "user_fingerprint": "用户唯一标识"
}
```

**请求示例**:
```bash
curl -X POST https://secret-treehouse-api.onrender.com/api/messages/1/like \
  -H "Content-Type: application/json" \
  -d '{"user_fingerprint": "browser-fingerprint-123"}'
```

**响应示例**:
```json
{
  "success": true,
  "message": "点赞成功！",
  "data": {
    "message_id": 1,
    "like_count": 6
  }
}
```

#### GET `/api/messages/popular`
获取热门留言。

**查询参数**:
- `limit`: 返回数量，默认10

**请求示例**:
```bash
curl "https://secret-treehouse-api.onrender.com/api/messages/popular?limit=5"
```

### 统计数据

#### GET `/api/stats`
获取系统统计数据。

**请求示例**:
```bash
curl https://secret-treehouse-api.onrender.com/api/stats
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalMessages": 25,
    "approvedMessages": 20,
    "repliedMessages": 15,
    "totalViews": 420,
    "totalLikes": 68,
    "waitingForReply": 10,
    "todayViews": 42,
    "todayMessages": 5,
    "todayLikes": 8,
    "todayReplies": 3,
    "emotionDistribution": [
      {"emotion": "平静", "count": 8},
      {"emotion": "焦虑", "count": 6},
      {"emotion": "快乐", "count": 5}
    ],
    "categoryDistribution": [
      {"category": "生活日常", "count": 10},
      {"category": "工作学习", "count": 8},
      {"category": "情感关系", "count": 5}
    ],
    "replyRate": 60,
    "approvalRate": 80,
    "avgViewsPerMessage": 16,
    "avgLikesPerMessage": 2
  }
}
```

### 分类管理

#### GET `/api/categories`
获取所有分类。

**请求示例**:
```bash
curl https://secret-treehouse-api.onrender.com/api/categories
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "情感关系",
      "description": "关于爱情、友情、家庭等情感话题",
      "color": "#FF6B8B",
      "icon": "💖",
      "sort_order": 1,
      "is_active": 1
    },
    {
      "id": 2,
      "name": "工作学习",
      "description": "职场压力、学业困扰、职业发展",
      "color": "#4C8BF5",
      "icon": "💼",
      "sort_order": 2,
      "is_active": 1
    }
  ]
}
```

### 系统设置

#### GET `/api/settings`
获取系统设置。

**请求示例**:
```bash
curl https://secret-treehouse-api.onrender.com/api/settings
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "site_name": {
      "value": "匿名情绪树洞",
      "description": "网站名称"
    },
    "site_slogan": {
      "value": "让心事有处安放，让温暖触手可及",
      "description": "网站标语"
    },
    "max_message_length": {
      "value": "1000",
      "description": "留言最大长度"
    }
  }
}
```

## 🔧 管理API（需要认证）

### PUT `/api/admin/messages/:id`
审核留言（需要认证头）。

**请求头**:
```
Content-Type: application/json
x-auth-token: treehouse-admin-2026
```

**请求体**:
```json
{
  "is_approved": 1,
  "is_public": 1,
  "reply_content": "温暖回复内容",
  "reply_by": "treehouse",
  "category": "情感关系",
  "emotion": "平静"
}
```

**请求示例**:
```bash
curl -X PUT https://secret-treehouse-api.onrender.com/api/admin/messages/1 \
  -H "Content-Type: application/json" \
  -H "x-auth-token: treehouse-admin-2026" \
  -d '{
    "is_approved": 1,
    "is_public": 1,
    "reply_content": "感谢你的分享，我们会认真阅读每一份心事。",
    "reply_by": "treehouse"
  }'
```

## 🚀 前端集成示例

### JavaScript Fetch示例
```javascript
// 获取留言列表
async function getMessages() {
  try {
    const response = await fetch('https://secret-treehouse-api.onrender.com/api/messages?limit=10');
    const data = await response.json();
    
    if (data.success) {
      console.log('留言列表:', data.data.messages);
      return data.data.messages;
    } else {
      console.error('获取失败:', data.error);
      return [];
    }
  } catch (error) {
    console.error('网络错误:', error);
    return [];
  }
}

// 提交留言
async function submitMessage(messageData) {
  try {
    const response = await fetch('https://secret-treehouse-api.onrender.com/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('提交成功:', data.message);
      return data.data;
    } else {
      console.error('提交失败:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('提交错误:', error);
    throw error;
  }
}
```

### jQuery示例
```javascript
// 获取统计数据
$.ajax({
  url: 'https://secret-treehouse-api.onrender.com/api/stats',
  method: 'GET',
  success: function(data) {
    if (data.success) {
      console.log('统计数据:', data.data);
    }
  },
  error: function(error) {
    console.error('请求失败:', error);
  }
});
```

## ⚠️ 限制和配额

### 频率限制
- 留言提交：每个IP每天最多10条
- API请求：每分钟最多100次
- 点赞：每个留言每个用户只能点一次

### 数据限制
- 留言内容：10-1000字符
- 昵称：最多50字符
- 情绪标签：预设8种情绪
- 分类：预设5个分类

## 🔒 安全建议

1. **生产环境**：配置严格的CORS策略
2. **输入验证**：前端和后端都要验证
3. **SQL注入防护**：使用参数化查询
4. **XSS防护**：输出时转义HTML
5. **HTTPS**：始终使用HTTPS

## 📞 支持和反馈

- **问题报告**: 创建GitHub Issue
- **功能请求**: 通过API提交反馈
- **紧急问题**: 查看服务器日志

## 📈 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-03-16 | 初始版本，基础CRUD功能 |
| 2.0.0 | 2026-03-16 | 集成版，添加分类、点赞、统计 |

---

**文档维护**: 三千里（项目总负责人）  
**最后更新**: 2026年3月16日  
**状态**: 活跃维护中 🦞