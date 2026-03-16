// ==================== 云函数后端 ====================
// 可以部署到Vercel、Netlify等Serverless平台

// 内存数据库（实际使用中应该用真实数据库）
let messages = [
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

// 云函数处理程序
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  // 健康检查
  if (pathname === '/api/health' && req.method === 'GET') {
    res.status(200).json({
      success: true,
      status: "healthy",
      message: "匿名情绪树洞云函数后端运行正常",
      timestamp: new Date().toISOString(),
      version: "7.0.0-serverless"
    });
    return;
  }
  
  // 获取留言列表
  if (pathname === '/api/messages' && req.method === 'GET') {
    res.status(200).json({
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
    });
    return;
  }
  
  // 提交留言
  if (pathname === '/api/messages' && req.method === 'POST') {
    try {
      const body = await req.json();
      const { nickname = '匿名朋友', content = '', emotion = '😊 快乐', category = 'general' } = body;
      
      if (!content || content.trim().length < 3) {
        res.status(400).json({
          success: false,
          error: "留言内容至少需要3个字符"
        });
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
      
      res.status(201).json({
        success: true,
        message: "留言已提交！我们会尽快回复你 💖",
        data: newMessage
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "请求格式错误"
      });
    }
    return;
  }
  
  // 获取统计数据
  if (pathname === '/api/stats' && req.method === 'GET') {
    res.status(200).json({
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
    });
    return;
  }
  
  // 获取分类
  if (pathname === '/api/categories' && req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: [
        { id: 1, name: "情感关系", color: "#FF6B8B", icon: "💖" },
        { id: 2, name: "工作学习", color: "#4C8BF5", icon: "💼" },
        { id: 3, name: "心理健康", color: "#9C27B0", icon: "🧠" },
        { id: 4, name: "生活日常", color: "#4CAF50", icon: "🏠" },
        { id: 5, name: "未来迷茫", color: "#FF9800", icon: "🧭" }
      ]
    });
    return;
  }
  
  // 默认响应
  res.status(404).json({
    success: false,
    error: "请求的资源不存在",
    available_endpoints: [
      "GET /api/health",
      "GET /api/messages",
      "POST /api/messages",
      "GET /api/stats",
      "GET /api/categories"
    ]
  });
}