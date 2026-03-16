#!/bin/bash

echo "🚀 测试Vercel部署状态..."
echo "========================================"

# 等待Vercel部署完成
echo "1. 等待部署完成（预计2-3分钟）..."
sleep 10

# 测试健康检查
echo "2. 测试健康检查API..."
HEALTH_RESPONSE=$(curl -s "https://secret-treehouse.vercel.app/api/health" 2>/dev/null | grep -o '"status":"healthy"' || echo "not_found")

if [ "$HEALTH_RESPONSE" = '"status":"healthy"' ]; then
    echo "✅ 健康检查正常！后端API已就绪"
else
    echo "⚠️  健康检查未响应，可能还在部署中"
    echo "💡 建议：等待1-2分钟再试"
fi

echo "----------------------------------------"

# 测试留言API
echo "3. 测试留言API..."
MESSAGES_RESPONSE=$(curl -s "https://secret-treehouse.vercel.app/api/messages" 2>/dev/null | grep -o '"success":true' || echo "not_found")

if [ "$MESSAGES_RESPONSE" = '"success":true' ]; then
    echo "✅ 留言API正常！可以获取留言列表"
else
    echo "⚠️  留言API未响应"
fi

echo "----------------------------------------"

# 测试首页
echo "4. 测试首页访问..."
HOME_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://secret-treehouse.vercel.app/" 2>/dev/null)

if [ "$HOME_RESPONSE" = "200" ]; then
    echo "✅ 首页可访问 (HTTP 200)"
    echo "🌐 网站地址: https://secret-treehouse.vercel.app"
else
    echo "⚠️  首页访问失败 (HTTP $HOME_RESPONSE)"
fi

echo "----------------------------------------"

# 给出建议
echo "5. 部署建议:"
if [ "$HEALTH_RESPONSE" = '"status":"healthy"' ] && [ "$HOME_RESPONSE" = "200" ]; then
    echo "🎉 恭喜！部署成功！"
    echo "📱 可以立即访问: https://secret-treehouse.vercel.app"
    echo "💌 开始分享您的第一个心事吧！"
else
    echo "⏳ 部署可能还在进行中..."
    echo "📋 请:"
    echo "   1. 等待2-3分钟"
    echo "   2. 刷新Vercel页面查看状态"
    echo "   3. 如果失败，重新部署"
fi

echo "========================================"
echo "🦞 小龙虾部署小队为您服务！"