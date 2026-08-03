// envelope.js - 防重入、防闪退、兼容 core.js 接口
(function () {
    'use strict';

    var _sending = false; // 防止重复点击寄出

    // 确保全局数据存在
    window.envelopeData = window.envelopeData || { outbox: [], inbox: [] };

    function $id(id) { return document.getElementById(id); }

    function hide(id) { var el = $id(id); if (el) el.style.display = 'none'; }
    function show(id) { var el = $id(id); if (el) { el.style.display = 'block'; el.style.visibility = 'visible'; } }
    function showFlex(id) { var el = $id(id); if (el) el.style.display = 'flex'; }

    function storageKey() {
        if (typeof getStorageKey === 'function') return getStorageKey('envelopeData');
        return 'CHAT_APP_V3_envelopeData';
    }

    // === 加载数据（供 core.js 调用） ===
    window.loadEnvelopeData = async function () {
        if (typeof localforage === 'undefined') return;
        try {
            var saved = await localforage.getItem(storageKey());
            if (saved && typeof saved === 'object') {
                window.envelopeData = saved;
                if (!Array.isArray(window.envelopeData.outbox)) window.envelopeData.outbox = [];
                if (!Array.isArray(window.envelopeData.inbox)) window.envelopeData.inbox = [];
            }
        } catch (e) {
            window.envelopeData = { outbox: [], inbox: [] };
        }
        renderLists();
    };

    // === 保存数据（供 core.js 调用） ===
    window.saveEnvelopeData = function () {
        if (typeof localforage === 'undefined') return;
        localforage.setItem(storageKey(), window.envelopeData).catch(function () {});
    };

    // === 渲染列表 ===
    function renderOutbox() {
        var list = $id('env-outbox-list');
        if (!list) return;
        var arr = window.envelopeData.outbox || [];
        if (arr.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有寄出任何信件</div>';
        } else {
            list.innerHTML = arr.slice().reverse().map(function (l) {
                var d = new Date(l.sentTime).toLocaleString('zh-CN');
                var p = (l.content || '').substring(0, 35);
                return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">📤 ' + d + '<br>' + p + '</div>';
            }).join('');
        }
    }

    function renderInbox() {
        var list = $id('env-inbox-list');
        if (!list) return;
        var arr = window.envelopeData.inbox || [];
        if (arr.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有收到回信</div>';
        } else {
            list.innerHTML = arr.slice().reverse().map(function (l) {
                var d = new Date(l.receivedTime).toLocaleString('zh-CN');
                var p = (l.content || '').substring(0, 35);
                return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">📥 ' + d + '<br>' + p + '</div>';
            }).join('');
        }
    }

    function renderLists() {
        renderOutbox();
        renderInbox();
    }

    // === 切换标签 ===
    window.switchEnvTab = function (tab) {
        if (tab === 'outbox') { show('env-outbox-section'); hide('env-inbox-section'); }
        else { show('env-inbox-section'); hide('env-outbox-section'); }
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        renderLists();
    };

    // === 提笔写信 ===
    window.openNewEnvelopeForm = function () {
        // 极安全操作：只有元素存在才操作
        var out = $id('env-outbox-section'); if (out) out.style.display = 'none';
        var inb = $id('env-inbox-section'); if (inb) inb.style.display = 'none';
        var cb = $id('env-main-close-btn'); if (cb) cb.style.display = 'none';
        var form = $id('env-compose-form');
        if (form) { form.style.display = 'block'; form.style.visibility = 'visible'; }
        var inp = $id('envelope-input'); if (inp) inp.value = '';
        var chk = $id('env-send-to-chat'); if (chk) chk.checked = false;
    };

    // === 取消写信 ===
    window.cancelEnvelopeCompose = function () {
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
    };

    // === 寄信（防重入） ===
    window.handleSendEnvelope = function () {
        if (_sending) return;          // 如果正在发送，直接忽略
        _sending = true;

        var input = $id('envelope-input');
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

        // 界面切换
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        if (input) input.value = '';

        renderLists();
        if (typeof showNotification === 'function') showNotification('信已寄出 ✨', 'success');

        // 解锁（延迟一点，防止快速双击）
        setTimeout(function () { _sending = false; }, 500);
    };

    // === 初始化：加载数据并强制修复 onclick 属性 ===
    function init() {
        // 加载数据
        window.loadEnvelopeData().then(renderLists).catch(renderLists);

        // 强制修复所有按钮的 onclick 属性（最重要的一步）
        function fixBtns() {
            var newBtn = $id('new-envelope-btn');
            if (newBtn) newBtn.setAttribute('onclick', 'openNewEnvelopeForm()');

            var sendBtn = $id('send-envelope');
            if (sendBtn) sendBtn.setAttribute('onclick', 'handleSendEnvelope()');

            var cancelBtn = $id('cancel-compose');
            if (cancelBtn) cancelBtn.setAttribute('onclick', 'cancelEnvelopeCompose()');

            var outTab = $id('env-tab-outbox');
            if (outTab) outTab.setAttribute('onclick', "switchEnvTab('outbox')");

            var inTab = $id('env-tab-inbox');
            if (inTab) inTab.setAttribute('onclick', "switchEnvTab('inbox')");

            var closeBtn = $id('cancel-envelope');
            if (closeBtn) closeBtn.setAttribute('onclick', "if(typeof hideModal==='function') hideModal(document.getElementById('envelope-modal'))");
        }

        // 立即修一次，再延迟修两次，确保万无一失
        fixBtns();
        setTimeout(fixBtns, 200);
        setTimeout(fixBtns, 800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
