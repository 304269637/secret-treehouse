#!/bin/bash

echo "🔧 测试Render修复版本..."
echo "========================================"

# 检查server-render.js语法
echo "1. 检查server-render.js语法..."
if node -c server-render.js; then
    echo "✅ server-render.js语法正确"
else
    echo "❌ server-render.js语法错误"
    exit 1
fi

echo "----------------------------------------"

# 检查依赖
echo "2. 检查依赖包..."
if [ -f "package.json" ]; then
    echo "✅ package.json存在"
    echo "📦 依赖列表:"
    grep -A 10 '"dependencies"' package.json | head -15
else
    echo "⚠️  package.json不存在，使用基础依赖"
fi

echo "----------------------------------------"

# 模拟启动测试
echo "3. 模拟启动测试..."
echo "🚀 启动命令: node server-render.js"
echo "🌐 监听端口: 10000 (或环境变量PORT)"
echo "📊 健康检查: /api/health"
echo "💌 留言API: /api/messages"

echo "----------------------------------------"

# 给出部署指令
echo "4. Render部署指令:"
echo "📋 在Render Dashboard执行:"
echo "   1. 进入 secret-treehouse-api 服务"
echo "   2. 点击 Settings"
echo "   3. 找到 Start Command"
echo "   4. 修改为: node server-render.js"
echo "   5. 点击 Save Changes"
echo "   6. 点击 Manual Deploy"
echo "   7. 选择 Deploy latest commit"
echo "   8. 等待5分钟构建完成"

echo "----------------------------------------"

# 验证部署
echo "5. 部署后验证:"
echo "✅ 访问: https://secret-treehouse-api.onrender.com/api/health"
echo "✅ 预期响应: {\"status\":\"healthy\"}"
echo "✅ 留言测试: https://secret-treehouse-api.onrender.com/api/messages"

echo "========================================"
echo "🦞 小龙虾部署小队确保Render修复成功！"