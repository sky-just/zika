// envelope.js - 补充 core.js 兼容接口
(function() {
    'use strict';

    // 全局数据变量
    window.envelopeData = window.envelopeData || { outbox: [], inbox: [] };
    var currentTab = 'outbox';

    function $(id) { return document.getElementById(id); }
    function hide(id) { var el = $(id); if (el) el.style.display = 'none'; }
    function show(id) { var el = $(id); if (el) { el.style.display = 'block'; el.style.visibility = 'visible'; } }
    function showFlex(id) { var el = $(id); if (el) el.style.display = 'flex'; }

    function storageKey() {
        if (typeof getStorageKey === 'function') return getStorageKey('envelopeData');
        return 'CHAT_APP_V3_envelopeData';
    }

    // ===== core.js 需要的接口 =====
    window.loadEnvelopeData = async function() {
        if (typeof localforage === 'undefined') return;
        try {
            var saved = await localforage.getItem(storageKey());
            if (saved && typeof saved === 'object') {
                window.envelopeData = saved;
                if (!Array.isArray(window.envelopeData.outbox)) window.envelopeData.outbox = [];
                if (!Array.isArray(window.envelopeData.inbox)) window.envelopeData.inbox = [];
            }
        } catch(e) {
            window.envelopeData = { outbox: [], inbox: [] };
        }
        renderAll();
    };

    window.saveEnvelopeData = function() {
        if (typeof localforage === 'undefined') return;
        localforage.setItem(storageKey(), window.envelopeData).catch(function(){});
    };

    // ===== index2.html onclick 需要的接口 =====
    window.openNewEnvelopeForm = function() {
        hide('env-outbox-section');
        hide('env-inbox-section');
        hide('env-main-close-btn');
        var form = $('env-compose-form');
        if (form) { form.style.display = 'block'; form.style.visibility = 'visible'; }
        var input = $('envelope-input'); if (input) input.value = '';
        var cb = $('env-send-to-chat'); if (cb) cb.checked = false;
    };

    window.cancelEnvelopeCompose = function() {
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        currentTab = 'outbox';
    };

    window.switchEnvTab = function(tab) {
        currentTab = tab;
        if (tab === 'outbox') { show('env-outbox-section'); hide('env-inbox-section'); }
        else { show('env-inbox-section'); hide('env-outbox-section'); }
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        renderAll();
    };

    var _sending = false;
    window.handleSendEnvelope = function() {
        if (_sending) return;
        _sending = true;

        var input = $('envelope-input');
        var content = input ? input.value.trim() : '';
        if (!content) {
            _sending = false;
            if (typeof showNotification === 'function') showNotification('请先写下你的思念...', 'warning');
            return;
        }

        var outbox = window.envelopeData.outbox || [];
        outbox.unshift({
            id: 'env_' + Date.now(),
            content: content,
            sentTime: Date.now(),
            status: 'pending'
        });
        window.envelopeData.outbox = outbox;
        window.saveEnvelopeData();

        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        currentTab = 'outbox';
        if (input) input.value = '';

        renderAll();
        if (typeof showNotification === 'function') showNotification('信已寄出 ✨', 'success');

        setTimeout(function() { _sending = false; }, 500);
    };

    // ===== 渲染 =====
    function renderOutbox() {
        var list = $('env-outbox-list');
        if (!list) return;
        var arr = window.envelopeData.outbox || [];
        if (arr.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有寄出任何信件</div>';
        } else {
            list.innerHTML = arr.slice().reverse().map(function(l) {
                var d = new Date(l.sentTime).toLocaleString('zh-CN');
                var p = (l.content || '').substring(0, 35);
                return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">📤 ' + d + '<br>' + p + '</div>';
            }).join('');
        }
    }

    function renderInbox() {
        var list = $('env-inbox-list');
        if (!list) return;
        var arr = window.envelopeData.inbox || [];
        if (arr.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有收到回信</div>';
        } else {
            list.innerHTML = arr.slice().reverse().map(function(l) {
                var d = new Date(l.receivedTime).toLocaleString('zh-CN');
                var p = (l.content || '').substring(0, 35);
                return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">📥 ' + d + '<br>' + p + '</div>';
            }).join('');
        }
    }

    function renderAll() { renderOutbox(); renderInbox(); }

    // ===== 初始化 =====
    function init() {
        window.loadEnvelopeData().then(renderAll).catch(renderAll);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
