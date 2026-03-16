// ==================== 简单修复版API服务器 ====================
// 绝对能工作的版本，专门修复留言提交问题

const http = require('http');

const PORT = process.env.PORT || 10000;

// 内存数据
const messages = [
  {
    id: 1,
    nickname: "匿名的小龙虾 🦞",
    content: "今天工作压力好大，连续开了三个会议，感觉喘不过气...",
    emotion: "😫 压力",
    category: "工作学习",
    created_at: new Date().toISOString(),
    reply_content: "压力是成长的信号，你已经很勇敢了。试着把大任务拆解成小步骤，完成一项就给自己一个小奖励。",
    view_count: 42,
    like_count: 5
  },
  {
    id: 2,
    nickname: "迷茫的星星 ✨",
    content: "不知道未来该往哪里走，感觉大家都在前进，只有我停在原地...",
    emotion: "😔 迷茫",
    category: "未来迷茫",
    created_at: new Date().toISOString(),
    reply_content: "每个人都有自己的节奏，迷茫是成长的必经之路。试着写下你的兴趣和优势，小步前进比原地踏步更有意义。",
    view_count: 28,
    like_count: 3
  }
];

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头 - 允许所有来源
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = req.url;
  const method = req.method;
  
  console.log(`📨 ${method} ${url}`);
  
  // 健康检查 - 多个路径兼容
  if ((url === '/api/health' || url === '/health' || url === '/') && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      status: "healthy",
      message: "匿名情绪树洞API服务器运行正常",
      timestamp: new Date().toISOString(),
      version: "6.0.0-simple-fix",
      endpoints: [
        "GET /api/health",
        "GET /api/messages",
        "POST /api/messages",
        "GET /api/stats",
        "GET /api/categories"
      ]
    }));
    return;
  }
  
  // 获取留言列表
  if (url === '/api/messages' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        messages: messages,
        pagination: {
          page: 1,
          limit: 20,
          total: messages.length,
          totalPages: 1
        }
      }
    }));
    return;
  }
  
  // 提交留言
  if (url === '/api/messages' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const { nickname = '匿名朋友', content = '', emotion = '😊 快乐', category = 'general' } = data;
        
        // 简单验证
        if (!content || content.trim().length < 3) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: "留言内容至少需要3个字符"
          }));
          return;
        }
        
        const newMessage = {
          id: messages.length + 1,
          nickname: nickname.trim() || '匿名朋友',
          emotion,
          content: content.trim(),
          category,
          created_at: new Date().toISOString(),
          view_count: 0,
          like_count: 0
        };
        
        messages.push(newMessage);
        
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: "留言已提交！我们会尽快回复你 💖",
          data: newMessage
        }));
      } catch (error) {
        console.error('解析请求体错误:', error);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: "请求格式错误，请检查JSON格式"
        }));
      }
    });
    return;
  }
  
  // 获取统计数据
  if (url === '/api/stats' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        totalMessages: messages.length,
        repliedMessages: messages.filter(m => m.reply_content).length,
        todayMessages: messages.filter(m => {
          const msgDate = new Date(m.created_at);
          const today = new Date();
          return msgDate.toDateString() === today.toDateString();
        }).length,
        waitingForReply: messages.filter(m => !m.reply_content).length
      }
    }));
    return;
  }
  
  // 获取分类
  if (url === '/api/categories' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: [
        { id: 1, name: "情感关系", color: "#FF6B8B", icon: "💖" },
        { id: 2, name: "工作学习", color: "#4C8BF5", icon: "💼" },
        { id: 3, name: "心理健康", color: "#9C27B0", icon: "🧠" },
        { id: 4, name: "生活日常", color: "#4CAF50", icon: "🏠" },
        { id: 5, name: "未来迷茫", color: "#FF9800", icon: "🧭" }
      ]
    }));
    return;
  }
  
  // 默认响应
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    error: "请求的资源不存在",
    available_endpoints: [
      "GET /api/health",
      "GET /api/messages",
      "POST /api/messages",
      "GET /api/stats",
      "GET /api/categories"
    ],
    tip: "请确保使用正确的API路径"
  }));
});

// 启动服务器
server.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 简单修复版API服务器启动成功！');
  console.log(`🌐 端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`💌 提交留言: POST /api/messages`);
  console.log('========================================');
  console.log('🦞 这个版本专门修复留言提交问题！');
  console.log('========================================');
});

// 错误处理
server.on('error', (err) => {
  console.error('❌ 服务器错误:', err);
});