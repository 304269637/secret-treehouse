// Vercel Serverless Function - 留言API
const messages = [
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

module.exports = (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    // 获取留言列表
    const { category = 'all', limit = 20 } = req.query;
    
    let filteredMessages = messages;
    if (category !== 'all') {
      filteredMessages = messages.filter(msg => msg.category === category);
    }
    
    return res.status(200).json({
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
  }
  
  if (req.method === 'POST') {
    // 提交新留言
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
      
      return res.status(201).json({
        success: true,
        message: "留言已提交！我们会尽快回复你 💖",
        data: newMessage
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "服务器错误，请稍后重试"
      });
    }
  }
  
  // 不支持的请求方法
  return res.status(405).json({
    success: false,
    error: "不支持的请求方法"
  });
};