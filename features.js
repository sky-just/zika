// ===== features.js 修复版 =====
// 修复：音乐悬浮器初始化、歌单弹出、开关控制、公告面板状态

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
        window.currentMajorTab = 'announcement';   // 关键：设置全局状态
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

    // 确保播放器默认可见（如果被CSS隐藏则显示）
    playerContainer.style.display = 'block';

    // 获取视图元素
    const miniView = document.getElementById('mini-view');
    const fullView = playerContainer.querySelector('.full-view');
    const minimizeBtn = playerContainer.querySelector('.minimize-btn');

    // 初始状态：mini-view 显示，full-view 隐藏（如果CSS没有控制好）
    if (miniView && fullView) {
        // 避免重复设置导致闪烁
        if (fullView.style.display !== 'none') fullView.style.display = 'none';
        if (miniView.style.display !== 'flex') miniView.style.display = 'flex';
    }

    // 点击 mini-view 展开
    if (miniView) {
        miniView.addEventListener('click', function(e) {
            e.stopPropagation();
            if (fullView) fullView.style.display = 'flex';
            if (miniView) miniView.style.display = 'none';
        });
    }

    // 点击 minimize-btn 收起
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (fullView) fullView.style.display = 'none';
            if (miniView) miniView.style.display = 'flex';
        });
    }

    // 歌单按钮：三条杠 id="list-btn"
    const listBtn = document.getElementById('list-btn');
    const playlist = document.getElementById('playlist');
    if (listBtn && playlist) {
        listBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // 如果歌单内容为空，显示提示
            if (playlist.innerHTML.trim() === '' || playlist.children.length === 0) {
                playlist.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-secondary);">歌单加载中…</div>';
            }
            // 切换显示
            if (playlist.style.display === 'block') {
                playlist.style.display = 'none';
            } else {
                playlist.style.display = 'block';
            }
        });
    }
    if (playlist) playlist.style.display = 'none';
}

// ========== 页面初始化 ==========
function onDOMReady() {
    // 初始化音乐悬浮器
    initMusicPlayer();

    // 绑定高级功能里的"悬浮音乐播放器"开关
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
