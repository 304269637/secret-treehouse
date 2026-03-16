// ==================== 留言展示页 - 动态数据加载 ====================
// 项目代号: secret-treehouse
// 功能: 动态加载留言数据到展示页

const API_BASE = 'http://localhost:3000';

// 工具函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(isoString) {
    if (!isoString) return '刚刚';
    
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// 加载动态留言
async function loadDynamicMessages() {
    const messagesGrid = document.getElementById('dynamicMessagesGrid');
    if (!messagesGrid) return;
    
    // 显示加载状态
    messagesGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1;">
            <div class="loading-spinner"></div>
            <p>正在加载温暖的故事...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/api/messages?limit=20&sort=newest`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data.messages.length > 0) {
            let html = '';
            
            data.data.messages.forEach(msg => {
                html += `
                    <div class="static-message-card">
                        <div class="message-meta">
                            <div class="message-author">
                                ${escapeHtml(msg.nickname || '匿名朋友')}
                            </div>
                            <div class="message-time">
                                ${formatTime(msg.created_at)}
                            </div>
                        </div>
                        
                        ${msg.emotion ? `
                            <div class="message-emotion-tag">
                                ${escapeHtml(msg.emotion)}
                            </div>
                        ` : ''}
                        
                        <div class="message-content">
                            ${escapeHtml(msg.content).replace(/\n/g, '<br>')}
                        </div>
                        
                        ${msg.reply_content ? `
                            <div class="message-reply">
                                <div class="reply-label">💌 树洞的温暖回应</div>
                                <div class="reply-content">
                                    ${escapeHtml(msg.reply_content).replace(/\n/g, '<br>')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            messagesGrid.innerHTML = html;
            
            // 更新统计数字
            updateStats(data.data.messages.length);
            
        } else {
            // 显示空状态
            messagesGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">🌱</div>
                    <h3>树洞正在等待第一个故事</h3>
                    <p>还没有人分享心事呢，成为第一个分享的人吧！</p>
                    <a href="/" class="btn mt-3">📝 写下第一个故事</a>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('加载动态留言失败:', error);
        
        messagesGrid.innerHTML = `
            <div class="error-state" style="grid-column: 1 / -1;">
                <div class="error-icon">⚠️</div>
                <h3>加载失败</h3>
                <p>无法加载留言列表，请刷新页面重试</p>
                <button class="btn btn-secondary mt-3" onclick="loadDynamicMessages()">
                    🔄 重新加载
                </button>
            </div>
        `;
    }
}

// 更新统计数字
function updateStats(messageCount) {
    // 更新总分享数
    const totalStat = document.querySelector('.stat-card:nth-child(1) .stat-number');
    if (totalStat) {
        totalStat.textContent = messageCount;
    }
    
    // 更新今日新增（模拟数据）
    const todayStat = document.querySelector('.stat-card:nth-child(3) .stat-number');
    if (todayStat && messageCount > 0) {
        const todayNew = Math.min(8, Math.floor(messageCount * 0.2));
        todayStat.textContent = todayNew;
    }
}

// 加载统计数据
async function loadRealStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats`);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                // 更新所有统计卡片
                const stats = data.data;
                
                const totalStat = document.querySelector('.stat-card:nth-child(1) .stat-number');
                const repliedStat = document.querySelector('.stat-card:nth-child(2) .stat-number');
                const todayStat = document.querySelector('.stat-card:nth-child(3) .stat-number');
                const waitingStat = document.querySelector('.stat-card:nth-child(4) .stat-number');
                
                if (totalStat) totalStat.textContent = stats.totalMessages || 0;
                if (repliedStat) repliedStat.textContent = stats.repliedMessages || 0;
                if (todayStat) todayStat.textContent = stats.todayMessages || 0;
                if (waitingStat) waitingStat.textContent = stats.waitingForReply || 0;
            }
        }
    } catch (error) {
        console.error('加载真实统计失败:', error);
    }
}

// 页面初始化
function initMessagesPage() {
    console.log('📖 留言展示页初始化...');
    
    // 加载动态数据
    loadDynamicMessages();
    loadRealStats();
    
    // 添加刷新按钮事件
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'btn btn-secondary';
    refreshBtn.innerHTML = '🔄 刷新留言';
    refreshBtn.style.margin = '20px auto';
    refreshBtn.style.display = 'block';
    refreshBtn.onclick = () => {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '🔄 刷新中...';
        loadDynamicMessages();
        setTimeout(() => {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '🔄 刷新留言';
        }, 1000);
    };
    
    // 添加到分页区域
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.parentNode.insertBefore(refreshBtn, pagination);
    }
    
    // 自动刷新（每10分钟）
    setInterval(() => {
        if (!document.hidden) {
            loadDynamicMessages();
            loadRealStats();
        }
    }, 10 * 60 * 1000);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMessagesPage);
} else {
    initMessagesPage();
}

// 导出函数供全局使用
window.loadDynamicMessages = loadDynamicMessages;
window.loadRealStats = loadRealStats;