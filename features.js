// features.js - 最终稳定版（修复音乐悬浮器、面板切换、开关绑定、组字卡入口）
(function() {

    // ========== 公告栏面板切换 ==========
    function switchToAnnouncementPanel() {
        const announcePanel = document.getElementById('announcement-panel');
        if (announcePanel) {
            const replyList = document.getElementById('custom-replies-list');
            const subTabs = document.getElementById('cr-sub-tabs');
            if (replyList) replyList.style.display = 'none';
            if (subTabs) subTabs.style.display = 'none';
            announcePanel.style.display = 'block';
            window.currentMajorTab = 'announcement';  // 关键：设置全局状态
        }
    }

    // ========== 每日问候关闭/重开 ==========
    function closeDailyGreeting() {
        const modal = document.getElementById('daily-greeting-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
    }

    function reopenDailyGreeting() {
        const modal = document.getElementById('daily-greeting-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
        }
    }

    // ========== 沉浸模式切换 ==========
    function toggleImmersiveMode() {
        document.body.classList.toggle('immersive-mode');
    }

    // ========== 音乐悬浮器初始化 ==========
    function initMusicPlayer() {
        const player = document.getElementById('player');
        if (!player) return;

        // 强制显示播放器容器（解决空白框架问题）
        player.style.display = 'block';

        // 初始化内部视图：迷你视图显示，全视图隐藏
        const miniView = document.getElementById('mini-view');
        const fullView = player.querySelector('.full-view');
        const minimizeBtn = player.querySelector('.minimize-btn');
        if (miniView && fullView) {
            fullView.style.display = 'none';
            miniView.style.display = 'flex';
        }

        // 迷你视图点击展开
        if (miniView) {
            miniView.addEventListener('click', function(e) {
                e.stopPropagation();
                if (fullView) fullView.style.display = 'flex';
                miniView.style.display = 'none';
            });
        }

        // 最小化按钮点击收起
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (fullView) fullView.style.display = 'none';
                if (miniView) miniView.style.display = 'flex';
            });
        }

        // 歌单按钮（三条杠）
        const listBtn = document.getElementById('list-btn');
        const playlist = document.getElementById('playlist');
        if (listBtn && playlist) {
            listBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                // 如果歌单为空，显示兜底文字
                if (playlist.innerHTML.trim() === '') {
                    playlist.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-secondary);">🎵 歌单加载中...</div>';
                }
                // 切换显示/隐藏
                playlist.style.display = playlist.style.display === 'block' ? 'none' : 'block';
            });
            playlist.style.display = 'none'; // 默认隐藏
        }

        // 绑定高级功能里的“悬浮音乐播放器”开关（避免重复绑定）
        const musicToggle = document.getElementById('music-player-toggle');
        if (musicToggle && !musicToggle._bound) {
            musicToggle._bound = true;
            musicToggle.addEventListener('click', function() {
                if (player.style.display === 'none' || player.style.display === '') {
                    player.style.display = 'block';
                    if (typeof settings !== 'undefined') settings.musicPlayerEnabled = true;
                    // 重置为迷你视图
                    if (miniView) miniView.style.display = 'flex';
                    if (fullView) fullView.style.display = 'none';
                    if (typeof showNotification === 'function') showNotification('音乐播放器已打开', 'success');
                } else {
                    player.style.display = 'none';
                    if (typeof settings !== 'undefined') settings.musicPlayerEnabled = false;
                    if (typeof showNotification === 'function') showNotification('音乐播放器已关闭', 'info');
                }
                if (typeof throttledSaveData === 'function') throttledSaveData();
            });
        }
    }

    // ========== 页面初始化 ==========
    function onDOMReady() {
        initMusicPlayer();

        // 组字卡入口绑定
        const comboBtn = document.getElementById('openComboBtn');
        if (comboBtn && typeof window.openComboManager === 'function') {
            comboBtn.addEventListener('click', window.openComboManager);
        }
    }

    // 组字卡入口函数（未找到子选项卡时给予提示）
    window.openComboManager = function() {
        const modal = document.getElementById('custom-replies-modal');
        if (modal && typeof showModal === 'function') {
            showModal(modal);
            const tabs = document.querySelectorAll('#cr-sub-tabs .reply-tab-btn');
            let found = false;
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].textContent.includes('组字卡') || tabs[i].dataset.id === 'combo') {
                    tabs[i].click();
                    found = true;
                    break;
                }
            }
            if (!found && typeof showNotification === 'function') {
                showNotification('请先在自定义回复中添加“组字卡”选项卡', 'info');
            }
        } else if (typeof showNotification === 'function') {
            showNotification('请先打开自定义回复面板', 'info');
        }
    };

    // 确保音乐播放器在 load 后也被初始化一次
    window.addEventListener('load', function() {
        setTimeout(initMusicPlayer, 100);
    });

    // DOMContentLoaded 时执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
        onDOMReady();
    }

    // 对外暴露必要函数
    window.switchToAnnouncementPanel = switchToAnnouncementPanel;
    window.closeDailyGreeting = closeDailyGreeting;
    window.reopenDailyGreeting = reopenDailyGreeting;
    window.toggleImmersiveMode = toggleImmersiveMode;
    window.initMusicPlayer = initMusicPlayer;

})();
