#!/bin/bash

echo "🧪 开始测试集成版功能..."
echo "========================================"

# 测试1: 健康检查
echo "1. 测试健康检查..."
curl -s "http://localhost:3000/api/health" | jq '.status' 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 健康检查正常"
else
    echo "❌ 健康检查失败"
fi

echo "----------------------------------------"

# 测试2: 获取留言
echo "2. 测试获取留言..."
MESSAGE_COUNT=$(curl -s "http://localhost:3000/api/messages?limit=5" | jq '.data.messages | length' 2>/dev/null)
if [ "$MESSAGE_COUNT" -gt 0 ]; then
    echo "✅ 获取到 $MESSAGE_COUNT 条留言"
else
    echo "⚠️  未获取到留言或获取失败"
fi

echo "----------------------------------------"

# 测试3: 获取统计
echo "3. 测试获取统计..."
STATS=$(curl -s "http://localhost:3000/api/stats" | jq '.success' 2>/dev/null)
if [ "$STATS" = "true" ]; then
    echo "✅ 统计API正常"
else
    echo "❌ 统计API失败"
fi

echo "----------------------------------------"

# 测试4: 获取分类
echo "4. 测试获取分类..."
CATEGORIES=$(curl -s "http://localhost:3000/api/categories" | jq '.data | length' 2>/dev/null)
if [ "$CATEGORIES" -gt 0 ]; then
    echo "✅ 获取到 $CATEGORIES 个分类"
else
    echo "❌ 分类API失败"
fi

echo "----------------------------------------"

# 测试5: 提交测试留言
echo "5. 测试提交留言..."
TEST_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/messages" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"集成测试用户","emotion":"快乐","content":"这是集成版的测试留言！功能一切正常！","category":"general","is_public":1}' \
  | jq '.success' 2>/dev/null)

if [ "$TEST_RESPONSE" = "true" ]; then
    echo "✅ 留言提交成功"
else
    echo "❌ 留言提交失败"
fi

echo "----------------------------------------"

# 测试6: 验证页面加载
echo "6. 验证页面加载..."
PAGE_TITLE=$(curl -s "http://localhost:3000/" | grep -o "<title>[^<]*</title>" | sed 's/<title>//;s/<\/title>//')
if [ -n "$PAGE_TITLE" ]; then
    echo "✅ 页面加载正常: $PAGE_TITLE"
else
    echo "❌ 页面加载失败"
fi

echo "========================================"
echo "🎯 集成测试完成！"
echo "🦞 小龙虾集成小队工作验证完毕"