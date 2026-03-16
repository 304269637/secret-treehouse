// ==================== 匿名情绪树洞 - 服务器主文件（修复版） ====================
// 项目代号: secret-treehouse
// 项目口号: 让心事有处安放，让温暖触手可及

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== 环境配置 ====================
const isProduction = process.env.NODE_ENV === 'production';
console.log(`🚀 运行环境: ${isProduction ? '生产环境' : '开发环境'}`);

// ==================== 中间件配置 ====================
app.use(helmet()); // 安全头

// CORS配置 - 生产环境更严格
if (isProduction) {
    const allowedOrigins = [
        'https://secret-treehouse.vercel.app',
        'http://localhost:3000'
    ];
    
    app.use(cors({
        origin: function(origin, callback) {
            // 允许没有origin的请求（如curl）
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = `CORS策略阻止了来自 ${origin} 的请求`;
                console.warn(msg);
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        credentials: true
    }));
} else {
    // 开发环境允许所有来源
    app.use(cors());
    console.log('🔓 开发环境：CORS允许所有来源');
}

app.use(express.json()); // JSON解析
app.use(express.static(path.join(__dirname, 'public'))); // 静态文件服务

// ==================== 数据库连接 ====================
// 生产环境警告：SQLite在Render上可能不是持久化的
if (isProduction) {
    console.warn('⚠️  生产环境警告：SQLite数据库在Render免费版上可能不是持久化的');
    console.warn('💡 建议：升级到Render的PostgreSQL或使用Railway的持久化存储');
}

const dbPath = isProduction 
    ? path.join(__dirname, 'data/treehouse.db')
    : path.join(__dirname, 'data/treehouse.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    console.error('💡 提示：确保data目录存在且有写入权限');
  } else {
    console.log(`✅ 成功连接到SQLite数据库: ${dbPath}`);
    
    // 初始化表结构（如果不存在）
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT,
        content TEXT NOT NULL,
        emotion TEXT DEFAULT '平静',
        category TEXT DEFAULT 'general',
        is_anonymous BOOLEAN DEFAULT 1,
        is_public BOOLEAN DEFAULT 0,
        is_approved BOOLEAN DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reply_content TEXT,
        reply_at DATETIME,
        reply_by TEXT DEFAULT 'treehouse',
        metadata TEXT DEFAULT '{}'
      )
    `, (err) => {
      if (err) console.error('创建messages表失败:', err.message);
      else console.log('✅ messages表已就绪');
    });
    
    // 创建其他表
    const tables = [
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT DEFAULT '#FFB6C1',
        icon TEXT DEFAULT '📝',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        user_fingerprint TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id, user_fingerprint),
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL UNIQUE,
        total_views INTEGER DEFAULT 0,
        total_messages INTEGER DEFAULT 0,
        total_likes INTEGER DEFAULT 0,
        total_replies INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) console.error(`创建表${index+1}失败:`, err.message);
      });
    });
    
    // 初始化示例数据
    setTimeout(() => {
      initSampleData();
    }, 1000);
  }
});

// 初始化示例数据
function initSampleData() {
  // 检查是否有数据
  db.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
    if (err) return;
    
    if (row.count === 0) {
      console.log('🌱 初始化示例数据...');
      
      const sampleMessages = [
        {
          nickname: '迷茫的旅人',
          content: '站在人生的十字路口，不知道未来的方向在哪里。看着同学们都有了明确的目标，我却还在原地徘徊，感觉很焦虑。',
          emotion: '迷茫',
          category: '未来迷茫',
          is_public: 1,
          is_approved: 1,
          reply_content: '迷茫是探索的开始。不必急于找到答案，先享受探索的过程。每个人的花期不同，你只是在积蓄力量，等待绽放的时刻。',
          reply_at: new Date(Date.now() - 86400000).toISOString() // 1天前
        },
        {
          nickname: '感恩的心',
          content: '今天早上看到窗外的阳光洒进来，突然觉得很感恩。感恩健康的身体，感恩家人的陪伴，感恩还有追求梦想的机会。',
          emotion: '感恩',
          category: '生活日常',
          is_public: 1,
          is_approved: 1,
          reply_content: '感恩的心是最美的风景。谢谢你提醒我们关注生活中的美好。愿这份感恩的心一直陪伴你，照亮前行的路。',
          reply_at: new Date(Date.now() - 172800000).toISOString() // 2天前
        },
        {
          nickname: '勇敢的尝试者',
          content: '明天要做一个重要的演讲，虽然准备得很充分，但还是控制不住地紧张。手心出汗，心跳加速，担心自己会忘词...',
          emotion: '焦虑',
          category: '工作学习',
          is_public: 1,
          is_approved: 1,
          reply_content: '紧张是身体在为你加油！把注意力放在你要传递的信息上，而不是自己的表现上。你已经准备得很充分，相信你自己。',
          reply_at: new Date(Date.now() - 259200000).toISOString() // 3天前
        }
      ];
      
      sampleMessages.forEach(msg => {
        db.run(
          `INSERT INTO messages (nickname, content, emotion, category, is_public, is_approved, reply_content, reply_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [msg.nickname, msg.content, msg.emotion, msg.category, msg.is_public, msg.is_approved, msg.reply_content, msg.reply_at]
        );
      });
      
      // 初始化分类
      const categories = [
        ['情感关系', '关于爱情、友情、家庭等情感话题', '#FF6B8B', '💖', 1],
        ['工作学习', '职场压力、学业困扰、职业发展', '#4C8BF5', '💼', 2],
        ['心理健康', '情绪管理、心理困扰、自我成长', '#38A169', '🧠', 3],
        ['生活日常', '日常琐事、生活感悟、兴趣爱好', '#F6AD55', '🏠', 4],
        ['未来迷茫', '人生方向、选择困难、未来规划', '#9F7AEA', '🧭', 5]
      ];
      
      categories.forEach(cat => {
        db.run(
          `INSERT OR IGNORE INTO categories (name, description, color, icon, sort_order) VALUES (?, ?, ?, ?, ?)`,
          cat
        );
      });
      
      // 初始化设置
      const settings = [
        ['site_name', '匿名情绪树洞', '网站名称'],
        ['site_slogan', '让心事有处安放，让温暖触手可及', '网站标语'],
        ['max_message_length', '1000', '留言最大长度'],
        ['auto_approve', '0', '是否自动审核留言'],
        ['default_emotion', '平静', '默认情绪'],
        ['reply_time_hours', '24', '预计回复时间（小时）'],
        ['max_messages_per_day', '10', '每日最大留言数']
      ];
      
      settings.forEach(setting => {
        db.run(
          `INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)`,
          setting
        );
      });
      
      console.log('✅ 示例数据初始化完成');
    }
  });
}

// ==================== API路由 ====================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: '匿名情绪树洞服务器运行正常',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// 获取所有公开留言
app.get('/api/messages', (req, res) => {
  const { category, emotion, sort = 'newest', page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let query = `
    SELECT 
      m.id, m.nickname, m.content, m.emotion, m.category,
      m.view_count, m.like_count, m.created_at, 
      m.reply_content, m.reply_at, m.reply_by
    FROM messages m
    WHERE m.is_public = 1 AND m.is_approved = 1
  `;
  
  const params = [];
  
  if (category && category !== 'all') {
    query += ' AND m.category = ?';
    params.push(category);
  }
  
  if (emotion && emotion !== 'all') {
    query += ' AND m.emotion = ?';
    params.push(emotion);
  }
  
  if (sort === 'newest') {
    query += ' ORDER BY m.created_at DESC';
  } else if (sort === 'popular') {
    query += ' ORDER BY m.like_count DESC, m.view_count DESC';
  } else if (sort === 'oldest') {
    query += ' ORDER BY m.created_at ASC';
  }
  
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM messages WHERE is_public = 1 AND is_approved = 1';
    const countParams = [];
    
    if (category && category !== 'all') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    if (emotion && emotion !== 'all') {
      countQuery += ' AND emotion = ?';
      countParams.push(emotion);
    }
    
    db.get(countQuery, countParams, (countErr, countRow) => {
      if (countErr) {
        res.status(500).json({ error: countErr.message });
        return;
      }
      
      res.json({
        success: true,
        data: {
          messages: rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countRow.total,
            totalPages: Math.ceil(countRow.total / parseInt(limit))
          }
        }
      });
    });
  });
});

// 提交新留言
app.post('/api/messages', (req, res) => {
  const { nickname, emotion = '平静', content, category = 'general', is_public = 0 } = req.body;
  
  // 验证
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: '留言内容不能为空' 
    });
  }
  
  if (content.length > 1000) {
    return res.status(400).json({ 
      success: false, 
      error: '留言内容不能超过1000字' 
    });
  }
  
  const now = new Date().toISOString();
  
  db.run(
    `INSERT INTO messages (nickname, emotion, content, category, is_public, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nickname || null, emotion, content.trim(), category, is_public ? 1 : 0, now, now],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        success: true,
        message: '留言已提交！我们会尽快回复你 💖',
        data: {
          id: this.lastID,
          nickname: nickname || '匿名朋友',
          emotion: emotion,
          content: content.trim(),
          created_at: now
        }
      });
    }
  );
});

// 获取统计数据
app.get('/api/stats', (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as total_messages,
      SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved_messages,
      SUM(CASE WHEN reply_content IS NOT NULL THEN 1 ELSE 0 END) as replied_messages
     FROM messages`,
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        success: true,
        data: {
          totalMessages: row.total_messages,
          approvedMessages: row.approved_messages,
          repliedMessages: row.replied_messages,
          waitingForReply: row.total_messages - row.replied_messages
        }
      });
    }
  );
});

// 获取分类
app.get('/api/categories', (req, res) => {
  db.all(
    `SELECT id, name, description, color, icon, sort_order
     FROM categories 
     WHERE is_active = 1
     ORDER BY sort_order, name`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        success: true,
        data: rows
      });
    }
  );
});

// ==================== 错误处理 ====================
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '找不到请求的资源'
  });
});

// ==================== 启动服务器 ====================
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🦞 匿名情绪树洞服务器启动成功！');
  console.log(`🌐 环境: ${isProduction ? '生产环境' : '开发环境'}`);
  console.log(`🚪 端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`💌 提交留言: POST http://localhost:${PORT}/api/messages`);
  console.log(`📝 查看留言: GET http://localhost:${PORT}/api/messages`);
  console.log('========================================');
  console.log('项目代号: secret-treehouse');
  console.log('项目口号: 让心事有处安放，让温暖触手可及');
  console.log('========================================');
  
  // 生产环境额外提示
  if (isProduction) {
    console.log('⚠️  重要提示：');
    console.log('├── SQLite数据库在Render免费版可能不是持久化的');
    console.log('├── 建议升级到PostgreSQL确保数据安全');
    console.log('└── 定期备份重要数据');
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到关闭信号，正在关闭服务器...');
  db.close();
  process.exit(0);
});