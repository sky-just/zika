// fix-conflict.js —— 最终纯净版（只绑定事件，不修改任何界面）
console.log('[fix-conflict] 最终纯净版已加载！');

(function() {
    'use strict';

    // 0. 备份函数兜底
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 1. 确保缺失的变量存在
    if (typeof window.currentMajorTab === 'undefined') window.currentMajorTab = 'reply';
    if (typeof window.currentSubTab === 'undefined') window.currentSubTab = 'custom';
    if (typeof window.switchToAnnouncementPanel === 'undefined') {
        window.switchToAnnouncementPanel = function() {
            var listArea = document.getElementById('custom-replies-list');
            var annPanel = document.getElementById('announcement-panel');
            if (listArea) listArea.style.display = 'none';
            if (annPanel) annPanel.style.display = 'block';
        };
    }

    // 2. 强制重新绑定侧边栏事件（用事件委托，不依赖旧代码）
    function rebindSidebar() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar || sidebar._rebound) return;
        sidebar._rebound = true;

        sidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;

            // 更新样式
            sidebar.querySelectorAll('.sidebar-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var major = btn.getAttribute('data-major');

            // 公告特殊处理
            if (major === 'announcement') {
                if (typeof window.switchToAnnouncementPanel === 'function') {
                    window.switchToAnnouncementPanel();
                }
                return;
            }

            // 设置全局状态
            window.currentMajorTab = major;
            window.currentSubTab = 'custom';

            // 确保公告面板隐藏，列表区域显示
            var annPanel = document.getElementById('announcement-panel');
            var listArea = document.getElementById('custom-replies-list');
            if (annPanel) annPanel.style.display = 'none';
            if (listArea) listArea.style.display = 'block';

            // 触发原生渲染
            if (typeof renderReplyLibrary === 'function') {
                renderReplyLibrary();
            }
        });
    }

    // 3. 强制绑定音乐播放器的歌单按钮和收起按钮
    function rebindMusicButtons() {
        var player = document.getElementById('player');
        if (!player) return;

        var listBtn = document.getElementById('list-btn');
        if (listBtn && !listBtn._rebound) {
            listBtn._rebound = true;
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
        if (minimizeBtn && !minimizeBtn._rebound) {
            minimizeBtn._rebound = true;
            minimizeBtn.onclick = function(e) {
                e.stopPropagation();
                player.classList.add('collapsed');
                var pl = document.getElementById('playlist');
                if (pl) pl.classList.remove('active');
            };
        }
    }

    // 4. 顶部按钮兜底
    function bindTopButtons() {
        var dgBtn = document.getElementById('daily-greeting-btn');
        if (dgBtn && !dgBtn._fixed) {
            dgBtn._fixed = true;
            dgBtn.onclick = function() {
                var modal = document.getElementById('daily-greeting-modal');
                if (modal) modal.classList.remove('hidden');
            };
        }
        var themeBtn = document.getElementById('theme-toggle');
        if (themeBtn && !themeBtn._fixed) {
            themeBtn._fixed = true;
            themeBtn.onclick = function() {
                if (typeof settings !== 'undefined') {
                    settings.isDarkMode = !settings.isDarkMode;
                    if (typeof updateUI === 'function') updateUI();
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

    // 执行
    setTimeout(bindTopButtons, 600);
    setTimeout(rebindSidebar, 1000);
    setTimeout(rebindMusicButtons, 1200);
    setTimeout(fixMoodModule, 2000);
})();
