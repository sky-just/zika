// app-fix.js —— 全能修复脚本
(function() {
    'use strict';
    console.log('[app-fix] 全能修复模式已启动');

    // 重写 showModal / hideModal
    window.showModal = function(modal) {
        if (!modal) return;
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
        setTimeout(function() { modal.style.display = 'none'; }, 300);
    };

    // 补齐缺失函数
    var funcs = ['initializeSession','simulateReply','setupEventListeners','initializeRandomUI','initMusicPlayer','checkStatusChange'];
    funcs.forEach(function(fn) {
        if (typeof window[fn] === 'undefined') {
            window[fn] = function() { if (fn === 'initializeSession') return Promise.resolve(); };
        }
    });

    // 修复所有按钮点击事件（包括高级功能里的所有功能）
    function bindBtns() {
        var actions = [
            ['settings-btn', 'settings-modal'],
            ['appearance-settings', 'appearance-modal'],
            ['chat-settings', 'chat-modal'],
            ['advanced-settings', 'advanced-modal'],
            ['data-settings', 'data-modal'],
            ['custom-replies-function', 'custom-replies-modal'],
            ['stats-function', 'stats-modal'],
            ['decision-function', 'decision-menu-modal'],
            ['fortune-lenormand-function', 'fortune-lenormand-modal'],
            ['anniversary-function', 'anniversary-modal'],
            ['mood-function', 'mood-modal'],
            ['envelope-function', 'envelope-modal']
        ];
        actions.forEach(function(pair) {
            var btn = document.getElementById(pair[0]);
            if (!btn || btn._fixed) return;
            btn._fixed = true;
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var target = document.getElementById(pair[1]);
                if (!target) return;
                // 自动隐藏当前所在的弹窗
                var parentModal = btn.closest('.modal');
                if (parentModal) window.hideModal(parentModal);
                window.showModal(target);
            });
        });

        // 处理返回按钮（如高级功能返回设置）
        document.querySelectorAll('[id*="back-"]').forEach(function(backBtn) {
            if (backBtn._fixed) return;
            backBtn._fixed = true;
            backBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                var parentModal = backBtn.closest('.modal');
                if (parentModal) window.hideModal(parentModal);
                var settingsModal = document.getElementById('settings-modal');
                if (settingsModal) window.showModal(settingsModal);
            });
        });

        // 处理关闭按钮
        document.querySelectorAll('[id*="close"]').forEach(function(closeBtn) {
            if (closeBtn._fixed) return;
            closeBtn._fixed = true;
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                var parentModal = closeBtn.closest('.modal');
                if (parentModal) window.hideModal(parentModal);
            });
        });
    }

    // 页面稳定后多次尝试绑定，确保所有动态加载的元素都能被修复
    setTimeout(bindBtns, 600);
    setTimeout(bindBtns, 1500);
    setTimeout(bindBtns, 3000);

    console.log('[app-fix] 已就绪，所有按钮将在页面加载完成后自动修复');
})();
