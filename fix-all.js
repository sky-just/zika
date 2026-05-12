// fix-all.js —— 最终版（强力去重 + 音乐 + 备份 + 侧边栏）
(function() {
    'use strict';

    // 0. 备份函数空壳
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 1. 强力去重：用 MutationObserver 实时监控，删除任何异常的 "组字卡" 入口
    function startWatching() {
        const target = document.querySelector('#advanced-modal .settings-item-list');
        if (!target) return;

        const observer = new MutationObserver(function() {
            const allItems = document.querySelectorAll('#advanced-modal .settings-item');
            allItems.forEach(function(item) {
                if (item.textContent.trim() === '组字卡') {
                    const onclick = item.getAttribute('onclick') || '';
                    // 不是正确调用的，立即删除
                    if (!onclick.includes('openComboManager()')) {
                        item.remove();
                    }
                }
            });
        });

        observer.observe(target, { childList: true, subtree: true });
    }

    // 2. 音乐迷你窗口展开
    function fixMiniView() {
        const miniView = document.getElementById('mini-view');
        const player = document.getElementById('player');
        if (miniView && player && !miniView._fixedMusic) {
            miniView._fixedMusic = true;
            miniView.addEventListener('click', function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            });
        }
    }

    // 3. 音乐歌单强制绑定 + 歌单填充
    function forceBindListBtn() {
        const listBtn = document.getElementById('list-btn');
        const playlist = document.getElementById('playlist');
        const player = document.getElementById('player');
        if (!listBtn || !playlist || !player) return;
        if (listBtn._forceBound) return;
        listBtn._forceBound = true;

        const newBtn = listBtn.cloneNode(true);
        listBtn.parentNode.replaceChild(newBtn, listBtn);

        newBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const rect = player.getBoundingClientRect();
            playlist.style.position = 'fixed';
            playlist.style.left = rect.left + 'px';
            playlist.style.top = (rect.top + (player.classList.contains('collapsed') ? 62 : 150)) + 'px';
            playlist.classList.toggle('active');
        });

        // 拿你发给我的原始歌单数据兜底
        fillPlaylistOnce();
    }

    function fillPlaylistOnce() {
        const playlist = document.getElementById('playlist');
        if (!playlist || playlist._filled) return;
        playlist._filled = true;
        // 从你原始 listeners.js 里取的前几首
        const songs = [
            { title: 'ANSWER', sub: "들리니 I'm callin' you", url: 'https://files.catbox.moe/hzpr94.mp3' },
            { title: 'All I Have Is Love', sub: 'Feel the beating of my heart', url: 'http://music.163.com/song/media/outer/url?id=1940368.mp3' },
            { title: '第三个吻痕', sub: '非要做 贪心的坏人', url: 'https://img.heliar.top/file/1773902740144_下载您的文件_—_Convertio_1425997963.mp3' },
            { title: '小半', sub: '我的心借了你的光是明是暗', url: 'https://img.heliar.top/file/1772964128402_陈粒_-_小半.mp3' },
            { title: '当你', sub: '好喜欢你 知不知道', url: 'https://img.heliar.top/file/1772964503074_林俊杰_-_当你.mp3' },
            { title: '恶作剧', sub: '我想我会开始想念你', url: 'https://img.heliar.top/file/1772965264360_林依晨_-_恶作剧.mp3' }
        ];
        playlist.innerHTML = songs.map(function(s, i) {
            return '<div class="playlist-item" data-index="' + i + '" data-url="' + s.url + '">' +
                       '<div class="song-info">' +
                           '<div class="song-title-row">' + s.title + '</div>' +
                           '<div class="song-sub-row">' + s.sub + '</div>' +
                       '</div>' +
                   '</div>';
        }).join('');
        // 绑定点击播放
        playlist.querySelectorAll('.playlist-item').forEach(function(item) {
            item.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                if (url && typeof playSong === 'function') {
                    playSong(url, this.querySelector('.song-title-row').textContent);
                }
            });
        });
    }

    // 4. 侧边栏修复
    function fixSidebar() {
        const buttons = document.querySelectorAll('.modal-sidebar .sidebar-btn');
        buttons.forEach(function(btn) {
            if (btn._fixedSidebar) return;
            btn._fixedSidebar = true;
            btn.addEventListener('click', function() {
                buttons.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                const major = btn.getAttribute('data-major');
                if (major === 'announcement' && typeof window.switchToAnnouncementPanel === 'function') {
                    window.switchToAnnouncementPanel();
                }
                if (typeof window.renderReplyLibrary === 'function') {
                    window.currentMajorTab = major;
                    window.currentSubTab = 'custom';
                    window.renderReplyLibrary();
                }
            });
        });
    }

    // 启动监听
    startWatching();
    setTimeout(startWatching, 1000);
    setTimeout(startWatching, 3000);

    setTimeout(fixMiniView, 800);
    setTimeout(fixMiniView, 2000);
    setTimeout(forceBindListBtn, 1000);
    setTimeout(forceBindListBtn, 3000);
    setTimeout(fixSidebar, 1200);
    setTimeout(fixSidebar, 3500);
})();
