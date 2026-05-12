// fix-all.js —— 最终纯净版 (不做多余修补，只做兜底)
(function() {
    'use strict';

    // 0. 备份函数空壳
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 1. 侧边栏按钮修复（氛围感、公告）
    function fixSidebar() {
        var buttons = document.querySelectorAll('.modal-sidebar .sidebar-btn');
        buttons.forEach(function(btn) {
            if (btn._fixedSidebar) return;
            btn._fixedSidebar = true;
            btn.addEventListener('click', function() {
                buttons.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var major = btn.getAttribute('data-major');
                if (major === 'announcement' && typeof window.switchToAnnouncementPanel === 'function') {
                    window.switchToAnnouncementPanel();
                }
                if (typeof window.renderReplyLibrary === 'function') {
                    window.currentMajorTab = major;
                    window.currentSubTab = 'custom';
                    window.renderReplyLibrary();
                }
            });
        });
    }

    // 2. 移除对所有功能的修补，让原版 initMusicPlayer 等正常运作
    // 只保留迷你窗口的展开修复
    function fixMiniView() {
        var miniView = document.getElementById('mini-view');
        var player = document.getElementById('player');
        if (miniView && player && !miniView._fixedMusic) {
            miniView._fixedMusic = true;
            miniView.addEventListener('click', function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            });
        }
    }

    setTimeout(fixMiniView, 800);
    setTimeout(fixMiniView, 2000);
    setTimeout(fixSidebar, 1200);
    setTimeout(fixSidebar, 3500);
})();
