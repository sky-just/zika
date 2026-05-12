// ===== 自定义回复库配置 =====
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

// 全局变量
if (typeof customReplyGroups === 'undefined') window.customReplyGroups = [];
if (typeof replyGroupsEnabled === 'undefined') window.replyGroupsEnabled = false;
if (typeof customPokeGroups === 'undefined') window.customPokeGroups = [];
if (typeof customStatusGroups === 'undefined') window.customStatusGroups = [];

let _batchSelectedIndices = new Set();
let _batchModeActive = false;
let _batchModeTarget = 'custom';
let _searchVisible = false;
let _searchQuery = '';
let _searchDebounceTimer = null;
let _activeGroupFilter = null;

const GROUP_COLORS = [
    '#FF6B6B','#FF8E53','#FFC542','#51CF66',
    '#20C997','#4DABF7','#748FFC','#DA77F2',
    '#F783AC','#FF922B','#A9E34B','#38D9A9',
    '#339AF0','#5C7CFA','#CC5DE8','#F06595',
    '#868E96','#212529'
];

const ICONS = {
    reply:    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 2.5V11H3a1 1 0 01-1-1V3z" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>`,
    magic:    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l.9 2.7L11.6 4l-1.8 2.2L12 8l-2.9-.1L8 10.8l-.9-2.9L4.4 8l1.8-2.2L4.4 4l2.7.7L8 2z" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="2" y1="14" x2="5" y2="11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    news:     `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.3"/><line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="5" y1="9" x2="9" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    folder:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5a1 1 0 011-1h3.5l1.2 1.2H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>`,
    search:   `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.3"/><line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    batch:    `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="8.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2" opacity=".6"/><rect x="1.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2" opacity=".6"/><rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2" opacity=".4"/></svg>`,
    plus:     `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><line x1="7.5" y1="2" x2="7.5" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="7.5" x2="13" y2="7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    close:    `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    check:    `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    trash:    `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="2" y1="3" x2="11" y2="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M4.5 3V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V3"/><path d="M3.5 3.5l.5 7h5l.5-7" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>`,
    edit:     `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 2l2.5 2.5L4 11.5H1.5V9L8.5 2z" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>`,
    eye:      `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" stroke-width="1.2"/><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/></svg>`,
    eyeOff:   `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="2" y1="2" x2="11" y2="11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M4.5 3.5C5.1 3.2 5.7 3 6.5 3c3 0 5 3.5 5 3.5s-.5 1-1.5 2M2 5s-.5.8-.5 1.5c0 .6.2 1.1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    tag:      `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 1.5h5l5 5-5 5-5-5v-5z" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="4" cy="4" r="1" fill="currentColor"/></svg>`,
    filter:   `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><line x1="2" y1="4" x2="13" y2="4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="4" y1="7.5" x2="11" y2="7.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="6" y1="11" x2="9" y2="11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    dedup:    `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 4h11M4.5 7h6M7 10h1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    import:   `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 9.5V2M4 6.5l3.5 3L11 6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><line x1="2" y1="12.5" x2="13" y2="12.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    export:   `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 5V12M4 7.5l3.5-3L11 7.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><line x1="2" y1="2.5" x2="13" y2="2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    chevronD: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    chevronR: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    comment:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 3.5A1.5 1.5 0 013.5 2h11A1.5 1.5 0 0116 3.5v8A1.5 1.5 0 0114.5 13H10l-3 3v-3H3.5A1.5 1.5 0 012 11.5v-8z" stroke="currentColor" stroke-width="1.3"/></svg>`,
    hand:     `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v8M6 5v5M3 8v3a6 6 0 0012 0V6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    dot:      `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="3" fill="currentColor"/><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.3"/></svg>`,
    quote:    `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 6.5C3 5.4 3.9 4.5 5 4.5h2v5H5A2 2 0 013 7.5V6.5zM10 6.5c0-1.1.9-2 2-2h2v5h-2a2 2 0 01-2-2V6.5z" fill="currentColor" opacity=".7"/></svg>`,
    play:     `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3"/><path d="M7 6.5l5 2.5-5 2.5V6.5z" fill="currentColor"/></svg>`,
    smile:    `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><circle cx="11.5" cy="7.5" r="1" fill="currentColor"/><path d="M6 11.5s1 2 3 2 3-2 3-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    sticker:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="4" stroke="currentColor" stroke-width="1.3"/><circle cx="6.5" cy="7" r="1.2" fill="currentColor"/><circle cx="11.5" cy="7" r="1.2" fill="currentColor"/><path d="M6 11s1 2.5 3 2.5S12 11 12 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    folderBig:`<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5a1 1 0 011-1h4l1.5 1.5H15a1 1 0 011 1V14a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" stroke="currentColor" stroke-width="1.3"/></svg>`,
    palette:  `<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5a6 6 0 100 12 2.5 2.5 0 010-5 2.5 2.5 0 000-7z" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="7.5" cy="3.5" r="1" fill="currentColor"/><circle cx="11" cy="6" r="1" fill="currentColor"/></svg>`,
};


// ─── 共享样式 ───────────────────
(function _injectReplyLibStyles() {
    if (document.getElementById('rl-shared-styles')) return;
    const s = document.createElement('style');
    s.id = 'rl-shared-styles';
    s.textContent = `
        .rl-card { display:flex;align-items:flex-start;gap:0;padding:11px 13px; border-radius:12px;border:1.5px solid var(--border-color); background:var(--secondary-bg);margin-bottom:7px; transition:all 0.18s;position:relative;overflow:hidden; }
        .rl-card:hover { border-color:var(--accent-color);transform:translateY(-1px);box-shadow:0 3px 12px rgba(0,0,0,0.08); }
        .rl-card.rl-selected { border-color:var(--accent-color);background:rgba(var(--accent-color-rgb,180,140,100),0.08); }
        .rl-card-actions { display:flex;gap:3px;margin-left:auto;flex-shrink:0;padding-left:8px; opacity:0;transition:opacity 0.18s;align-items:center; }
        .rl-card:hover .rl-card-actions { opacity:1; }
        @media (hover:none) { .rl-card-actions { opacity:1; } }
        .rl-act-btn { width:28px;height:28px;border-radius:8px;border:none; background:transparent;color:var(--text-secondary);cursor:pointer; display:flex;align-items:center;justify-content:center;transition:all 0.15s; flex-shrink:0; }
        .rl-act-btn:hover { color:var(--accent-color); }
        .rl-act-btn.danger:hover { border-color:#ef4444;color:#ef4444; }
        .rl-act-btn.active { background:var(--accent-color);border-color:var(--accent-color);color:#fff; }
        .rl-group-block { margin-bottom:12px; }
        .rl-group-header { display:flex;align-items:center;gap:9px;padding:9px 14px; border-radius:12px 12px 0 0; background:var(--secondary-bg);cursor:pointer;user-select:none; transition:background 0.2s; }
        .rl-group-header.collapsed { border-radius:12px; }
        .rl-group-header:hover { background:rgba(var(--accent-color-rgb,180,140,100),0.06); }
        .rl-group-body { border:1px solid var(--border-color);border-top:none;border-radius:0 0 12px 12px;padding:6px 8px 8px;background:var(--primary-bg); }
        .rl-group-tag { display:inline-flex;align-items:center;gap:5px; padding:2px 9px 2px 6px;border-radius:20px; cursor:pointer;transition:all 0.15s; }
        .rl-batch-check { width:18px;height:18px;border-radius:5px;flex-shrink:0;margin-top:1px; display:flex;align-items:center;justify-content:center;transition:all 0.15s; }
    `;
    (document.head || document.documentElement).appendChild(s);
})();

// ===== 核心渲染函数 =====
function renderReplyLibrary() {
    if (currentMajorTab === 'announcement') return;
    const list = document.getElementById('custom-replies-list');
    const titleEl = document.getElementById('cr-modal-title');
    if (!list) return;

    const currentConfig = LIBRARY_CONFIG[currentMajorTab];
    if (titleEl) titleEl.textContent = currentConfig.title;

    const subTabsContainer = document.getElementById('cr-sub-tabs');
    if (subTabsContainer) {
        subTabsContainer.innerHTML = currentConfig.tabs.map(tab => `
            <button class="reply-tab-btn ${currentSubTab === tab.id ? 'active' : ''}"
                    data-id="${tab.id}" data-mode="${tab.mode}">
                ${tab.name}
            </button>
        `).join('');
        subTabsContainer.querySelectorAll('.reply-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentSubTab = btn.dataset.id;
                _batchModeActive = false;
                _batchSelectedIndices.clear();
                _activeGroupFilter = null;
                _searchVisible = false;
                _searchQuery = '';
                renderReplyLibrary();
            });
        });
    }

    list.innerHTML = '';
    list.className = 'content-list-area';

    const activeTabConfig = currentConfig.tabs.find(t => t.id === currentSubTab);
    if (activeTabConfig) list.classList.add(activeTabConfig.mode + '-mode');

    // 简单的列表显示（不包含复杂的分组/搜索/批量，但保留了原有切换和基本条目）
    let itemsToRender = [];
    let renderType = 'text';

    if (currentMajorTab === 'reply') {
        if (currentSubTab === 'custom') {
            itemsToRender = customReplies;
        } else if (currentSubTab === 'emojis') {
            itemsToRender = CONSTANTS.REPLY_EMOJIS;
            renderType = 'emoji';
        } else if (currentSubTab === 'stickers') {
            itemsToRender = stickerLibrary;
            renderType = 'image';
        }
    } else if (currentMajorTab === 'atmosphere') {
        if (currentSubTab === 'pokes') itemsToRender = customPokes;
        else if (currentSubTab === 'statuses') itemsToRender = customStatuses;
        else if (currentSubTab === 'mottos') itemsToRender = customMottos;
        else if (currentSubTab === 'intros') itemsToRender = customIntros;
    }

    if (itemsToRender.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px;">列表空空如也</div>';
        return;
    }

    if (renderType === 'emoji') {
        list.innerHTML = itemsToRender.map(e => `<div class="emoji-item">${e}</div>`).join('');
        return;
    }
    if (renderType === 'image') {
        list.innerHTML = itemsToRender.map(src => `<div class="sticker-item"><img src="${src}" loading="lazy"></div>`).join('');
        return;
    }

    // 普通文本列表
    list.innerHTML = itemsToRender.map((item, idx) => `
        <div class="custom-reply-item">
            <span class="custom-reply-text">${item}</span>
            <div class="custom-reply-actions">
                <button class="reply-action-mini edit-btn" data-idx="${idx}">编辑</button>
                <button class="reply-action-mini delete-btn" data-idx="${idx}">删除</button>
            </div>
        </div>
    `).join('');

    // 绑定编辑/删除事件
    list.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => editItem(parseInt(btn.dataset.idx));
    });
    list.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => deleteItem(parseInt(btn.dataset.idx));
    });
}

// 编辑/删除辅助函数
function editItem(index) {
    let newText = prompt('修改内容:', customReplies[index]);
    if (newText && newText.trim()) {
        customReplies[index] = newText.trim();
        if (typeof throttledSaveData === 'function') throttledSaveData();
        renderReplyLibrary();
    }
}
function deleteItem(index) {
    if (confirm('确定删除吗？')) {
        customReplies.splice(index, 1);
        if (typeof throttledSaveData === 'function') throttledSaveData();
        renderReplyLibrary();
    }
}

// ===== 新增按钮 =====
function initReplyLibraryListeners() {
    const entryBtn = document.getElementById('custom-replies-function');
    if (entryBtn) {
        entryBtn.addEventListener('click', () => {
            hideModal(DOMElements.advancedModal.modal);
            currentMajorTab = 'reply';
            currentSubTab = 'custom';
            renderReplyLibrary();
            showModal(DOMElements.customRepliesModal.modal);
        });
    }

    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMajorTab = btn.dataset.major;

            if (currentMajorTab === 'announcement') {
                if (typeof window.switchToAnnouncementPanel === 'function') window.switchToAnnouncementPanel();
                return;
            }

            const listArea = document.getElementById('custom-replies-list');
            const annPanel = document.getElementById('announcement-panel');
            if (listArea) listArea.style.display = '';
            if (annPanel) annPanel.style.display = 'none';

            currentSubTab = 'custom';
            renderReplyLibrary();
        });
    });

    const addBtn = document.getElementById('add-custom-reply');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            let input = prompt('请输入新字卡内容:');
            if (input && input.trim()) {
                customReplies.push(input.trim());
                if (typeof throttledSaveData === 'function') throttledSaveData();
                renderReplyLibrary();
                showNotification('字卡已添加', 'success');
            }
        });
    }
}

// 缺省函数，避免报错
function getCategoryName() { return ''; }
function updateTabUI() {}
function initRippleFeedback() {}
function applyAvatarFrame() {}
function setupAvatarFrameSettings() {}
function applyAllAvatarFrames() {}
