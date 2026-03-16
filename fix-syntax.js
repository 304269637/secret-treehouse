// 修复server.js语法错误
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

console.log('🔧 开始修复语法错误...');

// 查找并修复可能的括号不匹配
// 查找所有app.get和app.post的闭合括号
const lines = content.split('\n');
let braceCount = 0;
let inFunction = false;
let functionStart = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 检查app.get或app.post开始
  if (line.includes('app.get(') || line.includes('app.post(') || line.includes('app.put(')) {
    inFunction = true;
    functionStart = i;
    console.log(`📝 第${i+1}行: 开始API端点`);
  }
  
  // 统计大括号
  const openBraces = (line.match(/{/g) || []).length;
  const closeBraces = (line.match(/}/g) || []).length;
  braceCount += openBraces - closeBraces;
  
  // 如果在大括号内且大括号平衡了，可能是一个函数结束
  if (inFunction && braceCount === 0 && i > functionStart) {
    console.log(`✅ 第${i+1}行: API端点结束`);
    inFunction = false;
  }
}

console.log(`📊 最终大括号计数: ${braceCount}`);

if (braceCount !== 0) {
  console.log('⚠️  检测到大括号不匹配，尝试自动修复...');
  
  // 简单修复：在文件末尾添加缺失的大括号
  if (braceCount > 0) {
    const missingBraces = '}'.repeat(braceCount);
    content += '\n' + missingBraces + '\n';
    console.log(`✅ 添加了 ${braceCount} 个缺失的大括号`);
  } else {
    // 如果大括号过多，需要更复杂的修复
    console.log('❌ 大括号过多，需要手动修复');
    process.exit(1);
  }
  
  // 保存修复后的文件
  fs.writeFileSync(serverPath, content, 'utf8');
  console.log('✅ 文件已修复');
} else {
  console.log('✅ 大括号匹配正常，可能是其他语法错误');
}

// 验证修复结果
console.log('\n🔍 验证修复结果...');
try {
  require('vm').createScript(content, serverPath);
  console.log('✅ 语法验证通过！');
} catch (error) {
  console.log('❌ 语法验证失败:', error.message);
  console.log('建议手动检查第421行附近的代码');
}