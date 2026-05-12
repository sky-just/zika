// fix-all.js —— 纯净增强版（强制恢复音乐功能）
(function() {
    'use strict';

    // 0. 备份函数空壳
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 1. 强制恢复原生音乐播放器初始化
    function forceInitMusic() {
        // 如果原生的 initMusicPlayer 存在，就强制重新执行一次
        if (typeof initMusicPlayer === 'function') {
            // 清除可能残留的错误状态
            var listBtn = document.getElementById('list-btn');
            if (listBtn && listBtn._forceBound) {
                // 恢复被替换的按钮
                var parent = listBtn.parentNode;
                var newBtn = listBtn.cloneNode(true);
                parent.replaceChild(newBtn, listBtn);
                delete newBtn._forceBound;
            }
            // 重新初始化
            initMusicPlayer();
        }
    }

    // 2. 侧边栏按钮修复
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

    // 3. 音乐迷你窗口展开
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

    // 延迟执行，确保其他 JS 文件已加载
    setTimeout(forceInitMusic, 1500);
    setTimeout(forceInitMusic, 3500);
    setTimeout(fixMiniView, 800);
    setTimeout(fixMiniView, 2000);
    setTimeout(fixSidebar, 1200);
    setTimeout(fixSidebar, 3500);
})();
