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

// 分组上下文
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
    if (!window.customReplyGroups) window.customReplyGroups = [];
    return { groups: window.customReplyGroups, items: customReplies, itemLabel: '字卡' };
}

function _tabHasGroups(tab) {
    tab = tab || currentSubTab;
    return tab === 'custom' || tab === 'pokes' || tab === 'statuses';
}

// 全局变量（这些是原库使用的）
window.currentMajorTab = window.currentMajorTab || 'reply';
window.currentSubTab = window.currentSubTab || 'custom';
window.currentReplyTab = window.currentReplyTab || 'custom';
let _batchSelectedIndices = new Set();
let _batchModeActive = false;
let _batchModeTarget = 'custom';
let _searchVisible = false;
let _searchQuery = '';
let _searchDebounceTimer = null;
let _activeGroupFilter = null;

// 渲染函数外壳（防止报错）
function renderReplyLibrary() {
    // 本版本已弃用旧 UI，所有管理请通过“高级功能→内容管理”进行
    console.log('[reply-library] 旧版 UI 已停用，请使用新的内容管理面板。');
}
function renderReplyLibraryRaf() { renderReplyLibrary(); }
function _renderListContentOnly() {}
function _renderModernToolbar() {}
function _renderCardViewWithGroups() {}
function _renderGroupBlock() {}
function _renderCardList() {}
function _renderAtmosphereList() {}
function _renderEmojiTab() {}
function _renderStickerTab() {}
function renderEmptyState() { return '<div style="padding:40px;text-align:center;">内容已迁移至新面板</div>'; }
function _getDisabledItemsSet() { return new Set(); }
function _getDisabledStickerItemsSet() { return new Set(); }
function _saveDisabledItemsSet() {}
function _saveDisabledStickerItemsSet() {}
function _toggleItemDisable() {}
function _batchToggleDisable() {}
function _batchToggleDisableStickers() {}
function _runDedup() {}
function _showGroupManager() {}
function _showGroupEditor() {}
function _showSingleItemGroupPicker() {}
function _showBatchGroupPicker() {}
function deleteItem() {}
function editItem() {}
function _showExportUI() {}
function _doExport() {}
function _showGroupExportPicker() {}
function _showAnnouncementExportPicker() {}
function _parseFlexibleJSON() { return {}; }
function _normalizeImportData() { return {}; }
function _showImportUI() {}
function _showIOSheet() {}
function _makeOverlay() { return document.createElement('div'); }
function _showBatchAddDialog() {}

// 关键监听器
function initReplyLibraryListeners() {
    // 保留空壳，避免报错
}
function getCategoryName() { return ''; }
function updateTabUI() {}
function initRippleFeedback() {}
function applyAvatarFrame() {}
function setupAvatarFrameSettings() {}
function applyAllAvatarFrames() {}
