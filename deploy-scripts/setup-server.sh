#!/bin/bash

echo "========================================"
echo "🚀 匿名情绪树洞 - 服务器环境安装脚本"
echo "========================================"
echo "🕐 开始时间: $(date)"
echo ""

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请以root用户运行此脚本"
    echo "💡 使用: sudo bash setup-server.sh"
    exit 1
fi

echo "📊 检测系统信息..."
echo "操作系统: $(lsb_release -d | cut -f2)"
echo "内核版本: $(uname -r)"
echo ""

echo "1. 更新系统包..."
apt update && apt upgrade -y

echo "2. 安装Node.js..."
if ! command -v node &> /dev/null; then
    echo "📦 安装Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo "✅ Node.js 已安装: $(node --version)"
fi

echo "3. 安装Git..."
if ! command -v git &> /dev/null; then
    apt install -y git
else
    echo "✅ Git 已安装: $(git --version)"
fi

echo "4. 安装PM2（进程管理器）..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo "✅ PM2 已安装"
fi

echo "5. 安装Nginx（Web服务器）..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
else
    echo "✅ Nginx 已安装"
fi

echo "6. 安装其他必要工具..."
apt install -y curl wget unzip build-essential

echo ""
echo "========================================"
echo "✅ 服务器环境安装完成！"
echo "📊 安装结果："
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Git: $(git --version)"
echo "PM2: $(pm2 --version 2>/dev/null || echo '已安装')"
echo "Nginx: $(nginx -v 2>&1 | head -1)"
echo ""
echo "🎯 下一步：运行 deploy-project.sh 部署项目"
echo "========================================"