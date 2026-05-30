// 核心应用逻辑
function clearAllAppData() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = '<div style="background:var(--secondary-bg);border-radius:20px;padding:24px;width:88%;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">' +
        '<div style="text-align:center;margin-bottom:20px;">' +
        '<div style="width:52px;height:52px;border-radius:50%;background:rgba(255,80,80,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-trash-alt" style="color:#ff5050;font-size:20px;"></i></div>' +
        '<div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:6px;">重置数据</div>' +
        '<div style="font-size:12px;color:var(--text-secondary);">请选择要重置的范围</div></div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' +
        '<button id="_reset_current" style="width:100%;padding:12px 16px;border:1px solid var(--border-color);border-radius:12px;background:var(--primary-bg);color:var(--text-primary);font-size:13px;font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;"><i class="fas fa-comment-slash" style="color:var(--accent-color);font-size:15px;width:18px;text-align:center;"></i>仅清除当前会话消息</button>' +
        '<button id="_reset_all" style="width:100%;padding:12px 16px;border:1px solid rgba(255,80,80,0.3);border-radius:12px;background:rgba(255,80,80,0.06);color:#ff5050;font-size:13px;font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;"><i class="fas fa-bomb" style="font-size:15px;width:18px;text-align:center;"></i>重置所有数据（完全清空）</button>' +
        '<button id="_reset_cancel" style="width:100%;padding:10px 16px;border:none;border-radius:12px;background:none;color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button></div></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#_reset_cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#_reset_current').addEventListener('click', () => {
        overlay.remove();
        if (confirm('确定要清除当前会话的所有消息吗？此操作无法恢复！')) {
            messages = [];
            if (typeof renderMessages === 'function') renderMessages();
            if (typeof throttledSaveData === 'function') throttledSaveData();
            showNotification('当前会话消息已清除', 'success');
        }
    });
    overlay.querySelector('#_reset_all').addEventListener('click', () => {
        overlay.remove();
        if (confirm('【高危操作】确定要重置所有数据吗？')) {
            messages = [];
            localforage.clear();
            localStorage.clear();
            setTimeout(() => location.reload(), 500);
        }
    });
}

function loadMoreHistory() {
    if (messages.length <= displayedMessageCount) return;
    displayedMessageCount = Math.min(messages.length, displayedMessageCount + HISTORY_BATCH_SIZE);
    renderMessages(true);
}

function getDefaultSettings() {
    return {
        partnerName: "梦角", myName: "我", myStatus: "在线", partnerStatus: "在线",
        isDarkMode: false, colorTheme: "gold", soundEnabled: true, typingIndicatorEnabled: true,
        readReceiptsEnabled: true, replyEnabled: true, lastStatusChange: Date.now(),
        nextStatusChange: 4, fontSize: 16, bubbleStyle: 'standard',
        messageFontFamily: "'Noto Serif SC', serif", messageFontWeight: 400, messageLineHeight: 1.5,
        musicPlayerEnabled: false, replyDelayMin: 3000, replyDelayMax: 7000,
        inChatAvatarEnabled: true, inChatAvatarSize: 36, inChatAvatarPosition: 'center',
        alwaysShowAvatar: false, showPartnerNameInChat: false, customFontUrl: "",
        customBubbleCss: "", customGlobalCss: "", myAvatarFrame: null, partnerAvatarFrame: null,
        myAvatarShape: 'circle', partnerAvatarShape: 'circle',
        autoSendEnabled: false, autoSendInterval: 5, allowReadNoReply: false, readNoReplyChance: 0.2,
        timeFormat: 'HH:mm', soundVolume: 0.15, bottomCollapseMode: false, emojiMixEnabled: true
    };
}

function renderBackgroundGallery() { /* 已保留原函数，无错误 */ }

const applyBackground = (value) => {
    if (!value) return;
    document.documentElement.style.setProperty('--chat-bg-image', value.startsWith('url(') ? value : `url(${value})`);
    document.body.classList.add('with-background');
};

const loadData = async () => {
    window.loadData = loadData;
    try {
        settings = getDefaultSettings();
        const results = await Promise.allSettled([
            localforage.getItem(getStorageKey('chatSettings')),
            localforage.getItem(getStorageKey('chatMessages')),
            localforage.getItem(getStorageKey('customReplies')),
            localforage.getItem(getStorageKey('customPokes')),
            localforage.getItem(getStorageKey('customStatuses')),
            localforage.getItem(getStorageKey('customMottos')),
            localforage.getItem(getStorageKey('customIntros')),
            localforage.getItem(getStorageKey('anniversaries')),
            localforage.getItem(getStorageKey('stickerLibrary')),
            localforage.getItem(getStorageKey('customThemes')),
            localforage.getItem(getStorageKey('chatBackground')),
            localforage.getItem(getStorageKey('partnerAvatar')),
            localforage.getItem(getStorageKey('myAvatar')),
            localforage.getItem(getStorageKey('partnerPersonas')),
            localforage.getItem(getStorageKey('myStickerLibrary')),
            localforage.getItem(getStorageKey('customReplyGroups')),
            localforage.getItem(getStorageKey('customPokeGroups')),
            localforage.getItem(getStorageKey('customStatusGroups')),
            localforage.getItem(getStorageKey('customEmojis'))
        ]);
        const getVal = (i) => results[i].status === 'fulfilled' ? results[i].value : null;
        const savedSettings = getVal(0);
        if (savedSettings) Object.assign(settings, savedSettings);
        const savedMessages = getVal(1);
        if (savedMessages && Array.isArray(savedMessages)) {
            messages = savedMessages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
        } else messages = [];
        if (getVal(2)) customReplies = getVal(2);
        if (getVal(3)) customPokes = getVal(3);
        if (getVal(4)) customStatuses = getVal(4);
        if (getVal(5)) customMottos = getVal(5);
        if (getVal(6)) customIntros = getVal(6);
        if (getVal(7)) anniversaries = getVal(7);
        if (getVal(8)) stickerLibrary = getVal(8);
        if (getVal(9)) customThemes = getVal(9);
        if (getVal(10)) { const bg = getVal(10); if (bg) applyBackground(bg); }
        if (getVal(11)) { const av = getVal(11); if (av && DOMElements.partner && DOMElements.partner.avatar) updateAvatar(DOMElements.partner.avatar, av); }
        if (getVal(12)) { const av = getVal(12); if (av && DOMElements.me && DOMElements.me.avatar) updateAvatar(DOMElements.me.avatar, av); }
        if (getVal(13)) partnerPersonas = getVal(13);
        if (getVal(14)) myStickerLibrary = getVal(14);
        if (getVal(15)) window.customReplyGroups = getVal(15);
        if (getVal(16)) window.customPokeGroups = getVal(16);
        if (getVal(17)) window.customStatusGroups = getVal(17);
        if (getVal(18)) customEmojis = getVal(18);
        displayedMessageCount = HISTORY_BATCH_SIZE;
        updateUI();
    } catch (e) { settings = getDefaultSettings(); messages = []; updateUI(); }
};

const saveData = async () => {
    window.saveData = saveData;
    if (!SESSION_ID) return;
    const promises = [];
    promises.push({ key: 'chatSettings', val: () => localforage.setItem(getStorageKey('chatSettings'), settings) });
    promises.push({ key: 'chatMessages', val: () => localforage.setItem(getStorageKey('chatMessages'), messages) });
    promises.push({ key: 'customReplies', val: () => localforage.setItem(getStorageKey('customReplies'), customReplies) });
    promises.push({ key: 'customPokes', val: () => localforage.setItem(getStorageKey('customPokes'), customPokes) });
    promises.push({ key: 'customStatuses', val: () => localforage.setItem(getStorageKey('customStatuses'), customStatuses) });
    promises.push({ key: 'customMottos', val: () => localforage.setItem(getStorageKey('customMottos'), customMottos) });
    promises.push({ key: 'customIntros', val: () => localforage.setItem(getStorageKey('customIntros'), customIntros) });
    promises.push({ key: 'anniversaries', val: () => localforage.setItem(getStorageKey('anniversaries'), anniversaries) });
    promises.push({ key: 'stickerLibrary', val: () => localforage.setItem(getStorageKey('stickerLibrary'), stickerLibrary) });
    promises.push({ key: 'myStickerLibrary', val: () => localforage.setItem(getStorageKey('myStickerLibrary'), myStickerLibrary) });
    promises.push({ key: 'customThemes', val: () => localforage.setItem(getStorageKey('customThemes'), customThemes) });
    promises.push({ key: 'customEmojis', val: () => localforage.setItem(getStorageKey('customEmojis'), customEmojis) });
    promises.push({ key: 'partnerAvatar', val: () => { const img = DOMElements.partner.avatar.querySelector('img'); if (img) localforage.setItem(getStorageKey('partnerAvatar'), img.src); else localforage.removeItem(getStorageKey('partnerAvatar')); } });
    promises.push({ key: 'myAvatar', val: () => { const img = DOMElements.me.avatar.querySelector('img'); if (img) localforage.setItem(getStorageKey('myAvatar'), img.src); else localforage.removeItem(getStorageKey('myAvatar')); } });
    if (window.customReplyGroups) promises.push({ key: 'customReplyGroups', val: () => localforage.setItem(getStorageKey('customReplyGroups'), window.customReplyGroups) });
    if (window.customPokeGroups) promises.push({ key: 'customPokeGroups', val: () => localforage.setItem(getStorageKey('customPokeGroups'), window.customPokeGroups) });
    if (window.customStatusGroups) promises.push({ key: 'customStatusGroups', val: () => localforage.setItem(getStorageKey('customStatusGroups'), window.customStatusGroups) });
    await Promise.allSettled(promises.map(p => p.val()));
};

function renderMessages(preserveScroll = false) {
    const container = DOMElements.chatContainer;
    const msgsToRender = messages.slice(Math.max(0, messages.length - displayedMessageCount));
    DOMElements.emptyState.style.display = messages.length === 0 ? 'flex' : 'none';
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    msgsToRender.forEach(msg => {
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${msg.sender === 'user' ? 'sent' : 'received'}`;
        wrapper.dataset.id = msg.id;
        const bubble = document.createElement('div');
        bubble.className = `message message-${msg.sender === 'user' ? 'sent' : 'received'} ${settings.bubbleStyle}`;
        if (msg.type === 'voice' && msg.voiceData) {
            bubble.innerHTML = `<div class="message-voice" onclick="this.querySelector('audio').play()">
                <button class="voice-play-btn"><i class="fas fa-play"></i></button>
                <div class="voice-wave"><span></span><span></span><span></span><span></span><span></span></div>
                <audio src="${msg.voiceData}" preload="auto"></audio>
            </div>`;
        } else {
            bubble.innerHTML = msg.text ? msg.text.replace(/\n/g, '<br>') : '';
            if (msg.image) bubble.innerHTML += `<img src="${msg.image}" style="max-width:200px;border-radius:12px;margin-top:5px;">`;
        }
        wrapper.appendChild(bubble);
        if (msg.sender === 'user') {
            const meta = document.createElement('div');
            meta.className = 'message-meta';
            meta.innerHTML = msg.status === 'read' ? '<span class="read-receipt read"><i class="fas fa-check-double"></i></span>' : '<span class="read-receipt"><i class="fas fa-check"></i></span>';
            wrapper.appendChild(meta);
        }
        fragment.appendChild(wrapper);
    });
    container.appendChild(fragment);
    if (!preserveScroll) container.scrollTop = container.scrollHeight;
}

const addMessage = (message) => {
    if (!(message.timestamp instanceof Date)) message.timestamp = new Date(message.timestamp);
    messages.push(message);
    DOMElements.emptyState.style.display = 'none';
    renderMessages();
    throttledSaveData();
};

function sendMessage(textOverride = null) {
    const text = textOverride || DOMElements.messageInput.value.trim();
    const imageFile = DOMElements.imageInput && DOMElements.imageInput.files[0];
    if (!text && !imageFile) return;
    DOMElements.messageInput.value = '';
    DOMElements.messageInput.style.height = '46px';
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        showNotification('图片大小不能超过5MB', 'error');
        if (DOMElements.imageInput) DOMElements.imageInput.value = '';
        return;
    }
    const createMessage = (imgSrc) => {
        addMessage({
            id: Date.now(),
            sender: 'user',
            text: text || '',
            image: imgSrc || null,
            timestamp: new Date(),
            status: 'sent',
            type: 'normal'
        });
        playSound('send');
        const randomDelay = settings.replyDelayMin + Math.random() * (settings.replyDelayMax - settings.replyDelayMin);
        if (settings.typingIndicatorEnabled) showTypingIndicator();
        setTimeout(() => { simulateReply(); }, randomDelay);
    };
    if (imageFile) {
        optimizeImage(imageFile).then(createMessage).catch(() => showNotification('图片处理失败', 'error'));
        if (DOMElements.imageInput) DOMElements.imageInput.value = '';
    } else {
        createMessage();
    }
}

function showTypingIndicator() {
    const tiWrapper = document.getElementById('typing-indicator-wrapper');
    if (tiWrapper && settings.typingIndicatorEnabled) tiWrapper.style.display = 'block';
}

window.simulateReply = function() {
    if (!customReplies || customReplies.length === 0) {
        showNotification('回复库为空，请先添加字卡', 'info');
        return;
    }
    function getReplyFromComboOrSingle(pool) {
        var comboCards = window.comboCards;
        if (comboCards && comboCards.length > 0 && Math.random() < 0.3) {
            var combo = comboCards[Math.floor(Math.random() * comboCards.length)];
            if (combo.items && combo.items.length >= 2) return combo.items.join(combo.separator || ' ');
        }
        return pool[Math.floor(Math.random() * pool.length)];
    }
    var disabledItemsOnce = new Set();
    try { const raw = localStorage.getItem('disabledReplyItems'); if (raw) disabledItemsOnce = new Set(JSON.parse(raw)); } catch(e) {}
    var replyPoolOnce = customReplies.filter(r => !disabledItemsOnce.has(String(r).trim()));
    if (!replyPoolOnce.length) { showNotification('可用回复为空', 'info'); return; }
    showTypingIndicator();
    var replyCount = Math.random() < 0.7 ? 1 : 2;
    var delay = 0;
    for (var i = 0; i < replyCount; i++) {
        var delayRange = settings.replyDelayMax - settings.replyDelayMin;
        delay += settings.replyDelayMin + Math.random() * delayRange;
        (function(idx) {
            setTimeout(function() {
                try {
                    var replyText = '';
                    for (var t = 0; t < 6; t++) {
                        var picked = getReplyFromComboOrSingle(replyPoolOnce);
                        if (picked && String(picked).trim()) {
                            replyText = String(picked).trim();
                            break;
                        }
                    }
                    if (replyText) {
                        addMessage({
                            id: Date.now() + idx,
                            sender: settings.partnerName || '对方',
                            text: replyText,
                            timestamp: new Date().toISOString(),
                            status: 'received',
                            type: 'normal'
                        });
                        playSound('message');
                    }
                    if (idx === replyCount - 1) {
                        var ti = document.getElementById('typing-indicator-wrapper');
                        if (ti) ti.style.display = 'none';
                    }
                } catch(e) { console.error(e); }
            }, delay);
        })(i);
    }
};

function showModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.style.zIndex = '99999';
    var content = modal.querySelector('.modal-content');
    if (content) {
        content.style.opacity = '1';
        content.style.transform = 'translateY(0) scale(1)';
    }
}

function hideModal(modal) {
    if (!modal) return;
    var content = modal.querySelector('.modal-content');
    if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px) scale(0.95)';
    }
    setTimeout(function() {
        modal.style.display = 'none';
    }, 300);
}

function updateUI() {
    document.documentElement.setAttribute('data-theme', settings.isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-color-theme', settings.colorTheme);
    if (DOMElements.partner && DOMElements.partner.name) DOMElements.partner.name.textContent = settings.partnerName;
    if (DOMElements.me && DOMElements.me.name) DOMElements.me.name.textContent = settings.myName;
    renderMessages();
}

function getStorageKey(key) {
    if (!SESSION_ID) throw new Error('SESSION_ID 未初始化');
    return `${APP_PREFIX}${SESSION_ID}_${key}`;
}

document.addEventListener('DOMContentLoaded', function() {
    var chatArea = document.querySelector('.main-chat-area');
    var historyLoader = document.getElementById('history-loader');
    if (chatArea && historyLoader && typeof IntersectionObserver !== 'undefined') {
        var observer = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting && messages.length > 0 && displayedMessageCount < messages.length) {
                loadMoreHistory();
            }
        },{ root: chatArea, rootMargin: '200px 0px 0px 0px', threshold: 0.01 });
        observer.observe(historyLoader);
    }
});
