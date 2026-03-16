#!/bin/bash

echo "🚀 创建替代API解决方案..."
echo "========================================"

# 方案1：使用现有服务器（如果还在运行）
echo "1. 检查本地服务器是否运行..."
if curl -s http://localhost:3000/api/health 2>/dev/null | grep -q "healthy"; then
    echo "✅ 本地服务器运行中，端口: 3000"
    echo "🌐 可以配置前端使用: http://localhost:3000"
else
    echo "❌ 本地服务器未运行"
fi

echo ""

# 方案2：创建超级简单的静态API
echo "2. 创建静态JSON API方案..."
cat > /tmp/static-api.json << 'EOF'
{
  "health": {
    "status": "healthy",
    "message": "静态API服务",
    "timestamp": "2026-03-16T14:35:00Z"
  },
  "messages": [
    {
      "id": 1,
      "nickname": "匿名的小龙虾 🦞",
      "content": "今天工作压力好大...",
      "emotion": "😫 压力",
      "category": "工作学习",
      "created_at": "2026-03-16T14:00:00Z",
      "reply_content": "压力是成长的信号...",
      "view_count": 42,
      "like_count": 5
    }
  ],
  "stats": {
    "totalMessages": 1,
    "repliedMessages": 1,
    "todayMessages": 1,
    "waitingForReply": 0
  },
  "categories": [
    {"id": 1, "name": "情感关系", "color": "#FF6B8B", "icon": "💖"},
    {"id": 2, "name": "工作学习", "color": "#4C8BF5", "icon": "💼"}
  ]
}
EOF

echo "✅ 静态API数据已创建: /tmp/static-api.json"

echo ""

# 方案3：更新前端使用静态数据
echo "3. 更新前端使用静态数据方案..."
echo "📋 可以修改 config.js 使用静态数据模式"
echo "💡 这样即使没有后端API，前端也能工作"

echo ""

echo "========================================"
echo "🎯 建议选择: 方案3 - 前端静态数据模式"
echo "✅ 完全不需要后端服务器"
echo "✅ 立即可用"
echo "✅ 部署简单"
echo "========================================"