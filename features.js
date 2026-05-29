// features.js - 修正语法 + 完整功能
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
        window.currentMajorTab = 'announcement';
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

    // 开关绑定
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
    initMusicPlayer();

    const comboBtn = document.getElementById('openComboBtn');
    if (comboBtn && typeof window.openComboManager === 'function') {
        comboBtn.addEventListener('click', window.openComboManager);
    }
}

// ========== 组字卡入口函数 ==========
window.openComboManager = function() {
    const modal = document.getElementById('custom-replies-modal');
    if (modal && typeof showModal === 'function') {
        showModal(modal);
        const tabs = document.querySelectorAll('#cr-sub-tabs .reply-tab-btn');
        let found = false;
        for (let i = 0; i < tabs.length; i++) {
            const btn = tabs[i];
            if (btn.textContent.includes('组字卡') || btn.dataset.id === 'combo') {
                btn.click();
                found = true;
                break;
            }
        }
        if (!found && typeof showNotification === 'function') {
            showNotification('请先在自定义回复中添加"组字卡"选项卡', 'info');
        }
    } else if (typeof showNotification === 'function') {
        showNotification('请先打开自定义回复面板', 'info');
    }
};

// ========== 启动 ==========
window.addEventListener('load', function() {
    setTimeout(initMusicPlayer, 100);
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMReady);
} else {
    onDOMReady();
}

// 对外暴露
window.switchToAnnouncementPanel = switchToAnnouncementPanel;
window.closeDailyGreeting = closeDailyGreeting;
window.reopenDailyGreeting = reopenDailyGreeting;
window.toggleImmersiveMode = toggleImmersiveMode;
window.initMusicPlayer = initMusicPlayer;

})();
