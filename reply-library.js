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

if (typeof customReplyGroups === 'undefined') window.customReplyGroups = [];
if (typeof replyGroupsEnabled === 'undefined') window.replyGroupsEnabled = false;
if (typeof customPokeGroups === 'undefined') window.customPokeGroups = [];
if (typeof customStatusGroups === 'undefined') window.customStatusGroups = [];

// 根据当前 tab 返回对应的分组上下文 {groups, items, itemLabel}
function _getGroupCtx(tab) {
    tab = tab || currentSubTab;
    if (tab === 'pokes') {
        if (!window.customPokeGroups) window.customPokeGroups = [];
        return { groups: window.customPokeGroups, items: customPokes, itemLabel: '拍一拍' };
    }
    if (tab === 'statuses') {
        if (!window.customStatusGroups) window.customStatusGroups = [];
        return { groups: window.customStatusGroups, items: customStatuses, itemLabel: '状态' };
    }
    // default: custom replies
    if (!window.customReplyGroups) window.customReplyGroups = [];
    return { groups: window.customReplyGroups, items: customReplies, itemLabel: '字卡' };
}

// 判断当前 tab 是否支持分组
function _tabHasGroups(tab) {
    tab = tab || currentSubTab;
    return tab === 'custom' || tab === 'pokes' || tab === 'statuses';
}

let _batchSelectedIndices = new Set();
let _batchModeActive = false;
let _batchModeTarget = 'custom'; // 'custom' or 'stickers' (depends on currentSubTab when batch mode enabled)
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
    smile:    `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><path d="M6 11.5s1 2 3 2 3-2 3-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
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
        .rl-card-actions
        { display:flex;gap:3px;margin-left:auto;flex-shrink:0;padding-left:8px; opacity:0;transition:opacity 0.18s;align-items:center; }
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
function renderEmptyState(text) {
    return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 0;color:var(--text-secondary);opacity:0.6;grid-column:1/-1;">
        <div style="width:56px;height:56px;background:var(--secondary-bg);border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;box-shadow:var(--shadow);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M16.5 16.5L20 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <p style="font-size:14px;font-weight:500;text-align:center;line-height:1.6;">${text}</p>
    </div>`;
}

function _showExportUI() {
    let _annCustomData = {};
    let _annStatusPool = [];
    try { _annCustomData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {}
    try { _annStatusPool = JSON.parse(localStorage.getItem('dg_status_pool') || '[]'); } catch(e) {}
    const _annTextCount = (_annCustomData.titles || []).length + (_annCustomData.notes || []).length;
    const _annPoolCount = _annStatusPool.length;
    const _annTotalCount = _annTextCount + _annPoolCount;

    const modules = [
        { id: '_re_replies',  icon: ICONS.comment,   label: '主字卡',        count: customReplies.length,                     key: 'customReplies' },
        { id: '_re_pokes',    icon: ICONS.hand,      label: '拍一拍',        count: customPokes.length,                       key: 'customPokes' },
        { id: '_re_statuses', icon: ICONS.dot,       label: '对方状态',      count: customStatuses.length,                    key: 'customStatuses' },
        { id: '_re_mottos',   icon: ICONS.quote,     label: '顶部格言',      count: customMottos.length,                      key: 'customMottos' },
        { id: '_re_intros',   icon: ICONS.play,      label: '开场动画',      count: customIntros.length,                      key: 'customIntros' },
        { id: '_re_emojis',   icon: ICONS.smile,     label: 'Emoji 库',      count: customEmojis.length,                      key: 'customEmojis' },
        { id: '_re_ann',      icon: ICONS.folderBig, label: '今日公告配置',  count: _annTotalCount,                           key: 'announcementConfig' },
        { id: '_re_groups',   icon: ICONS.folderBig, label: '字卡分组',      count: (customReplyGroups||[]).length,            key: 'customReplyGroups',  extra: true },
        { id: '_re_pokg',     icon: ICONS.folderBig, label: '拍一拍分组',    count: (window.customPokeGroups||[]).length,     key: 'customPokeGroups',   extra: true },
        { id: '_re_statg',    icon: ICONS.folderBig, label: '对方状态分组',  count: (window.customStatusGroups||[]).length,   key: 'customStatusGroups', extra: true },
    ];

const replyGroupsExist  = customReplyGroups        && customReplyGroups.length > 0;
    const pokeGroupsExist   = window.customPokeGroups  && window.customPokeGroups.length > 0;
    const statusGroupsExist = window.customStatusGroups && window.customStatusGroups.length > 0;
    const onAnnTab          = currentMajorTab === 'announcement';
    const anyGroupExists    = replyGroupsExist || pokeGroupsExist || statusGroupsExist || onAnnTab;

    const onPokeTab   = currentMajorTab === 'atmosphere' && currentSubTab === 'pokes';
    const onStatusTab = currentMajorTab === 'atmosphere' && currentSubTab === 'statuses';
    let groupExportType = null;
    if (onAnnTab)                          groupExportType = 'announcement';
    if (onPokeTab   && pokeGroupsExist)    groupExportType = 'pokes';
    if (onStatusTab && statusGroupsExist)  groupExportType = 'statuses';
    if (!groupExportType && !onPokeTab && !onStatusTab && !onAnnTab && replyGroupsExist) groupExportType = 'replies';

    const groupDescMap = {
        replies:      '仅导出指定分组的字卡内容',
        pokes:        '仅导出指定分组的拍一拍内容',
        statuses:     '仅导出指定分组的对方状态内容',
        announcement: '选择要导出的公告内容模块',
    };

    if (anyGroupExists) {
        const overlay = _makeOverlay();
        const panel = document.createElement('div');
        panel.style.cssText = 'background:var(--secondary-bg);border-radius:22px;padding:24px;width:92%;max-width:380px;box-shadow:0 24px 80px rgba(0,0,0,.45);animation:popIn 0.22s cubic-bezier(.34,1.56,.64,1);';
        panel.innerHTML = `
            <style>@keyframes popIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}</style>
            <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:6px;display:flex;align-items:center;gap:8px;">${ICONS.export} 导出方式</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:18px;">请选择导出模式</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button id="_exp_all_btn" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:1.5px solid var(--border-color);border-radius:14px;background:var(--primary-bg);cursor:pointer;text-align:left;transition:border-color 0.15s;">
                    <div style="width:38px;height:38px;border-radius:10px;background:rgba(var(--accent-color-rgb),0.12);display:flex;align-items:center;justify-content:center;color:var(--accent-color);flex-shrink:0;">${ICONS.export}</div>
                    <div><div style="font-size:13px;font-weight:600;color:var(--text-primary);">全量导出</div><div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">自由选择要导出的模块</div></div>
                </button>
                ${groupExportType ? `<button id="_exp_group_btn" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:1.5px solid var(--border-color);border-radius:14px;background:var(--primary-bg);cursor:pointer;text-align:left;transition:border-color 0.15s;">
                    <div style="width:38px;height:38px;border-radius:10px;background:rgba(var(--accent-color-rgb),0.12);display:flex;align-items:center;justify-content:center;color:var(--accent-color);flex-shrink:0;">${ICONS.folderBig}</div>
                    <div><div style="font-size:13px;font-weight:600;color:var(--text-primary);">按分组导出</div><div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">${groupDescMap[groupExportType] || '仅导出指定分组内容'}</div></div>
                </button>` : ''}
            </div>
            <button id="_exp_cancel_btn" style="width:100%;margin-top:14px;padding:12px;border:1.5px solid var(--border-color);border-radius:13px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button>`;
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        panel.querySelector('#_exp_cancel_btn').onclick = () => overlay.remove();
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });


    panel.querySelector('#_exp_all_btn').onclick = () => {
            overlay.remove();
            _showIOSheet('导出字卡', '选择要导出的模块', modules, ICONS.export, (selected) => {
                if (!selected.length) { showNotification('请至少选择一项', 'error'); return; }
                _doExport(selected);
            });
        };

        const groupBtn = panel.querySelector('#_exp_group_btn');
        if (groupBtn) {
            groupBtn.onclick = () => {
                overlay.remove();
                if (groupExportType === 'announcement') {
                    _showAnnouncementExportPicker();
                } else {
                    _showGroupExportPicker(groupExportType);
                }
            };
        }
        return;
    }

    _showIOSheet('导出字卡', '选择要导出的模块', modules, ICONS.export, (selected) => {
        if (!selected.length) { showNotification('请至少选择一项', 'error'); return; }
        _doExport(selected);
    });
}

function _doExport(selectedModules) {
    const libraryData = { exportDate: new Date().toISOString(), modules: [] };
    selectedModules.forEach(m => {
        if (m.key === 'customReplies')         { libraryData.customReplies      = customReplies;                  libraryData.modules.push('replies'); }
        else if (m.key === 'customPokes')      { libraryData.customPokes        = customPokes;                    libraryData.modules.push('pokes'); }
        else if (m.key === 'customStatuses')   { libraryData.customStatuses     = customStatuses;                 libraryData.modules.push('statuses'); }
        else if (m.key === 'customMottos')     { libraryData.customMottos       = customMottos;                   libraryData.modules.push('mottos'); }
        else if (m.key === 'customIntros')     { libraryData.customIntros       = customIntros;                   libraryData.modules.push('intros'); }
        else if (m.key === 'customEmojis')     { libraryData.customEmojis       = customEmojis;                   libraryData.modules.push('emojis'); }
        else if (m.key === 'customReplyGroups')  { libraryData.customReplyGroups  = window.customReplyGroups  || []; libraryData.modules.push('groups'); }
        else if (m.key === 'customPokeGroups')   { libraryData.customPokeGroups   = window.customPokeGroups   || []; libraryData.modules.push('pokeGroups'); }
        else if (m.key === 'customStatusGroups') { libraryData.customStatusGroups = window.customStatusGroups || []; libraryData.modules.push('statusGroups'); }
        else if (m.key === 'announcementConfig') {
            let _acd = {}; let _asp = [];
            try { _acd = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {}
            try { _asp = JSON.parse(localStorage.getItem('dg_status_pool') || '[]'); } catch(e) {}
            libraryData.announcementConfig = { customData: _acd, statusPool: _asp };
            libraryData.modules.push('announcementConfig');
        }
    });
    const fileName = `reply-library-${libraryData.modules.join('+')}-${new Date().toISOString().slice(0,10)}.json`;
    exportDataToMobileOrPC(JSON.stringify(libraryData, null, 2), fileName);
    showNotification('✓ 字卡导出成功', 'success');
}

function _showGroupExportPicker(type) {
    type = type || 'replies';
    const cfgMap = {
        replies:  { groups: window.customReplyGroups  || [], items: customReplies,   groupKey: 'customReplyGroups',  itemKey: 'customReplies',  moduleTag: ['replies','groups'],       filePrefix: 'reply-groups',  label: '字卡',    successUnit: '条字卡' },
        pokes:    { groups: window.customPokeGroups   || [], items: customPokes,      groupKey: 'customPokeGroups',   itemKey: 'customPokes',    moduleTag: ['pokes','pokeGroups'],     filePrefix: 'poke-groups',   label: '拍一拍',  successUnit: '条拍一拍' },
        statuses: { groups: window.customStatusGroups || [], items: customStatuses,   groupKey: 'customStatusGroups', itemKey: 'customStatuses', moduleTag: ['statuses','statusGroups'],filePrefix: 'status-groups', label: '对方状态',successUnit: '条状态' },
    };
    const cfg = cfgMap[type] || cfgMap.replies;

    const overlay = _makeOverlay();
    const panel = document.createElement('div');
    panel.style.cssText = 'background:var(--secondary-bg);border-radius:22px;padding:24px;width:92%;max-width:380px;max-height:85vh;display:flex;flex-direction:column;gap:14px;box-shadow:0 24px 80px rgba(0,0,0,.45);animation:popIn 0.22s cubic-bezier(.34,1.56,.64,1);';
    panel.innerHTML = `
        <style>@keyframes popIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}</style>
        <div style="font-size:16px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;">${ICONS.folderBig} 选择分组导出</div>
        <div style="font-size:12px;color:var(--text-secondary);">勾选要导出的分组，仅导出这些分组的${cfg.label}</div>
        <div id="_gep_list" style="display:flex;flex-direction:column;gap:8px;overflow-y:auto;max-height:50vh;"></div>
        <div style="display:flex;gap:10px;"><button id="_gep_cancel" style="flex:1;padding:12px;border:1.5px solid var(--border-color);border-radius:13px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button><button id="_gep_confirm" style="flex:2;padding:12px;border:none;border-radius:13px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font-family);display:flex;align-items:center;justify-content:center;gap:8px;">${ICONS.export} 导出</button></div>`;
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const listEl = panel.querySelector('#_gep_list');
    cfg.groups.forEach((g, i) => {
        const cnt = (g.items || []).filter(t => cfg.items.includes(t)).length;
        const row = document.createElement('label');
        row.style.cssText = `display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:13px;border:1.5px solid var(--border-color);background:var(--primary-bg);cursor:pointer;transition:border-color 0.15s;`;
        row.innerHTML = `<input type="checkbox" value="${i}" style="width:16px;height:16px;accent-color:${g.color};flex-shrink:0;" checked><span style="width:10px;height:10px;border-radius:50%;background:${g.color||'#aaa'};flex-shrink:0;"></span><span style="flex:1;font-size:13px;font-weight:600;color:var(--text-primary);">${g.name}</span><span style="font-size:11px;color:var(--text-secondary);">${cnt} 条</span>`;
        listEl.appendChild(row);
    });

    panel.querySelector('#_gep_cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    panel.querySelector('#_gep_confirm').onclick = () => {
        const checked = [...panel.querySelectorAll('input[type=checkbox]:checked')].map(cb => parseInt(cb.value));
        if (!checked.length) { showNotification('请至少选择一个分组', 'warning'); return; }
        const selectedGroups = checked.map(i => cfg.groups[i]);
        const allItems = new Set();
        const exportGroups = [];
        selectedGroups.forEach(g => {
            const items = (g.items || []).filter(t => cfg.items.includes(t));
            items.forEach(t => allItems.add(t));
            exportGroups.push({ ...g, items });
        });
        const libraryData = {
            exportDate: new Date().toISOString(),
            modules: cfg.moduleTag,
            [cfg.itemKey]:  [...allItems],
            [cfg.groupKey]: exportGroups,
            _groupExport: true,
            _groupExportType: type
        };
        const groupNames = selectedGroups.map(g => g.name).join('+');
        const fileName = `${cfg.filePrefix}-${groupNames}-${new Date().toISOString().slice(0,10)}.json`;
        exportDataToMobileOrPC(JSON.stringify(libraryData, null, 2), fileName);
        overlay.remove();
        showNotification(`✓ 已导出 ${checked.length} 个分组，共 ${allItems.size} ${cfg.successUnit}`, 'success');
    };
}

function _showAnnouncementExportPicker() {
    let annCustomData = {};
    let annStatusPool = [];
    try { annCustomData = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {}
    try { annStatusPool = JSON.parse(localStorage.getItem('dg_status_pool') || '[]'); } catch(e) {}
    const textCount = (annCustomData.titles || []).length + (annCustomData.notes || []).length;
    const poolCount = annStatusPool.length;

    const options = [
        { id: '_aep_text', label: '公告文案', desc: `${textCount} 条内容`, key: 'announcementText', hasData: textCount > 0 },
        { id: '_aep_pool', label: '状态随机库', desc: `${poolCount} 条条目`, key: 'announcementStatusPool', hasData: poolCount > 0 },
    ];

const overlay = _makeOverlay();
    const panel = document.createElement('div');
    panel.style.cssText = 'background:var(--secondary-bg);border-radius:22px;padding:24px;width:92%;max-width:380px;box-shadow:0 24px 80px rgba(0,0,0,.45);animation:popIn 0.22s cubic-bezier(.34,1.56,.64,1);display:flex;flex-direction:column;gap:14px;';
    panel.innerHTML = `
        <style>@keyframes popIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}</style>
        <div style="font-size:16px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;">${ICONS.folderBig} 选择导出内容</div>
        <div style="font-size:12px;color:var(--text-secondary);">勾选要导出的公告模块</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${options.map(opt => `<label style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:13px;border:1.5px solid var(--border-color);background:var(--primary-bg);cursor:pointer;"><input type="checkbox" id="${opt.id}" ${opt.hasData ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent-color);flex-shrink:0;"><div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text-primary);">${opt.label}</div><div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">${opt.desc}</div></div></label>`).join('')}
        </div>
        <div style="display:flex;gap:10px;"><button id="_aep_cancel" style="flex:1;padding:12px;border:1.5px solid var(--border-color);border-radius:13px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button><button id="_aep_confirm" style="flex:2;padding:12px;border:none;border-radius:13px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font-family);display:flex;align-items:center;justify-content:center;gap:8px;">${ICONS.export} 导出</button></div>`;
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    panel.querySelector('#_aep_cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    panel.querySelector('#_aep_confirm').onclick = () => {
        const selected = options.filter(opt => panel.querySelector('#' + opt.id)?.checked);
        if (!selected.length) { showNotification('请至少选择一项', 'warning'); return; }
        const libraryData = { exportDate: new Date().toISOString(), modules: [] };
        selected.forEach(opt => {
            if (opt.key === 'announcementText') {
                libraryData.announcementText = { titles: annCustomData.titles || [], notes: annCustomData.notes || [] };
                libraryData.modules.push('announcementText');
            } else if (opt.key === 'announcementStatusPool') {
                libraryData.announcementStatusPool = annStatusPool;
                libraryData.modules.push('announcementStatusPool');
            }
        });
        const fileName = `announcement-${libraryData.modules.join('+')}-${new Date().toISOString().slice(0,10)}.json`;
        exportDataToMobileOrPC(JSON.stringify(libraryData, null, 2), fileName);
        overlay.remove();
        showNotification(`✓ 已导出 ${selected.map(o => o.label).join('、')}`, 'success');
    };
}

function _parseFlexibleJSON(text) {
    try { return JSON.parse(text); } catch (_) {}
    let repaired = text.replace(/,\s*([}\]])/g, '$1').replace(/(["\d\w}])\s*\n\s*"/g, (m, p1) => { if (p1 === '}' || p1 === ']') return m; return p1 + ',\n"'; });
    try { return JSON.parse(repaired); } catch (_) {}
    repaired = text.replace(/("(?:[^"\\]|\\.)*")\s*\n(\s*")/g, '$1,\n$2').replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(repaired);
}

function _normalizeImportData(data) {
    if (!data || typeof data !== 'object') return data;
    const knownKeys = ['customReplies','customPokes','customStatuses','customMottos','customIntros','customEmojis','customReplyGroups','customPokeGroups','customStatusGroups','disabledDefaultReplies','announcementConfig','announcementText','announcementStatusPool'];
    const hasNewFormat = knownKeys.some(k => data[k] !== undefined && data[k] !== null);
    if (hasNewFormat) return data;
    if (Array.isArray(data)) return { customReplies: data };
    return data;
}

function _showImportUI(data) {
    const knownFields = ['customReplies','customPokes','customStatuses','customMottos','customIntros','customEmojis','customReplyGroups','customPokeGroups','customStatusGroups','announcementConfig','announcementText','announcementStatusPool'];
    const hasValid = knownFields.some(f => data[f] !== undefined && data[f] !== null);
    if (!hasValid) { showNotification('无效的字卡备份文件', 'error'); return; }

    const _annCfg = data.announcementConfig;
    const _annText = data.announcementText;
    const _annPool = data.announcementStatusPool;
    const _annCfgCount = _annCfg ? ((_annCfg.customData?.titles||[]).length + (_annCfg.customData?.notes||[]).length + (_annCfg.statusPool||[]).length) : undefined;
    const _annTextCount = _annText ? ((_annText.titles||[]).length + (_annText.notes||[]).length) : undefined;
    const _annPoolCount = Array.isArray(_annPool) ? _annPool.length : undefined;

    const modules = [
        { id: '_ri_replies',  icon: ICONS.comment,   label: '主字卡',        data: data.customReplies,       key: 'customReplies' },
        { id: '_ri_pokes',    icon: ICONS.hand,      label: '拍一拍',        data: data.customPokes,         key: 'customPokes' },
        { id: '_ri_statuses', icon: ICONS.dot,       label: '对方状态',      data: data.customStatuses,      key: 'customStatuses' },
        { id: '_ri_mottos',   icon: ICONS.quote,     label: '顶部格言',      data: data.customMottos,        key: 'customMottos' },
        { id: '_ri_intros',   icon: ICONS.play,      label: '开场动画',      data: data.customIntros,        key: 'customIntros' },
        { id: '_ri_emojis',   icon: ICONS.smile,     label: 'Emoji 库',      data: data.customEmojis,        key: 'customEmojis' },
        { id: '_ri_ann',      icon: ICONS.folderBig, label: '今日公告配置',  data: [_annCfg],                key: 'announcementConfig',    displayCount: _annCfgCount },
        { id: '_ri_anntext',  icon: ICONS.comment,   label: '公告文案',      data: [_annText],               key: 'announcementText',      displayCount: _annTextCount },
        { id: '_ri_annpool',  icon: ICONS.dot,       label: '状态随机库',    data: _annPool,                 key: 'announcementStatusPool', displayCount: _annPoolCount },
        { id: '_ri_groups',   icon: ICONS.folderBig, label: '字卡分组',      data: data.customReplyGroups,   key: 'customReplyGroups',  extra: true },
        { id: '_ri_pokg',     icon: ICONS.folderBig, label: '拍一拍分组',    data: data.customPokeGroups,    key: 'customPokeGroups',   extra: true },
        { id: '_ri_statg',    icon: ICONS.folderBig, label: '对方状态分组',  data: data.customStatusGroups,  key: 'customStatusGroups', extra: true },
    ].filter(m => m.data !== undefined && m.data !== null && (Array.isArray(m.data) ? m.data.length > 0 && m.data[0] !== undefined : true));

    _showIOSheet(`导入字卡`, `文件中包含 ${modules.length} 个模块`, modules, ICONS.import, (selected, mode) => {
        if (!selected.length) { showNotification('请至少选择一项', 'error'); return; }
        try {
            const overwrite = mode === 'overwrite';
            let totalAdded = 0;
            if (overwrite) {
                selected.forEach(m => {
                    if (m.key === 'customReplies')         { customReplies               = data.customReplies;       totalAdded += data.customReplies.length; }
                    else if (m.key === 'customPokes')      { customPokes                 = data.customPokes;         totalAdded += data.customPokes.length; }
                    else if (m.key === 'customStatuses')   { customStatuses              = data.customStatuses;      totalAdded += data.customStatuses.length; }
                    else if (m.key === 'customMottos')     { customMottos                = data.customMottos;        totalAdded += data.customMottos.length; }
                    else if (m.key === 'customIntros')     { customIntros                = data.customIntros;        totalAdded += data.customIntros.length; }
                    else if (m.key === 'customEmojis')     { customEmojis                = data.customEmojis; }
                    else if (m.key === 'customReplyGroups')  { window.customReplyGroups  = data.customReplyGroups; }
                    else if (m.key === 'customPokeGroups')   { window.customPokeGroups   = data.customPokeGroups; }
                    else if (m.key === 'customStatusGroups') { window.customStatusGroups = data.customStatusGroups; }
                    else if (m.key === 'announcementConfig') {
                        if (_annCfg.customData) localStorage.setItem('dg_custom_data', JSON.stringify(_annCfg.customData));
                        if (_annCfg.statusPool) localStorage.setItem('dg_status_pool', JSON.stringify(_annCfg.statusPool));
                    }
                    else if (m.key === 'announcementText') {
                        let cur = {}; try { cur = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {}
                        cur.titles = _annText.titles || []; cur.notes = _annText.notes || [];
                        localStorage.setItem('dg_custom_data', JSON.stringify(cur));
                    }
                    else if (m.key === 'announcementStatusPool') {
                        localStorage.setItem('dg_status_pool', JSON.stringify(_annPool));
                    }
                });
            } else {
                selected.forEach(m => {
                    if (m.key === 'customReplies') {
                        const before = customReplies.length;
                        customReplies = deduplicateContentArray([...customReplies, ...data.customReplies], CONSTANTS.REPLY_MESSAGES).result;
                        totalAdded += customReplies.length - before;
                    } else if (m.key === 'customPokes') {
                        const before = customPokes.length;
                        customPokes = deduplicateContentArray([...customPokes, ...data.customPokes]).result;
                        totalAdded += customPokes.length - before;
                    } else if (m.key === 'customStatuses') {
                        const before = customStatuses.length;
                        customStatuses = deduplicateContentArray([...customStatuses, ...data.customStatuses]).result;
                        totalAdded += customStatuses.length - before;
                    } else if (m.key === 'customMottos') {
                        const before = customMottos.length;
                        customMottos = deduplicateContentArray([...customMottos, ...data.customMottos]).result;
                        totalAdded += customMottos.length - before;
                    } else if (m.key === 'customIntros') {
                        const before = customIntros.length;
                        customIntros = deduplicateContentArray([...customIntros, ...data.customIntros]).result;
                        totalAdded += customIntros.length - before;
                    } else if (m.key === 'customEmojis') {
                        customEmojis = [...new Set([...customEmojis, ...data.customEmojis])];
                    } else if (m.key === 'customReplyGroups') {
                        if (!window.customReplyGroups) window.customReplyGroups = [];
                        data.customReplyGroups.forEach(dg => { if (!customReplyGroups.find(g => g.name === dg.name)) customReplyGroups.push(dg); });
                    } else if (m.key === 'customPokeGroups') {
                        if (!window.customPokeGroups) window.customPokeGroups = [];
                        data.customPokeGroups.forEach(dg => { if (!window.customPokeGroups.find(g => g.name === dg.name)) window.customPokeGroups.push(dg); });
                    } else if (m.key === 'customStatusGroups') {
                        if (!window.customStatusGroups) window.customStatusGroups = [];
                        data.customStatusGroups.forEach(dg => { if (!window.customStatusGroups.find(g => g.name === dg.name)) window.customStatusGroups.push(dg); });
                    } else if (m.key === 'announcementConfig') {
                        let cur = {}; try { cur = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {}
                        if (_annCfg.customData) {
                            cur.titles = [...new Set([...(cur.titles||[]), ...(_annCfg.customData.titles||[])])];
                            cur.notes  = [...new Set([...(cur.notes||[]),  ...(_annCfg.customData.notes||[])])];
                            localStorage.setItem('dg_custom_data', JSON.stringify(cur));
                        }
                        if (_annCfg.statusPool) {
                            let pool = []; try { pool = JSON.parse(localStorage.getItem('dg_status_pool') || '[]'); } catch(e) {}
                            const existStatuses = new Set(pool.map(p => p.status));
                            _annCfg.statusPool.forEach(p => { if (!existStatuses.has(p.status)) pool.push(p); });
                            localStorage.setItem('dg_status_pool', JSON.stringify(pool));
                        }
                    } else if (m.key === 'announcementText') {
                        let cur = {}; try { cur = JSON.parse(localStorage.getItem('dg_custom_data') || '{}'); } catch(e) {}
                        cur.titles = [...new Set([...(cur.titles||[]), ...(_annText.titles||[])])];
                        cur.notes  = [...new Set([...(cur.notes||[]),  ...(_annText.notes||[])])];
                        localStorage.setItem('dg_custom_data', JSON.stringify(cur));
                    } else if (m.key === 'announcementStatusPool') {
                        let pool = []; try { pool = JSON.parse(localStorage.getItem('dg_status_pool') || '[]'); } catch(e) {}
                        const existStatuses = new Set(pool.map(p => p.status));
                        _annPool.forEach(p => { if (!existStatuses.has(p.status)) pool.push(p); });
                        localStorage.setItem('dg_status_pool', JSON.stringify(pool));
                    }
                });
            }
            throttledSaveData();
            if (typeof renderReplyLibrary === 'function') renderReplyLibrary();
            if (typeof window.renderAnnStatusPool === 'function') window.renderAnnStatusPool();
            showNotification(`✓ 导入成功（${overwrite ? '覆盖' : '追加'}）${totalAdded > 0 ? `，共 ${totalAdded} 条` : ''}`, 'success', 3000);
        } catch (err) {
            console.error('字卡导入失败:', err);
            showNotification('导入过程中发生错误：' + err.message, 'error');
        }
    }, true);
}

function _showIOSheet(title, subtitle, modules, icon, onConfirm, showMode = false) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.2s ease;';
    overlay.innerHTML = `
        <style>
            @keyframes fadeIn { from{opacity:0} to{opacity:1} }
            @keyframes slideUpSheet { from{transform:translateY(100%)} to{transform:translateY(0)} }
            .io-module-row { display:flex;align-items:center;gap:12px;cursor:pointer; padding:12px 14px;border-radius:14px;background:var(--primary-bg); border:1.5px solid var(--border-color);transition:border-color 0.15s; }
            .io-icon-box { width:36px;height:36px;border-radius:10px; background:rgba(var(--accent-color-rgb,180,140,100),0.12); display:flex;align-items:center;justify-content:center; color:var(--accent-color);flex-shrink:0; }
            .io-toggle { width:42px;height:24px;border-radius:12px;background:var(--accent-color); position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0; }
            .io-toggle .knob { position:absolute;top:3px;left:3px;width:18px;height:18px; border-radius:50%;background:#fff;transition:transform 0.2s; transform:translateX(18px);box-shadow:0 1px 3px rgba(0,0,0,.2); }
            .io-toggle.off { background:var(--border-color); }
            .io-toggle.off .knob { transform:translateX(0); }
        </style>
        <div style="background:var(--secondary-bg);border-radius:24px 24px 0 0;width:100%;max-width:500px;padding:0 0 env(safe-area-inset-bottom,0);box-shadow:0 -10px 60px rgba(0,0,0,.3);animation:slideUpSheet 0.3s cubic-bezier(0.34,1.56,0.64,1);max-height:92vh;display:flex;flex-direction:column;">
            <div style="width:36px;height:4px;border-radius:2px;background:var(--border-color);margin:12px auto 0;flex-shrink:0;"></div>
            <div style="padding:18px 22px 8px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
                <div><div style="font-size:16px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;"><span style="color:var(--accent-color);">${icon}</span> ${title}</div><div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${subtitle}</div></div>
                <button id="_io_close" style="background:var(--primary-bg);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);">${ICONS.close}</button>
            </div>
            <div
            style="overflow-y:auto;padding:8px 22px;display:flex;flex-direction:column;gap:7px;flex:1;">
                ${modules.map(m => `<div class="io-module-row"><div class="io-icon-box">${m.icon}</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--text-primary);">${m.label}</div><div style="font-size:11px;color:var(--text-secondary);">${m.displayCount !== undefined ? m.displayCount : (m.data ? m.data.length : m.count)} 条${m.extra ? ' · 含分组结构' : ''}</div></div><div class="io-toggle" data-id="${m.id}"><div class="knob"></div></div><input type="checkbox" id="${m.id}" checked style="display:none;"></div>`).join('')}
            </div>
            ${showMode ? `<div style="padding:8px 22px;flex-shrink:0;"><div style="display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:13px;background:var(--primary-bg);border:1.5px solid var(--border-color);"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" style="color:var(--accent-color);flex-shrink:0;"><path d="M7.5 1v9M4 6l3.5 3L11 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="2" y1="13" x2="13" y2="13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg><span style="font-size:13px;color:var(--text-primary);flex:1;">导入方式</span><div style="display:flex;background:var(--secondary-bg);border-radius:8px;overflow:hidden;border:1px solid var(--border-color);"><label style="display:flex;align-items:center;gap:4px;padding:5px 12px;cursor:pointer;font-size:12px;color:var(--text-primary);"><input type="radio" name="_io_mode" id="_io_merge" value="merge" checked style="accent-color:var(--accent-color);"> 追加</label><label style="display:flex;align-items:center;gap:4px;padding:5px 12px;cursor:pointer;font-size:12px;color:var(--text-primary);border-left:1px solid var(--border-color);"><input type="radio" name="_io_mode" id="_io_overwrite" value="overwrite" style="accent-color:var(--accent-color);"> 覆盖</label></div></div></div>` : ''}
            <div style="padding:10px 22px 22px;display:flex;gap:10px;flex-shrink:0;"><button id="_io_cancel" style="flex:1;padding:13px;border:1.5px solid var(--border-color);border-radius:14px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button><button id="_io_confirm" style="flex:2;padding:13px;border:none;border-radius:14px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font-family);display:flex;align-items:center;justify-content:center;gap:8px;"><span style="color:#fff;">${icon}</span> 确认</button></div>
        </div>`;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.io-toggle').forEach(sw => { sw.onclick = () => { const cb = document.getElementById(sw.dataset.id); cb.checked = !cb.checked; sw.classList.toggle('off', !cb.checked); }; });
    const close = () => { overlay.style.animation = 'fadeOut 0.15s ease forwards'; setTimeout(() => overlay.remove(), 150); };
    overlay.querySelector('#_io_close').onclick = close;
    overlay.querySelector('#_io_cancel').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('#_io_confirm').onclick = () => {
        const selected = modules.filter(m => document.getElementById(m.id)?.checked);
        const mode = showMode ? (document.getElementById('_io_overwrite')?.checked ? 'overwrite' : 'merge') : 'export';
        close();
        onConfirm(selected, mode);
    };
}

function _makeOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;';
    return overlay;
}

function _showBatchAddDialog() {
    const ctx = _getGroupCtx();
    const groups = ctx.groups;
    const overlay = _makeOverlay();
    const panel = document.createElement('div');
    panel.style.cssText = 'background:var(--secondary-bg);border-radius:22px;padding:24px;width:92%;max-width:420px;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,.45);animation:popIn 0.22s cubic-bezier(.34,1.56,.64,1);';

    const hasGroups = groups && groups.length > 0;
    const groupPillsHTML = hasGroups ? `<button class="ba-grp-pill" data-gidx="-1" style="padding:5px 13px;border-radius:20px;font-size:12px;font-family:var(--font-family);cursor:pointer;border:1.5px solid var(--accent-color);background:var(--accent-color);color:#fff;font-weight:700;flex-shrink:0;transition:all .15s;">不分组</button>` + groups.map((g, i) => `<button class="ba-grp-pill" data-gidx="${i}" style="padding:5px 13px;border-radius:20px;font-size:12px;font-family:var(--font-family);cursor:pointer;border:1.5px solid ${g.color}44;background:${g.color}18;color:${g.color};font-weight:600;flex-shrink:0;transition:all .15s;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${g.color};margin-right:4px;vertical-align:middle;"></span>${g.name}</button>`).join('') : '';

    panel.innerHTML = `
        <style>@keyframes popIn { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} } @keyframes baGroupSlide { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }</style>
        <div style="flex-shrink:0;font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:6px;">批量添加${getCategoryName(currentSubTab)}</div>
        <div style="flex-shrink:0;font-size:12px;color:var(--text-secondary);margin-bottom:14px;line-height:1.6;">每行一条，自动去重</div>
        <div style="flex:1;overflow-y:auto;overflow-x:hidden;min-height:0;">
            <textarea id="batch-add-input" rows="10" placeholder="在此粘贴内容，每行一条…" style="width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid var(--border-color);border-radius:13px;background:var(--primary-bg);color:var(--text-primary);font-size:13px;font-family:var(--font-family);outline:none;resize:vertical;line-height:1.6;transition:border 0.18s;"></textarea>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:6px;margin-bottom:12px;"><span id="batch-add-count">0 条</span></div>
            ${hasGroups ? `<div id="ba-group-section" style="margin-bottom:4px;"><button id="ba-group-toggle" style="display:flex;align-items:center;gap:7px;width:100%;padding:9px 12px;border-radius:11px;cursor:pointer;border:1.5px solid var(--border-color);background:var(--primary-bg);color:var(--text-secondary);font-size:12px;font-family:var(--font-family);font-weight:600;transition:all .15s;text-align:left;"><i class="fas fa-folder" style="font-size:12px;color:var(--accent-color);"></i><span id="ba-toggle-label">添加到分组</span><span id="ba-toggle-arrow" style="margin-left:auto;font-size:10px;transition:transform .2s;">▼</span></button><div id="ba-group-drawer" style="display:none;overflow-x:auto;overflow-y:hidden;padding:10px 2px 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;"><div id="ba-group-list" style="display:flex;gap:7px;width:max-content;">${groupPillsHTML}</div></div></div>` : ''}
        </div>
        <div style="flex-shrink:0;padding-top:14px;display:flex;gap:10px;"><button id="ba-cancel" style="flex:1;padding:12px;border:1.5px solid var(--border-color);border-radius:13px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">取消</button><button id="ba-confirm" style="flex:2;padding:12px;border:none;border-radius:13px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font-family);">添加</button></div>`;
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const ta = panel.querySelector('#batch-add-input');
    const countEl = panel.querySelector('#batch-add-count');
    ta.addEventListener('input', () => { const lines = ta.value.split('\n').filter(l => l.trim()); countEl.textContent = `${lines.length} 条`; });
    ta.addEventListener('focus', e => { e.target.style.borderColor = 'var(--accent-color)'; });
    ta.addEventListener('blur', e => { e.target.style.borderColor = 'var(--border-color)'; });

    const groupToggle = panel.querySelector('#ba-group-toggle');
    const groupDrawer = panel.querySelector('#ba-group-drawer');
    const toggleArrow = panel.querySelector('#ba-toggle-arrow');
    const toggleLabel = panel.querySelector('#ba-toggle-label');
    let _drawerOpen = false;
    if (groupToggle && groupDrawer) {
        groupToggle.addEventListener('click', () => {
            _drawerOpen = !_drawerOpen;
            if (_drawerOpen) { groupDrawer.style.display = 'block'; groupDrawer.style.animation = 'baGroupSlide 0.18s ease forwards'; toggleArrow.style.transform = 'rotate(180deg)'; groupToggle.style.borderColor = 'var(--accent-color)'; groupToggle.style.color = 'var(--text-primary)'; }
            else { groupDrawer.style.display = 'none'; toggleArrow.style.transform = ''; groupToggle.style.borderColor = 'var(--border-color)'; groupToggle.style.color = 'var(--text-secondary)'; }
        });
    }

let _selectedGroupIdx = -1;
    const pillContainer = panel.querySelector('#ba-group-list');
    if (pillContainer) {
        pillContainer.addEventListener('click', e => {
            const pill = e.target.closest('.ba-grp-pill');
            if (!pill) return;
            _selectedGroupIdx = parseInt(pill.dataset.gidx);
            if (toggleLabel) { const g = groups[_selectedGroupIdx]; toggleLabel.textContent = _selectedGroupIdx === -1 ? '添加到分组' : (g ? `分组：${g.name}` : '添加到分组'); }
            pillContainer.querySelectorAll('.ba-grp-pill').forEach((p, i) => {
                const gidx = parseInt(p.dataset.gidx);
                if (gidx === -1) { const isActive = _selectedGroupIdx === -1; p.style.background = isActive ? 'var(--accent-color)' : 'transparent'; p.style.color = isActive ? '#fff' : 'var(--text-secondary)'; p.style.borderColor = isActive ? 'var(--accent-color)' : 'var(--border-color)'; }
                else { const g = groups[gidx]; if (!g) return; const isActive = _selectedGroupIdx === gidx; p.style.background = isActive ? g.color : g.color + '18'; p.style.color = isActive ? '#fff' : g.color; p.style.borderColor = isActive ? g.color : g.color + '44'; }
            });
        });
    }

    panel.querySelector('#ba-cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    panel.querySelector('#ba-confirm').onclick = () => {
        const lines = ta.value.split('\n').map(l => l.trim()).filter(Boolean);
        if (!lines.length) { showNotification('请输入内容', 'warning'); return; }
        let added = 0, skipped = 0;
        const newItems = [];
        lines.forEach(val => {
            const norm = normalizeStringStrict(val);
            const isDup = currentSubTab === 'custom' ? (customReplies.some(r => normalizeStringStrict(r) === norm) || CONSTANTS.REPLY_MESSAGES.some(r => normalizeStringStrict(r) === norm)) : currentSubTab === 'pokes' ? customPokes.some(r => normalizeStringStrict(r) === norm) : currentSubTab === 'statuses' ? customStatuses.some(r => normalizeStringStrict(r) === norm) : false;
            if (isDup) { skipped++; return; }
            if (currentSubTab === 'custom') { customReplies.push(val); newItems.push(val); }
            else if (currentSubTab === 'pokes') { customPokes.push(val); newItems.push(val); }
            else if (currentSubTab === 'statuses') { customStatuses.push(val); newItems.push(val); }
            else if (currentSubTab === 'mottos') customMottos.push(val);
            added++;
        });
        if (_selectedGroupIdx >= 0 && newItems.length > 0 && groups) {
            const targetGroup = groups[_selectedGroupIdx];
            if (targetGroup) { if (!targetGroup.items) targetGroup.items = []; newItems.forEach(item => { if (!targetGroup.items.includes(item)) targetGroup.items.push(item); }); }
        }
        throttledSaveData();
        overlay.remove();
        renderReplyLibrary();
        const groupHint = _selectedGroupIdx >= 0 && groups?.[_selectedGroupIdx] ? `，已加入「${groups[_selectedGroupIdx].name}」` : '';
        showNotification(`✓ 添加 ${added} 条${skipped ? `，跳过 ${skipped} 条重复` : ''}${groupHint}`, 'success');
    };
}
// ===== 强制修正侧边栏点击后的子选项卡 =====
(function() {
    setTimeout(function() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar || sidebar._forceFixed) return;
        sidebar._forceFixed = true;

        sidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;

            var major = btn.getAttribute('data-major');

            // 公告特殊处理
            if (major === 'announcement') {
                if (typeof window.switchToAnnouncementPanel === 'function') {
                    window.switchToAnnouncementPanel();
                }
                return;
            }

            // 设置正确的子选项卡
            window.currentMajorTab = major;
            window.currentSubTab = (major === 'reply') ? 'custom' : 'pokes';

            // 强制渲染
            if (typeof window.renderReplyLibrary === 'function') {
                window.renderReplyLibrary();
            }
        });
    }, 800);
})();
