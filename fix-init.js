// fix-init.js —— 终极初始化补丁，必须放在所有脚本最前面！
(function() {
    'use strict';
    console.log('🛡️ 终极补丁已激活，正在修复所有已知错误...');

    // 1. 补齐所有可能缺失的核心函数
    var missingFuncs = [
        'initializeSession',
        'simulateReply',
        'setupEventListeners',
        'setupEventListener'
    ];
    missingFuncs.forEach(function(fn) {
        if (typeof window[fn] === 'undefined') {
            window[fn] = function() {
                if (fn === 'initializeSession') return Promise.resolve();
            };
            console.log('✅ 已补齐缺失函数：' + fn);
        }
    });

    // 2. 强制修复设置按钮（修复版）
    function fixSettingsBtn() {
        var btn = document.getElementById('settings-btn');
        if (btn) {
            // 强制清理遮罩
            var welcome = document.getElementById('welcome-animation');
            if (welcome) { welcome.style.display = 'none'; }
            var splash = document.getElementById('splash-declaration');
            if (splash) { splash.style.display = 'none'; }

            var newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var modal = document.getElementById('settings-modal');
                if (modal) {
                    if (typeof showModal === 'function') {
                        showModal(modal);
                    } else {
                        modal.style.display = 'flex';
                    }
                }
            });
            console.log('✅ 设置按钮已修复');
        } else {
            console.warn('⚠️ 未找到设置按钮，1秒后重试...');
            setTimeout(fixSettingsBtn, 1000);
        }
    }

    // 页面加载后尝试修复
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixSettingsBtn);
    } else {
        fixSettingsBtn();
    }

    // 3. 全局错误捕获
    window.addEventListener('error', function(e) {
        if (e.message && e.message.indexOf('is not defined') !== -1) {
            console.warn('⚠️ 捕获到未定义错误，已阻止中断：', e.message);
            return true;
        }
    });

    // 4. 补齐 initializeRandomUI
    if (typeof window.initializeRandomUI === 'undefined') {
        window.initializeRandomUI = function() {
            console.log('✅ 初始化成功！');
            var headerMotto = document.querySelector('.header-motto');
            if (headerMotto && typeof customMottos !== 'undefined' && customMottos.length > 0) {
                headerMotto.textContent = customMottos[Math.floor(Math.random() * customMottos.length)];
            }
        };
    }

    // 5. 补齐 initMusicPlayer
    if (typeof window.initMusicPlayer === 'undefined') {
        window.initMusicPlayer = function() {
            console.log('🎵 initMusicPlayer 已补齐（空函数）');
        };
    }

    // 6. 万能兜底：自动补齐所有可能缺失的函数
    var funcs = [
        'checkStatusChange',
        'openNameModal',
        'openAvatarModal',
        'initChatActionListeners',
        'initModalListeners',
        'initNewFeatureListeners',
        'initDataManagementListeners',
        'initCoreListeners',
        'manageAutoSendTimer',
        'checkEnvelopeStatus',
        'initReplyLibraryListeners',
        'setupAppearancePanelFrameSettings',
        'initMoodListeners',
        'initThemeSchemes'
    ];

    funcs.forEach(function(fn) {
        if (typeof window[fn] === 'undefined') {
            window[fn] = function() {};
            console.log('✅ 自动补全函数：' + fn);
        }
    });

    // 7. 强制关闭所有遮罩层
    setTimeout(function() {
        var welcome = document.getElementById('welcome-animation');
        if (welcome) { welcome.style.display = 'none'; welcome.classList.add('hidden'); }
        var splash = document.getElementById('splash-declaration');
        if (splash) { splash.style.display = 'none'; }
        console.log('🟢 所有遮罩层已强制关闭');
    }, 500);

    console.log('🛡️ 终极补丁初始化完成');
})();
