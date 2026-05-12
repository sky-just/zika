// fix-all.js —— 终极纯净版
(function() {
    'use strict';

    // 只补缺失的备份函数
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 只修复音乐迷你窗口的展开
    function fixMiniView() {
        var miniView = document.getElementById('mini-view');
        var player = document.getElementById('player');
        if (miniView && player) {
            if (!miniView._fixed) {
                miniView._fixed = true;
                miniView.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (player.classList.contains('collapsed')) {
                        player.classList.remove('collapsed');
                    }
                });
            }
        }
    }

    // 确保顶部按钮的函数存在
    if (typeof window.toggleImmersiveMode === 'undefined') {
        window.toggleImmersiveMode = function() {
            document.body.classList.toggle('immersive-mode');
        };
    }
    if (typeof window.reopenDailyGreeting === 'undefined') {
        window.reopenDailyGreeting = function() {
            var modal = document.getElementById('daily-greeting-modal');
            if (modal) modal.classList.remove('hidden');
        };
    }
    if (typeof window.closeDailyGreeting === 'undefined') {
        window.closeDailyGreeting = function() {
            var modal = document.getElementById('daily-greeting-modal');
            if (modal) modal.classList.add('hidden');
        };
    }
    if (typeof window._buildDailyGreeting === 'undefined') {
        window._buildDailyGreeting = function() {};
    }

    setTimeout(fixMiniView, 500);
    setTimeout(fixMiniView, 1500);
})();
