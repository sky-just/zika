// fix-urgent.js —— 终极手动修复 v2（强制声明 LIBRARY_CONFIG）
(function() {
    'use strict';

    // ===== 强制声明 LIBRARY_CONFIG（如果仍未定义） =====
    if (typeof window.LIBRARY_CONFIG === 'undefined') {
        window.LIBRARY_CONFIG = {
            reply: {
                title: "回复库管理",
                tabs: [
                    { id: 'custom', name: '主字卡', mode: 'list' },
                    { id: 'emojis', name: 'Emoji', mode: 'grid' },
                    { id: 'stickers', name: '表情库', mode: 'grid' }
                ]
            },
            atmosphere: {
                title: "氛围感配置",
                tabs: [
                    { id: 'pokes', name: '拍一拍', mode: 'list' },
                    { id: 'statuses', name: '对方状态', mode: 'list' },
                    { id: 'mottos', name: '顶部格言', mode: 'list' },
                    { id: 'intros', name: '开场动画', mode: 'list' }
                ]
            }
        };
    }

    // ===== 备份函数 =====
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // ===== 顶部按钮（保留） =====
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

    // ===== 侧边栏修复 =====
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

    // ===== 音乐迷你窗口 =====
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

    // ===== 手帐修复 =====
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

    // ===== 触发音乐播放器初始化 =====
    function tryInitMusic() {
        if (typeof initMusicPlayer === 'function') {
            initMusicPlayer();
        }
    }

    // 执行所有修复
    setTimeout(bindTopButtons, 500);
    setTimeout(bindSidebar, 1000);
    setTimeout(ensureMiniView, 800);
    setTimeout(fixMoodModule, 2000);
    setTimeout(tryInitMusic, 2500);
})();
