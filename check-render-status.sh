#!/bin/bash

echo "🔍 检查Render部署状态..."
echo "========================================"

# 检查API健康状态
echo "1. 测试API健康检查..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://secret-treehouse-api.onrender.com/api/health" 2>/dev/null)

if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API健康检查正常 (HTTP 200)"
    echo "🌐 后端已就绪: https://secret-treehouse-api.onrender.com"
elif [ "$API_RESPONSE" = "404" ]; then
    echo "⚠️  API返回404 - 可能还在构建中"
    echo "💡 建议: 等待5分钟再试"
elif [ "$API_RESPONSE" = "000" ]; then
    echo "❌ 无法连接到API - 服务可能不存在"
    echo "💡 建议: 重新创建Web Service"
else
    echo "❓ 未知状态: HTTP $API_RESPONSE"
    echo "💡 建议: 检查Render Dashboard"
fi

echo "----------------------------------------"

# 检查GitHub仓库
echo "2. 检查GitHub仓库..."
GITHUB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://github.com/304269637/secret-treehouse" 2>/dev/null)

if [ "$GITHUB_STATUS" = "200" ]; then
    echo "✅ GitHub仓库可访问"
    echo "📁 仓库: https://github.com/304269637/secret-treehouse"
else
    echo "❌ GitHub仓库访问失败"
fi

echo "----------------------------------------"

# 给出建议
echo "3. 部署建议:"
echo "📋 如果服务不存在:"
echo "   1. 访问 https://render.com"
echo "   2. 点击 New + → Web Service"
echo "   3. 选择 304269637/secret-treehouse 仓库"
echo "   4. 点击 Create Web Service"
echo "   5. 等待5分钟"
echo ""
echo "📋 如果服务存在但未响应:"
echo "   1. 等待5-10分钟构建完成"
echo "   2. 刷新页面检查状态"
echo "   3. 查看Logs了解进度"

echo "========================================"
echo "🦞 小龙虾部署小队为您服务！"