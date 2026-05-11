// listeners.js - 完整修复版
function setupEventListeners() {
    var settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            var modal = document.getElementById('settings-modal');
            if (modal) {
                if (typeof showModal === 'function') {
                    showModal(modal);
                } else {
                    modal.style.display = 'flex';
                }
            }
        });
    }

    var chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.addEventListener('scroll', function() {
            if (chatContainer.scrollTop < 50 && typeof loadMoreHistory === 'function') {
                loadMoreHistory();
            }
        });
    }

    var sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            if (typeof sendMessage === 'function') sendMessage();
        });
    }

    var messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (typeof sendMessage === 'function') sendMessage();
            }
        });
    }

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

    var partnerName = document.getElementById('partner-name');
    if (partnerName) {
        partnerName.addEventListener('click', function() {
            if (typeof openNameModal === 'function') openNameModal(true);
        });
    }

    var myName = document.getElementById('my-name');
    if (myName) {
        myName.addEventListener('click', function() {
            if (typeof openNameModal === 'function') openNameModal(false);
        });
    }
}

// 初始化：页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}
