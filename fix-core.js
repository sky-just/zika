// fix-core.js —— 最终稳定版
console.log('[fix-core] 最终稳定版已加载！');

(function() {
    'use strict';

    // 0. 缺失函数定义
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }
    if (typeof window.switchToAnnouncementPanel === 'undefined') {
        window.switchToAnnouncementPanel = function() {
            var list = document.getElementById('custom-replies-list');
            var ann = document.getElementById('announcement-panel');
            if (list) list.style.display = 'none';
            if (ann) ann.style.display = 'block';
        };
    }

    // 1. 顶部按钮
    function bindTopButtons() {
        var dg = document.getElementById('daily-greeting-btn');
        if (dg && !dg._fixed) {
            dg._fixed = true;
            dg.onclick = function() {
                var m = document.getElementById('daily-greeting-modal');
                if (m) m.classList.remove('hidden');
            };
        }
        var theme = document.getElementById('theme-toggle');
        if (theme && !theme._fixed) {
            theme._fixed = true;
            theme.onclick = function() {
                if (typeof settings !== 'undefined') {
                    settings.isDarkMode = !settings.isDarkMode;
                    if (typeof updateUI === 'function') updateUI();
                }
            };
        }
    }

    // 2. 接管侧边栏（确保点击有反应且不混乱）
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

            // 公告
            if (major === 'announcement') {
                if (typeof window.switchToAnnouncementPanel === 'function') {
                    window.switchToAnnouncementPanel();
                }
                return;
            }

            // 设置正确的子选项卡
            window.currentMajorTab = major;
            if (major === 'reply') {
                window.currentSubTab = 'custom';
            } else if (major === 'atmosphere') {
                window.currentSubTab = 'pokes';
            }

            var list = document.getElementById('custom-replies-list');
            var ann = document.getElementById('announcement-panel');
            if (list) list.style.display = '';
            if (ann) ann.style.display = 'none';

            if (typeof renderReplyLibrary === 'function') {
                renderReplyLibrary();
            }
        });
    }

    // 3. 接管新增按钮
    function takeOverAddButton() {
        var addBtn = document.getElementById('add-custom-reply');
        if (!addBtn || addBtn._taken) return;
        addBtn._taken = true;

        var newAdd = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newAdd, addBtn);

        newAdd.addEventListener('click', function() {
            var input = prompt('请输入新字卡或拍一拍内容:');
            if (input && input.trim()) {
                if (typeof customReplies !== 'undefined') {
                    customReplies.push(input.trim());
                }
                if (typeof throttledSaveData === 'function') throttledSaveData();
                if (typeof renderReplyLibrary === 'function') renderReplyLibrary();
                if (typeof showNotification === 'function') showNotification('内容已添加', 'success');
            }
        });
    }

    // 4. 音乐播放器
    function fixMusicPlayer() {
        var player = document.getElementById('player');
        if (!player || player._fixCore) return;
        player._fixCore = true;

        setTimeout(function() {
            var playlist = document.getElementById('playlist');
            if (playlist && playlist.children.length === 0) {
                var songs = [
                    { name: '告白の夜', artist: 'Ayasa', url: 'https://music.163.com/song/media/outer/url?id=1382596689.mp3' },
                    { name: '風の住む街', artist: '磯村由紀子', url: 'https://music.163.com/song/media/outer/url?id=22688479.mp3' },
                    { name: 'River Flows In You', artist: 'Yiruma', url: 'https://music.163.com/song/media/outer/url?id=26237342.mp3' }
                ];
                playlist.innerHTML = songs.map(function(song) {
                    return '<div class="playlist-item" data-url="' + song.url + '"><div class="song-info"><div class="song-title-row">' + song.name + '</div><div class="song-sub-row">' + song.artist + '</div></div></div>';
                }).join('');
            }
        }, 1500);

        var listBtn = document.getElementById('list-btn');
        if (listBtn) {
            listBtn.onclick = function(e) {
                e.stopPropagation();
                var playlist = document.getElementById('playlist');
                if (playlist) {
                    var rect = player.getBoundingClientRect();
                    playlist.style.position = 'fixed';
                    playlist.style.left = rect.left + 'px';
                    playlist.style.top = (rect.top + 155) + 'px';
                    playlist.classList.toggle('active');
                }
            };
        }

        var minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.onclick = function(e) {
                e.stopPropagation();
                player.classList.add('collapsed');
                var pl = document.getElementById('playlist');
                if (pl) pl.classList.remove('active');
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
    setTimeout(takeOverSidebar, 1000);
    setTimeout(takeOverAddButton, 1200);
    setTimeout(fixMusicPlayer, 1500);
    setTimeout(fixMoodModule, 2000);
})();
