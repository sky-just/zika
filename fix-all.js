// fix-all.js —— 修复备份报错 + 音乐 + 侧边栏
(function() {
    'use strict';

    // ===== 0. 修复备份函数缺失 =====
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {
            // 空函数，只是为了不让 app.js 报错
        };
    }

    // ===== 1. 音乐迷你窗口展开 =====
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

    // ===== 2. 音乐歌单按钮强制绑定 =====
    function forceBindListBtn() {
        var listBtn = document.getElementById('list-btn');
        var playlist = document.getElementById('playlist');
        var player = document.getElementById('player');
        if (!listBtn || !playlist || !player) return;

        if (listBtn._forceBound) return;
        listBtn._forceBound = true;

        var newBtn = listBtn.cloneNode(true);
        listBtn.parentNode.replaceChild(newBtn, listBtn);

        newBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var rect = player.getBoundingClientRect();
            playlist.style.position = 'fixed';
            playlist.style.left = rect.left + 'px';
            playlist.style.top = (rect.top + (player.classList.contains('collapsed') ? 62 : 150)) + 'px';
            playlist.style.display = 'block';
            playlist.classList.toggle('active');
        });
    }

    // ===== 3. 侧边栏按钮修复 =====
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

    setTimeout(function() {
        fixMiniView();
        forceBindListBtn();
        fixSidebar();
    }, 1000);

    setTimeout(function() {
        fixMiniView();
        forceBindListBtn();
        fixSidebar();
    }, 3000);
})();
