// listeners.js - 最终稳定版
function setupEventListeners() {
    // 设置按钮
    var settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) settingsBtn.addEventListener('click', function() {
        var modal = document.getElementById('settings-modal');
        if (modal) showModal(modal);
    });

    // 主题切换
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', function() {
        if (typeof settings !== 'undefined') {
            settings.isDarkMode = !settings.isDarkMode;
            if (typeof updateUI === 'function') updateUI();
            if (typeof throttledSaveData === 'function') throttledSaveData();
        }
    });

    // 发送按钮
    var sendBtn = document.getElementById('send-btn');
    if (sendBtn) sendBtn.addEventListener('click', function() {
        if (typeof sendMessage === 'function') sendMessage();
    });

    // 设置子面板跳转
    var subPairs = [
        ['appearance-settings', 'appearance-modal'],
        ['chat-settings', 'chat-modal'],
        ['advanced-settings', 'advanced-modal'],
        ['data-settings', 'data-modal']
    ];
    subPairs.forEach(function(pair) {
        var t = document.getElementById(pair[0]), m = document.getElementById(pair[1]);
        if (t && m) t.addEventListener('click', function() { hideModal(document.getElementById('settings-modal')); showModal(m); });
    });

    // 高级功能按钮
    var advPairs = [
        ['custom-replies-function', 'custom-replies-modal'],
        ['stats-function', 'stats-modal'],
        ['fortune-lenormand-function', 'fortune-lenormand-modal'],
        ['anniversary-function', 'anniversary-modal'],
        ['mood-function', 'mood-modal'],
        ['envelope-function', 'envelope-modal']
    ];
    advPairs.forEach(function(pair) {
        var t = document.getElementById(pair[0]), m = document.getElementById(pair[1]);
        if (t && m) t.addEventListener('click', function() { hideModal(document.getElementById('advanced-modal')); showModal(m); });
    });

    // 音乐播放器开关
    var musicBtn = document.getElementById('music-player-toggle');
    if (musicBtn) musicBtn.addEventListener('click', function() {
        var player = document.getElementById('player');
        if (player) {
            player.style.display = player.style.display === 'block' ? 'none' : 'block';
            showNotification(player.style.display === 'block' ? '音乐播放器已开启' : '音乐播放器已关闭', 'success');
        }
    });

    // 组字卡开关与新增
    var comboToggle = document.getElementById('combo-enable-toggle');
    if (comboToggle) comboToggle.addEventListener('change', function() {
        window.comboCardsEnabled = this.checked;
        if (typeof throttledSaveData === 'function') throttledSaveData();
    });
    var addComboBtn = document.getElementById('add-combo-inner-btn');
    if (addComboBtn) addComboBtn.addEventListener('click', function() {
        if (!window.comboCards) window.comboCards = [];
        window.comboCards.push({ id: Date.now(), name: '新组合', items: ['字卡A', '字卡B'], separator: ' ' });
        if (typeof throttledSaveData === 'function') throttledSaveData();
        renderComboCardList();
        showNotification('新组合已添加', 'success');
    });

    // 通用关闭按钮
    document.addEventListener('click', function(e) {
        if (e.target.id && e.target.id.includes('close')) {
            var modal = e.target.closest('.modal');
            if (modal) hideModal(modal);
        }
        if (e.target.closest('#cancel-settings')) {
            hideModal(document.getElementById('settings-modal'));
        }
    });

    // 返回按钮
    setTimeout(function() {
        var backBtns = document.querySelectorAll('[id*="back-"]');
        backBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var modal = btn.closest('.modal');
                if (modal) hideModal(modal);
                var settingsModal = document.getElementById('settings-modal');
                if (settingsModal) showModal(settingsModal);
            });
        });
    }, 600);
}

// 初始化补齐
if (typeof initializeSession === 'undefined') window.initializeSession = async function() { if (!window.SESSION_ID) window.SESSION_ID = 'session_' + Date.now(); };
if (typeof initializeRandomUI === 'undefined') window.initializeRandomUI = function() { var e = document.querySelector('.header-motto'); if(e) e.textContent = '✦ 与你同在 ✦'; };
if (typeof initMusicPlayer === 'undefined') window.initMusicPlayer = function() {};
if (typeof checkStatusChange === 'undefined') window.checkStatusChange = function() {};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupEventListeners);
else setupEventListeners();
