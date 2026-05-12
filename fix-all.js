// fix-all.js —— 终极修复 v4 (手机可用版)
(function() {
    'use strict';
    console.log('[fix-all] v4 已激活');

    // 1. 音乐播放器修复
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

    // 2. 组字卡修复：在新版页面顶部添加“管理面板”入口
    function fixComboPanel() {
        // 每 1 秒检查一次，看是否进入了新版组字卡页面
        setInterval(function() {
            // 新版组字卡页面的容器选择器 (来自 games.js 的 renderComboContent)
            var newPage = document.querySelector('.combo-content-area, #combo-content-container, .combo-tab-content');
            if (newPage && newPage.offsetParent !== null) {
                // 如果还没添加过管理入口
                if (!document.getElementById('combo-manager-link')) {
                    var link = document.createElement('button');
                    link.id = 'combo-manager-link';
                    link.textContent = '⚙️ 管理组字卡';
                    link.style.cssText = 'display:block;width:calc(100%-20px);margin:10px 10px;padding:12px;background:var(--accent-color);color:white;border:none;border-radius:12px;font-size:15px;cursor:pointer;z-index:9999;';
                    link.onclick = function() {
                        // 直接显示旧版管理面板
                        var panel = document.getElementById('combo-panel');
                        if (panel) {
                            panel.style.display = 'block';
                            panel.style.position = 'fixed';
                            panel.style.top = '10%';
                            panel.style.left = '5%';
                            panel.style.right = '5%';
                            panel.style.zIndex = '99999';
                            panel.style.maxHeight = '80%';
                            panel.style.overflow = 'auto';
                            panel.style.background = 'var(--bg)';
                            panel.style.border = '2px solid var(--accent)';
                            panel.style.borderRadius = '16px';
                            panel.style.padding = '20px';
                        }
                        // 刷新列表
                        var list = document.getElementById('combo-list-inner');
                        if (list) {
                            var cards = window.comboCards || [];
                            if (cards.length === 0) {
                                list.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:1em;">还没有组合，点击 + 新建</div>';
                            } else {
                                list.innerHTML = cards.map(function(combo, i) {
                                    return '<div class="combo-item" data-index="' + i + '">' +
                                               '<span>' + combo.name + '</span>' +
                                           '</div>';
                                }).join('');
                            }
                        }
                    };
                    newPage.insertBefore(link, newPage.firstChild);
                }
            }
        }, 1000);

        // 修复新建按钮
        setTimeout(function() {
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
                    // 刷新列表
                    var list = document.getElementById('combo-list-inner');
                    if (list) {
                        var cards = window.comboCards || [];
                        list.innerHTML = cards.map(function(combo, i) {
                            return '<div class="combo-item" data-index="' + i + '">' +
                                       '<span>' + combo.name + '</span>' +
                                   '</div>';
                        }).join('');
                    }
                });
            }
        }, 2000);
    }

    // 3. 观察者 + 延迟
    var observer = new MutationObserver(function() {
        fixMusicPlayer();
        fixComboPanel();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(function() { fixMusicPlayer(); fixComboPanel(); }, 1000);
    setTimeout(function() { fixMusicPlayer(); fixComboPanel(); }, 3000);

    console.log('[fix-all] v4 就绪');
})();
