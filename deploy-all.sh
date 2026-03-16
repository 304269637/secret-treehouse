#!/bin/bash

echo "========================================"
echo "🚀 匿名情绪树洞 - 一键部署脚本"
echo "========================================"
echo "🕐 开始时间: $(date)"
echo "📋 版本: 1.0.0"
echo "🦞 小龙虾部署小队出品"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以root运行
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "请以root用户运行此脚本"
        echo "💡 使用: sudo bash deploy-all.sh"
        exit 1
    fi
}

# 检查系统
check_system() {
    print_info "检测系统信息..."
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    
    print_info "操作系统: $OS $VER"
    print_info "内核版本: $(uname -r)"
    print_info "架构: $(uname -m)"
    
    # 检查内存
    MEM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$MEM_TOTAL" -lt 512 ]; then
        print_warning "内存较小（${MEM_TOTAL}MB），建议至少512MB"
    else
        print_info "内存: ${MEM_TOTAL}MB"
    fi
    
    # 检查磁盘
    DISK_FREE=$(df -h / | awk 'NR==2 {print $4}')
    print_info "磁盘可用空间: $DISK_FREE"
}

# 主部署函数
deploy_all() {
    print_info "开始部署匿名情绪树洞..."
    echo ""
    
    # 步骤1：设置服务器环境
    print_info "步骤1: 设置服务器环境"
    if [ -f "deploy-scripts/setup-server.sh" ]; then
        bash deploy-scripts/setup-server.sh
        if [ $? -eq 0 ]; then
            print_success "服务器环境设置完成"
        else
            print_error "服务器环境设置失败"
            exit 1
        fi
    else
        print_error "找不到 setup-server.sh"
        exit 1
    fi
    
    echo ""
    
    # 步骤2：部署项目
    print_info "步骤2: 部署项目"
    if [ -f "deploy-scripts/deploy-project.sh" ]; then
        bash deploy-scripts/deploy-project.sh
        if [ $? -eq 0 ]; then
            print_success "项目部署完成"
        else
            print_error "项目部署失败"
            exit 1
        fi
    else
        print_error "找不到 deploy-project.sh"
        exit 1
    fi
    
    echo ""
    
    # 步骤3：配置Nginx
    print_info "步骤3: 配置Nginx"
    if [ -f "deploy-scripts/setup-nginx.sh" ]; then
        # 询问域名
        read -p "请输入您的域名（直接回车使用服务器IP）: " DOMAIN
        if [ -z "$DOMAIN" ]; then
            DOMAIN=$(curl -s ifconfig.me)
            print_info "将使用服务器IP: $DOMAIN"
        fi
        
        bash deploy-scripts/setup-nginx.sh "$DOMAIN"
        if [ $? -eq 0 ]; then
            print_success "Nginx配置完成"
        else
            print_error "Nginx配置失败"
            exit 1
        fi
    else
        print_error "找不到 setup-nginx.sh"
        exit 1
    fi
    
    echo ""
}

# 显示部署结果
show_result() {
    SERVER_IP=$(curl -s ifconfig.me)
    
    echo "========================================"
    echo "🎉 🎉 🎉 部署完成！ 🎉 🎉 🎉"
    echo "========================================"
    echo ""
    echo "🌐 访问信息："
    echo "网站地址: http://$SERVER_IP"
    echo "API健康检查: http://$SERVER_IP/api/health"
    echo ""
    echo "📊 服务状态："
    echo "Nginx: $(systemctl is-active nginx 2>/dev/null || echo '未安装')"
    echo "Node.js应用: $(pm2 status secret-treehouse --silent 2>/dev/null | grep -q online && echo '在线' || echo '离线')"
    echo ""
    echo "📋 管理命令："
    echo "查看应用日志: pm2 logs secret-treehouse"
    echo "重启应用: pm2 restart secret-treehouse"
    echo "查看Nginx日志: tail -f /var/log/nginx/secret-treehouse-*.log"
    echo "重启Nginx: systemctl restart nginx"
    echo ""
    echo "🔧 测试功能："
    echo "1. 打开浏览器访问 http://$SERVER_IP"
    echo "2. 填写留言并提交"
    echo "3. 查看留言列表"
    echo "4. 检查统计数据"
    echo ""
    echo "🆘 故障排除："
    echo "如果无法访问，请检查："
    echo "1. 防火墙是否开放80端口"
    echo "2. 服务器安全组规则"
    echo "3. 服务是否正常运行"
    echo ""
    echo "💖 匿名情绪树洞已准备就绪！"
    echo "让心事有处安放，让温暖触手可及 💖"
    echo "========================================"
}

# 主程序
main() {
    check_root
    check_system
    
    echo ""
    print_warning "即将开始部署，这将会："
    echo "1. 安装Node.js、Git、Nginx等软件"
    echo "2. 从GitHub克隆代码"
    echo "3. 配置数据库和服务"
    echo "4. 设置Nginx反向代理"
    echo ""
    
    read -p "是否继续？(y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "部署已取消"
        exit 0
    fi
    
    deploy_all
    show_result
}

# 执行主程序
main "$@"