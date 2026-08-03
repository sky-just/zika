// envelope.js - 最终稳定版
var envelopeData = { outbox: [], inbox: [] };
var currentEnvTab = 'outbox';

// 安全获取元素
function $id(id) { return document.getElementById(id); }

// 安全设置样式
function setDisplay(id, value) {
    var el = $id(id);
    if (el) el.style.display = value;
}

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

// 保存数据
function saveEnvelopeData() {
    try {
        if (typeof localforage !== 'undefined' && typeof getStorageKey === 'function') {
            localforage.setItem(getStorageKey('envelopeData'), envelopeData).catch(function(){});
        }
    } catch(e) {}
}

// 渲染寄出的信
function renderOutboxList() {
    var list = $id('env-outbox-list');
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

// 渲染收到的信
function renderInboxList() {
    var list = $id('env-inbox-list');
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

function renderEnvelopeLists() {
    renderOutboxList();
    renderInboxList();
}

// ===== 寄信核心 =====
window.handleSendEnvelope = function() {
    var input = $id('envelope-input');
    var content = input ? input.value.trim() : '';
    
    if (!content) {
        if (typeof showNotification === 'function') showNotification('请先写下你的思念...', 'warning');
        return;
    }

    var newLetter = {
        id: 'env_' + Date.now(),
        content: content,
        sentTime: Date.now(),
        status: 'pending'
    };

    if (!envelopeData) envelopeData = { outbox: [], inbox: [] };
    if (!Array.isArray(envelopeData.outbox)) envelopeData.outbox = [];
    envelopeData.outbox.unshift(newLetter);

    saveEnvelopeData();

    setDisplay('env-compose-form', 'none');
    setDisplay('env-main-close-btn', 'flex');
    setDisplay('env-outbox-section', 'block');
    setDisplay('env-inbox-section', 'none');
    if (input) input.value = '';

    renderEnvelopeLists();
    if (typeof showNotification === 'function') showNotification('信已寄出 ✨', 'success');
};

// ===== 提笔写信 =====
window.openNewEnvelopeForm = function() {
    setDisplay('env-outbox-section', 'none');
    setDisplay('env-inbox-section', 'none');
    setDisplay('env-main-close-btn', 'none');
    
    var form = $id('env-compose-form');
    if (form) {
        form.style.display = 'block';
        form.style.visibility = 'visible';
    }
    
    var input = $id('envelope-input');
    if (input) input.value = '';
    
    var checkbox = $id('env-send-to-chat');
    if (checkbox) checkbox.checked = false;
};

// ===== 取消写信 =====
window.cancelEnvelopeCompose = function() {
    setDisplay('env-compose-form', 'none');
    setDisplay('env-main-close-btn', 'flex');
    setDisplay('env-outbox-section', 'block');
};

// ===== 标签切换 =====
window.switchEnvTab = function(tab) {
    currentEnvTab = tab;
    setDisplay('env-outbox-section', tab === 'outbox' ? 'block' : 'none');
    setDisplay('env-inbox-section', tab === 'inbox' ? 'block' : 'none');
    setDisplay('env-compose-form', 'none');
    setDisplay('env-main-close-btn', 'flex');
    renderEnvelopeLists();
};

// ===== 自激活加载机制 =====
(function() {
    // 方式一：监听信封弹窗的样式变化
    var modal = $id('envelope-modal');
    if (modal) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.style.display === 'flex' || mutation.target.style.display === 'block') {
                    loadEnvelopeData();
                }
            });
        });
        observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
    }

    // 方式二：延迟加载作为兜底
    setTimeout(function() {
        loadEnvelopeData();
    }, 2000);
})();
