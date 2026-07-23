// envelope.js - 完整重写版（修复所有已知问题）
var envelopeData = { outbox: [], inbox: [] };
var currentEnvTab = 'outbox';
var editingEnvId = null;
var editingEnvSection = null;

async function loadEnvelopeData() {
    try {
        var saved = await localforage.getItem(getStorageKey('envelopeData'));
        if (saved && typeof saved === 'object') {
            envelopeData = saved;
            if (!Array.isArray(envelopeData.outbox)) envelopeData.outbox = [];
            if (!Array.isArray(envelopeData.inbox)) envelopeData.inbox = [];
        }
    } catch(e) {
        envelopeData = { outbox: [], inbox: [] };
    }
}

function saveEnvelopeData() {
    try {
        localforage.setItem(getStorageKey('envelopeData'), envelopeData).catch(function(){});
    } catch(e) {}
}

// 渲染所有列表
function renderEnvelopeLists() {
    renderOutboxList();
    renderInboxList();
}

function renderOutboxList() {
    var list = document.getElementById('env-outbox-list');
    if (!list) return;
    if (!envelopeData.outbox || envelopeData.outbox.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有寄出任何信件</div>';
        return;
    }
    list.innerHTML = envelopeData.outbox.slice().reverse().map(function(letter) {
        var date = new Date(letter.sentTime).toLocaleString('zh-CN');
        var preview = (letter.content || '').substring(0, 40);
        return '<div style="padding:10px;border-bottom:1px solid var(--border-color);">' +
               '<div style="font-weight:bold;">📤 寄出 · ' + date + '</div>' +
               '<div style="color:var(--text-secondary);margin-top:4px;">' + preview + '...</div>' +
               '</div>';
    }).join('');
}

function renderInboxList() {
    var list = document.getElementById('env-inbox-list');
    if (!list) return;
    if (!envelopeData.inbox || envelopeData.inbox.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有收到回信</div>';
        return;
    }
    list.innerHTML = envelopeData.inbox.slice().reverse().map(function(letter) {
        var date = new Date(letter.receivedTime).toLocaleString('zh-CN');
        var preview = (letter.content || '').substring(0, 40);
        var isNew = letter.isNew ? ' <span style="color:red;">●</span>' : '';
        return '<div style="padding:10px;border-bottom:1px solid var(--border-color);">' +
               '<div style="font-weight:bold;">📥 收到 · ' + date + isNew + '</div>' +
               '<div style="color:var(--text-secondary);margin-top:4px;">' + preview + '...</div>' +
               '</div>';
    }).join('');
}

// 切换标签
window.switchEnvTab = function(tab) {
    currentEnvTab = tab;
    var outboxSection = document.getElementById('env-outbox-section');
    var inboxSection = document.getElementById('env-inbox-section');
    var composeForm = document.getElementById('env-compose-form');
    var mainCloseBtn = document.getElementById('env-main-close-btn');
    var outboxTab = document.getElementById('env-tab-outbox');
    var inboxTab = document.getElementById('env-tab-inbox');
    
    if (outboxSection) outboxSection.style.display = (tab === 'outbox') ? 'block' : 'none';
    if (inboxSection) inboxSection.style.display = (tab === 'inbox') ? 'block' : 'none';
    if (composeForm) composeForm.style.display = 'none';
    if (mainCloseBtn) mainCloseBtn.style.display = 'flex';
    if (outboxTab) outboxTab.classList.toggle('active', tab === 'outbox');
    if (inboxTab) inboxTab.classList.toggle('active', tab === 'inbox');
    
    renderEnvelopeLists();
};

// 打开写信表单
window.openNewEnvelopeForm = function() {
    var outboxSection = document.getElementById('env-outbox-section');
    var inboxSection = document.getElementById('env-inbox-section');
    var composeForm = document.getElementById('env-compose-form');
    var mainCloseBtn = document.getElementById('env-main-close-btn');
    var input = document.getElementById('envelope-input');
    var checkbox = document.getElementById('env-send-to-chat');
    
    if (outboxSection) outboxSection.style.display = 'none';
    if (inboxSection) inboxSection.style.display = 'none';
    if (mainCloseBtn) mainCloseBtn.style.display = 'none';
    if (composeForm) {
        composeForm.style.display = 'block';
        composeForm.style.visibility = 'visible';
    }
    if (input) input.value = '';
    if (checkbox) checkbox.checked = false;
};

// 取消写信
window.cancelEnvelopeCompose = function() {
    var composeForm = document.getElementById('env-compose-form');
    var mainCloseBtn = document.getElementById('env-main-close-btn');
    if (composeForm) composeForm.style.display = 'none';
    if (mainCloseBtn) mainCloseBtn.style.display = 'flex';
    switchEnvTab(currentEnvTab);
};

// 寄出信件（核心函数）
window.handleSendEnvelope = function() {
    var input = document.getElementById('envelope-input');
    var content = input ? input.value.trim() : '';
    
    if (!content) {
        if (typeof showNotification === 'function') showNotification('信件内容不能为空', 'warning');
        return;
    }
    
    try {
        var now = Date.now();
        var newLetter = {
            id: 'env_' + now + '_' + Math.random().toString(36).substr(2, 6),
            content: content,
            sentTime: now,
            replyTime: now + (10 * 60 * 60 * 1000),
            status: 'pending'
        };
        
        // 确保数据对象存在
        if (!envelopeData) envelopeData = { outbox: [], inbox: [] };
        if (!Array.isArray(envelopeData.outbox)) envelopeData.outbox = [];
        
        envelopeData.outbox.unshift(newLetter);
        
        // 保存数据
        try {
            localforage.setItem(getStorageKey('envelopeData'), envelopeData).catch(function(){});
        } catch(e) {}
        
        // 发送到聊天（可选）
        var sendToChat = document.getElementById('env-send-to-chat');
        if (sendToChat && sendToChat.checked && typeof addMessage === 'function') {
            addMessage({
                id: now,
                sender: 'user',
                text: '📨 寄出了一封信：\n' + content,
                timestamp: new Date(),
                status: 'sent',
                type: 'normal'
            });
            if (typeof playSound === 'function') playSound('send');
        }
        
        // 关闭表单，显示列表
        var composeForm = document.getElementById('env-compose-form');
        var mainCloseBtn = document.getElementById('env-main-close-btn');
        var outboxSection = document.getElementById('env-outbox-section');
        
        if (composeForm) composeForm.style.display = 'none';
        if (mainCloseBtn) mainCloseBtn.style.display = 'flex';
        if (outboxSection) outboxSection.style.display = 'block';
        if (input) input.value = '';
        
        // 切换到寄出标签并刷新
        currentEnvTab = 'outbox';
        renderEnvelopeLists();
        
        if (typeof showNotification === 'function') {
            showNotification('信已寄出 ✨', 'success');
        }
        
    } catch(err) {
        if (typeof showNotification === 'function') {
            showNotification('寄信失败：' + (err.message || '未知错误'), 'error');
        }
    }
};

// 初始化：加载数据
loadEnvelopeData().then(function() {
    renderEnvelopeLists();
}).catch(function() {
    envelopeData = { outbox: [], inbox: [] };
    renderEnvelopeLists();
});
