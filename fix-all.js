// fix-all.js —— 终极修复补丁 v3
(function() {
    'use strict';
    console.log('[fix-all] 终极补丁 v3 已激活');

    // ===========================
    // 1. 音乐播放器修复
    // ===========================
    function fixMusicPlayer() {
        var player = document.getElementById('player');
        if (!player) return;

        var miniView = document.getElementById('mini-view');
        if (miniView && !miniView._fixedMusic) {
            miniView._fixedMusic = true;
            miniView.addEventListener('click', function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
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

    // ===========================
    // 2. 组字卡面板修复（核心改动）
    // ===========================
    function fixComboPanel() {
        function refreshComboList() {
            var list = document.getElementById('combo-list-inner');
            if (!list) return;
            var cards = window.comboCards || [];
            if (cards.length === 0) {
                list.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:1em;">还没有组合，点击上方「+ 新建」添加</div>';
                return;
            }
            list.innerHTML = cards.map(function(combo, i) {
                return '<div class="combo-item" data-index="' + i + '">' +
                           '<span class="combo-name">' + combo.name + '</span>' +
                           '<span class="combo-preview">' + combo.items.join(combo.separator || ' ') + '</span>' +
                       '</div>';
            }).join('');
        }

        if (!window.comboCards || !Array.isArray(window.comboCards)) {
            try {
                var saved = localStorage.getItem('comboCards');
                window.comboCards = saved ? JSON.parse(saved) : [];
            } catch (e) { window.comboCards = []; }
        }

        // ★★★ 核心：每隔一段时间检查页面，如果发现空白组字卡页，自动替换为管理面板 ★★★
        setInterval(function() {
            // 查找所有可能是"空白组字卡内容区"的容器
            var containers = document.querySelectorAll('.combo-blank, #combo-content, .tab-content-combo, [data-tab="combo"], .subpage-combo');
            for (var i = 0; i < containers.length; i++) {
                var c = containers[i];
                // 如果这个容器可见，且内部没有 combo-panel
                if (c.offsetParent !== null || window.getComputedStyle(c).display !== 'none') {
                    var panel = document.getElementById('combo-panel');
                    if (panel && !c.contains(panel)) {
                        // 隐藏空白容器，显示管理面板
                        c.innerHTML = '';
                        c.appendChild(panel);
                        panel.style.display = 'block';
                        refreshComboList();
                    }
                }
            }
            // 同时也直接检查 combo-panel 是否被 display:none 隐藏了
            var panel = document.getElementById('combo-panel');
            if (panel && panel.style.display === 'none') {
                // 可能是被某些代码隐藏了，强制显示
                panel.style.display = 'block';
                refreshComboList();
            }
        }, 600);

        // 新建按钮
        var addBtn = document.getElementById('add-combo-inner-btn');
        if (addBtn && !addBtn._fixedCombo) {
            addBtn._fixedCombo = true;
            addBtn.addEventListener('click', function() {
                if (!window.comboCards) window.comboCards = [];
                window.comboCards.push({
                    id: Date.now(),
                    name: '新组合 ' + (window.comboCards.length + 1),
                    items: ['字卡A', '字卡B'],
                    separator: ' '
                });
                try { localStorage.setItem('comboCards', JSON.stringify(window.comboCards)); } catch(e) {}
                if (typeof throttledSaveData === 'function') throttledSaveData();
                if (typeof showNotification === 'function') showNotification('新组合已添加', 'success');
                refreshComboList();
            });
        }

        // 开关按钮
        var toggle = document.getElementById('combo-enable-toggle');
        if (toggle && !toggle._fixedComboToggle) {
            toggle._fixedComboToggle = true;
            toggle.addEventListener('change', function() {
                window.comboCardsEnabled = this.checked;
                if (typeof throttledSaveData === 'function') throttledSaveData();
            });
        }

        refreshComboList();
    }

    // ===========================
    // 3. 观察者 + 延迟执行
    // ===========================
    var observer = new MutationObserver(function() {
        fixMusicPlayer();
        fixComboPanel();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(function() { fixMusicPlayer(); fixComboPanel(); }, 1000);
    setTimeout(function() { fixMusicPlayer(); fixComboPanel(); }, 3000);

    console.log('[fix-all] 补丁 v3 就绪');
})();
