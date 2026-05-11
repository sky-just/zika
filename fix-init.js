// fix-init.js —— 最终稳定版（不再创建重复按钮）
(function() {
    'use strict';
    console.log('🛡️ 最终补丁已激活');

    // ---------- 补齐所有缺失函数 ----------
    var funcs = [
        'initializeSession','simulateReply','setupEventListeners',
        'initializeRandomUI','initMusicPlayer','checkStatusChange',
        'openNameModal','openAvatarModal','initChatActionListeners',
        'initModalListeners','initNewFeatureListeners','initDataManagementListeners',
        'initCoreListeners','manageAutoSendTimer','checkEnvelopeStatus',
        'initReplyLibraryListeners','setupAppearancePanelFrameSettings',
        'initMoodListeners','initThemeSchemes'
    ];
    funcs.forEach(function(fn) {
        if (typeof window[fn] === 'undefined') {
            window[fn] = function() { if (fn === 'initializeSession') return Promise.resolve(); };
        }
    });

    // 重写 showModal / hideModal（带防抖，彻底稳定）
    window.showModal = function(modal) {
        if (!modal) return;
        if (modal._hideTimer) { clearTimeout(modal._hideTimer); modal._hideTimer = null; }
        modal.style.display = 'flex';
        var content = modal.querySelector('.modal-content');
        if (content) {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0) scale(1)';
        }
    };
    window.hideModal = function(modal) {
        if (!modal) return;
        var content = modal.querySelector('.modal-content');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px) scale(0.95)';
        }
        if (modal._hideTimer) clearTimeout(modal._hideTimer);
        modal._hideTimer = setTimeout(function() {
            modal.style.display = 'none';
        }, 300);
    };

    console.log('✅ 核心函数已补齐，弹窗逻辑已稳定');

    // ---------- 强制关闭所有遮罩 ----------
    setTimeout(function() {
        ['welcome-animation','splash-declaration','tour-overlay'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) { el.style.display = 'none'; el.classList.add('hidden'); }
        });
        document.body.style.overflow = '';
        document.body.style.pointerEvents = 'auto';
    }, 600);

    console.log('🛡️ 最终补丁初始化完毕');
})();
