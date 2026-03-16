#!/bin/bash

echo "========================================"
echo "🚀 匿名情绪树洞 - 项目部署脚本"
echo "========================================"
echo "🕐 开始时间: $(date)"
echo ""

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请以root用户运行此脚本"
    echo "💡 使用: sudo bash deploy-project.sh"
    exit 1
fi

# 项目配置
PROJECT_NAME="secret-treehouse"
PROJECT_DIR="/var/www/${PROJECT_NAME}"
GITHUB_REPO="https://github.com/304269637/secret-treehouse.git"
PORT="3000"

echo "📋 部署配置："
echo "项目名称: ${PROJECT_NAME}"
echo "安装目录: ${PROJECT_DIR}"
echo "GitHub仓库: ${GITHUB_REPO}"
echo "服务端口: ${PORT}"
echo ""

echo "1. 创建项目目录..."
mkdir -p ${PROJECT_DIR}
cd ${PROJECT_DIR}

echo "2. 从GitHub克隆代码..."
if [ -d ".git" ]; then
    echo "📦 代码已存在，更新到最新版本..."
    git pull origin main
else
    echo "📦 克隆代码仓库..."
    git clone ${GITHUB_REPO} .
fi

echo "3. 安装Node.js依赖..."
npm install --production

echo "4. 创建环境配置文件..."
cat > .env.production << EOF
# 生产环境配置
NODE_ENV=production
PORT=${PORT}
DATABASE_URL=./data/treehouse.db
CORS_ORIGIN=*
MAX_MESSAGES_PER_DAY=50
ADMIN_PASSWORD=$(openssl rand -base64 12)
API_RATE_LIMIT=100
EOF

echo "5. 创建数据目录..."
mkdir -p data
mkdir -p logs

echo "6. 初始化数据库..."
if [ ! -f "data/treehouse.db" ]; then
    echo "📊 创建初始数据库..."
    node -e "
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('data/treehouse.db');
    
    db.serialize(() => {
        // 创建消息表
        db.run(\`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL,
            content TEXT NOT NULL,
            emotion TEXT,
            category TEXT,
            view_count INTEGER DEFAULT 0,
            like_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            reply_content TEXT,
            reply_at DATETIME,
            reply_by TEXT
        )\`);
        
        // 创建统计表
        db.run(\`CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY,
            total_messages INTEGER DEFAULT 0,
            replied_messages INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )\`);
        
        // 插入初始数据
        const stmt = db.prepare('INSERT OR IGNORE INTO stats (id, total_messages, replied_messages) VALUES (1, 0, 0)');
        stmt.run();
        stmt.finalize();
        
        console.log('✅ 数据库初始化完成');
    });
    
    db.close();
    "
else
    echo "✅ 数据库已存在"
fi

echo "7. 设置文件权限..."
chown -R www-data:www-data ${PROJECT_DIR}
chmod -R 755 ${PROJECT_DIR}

echo "8. 启动服务（使用PM2）..."
# 停止已存在的服务
pm2 delete ${PROJECT_NAME} 2>/dev/null || true

# 启动新服务
pm2 start server.js --name ${PROJECT_NAME} \
    --cwd ${PROJECT_DIR} \
    --log logs/app.log \
    --error logs/error.log \
    --output logs/output.log \
    --time \
    --restart-delay=3000 \
    --max-memory-restart 200M

echo "9. 设置PM2开机自启..."
pm2 startup 2>/dev/null || true
pm2 save

echo "10. 等待服务启动..."
sleep 3

echo ""
echo "========================================"
echo "✅ 项目部署完成！"
echo ""
echo "📊 服务状态："
pm2 status ${PROJECT_NAME} --silent || echo "❌ 服务启动失败，请检查日志"
echo ""
echo "🌐 访问地址："
echo "后端API: http://$(curl -s ifconfig.me):${PORT}/api/health"
echo "前端页面: http://$(curl -s ifconfig.me):${PORT}"
echo ""
echo "📋 管理命令："
echo "查看日志: pm2 logs ${PROJECT_NAME}"
echo "重启服务: pm2 restart ${PROJECT_NAME}"
echo "停止服务: pm2 stop ${PROJECT_NAME}"
echo "查看状态: pm2 status"
echo ""
echo "🎯 下一步：运行 setup-nginx.sh 配置Nginx反向代理"
echo "========================================"