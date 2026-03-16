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
    // 生产环境 - 使用本地服务器（通过ngrok或类似服务公开）
    // 注意：这需要将本地服务器公开到互联网
    // 临时方案：使用静态数据模式
    API_BASE = 'http://localhost:3000'; // 暂时保持，需要公开服务
    console.log('⚠️  生产环境：需要公开本地服务器或使用静态数据');
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