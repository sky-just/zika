// fix-all.js —— 终极修复补丁
(function() {
    'use strict';
    console.log('[fix-all] 终极补丁已激活');

    // 1. 修复音乐播放器内部按钮
    function fixMusicPlayer() {
        var player = document.getElementById('player');
        if (!player) return;

        // 歌单按钮
        var listBtn = document.getElementById('list-btn');
        if (listBtn && !listBtn._fixedMusic) {
            listBtn._fixedMusic = true;
            listBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                var playlist = document.getElementById('playlist');
                if (playlist) {
                    playlist.classList.toggle('active');
                }
            });
        }

        // 收起按钮
        var minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn && !minimizeBtn._fixedMusic) {
            minimizeBtn._fixedMusic = true;
            minimizeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                player.classList.add('collapsed');
                var playlist = document.getElementById('playlist');
                if (playlist) playlist.classList.remove('active');
            });
        }

        // 展开按钮
        var miniView = document.getElementById('mini-view');
        if (miniView && !miniView._fixedMusic) {
           迷你View._fixedMusic = true;
            miniView.addEventListener('click', function() {
                player.classList.remove('collapsed');
            });
        }
    }

    // 2. 修复组字卡面板按钮
    function fixComboPanel() {
        // 新建按钮
        var addBtn = document.getElementById('add-combo-inner-btn');
        if (addBtn && !addBtn._fixedCombo) {
            addBtn._fixedCombo = true;
            addBtn.addEventListener('click', function() {
                if (!window.comboCards) window.comboCards = [];
                window.comboCards.push({
                    id: Date.now(),
                    name: '新组合',
                    items: ['字卡A', '字卡B'],
                    separator: ' '
                });
                if (typeof throttledSaveData === 'function') throttledSaveData();
                if (typeof showNotification === 'function') showNotification('新组合已添加', 'success');
                
                // 刷新列表
                var list = document.getElementById('combo-list-inner');
                if (list) {
                    list.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:10px;">✅ 已添加，关闭后重新进入即可看到</p>';
                }
            });
        }

        // 开关按钮
        var toggle = document.getElementById('combo-enable-toggle');
        if (toggle && !toggle._fixedCombo) {
            toggle._fixedCombo = true;
            toggle.addEventListener('change', function() {
                window.comboCardsEnabled = this.checked;
                if (typeof throttledSaveData === 'function') throttledSaveData();
            });
        }
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
