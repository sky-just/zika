// fix-all.js —— 纯净修复版（只修复音乐播放器）
(function() {
    'use strict';
    console.log('[fix-all] 纯净版已激活');

    // 音乐播放器修复（歌单数据 + 按钮逻辑）
    function fixMusicPlayer() {
        var player = document.getElementById('player');
        if (!player) return;

        var miniView = document.getElementById('mini-view');
        if (miniView && !miniView._fixedMusic) {
            miniView._fixedMusic = true;
            miniView.addEventListener('click', function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) player.classList.remove('collapsed');
            });
        }

        var playlist = document.getElementById('playlist');
        if (playlist && !playlist._fixedMusicData) {
            playlist._fixedMusicData = true;
            if (!playlist.innerHTML.trim() || playlist.children.length === 0) {
                var defaultSongs = [
                    { name: '告白の夜', artist: 'Ayasa', url: 'https://music.163.com/song/media/outer/url?id=1382596689.mp3' },
                    { name: '風の住む街', artist: '磯村由紀子', url: 'https://music.163.com/song/media/outer/url?id=22688479.mp3' },
                    { name: 'River Flows In You', artist: 'Yiruma', url: 'https://music.163.com/song/media/outer/url?id=26237342.mp3' }
                ];
                playlist.innerHTML = defaultSongs.map(function(song, index) {
                    return '<div class="playlist-item" data-index="' + index + '" data-url="' + song.url + '">' +
                               '<span class="playlist-item-title">' + song.name + '</span>' +
                               '<span class="playlist-item-artist">' + song.artist + '</span>' +
                           '</div>';
                }).join('');
                var items = playlist.querySelectorAll('.playlist-item');
                for (var i = 0; i < items.length; i++) {
                    items[i].addEventListener('click', function() {
                        var url = this.getAttribute('data-url');
                        var title = this.querySelector('.playlist-item-title').textContent;
                        if (url && typeof playSong === 'function') playSong(url, title);
                    });
                }
            }
            var listBtn = document.getElementById('list-btn');
            if (listBtn && !listBtn._fixedMusicList) {
                listBtn._fixedMusicList = true;
                listBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    playlist.classList.toggle('active');
                });
            }
        }

        var minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn && !minimizeBtn._fixedMusicMin) {
            minimizeBtn._fixedMusicMin = true;
            minimizeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                player.classList.add('collapsed');
                var pl = document.getElementById('playlist');
                if (pl) pl.classList.remove('active');
            });
        }
    }

    // 组字卡——不插手，由 index2.html 里的 onclick="openComboManager()" 直接处理
    function fixComboPanel() {}

    var observer = new MutationObserver(function() {
        fixMusicPlayer();
        fixComboPanel();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(function() { fixMusicPlayer(); fixComboPanel(); }, 1000);
    setTimeout(function() { fixMusicPlayer(); fixComboPanel(); }, 3000);

    console.log('[fix-all] 纯净版就绪');
})();
