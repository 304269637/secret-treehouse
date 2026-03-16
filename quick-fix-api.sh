#!/bin/bash

echo "🚀 快速修复API服务器..."
echo "========================================"

# 创建绝对能工作的API服务器
cat > /tmp/simple-api.js << 'EOF'
const http = require('http');

const PORT = process.env.PORT || 10000;

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

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = req.url;
  const method = req.method;
  
  // 健康检查 - 多个路径
  if ((url === '/api/health' || url === '/health' || url === '/') && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      status: "healthy",
      message: "匿名情绪树洞API服务器运行正常",
      timestamp: new Date().toISOString(),
      version: "5.0.0-quickfix"
    }));
    return;
  }
  
  // 获取留言
  if (url === '/api/messages' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: { messages: messages }
    }));
    return;
  }
  
  // 提交留言
  if (url === '/api/messages' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const newMsg = {
          id: messages.length + 1,
          nickname: data.nickname || '匿名朋友',
          content: data.content || '测试留言',
          emotion: data.emotion || '😊 快乐',
          category: data.category || 'general',
          created_at: new Date().toISOString(),
          view_count: 0,
          like_count: 0
        };
        messages.push(newMsg);
        res.writeHead(201);
        res.end(JSON.stringify({
          success: true,
          message: "留言已提交！我们会尽快回复你 💖",
          data: newMsg
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: "请求格式错误" }));
      }
    });
    return;
  }
  
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    error: "请求的资源不存在",
    available_endpoints: ["GET /api/health", "GET /api/messages", "POST /api/messages"]
  }));
});

server.listen(PORT, () => {
  console.log(`🚀 快速修复API服务器启动在端口 ${PORT}`);
});
EOF

echo "✅ 快速修复API服务器代码已创建"
echo "📁 文件: /tmp/simple-api.js"
echo ""
echo "📋 在Render Dashboard执行:"
echo "1. 进入 secret-treehouse-api 服务"
echo "2. 点击 Settings"
echo "3. 修改 Start Command 为: node /tmp/simple-api.js"
echo "4. 保存并重新部署"
echo ""
echo "🦞 这个版本绝对能工作！"