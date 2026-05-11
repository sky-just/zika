// listeners.js - 完整修复版
function setupEventListeners() {
    // 设置按钮
    var settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            var modal = document.getElementById('settings-modal');
            if (modal) {
                if (typeof showModal === 'function') showModal(modal);
                else modal.style.display = 'flex';
            }
        });
    }

    // 主题切换
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            if (typeof settings !== 'undefined') {
                settings.isDarkMode = !settings.isDarkMode;
                if (typeof updateUI === 'function') updateUI();
                if (typeof throttledSaveData === 'function') throttledSaveData();
            }
        });
    }

    // 发送按钮
    var sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            if (typeof sendMessage === 'function') sendMessage();
        });
    }

    // 输入框回车发送
    var msgInput = document.getElementById('message-input');
    if (msgInput) {
        msgInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (typeof sendMessage === 'function') sendMessage();
            }
        });
    }

    // 设置子面板切换
    var subPairs = [
        ['appearance-settings', 'appearance-modal'],
        ['chat-settings', 'chat-modal'],
        ['advanced-settings', 'advanced-modal'],
        ['data-settings', 'data-modal']
    ];
    subPairs.forEach(function(pair) {
        var trigger = document.getElementById(pair[0]);
        var target = document.getElementById(pair[1]);
        if (trigger && target) {
            trigger.addEventListener('click', function() {
                var settingsModal = document.getElementById('settings-modal');
                if (settingsModal) {
                    if (typeof hideModal === 'function') hideModal(settingsModal);
                    else settingsModal.style.display = 'none';
                }
                if (typeof showModal === 'function') showModal(target);
                else target.style.display = 'flex';
            });
        }
    });

    // 高级功能里的子功能按钮（信封、运势、重要日、心晴手账等）
    var advFuncMap = {
        'custom-replies-function': 'custom-replies-modal',
        'music-player-toggle': null,
        'stats-function': 'stats-modal',
        'decision-function': 'decision-menu-modal',
        'fortune-lenormand-function': 'fortune-lenormand-modal',
        'anniversary-function': 'anniversary-modal',
        'mood-function': 'mood-modal',
        'envelope-function': 'envelope-modal',
        'moments-function': null
    };

    Object.keys(advFuncMap).forEach(function(funcId) {
        var btn = document.getElementById(funcId);
        var modalId = advFuncMap[funcId];
        if (btn) {
            btn.addEventListener('click', function() {
                var advModal = document.getElementById('advanced-modal');
                if (advModal && typeof hideModal === 'function') hideModal(advModal);
                if (modalId) {
                    var targetModal = document.getElementById(modalId);
                    if (targetModal) {
                        if (typeof showModal === 'function') showModal(targetModal);
                        else targetModal.style.display = 'flex';
                    }
                }
            });
        }
    });

    // 返回按钮（高级功能返回设置）
    var backAdvanced = document.getElementById('back-advanced');
    if (backAdvanced) {
        backAdvanced.addEventListener('click', function() {
            var advModal = document.getElementById('advanced-modal');
            var settingsModal = document.getElementById('settings-modal');
            if (advModal && typeof hideModal === 'function') hideModal(advModal);
            if (settingsModal && typeof showModal === 'function') showModal(settingsModal);
        });
    }

    // 通用关闭按钮
    document.querySelectorAll('.modal [id*="close"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var parentModal = btn.closest('.modal');
            if (parentModal && typeof hideModal === 'function') hideModal(parentModal);
        });
    });

    // 通用返回按钮
    document.querySelectorAll('[id*="back-"]
    ').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var parentModal = btn.closest('.modal');
            if (parentModal && typeof hideModal === 'function') hideModal(parentModal);
            var settingsModal = document.getElementById('settings-modal');
            if (settingsModal && typeof showModal === 'function') showModal(settingsModal);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}
