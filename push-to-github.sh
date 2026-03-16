#!/bin/bash

echo "🚀 开始推送到GitHub仓库..."
echo "仓库: https://github.com/304269637/secret-treehouse"

# 检查当前目录
cd /root/.openclaw/workspace/secret-treehouse || exit 1

# 移除旧的远程仓库
git remote remove origin 2>/dev/null

# 添加新的远程仓库（使用HTTPS）
git remote add origin https://github.com/304269637/secret-treehouse.git

# 检查远程仓库
echo "📡 远程仓库配置:"
git remote -v

# 检查本地提交
echo "📝 本地提交记录:"
git log --oneline -5

# 尝试推送（需要手动输入凭据）
echo "🔑 需要GitHub凭据进行推送..."
echo "💡 提示: 如果提示输入用户名和密码，请使用:"
echo "   用户名: 304269637"
echo "   密码: 您的GitHub个人访问令牌(PAT)"
echo ""
echo "正在尝试推送..."

# 尝试推送
if git push -u origin main; then
    echo "✅ 推送成功！"
    echo "🌐 仓库地址: https://github.com/304269637/secret-treehouse"
    
    # 显示仓库信息
    echo ""
    echo "📊 仓库状态:"
    echo "├── 分支: main"
    echo "├── 提交数: $(git rev-list --count HEAD)"
    echo "├── 文件数: $(find . -type f -name "*.js" -o -name "*.html" -o -name "*.css" -o -name "*.md" | wc -l)"
    echo "└── 总大小: $(du -sh . | cut -f1)"
    
else
    echo "❌ 推送失败"
    echo "💡 解决方案:"
    echo "1. 确保您有仓库的写入权限"
    echo "2. 使用GitHub个人访问令牌代替密码"
    echo "3. 检查网络连接"
    echo ""
    echo "手动推送命令:"
    echo "  cd /root/.openclaw/workspace/secret-treehouse"
    echo "  git push -u origin main"
fi