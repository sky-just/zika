// envelope.js - 全新简洁版
(function() {
    'use strict';

    // 全局数据
    window.envelopeData = window.envelopeData || { outbox: [], inbox: [] };
    var sending = false;

    // 获取元素
    function $(id) { return document.getElementById(id); }

    // 安全隐藏/显示
    function hide(id) { var el = $(id); if (el) el.style.display = 'none'; }
    function show(id) { var el = $(id); if (el) { el.style.display = 'block'; } }
    function showFlex(id) { var el = $(id); if (el) el.style.display = 'flex'; }

    // 存储键
    function key() {
        if (typeof getStorageKey === 'function') return getStorageKey('envelopeData');
        return 'CHAT_APP_V3_envelopeData';
    }

    // ===== 加载数据 =====
    window.loadEnvelopeData = async function() {
        if (typeof localforage === 'undefined') return;
        try {
            var saved = await localforage.getItem(key());
            if (saved && saved.outbox) window.envelopeData = saved;
        } catch(e) {}
        refresh();
    };

    // ===== 保存数据 =====
    window.saveEnvelopeData = function() {
        if (typeof localforage === 'undefined') return;
        localforage.setItem(key(), window.envelopeData).catch(function(){});
    };

    // ===== 刷新列表 =====
    function refresh() {
        var out = $('env-outbox-list');
        var inn = $('env-inbox-list');
        var d = window.envelopeData;

        if (out) {
            var arr = d.outbox || [];
            out.innerHTML = arr.length === 0
                ? '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有寄出任何信件</div>'
                : arr.slice().reverse().map(function(l) {
                    var t = new Date(l.sentTime).toLocaleString('zh-CN');
                    var p = (l.content || '').slice(0, 35);
                    return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">📤 ' + t + '<br>' + p + '</div>';
                }).join('');
        }

        if (inn) {
            var arr2 = d.inbox || [];
            inn.innerHTML = arr2.length === 0
                ? '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有收到回信</div>'
                : arr2.slice().reverse().map(function(l) {
                    var t = new Date(l.receivedTime).toLocaleString('zh-CN');
                    var p = (l.content || '').slice(0, 35);
                    return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">📥 ' + t + '<br>' + p + '</div>';
                }).join('');
        }
    }

    // ===== 提笔写信 =====
    window.openNewEnvelopeForm = function() {
        hide('env-outbox-section');
        hide('env-inbox-section');
        hide('env-main-close-btn');
        show('env-compose-form');
        var inp = $('envelope-input'); if (inp) inp.value = '';
    };

    // ===== 取消写信 =====
    window.cancelEnvelopeCompose = function() {
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
    };

    // ===== 切换标签 =====
    window.switchEnvTab = function(tab) {
        if (tab === 'outbox') { show('env-outbox-section'); hide('env-inbox-section'); }
        else { show('env-inbox-section'); hide('env-outbox-section'); }
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        refresh();
    };

    // ===== 寄信 =====
    window.handleSendEnvelope = function() {
        if (sending) return;
        sending = true;

        var inp = $('envelope-input');
        var text = inp ? inp.value.trim() : '';
        if (!text) {
            sending = false;
            if (typeof showNotification === 'function') showNotification('请先写下你的思念...', 'warning');
            return;
        }

        var arr = window.envelopeData.outbox || [];
        arr.unshift({ id: 'env_' + Date.now(), content: text, sentTime: Date.now() });
        window.envelopeData.outbox = arr;
        window.saveEnvelopeData();

        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        if (inp) inp.value = '';

        refresh();
        if (typeof showNotification === 'function') showNotification('信已寄出 ✨', 'success');

        setTimeout(function() { sending = false; }, 500);
    };

    // ===== 初始化 =====
    window.loadEnvelopeData();
})();
