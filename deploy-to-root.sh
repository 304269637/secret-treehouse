#!/bin/bash

echo "🚀 创建GitHub Pages根目录部署..."
echo "========================================"

# 创建gh-pages分支（专门用于GitHub Pages）
echo "1. 创建gh-pages分支..."
cd /root/.openclaw/workspace/secret-treehouse

# 创建临时目录
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# 克隆仓库
echo "2. 克隆仓库到临时目录..."
git clone https://github.com/304269637/secret-treehouse.git .
git checkout -b gh-pages

# 清空分支，只保留前端文件
echo "3. 准备gh-pages分支内容..."
rm -rf *
cp -r /root/.openclaw/workspace/secret-treehouse/root-deploy/* .

# 提交更改
echo "4. 提交到gh-pages分支..."
git add .
git commit -m "🚀 部署匿名情绪树洞前端到GitHub Pages"
git push origin gh-pages --force

echo ""
echo "✅ gh-pages分支创建完成！"
echo ""
echo "📋 现在在GitHub Pages设置中："
echo "   1. Source: Deploy from a branch"
echo "   2. Branch: 选择 gh-pages"
echo "   3. Folder: 选择 / (root)"
echo "   4. 点击 Save"
echo ""
echo "🌐 部署地址: https://304269637.github.io/secret-treehouse"
echo "========================================"
echo "🦞 小龙虾部署小队确保部署成功！"