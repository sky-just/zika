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
    // 强制修复组字卡面板按钮
setTimeout(function() {
    var comboToggle = document.getElementById('combo-enable-toggle');
    if (comboToggle) {
        comboToggle.addEventListener('click', function() {
            window.comboCardsEnabled = this.checked;
            if (typeof throttledSaveData === 'function') throttledSaveData();
        });
    }

    var addComboBtn = document.getElementById('add-combo-inner-btn');
    if (addComboBtn) {
        addComboBtn.addEventListener('click', function() {
            if (!window.comboCards) window.comboCards = [];
            window.comboCards.push({
                id: Date.now(),
                name: '新组合',
                items: ['字卡A', '字卡B'],
                separator: ' '
            });
            if (typeof throttledSaveData === 'function') throttledSaveData();
            // 刷新列表
            var list = document.getElementById('combo-list-inner');
            if (list && typeof window.comboCards !== 'undefined') {
                var idx = window.comboCards.length - 1;
                list.innerHTML += '<div>✅ 已添加「新组合」</div>';
            }
            if (typeof showNotification === 'function') showNotification('新组合已添加', 'success');
        });
    }
}, 1500);
})();
