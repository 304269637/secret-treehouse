// ==================== 匿名情绪树洞 - 环境配置 ====================
// 自动检测环境并配置API地址

// 环境检测
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

// API基础地址配置
let API_BASE;

if (isLocalhost) {
    // 本地开发环境
    API_BASE = 'http://localhost:3000';
    console.log('🔧 开发环境：使用本地API服务器');
} else {
    // Render生产环境 - 使用已部署的Render后端
    API_BASE = 'https://secret-treehouse-api.onrender.com';
    console.log('🚀 生产环境：使用Render后端API');
}

// 全局配置
const CONFIG = {
    API_BASE: API_BASE,
    IS_PRODUCTION: !isLocalhost,
    VERSION: '1.0.0',
    SITE_NAME: '匿名情绪树洞',
    SITE_SLOGAN: '让心事有处安放，让温暖触手可及'
};

// 导出配置
window.CONFIG = CONFIG;
console.log('📋 应用配置:', CONFIG);

// 环境检查
if (CONFIG.IS_PRODUCTION) {
    console.log('🔒 生产环境：启用严格模式');
    
    // 生产环境安全检查
    if (window.location.protocol !== 'https:') {
        console.warn('⚠️  生产环境建议使用HTTPS');
    }
} else {
    console.log('🔓 开发环境：调试模式启用');
}