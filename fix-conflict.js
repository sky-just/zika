// fix-conflict.js —— 纯净独立版 (独立内容管理入口)
console.log('[fix-conflict] 纯净独立版已加载！');

(function() {
    'use strict';

    // 备份函数
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 函数定义
    if (typeof window.switchToAnnouncementPanel === 'undefined') {
        window.switchToAnnouncementPanel = function() {};
    }
    if (typeof window.renderReplyLibrary === 'undefined') {
        window.renderReplyLibrary = function() {};
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

    // 音乐播放器接管
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
        if (minimizeBtn && !minimizeBtn._fixed) {
            minimizeBtn._fixed = true;
            minimizeBtn.onclick = function(e) {
                e.stopPropagation();
                player.classList.add('collapsed');
                if (playlist) playlist.classList.remove('active');
            };
        }

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
    }

    // 独立的“内容管理”入口
    function injectStandaloneManager() {
        var target = document.querySelector('#advanced-modal .settings-item-list');
        if (!target || document.getElementById('standalone-manager-btn')) return;

        var entry = document.createElement('div');
        entry.id = 'standalone-manager-btn';
        entry.className = 'settings-item';
        entry.innerHTML = '<i class="fas fa-folder-open"></i><span>内容管理</span>';
        entry.onclick = function() {
            hideModal(document.getElementById('advanced-modal'));
            openStandaloneManager();
        };
        target.appendChild(entry);
    }

    window.openStandaloneManager = function() {
        var overlay = document.createElement('div');
        overlay.id = 'standalone-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--secondary-bg);display:flex;flex-direction:column;';

        overlay.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-color);"><h3>内容管理</h3><button onclick="document.getElementById(\'standalone-overlay\').remove()" style="background:none;border:none;font-size:24px;color:var(--text-secondary);cursor:pointer;">✕</button></div>' +
            '<div style="display:flex;flex:1;overflow:hidden;">' +
                '<div style="width:80px;border-right:1px solid var(--border-color);padding:10px 0;display:flex;flex-direction:column;gap:5px;">' +
                    '<button class="standalone-tab active" data-tab="replies" style="background:none;border:none;padding:12px 8px;font-size:14px;cursor:pointer;color:var(--accent-color);">字卡</button>' +
                    '<button class="standalone-tab" data-tab="atmosphere" style="background:none;border:none;padding:12px 8px;font-size:14px;cursor:pointer;color:var(--text-secondary);">氛围</button>' +
                    '<button class="standalone-tab" data-tab="announcement" style="background:none;border:none;padding:12px 8px;font-size:14px;cursor:pointer;color:var(--text-secondary);">公告</button>' +
                    '<button class="standalone-tab" data-tab="combo" style="background:none;border:none;padding:12px 8px;font-size:14px;cursor:pointer;color:var(--text-secondary);">组字</button>' +
                '</div>' +
                '<div id="standalone-content" style="flex:1;padding:15px;overflow-y:auto;"></div>' +
            '</div>';

        document.body.appendChild(overlay);

        function switchTab(tabId) {
            overlay.querySelectorAll('.standalone-tab').forEach(function(b) { b.classList.remove('active'); b.style.color = 'var(--text-secondary)'; });
            var activeBtn = overlay.querySelector('.standalone-tab[data-tab="' + tabId + '"]');
            if (activeBtn) { activeBtn.classList.add('active'); activeBtn.style.color = 'var(--accent-color)'; }

            var content = document.getElementById('standalone-content');
            if (tabId === 'replies') showRepliesTab(content);
            else if (tabId === 'atmosphere') showAtmosphereTab(content);
            else if (tabId === 'announcement') showAnnouncementTab(content);
            else if (tabId === 'combo') showComboTab(content);
        }

        function showRepliesTab(container) {
            var replies = (typeof customReplies !== 'undefined') ? customReplies : [];
            container.innerHTML = '<h4>字卡列表 (' + replies.length + '条)</h4><textarea id="new-reply-ta" style="width:100%;height:80px;margin:10px 0;padding:8px;border:1px solid var(--border-color);border-radius:8px;" placeholder="每行一条新字卡"></textarea><button id="add-replies-btn" style="padding:10px 20px;background:var(--accent-color);color:white;border:none;border-radius:8px;cursor:pointer;">批量添加</button><div id="reply-list" style="margin-top:15px;"></div>';
            renderReplyList(container.querySelector('#reply-list'));
            container.querySelector('#add-replies-btn').onclick = function() {
                var lines = container.querySelector('#new-reply-ta').value.split('\n').filter(function(l) { return l.trim(); });
                lines.forEach(function(line) { customReplies.push(line.trim()); });
                if (typeof throttledSaveData === 'function') throttledSaveData();
                container.querySelector('#new-reply-ta').value = '';
                renderReplyList(container.querySelector('#reply-list'));
            };
        }

        function renderReplyList(container) {
            var replies = (typeof customReplies !== 'undefined') ? customReplies : [];
            container.innerHTML = replies.map(function(r, i) {
                return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);"><span>' + r + '</span><button data-idx="' + i + '" style="color:red;background:none;border:none;cursor:pointer;">删除</button></div>';
            }).join('');
            container.querySelectorAll('button').forEach(function(btn) {
                btn.onclick = function() {
                    var idx = parseInt(this.getAttribute('data-idx'));
                    customReplies.splice(idx, 1);
                    if (typeof throttledSaveData === 'function') throttledSaveData();
                    renderReplyList(container);
                };
            });
        }

        function showAtmosphereTab(container) {
            container.innerHTML = '<h4>氛围感配置</h4><p>拍一拍、对方状态、格言等</p><p style="color:var(--text-secondary);">该功能可通过原自定义回复管理。</p>';
        }

        function showAnnouncementTab(container) {
            container.innerHTML = '<h4>公告配置</h4><p style="color:var(--text-secondary);">可通过原自定义回复公告选项卡管理。</p>';
        }

        function showComboTab(container) {
            container.innerHTML = '<h4>组字卡管理</h4><button id="open-combo-btn" style="padding:10px 20px;background:var(--accent-color);color:white;border:none;border-radius:8px;cursor:pointer;">打开组字卡管理面板</button>';
            container.querySelector('#open-combo-btn').onclick = function() {
                if (typeof openComboManager === 'function') openComboManager();
            };
        }

        overlay.querySelectorAll('.standalone-tab').forEach(function(btn) {
            btn.onclick = function() { switchTab(this.getAttribute('data-tab')); };
        });

        switchTab('replies');
    };

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
    setTimeout(takeOverMusic, 1200);
    setTimeout(injectStandaloneManager, 1500);
    setTimeout(fixMoodModule, 2000);
})();
