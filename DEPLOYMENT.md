# 🚀 匿名情绪树洞 - 部署指南

**项目代号**: secret-treehouse  
**版本**: 1.0.0  
**最后更新**: 2026年3月16日

## 📋 部署方案

### 方案A：Render（后端）+ Vercel（前端）✅ **推荐**
- **学习价值**: ⭐⭐⭐⭐⭐（现代Web开发标准流程）
- **成本**: 免费（两家都有慷慨的免费额度）
- **复杂度**: 中等（需要配置CORS和环境变量）
- **数据持久性**: ⚠️ 注意SQLite在Render免费版的限制

### 方案B：Railway（全栈部署）
- **学习价值**: ⭐⭐⭐⭐
- **成本**: 免费（每月5美元信用）
- **复杂度**: 简单（一键部署）
- **数据持久性**: ✅ 优秀（提供持久化存储）

### 方案C：Docker容器化
- **学习价值**: ⭐⭐⭐⭐⭐
- **成本**: 依赖托管平台
- **复杂度**: 高（需要Docker知识）
- **数据持久性**: ✅ 优秀

## 🛠️ 方案A详细部署步骤

### 第1步：代码准备（30分钟）

#### 1.1 环境检查
```bash
# 检查Node.js版本
node --version  # 需要 >= 14.0.0

# 检查npm版本
npm --version   # 需要 >= 6.0.0

# 检查Git
git --version
```

#### 1.2 项目结构验证
```
secret-treehouse/
├── server.js              # 主服务器文件
├── package.json          # 依赖配置
├── package-lock.json     # 依赖锁文件
├── .gitignore           # Git忽略文件
├── .env.example         # 环境变量示例
├── DEPLOYMENT.md        # 本文件
├── public/              # 前端文件
│   ├── index.html       # 集成版首页
│   ├── messages.html    # 留言展示页
│   ├── config.js        # 环境配置
│   ├── integrated-index.js
│   ├── dynamic-messages.js
│   ├── style.css
│   └── test-api.html
├── data/                # 数据库目录
│   └── treehouse.db     # SQLite数据库
└── node_modules/        # 依赖目录
```

#### 1.3 Git初始化
```bash
# 初始化Git仓库（如果尚未初始化）
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "🎉 完成匿名情绪树洞 v1.0 - 准备部署"

# 检查提交状态
git status
```

### 第2步：后端部署到Render（45分钟）

#### 2.1 注册和准备
1. **访问**: https://render.com
2. **注册**: 使用GitHub账号登录（推荐）
3. **验证邮箱**: 完成邮箱验证

#### 2.2 创建Web Service
1. 点击 **New +** → **Web Service**
2. 连接你的GitHub仓库
3. 选择仓库：`your-username/secret-treehouse`

#### 2.3 配置服务
```yaml
名称: secret-treehouse-api
环境: Node
地区: Singapore (或离你最近的)
分支: master/main

构建命令:
npm install

启动命令:
node server.js

实例类型: Free
自动部署: 开启
```

#### 2.4 环境变量配置
在Render Dashboard中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境 |
| `PORT` | `10000` | Render分配的端口 |

#### 2.5 创建服务
1. 点击 **Create Web Service**
2. 等待部署完成（约5-10分钟）
3. 获取服务URL：`https://secret-treehouse-api.onrender.com`

### 第3步：前端适配（15分钟）

#### 3.1 更新config.js
确保 `public/config.js` 中的生产环境配置正确：

```javascript
// 生产环境配置
} else if (window.location.hostname.includes('vercel.app')) {
    // Vercel部署环境
    API_BASE = 'https://secret-treehouse-api.onrender.com'; // 你的Render后端地址
}
```

#### 3.2 测试API连接
```bash
# 测试后端API是否可访问
curl https://secret-treehouse-api.onrender.com/api/health

# 预期响应
{"status":"healthy","message":"匿名情绪树洞服务器运行正常",...}
```

### 第4步：前端部署到Vercel（30分钟）

#### 4.1 注册和准备
1. **访问**: https://vercel.com
2. **注册**: 使用GitHub账号登录
3. **验证邮箱**: 完成邮箱验证

#### 4.2 导入项目
1. 点击 **Add New** → **Project**
2. 导入GitHub仓库：`your-username/secret-treehouse`
3. 点击 **Import**

#### 4.3 配置项目
```yaml
项目名称: secret-treehouse
框架预设: Other
根目录: ./public
构建命令: （留空）
输出目录: （留空）
安装命令: （留空）
```

#### 4.4 环境变量（可选）
Vercel前端通常不需要环境变量，因为配置在config.js中。

#### 4.5 部署
1. 点击 **Deploy**
2. 等待部署完成（约2-5分钟）
3. 获取访问URL：`https://secret-treehouse.vercel.app`

### 第5步：CORS配置和测试（10分钟）

#### 5.1 验证CORS配置
```javascript
// server.js中的CORS配置应该允许Vercel域名
const allowedOrigins = [
    'https://secret-treehouse.vercel.app',
    'http://localhost:3000'
];
```

#### 5.2 测试跨域请求
```bash
# 测试前端访问后端API
curl -H "Origin: https://secret-treehouse.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://secret-treehouse-api.onrender.com/api/health
```

### 第6步：完整功能测试（30分钟）

#### 6.1 测试清单
- [ ] 访问首页：https://secret-treehouse.vercel.app/
- [ ] 测试留言加载
- [ ] 测试表单提交
- [ ] 测试统计显示
- [ ] 测试展示页：https://secret-treehouse.vercel.app/messages.html
- [ ] 测试API端点：https://secret-treehouse.vercel.app/test-api.html

#### 6.2 常见问题排查

**问题1：CORS错误**
```
解决方案：
1. 检查server.js中的allowedOrigins配置
2. 确保包含正确的Vercel域名
3. 重启Render服务
```

**问题2：数据库连接失败**
```
解决方案：
1. 检查data目录是否存在
2. 检查文件权限
3. 考虑使用PostgreSQL替代SQLite
```

**问题3：静态文件404**
```
解决方案：
1. 检查Vercel的根目录配置是否为./public
2. 检查文件路径是否正确
3. 重新部署Vercel
```

## 📊 生产环境监控

### 健康检查端点
```
GET https://secret-treehouse-api.onrender.com/api/health
```

### 性能监控建议
1. **Uptime Robot**: 免费监控服务可用性
2. **Render Dashboard**: 监控API响应时间和错误率
3. **Vercel Analytics**: 监控前端性能

## 🔄 更新和维护

### 代码更新流程
```bash
# 1. 本地开发
git checkout -b feature/new-feature
# ...开发代码...

# 2. 提交更改
git add .
git commit -m "添加新功能"

# 3. 推送到GitHub
git push origin feature/new-feature

# 4. 创建Pull Request
# 5. 合并后自动触发部署
```

### 数据库备份
```bash
# 备份SQLite数据库
cp data/treehouse.db data/backup/treehouse-$(date +%Y%m%d).db

# 建议：迁移到PostgreSQL
# Render提供免费的PostgreSQL数据库
```

## 🆘 故障排除

### 紧急联系人
- **技术问题**: 查看本文档
- **Render支持**: https://render.com/contact
- **Vercel支持**: https://vercel.com/contact

### 快速恢复步骤
1. 检查服务状态：Render Dashboard + Vercel Dashboard
2. 查看日志：Render Logs + Vercel Logs
3. 回滚部署：在Dashboard中选择之前的版本

## 📈 扩展计划

### 短期优化（1个月内）
- [ ] 添加用户认证系统
- [ ] 实现留言审核后台
- [ ] 添加数据可视化图表

### 中期扩展（3个月内）
- [ ] 迁移到PostgreSQL数据库
- [ ] 实现实时聊天功能
- [ ] 添加移动端App

### 长期愿景（6个月以上）
- [ ] 多语言支持
- [ ] AI情感分析
- [ ] 社区功能

---

**部署完成标志**：当你能够通过 https://secret-treehouse.vercel.app 访问完整的树洞应用，并且所有功能正常工作时，部署成功！

**庆祝时刻**：分享你的成果到社交媒体，邀请朋友测试，收集反馈，持续改进！

**记住**：每个成功的部署都是学习的机会，每个遇到的问题都是成长的阶梯。🦞