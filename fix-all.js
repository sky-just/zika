// fix-all.js —— 终极修复版 (去重 + 备份兜底 + 音乐 + 侧边栏)
(function() {
    'use strict';

    // 0. 备份函数空壳
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 1. 删除所有异常的“组字卡”入口（只保留正确调用 openComboManager 的）
    function removeBadComboEntry() {
        const allItems = document.querySelectorAll('.settings-item');
        allItems.forEach(item => {
            const text = item.textContent.trim();
            if (text === '组字卡') {
                const onclick = item.getAttribute('onclick') || '';
                // 不是正常调用的全部删掉
                if (!onclick.includes('openComboManager()')) {
                    item.remove();
                }
            }
        });
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

    // 3. 音乐歌单强制绑定
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
    }

    // 4. 侧边栏修复
    function fixSidebar() {
        const buttons = document.querySelectorAll('.modal-sidebar .sidebar-btn');
        buttons.forEach(btn => {
            if (btn._fixedSidebar) return;
            btn._fixedSidebar = true;
            btn.addEventListener('click', function() {
                buttons.forEach(b => b.classList.remove('active'));
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

    // 执行清理
    setTimeout(removeBadComboEntry, 500);
    setTimeout(removeBadComboEntry, 1500);
    setTimeout(removeBadComboEntry, 3000);

    setTimeout(fixMiniView, 800);
    setTimeout(fixMiniView, 2000);
    setTimeout(forceBindListBtn, 1000);
    setTimeout(forceBindListBtn, 3000);
    setTimeout(fixSidebar, 1200);
    setTimeout(fixSidebar, 3500);
})();
