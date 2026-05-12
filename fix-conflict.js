// fix-conflict.js —— 最终完整版 v3（包含 switchToAnnouncementPanel）
console.log('[fix-conflict] 最终完整版 v3 已加载！时间戳: 202605132300');

(function() {
    'use strict';

    // 0. 备份函数
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // ★★★ 定义缺失的 switchToAnnouncementPanel ★★★
    if (typeof window.switchToAnnouncementPanel === 'undefined') {
        window.switchToAnnouncementPanel = function() {
            var listArea = document.getElementById('custom-replies-list');
            var annPanel = document.getElementById('announcement-panel');
            if (listArea) listArea.style.display = 'none';
            if (annPanel) annPanel.style.display = 'block';
        };
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

    // 2. 完全接管侧边栏
    function takeOverSidebar() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar || sidebar._taken) return;
        sidebar._taken = true;

        var newSidebar = sidebar.cloneNode(true);
        sidebar.parentNode.replaceChild(newSidebar, sidebar);

        newSidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;

            newSidebar.querySelectorAll('.sidebar-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var major = btn.getAttribute('data-major');

            if (major === 'announcement' && typeof window.switchToAnnouncementPanel === 'function') {
                window.switchToAnnouncementPanel();
                return;
            }

            window.currentMajorTab = major;
            window.currentSubTab = 'custom';

            if (typeof window.renderReplyLibrary === 'function') {
                window.renderReplyLibrary();
            }
        });
    }

    // 3. 完全接管音乐播放器
    function takeOverMusic() {
        var player = document.getElementById('player');
        if (!player || player._taken) return;
        player._taken = true;

        var playlist = document.getElementById('playlist');
        if (playlist && playlist.children.length === 0) {
            var songs = [
                { name: '告白の夜', artist: 'Ayasa', url: 'https://music.163.com/song/media/outer/url?id=1382596689.mp3' },
                { name: '風の住む街', artist: '磯村由紀子', url: 'https://music.163.com/song/media/outer/url?id=22688479.mp3' },
                { name: 'River Flows In You', artist: 'Yiruma', url: 'https://music.163.com/song/media/outer/url?id=26237342.mp3' }
            ];
            playlist.innerHTML = songs.map(function(song, i) {
                return '<div class="playlist-item" data-url="' + song.url + '"><div class="song-info"><div class="song-title-row">' + song.name + '</div><div class="song-sub-row">' + song.artist + '</div></div></div>';
            }).join('');
        }

        var listBtn = document.getElementById('list-btn');
        if (listBtn) {
            listBtn.onclick = function(e) {
                e.stopPropagation();
                var rect = player.getBoundingClientRect();
                playlist.style.position = 'fixed';
                playlist.style.left = rect.left + 'px';
                playlist.style.top = (rect.top + 155) + 'px';
                playlist.classList.toggle('active');
            };
        }

        var minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.onclick = function(e) {
                e.stopPropagation();
                player.classList.add('collapsed');
                if (playlist) playlist.classList.remove('active');
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

        document.addEventListener('click', function(e) {
            if (playlist && playlist.classList.contains('active') &&
                !playlist.contains(e.target) &&
                !e.target.closest('#list-btn') &&
                !e.target.closest('#player')) {
                playlist.classList.remove('active');
            }
        });
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

    setTimeout(bindTopButtons, 600);
    setTimeout(takeOverSidebar, 1000);
    setTimeout(takeOverMusic, 1200);
    setTimeout(fixMoodModule, 2000);
})();
