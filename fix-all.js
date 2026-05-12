// fix-all.js —— 终极手动修复
(function() {
    'use strict';

    // ======== 备份函数空壳 ========
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // ======== 手动绑定所有顶部按钮 ========
    function fixAllTopButtons() {
        // 公告按钮
        var dailyGreetingBtn = document.getElementById('daily-greeting-btn');
        if (dailyGreetingBtn && !dailyGreetingBtn._fixed) {
            dailyGreetingBtn._fixed = true;
            dailyGreetingBtn.addEventListener('click', function() {
                var modal = document.getElementById('daily-greeting-modal');
                if (modal) {
                    modal.classList.remove('hidden');
                }
            });
        }

        // 公告关闭按钮 (在公告卡片内)
        var dailyCloseBtn = document.querySelector('.daily-greeting-close-btn');
        if (dailyCloseBtn && !dailyCloseBtn._fixed) {
            dailyCloseBtn._fixed = true;
            dailyCloseBtn.addEventListener('click', function() {
                var modal = document.getElementById('daily-greeting-modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
                localStorage.setItem('dailyGreetingShown', new Date().toDateString());
            });
        }

        // 主题切换
        var themeToggle = document.getElementById('theme-toggle');
        if (themeToggle && !themeToggle._fixed) {
            themeToggle._fixed = true;
            themeToggle.addEventListener('click', function() {
                if (typeof settings !== 'undefined') {
                    settings.isDarkMode = !settings.isDarkMode;
                    if (typeof updateUI === 'function') updateUI();
                    if (typeof throttledSaveData === 'function') throttledSaveData();
                }
            });
        }

        // 群聊按钮
        var groupChatBtn = document.getElementById('group-chat-btn');
        if (groupChatBtn && !groupChatBtn._fixed) {
            groupChatBtn._fixed = true;
            groupChatBtn.addEventListener('click', function() {
                var modal = document.getElementById('group-chat-modal');
                if (modal && typeof showModal === 'function') showModal(modal);
            });
        }

        // 设置按钮 (已经存在，但确保关闭也正常)
        var closeAdvanced = document.getElementById('close-advanced');
        if (closeAdvanced && !closeAdvanced._fixed) {
            closeAdvanced._fixed = true;
            closeAdvanced.addEventListener('click', function() {
                var modal = document.getElementById('advanced-modal');
                if (modal && typeof hideModal === 'function') hideModal(modal);
            });
        }
        var cancelSettings = document.getElementById('cancel-settings');
        if (cancelSettings && !cancelSettings._fixed) {
            cancelSettings._fixed = true;
            cancelSettings.addEventListener('click', function() {
                var modal = document.getElementById('settings-modal');
                if (modal && typeof hideModal === 'function') hideModal(modal);
            });
        }
    }

    // ======== 修复音乐悬浮器歌单按钮 ========
    function fixMusicListBtn() {
        var listBtn = document.getElementById('list-btn');
        var playlist = document.getElementById('playlist');
        var player = document.getElementById('player');
        if (!listBtn || !playlist || !player) return;
        if (listBtn._musicFixed) return;
        listBtn._musicFixed = true;

        // 直接用新按钮替换，确保干净
        var newBtn = listBtn.cloneNode(true);
        listBtn.parentNode.replaceChild(newBtn, listBtn);

        newBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var rect = player.getBoundingClientRect();
            playlist.style.position = 'fixed';
            playlist.style.left = rect.left + 'px';
            playlist.style.top = (rect.top + 155) + 'px';
            playlist.classList.toggle('active');
        });

        // 点击外部关闭歌单
        document.addEventListener('click', function(e) {
            if (playlist.classList.contains('active') &&
                !playlist.contains(e.target) &&
                !e.target.closest('#list-btn')) {
                playlist.classList.remove('active');
            }
        });
    }

    // ======== 修复自定义回复侧边栏 ========
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

    // ======== 修复音乐迷你窗口展开 ========
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

    // 延迟执行，确保 DOM 已就绪
    setTimeout(fixAllTopButtons, 500);
    setTimeout(fixMusicListBtn, 1000);
    setTimeout(fixSidebar, 1200);
    setTimeout(fixMiniView, 800);

    // 额外二次保险
    setTimeout(fixAllTopButtons, 2000);
    setTimeout(fixMusicListBtn, 2500);
    setTimeout(fixSidebar, 3000);
})();
