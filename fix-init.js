// fix-init.js —— 终极初始化补丁 v3（最终版）
(function() {
    'use strict';
    console.log('🛡️ 终极补丁 v3 已激活');

    // 1. 补齐所有缺失函数
    var allFuncs = [
        'initializeSession', 'simulateReply', 'setupEventListeners',
        'initializeRandomUI', 'initMusicPlayer', 'checkStatusChange',
        'openNameModal', 'openAvatarModal', 'initChatActionListeners',
        'initModalListeners', 'initNewFeatureListeners', 'initDataManagementListeners',
        'initCoreListeners', 'manageAutoSendTimer', 'checkEnvelopeStatus',
        'initReplyLibraryListeners', 'setupAppearancePanelFrameSettings',
        'initMoodListeners', 'initThemeSchemes',
        'showModal', 'hideModal'
    ];
    allFuncs.forEach(function(fn) {
        if (typeof window[fn] === 'undefined') {
            if (fn === 'showModal') {
                window[fn] = function(m) { m.style.display = 'flex'; };
            } else if (fn === 'hideModal') {
                window[fn] = function(m) { m.style.display = 'none'; };
            } else if (fn === 'initializeSession') {
                window[fn] = function() { return Promise.resolve(); };
            } else {
                window[fn] = function() {};
            }
        }
    });
    console.log('✅ 所有缺失函数已补齐（含 showModal / hideModal）');

    // 2. 强制关闭所有遮罩
    setTimeout(function() {
        ['welcome-animation', 'splash-declaration', 'tour-overlay'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) { el.style.display = 'none'; el.classList.add('hidden'); }
        });
        document.body.classList.remove('no-scroll', 'overflow-hidden');
        document.body.style.overflow = '';
        document.body.style.pointerEvents = 'auto';
        console.log('🟢 遮罩已关闭');
    }, 600);

    // 3. 创建全新的设置按钮
    function createNewSettingsBtn() {
        var headerActions = document.querySelector('.header-actions');
        if (!headerActions) {
            setTimeout(createNewSettingsBtn, 500);
            return;
        }

        var newBtn = document.createElement('button');
        newBtn.id = 'settings-btn-new';
        newBtn.className = 'action-btn';
        newBtn.title = '设置';
        newBtn.innerHTML = '<i class="fas fa-cog"></i>';
        newBtn.style.cssText = 'background:none;border:none;color:var(--text-secondary);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;';

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var modal = document.getElementById('settings-modal');
            if (modal) {
                modal.style.display = 'flex';
                modal.style.zIndex = '99999';
                var content = modal.querySelector('.modal-content');
                if (content) {
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0) scale(1)';
                }
                // 确保设置面板内的子功能按钮有事件
                bindSettingsInnerBtns();
            }
        });

        headerActions.appendChild(newBtn);
        console.log('✅ 新设置按钮已创建');
    }

    // 4. 强制绑定设置面板内所有功能按钮的点击事件
    function bindSettingsInnerBtns() {
        // appearance-settings → 外观设置弹窗
        var appearanceBtn = document.getElementById('appearance-settings');
        if (appearanceBtn && !appearanceBtn._patched) {
            appearanceBtn._patched = true;
            appearanceBtn.addEventListener('click', function() {
                var settingsModal = document.getElementById('settings-modal');
                var appearanceModal = document.getElementById('appearance-modal');
                if (settingsModal) window.hideModal ? hideModal(settingsModal) : (settingsModal.style.display = 'none');
                if (appearanceModal) window.showModal ? showModal(appearanceModal) : (appearanceModal.style.display = 'flex');
            });
        }

        // chat-settings → 聊天设置弹窗
        var chatBtn = document.getElementById('chat-settings');
        if (chatBtn && !chatBtn._patched) {
            chatBtn._patched = true;
            chatBtn.addEventListener('click', function() {
                var settingsModal = document.getElementById('settings-modal');
                var chatModal = document.getElementById('chat-modal');
                if (settingsModal) window.hideModal ? hideModal(settingsModal) : (settingsModal.style.display = 'none');
                if (chatModal) window.showModal ? showModal(chatModal) : (chatModal.style.display = 'flex');
            });
        }

        // advanced-settings → 高级功能弹窗
        var advancedBtn = document.getElementById('advanced-settings');
        if (advancedBtn && !advancedBtn._patched) {
            advancedBtn._patched = true;
            advancedBtn.addEventListener('click', function() {
                var settingsModal = document.getElementById('settings-modal');
                var advancedModal = document.getElementById('advanced-modal');
                if (settingsModal) window.hideModal ? hideModal(settingsModal) : (settingsModal.style.display = 'none');
                if (advancedModal) window.showModal ? showModal(advancedModal) : (advancedModal.style.display = 'flex');
            });
        }

        // data-settings → 数据管理弹窗
        var dataBtn = document.getElementById('data-settings');
        if (dataBtn && !dataBtn._patched) {
            dataBtn._patched = true;
            dataBtn.addEventListener('click', function() {
                var settingsModal = document.getElementById('settings-modal');
                var dataModal = document.getElementById('data-modal');
                if (settingsModal) window.hideModal ? hideModal(settingsModal) : (settingsModal.style.display = 'none');
                if (dataModal) window.showModal ? showModal(dataModal) : (dataModal.style.display = 'flex');
            });
        }

        console.log('✅ 设置面板子功能按钮已绑定');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createNewSettingsBtn);
    } else {
        createNewSettingsBtn();
    }

    console.log('🛡️ 终极补丁 v3 初始化完成');
})();
