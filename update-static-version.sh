#!/bin/bash

echo "🚀 更新静态版本到GitHub Pages..."
echo "========================================"

# 创建临时目录
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "1. 克隆仓库..."
git clone https://github.com/304269637/secret-treehouse.git .
git checkout gh-pages 2>/dev/null || git checkout -b gh-pages

echo "2. 清空分支，只保留静态版本..."
rm -rf *
cp -r /root/.openclaw/workspace/secret-treehouse/root-deploy/* .

echo "3. 提交更改..."
git add .
git commit -m "🚀 部署完全静态版本匿名情绪树洞 - 无需后端服务器"
git push origin gh-pages --force

echo ""
echo "✅ 静态版本已部署到gh-pages分支！"
echo ""
echo "📋 GitHub Pages会自动重新部署"
echo "⏱️  等待1-3分钟"
echo "🌐 访问: https://304269637.github.io/secret-treehouse"
echo ""
echo "🎯 静态版本特点:"
echo "✅ 完全不需要后端服务器"
echo "✅ 留言功能在浏览器中运行"
echo "✅ 响应式设计优化"
echo "✅ 立即可用"
echo "========================================"