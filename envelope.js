// envelope.js - 最终稳定版（使用 onclick 属性绑定，兼容 core.js 接口）
(function() {
    'use strict';

    // 全局数据变量（兼容 core.js）
    window.envelopeData = window.envelopeData || { outbox: [], inbox: [] };
    var currentTab = 'outbox';

    // 安全获取元素
    function $(id) { return document.getElementById(id); }

    // 安全设置显示状态
    function hide(id) { var el = $(id); if (el) el.style.display = 'none'; }
    function show(id) { var el = $(id); if (el) { el.style.display = 'block'; el.style.visibility = 'visible'; } }
    function showFlex(id) { var el = $(id); if (el) el.style.display = 'flex'; }

    // 存储键（与 core.js 一致）
    function storageKey() {
        if (typeof getStorageKey === 'function') return getStorageKey('envelopeData');
        return 'CHAT_APP_V3_envelopeData';
    }

    // ===== 核心接口：加载数据 =====
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

    // ===== 核心接口：保存数据 =====
    window.saveEnvelopeData = function() {
        if (typeof localforage === 'undefined') return;
        localforage.setItem(storageKey(), window.envelopeData).catch(function(){});
    };

    // ===== 渲染列表 =====
    function renderOutbox() {
        var list = $('env-outbox-list');
        if (!list) return;
        var outbox = window.envelopeData.outbox || [];
        if (outbox.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有寄出任何信件</div>';
        } else {
            list.innerHTML = outbox.slice().reverse().map(function(letter) {
                var d = new Date(letter.sentTime).toLocaleString('zh-CN');
                var p = (letter.content || '').substring(0, 35);
                return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">📤 ' + d + '<br>' + p + '</div>';
            }).join('');
        }
    }

    function renderInbox() {
        var list = $('env-inbox-list');
        if (!list) return;
        var inbox = window.envelopeData.inbox || [];
        if (inbox.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有收到回信</div>';
        } else {
            list.innerHTML = inbox.slice().reverse().map(function(letter) {
                var d = new Date(letter.receivedTime).toLocaleString('zh-CN');
                var p = (letter.content || '').substring(0, 35);
                return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">📥 ' + d + '<br>' + p + '</div>';
            }).join('');
        }
    }

    function renderAll() {
        renderOutbox();
        renderInbox();
    }

    // ===== 切换标签 =====
    window.switchEnvTab = function(tab) {
        currentTab = tab;
        if (tab === 'outbox') {
            show('env-outbox-section');
            hide('env-inbox-section');
        } else {
            show('env-inbox-section');
            hide('env-outbox-section');
        }
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        renderAll();
    };

    // ===== 提笔写信 =====
    window.openNewEnvelopeForm = function() {
        hide('env-outbox-section');
        hide('env-inbox-section');
        hide('env-main-close-btn');
        var form = $('env-compose-form');
        if (form) {
            form.style.display = 'block';
            form.style.visibility = 'visible';
        }
        var input = $('envelope-input');
        if (input) input.value = '';
        var cb = $('env-send-to-chat');
        if (cb) cb.checked = false;
    };

    // ===== 取消写信 =====
    window.cancelEnvelopeCompose = function() {
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        currentTab = 'outbox';
    };

    // ===== 寄信 =====
    window.handleSendEnvelope = function() {
        var input = $('envelope-input');
        var content = input ? input.value.trim() : '';
        if (!content) {
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

        // 保存到存储
        window.saveEnvelopeData();

        // 界面切换
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        currentTab = 'outbox';
        if (input) input.value = '';

        renderAll();

        if (typeof showNotification === 'function') showNotification('信已寄出 ✨', 'success');
    };

    // ===== 自动修复 onclick 属性 =====
    function fixOnclickAttributes() {
        // 提笔写信按钮
        var newBtn = $('new-envelope-btn');
        if (newBtn) newBtn.setAttribute('onclick', 'openNewEnvelopeForm()');

        // 寄信按钮
        var sendBtn = $('send-envelope');
        if (sendBtn) sendBtn.setAttribute('onclick', 'handleSendEnvelope()');

        // 取消按钮
        var cancelBtn = $('cancel-compose');
        if (cancelBtn) cancelBtn.setAttribute('onclick', 'cancelEnvelopeCompose()');

        // 标签切换
        var outboxTab = $('env-tab-outbox');
        if (outboxTab) outboxTab.setAttribute('onclick', "switchEnvTab('outbox')");
        var inboxTab = $('env-tab-inbox');
        if (inboxTab) inboxTab.setAttribute('onclick', "switchEnvTab('inbox')");

        // 关闭按钮
        var closeBtn = $('cancel-envelope');
        if (closeBtn) closeBtn.setAttribute('onclick', "hideModal(document.getElementById('envelope-modal'))");
    }

    // ===== 初始化 =====
    function init() {
        // 加载数据
        window.loadEnvelopeData().then(function() {
            renderAll();
        }).catch(function() {
            renderAll();
        });

        // 延迟修复 onclick 属性，确保 DOM 完全加载
        setTimeout(fixOnclickAttributes, 300);
        // 二次保障
        setTimeout(fixOnclickAttributes, 1000);
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
