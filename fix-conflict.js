// fix-conflict.js —— 完全独立版 v2 (精准侧边栏 + 音乐兜底)
console.log('[fix-conflict] 完全独立版 v2 已加载！时间戳: 202605122300');

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

    // 2. 完全独立的侧边栏逻辑（内部维护状态）
    function setupIndependentSidebar() {
        var sidebar = document.querySelector('.modal-sidebar');
        if (!sidebar || sidebar._independentFixed) return;
        sidebar._independentFixed = true;

        // 内部状态
        var currentTab = 'reply'; // 默认在回复库
        var currentSubTab = 'custom'; // 默认子选项卡

        // 初始化：显示回复库的内容（尝试使用原库函数，如果失败就显示占位）
        tryShowReplyContent();

        sidebar.addEventListener('click', function(e) {
            var btn = e.target.closest('.sidebar-btn');
            if (!btn) return;

            // 更新按钮样式
            sidebar.querySelectorAll('.sidebar-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            // 获取点击的选项卡
            currentTab = btn.getAttribute('data-major');
            currentSubTab = 'custom'; // 重置子选项卡

            // 根据选项卡显示内容
            if (currentTab === 'announcement') {
                showAnnouncementPanel();
            } else {
                tryShowReplyContent();
            }
        });
    }

    function tryShowReplyContent() {
        var listArea = document.getElementById('custom-replies-list');
        var annPanel = document.getElementById('announcement-panel');
        var titleEl = document.getElementById('cr-modal-title');

        // 隐藏公告面板
        if (annPanel) annPanel.style.display = 'none';

        // 尝试使用原库函数渲染
        if (typeof window.renderReplyLibrary === 'function') {
            window.currentMajorTab = currentTab;
            window.currentSubTab = currentSubTab;
            try {
                window.renderReplyLibrary();
                return; // 成功，直接返回
            } catch(e) {
                console.warn('[fix-conflict] 原库渲染失败，使用占位内容:', e);
            }
        }

        // 备用占位内容
        if (listArea) {
            listArea.style.display = 'block';
            var tabName = currentTab === 'reply' ? '回复库' : '氛围感';
            listArea.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-secondary);">' +
                '<div style="font-size:48px;margin-bottom:16px;">📋</div>' +
                '<div style="font-size:16px;font-weight:600;margin-bottom:8px;">' + tabName + '</div>' +
                '<div style="font-size:12px;">内容正在加载中，或请通过下方按钮新增</div></div>';
        }
        if (titleEl) titleEl.textContent = currentTab === 'reply' ? '回复库管理' : '氛围感配置';
    }

    function showAnnouncementPanel() {
        var listArea = document.getElementById('custom-replies-list');
        var annPanel = document.getElementById('announcement-panel');
        var titleEl = document.getElementById('cr-modal-title');

        if (listArea) listArea.style.display = 'none';
        if (annPanel) annPanel.style.display = 'block';
        if (titleEl) titleEl.textContent = '今日公告配置';
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
