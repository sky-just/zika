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
    const player = document.getElementById('player');
    if (!player) return;

    // 绑定音乐播放器开关
    const musicToggle = document.getElementById('music-player-toggle');
    if (musicToggle && !musicToggle._bound) {
        musicToggle._bound = true;
        musicToggle.addEventListener('click', () => {
            if (player.style.display === 'none') {
                player.style.display = 'block';
                if (typeof settings !== 'undefined') settings.musicPlayerEnabled = true;
            } else {
                player.style.display = 'none';
                if (typeof settings !== 'undefined') settings.musicPlayerEnabled = false;
            }
            if (typeof throttledSaveData === 'function') throttledSaveData();
        });
    }

    const isEnabled = (typeof settings !== 'undefined' && settings.musicPlayerEnabled);
    player.style.display = isEnabled ? 'block' : 'none';

    const miniView = document.getElementById('mini-view');
    const fullView = player.querySelector('.full-view');
    const minimizeBtn = player.querySelector('.minimize-btn');
    const listBtn = document.getElementById('list-btn');
    const playlist = document.getElementById('playlist');

    if (miniView && fullView) {
        fullView.style.display = 'none';
        miniView.style.display = 'flex';
        miniView.onclick = (e) => {
            e.stopPropagation();
            fullView.style.display = 'flex';
            miniView.style.display = 'none';
        };
    }
    if (minimizeBtn) {
        minimizeBtn.onclick = (e) => {
            e.stopPropagation();
            fullView.style.display = 'none';
            miniView.style.display = 'flex';
        };
    }
    if (listBtn && playlist) {
        listBtn.onclick = (e) => {
            e.stopPropagation();
            if (playlist.innerHTML.trim() === '') {
                playlist.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-secondary);">🎵 歌单加载中...</div>';
            }
            playlist.style.display = playlist.style.display === 'block' ? 'none' : 'block';
        };
        playlist.style.display = 'none';
    }
}

// ========== 页面初始化 ==========
function onDOMReady() {
    // 初始化音乐悬浮器
    initMusicPlayer();

    // 组字卡入口绑定
    const comboBtn = document.getElementById('openComboBtn');
    if (comboBtn && typeof window.openComboManager === 'function') {
        comboBtn.addEventListener('click', window.openComboManager);
    }
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
