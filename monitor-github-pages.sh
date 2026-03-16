#!/bin/bash

echo "🔍 监控GitHub Pages部署状态..."
echo "========================================"
echo "🕐 开始时间: $(date)"
echo "🌐 监控地址: https://304269637.github.io/secret-treehouse"
echo ""

# 监控循环
for i in {1..15}; do
    echo ""
    echo "🔄 第 $i 次检查 ($(date '+%H:%M:%S'))"
    
    # 测试访问
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://304269637.github.io/secret-treehouse" 2>/dev/null)
    
    case $STATUS in
        200)
            echo "🎉 🎉 🎉 部署成功！ 🎉 🎉 🎉"
            echo "✅ HTTP状态: 200 (成功)"
            echo "🌐 访问地址: https://304269637.github.io/secret-treehouse"
            echo ""
            echo "🚀 立即测试功能:"
            echo "1. 打开上面的链接"
            echo "2. 提交测试留言"
            echo "3. 验证所有功能"
            echo ""
            echo "🦞 小龙虾部署小队祝贺您！"
            echo "========================================"
            exit 0
            ;;
        404)
            echo "⏳ 尚未部署完成 (404)"
            echo "💡 GitHub Pages还在构建中..."
            ;;
        301|302)
            echo "🔄 重定向中..."
            echo "💡 可能是GitHub Pages正在设置"
            ;;
        000)
            echo "🌐 无法连接"
            echo "💡 可能域名还未生效"
            ;;
        *)
            echo "📊 HTTP状态: $STATUS"
            echo "💡 部署进行中..."
            ;;
    esac
    
    if [ $i -lt 15 ]; then
        echo "⏳ 等待20秒后重试..."
        sleep 20
    fi
done

echo ""
echo "========================================"
echo "⚠️  部署可能还在进行中"
echo "📋 建议:"
echo "1. 等待2-3分钟再访问"
echo "2. 检查GitHub Pages设置页面状态"
echo "3. 如果长时间未成功，截图状态发送给我"
echo "========================================"