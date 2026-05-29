// reply-library.js - 稳定版（修复面板残留、变量同步、侧边栏切换）
(function() {

// ===== 同步全局变量 =====
window.currentMajorTab = window.currentMajorTab || 'reply';
window.currentSubTab = window.currentSubTab || 'custom';

// ===== 常量定义 =====
const LIBRARY_CONFIG = {
    reply: {
        title: "回复库管理",
        tabs: [
            { id: 'custom', name: '主字卡', mode: 'list' },
            { id: 'emojis', name: 'Emoji', mode: 'grid' },
            { id: 'stickers', name: '表情库', mode: 'grid' }
        ]
    },
    atmosphere: {
        title: "氛围感配置",
        tabs: [
            { id: 'pokes', name: '拍一拍', mode: 'list' },
            { id: 'statuses', name: '对方状态', mode: 'list' },
            { id: 'mottos', name: '顶部格言', mode: 'list' },
            { id: 'intros', name: '开场动画', mode: 'list' }
        ]
    }
};

// 内部状态（兼容旧代码，实际以 window.currentMajorTab 等为准）
let currentMajorTab = 'reply';
let currentSubTab = 'custom';
let _batchModeActive = false;
let _batchSelectedIndices = new Set();
let _activeGroupFilter = null;
let _searchVisible = false;
let _searchQuery = '';

// ===== 核心渲染函数 =====
function renderReplyLibrary() {
    // === 强制重置面板显示状态（修复空白/残留） ===
    const replyListDiv = document.getElementById('custom-replies-list');
    const subTabsDiv = document.getElementById('cr-sub-tabs');
    const announceDiv = document.getElementById('announcement-panel');
    
    // 同步到内部变量
    currentMajorTab = window.currentMajorTab || 'reply';
    currentSubTab = window.currentSubTab || 'custom';

    if (currentMajorTab === 'announcement') {
        if (replyListDiv) replyListDiv.style.display = 'none';
        if (subTabsDiv) subTabsDiv.style.display = 'none';
        if (announceDiv) announceDiv.style.display = 'block';
        return;
    } else {
        if (replyListDiv) replyListDiv.style.display = 'block';
        if (subTabsDiv) subTabsDiv.style.display = 'flex';
        if (announceDiv) announceDiv.style.display = 'none';
    }

    const list = document.getElementById('custom-replies-list');
    const titleEl = document.getElementById('cr-modal-title');
    if (!list) return;

    const currentConfig = LIBRARY_CONFIG[currentMajorTab];
    if (titleEl) titleEl.textContent = currentConfig.title;

    // 渲染子选项卡按钮
    const subTabsContainer = document.getElementById('cr-sub-tabs');
    if (subTabsContainer) {
        subTabsContainer.innerHTML = currentConfig.tabs.map(tab => 
            `<button class="reply-tab-btn ${currentSubTab === tab.id ? 'active' : ''}" data-id="${tab.id}" data-mode="${tab.mode}">
                ${tab.name}
            </button>`
        ).join('');
        
        // 绑定子选项卡点击事件
        subTabsContainer.querySelectorAll('.reply-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentSubTab = btn.dataset.id;
                window.currentSubTab = currentSubTab;
                _batchModeActive = false;
                _batchSelectedIndices.clear();
                _activeGroupFilter = null;
                _searchVisible = false;
                _searchQuery = '';
                renderReplyLibrary();
            });
        });
    }

    // 清空并准备列表区域
    list.innerHTML = '';
    list.className = 'content-list-area';
    const activeTabConfig = currentConfig.tabs.find(t => t.id === currentSubTab);
    if (activeTabConfig) list.classList.add(activeTabConfig.mode + '-mode');

    let itemsToRender = [];
    if (currentMajorTab === 'reply') {
        if (currentSubTab === 'custom') itemsToRender = window.customReplies || [];
        else if (currentSubTab === 'emojis') itemsToRender = (window.CONSTANTS && window.CONSTANTS.REPLY_EMOJIS) || [];
        else if (currentSubTab === 'stickers') itemsToRender = window.stickerLibrary || [];
    } else if (currentMajorTab === 'atmosphere') {
        if (currentSubTab === 'pokes') itemsToRender = window.customPokes || [];
        else if (currentSubTab === 'statuses') itemsToRender = window.customStatuses || [];
        else if (currentSubTab === 'mottos') itemsToRender = window.customMottos || [];
        else if (currentSubTab === 'intros') itemsToRender = window.customIntros || [];
    }

    if (itemsToRender.length === 0) {
        list.innerHTML = '<div class="empty-tip">暂无内容</div>';
        return;
    }

    // 渲染列表项
    itemsToRender.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'content-item';
        div.textContent = typeof item === 'string' ? item : (item.text || item.name || '');
        list.appendChild(div);
    });
}
// ===== 侧边栏切换绑定 =====
(function() {
    setTimeout(function() {
        const sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar) return;

        // 初始化全局状态
        window.currentMajorTab = 'reply';
        window.currentSubTab = 'custom';
        renderReplyLibrary();

        sidebar.addEventListener('click', function(e) {
            const btn = e.target.closest('.sidebar-btn');
            if (!btn) return;
            const major = btn.getAttribute('data-major');
            
            if (major === 'announcement') {
                if (typeof window.switchToAnnouncementPanel === 'function') {
                    window.switchToAnnouncementPanel();
                }
                return;
            }
            
            window.currentMajorTab = major;
            window.currentSubTab = (major === 'reply') ? 'custom' : 'pokes';
            currentMajorTab = window.currentMajorTab;
            currentSubTab = window.currentSubTab;
            renderReplyLibrary();
        });
    }, 800);
})();

// 暴露渲染函数供外部调用
window.renderReplyLibrary = renderReplyLibrary;

})();
