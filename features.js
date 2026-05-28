// features.js - 最终完整修复版
(function() {

    // ========== 公告栏面板切换 ==========
    function switchToAnnouncementPanel() {
        const announcePanel = document.getElementById('announcement-panel');
        if (announcePanel) {
            // 隐藏回复列表和子选项卡
            const replyList = document.getElementById('custom-replies-list');
            const subTabs = document.getElementById('cr-sub-tabs');
            if (replyList) replyList.style.display = 'none';
            if (subTabs) subTabs.style.display = 'none';
            // 显示公告面板
            announcePanel.style.display = 'block';
            // ⭐ 关键：设置全局状态变量
            window.currentMajorTab = 'announcement';
        }
    }

    // ========== 每日问候关闭/重开 ==========
    function closeDailyGreeting() {
        const greeting = document.getElementById('daily-greeting-modal');
        if (greeting) greeting.style.display = 'none';
    }

    function reopenDailyGreeting() {
        const greeting = document.getElementById('daily-greeting-modal');
        if (greeting) greeting.style.display = 'block';
    }

    // ========== 沉浸模式切换 ==========
    function toggleImmersiveMode() {
        document.body.classList.toggle('immersive-mode');
    }

    // ========== 音乐悬浮器初始化 ==========
    function initMusicPlayer() {
        const playerContainer = document.getElementById('player');
        if (!playerContainer) return;

        // 默认显示悬浮窗
        playerContainer.style.display = 'block';

        // 迷你视图点击展开
        const miniView = document.getElementById('mini-view');
        const fullView = playerContainer.querySelector('.full-view');
        const minimizeBtn = playerContainer.querySelector('.minimize-btn');
        if (miniView) {
            miniView.addEventListener('click', function(e) {
                e.stopPropagation();
                if (fullView) fullView.style.display = 'flex';
                miniView.style.display = 'none';
            });
        }
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (fullView) fullView.style.display = 'none';
                if (miniView) miniView.style.display = 'flex';
            });
        }

        // 歌单按钮
        const listBtn = document.getElementById('list-btn');
        const playlist = document.getElementById('playlist');
        if (listBtn && playlist) {
            listBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                playlist.style.display = playlist.style.display === 'block' ? 'none' : 'block';
            });
        }
        if (playlist) playlist.style.display = 'none';
    }

    // ========== 页面初始化 ==========
    function onDOMReady() {
        // 初始化音乐悬浮器
        initMusicPlayer();

        // ⭐ 新增：绑定高级功能里的“悬浮音乐播放器”开关
        const musicToggle = document.getElementById('music-player-toggle');
        const player = document.getElementById('player');
        if (musicToggle && player) {
            musicToggle.addEventListener('click', function() {
                if (player.style.display === 'none' || player.style.display === '') {
                    player.style.display = 'block';
                } else {
                    player.style.display = 'none';
                }
            });
        }

        // 组字卡入口绑定
        const comboBtn = document.getElementById('openComboBtn');
        if (comboBtn && typeof window.openComboManager === 'function') {
            comboBtn.addEventListener('click', window.openComboManager);
        }
    }

    // 确保音乐播放器在 load 后初始化
    window.addEventListener('load', function() {
        setTimeout(initMusicPlayer, 100);
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
        onDOMReady();
    }

    // 对外暴露函数
    window.switchToAnnouncementPanel = switchToAnnouncementPanel;
    window.closeDailyGreeting = closeDailyGreeting;
    window.reopenDailyGreeting = reopenDailyGreeting;
    window.toggleImmersiveMode = toggleImmersiveMode;
    window.initMusicPlayer = initMusicPlayer;

})();
