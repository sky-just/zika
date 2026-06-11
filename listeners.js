// listeners.js - 最终稳定版（修复抉择助手、信封投递、顶部按钮）
function setupEventListeners() {
    // 设置按钮
    var settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            var modal = document.getElementById('settings-modal');
            if (modal) {
                modal.style.zIndex = '99999';
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

    // 设置面板内子面板跳转
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
                if (settingsModal && typeof hideModal === 'function') hideModal(settingsModal);
                if (typeof showModal === 'function') showModal(target);
                else target.style.display = 'flex';
            });
        }
    });

    // 高级功能面板内功能按钮
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
        if (btn && modalId) {
            btn.addEventListener('click', function() {
                var advModal = document.getElementById('advanced-modal');
                if (advModal && typeof hideModal === 'function') hideModal(advModal);
                var targetModal = document.getElementById(modalId);
                if (targetModal) {
                    if (typeof showModal === 'function') showModal(targetModal);
                    else targetModal.style.display = 'flex';
                }
                // 抉择助手：初始化内部按钮事件
                if (funcId === 'decision-function' && typeof initDecisionModule === 'function') {
                    setTimeout(initDecisionModule, 150);
                }
                // 信封投递：加载数据并渲染列表
                if (funcId === 'envelope-function' && typeof loadEnvelopeData === 'function') {
                    setTimeout(function() {
                        loadEnvelopeData();
                        renderEnvelopeLists();
                    }, 150);
                }
            });
        }
    });

    // 返回按钮（高级功能返回设置）
    var backAdvanced = document.getElementById('back-advanced');
    if (backAdvanced) {
        backAdvanced.addEventListener('click', function() {
            var advModal = document.getElementById('advanced-modal');
            if (advModal && typeof hideModal === 'function') hideModal(advModal);
            var settingsModal = document.getElementById('settings-modal');
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
    document.querySelectorAll('[id*="back-"]').forEach(function(btn) {
        if (btn.id === 'back-advanced') return;
        btn.addEventListener('click', function() {
            var parentModal = btn.closest('.modal');
            if (parentModal && typeof hideModal === 'function') hideModal(parentModal);
            var settingsModal = document.getElementById('settings-modal');
            if (settingsModal && typeof showModal === 'function') showModal(settingsModal);
        });
    });

    // 点击弹窗空白区域关闭
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal && typeof hideModal === 'function') {
                hideModal(modal);
            }
        });
    });
}
setTimeout(function() { if (typeof initDecisionModule === 'function') initDecisionModule(); }, 500);
// 补齐缺失的初始化函数
if (typeof initializeSession === 'undefined') {
    window.initializeSession = async function() {
        if (!window.SESSION_ID) {
            window.SESSION_ID = 'session_' + Date.now();
        }
    };
}
if (typeof initializeRandomUI === 'undefined') {
    window.initializeRandomUI = function() {
        var mottoEl = document.querySelector('.header-motto');
        if (mottoEl) mottoEl.textContent = '✦ 与你同在 ✦';
        var inputEl = document.getElementById('message-input');
        if (inputEl) inputEl.placeholder = '说点什么吧...';
    };
}
if (typeof checkStatusChange === 'undefined') {
    window.checkStatusChange = function() {};
}
// ===== 抉择助手核心函数（从 games.js 修复） =====
window.initDecisionModule = function() {
    var openCoinBtn = document.getElementById('open-coin-toss');
    var openWheelBtn = document.getElementById('open-wheel');
    var closeMenuBtn = document.getElementById('close-decision-menu');
    var closeWheelBtn = document.getElementById('close-wheel');
    var addOptionBtn = document.getElementById('add-wheel-option');
    var spinBtn = document.getElementById('spin-wheel-btn');
    var sendResultBtn = document.getElementById('send-wheel-result');

    if (openCoinBtn && !openCoinBtn._init) {
        openCoinBtn._init = true;
        openCoinBtn.addEventListener('click', function() {
            var menu = document.getElementById('decision-menu-modal');
            if (menu && typeof hideModal === 'function') hideModal(menu);
            if (typeof handleCoinToss === 'function') handleCoinToss();
        });
    }
    if (openWheelBtn && !openWheelBtn._init) {
        openWheelBtn._init = true;
        openWheelBtn.addEventListener('click', function() {
            var menu = document.getElementById('decision-menu-modal');
            if (menu && typeof hideModal === 'function') hideModal(menu);
            if (typeof initPicker === 'function') initPicker();
            var wheelModal = document.getElementById('wheel-modal');
            if (wheelModal && typeof showModal === 'function') showModal(wheelModal);
        });
    }
    if (closeMenuBtn && !closeMenuBtn._init) {
        closeMenuBtn._init = true;
        closeMenuBtn.addEventListener('click', function() {
            var menu = document.getElementById('decision-menu-modal');
            if (menu && typeof hideModal === 'function') hideModal(menu);
        });
    }
    if (closeWheelBtn && !closeWheelBtn._init) {
        closeWheelBtn._init = true;
        closeWheelBtn.addEventListener('click', function() {
            var modal = document.getElementById('wheel-modal');
            if (modal && typeof hideModal === 'function') hideModal(modal);
        });
    }
    if (spinBtn && !spinBtn._init) {
        spinBtn._init = true;
        spinBtn.addEventListener('click', function() {
            if (typeof doPick === 'function') doPick();
        });
    }
    if (sendResultBtn && !sendResultBtn._init) {
        sendResultBtn._init = true;
        sendResultBtn.addEventListener('click', function() {
            if (typeof wheelResultText !== 'undefined' && wheelResultText) {
                if (typeof sendMessage === 'function') sendMessage('✨ 随机抽签结果：' + wheelResultText, 'normal');
                var modal = document.getElementById('wheel-modal');
                if (modal && typeof hideModal === 'function') hideModal(modal);
                wheelResultText = '';
                sendResultBtn.style.display = 'none';
            }
        });
    }
    if (addOptionBtn && !addOptionBtn._init) {
        addOptionBtn._init = true;
        addOptionBtn.addEventListener('click', function() {
            if (typeof wheelOptions !== 'undefined') {
                wheelOptions.push('选项 ' + (wheelOptions.length + 1));
                if (typeof renderPickerOptions === 'function') renderPickerOptions();
                if (typeof renderPickerCards === 'function') renderPickerCards();
            }
        });
    }
};

window.handleCoinToss = function() {
    var overlay = document.getElementById('coin-toss-overlay');
    if (!overlay) return;
    overlay.classList.remove('finished');
    overlay.classList.add('visible');
    var resultText = document.getElementById('coin-result-text');
    if (resultText) resultText.textContent = '';
    var sendBtn = document.getElementById('send-coin-result');
    if (sendBtn) sendBtn.style.display = 'none';
    var retryBtn = document.getElementById('retry-coin-toss');
    if (retryBtn) retryBtn.style.display = 'none';
    var coin = document.getElementById('animated-coin');
    if (coin) coin.style.transform = '';
    
    // 绑定取消按钮
    var cancelBtn = document.getElementById('cancel-coin-result');
    if (cancelBtn && !cancelBtn._coinBound) {
        cancelBtn._coinBound = true;
        cancelBtn.addEventListener('click', function() {
            overlay.classList.remove('visible');
        });
    }
    // 绑定重试按钮
    if (retryBtn && !retryBtn._coinBound) {
        retryBtn._coinBound = true;
        retryBtn.addEventListener('click', function() {
            startCoinFlipAnimation();
        });
    }
    
    startCoinFlipAnimation();
};
// 组字卡面板内新建按钮修复（保留）
setTimeout(function() {
    var addComboBtn = document.getElementById('add-combo-inner-btn');
    if (addComboBtn && !addComboBtn._fixed) {
        addComboBtn._fixed = true;
        addComboBtn.addEventListener('click', function() {
            if (!window.comboCards) window.comboCards = [];
            window.comboCards.push({
                id: Date.now(),
                name: '新组合',
                items: ['字卡A', '字卡B'],
                separator: ' '
            });
            if (typeof throttledSaveData === 'function') throttledSaveData();
            var list = document.getElementById('combo-list-inner');
            if (list && typeof window.renderComboList === 'function') {
                window.renderComboList();
            } else if (list) {
                list.innerHTML += '<div style="padding:8px;background:var(--primary-bg);border-radius:8px;margin-bottom:6px;">✅ 已添加「新组合」</div>';
            }
            if (typeof showNotification === 'function') showNotification('新组合已添加', 'success');
        });
    }
}, 1500);

// 顶部按钮绑定（独立执行）
var groupChatBtn = document.getElementById('group-chat-btn');
if (groupChatBtn) {
    groupChatBtn.addEventListener('click', function() {
        var modal = document.getElementById('group-chat-modal');
        if (modal && typeof showModal === 'function') showModal(modal);
    });
}

var dailyGreetingBtn = document.getElementById('daily-greeting-btn');
if (dailyGreetingBtn) {
    dailyGreetingBtn.addEventListener('click', function() {
        if (typeof reopenDailyGreeting === 'function') reopenDailyGreeting();
    });
}

// 启动监听器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}
