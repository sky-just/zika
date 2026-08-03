// envelope.js - 最终自包含版
(function() {
    'use strict';
    
    var data = { outbox: [], inbox: [] };
    var currentTab = 'outbox';

    // ===== 工具函数 =====
    function $(id) { return document.getElementById(id); }
    function hide(id) { var el = $(id); if (el) el.style.display = 'none'; }
    function show(id) { var el = $(id); if (el) { el.style.display = 'block'; el.style.visibility = 'visible'; } }
    function showFlex(id) { var el = $(id); if (el) el.style.display = 'flex'; }

    // ===== 数据存取 =====
    function storageKey() {
        if (typeof getStorageKey === 'function') return getStorageKey('envelopeData');
        return 'CHAT_APP_V3_default_envelopeData';
    }

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
            callback(data);
        }).catch(function() {
            callback(data);
        });
    }

    function saveData() {
        if (typeof localforage === 'undefined') return;
        localforage.setItem(storageKey(), data).catch(function(){});
    }

    // ===== 渲染列表 =====
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

    // ===== 切换标签 =====
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

    // ===== 提笔写信 =====
    function openCompose() {
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
    }

    // ===== 取消写信 =====
    function cancelCompose() {
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        currentTab = 'outbox';
    }

    // ===== 寄信 =====
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

        saveData();

        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        currentTab = 'outbox';
        if (input) input.value = '';

        renderAll();
        if (typeof showNotification === 'function') showNotification('信已寄出 ✨', 'success');
    }

    // ===== 绑定所有按钮事件（每次打开弹窗时调用） =====
    function bindEvents() {
        // 提笔写信按钮
        var newBtn = $('new-envelope-btn');
        if (newBtn && !newBtn._bound) {
            newBtn._bound = true;
            newBtn.addEventListener('click', function(e) { e.stopPropagation(); openCompose(); });
        }

        // 寄信按钮 - 彻底接管
        var sendBtn = $('send-envelope');
        if (sendBtn) {
            // 移除所有旧事件
            var newSendBtn = sendBtn.cloneNode(true);
            sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
            newSendBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); sendLetter(); });
        }

        // 取消按钮
        var cancelBtn = $('cancel-compose');
        if (cancelBtn && !cancelBtn._bound) {
            cancelBtn._bound = true;
            cancelBtn.addEventListener('click', function(e) { e.stopPropagation(); cancelCompose(); });
        }

        // 寄出的信标签
        var outboxTab = $('env-tab-outbox');
        if (outboxTab && !outboxTab._bound) {
            outboxTab._bound = true;
            outboxTab.addEventListener('click', function() { switchTab('outbox'); });
        }

        // 收到的信标签
        var inboxTab = $('env-tab-inbox');
        if (inboxTab && !inboxTab._bound) {
            inboxTab._bound = true;
            inboxTab.addEventListener('click', function() { switchTab('inbox'); });
        }
    }

    // ===== 监听信封弹窗打开 =====
    var modal = $('envelope-modal');
    if (modal) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.style.display === 'flex' || mutation.target.style.display === 'block') {
                    loadData(function() { renderAll(); });
                    setTimeout(bindEvents, 100);
                }
            });
        });
        observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
    }

    // ===== 页面加载时也加载数据 =====
    setTimeout(function() {
        loadData(function() { renderAll(); });
        bindEvents();
    }, 1500);

})();
