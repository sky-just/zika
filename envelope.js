// envelope.js - 终极极简版
window.envelopeData = { outbox: [], inbox: [] };

function storageKey() {
    if (typeof getStorageKey === 'function') return getStorageKey('envelopeData');
    return 'CHAT_APP_V3_envelopeData';
}

window.loadEnvelopeData = async function() {
    if (typeof localforage === 'undefined') return;
    try {
        var saved = await localforage.getItem(storageKey());
        if (saved && saved.outbox) window.envelopeData = saved;
    } catch(e) {}
    renderEnvelopeLists();
};

window.saveEnvelopeData = function() {
    if (typeof localforage === 'undefined') return;
    localforage.setItem(storageKey(), window.envelopeData).catch(function(){});
};

function renderEnvelopeLists() {
    var out = document.getElementById('env-outbox-list');
    var inn = document.getElementById('env-inbox-list');
    var d = window.envelopeData;
    if (out) {
        out.innerHTML = (d.outbox || []).length === 0
            ? '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有寄出任何信件</div>'
            : d.outbox.slice().reverse().map(function(l) {
                return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);">📤 ' + new Date(l.sentTime).toLocaleString('zh-CN') + '<br>' + (l.content||'').slice(0,35) + '</div>';
            }).join('');
    }
    if (inn) {
        inn.innerHTML = (d.inbox || []).length === 0
            ? '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有收到回信</div>'
            : d.inbox.slice().reverse().map(function(l) {
                return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);">📥 ' + new Date(l.receivedTime).toLocaleString('zh-CN') + '<br>' + (l.content||'').slice(0,35) + '</div>';
            }).join('');
    }
}

window.openNewEnvelopeForm = function() {
    var a = document.getElementById('env-outbox-section');
    var b = document.getElementById('env-inbox-section');
    var c = document.getElementById('env-main-close-btn');
    var f = document.getElementById('env-compose-form');
    var i = document.getElementById('envelope-input');
    if (a) a.style.display = 'none';
    if (b) b.style.display = 'none';
    if (c) c.style.display = 'none';
    if (f) { f.style.display = 'block'; f.style.visibility = 'visible'; }
    if (i) i.value = '';
};

window.cancelEnvelopeCompose = function() {
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    document.getElementById('env-outbox-section').style.display = 'block';
};

window.switchEnvTab = function(tab) {
    if (tab === 'outbox') {
        document.getElementById('env-outbox-section').style.display = 'block';
        document.getElementById('env-inbox-section').style.display = 'none';
    } else {
        document.getElementById('env-outbox-section').style.display = 'none';
        document.getElementById('env-inbox-section').style.display = 'block';
    }
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    renderEnvelopeLists();
};

var _envSending = false;
window.handleSendEnvelope = function() {
    if (_envSending) return;
    _envSending = true;
    var i = document.getElementById('envelope-input');
    var t = i ? i.value.trim() : '';
    if (!t) {
        _envSending = false;
        if (typeof showNotification === 'function') showNotification('请先写下你的思念...', 'warning');
        return;
    }
    var arr = window.envelopeData.outbox || [];
    arr.unshift({ id: 'env_' + Date.now(), content: t, sentTime: Date.now() });
    window.envelopeData.outbox = arr;
    window.saveEnvelopeData();
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    document.getElementById('env-outbox-section').style.display = 'block';
    document.getElementById('env-inbox-section').style.display = 'none';
    if (i) i.value = '';
    renderEnvelopeLists();
    if (typeof showNotification === 'function') showNotification('信已寄出 ✨', 'success');
    setTimeout(function() { _envSending = false; }, 500);
};

setTimeout(function() { window.loadEnvelopeData(); }, 1000);
