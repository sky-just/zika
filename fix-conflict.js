// fix-conflict.js —— 最终桥梁版（只负责正确触发原生函数）
console.log('[fix-conflict] 最终桥梁版已加载！时间戳: 202605132000');

(function() {
    'use strict';

    // 0. 备份函数
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 1. 顶部按钮
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

    // 2. 侧边栏桥梁 —— 唯一任务：正确切换 currentMajorTab 并触发原生渲染
    function createSidebarBridge() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar || sidebar._bridgeFixed) return;
        sidebar._bridgeFixed = true;

        sidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;

            // 更新按钮样式
            sidebar.querySelectorAll('.sidebar-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            // 获取选项卡 ID
            var major = btn.getAttribute('data-major');

            // 公告特殊处理
            if (major === 'announcement' && typeof window.switchToAnnouncementPanel === 'function') {
                window.switchToAnnouncementPanel();
                return;
            }

            // 强制更新全局状态变量（这些变量是原生函数正确渲染的前提）
            if (typeof window.currentMajorTab !== 'undefined') {
                window.currentMajorTab = major;
            }
            if (typeof window.currentSubTab !== 'undefined') {
                window.currentSubTab = 'custom'; // 默认显示第一个子选项卡
            }

            // 触发原生渲染
            if (typeof window.renderReplyLibrary === 'function') {
                window.renderReplyLibrary();
            }
        });
    }

    // 3. 音乐播放器桥梁 —— 唯一任务：确保原生 initMusicPlayer 被执行
    function createMusicBridge() {
        var player = document.getElementById('player');
        if (!player) return;

        // 如果播放器已经初始化成功，就不要再干预
        var playlist = document.getElementById('playlist');
        if (playlist && playlist.children.length > 0) return;

        // 尝试执行原生初始化，最多重试5次
        var retries = 0;
        var maxRetries = 5;
        function tryInit() {
            if (retries >= maxRetries) return;
            retries++;
            if (typeof initMusicPlayer === 'function') {
                initMusicPlayer();
            } else {
                setTimeout(tryInit, 800);
            }
        }
        setTimeout(tryInit, 500);
    }

    // 4. 手帐修复
    function fixMoodModule() {
        if (typeof initMoodListeners === 'function') {
            initMoodListeners();
            if (typeof renderMoodCalendar === 'function') renderMoodCalendar();
        } else {
            setTimeout(fixMoodModule, 500);
        }
    }

    // 执行所有桥梁
    setTimeout(bindTopButtons, 600);
    setTimeout(createSidebarBridge, 800);
    setTimeout(createMusicBridge, 1200);
    setTimeout(fixMoodModule, 2000);
})();
