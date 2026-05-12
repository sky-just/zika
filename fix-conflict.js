// fix-conflict.js —— 终极修复 v3 (全局配置 + 音乐兜底)
console.log('[fix-conflict] v3 已加载！时间戳: 202605122000');

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

    // 音乐播放器兜底数据 + 歌单按钮
    function fixMusicPlayer() {
        var player = document.getElementById('player');
        if (!player) return;

        // 迷你窗口展开
        var miniView = document.getElementById('mini-view');
        if (miniView && !miniView._fixed) {
            miniView._fixed = true;
            miniView.onclick = function() {
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            };
        }

        // 歌单按钮强制绑定
        var listBtn = document.getElementById('list-btn');
        var playlist = document.getElementById('playlist');
        if (listBtn && playlist && !listBtn._fixMusic) {
            listBtn._fixMusic = true;
            listBtn.onclick = function(e) {
                e.stopPropagation();
                var rect = player.getBoundingClientRect();
                playlist.style.position = 'fixed';
                playlist.style.left = rect.left + 'px';
                playlist.style.top = (rect.top + 155) + 'px';
                playlist.classList.toggle('active');
            };

            // 如果歌单为空，填充一些默认歌曲
            if (playlist.children.length === 0) {
                var songs = [
                    { name: '告白の夜', artist: 'Ayasa', url: 'https://music.163.com/song/media/outer/url?id=1382596689.mp3' },
                    { name: '風の住む街', artist: '磯村由紀子', url: 'https://music.163.com/song/media/outer/url?id=22688479.mp3' },
                    { name: 'River Flows In You', artist: 'Yiruma', url: 'https://music.163.com/song/media/outer/url?id=26237342.mp3' }
                ];
                playlist.innerHTML = songs.map(function(song, i) {
                    return '<div class="playlist-item" data-index="' + i + '" data-url="' + song.url + '">' +
                               '<div class="song-info"><div class="song-title-row">' + song.name + '</div>' +
                               '<div class="song-sub-row">' + song.artist + '</div></div></div>';
                }).join('');
            }
        }

        // 点击外部关闭歌单
        document.addEventListener('click', function(e) {
            if (playlist && playlist.classList.contains('active') &&
                !playlist.contains(e.target) && !e.target.closest('#list-btn')) {
                playlist.classList.remove('active');
            }
        });
    }

    // 侧边栏修复
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

    // 手帐修复
    function fixMoodModule() {
        if (typeof initMoodListeners === 'function') {
            initMoodListeners();
            if (typeof renderMoodCalendar === 'function') renderMoodCalendar();
        } else {
            setTimeout(fixMoodModule, 500);
        }
    }

    setTimeout(bindTopButtons, 600);
    setTimeout(fixMusicPlayer, 1000);
    setTimeout(bindSidebar, 1200);
    setTimeout(fixMoodModule, 2000);
})();
