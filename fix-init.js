// fix-init.js —— 最终稳定版
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

    // ---------- 创建全新的设置按钮 ----------
    function createSettingsBtn() {
        var header = document.querySelector('.header-actions');
        if (!header) { setTimeout(createSettingsBtn, 500); return; }

        var btn = document.createElement('button');
        btn.id = 'settings-btn-new';
        btn.className = 'action-btn';
        btn.title = '设置';
        btn.innerHTML = '<i class="fas fa-cog"></i>';
        btn.style.cssText = 'background:none;border:none;color:var(--text-secondary);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;';

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var modal = document.getElementById('settings-modal');
            if (modal) {
                window.showModal(modal);
                bindSettingsInner();  // 确保子面板事件
            }
        });
        header.appendChild(btn);
        console.log('✅ 新设置按钮已就位');
    }

    // ---------- 强制绑定设置面板内所有功能 ----------
    function bindSettingsInner() {
        var pairs = [
            ['appearance-settings', 'appearance-modal'],
            ['chat-settings', 'chat-modal'],
            ['advanced-settings', 'advanced-modal'],
            ['data-settings', 'data-modal']
        ];
        pairs.forEach(function(pair) {
            var trigger = document.getElementById(pair[0]);
            var target  = document.getElementById(pair[1]);
            if (!trigger || !target) return;
            if (trigger._patched) return;
            trigger._patched = true;
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                var settingsModal = document.getElementById('settings-modal');
                if (settingsModal) window.hideModal(settingsModal);
                window.showModal(target);
            });
        });

        // 处理各子面板的“返回”按钮，让它们回到设置主面板
        var backBtns = document.querySelectorAll('[id*="back-"], [id*="-back"]');
        backBtns.forEach(function(btn) {
            if (btn._patched) return;
            btn._patched = true;
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var parentModal = btn.closest('.modal');
                if (parentModal) window.hideModal(parentModal);
                var settingsModal = document.getElementById('settings-modal');
                if (settingsModal) window.showModal(settingsModal);
            });
        });

        // 处理关闭按钮（所有带 close 字样的按钮）
        var closeBtns = document.querySelectorAll('.modal [id*="close"]');
        closeBtns.forEach(function(btn) {
            if (btn._patched) return;
            btn._patched = true;
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var parentModal = btn.closest('.modal');
                if (parentModal) window.hideModal(parentModal);
            });
        });

        console.log('✅ 设置面板子功能已绑定（含返回/关闭）');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createSettingsBtn);
    } else {
        createSettingsBtn();
    }

    console.log('🛡️ 最终补丁初始化完毕');
})();
