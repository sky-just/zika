// envelope.js - 最终兼容版（与 core.js 接口对齐）
(function() {
    'use strict';

    // 内部数据变量
    var data = { outbox: [], inbox: [] };
    var currentTab = 'outbox';
    var eventsBound = false;

    // 安全获取元素
    function $(id) { return document.getElementById(id); }

    // 安全设置显示状态
    function hide(id) { var el = $(id); if (el) el.style.display = 'none'; }
    function show(id) { var el = $(id); if (el) { el.style.display = 'block'; el.style.visibility = 'visible'; } }
    function showFlex(id) { var el = $(id); if (el) el.style.display = 'flex'; }

    // 存储键（优先使用 getStorageKey，确保与 core.js 一致）
    function storageKey() {
        if (typeof getStorageKey === 'function') return getStorageKey('envelopeData');
        return 'CHAT_APP_V3_default_envelopeData';
    }

    // ===== 新增：兼容旧接口 loadEnvelopeData（供 core.js 调用） =====
    window.loadEnvelopeData = async function() {
        if (typeof localforage === 'undefined') return;
        try {
            var saved = await localforage.getItem(storageKey());
            if (saved && typeof saved === 'object') {
                data = saved;
                if (!Array.isArray(data.outbox)) data.outbox = [];
                if (!Array.isArray(data.inbox)) data.inbox = [];
            }
        } catch(e) {
            data = { outbox: [], inbox: [] };
        }
        // 同步到全局变量
        window.envelopeData = data;
    };

    // ===== 新增：兼容旧接口 saveEnvelopeData（供 core.js 调用） =====
    window.saveEnvelopeData = function() {
        if (typeof localforage === 'undefined') return;
        localforage.setItem(storageKey(), data).catch(function(){});
        // 同步到全局变量
        window.envelopeData = data;
    };

    // ===== 新增：兼容旧接口 handleSendEnvelope（供 index2.html 中 onclick 调用） =====
    window.handleSendEnvelope = function() {
        sendLetter();
    };

    // ===== 新增：兼容旧接口 openNewEnvelopeForm（供 index2.html 中 onclick 调用） =====
    window.openNewEnvelopeForm = function() {
        openCompose();
    };

    // ===== 新增：兼容旧接口 cancelEnvelopeCompose（供 index2.html 中 onclick 调用） =====
    window.cancelEnvelopeCompose = function() {
        cancelCompose();
    };

    // ===== 新增：兼容旧接口 switchEnvTab（供 index2.html 中 onclick 调用） =====
    window.switchEnvTab = function(tab) {
        switchTab(tab);
    };

    // 内部加载数据
    function loadData(callback) {
        if (typeof localforage === 'undefined') {
            callback(data);
            return;
        }
        localforage.getItem(storageKey()).then(function(saved) {
            if (saved && typeof saved === 'object') {
                data = saved;
                if (!Array.isArray(data.outbox)) data.outbox = [];
                if (!Array.isArray(data.inbox)) data.inbox = [];
            }
            // 同步到全局变量
            window.envelopeData = data;
            callback(data);
        }).catch(function() {
            callback(data);
        });
    }

    // 内部保存数据
    function saveData() {
        if (typeof localforage === 'undefined') return;
        localforage.setItem(storageKey(), data).catch(function(){});
        // 同步到全局变量
        window.envelopeData = data;
    }

    // 渲染寄出的信
    function renderOutbox() {
        var list = $('env-outbox-list');
        if (!list) return;
        if (data.outbox.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有寄出任何信件</div>';
        } else {
            list.innerHTML = data.outbox.slice().reverse().map(function(letter) {
                var d = new Date(letter.sentTime).toLocaleString('zh-CN');
                var p = (letter.content || '').substring(0, 35);
                return '<div style="padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:13px;">📤 ' + d + '<br>' + p + '</div>';
            }).join('');
        }
    }

    // 渲染收到的信
    function renderInbox() {
        var list = $('env-inbox-list');
        if (!list) return;
        if (data.inbox.length === 0) {
            list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">还没有收到回信</div>';
        } else {
            list.innerHTML = data.inbox.slice().reverse().map(function(letter) {
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

    // 切换标签
    function switchTab(tab) {
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
    }

    // 打开写信表单
    function openCompose() {
        var outboxSec = $('env-outbox-section');
        var inboxSec = $('env-inbox-section');
        var closeBtn = $('env-main-close-btn');
        var form = $('env-compose-form');
        var input = $('envelope-input');

        if (outboxSec) outboxSec.style.display = 'none';
        if (inboxSec) inboxSec.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';

        if (form) {
            form.style.display = 'block';
            form.style.visibility = 'visible';
        }

        if (input) input.value = '';

        var cb = $('env-send-to-chat');
        if (cb) cb.checked = false;
    }

    // 取消写信
    function cancelCompose() {
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        currentTab = 'outbox';
    }

    // 寄信核心
    function sendLetter() {
        var input = $('envelope-input');
        var content = input ? input.value.trim() : '';
        if (!content) {
            if (typeof showNotification === 'function') showNotification('请先写下你的思念...', 'warning');
            return;
        }

        data.outbox.unshift({
            id: 'env_' + Date.now(),
            content: content,
            sentTime: Date.now(),
            status: 'pending'
        });

        // 保存并同步全局变量
        saveData();
        window.envelopeData = data;

        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        currentTab = 'outbox';

        if (input) input.value = '';

        renderAll();

        if (typeof showNotification === 'function') showNotification('信已寄出 ✨', 'success');
    }

    // 绑定事件（只绑定一次）
    function bindEventsOnce() {
        if (eventsBound) return;
        eventsBound = true;

        var newBtn = $('new-envelope-btn');
        if (newBtn) {
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                openCompose();
            }, true);
        }

        var sendBtn = $('send-envelope');
        if (sendBtn) {
            var newSend = sendBtn.cloneNode(true);
            if (sendBtn.parentNode) sendBtn.parentNode.replaceChild(newSend, sendBtn);
            newSend.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                sendLetter();
            }, true);
        }

        var cancelBtn = $('cancel-compose');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                cancelCompose();
            }, true);
        }

        var outboxTab = $('env-tab-outbox');
        if (outboxTab) {
            outboxTab.addEventListener('click', function() {
                switchTab('outbox');
            }, true);
        }
        var inboxTab = $('env-tab-inbox');
        if (inboxTab) {
            inboxTab.addEventListener('click', function() {
                switchTab('inbox');
            }, true);
        }
    }

    // 页面加载和数据初始化
    function init() {
        loadData(function() {
            renderAll();
        });
        setTimeout(bindEventsOnce, 500);
    }

    // 当信封弹窗显示时，重新绑定事件和加载数据
    var modal = $('envelope-modal');
    if (modal) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.style.display === 'flex' || mutation.target.style.display === 'block') {
                    loadData(function() { renderAll(); });
                    eventsBound = false;
                    bindEventsOnce();
                }
            });
        });
        observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
