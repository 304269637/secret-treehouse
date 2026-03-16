#!/bin/bash

echo "========================================"
echo "🚀 匿名情绪树洞 - Nginx配置脚本"
echo "========================================"
echo "🕐 开始时间: $(date)"
echo ""

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请以root用户运行此脚本"
    echo "💡 使用: sudo bash setup-nginx.sh"
    exit 1
fi

# 配置参数
PROJECT_NAME="secret-treehouse"
PROJECT_DIR="/var/www/${PROJECT_NAME}"
DOMAIN="${1:-$(curl -s ifconfig.me)}"  # 使用参数或服务器IP
PORT="3000"

echo "📋 配置参数："
echo "项目名称: ${PROJECT_NAME}"
echo "项目目录: ${PROJECT_DIR}"
echo "域名/IP: ${DOMAIN}"
echo "后端端口: ${PORT}"
echo ""

echo "1. 备份原有Nginx配置..."
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d)

echo "2. 创建Nginx站点配置..."
cat > /etc/nginx/sites-available/${PROJECT_NAME} << EOF
# 匿名情绪树洞 - Nginx配置
server {
    listen 80;
    listen [::]:80;
    
    server_name ${DOMAIN};
    root ${PROJECT_DIR}/public;
    index index.html;
    
    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 前端静态文件
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
        
        # 不缓存HTML文件
        location ~* \.(html)$ {
            expires -1;
            add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
        }
    }
    
    # 后端API代理
    location /api {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲区设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # 健康检查端点
    location /health {
        proxy_pass http://127.0.0.1:${PORT}/api/health;
        access_log off;
    }
    
    # 禁止访问敏感文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~* \.(db|sql|env|log|sh)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
    
    # 访问日志
    access_log /var/log/nginx/${PROJECT_NAME}-access.log;
    error_log /var/log/nginx/${PROJECT_NAME}-error.log;
}
EOF

echo "3. 启用站点配置..."
ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

echo "4. 测试Nginx配置..."
if nginx -t; then
    echo "✅ Nginx配置测试通过"
else
    echo "❌ Nginx配置测试失败"
    echo "请检查配置: /etc/nginx/sites-available/${PROJECT_NAME}"
    exit 1
fi

echo "5. 重启Nginx服务..."
systemctl restart nginx
systemctl enable nginx

echo "6. 配置防火墙（如果启用）..."
# 开放80端口
if command -v ufw &> /dev/null && ufw status | grep -q "active"; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "✅ 防火墙已配置"
fi

echo "7. 设置日志轮转..."
cat > /etc/logrotate.d/${PROJECT_NAME} << EOF
/var/log/nginx/${PROJECT_NAME}-access.log
/var/log/nginx/${PROJECT_NAME}-error.log
${PROJECT_DIR}/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \$(cat /var/run/nginx.pid)
    endscript
}
EOF

echo ""
echo "========================================"
echo "✅ Nginx配置完成！"
echo ""
echo "🌐 访问信息："
echo "网站地址: http://${DOMAIN}"
echo "API地址: http://${DOMAIN}/api/health"
echo ""
echo "📊 服务状态："
echo "Nginx: $(systemctl is-active nginx)"
echo "Node.js: $(pm2 status ${PROJECT_NAME} --silent 2>/dev/null | grep -q online && echo '在线' || echo '离线')"
echo ""
echo "📋 管理命令："
echo "查看Nginx日志: tail -f /var/log/nginx/${PROJECT_NAME}-*.log"
echo "查看应用日志: pm2 logs ${PROJECT_NAME}"
echo "重启Nginx: systemctl restart nginx"
echo "重载配置: nginx -s reload"
echo ""
echo "🔒 安全建议："
echo "1. 配置HTTPS（使用Let's Encrypt）"
echo "2. 设置防火墙规则"
echo "3. 定期更新系统和软件"
echo "4. 监控服务器资源使用"
echo "========================================"

echo ""
echo "🎯 部署完成！现在可以通过浏览器访问："
echo "👉 http://${DOMAIN}"
echo ""
echo "💖 匿名情绪树洞已准备就绪，温暖每一个需要倾诉的心 💖"