// fix-final.js —— 最终纯净兜底版
console.log('[fix-final] 最终纯净兜底版已加载！版本: 202605130400');

(function() {
    'use strict';

    // 0. 备份函数空壳
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 1. 确保全局变量存在
    if (typeof window.currentMajorTab === 'undefined') window.currentMajorTab = 'reply';
    if (typeof window.currentSubTab === 'undefined') window.currentSubTab = 'custom';

    // 2. 缺失函数补全
    if (typeof window.switchToAnnouncementPanel === 'undefined') {
        window.switchToAnnouncementPanel = function() {
            var listArea = document.getElementById('custom-replies-list');
            var annPanel = document.getElementById('announcement-panel');
            if (listArea) listArea.style.display = 'none';
            if (annPanel) annPanel.style.display = 'block';
        };
    }

    // 3. 顶部按钮兜底
    function bindTopButtons() {
        var dgBtn = document.getElementById('daily-greeting-btn');
        if (dgBtn && !dgBtn._fixTop) {
            dgBtn._fixTop = true;
            dgBtn.onclick = function() {
                var modal = document.getElementById('daily-greeting-modal');
                if (modal) modal.classList.remove('hidden');
            };
        }
        var themeBtn = document.getElementById('theme-toggle');
        if (themeBtn && !themeBtn._fixTop) {
            themeBtn._fixTop = true;
            themeBtn.onclick = function() {
                if (typeof settings !== 'undefined') {
                    settings.isDarkMode = !settings.isDarkMode;
                    if (typeof updateUI === 'function') updateUI();
                }
            };
        }
    }

    // 4. 音乐播放器按钮强制绑定（只绑这一次）
    function bindMusicButtons() {
        var player = document.getElementById('player');
        if (!player || player._musicFixed) return;
        player._musicFixed = true;

        var listBtn = document.getElementById('list-btn');
        if (listBtn) {
            listBtn.onclick = function(e) {
                e.stopPropagation();
                var playlist = document.getElementById('playlist');
                if (playlist) {
                    var rect = player.getBoundingClientRect();
                    playlist.style.position = 'fixed';
                    playlist.style.left = rect.left + 'px';
                    playlist.style.top = (rect.top + 155) + 'px';
                    playlist.classList.toggle('active');
                }
            };
        }

        var minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.onclick = function(e) {
                e.stopPropagation();
                player.classList.add('collapsed');
                var pl = document.getElementById('playlist');
                if (pl) pl.classList.remove('active');
            };
        }

        var miniView = document.getElementById('mini-view');
        if (miniView) {
            miniView.onclick = function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            };
        }
    }

    // 5. 手帐修复
    function fixMoodModule() {
        if (typeof initMoodListeners === 'function') {
            initMoodListeners();
            if (typeof renderMoodCalendar === 'function') renderMoodCalendar();
        } else {
            setTimeout(fixMoodModule, 500);
        }
    }

    // 6. 永不干预侧边栏、回复库、自定义回复 —— 它们由 reply-library.js 全权负责

    setTimeout(bindTopButtons, 600);
    setTimeout(bindMusicButtons, 1000);
    setTimeout(fixMoodModule, 2000);
})();
