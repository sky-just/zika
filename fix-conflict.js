// fix-conflict.js —— 最终精准版 v4
console.log('[fix-conflict] 最终精准版 v4 已加载！时间戳: 202605132400');

(function() {
    'use strict';

    // 0. 备份函数
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 1. 缺失函数定义
    if (typeof window.switchToAnnouncementPanel === 'undefined') {
        window.switchToAnnouncementPanel = function() {
            var listArea = document.getElementById('custom-replies-list');
            var annPanel = document.getElementById('announcement-panel');
            if (listArea) listArea.style.display = 'none';
            if (annPanel) annPanel.style.display = 'block';
        };
    }

    // 2. 顶部按钮
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

    // 3. 侧边栏精准修复
    function fixSidebar() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar || sidebar._taken) return;
        sidebar._taken = true;

        var newSidebar = sidebar.cloneNode(true);
        sidebar.parentNode.replaceChild(newSidebar, sidebar);

        newSidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;

            // 更新 UI
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

            // 设置正确的子选项卡
            window.currentMajorTab = major;
            window.currentSubTab = (major === 'reply') ? 'custom' : 'pokes';

            // 确保公告面板隐藏
            var annPanel = document.getElementById('announcement-panel');
            var listArea = document.getElementById('custom-replies-list');
            if (annPanel) annPanel.style.display = 'none';
            if (listArea) listArea.style.display = 'block';

            // 触发渲染
            if (typeof window.renderReplyLibrary === 'function') {
                window.renderReplyLibrary();
            }
        });

        // 默认触发一次回复库渲染
        setTimeout(function() {
            var replyBtn = newSidebar.querySelector('.sidebar-btn[data-major="reply"]');
            if (replyBtn) replyBtn.click();
        }, 300);
    }

    // 4. 音乐播放器精准修复
    function fixMusic() {
        var player = document.getElementById('player');
        if (!player || player._taken) return;
        player._taken = true;

        var playlist = document.getElementById('playlist');

        // 填充歌单
        function fillPlaylist() {
            if (!playlist) return;
            if (playlist.children.length > 0) return; // 已有内容，不重复填充
            var songs = [
                { name: '告白の夜', artist: 'Ayasa', url: 'https://music.163.com/song/media/outer/url?id=1382596689.mp3' },
                { name: '風の住む街', artist: '磯村由紀子', url: 'https://music.163.com/song/media/outer/url?id=22688479.mp3' },
                { name: 'River Flows In You', artist: 'Yiruma', url: 'https://music.163.com/song/media/outer/url?id=26237342.mp3' }
            ];
            playlist.innerHTML = songs.map(function(song, i) {
                return '<div class="playlist-item" data-url="' + song.url + '">' +
                    '<div class="song-info"><div class="song-title-row">' + song.name + '</div>' +
                    '<div class="song-sub-row">' + song.artist + '</div></div></div>';
            }).join('');
        }

        // 歌单按钮
        var listBtn = document.getElementById('list-btn');
        if (listBtn) {
            listBtn.onclick = function(e) {
                e.stopPropagation();
                fillPlaylist(); // 每次点击都确保歌单有内容
                var rect = player.getBoundingClientRect();
                playlist.style.position = 'fixed';
                playlist.style.left = rect.left + 'px';
                playlist.style.top = (rect.top + 155) + 'px';
                playlist.classList.toggle('active');
            };
        }

        // 收起按钮（已经好了，保留）
        var minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn && !minimizeBtn._fixed) {
            minimizeBtn._fixed = true;
            minimizeBtn.onclick = function(e) {
                e.stopPropagation();
                player.classList.add('collapsed');
                if (playlist) playlist.classList.remove('active');
            };
        }

        // 迷你窗口展开
        var miniView = document.getElementById('mini-view');
        if (miniView && !miniView._fixed) {
            miniView._fixed = true;
            miniView.onclick = function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            };
        }

        // 点击外部关闭歌单
        document.addEventListener('click', function(e) {
            if (playlist && playlist.classList.contains('active') &&
                !playlist.contains(e.target) &&
                !e.target.closest('#list-btn') &&
                !e.target.closest('#player')) {
                playlist.classList.remove('active');
            }
        });
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

    setTimeout(bindTopButtons, 600);
    setTimeout(fixSidebar, 1000);
    setTimeout(fixMusic, 1200);
    setTimeout(fixMoodModule, 2000);
})();
