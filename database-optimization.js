// ==================== 匿名情绪树洞 - 数据库优化脚本 ====================
// 执行：node database-optimization.js
// 目的：优化数据库表结构，添加新功能支持

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const DB_PATH = path.join(__dirname, 'data/treehouse.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  }
  console.log('✅ 成功连接到数据库');
});

// 执行SQL语句的辅助函数
function runSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

// 查询SQL语句的辅助函数
function querySQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// 主优化函数
async function optimizeDatabase() {
  console.log('🔄 开始数据库优化...');
  
  try {
    // ==================== 1. 备份现有数据 ====================
    console.log('📊 步骤1: 备份现有数据...');
    const existingMessages = await querySQL('SELECT * FROM messages');
    console.log(`✅ 已备份 ${existingMessages.length} 条留言数据`);
    
    // ==================== 2. 创建新表结构 ====================
    console.log('🗄️ 步骤2: 创建优化后的表结构...');
    
    // 2.1 创建新的messages表（优化版）
    await runSQL(`
      CREATE TABLE IF NOT EXISTS messages_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT,
        content TEXT NOT NULL,
        emotion TEXT,
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
    `);
    console.log('✅ 创建新的messages表');
    
    // 2.2 创建分类表
    await runSQL(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT DEFAULT '#FFB6C1',
        icon TEXT DEFAULT '📝',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 创建categories表');
    
    // 2.3 创建点赞表
    await runSQL(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        user_fingerprint TEXT, -- 匿名用户的浏览器指纹
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(message_id, user_fingerprint),
        FOREIGN KEY (message_id) REFERENCES messages_new(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ 创建likes表');
    
    // 2.4 创建访问统计表
    await runSQL(`
      CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL UNIQUE,
        total_views INTEGER DEFAULT 0,
        total_messages INTEGER DEFAULT 0,
        total_likes INTEGER DEFAULT 0,
        total_replies INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 创建statistics表');
    
    // 2.5 创建系统配置表
    await runSQL(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 创建settings表');
    
    // ==================== 3. 迁移现有数据 ====================
    console.log('📦 步骤3: 迁移现有数据...');
    
    if (existingMessages.length > 0) {
      for (const msg of existingMessages) {
        await runSQL(`
          INSERT INTO messages_new (
            id, nickname, content, emotion, is_public, is_approved,
            created_at, reply_content, reply_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          msg.id,
          msg.nickname,
          msg.content,
          msg.emotion,
          msg.is_public,
          msg.is_approved,
          msg.created_at,
          msg.reply_content,
          msg.reply_at
        ]);
      }
      console.log(`✅ 成功迁移 ${existingMessages.length} 条留言`);
    }
    
    // ==================== 4. 创建索引 ====================
    console.log('📈 步骤4: 创建性能索引...');
    
    // 4.1 messages表索引
    await runSQL('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages_new(created_at DESC)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_messages_is_approved ON messages_new(is_approved)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_messages_is_public ON messages_new(is_public)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_messages_emotion ON messages_new(emotion)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_messages_category ON messages_new(category)');
    console.log('✅ 创建messages表索引');
    
    // 4.2 likes表索引
    await runSQL('CREATE INDEX IF NOT EXISTS idx_likes_message_id ON likes(message_id)');
    await runSQL('CREATE INDEX IF NOT EXISTS idx_likes_user_fingerprint ON likes(user_fingerprint)');
    console.log('✅ 创建likes表索引');
    
    // 4.3 statistics表索引
    await runSQL('CREATE INDEX IF NOT EXISTS idx_statistics_date ON statistics(date DESC)');
    console.log('✅ 创建statistics表索引');
    
    // ==================== 5. 初始化数据 ====================
    console.log('🌱 步骤5: 初始化基础数据...');
    
    // 5.1 初始化分类数据
    const defaultCategories = [
      ['情感关系', '关于爱情、友情、家庭等情感话题', '#FF6B8B', '💖', 1],
      ['工作学习', '职场压力、学业困扰、职业发展', '#4C8BF5', '💼', 2],
      ['心理健康', '情绪管理、心理困扰、自我成长', '#38A169', '🧠', 3],
      ['生活日常', '日常琐事、生活感悟、兴趣爱好', '#F6AD55', '🏠', 4],
      ['未来迷茫', '人生方向、选择困难、未来规划', '#9F7AEA', '🧭', 5]
    ];
    
    for (const cat of defaultCategories) {
      await runSQL(`
        INSERT OR IGNORE INTO categories (name, description, color, icon, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `, cat);
    }
    console.log('✅ 初始化5个默认分类');
    
    // 5.2 初始化系统设置
    const defaultSettings = [
      ['site_name', '匿名情绪树洞', '网站名称'],
      ['site_slogan', '让心事有处安放，让温暖触手可及', '网站标语'],
      ['max_message_length', '1000', '留言最大长度'],
      ['auto_approve', '0', '是否自动审核留言'],
      ['default_emotion', '平静', '默认情绪'],
      ['reply_time_hours', '24', '预计回复时间（小时）'],
      ['max_messages_per_day', '10', '每日最大留言数'],
      ['maintenance_mode', '0', '维护模式']
    ];
    
    for (const setting of defaultSettings) {
      await runSQL(`
        INSERT OR REPLACE INTO settings (key, value, description)
        VALUES (?, ?, ?)
      `, setting);
    }
    console.log('✅ 初始化系统设置');
    
    // 5.3 初始化今日统计
    const today = new Date().toISOString().split('T')[0];
    await runSQL(`
      INSERT OR IGNORE INTO statistics (date, total_messages)
      VALUES (?, ?)
    `, [today, existingMessages.length]);
    console.log('✅ 初始化今日统计');
    
    // ==================== 6. 表重命名（切换） ====================
    console.log('🔄 步骤6: 切换表结构...');
    
    // 6.1 备份旧表
    await runSQL('ALTER TABLE messages RENAME TO messages_backup');
    console.log('✅ 备份旧messages表为messages_backup');
    
    // 6.2 重命名新表
    await runSQL('ALTER TABLE messages_new RENAME TO messages');
    console.log('✅ 重命名messages_new为messages');
    
    // ==================== 7. 验证优化结果 ====================
    console.log('✅ 步骤7: 验证优化结果...');
    
    const tableInfo = await querySQL(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    console.log('📊 数据库表清单:');
    tableInfo.forEach(table => {
      console.log(`   - ${table.name}`);
    });
    
    const messageCount = await querySQL('SELECT COUNT(*) as count FROM messages');
    console.log(`📝 留言总数: ${messageCount[0].count}`);
    
    const categoryCount = await querySQL('SELECT COUNT(*) as count FROM categories');
    console.log(`🏷️ 分类总数: ${categoryCount[0].count}`);
    
    // ==================== 8. 创建数据库维护函数 ====================
    console.log('🔧 步骤8: 创建维护函数...');
    
    // 创建更新统计的触发器
    await runSQL(`
      CREATE TRIGGER IF NOT EXISTS update_message_stats
      AFTER UPDATE OF like_count ON messages
      BEGIN
        UPDATE statistics 
        SET total_likes = (
          SELECT SUM(like_count) FROM messages 
          WHERE DATE(created_at) = DATE('now')
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE date = DATE('now');
      END
    `);
    console.log('✅ 创建统计更新触发器');
    
    // 创建自动更新时间的触发器
    await runSQL(`
      CREATE TRIGGER IF NOT EXISTS update_message_timestamp
      AFTER UPDATE ON messages
      FOR EACH ROW
      BEGIN
        UPDATE messages SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END
    `);
    console.log('✅ 创建时间戳更新触发器');
    
    console.log('🎉 数据库优化完成！');
    console.log('========================================');
    console.log('📊 优化总结:');
    console.log('├── 表结构: 5个优化表 + 1个备份表');
    console.log('├── 索引: 8个性能索引');
    console.log('├── 数据: 迁移全部现有留言');
    console.log('├── 分类: 5个默认分类');
    console.log('├── 设置: 8个系统配置项');
    console.log('└── 触发器: 2个自动维护触发器');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ 数据库优化失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('❌ 数据库关闭失败:', err.message);
      } else {
        console.log('🔒 数据库连接已关闭');
      }
      process.exit(0);
    });
  }
}

// 执行优化
optimizeDatabase();