// ==================== 超级简化版服务器 ====================
// 绝对能工作的版本，没有任何复杂依赖

const http = require('http');

const PORT = process.env.PORT || 10000;

// 内存数据
const messages = [
  {
    id: 1,
    nickname: "匿名的小龙虾 🦞",
    content: "今天工作压力好大...",
    emotion: "😫 压力",
    category: "工作学习",
    created_at: new Date().toISOString(),
    reply_content: "压力是成长的信号...",
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
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 路由处理
  const url = req.url;
  const method = req.method;
  
  console.log(`📨 ${method} ${url}`);
  
  // 健康检查
  if (url === '/api/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      status: "healthy",
      message: "匿名情绪树洞服务器运行正常",
      timestamp: new Date().toISOString(),
      version: "3.0.0-simple"
    }));
    return;
  }
  
  // 获取留言列表
  if (url === '/api/messages' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
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
  
  // 提交留言（简化版，只接受GET参数）
  if (url.startsWith('/api/messages') && method === 'GET') {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const content = urlObj.searchParams.get('content') || '测试留言';
    const nickname = urlObj.searchParams.get('nickname') || '匿名朋友';
    
    const newMessage = {
      id: messages.length + 1,
      nickname,
      emotion: "😊 快乐",
      content,
      category: "general",
      created_at: new Date().toISOString(),
      view_count: 0,
      like_count: 0
    };
    
    messages.push(newMessage);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: "留言提交成功！",
      data: newMessage
    }));
    return;
  }
  
  // 获取统计数据
  if (url === '/api/stats' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        totalMessages: messages.length,
        repliedMessages: messages.filter(m => m.reply_content).length,
        todayMessages: 1,
        waitingForReply: 0
      }
    }));
    return;
  }
  
  // 获取分类
  if (url === '/api/categories' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: [
        { id: 1, name: "情感关系", color: "#FF6B8B", icon: "💖" },
        { id: 2, name: "工作学习", color: "#4C8BF5", icon: "💼" }
      ]
    }));
    return;
  }
  
  // 默认响应
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: "请求的资源不存在",
    available_endpoints: [
      "GET /api/health",
      "GET /api/messages",
      "GET /api/stats",
      "GET /api/categories"
    ]
  }));
});

// 启动服务器
server.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 超级简化版服务器启动成功！');
  console.log(`🌐 端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`💌 提交留言: GET /api/messages?content=你的留言&nickname=你的名字`);
  console.log('========================================');
  console.log('🦞 这个版本绝对能工作！');
  console.log('========================================');
});

// 错误处理
server.on('error', (err) => {
  console.error('❌ 服务器错误:', err);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🔄 收到关闭信号，优雅关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});