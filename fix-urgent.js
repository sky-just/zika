// fix-urgent.js —— 终极紧急修复（强制绑定所有按钮）
(function() {
    'use strict';

    // === 1. 备份函数 ===
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // === 2. 强制绑定所有顶部按钮 ===
    function bindTopButtons() {
        // 公告按钮
        var dgBtn = document.getElementById('daily-greeting-btn');
        if (dgBtn) {
            dgBtn.onclick = function() {
                var modal = document.getElementById('daily-greeting-modal');
                if (modal) modal.classList.remove('hidden');
            };
        }

        // 公告关闭
        var dgClose = document.querySelector('.daily-greeting-close-btn');
        if (dgClose) {
            dgClose.onclick = function() {
                var modal = document.getElementById('daily-greeting-modal');
                if (modal) modal.classList.add('hidden');
            };
        }

        // 主题切换
        var themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.onclick = function() {
                if (typeof settings !== 'undefined') {
                    settings.isDarkMode = !settings.isDarkMode;
                    if (typeof updateUI === 'function') updateUI();
                }
            };
        }

        // 群聊
        var groupBtn = document.getElementById('group-chat-btn');
        if (groupBtn) {
            groupBtn.onclick = function() {
                var modal = document.getElementById('group-chat-modal');
                if (modal && typeof showModal === 'function') showModal(modal);
            };
        }
    }

    // === 3. 强制绑定音乐歌单按钮 ===
    function bindMusicList() {
        var listBtn = document.getElementById('list-btn');
        var playlist = document.getElementById('playlist');
        var player = document.getElementById('player');
        if (!listBtn || !playlist || !player) return;

        listBtn.onclick = function(e) {
            e.stopPropagation();
            var rect = player.getBoundingClientRect();
            playlist.style.position = 'fixed';
            playlist.style.left = rect.left + 'px';
            playlist.style.top = (rect.top + 155) + 'px';
            playlist.classList.toggle('active');
        };
    }

    // === 4. 侧边栏 ===
    function bindSidebar() {
        var buttons = document.querySelectorAll('.modal-sidebar .sidebar-btn');
        buttons.forEach(function(btn) {
            btn.onclick = function() {
                buttons.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var major = btn.getAttribute('data-major');
                if (major === 'announcement' && typeof window.switchToAnnouncementPanel === 'function') {
                    window.switchToAnnouncementPanel();
                }
                if (typeof window.renderReplyLibrary === 'function') {
                    window.currentMajorTab = major;
                    window.renderReplyLibrary();
                }
            };
        });
    }

    // === 5. 迷你窗口 ===
    function bindMiniView() {
        var miniView = document.getElementById('mini-view');
        var player = document.getElementById('player');
        if (miniView && player) {
            miniView.onclick = function() {
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            };
        }
    }

    // 多次执行，确保所有动态元素都绑上
    function runAll() {
        bindTopButtons();
        bindMusicList();
        bindSidebar();
        bindMiniView();
    }

    setTimeout(runAll, 800);
    setTimeout(runAll, 2000);
    setTimeout(runAll, 4000);
    // === 6. 强制重新初始化手帐模块 ===
function fixMoodModule() {
    // 等待 mood.js 完全加载
    if (typeof initMoodListeners === 'function') {
        initMoodListeners();
        if (typeof renderMoodCalendar === 'function') {
            renderMoodCalendar();
        }
    } else {
        // 如果还没加载，等 500ms 再试
        setTimeout(fixMoodModule, 500);
    }
}

// 延迟触发，确保所有 JS 文件已加载
setTimeout(fixMoodModule, 2000);
})();
