// fix-conflict.js —— 最终版（强制修复自定义回复 + 音乐兜底）
console.log('[fix-conflict] 最终版已加载！时间戳: 202605122100');

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

    // 自定义回复强制修复
    function forceFixReplies() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar) return;

        sidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;

            var major = btn.getAttribute('data-major');

            // 强制更新全局状态变量
            if (typeof window.currentMajorTab !== 'undefined') {
                window.currentMajorTab = major;
            }
            if (typeof window.currentSubTab !== 'undefined') {
                window.currentSubTab = 'custom';
            }

            // 重新渲染
            if (typeof window.renderReplyLibrary === 'function') {
                window.renderReplyLibrary();
            }

            // 额外保险：直接调用渲染函数
            if (major === 'announcement' && typeof window.switchToAnnouncementPanel === 'function') {
                window.switchToAnnouncementPanel();
            }
        });
    }

    // 音乐播放器最后兜底
    function musicLastResort() {
        var playlist = document.getElementById('playlist');
        var listBtn = document.getElementById('list-btn');
        var player = document.getElementById('player');

        if (!playlist || !listBtn || !player) return;

        // 如果歌单完全是空的，并且原生播放器似乎没初始化成功
        if (playlist.children.length === 0 && (typeof initMusicPlayer !== 'function' || player.classList.contains('no-init'))) {
            console.warn('[fix-conflict] 音乐播放器未成功加载，启用兜底歌单');
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

        // 确保歌单按钮能打开歌单
        if (!listBtn._fixMusic) {
            listBtn._fixMusic = true;
            listBtn.onclick = function(e) {
                e.stopPropagation();
                var rect = player.getBoundingClientRect();
                playlist.style.position = 'fixed';
                playlist.style.left = rect.left + 'px';
                playlist.style.top = (rect.top + 155) + 'px';
                playlist.classList.toggle('active');
            };

            // 点击外部关闭歌单
            document.addEventListener('click', function(e) {
                if (playlist.classList.contains('active') &&
                    !playlist.contains(e.target) && !e.target.closest('#list-btn')) {
                    playlist.classList.remove('active');
                }
            });
        }
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
    setTimeout(forceFixReplies, 1000);
    setTimeout(musicLastResort, 1500);
    setTimeout(fixMoodModule, 2000);
})();
