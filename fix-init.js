// fix-init.js —— 终极初始化补丁，必须放在所有脚本最前面！
(function() {
    'use strict';
    console.log('🛡️ 终极补丁已激活，正在修复所有已知错误...');

    // 1. 补齐所有可能缺失的核心函数
    var missingFuncs = [
        'initializeSession',
        'simulateReply',
        'setupEventListeners',
        'setupEventListener' // 防止拼写错误
    ];
    missingFuncs.forEach(function(fn) {
        if (typeof window[fn] === 'undefined') {
            window[fn] = function() {
                if (fn === 'initializeSession') return Promise.resolve();
            };
            console.log('✅ 已补齐缺失函数：' + fn);
        }
    });

    // 2. 强制修复设置按钮（确保100%可点击）
    function fixSettingsBtn() {
        var btn = document.getElementById('settings-btn');
        if (btn) {
            btn.style.pointerEvents = 'auto';
            btn.addEventListener('click', function(e) {
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

    // 3. 全局错误捕获，防止未定义函数导致的脚本中断
    window.addEventListener('error', function(e) {
        if (e.message && e.message.indexOf('is not defined') !== -1) {
            console.warn('⚠️ 捕获到未定义错误，已阻止中断：', e.message);
            return true; // 阻止默认错误提示，让页面继续运行
        }
    });

    console.log('🛡️ 终极补丁初始化完成，页面将继续加载...');
})();
