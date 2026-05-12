// fix-conflict.js —— 最终纯净版
console.log('[fix-conflict] 最终纯净版已加载！');

(function() {
    'use strict';

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

    function fixMoodModule() {
        if (typeof initMoodListeners === 'function') {
            initMoodListeners();
            if (typeof renderMoodCalendar === 'function') renderMoodCalendar();
        } else {
            setTimeout(fixMoodModule, 500);
        }
    }

    function fixMusicPlayer() {
        var player = document.getElementById('player');
        if (!player) return;
        var miniView = document.getElementById('mini-view');
        if (miniView && !miniView._fixMusic) {
            miniView._fixMusic = true;
            miniView.onclick = function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) player.classList.remove('collapsed');
            };
        }
        var minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn && !minimizeBtn._fixMusic) {
            minimizeBtn._fixMusic = true;
            minimizeBtn.onclick = function(e) {
                e.stopPropagation();
                player.classList.add('collapsed');
                var pl = document.getElementById('playlist');
                if (pl) pl.classList.remove('active');
            };
        }
    }

    setTimeout(bindTopButtons, 600);
    setTimeout(fixMoodModule, 2000);
    setTimeout(fixMusicPlayer, 800);
})();
