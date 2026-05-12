// fix-all.js —— 终极纯净版（完全重置）
(function() {
    'use strict';

    // 备份函数空壳
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 只修复音乐迷你窗口展开
    function fixMiniView() {
        var miniView = document.getElementById('mini-view');
        var player = document.getElementById('player');
        if (miniView && player && !miniView._fixMusic) {
            miniView._fixMusic = true;
            miniView.addEventListener('click', function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            });
        }
    }

    // 强制重新初始化音乐播放器
    function reInitMusicPlayer() {
        if (typeof initMusicPlayer === 'function') {
            // 移除之前可能残留的错误绑定
            var listBtn = document.getElementById('list-btn');
            if (listBtn) {
                var newBtn = listBtn.cloneNode(true);
                if (listBtn.parentNode) {
                    listBtn.parentNode.replaceChild(newBtn, listBtn);
                }
            }
            // 重新初始化
            try {
                initMusicPlayer();
            } catch(e) {
                console.warn('[fix-all] initMusicPlayer 失败:', e);
            }
        }
    }

    // 侧边栏修复
    function fixSidebar() {
        var buttons = document.querySelectorAll('.modal-sidebar .sidebar-btn');
        buttons.forEach(function(btn) {
            if (btn._fixSide) return;
            btn._fixSide = true;
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

    setTimeout(fixMiniView, 500);
    setTimeout(reInitMusicPlayer, 2000);
    setTimeout(fixSidebar, 1500);
})();
