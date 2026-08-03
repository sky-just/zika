// envelope.js - 最终完全健壮版（修复闪退、重复、残留）
(function() {
    'use strict';

    var data = { outbox: [], inbox: [] };
    var currentTab = 'outbox';
    var eventsBound = false;

    // 安全获取元素
    function $(id) { return document.getElementById(id); }

    // 安全设置显示状态
    function hide(id) { var el = $(id); if (el) el.style.display = 'none'; }
    function show(id) { var el = $(id); if (el) { el.style.display = 'block'; el.style.visibility = 'visible'; } }
    function showFlex(id) { var el = $(id); if (el) el.style.display = 'flex'; }

    // 存储键
    function storageKey() {
        if (typeof getStorageKey === 'function') return getStorageKey('envelopeData');
        return 'CHAT_APP_V3_default_envelopeData';
    }

    // 加载数据
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

    // 保存数据
    function saveData() {
        if (typeof localforage === 'undefined') return;
        localforage.setItem(storageKey(), data).catch(function(){});
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

    // 打开写信表单（加强安全版）
    function openCompose() {
        // 确保所有元素存在
        var outboxSec = $('env-outbox-section');
        var inboxSec = $('env-inbox-section');
        var closeBtn = $('env-main-close-btn');
        var form = $('env-compose-form');
        var input = $('envelope-input');

        // 安全隐藏
        if (outboxSec) outboxSec.style.display = 'none';
        if (inboxSec) inboxSec.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';

        // 显示表单
        if (form) {
            form.style.display = 'block';
            form.style.visibility = 'visible';
        }

        // 清空输入
        if (input) input.value = '';

        // 可选：清空复选框
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

        // 添加到数据
        data.outbox.unshift({
            id: 'env_' + Date.now(),
            content: content,
            sentTime: Date.now(),
            status: 'pending'
        });

        // 保存
        saveData();

        // 强制清理所有可能残留的界面状态
        hide('env-compose-form');
        showFlex('env-main-close-btn');
        show('env-outbox-section');
        hide('env-inbox-section');
        currentTab = 'outbox';

        // 清空输入框（确保没有残留文字）
        if (input) input.value = '';

        renderAll();

        if (typeof showNotification === 'function') showNotification('信已寄出 ✨', 'success');
    }

    // 绑定事件（只绑定一次）
    function bindEventsOnce() {
        if (eventsBound) return;
        eventsBound = true;

        // 提笔写信按钮 - 使用捕获阶段确保优先
        var newBtn = $('new-envelope-btn');
        if (newBtn) {
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                openCompose();
            }, true);
        }

        // 寄信按钮 - 完全替换旧事件
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

        // 取消按钮
        var cancelBtn = $('cancel-compose');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                cancelCompose();
            }, true);
        }

        // 标签切换
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
        // 延迟绑定事件，确保 DOM 完全就绪
        setTimeout(bindEventsOnce, 500);
    }

    // 当信封弹窗显示时，重新绑定事件和加载数据（兜底）
    var modal = $('envelope-modal');
    if (modal) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.style.display === 'flex' || mutation.target.style.display === 'block') {
                    loadData(function() { renderAll(); });
                    // 重新绑定，防止事件丢失
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
