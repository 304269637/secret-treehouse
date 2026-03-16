// ==================== 匿名情绪树洞 - 集成版JavaScript ====================
// 项目代号: secret-treehouse
// 版本: 2.0.0 (集成版)
// 作者: JavaScript集成小队

// API基础地址
const API_BASE = 'http://localhost:3000';

// 全局状态
let currentMessages = [];
let currentStats = null;
let currentCategories = [];
let selectedCategory = 'all';
let selectedEmotion = 'all';

// ==================== 工具函数 ====================

// 安全HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 格式化时间
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
        month: 'short',
        day: 'numeric'
    });
}

// 显示成功提示
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <span>✅</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// 显示表单状态
function showFormStatus(message, type = 'info') {
    const statusEl = document.getElementById('formStatus');
    statusEl.textContent = message;
    statusEl.className = `form-status ${type}`;
    
    // 如果是错误信息，5秒后自动隐藏
    if (type === 'error') {
        setTimeout(() => {
            statusEl.className = 'form-status';
        }, 5000);
    }
}

// ==================== 数据加载函数 ====================

// 加载留言列表
async function loadMessages() {
    const messagesList = document.getElementById('dynamicMessagesList');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // 显示加载状态
    messagesList.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载温暖的故事...</p>
        </div>
    `;
    
    // 禁用刷新按钮
    refreshBtn.disabled = true;
    refreshBtn.classList.add('loading');
    
    try {
        // 构建查询参数
        const params = new URLSearchParams({
            limit: 10,
            sort: 'newest'
        });
        
        if (selectedCategory !== 'all') {
            params.append('category', selectedCategory);
        }
        
        if (selectedEmotion !== 'all') {
            params.append('emotion', selectedEmotion);
        }
        
        const response = await fetch(`${API_BASE}/api/messages?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentMessages = data.data.messages;
            
            // 更新消息数量
            document.getElementById('messagesCount').textContent = 
                `(${currentMessages.length}条)`;
            
            if (currentMessages.length === 0) {
                messagesList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🌱</div>
                        <h3>树洞正在等待第一个故事</h3>
                        <p>还没有人分享心事呢，成为第一个分享的人吧！</p>
                    </div>
                `;
            } else {
                let html = '';
                
                currentMessages.forEach(msg => {
                    html += `
                        <div class="dynamic-message-card">
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
                                    <div class="reply-label">
                                        💌 树洞的温暖回应
                                    </div>
                                    <div class="reply-content">
                                        ${escapeHtml(msg.reply_content).replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                });
                
                messagesList.innerHTML = html;
            }
            
            // 显示成功提示（如果是刷新操作）
            if (refreshBtn.dataset.refreshing === 'true') {
                showSuccess('留言列表已更新！');
                delete refreshBtn.dataset.refreshing;
            }
            
        } else {
            throw new Error(data.error || '加载失败');
        }
        
    } catch (error) {
        console.error('加载留言失败:', error);
        
        messagesList.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>加载失败</h3>
                <p>${escapeHtml(error.message)}</p>
                <p>请检查网络连接后重试</p>
                <button class="btn btn-secondary mt-3" onclick="loadMessages()">
                    🔄 重新加载
                </button>
            </div>
        `;
        
        showFormStatus('加载留言失败，请稍后重试', 'error');
        
    } finally {
        // 恢复刷新按钮
        refreshBtn.disabled = false;
        refreshBtn.classList.remove('loading');
    }
}

// 加载统计数据
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentStats = data.data;
            
            // 更新头部统计
            document.getElementById('totalMessagesStat').innerHTML = `
                <span>📝</span>
                <span>${currentStats.totalMessages} 条故事</span>
            `;
            
            document.getElementById('repliedMessagesStat').innerHTML = `
                <span>💌</span>
                <span>${currentStats.repliedMessages} 条已回应</span>
            `;
            
            document.getElementById('todayMessagesStat').innerHTML = `
                <span>📅</span>
                <span>${currentStats.todayMessages || 0} 条今日新增</span>
            `;
            
            // 更新实时统计卡片
            const liveStatsEl = document.getElementById('liveStats');
            liveStatsEl.innerHTML = `
                <p><strong>总分享数:</strong> ${currentStats.totalMessages}</p>
                <p><strong>已回应:</strong> ${currentStats.repliedMessages} (${currentStats.replyRate || 0}%)</p>
                <p><strong>等待回应:</strong> ${currentStats.waitingForReply}</p>
                <p><strong>总浏览量:</strong> ${currentStats.totalViews || 0}</p>
                <p><strong>总点赞数:</strong> ${currentStats.totalLikes || 0}</p>
            `;
            
        } else {
            throw new Error(data.error || '加载统计失败');
        }
        
    } catch (error) {
        console.error('加载统计失败:', error);
        
        // 显示错误状态
        document.getElementById('totalMessagesStat').innerHTML = `
            <span>📝</span>
            <span>加载失败</span>
        `;
        
        document.getElementById('repliedMessagesStat').innerHTML = `
            <span>💌</span>
            <span>加载失败</span>
        `;
        
        document.getElementById('todayMessagesStat').innerHTML = `
            <span>📅</span>
            <span>加载失败</span>
        `;
        
        document.getElementById('liveStats').innerHTML = `
            <p class="error">加载统计数据失败</p>
            <button class="btn btn-sm" onclick="loadStats()">重试</button>
        `;
    }
}

// 加载分类
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/api/categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentCategories = data.data;
            
            // 更新分类筛选
            const categoriesFilterEl = document.getElementById('categoriesFilter');
            let html = `
                <div class="category-filter">
                    <button class="category-btn ${selectedCategory === 'all' ? 'active' : ''}" 
                            data-category="all" onclick="filterByCategory('all')">
                        全部
                    </button>
            `;
            
            currentCategories.forEach(cat => {
                html += `
                    <button class="category-btn ${selectedCategory === cat.name ? 'active' : ''}" 
                            data-category="${escapeHtml(cat.name)}" 
                            onclick="filterByCategory('${escapeHtml(cat.name)}')"
                            style="border-left-color: ${cat.color}">
                        ${cat.icon} ${escapeHtml(cat.name)}
                    </button>
                `;
            });
            
            html += '</div>';
            categoriesFilterEl.innerHTML = html;
            
        } else {
            throw new Error(data.error || '加载分类失败');
        }
        
    } catch (error) {
        console.error('加载分类失败:', error);
        
        document.getElementById('categoriesFilter').innerHTML = `
            <p class="error">加载分类失败</p>
            <button class="btn btn-sm" onclick="loadCategories()">重试</button>
        `;
    }
}

// ==================== 交互函数 ====================

// 按分类筛选
function filterByCategory(category) {
    selectedCategory = category;
    
    // 更新按钮状态
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // 重新加载留言
    loadMessages();
}

// 提交留言表单
async function submitMessageForm(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('integratedSubmitBtn');
    const originalText = submitBtn.textContent;
    
    // 获取表单数据
    const nickname = document.getElementById('integratedNickname').value.trim();
    const emotion = document.getElementById('integratedEmotion').value;
    const content = document.getElementById('integratedContent').value.trim();
    const agreePublic = document.getElementById('integratedAgreePublic').checked;
    
    // 验证表单
    if (!content) {
        showFormStatus('请写下你想说的话', 'error');
        document.getElementById('integratedContent').focus();
        return;
    }
    
    if (content.length < 10) {
        showFormStatus('请至少写下10个字符，让我们更好地理解你', 'error');
        return;
    }
    
    if (content.length > 1000) {
        showFormStatus('留言内容不能超过1000字', 'error');
        return;
    }
    
    // 禁用提交按钮，显示加载状态
    submitBtn.disabled = true;
    submitBtn.textContent = '正在发送...';
    submitBtn.classList.add('btn-secondary');
    
    try {
        const response = await fetch(`${API_BASE}/api/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nickname: nickname || undefined,
                emotion: emotion,
                content: content,
                category: 'general',
                is_public: agreePublic ? 1 : 0
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        if (data.success) {
            // 显示成功提示
            showSuccess(data.message || '留言提交成功！');
            showFormStatus('留言已成功提交！我们会尽快回复你 💖', 'success');
            
            // 清空表单
            document.getElementById('integratedMessageForm').reset();
            document.getElementById('integratedCharCount').textContent = '0';
            document.getElementById('integratedEmotion').value = '平静';
            
            // 重置情绪选择器
            document.querySelectorAll('.emotion-option').forEach((option, index) => {
                option.classList.remove('selected');
                if (index === 6) { // 平静是第7个选项（索引6）
                    option.classList.add('selected');
                }
            });
            
            // 重新加载数据
            setTimeout(() => {
                loadMessages();
                loadStats();
            }, 1000);
            
            // 按钮成功状态
            submitBtn.textContent = '✅ 发送成功！';
            
        } else {
            throw new Error(data.error || '提交失败');
        }
        
    } catch (error) {
        console.error('提交留言失败:', error);
        
        // 显示错误提示
        showFormStatus(error.message || '提交失败，请稍后重试', 'error');
        
        // 按钮错误状态
        submitBtn.textContent = '❌ 发送失败';
        
    } finally {
        // 恢复按钮状态
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.classList.remove('btn-secondary');
        }, 2000);
    }
}

// ==================== 初始化函数 ====================

// 初始化情绪选择器
function initEmotionSelector() {
    const emotionOptions = document.querySelectorAll('.emotion-option');
    const emotionInput = document.getElementById('integratedEmotion');
    
    emotionOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除其他选项的选中状态
            emotionOptions.forEach(opt => opt.classList.remove('selected'));
            
            // 添加当前选项的选中状态
            this.classList.add('selected');
            
            // 更新隐藏输入框的值
            emotionInput.value = this.dataset.emotion;
        });
    });
    
    // 初始化选中"平静"选项
    if (emotionOptions.length > 0) {
        const calmOption = Array.from(emotionOptions).find(
            opt => opt.dataset.emotion === '平静'
        );
        if (calmOption) {
            calmOption.click();
        } else {
            emotionOptions[6]?.click(); // 第7个选项是平静
        }
    }
}

// 初始化字符计数器
function initCharCounter() {
    const textarea = document.getElementById('integratedContent');
    const charCount = document.getElementById('integratedCharCount');
    const counter = textarea.parentElement.querySelector('.char-counter');
    
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        // 更新样式
        counter.classList.remove('warning', 'danger');
        if (length > 800) {
            counter.classList.add('warning');
        }
        if (length > 950) {
            counter.classList.add('danger');
        }
        if (length > 1000) {
            this.value = this.value.substring(0, 1000);
            charCount.textContent = 1000;
        }
    });
}

// 初始化事件监听器
function initEventListeners() {
    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', function() {
        this.dataset.refreshing = 'true';
        loadMessages();
    });
    
    // 更新统计按钮
    const updateStatsBtn = document.getElementById('updateStatsBtn');
    if (updateStatsBtn) {
        updateStatsBtn.addEventListener('click', loadStats);
    }
    
    // 表单提交
    const messageForm = document.getElementById('integratedMessageForm');
    messageForm.addEventListener('submit', submitMessageForm);
    
    // 自动刷新定时器（每5分钟）
    setInterval(() => {
        if (!document.hidden) {
            loadMessages();
            loadStats();
        }
    }, 5 * 60 * 1000);
}

// ==================== 页面初始化 ====================

// 主初始化函数
async function initPage() {
    console.log('🌳 匿名情绪树洞集成版初始化...');
    
    // 初始化UI组件
    initEmotionSelector();
    initCharCounter();
    initEventListeners();
    
    // 并行加载所有数据
    try {
        await Promise.all([
            loadMessages(),
            loadStats(),
            loadCategories()
        ]);
        
        console.log('✅ 所有数据加载完成');
        showFormStatus('页面加载完成！开始写下你的心事吧 ✨', 'success');
        
        // 3秒后隐藏成功提示
        setTimeout(() => {
            const statusEl = document.getElementById('formStatus');
            if (statusEl.className.includes('success')) {
                statusEl.className = 'form-status';
            }
        }, 3000);
        
    } catch (error) {
        console.error('初始化失败:', error);
        showFormStatus('页面加载遇到问题，部分功能可能不可用', 'error');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);

// 导出函数供HTML内联调用
window.filterByCategory = filterByCategory;
window.loadMessages = loadMessages;
window.loadStats = loadStats;