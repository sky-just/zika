// fix-conflict.js —— 最终回归版（只修侧边栏，不碰任何其他功能）
console.log('[fix-conflict] 最终回归版已加载！');

(function() {
    'use strict';

    // 缺失函数补全（防止 index2.html 的 onclick 报错）
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }
    if (typeof window.switchToAnnouncementPanel === 'undefined') {
        window.switchToAnnouncementPanel = function() {
            var listArea = document.getElementById('custom-replies-list');
            var annPanel = document.getElementById('announcement-panel');
            if (listArea) listArea.style.display = 'none';
            if (annPanel) annPanel.style.display = 'block';
        };
    }

    // 顶部按钮兜底
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

    // 核心：强制修复侧边栏的点击事件
    function forceFixSidebar() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar || sidebar._fixedSidebar) return;
        sidebar._fixedSidebar = true;

        // 移除所有旧事件（通过替换节点）
        var newSidebar = sidebar.cloneNode(true);
        sidebar.parentNode.replaceChild(newSidebar, sidebar);

        // 绑定新事件：点击后切换选项卡并渲染内容
        newSidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;

            // 更新样式
            newSidebar.querySelectorAll('.sidebar-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var major = btn.getAttribute('data-major');

            // 公告特殊处理
            if (major === 'announcement') {
                if (typeof window.switchToAnnouncementPanel === 'function') {
                    window.switchToAnnouncementPanel();
                }
                return;
            }

            // 设置全局状态变量
            window.currentMajorTab = major;
            window.currentSubTab = 'custom';

            // 确保公告面板隐藏，列表区域显示
            var annPanel = document.getElementById('announcement-panel');
            var listArea = document.getElementById('custom-replies-list');
            if (annPanel) annPanel.style.display = 'none';
            if (listArea) listArea.style.display = 'block';

            // 触发原生渲染函数
            if (typeof window.renderReplyLibrary === 'function') {
                window.renderReplyLibrary();
            }
        });

        // 默认触发一次回复库的渲染
        setTimeout(function() {
            var replyBtn = newSidebar.querySelector('.sidebar-btn[data-major="reply"]');
            if (replyBtn) replyBtn.click();
        }, 500);
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

    // 音乐播放器：完全不干预，让原生的 initMusicPlayer 自己运行
    // 只修复迷你窗口的展开/收起
    function fixMiniView() {
        var miniView = document.getElementById('mini-view');
        var player = document.getElementById('player');
        if (miniView && player && !miniView._fixed) {
            miniView._fixed = true;
            miniView.onclick = function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            };
        }
    }

    // 执行
    setTimeout(bindTopButtons, 600);
    setTimeout(forceFixSidebar, 1200);
    setTimeout(fixMoodModule, 2000);
    setTimeout(fixMiniView, 800);
})();
