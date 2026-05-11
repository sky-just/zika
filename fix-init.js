// fix-init.js —— 终极初始化补丁 v2
(function() {
    'use strict';
    console.log('🛡️ 终极补丁 v2 已激活');

    // 1. 补齐所有缺失函数
    var allFuncs = [
        'initializeSession', 'simulateReply', 'setupEventListeners',
        'initializeRandomUI', 'initMusicPlayer', 'checkStatusChange',
        'openNameModal', 'openAvatarModal', 'initChatActionListeners',
        'initModalListeners', 'initNewFeatureListeners', 'initDataManagementListeners',
        'initCoreListeners', 'manageAutoSendTimer', 'checkEnvelopeStatus',
        'initReplyLibraryListeners', 'setupAppearancePanelFrameSettings',
        'initMoodListeners', 'initThemeSchemes'
    ];
    allFuncs.forEach(function(fn) {
        if (typeof window[fn] === 'undefined') {
            window[fn] = function() {
                if (fn === 'initializeSession') return Promise.resolve();
            };
        }
    });
    console.log('✅ 所有缺失函数已补齐');

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

    // 3. 创建全新的设置按钮（不依赖原网站任何逻辑）
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
                // 用最原始的方式强制显示，不依赖任何函数
                modal.style.display = 'flex';
                modal.style.zIndex = '99999';
                var content = modal.querySelector('.modal-content');
                if (content) {
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0) scale(1)';
                }
            }
        });

        headerActions.appendChild(newBtn);
        console.log('✅ 新设置按钮已创建');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createNewSettingsBtn);
    } else {
        createNewSettingsBtn();
    }

    console.log('🛡️ 终极补丁 v2 初始化完成');
})();
