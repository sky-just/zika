// fix-urgent.js —— 最终修复版（手帐 + 音乐 + 侧边栏 + 顶部按钮）
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

    // 侧边栏强制修复
    function bindSidebar() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar || sidebar._fixed) return;
        sidebar._fixed = true;
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

    // 音乐播放器
    function forceMusicInit() {
        if (typeof initMusicPlayer === 'function') {
            initMusicPlayer();
        }
    }

    // 音乐迷你窗口
    function ensureMiniView() {
        var miniView = document.getElementById('mini-view');
        var player = document.getElementById('player');
        if (miniView && player && !miniView._fixed) {
            miniView._fixed = true;
            miniView.onclick = function() {
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            };
        }
    }

    // 手帐修复
    function fixMoodModule() {
        if (typeof initMoodListeners === 'function') {
            initMoodListeners();
            if (typeof renderMoodCalendar === 'function') {
                renderMoodCalendar();
            }
        } else {
            setTimeout(fixMoodModule, 500);
        }
    }

    // 重新注入侧边栏组字卡选项卡
    function reInjectComboTab() {
        if (typeof initComboCardTab === 'function') {
            initComboCardTab();
        }
    }

    setTimeout(bindTopButtons, 500);
    setTimeout(bindSidebar, 1000);
    setTimeout(forceMusicInit, 1500);
    setTimeout(ensureMiniView, 800);
    setTimeout(fixMoodModule, 2000);
    setTimeout(reInjectComboTab, 2500);
})();
