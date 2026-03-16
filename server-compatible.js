// ==================== 兼容版服务器 ====================
// 确保所有API路径正确

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
  }
];

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
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
      message: "匿名情绪树洞服务器运行正常",
      timestamp: new Date().toISOString(),
      version: "4.0.0-compatible",
      endpoints: [
        "GET /api/health",
        "GET /api/messages",
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
        const { nickname = '匿名朋友', content = '测试留言', emotion = '😊 快乐', category = 'general' } = data;
        
        if (!content || content.length < 3) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: "留言内容至少需要3个字符"
          }));
          return;
        }
        
        const newMessage = {
          id: messages.length + 1,
          nickname,
          emotion,
          content,
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
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: "请求格式错误"
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
        waitingForReply: messages.filter(m => !m.reply_content).length,
        emotionDistribution: [
          { emotion: "压力", count: messages.filter(m => m.emotion.includes("压力")).length },
          { emotion: "快乐", count: messages.filter(m => m.emotion.includes("快乐")).length }
        ]
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
        { id: 1, name: "情感关系", description: "关于爱情、友情、家庭等情感话题", color: "#FF6B8B", icon: "💖" },
        { id: 2, name: "工作学习", description: "职场压力、学业困扰、职业发展", color: "#4C8BF5", icon: "💼" },
        { id: 3, name: "心理健康", description: "情绪管理、压力调节、自我成长", color: "#9C27B0", icon: "🧠" },
        { id: 4, name: "生活日常", description: "日常琐事、生活感悟、兴趣爱好", color: "#4CAF50", icon: "🏠" },
        { id: 5, name: "未来迷茫", description: "人生方向、选择困难、梦想追求", color: "#FF9800", icon: "🧭" }
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
  console.log('🚀 兼容版服务器启动成功！');
  console.log(`🌐 端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`💌 提交留言: POST /api/messages`);
  console.log('========================================');
  console.log('🦞 这个版本确保所有API路径正确！');
  console.log('========================================');
});