// fix-conflict.js —— 终极修复 + 缓存验证
console.log('[fix-conflict] 新修复文件已成功加载！时间戳: 202605121900');

(function() {
    'use strict';

    // 备份函数
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 顶部按钮
    function bindTopButtons() {
        var dgBtn = document.getElementById('daily-greeting-btn');
        if (dgBtn && !dgBtn._fixed) {
            dgBtn._fixed = true;
            dgBtn.onclick = function() {
                var modal = document.getElementById('daily-greeting-modal');
                if (modal) modal.classList.remove('hidden');
            };
        }
        var dgClose = document.querySelector('.daily-greeting-close-btn');
        if (dgClose && !dgClose._fixed) {
            dgClose._fixed = true;
            dgClose.onclick = function() {
                var modal = document.getElementById('daily-greeting-modal');
                if (modal) modal.classList.add('hidden');
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
        var groupBtn = document.getElementById('group-chat-btn');
        if (groupBtn && !groupBtn._fixed) {
            groupBtn._fixed = true;
            groupBtn.onclick = function() {
                var modal = document.getElementById('group-chat-modal');
                if (modal && typeof showModal === 'function') showModal(modal);
            };
        }
    }

    // 音乐播放器初始化（带重试）
    function initMusicWithRetry(attempts) {
        if (attempts === undefined) attempts = 0;
        if (attempts > 5) {
            console.warn('[fix-conflict] 音乐播放器初始化重试已达上限');
            return;
        }
        if (typeof initMusicPlayer === 'function') {
            console.log('[fix-conflict] 正在初始化音乐播放器，尝试次数:', attempts + 1);
            initMusicPlayer();
        } else {
            console.warn('[fix-conflict] initMusicPlayer 尚未就绪，1000ms后重试...');
            setTimeout(function() { initMusicWithRetry(attempts + 1); }, 1000);
        }
    }

    // 侧边栏修复（带重试）
    function bindSidebarWithRetry(attempts) {
        if (attempts === undefined) attempts = 0;
        if (attempts > 5) return;
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar) {
            setTimeout(function() { bindSidebarWithRetry(attempts + 1); }, 800);
            return;
        }
        if (sidebar._fixed) return;
        sidebar._fixed = true;
        console.log('[fix-conflict] 侧边栏事件已绑定');
        sidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;
            var buttons = sidebar.querySelectorAll('.sidebar-btn');
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
    }

    // 手帐修复
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
    setTimeout(function() { initMusicWithRetry(0); }, 1200);
    setTimeout(function() { bindSidebarWithRetry(0); }, 1000);
    setTimeout(fixMoodModule, 2000);
})();
