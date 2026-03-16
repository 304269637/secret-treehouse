# 🚀 云服务器部署指南

## 📋 前提条件
- ✅ 您有自己的云服务器（Linux系统）
- ✅ 服务器有公网IP
- ✅ 可以SSH登录到服务器
- ✅ 有域名（可选，推荐）

## 🎯 部署目标
将「匿名情绪树洞」完整项目部署到您的云服务器，包含：
- 前端页面（HTML/CSS/JavaScript）
- 后端API服务器（Node.js + Express）
- 数据库（SQLite，可升级）

## 🔧 服务器环境要求
```
操作系统: Ubuntu/CentOS/Debian等Linux
内存: 至少512MB
存储: 至少1GB
网络: 公网访问
端口: 80(HTTP) 和 443(HTTPS，可选)
```

## 🚀 一键部署脚本

### 脚本1：基础环境安装
```bash
#!/bin/bash
# 文件名: setup-server.sh

echo "🚀 开始设置服务器环境..."

# 更新系统
apt update && apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装Git
apt install -y git

# 安装PM2（进程管理）
npm install -g pm2

# 安装Nginx（Web服务器，可选）
apt install -y nginx

echo "✅ 基础环境安装完成！"
echo "📊 版本信息："
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Git: $(git --version)"
```

### 脚本2：部署项目
```bash
#!/bin/bash
# 文件名: deploy-project.sh

echo "🚀 开始部署匿名情绪树洞..."

# 创建项目目录
mkdir -p /var/www/secret-treehouse
cd /var/www/secret-treehouse

# 从GitHub克隆代码
git clone https://github.com/304269637/secret-treehouse.git .

# 安装依赖
npm install

# 创建环境配置文件
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=./data/treehouse.db
CORS_ORIGIN=*
EOF

# 创建数据目录
mkdir -p data

# 启动服务（使用PM2管理）
pm2 start server.js --name "secret-treehouse" --watch

# 设置PM2开机自启
pm2 startup
pm2 save

echo "✅ 项目部署完成！"
echo "🌐 服务运行在: http://您的服务器IP:3000"
echo "📊 健康检查: http://您的服务器IP:3000/api/health"
```

### 脚本3：配置Nginx反向代理（推荐）
```bash
#!/bin/bash
# 文件名: setup-nginx.sh

echo "🚀 配置Nginx反向代理..."

# 创建Nginx配置文件
cat > /etc/nginx/sites-available/secret-treehouse << 'EOF'
server {
    listen 80;
    server_name 您的域名或服务器IP;
    
    # 前端静态文件
    location / {
        root /var/www/secret-treehouse/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/secret-treehouse /etc/nginx/sites-enabled/

# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx

echo "✅ Nginx配置完成！"
echo "🌐 现在可以通过 http://您的域名 访问树洞"
```

## 📋 部署步骤总结

### 第一步：登录服务器
```bash
ssh root@您的服务器IP
```

### 第二步：执行部署脚本
```bash
# 1. 下载部署脚本
wget https://raw.githubusercontent.com/304269637/secret-treehouse/main/deploy-scripts/setup-server.sh
wget https://raw.githubusercontent.com/304269637/secret-treehouse/main/deploy-scripts/deploy-project.sh
wget https://raw.githubusercontent.com/304269637/secret-treehouse/main/deploy-scripts/setup-nginx.sh

# 2. 设置执行权限
chmod +x *.sh

# 3. 按顺序执行
./setup-server.sh
./deploy-project.sh
./setup-nginx.sh
```

### 第三步：验证部署
```bash
# 检查服务状态
pm2 status
systemctl status nginx

# 测试API
curl http://localhost:3000/api/health

# 测试前端
curl -I http://localhost
```

## 🔧 后续维护

### 更新代码
```bash
cd /var/www/secret-treehouse
git pull
npm install
pm2 restart secret-treehouse
```

### 查看日志
```bash
# 查看应用日志
pm2 logs secret-treehouse

# 查看Nginx访问日志
tail -f /var/log/nginx/access.log

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 备份数据库
```bash
# 备份SQLite数据库
cp /var/www/secret-treehouse/data/treehouse.db /backup/treehouse-$(date +%Y%m%d).db
```

## 🎯 成功标志
```
✅ 服务运行: pm2 status 显示 running
✅ API可用: curl http://localhost:3000/api/health 返回健康状态
✅ 前端可访问: 浏览器访问 http://您的服务器IP 显示树洞页面
✅ 功能正常: 可以提交留言、查看留言、统计数据
```

## 🆘 故障排除

### 如果端口被占用
```bash
# 查看端口占用
netstat -tlnp | grep :3000
netstat -tlnp | grep :80

# 杀死占用进程
kill -9 <PID>
```

### 如果服务启动失败
```bash
# 查看详细错误
cd /var/www/secret-treehouse
node server.js

# 检查依赖
npm list
```

### 如果Nginx配置错误
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

## 📞 支持
如果遇到任何问题，请提供：
1. 错误信息截图
2. 服务器系统信息
3. 执行的命令和输出

我会立即帮您解决！