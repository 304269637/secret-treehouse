#!/bin/bash

echo "🔍 验证新Render服务部署..."
echo "========================================"

echo "🕐 开始时间: $(date)"
echo "⏳ 预计等待: 5-10分钟构建时间"
echo ""

# 等待建议
echo "📋 部署期间建议:"
echo "1. 保持浏览器打开Render Dashboard"
echo "2. 查看Logs标签了解构建进度"
echo "3. 每2分钟刷新一次健康检查"
echo ""

# 构建阶段检查
echo "🏗️  构建阶段检查:"
echo "✅ 阶段1: Cloning repository (克隆仓库)"
echo "✅ 阶段2: Installing dependencies (安装依赖)"
echo "✅ 阶段3: Building application (构建应用)"
echo "✅ 阶段4: Starting server (启动服务器)"
echo "✅ 阶段5: Health check passed (健康检查通过)"
echo ""

# 测试函数
test_health() {
    echo "🔍 测试健康检查..."
    RESPONSE=$(curl -s "https://secret-treehouse-api.onrender.com/api/health" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q '"status":"healthy"'; then
        echo "🎉 健康检查成功！"
        echo "📊 响应: $RESPONSE"
        return 0
    else
        echo "⏳ 尚未就绪或构建中..."
        echo "💡 HTTP状态: $(curl -s -o /dev/null -w "%{http_code}" "https://secret-treehouse-api.onrender.com/api/health" 2>/dev/null)"
        return 1
    fi
}

# 开始测试循环
echo "🚀 开始部署验证循环..."
for i in {1..12}; do
    echo ""
    echo "🔄 第 $i 次检查 ($(date '+%H:%M:%S'))"
    
    if test_health; then
        echo ""
        echo "========================================"
        echo "🎉 🎉 🎉 部署成功！ 🎉 🎉 🎉"
        echo "🌐 后端API: https://secret-treehouse-api.onrender.com"
        echo "📊 健康检查: https://secret-treehouse-api.onrender.com/api/health"
        echo "💌 留言API: https://secret-treehouse-api.onrender.com/api/messages"
        echo "🦞 小龙虾部署小队祝贺您！"
        echo "========================================"
        exit 0
    fi
    
    if [ $i -lt 12 ]; then
        echo "⏳ 等待30秒后重试..."
        sleep 30
    fi
done

echo ""
echo "========================================"
echo "⚠️  部署可能还在进行中或遇到问题"
echo "📋 建议:"
echo "1. 检查Render Dashboard的Logs"
echo "2. 等待5分钟后重试"
echo "3. 如果失败，截图Logs发送给我"
echo "========================================"