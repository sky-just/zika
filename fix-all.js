// fix-all.js —— 终极修复补丁
(function() {
    'use strict';
    console.log('[fix-all] 终极补丁已激活');

    // 1. 修复音乐播放器
    function fixMusicPlayer() {
        var player = document.getElementById('player');
        if (!player) return;

        // ---- 展开按钮（修复大小写错误 + 逻辑增强） ----
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

        // ---- 歌单数据填充（解决空白问题） ----
        var playlist = document.getElementById('playlist');
        if (playlist && !playlist._fixedMusicData) {
            playlist._fixedMusicData = true;

            // 如果歌单为空，写入默认歌曲
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

                // 绑定点击播放事件
                var items = playlist.querySelectorAll('.playlist-item');
                for (var i = 0; i < items.length; i++) {
                    items[i].addEventListener('click', function() {
                        var url = this.getAttribute('data-url');
                        var title = this.querySelector('.playlist-item-title').textContent;
                        if (url && typeof playSong === 'function') {
                            playSong(url, title);
                        }
                    });
                }
            }

            // ---- 歌单展开/收起按钮 ----
            var listBtn = document.getElementById('list-btn');
            if (listBtn && !listBtn._fixedMusicList) {
                listBtn._fixedMusicList = true;
                listBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    playlist.classList.toggle('active');
                });
            }
        }

        // ---- 收起按钮 ----
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

    // 2. 修复组字卡面板按钮
    function fixComboPanel() {
        // ---- 内部函数：刷新列表 ----
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

        // ---- 从本地存储恢复数据 ----
        if (!window.comboCards || !Array.isArray(window.comboCards)) {
            try {
                var saved = localStorage.getItem('comboCards');
                window.comboCards = saved ? JSON.parse(saved) : [];
            } catch (e) {
                window.comboCards = [];
            }
        }

        // ---- 面板出现时自动刷新 ----
        var panel = document.getElementById('combo-panel');
        if (panel && !panel._fixedComboRefresh) {
            panel._fixedComboRefresh = true;
            var panelObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.target.style.display !== 'none') {
                        refreshComboList();
                    }
                });
            });
            panelObserver.observe(panel, { attributes: true, attributeFilter: ['style'] });
        }

        // ---- 新建按钮 ----
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
                try {
                    localStorage.setItem('comboCards', JSON.stringify(window.comboCards));
                } catch (e) {}
                if (typeof throttledSaveData === 'function') throttledSaveData();
                if (typeof showNotification === 'function') showNotification('新组合已添加', 'success');
                refreshComboList(); // 立即刷新列表，这才是关键
            });
        }

        // ---- 开关按钮 ----
        var toggle = document.getElementById('combo-enable-toggle');
        if (toggle && !toggle._fixedComboToggle) {
            toggle._fixedComboToggle = true;
            toggle.addEventListener('change', function() {
                window.comboCardsEnabled = this.checked;
                if (typeof throttledSaveData === 'function') throttledSaveData();
            });
        }

        // 首次刷新列表
        refreshComboList();
    }

    // 3. 使用 MutationObserver 监听 DOM 变化，自动修复新出现的元素
    var observer = new MutationObserver(function() {
        fixMusicPlayer();
        fixComboPanel();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 4. 页面加载后延迟执行修复
    setTimeout(function() {
        fixMusicPlayer();
        fixComboPanel();
    }, 1000);

    setTimeout(function() {
        fixMusicPlayer();
        fixComboPanel();
    }, 3000);

    console.log('[fix-all] 补丁就绪');
})();
// ===== 强制修复：拦截“组字卡”功能入口，改为打开管理面板 =====
setTimeout(function() {
    // 查找所有可能代表“组字卡”功能入口的元素（文本匹配）
    var allElements = document.querySelectorAll('div, li, a, button, span');
    for (var i = 0; i < allElements.length; i++) {
        var el = allElements[i];
        // 只处理文本明确是“组字卡”且没有子元素的节点
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
            if (el.textContent.trim() === '组字卡') {
                // 避免重复绑定
                if (el._comboEntryFixed) continue;
                el._comboEntryFixed = true;

                // 劫持点击事件
                el.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var panel = document.getElementById('combo-panel');
                    if (panel) {
                        panel.style.display = 'block';
                        // 刷新面板内容
                        var list = document.getElementById('combo-list-inner');
                        if (list && typeof refreshComboList === 'function') {
                            refreshComboList();
                        }
                    }
                });
            }
        }
    }
}, 800);
