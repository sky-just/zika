// fix-conflict.js —— 完全独立版 (不依赖 reply-library)
console.log('[fix-conflict] 完全独立版已加载！时间戳: 202605122200');

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

    // 2. 完全独立的侧边栏逻辑 (不再调用任何 reply-library 的函数)
    function setupIndependentSidebar() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar || sidebar._independentFixed) return;
        sidebar._independentFixed = true;

        sidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;

            // 更新 UI 样式
            sidebar.querySelectorAll('.sidebar-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var major = btn.getAttribute('data-major');
            var contentArea = document.getElementById('custom-replies-list');
            var announcementPanel = document.getElementById('announcement-panel');
            var titleEl = document.getElementById('cr-modal-title');

            // 根据点击的选项卡，切换内容和标题
            if (major === 'announcement') {
                // 显示公告面板
                if (contentArea) contentArea.style.display = 'none';
                if (announcementPanel) announcementPanel.style.display = 'block';
                if (titleEl) titleEl.textContent = '今日公告配置';
            } else {
                // 显示普通内容区，并根据选项卡显示不同提示
                if (announcementPanel) announcementPanel.style.display = 'none';
                if (contentArea) {
                    contentArea.style.display = 'block';
                    contentArea.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-secondary);">' +
                        (major === 'reply' ? '回复库' : '氛围感') + '内容区域<br><span style="font-size:12px;">请通过高级功能管理对应内容</span></div>';
                }
                if (titleEl) titleEl.textContent = major === 'reply' ? '回复库管理' : '氛围感配置';
            }
        });
    }

    // 3. 音乐播放器最后兜底（保留）
    function musicLastResort() {
        var playlist = document.getElementById('playlist');
        var listBtn = document.getElementById('list-btn');
        var player = document.getElementById('player');

        if (!playlist || !listBtn || !player) return;

        if (playlist.children.length === 0) {
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
            document.addEventListener('click', function(e) {
                if (playlist.classList.contains('active') &&
                    !playlist.contains(e.target) && !e.target.closest('#list-btn')) {
                    playlist.classList.remove('active');
                }
            });
        }
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
    setTimeout(setupIndependentSidebar, 1000);
    setTimeout(musicLastResort, 1500);
    setTimeout(fixMoodModule, 2000);
})();
