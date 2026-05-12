// fix-conflict.js —— 最终完整版
console.log('[fix-conflict] 最终完整版已加载！时间戳: 20260514');

(function() {
    'use strict';

    // 备份函数
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 缺失函数定义
    if (typeof window.switchToAnnouncementPanel === 'undefined') {
        window.switchToAnnouncementPanel = function() {
            var listArea = document.getElementById('custom-replies-list');
            var annPanel = document.getElementById('announcement-panel');
            if (listArea) listArea.style.display = 'none';
            if (annPanel) annPanel.style.display = 'block';
        };
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

    // 手帐修复
    function fixMoodModule() {
        if (typeof initMoodListeners === 'function') {
            initMoodListeners();
            if (typeof renderMoodCalendar === 'function') renderMoodCalendar();
        } else {
            setTimeout(fixMoodModule, 500);
        }
    }

    // 音乐播放器兜底
    function musicFallback() {
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
                return '<div class="playlist-item" data-url="' + song.url + '">' +
                    '<div class="song-info"><div class="song-title-row">' + song.name + '</div>' +
                    '<div class="song-sub-row">' + song.artist + '</div></div></div>';
            }).join('');
        }

        var listBtn = document.getElementById('list-btn');
        if (listBtn && !listBtn._fixed) {
            listBtn._fixed = true;
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

        document.addEventListener('click', function(e) {
            if (playlist && playlist.classList.contains('active') &&
                !playlist.contains(e.target) &&
                !e.target.closest('#list-btn') &&
                !e.target.closest('#player')) {
                playlist.classList.remove('active');
            }
        });
    }

    // 独立内容管理面板
    window.openStandaloneManager = function() {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--secondary-bg);display:flex;flex-direction:column;';
        overlay.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-color);"><h3>内容管理</h3><button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;font-size:24px;color:var(--text-secondary);cursor:pointer;">✕</button></div>' +
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
            else if (tabId === 'atmosphere') content.innerHTML = '<h4>氛围感配置</h4><p>拍一拍、对方状态、格言等</p><p style="color:var(--text-secondary);">可通过原自定义回复管理。</p>';
            else if (tabId === 'announcement') content.innerHTML = '<h4>公告配置</h4><p style="color:var(--text-secondary);">可通过原自定义回复公告选项卡管理。</p>';
            else if (tabId === 'combo') {
                content.innerHTML = '<h4>组字卡管理</h4><button id="open-combo-btn" style="padding:10px 20px;background:var(--accent-color);color:white;border:none;border-radius:8px;cursor:pointer;">打开组字卡管理面板</button>';
                content.querySelector('#open-combo-btn').onclick = function() {
                    if (typeof openComboManager === 'function') openComboManager();
                };
            }
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

        overlay.querySelectorAll('.standalone-tab').forEach(function(btn) {
            btn.onclick = function() { switchTab(this.getAttribute('data-tab')); };
        });

        switchTab('replies');
    };

    // 执行
    setTimeout(bindTopButtons, 600);
    setTimeout(fixMoodModule, 2000);
    setTimeout(musicFallback, 1500);
})();
