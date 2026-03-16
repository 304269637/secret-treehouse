// ==================== Render专用服务器 ====================
// 简化版本，避免构建失败

const express = require('express');
const path = require('path');
const cors = require('cors');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 10000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 内存数据库（避免SQLite问题）
let messages = [
  {
    id: 1,
    nickname: "匿名的小龙虾 🦞",
    content: "今天工作压力好大，连续开了三个会议，感觉喘不过气...",
    emotion: "😫 压力",
    category: "工作学习",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reply_content: "压力是成长的信号，你已经很勇敢了。试着把大任务拆解成小步骤，完成一项就给自己一个小奖励。",
    view_count: 42,
    like_count: 5
  },
  {
    id: 2,
    nickname: "寻找阳光的人 ☀️",
    content: "最近总是感到孤独，即使身边有人也觉得寂寞...",
    emotion: "🌙 孤独",
    category: "情感关系",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reply_content: "孤独是自我对话的好时机。试着写日记记录心情，或者养一盆植物，让生活多一份陪伴。",
    view_count: 38,
    like_count: 3
  }
];

// ==================== API路由 ====================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    message: "匿名情绪树洞服务器运行正常",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// 获取留言列表
app.get('/api/messages', (req, res) => {
  const { category = 'all', limit = 20 } = req.query;
  
  let filteredMessages = messages;
  if (category !== 'all') {
    filteredMessages = messages.filter(msg => msg.category === category);
  }
  
  res.json({
    success: true,
    data: {
      messages: filteredMessages.slice(0, parseInt(limit)),
      pagination: {
        page: 1,
        limit: parseInt(limit),
        total: filteredMessages.length,
        totalPages: 1
      }
    }
  });
});

// 提交新留言
app.post('/api/messages', (req, res) => {
  try {
    const { nickname, emotion, content, category } = req.body;
    
    if (!content || content.length < 10) {
      return res.status(400).json({
        success: false,
        error: "留言内容至少需要10个字符"
      });
    }
    
    const newMessage = {
      id: messages.length + 1,
      nickname: nickname || "匿名朋友",
      emotion: emotion || "平静",
      content,
      category: category || "general",
      created_at: new Date().toISOString(),
      view_count: 0,
      like_count: 0
    };
    
    messages.push(newMessage);
    
    res.status(201).json({
      success: true,
      message: "留言已提交！我们会尽快回复你 💖",
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "服务器错误，请稍后重试"
    });
  }
});

// 获取统计数据
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalMessages: messages.length,
      repliedMessages: messages.filter(m => m.reply_content).length,
      todayMessages: messages.filter(m => {
        const msgDate = new Date(m.created_at);
        const today = new Date();
        return msgDate.toDateString() === today.toDateString();
      }).length,
      waitingForReply: messages.filter(m => !m.reply_content).length,
      emotionDistribution: [
        { emotion: "压力", count: messages.filter(m => m.emotion.includes("压力")).length },
        { emotion: "孤独", count: messages.filter(m => m.emotion.includes("孤独")).length },
        { emotion: "平静", count: messages.filter(m => m.emotion.includes("平静")).length }
      ]
    }
  });
});

// 获取分类
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: "情感关系", description: "关于爱情、友情、家庭等情感话题", color: "#FF6B8B", icon: "💖" },
      { id: 2, name: "工作学习", description: "职场压力、学业困扰、职业发展", color: "#4C8BF5", icon: "💼" },
      { id: 3, name: "心理健康", description: "情绪管理、压力调节、自我成长", color: "#9C27B0", icon: "🧠" },
      { id: 4, name: "生活日常", description: "日常琐事、生活感悟、兴趣爱好", color: "#4CAF50", icon: "🏠" },
      { id: 5, name: "未来迷茫", description: "人生方向、选择困难、梦想追求", color: "#FF9800", icon: "🧭" }
    ]
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "请求的资源不存在"
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: "服务器内部错误"
  });
});

// ==================== 启动服务器 ====================
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🦞 匿名情绪树洞服务器启动成功！');
  console.log(`🚀 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`💌 提交留言: POST http://localhost:${PORT}/api/messages`);
  console.log('========================================');
  console.log('项目代号: secret-treehouse');
  console.log('项目口号: 让心事有处安放，让温暖触手可及');
  console.log('========================================');
});