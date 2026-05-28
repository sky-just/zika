// features.js - 精简修复版
// 只包含必要函数，移除与 reply-library.js 冲突的部分

(function() {

    // ========== 公告栏面板切换（已修复 ID） ==========
    function switchToAnnouncementPanel() {
        const announcePanel = document.getElementById('announcement-panel');
        if (announcePanel) {
            // 隐藏回复列表和子选项卡，避免重叠
            const replyList = document.getElementById('custom-replies-list');
            const subTabs = document.getElementById('cr-sub-tabs');
            if (replyList) replyList.style.display = 'none';
            if (subTabs) subTabs.style.display = 'none';
            announcePanel.style.display = 'block';
        }
    }

    // ========== 每日问候关闭/重开（已修复关闭按钮 ID） ==========
    function closeDailyGreeting() {
        const greeting = document.getElementById('daily-greeting-modal');
        if (greeting) greeting.style.display = 'none';
    }

    function reopenDailyGreeting() {
        const greeting = document.getElementById('daily-greeting-modal');
        if (greeting) greeting.style.display = 'block';
    }

    // ========== 沉浸模式切换（保留，其他地方可能用到） ==========
    function toggleImmersiveMode() {
        document.body.classList.toggle('immersive-mode');
    }

    // ========== 音乐悬浮器初始化（已修复选择器） ==========
    function initMusicPlayer() {
        const playerContainer = document.getElementById('player');
        if (!playerContainer) return;

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

        // 歌单按钮（三条杠）
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

        // 组字卡入口绑定（保留）
        const comboBtn = document.getElementById('openComboBtn');
        if (comboBtn && typeof window.openComboManager === 'function') {
            comboBtn.addEventListener('click', window.openComboManager);
        }
    }

    // 确保页面加载后执行一次 initMusicPlayer
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
