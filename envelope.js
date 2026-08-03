// envelope.js - 精简修复版
var envelopeData = { outbox: [], inbox: [] };
var currentEnvTab = 'outbox';

// 从存储加载数据
async function loadEnvelopeData() {
    try {
        if (typeof localforage !== 'undefined' && typeof getStorageKey === 'function') {
            var saved = await localforage.getItem(getStorageKey('envelopeData'));
            if (saved && typeof saved === 'object') {
                envelopeData = saved;
                if (!Array.isArray(envelopeData.outbox)) envelopeData.outbox = [];
                if (!Array.isArray(envelopeData.inbox)) envelopeData.inbox = [];
            }
        }
    } catch(e) {
        envelopeData = { outbox: [], inbox: [] };
    }
    renderEnvelopeLists();
}

// 保存数据到存储
function saveEnvelopeData() {
    try {
        if (typeof localforage !== 'undefined' && typeof getStorageKey === 'function') {
            localforage.setItem(getStorageKey('envelopeData'), envelopeData).catch(function(){});
        }
    } catch(e) {}
}

// 渲染寄出的信列表
function renderOutboxList() {
    var list = document.getElementById('env-outbox-list');
    if (!list) return;
    var outbox = envelopeData.outbox || [];
    if (outbox.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有寄出任何信件</div>';
    } else {
        list.innerHTML = outbox.slice().reverse().map(function(letter) {
            var date = new Date(letter.sentTime).toLocaleString('zh-CN');
            var preview = (letter.content || '').substring(0, 35);
            return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">' +
                   '📤 ' + date + '<br>' + preview + '</div>';
        }).join('');
    }
}

// 渲染收到的信列表
function renderInboxList() {
    var list = document.getElementById('env-inbox-list');
    if (!list) return;
    var inbox = envelopeData.inbox || [];
    if (inbox.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有收到回信</div>';
    } else {
        list.innerHTML = inbox.slice().reverse().map(function(letter) {
            var date = new Date(letter.receivedTime).toLocaleString('zh-CN');
            var preview = (letter.content || '').substring(0, 35);
            return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">' +
                   '📥 ' + date + '<br>' + preview + '</div>';
        }).join('');
    }
}

// 渲染所有列表
function renderEnvelopeLists() {
    renderOutboxList();
    renderInboxList();
}

// ===== 寄信核心函数 =====
window.handleSendEnvelope = function() {
    var input = document.getElementById('envelope-input');
    var content = input ? input.value.trim() : '';
    
    if (!content) {
        if (typeof showNotification === 'function') {
            showNotification('请先写下你的思念...', 'warning');
        }
        return;
    }

    // 创建新信件
    var newLetter = {
        id: 'env_' + Date.now(),
        content: content,
        sentTime: Date.now(),
        status: 'pending'
    };

    // 确保数据对象存在
    if (!envelopeData) envelopeData = { outbox: [], inbox: [] };
    if (!Array.isArray(envelopeData.outbox)) envelopeData.outbox = [];
    envelopeData.outbox.unshift(newLetter);

    // 保存
    saveEnvelopeData();

    // 关闭写信界面，显示列表
    var form = document.getElementById('env-compose-form');
    var closeBtn = document.getElementById('env-main-close-btn');
    var outboxSection = document.getElementById('env-outbox-section');
    var inboxSection = document.getElementById('env-inbox-section');

    if (form) form.style.display = 'none';
    if (closeBtn) closeBtn.style.display = 'flex';
    if (outboxSection) outboxSection.style.display = 'block';
    if (inboxSection) inboxSection.style.display = 'none';
    if (input) input.value = '';

    // 刷新列表
    renderEnvelopeLists();

    if (typeof showNotification === 'function') {
        showNotification('信已寄出 ✨', 'success');
    }
};

// ===== 提笔写信 =====
window.openNewEnvelopeForm = function() {
    document.getElementById('env-outbox-section').style.display = 'none';
    document.getElementById('env-inbox-section').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'none';
    var form = document.getElementById('env-compose-form');
    if (form) {
        form.style.display = 'block';
        form.style.visibility = 'visible';
    }
    document.getElementById('envelope-input').value = '';
    document.getElementById('env-send-to-chat').checked = false;
};

// ===== 取消写信 =====
window.cancelEnvelopeCompose = function() {
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    document.getElementById('env-outbox-section').style.display = 'block';
};

// ===== 标签切换 =====
window.switchEnvTab = function(tab) {
    currentEnvTab = tab;
    document.getElementById('env-outbox-section').style.display = tab === 'outbox' ? 'block' : 'none';
    document.getElementById('env-inbox-section').style.display = tab === 'inbox' ? 'block' : 'none';
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    renderEnvelopeLists();
};

// ===== 页面加载时初始化 =====
setTimeout(function() {
    loadEnvelopeData();
}, 1000);
