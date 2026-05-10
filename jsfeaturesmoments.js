// js/features/moments.js
// 朋友圈功能 —— 双方动态 + 评论

(function () {
    'use strict';

    const STORAGE_KEY = (typeof APP_PREFIX !== 'undefined' ? APP_PREFIX : 'chatapp_') + 'moments';

    let momentsData = [];          // 所有动态
    let currentOpenMomentId = null; // 当前查看评论的动态ID

    // ---------- 工具函数 ----------
    function getStorageKey() { return STORAGE_KEY; }

    async function loadMoments() {
        if (window.localforage) {
            const saved = await localforage.getItem(getStorageKey());
            if (Array.isArray(saved)) momentsData = saved;
        } else {
            try { momentsData = JSON.parse(localStorage.getItem(getStorageKey()) || '[]'); } catch(e){}
        }
    }

    async function saveMoments() {
        if (window.localforage) {
            await localforage.setItem(getStorageKey(), momentsData);
        } else {
            localStorage.setItem(getStorageKey(), JSON.stringify(momentsData));
        }
    }

    function getMyName() {
        return (typeof settings !== 'undefined' && settings.myName) || '我';
    }

    function getPartnerName() {
        return (typeof settings !== 'undefined' && settings.partnerName) || '梦角';
    }

    function getMyAvatar() {
        const el = document.querySelector('#my-avatar img');
        return el ? el.src : null;
    }

    function getPartnerAvatar() {
        const el = document.querySelector('#partner-avatar img');
        return el ? el.src : null;
    }

    function getAvatarFor(sender) {
        if (sender === 'partner') return getMyAvatar();
        return getPartnerAvatar();
    }

    function getNameFor(sender) {
        if (sender === 'partner') return getMyName();
        return getPartnerName();
    }

    function formatTime(ts) {
        const d = new Date(ts);
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        if (d.toDateString() === now.toDateString()) {
            return `今天 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
        return `${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    // 图片压缩（复用 storage-enhance 如果有的话，否则简单处理）
    function compressImage(file) {
        return new Promise((resolve) => {
            if (!file || !file.type.startsWith('image/')) { resolve(null); return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const maxW = 800;
                    let w = img.width, h = img.height;
                    if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = () => resolve(e.target.result);
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // ---------- 界面渲染 ----------
    function renderMoments() {
        const container = document.getElementById('moments-list');
        if (!container) return;

        if (momentsData.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:50px 20px;color:var(--text-secondary);">
                    <i class="fas fa-camera-retro" style="font-size:42px;opacity:0.3;display:block;margin-bottom:12px;"></i>
                    <p style="font-size:14px;font-weight:500;">还没有动态</p>
                    <p style="font-size:12px;opacity:0.7;">点上方按钮发布第一条朋友圈吧~</p>
                </div>`;
            return;
        }

        // 按时间倒序
        const sorted = [...momentsData].sort((a,b) => b.timestamp - a.timestamp);
        container.innerHTML = sorted.map(m => {
            const avatarSrc = getAvatarFor(m.sender);
            const name = getNameFor(m.sender);
            const commentCount = (m.comments || []).length;
            const hasImage = m.image && m.image.startsWith('data:');
            const isMyMoment = m.sender === 'user';
            
            return `
            <div class="moments-card" data-id="${m.id}">
                <div class="moments-header">
                    <div class="moments-avatar">
                        ${avatarSrc ? `<img src="${avatarSrc}" alt="">` : `<i class="fas fa-user"></i>`}
                    </div>
                    <div class="moments-user-info">
                        <span class="moments-username">${escapeHtml(name)}</span>
                        <span class="moments-time">${formatTime(m.timestamp)}</span>
                    </div>
                    ${isMyMoment ? `<button class="moments-delete-btn" data-id="${m.id}" title="删除"><i class="fas fa-times"></i></button>` : ''}
                </div>
                <div class="moments-body">
                    <div class="moments-text">${escapeHtml(m.text)}</div>
                    ${hasImage ? `<img src="${m.image}" class="moments-image" onclick="viewImage && viewImage('${m.image}')">` : ''}
                </div>
                <div class="moments-footer">
                    <button class="moments-comment-btn" data-id="${m.id}">
                        <i class="fas fa-comment"></i> ${commentCount > 0 ? commentCount : '评论'}
                    </button>
                </div>
                <!-- 评论区（默认隐藏，点击后展示） -->
                <div class="moments-comments" id="comments-${m.id}" style="display:none;">
                    <div class="moments-comments-list">
                        ${(m.comments || []).map(c => {
                            const cName = getNameFor(c.sender);
                            const cAvatar = getAvatarFor(c.sender);
                            return `
                            <div class="moments-comment-item">
                                <div class="moments-comment-avatar">
                                    ${cAvatar ? `<img src="${cAvatar}" alt="">` : `<i class="fas fa-user"></i>`}
                                </div>
                                <div class="moments-comment-content">
                                    <span class="moments-comment-name">${escapeHtml(cName)}</span>
                                    <span class="moments-comment-text">${escapeHtml(c.text)}</span>
                                    <span class="moments-comment-time">${formatTime(c.timestamp)}</span>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                    <div class="moments-add-comment">
                        <input type="text" class="moments-comment-input" id="comment-input-${m.id}" placeholder="写评论...">
                        <button class="moments-comment-send" data-id="${m.id}">发送</button>
                        <button class="moments-comment-as-partner" data-id="${m.id}" title="以梦角身份评论">💭</button>
                    </div>
                </div>
            </div>`;
        }).join('');

        // 绑定事件
        bindEvents();
    }

    function bindEvents() {
        // 删除动态
        document.querySelectorAll('.moments-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (confirm('确定删除这条动态吗？')) {
                    momentsData = momentsData.filter(m => m.id != id);
                    saveMoments();
                    renderMoments();
                    showNotification('动态已删除', 'success');
                }
            });
        });

        // 展开/收起评论
        document.querySelectorAll('.moments-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const commentsDiv = document.getElementById('comments-' + id);
                if (!commentsDiv) return;
                const isHidden = commentsDiv.style.display === 'none';
                commentsDiv.style.display = isHidden ? 'block' : 'none';
                currentOpenMomentId = isHidden ? id : null;
            });
        });

        // 发送评论（自己身份）
        document.querySelectorAll('.moments-comment-send').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                addComment(id, 'user');
            });
        });

        // 以梦角身份发送评论
        document.querySelectorAll('.moments-comment-as-partner').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                addComment(id, 'partner');
            });
        });

        // 回车发送评论
        document.querySelectorAll('.moments-comment-input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const id = input.id.replace('comment-input-', '');
                    addComment(id, 'user');
                }
            });
        });
    }

    function addComment(momentId, sender) {
        const input = document.getElementById('comment-input-' + momentId);
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const moment = momentsData.find(m => m.id == momentId);
        if (!moment) return;
        if (!moment.comments) moment.comments = [];
        moment.comments.push({
            sender: sender,
            text: text,
            timestamp: Date.now()
        });
        saveMoments();
        input.value = '';
        renderMoments();
        // 重新打开该动态的评论区
        const commentsDiv = document.getElementById('comments-' + momentId);
        if (commentsDiv) commentsDiv.style.display = 'block';
    }

    // ---------- 发布新动态 ----------
    async function openNewMoment(sender = 'partner') {
        // 创建一个简单的输入弹窗
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `
        <div style="background:var(--secondary-bg);border-radius:22px;padding:24px;width:90%;max-width:420px;box-shadow:0 20px 50px rgba(0,0,0,0.3);">
            <h3 style="margin-bottom:16px;color:var(--text-primary);">
                <i class="fas fa-feather-alt" style="color:var(--accent-color);margin-right:6px;"></i>
                发表动态（${escapeHtml(getNameFor(sender))}）
            </h3>
            <textarea id="new-moment-text" class="modal-textarea" style="height:100px;" placeholder="说点什么..."></textarea>
            <div style="margin:12px 0;display:flex;align-items:center;gap:10px;">
                <label style="font-size:12px;color:var(--text-secondary);cursor:pointer;">
                    <i class="fas fa-image"></i> 添加图片
                    <input type="file" id="new-moment-image" accept="image/*" style="display:none;">
                </label>
                <img id="new-moment-preview" style="max-width:60px;max-height:60px;display:none;border-radius:8px;">
                <button id="remove-image-btn" style="display:none;background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:12px;">移除</button>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button id="cancel-new-moment" class="modal-btn modal-btn-secondary">取消</button>
                <button id="publish-new-moment" class="modal-btn modal-btn-primary">发布</button>
            </div>
        </div>`;
        document.body.appendChild(overlay);

        let selectedImage = null;
        const imageInput = overlay.querySelector('#new-moment-image');
        const previewImg = overlay.querySelector('#new-moment-preview');
        const removeBtn = overlay.querySelector('#remove-image-btn');

        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedImage = await compressImage(file);
                if (selectedImage) {
                    previewImg.src = selectedImage;
                    previewImg.style.display = 'block';
                    removeBtn.style.display = 'inline-block';
                }
            }
        });

        removeBtn.addEventListener('click', () => {
            selectedImage = null;
            previewImg.style.display = 'none';
            removeBtn.style.display = 'none';
            imageInput.value = '';
        });

        overlay.querySelector('#cancel-new-moment').addEventListener('click', () => overlay.remove());
        overlay.querySelector('#publish-new-moment').addEventListener('click', async () => {
            const text = overlay.querySelector('#new-moment-text').value.trim();
            if (!text && !selectedImage) {
                showNotification('请输入内容或添加图片', 'warning');
                return;
            }
            momentsData.push({
                id: Date.now(),
                sender: sender,
                text: text || '',
                image: selectedImage || null,
                timestamp: Date.now(),
                comments: []
            });
            await saveMoments();
            overlay.remove();
            renderMoments();
            showNotification('动态已发布', 'success');
        });

        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    // ---------- 打开朋友圈窗口 ----------
    function openMomentsPanel() {
        // 检查是否已经存在模态框，避免重复创建
        if (document.getElementById('moments-modal')) {
            showModal(document.getElementById('moments-modal'));
            renderMoments();
            return;
        }

        // 创建朋友圈模态框
        const modal = document.createElement('div');
        modal.id = 'moments-modal';
        modal.className = 'modal';
        modal.innerHTML = `
        <div class="modal-content" style="max-height:88vh;display:flex;flex-direction:column;padding:0;overflow:hidden;border-radius:22px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-color);background:var(--secondary-bg);border-radius:22px 22px 0 0;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <i class="fas fa-images" style="color:var(--accent-color);font-size:18px;"></i>
                    <span style="font-size:17px;font-weight:700;color:var(--text-primary);">朋友圈</span>
                </div>
                <button id="close-moments-btn" style="background:none;border:none;color:var(--text-secondary);font-size:18px;cursor:pointer;">×</button>
            </div>
            <div style="display:flex;gap:10px;padding:12px 20px;background:var(--primary-bg);border-bottom:1px solid var(--border-color);">
                <button id="new-moment-me-btn" class="modal-btn modal-btn-primary" style="flex:1;">
                    <i class="fas fa-pen"></i> 我发动态
                </button>
                <button id="new-moment-partner-btn" class="modal-btn modal-btn-secondary" style="flex:1;">
                    <i class="fas fa-heart"></i> ${escapeHtml(getPartnerName())}发动态
                </button>
            </div>
            <div id="moments-list" style="flex:1;overflow-y:auto;padding:12px 16px 24px;background:var(--primary-bg);"></div>
        </div>`;
        document.body.appendChild(modal);
        showModal(modal);
        renderMoments();

        // 绑定事件
        modal.querySelector('#close-moments-btn').addEventListener('click', () => hideModal(modal));
        modal.querySelector('#new-moment-me-btn').addEventListener('click', () => openNewMoment('partner'));
        modal.querySelector('#new-moment-partner-btn').addEventListener('click', () => openNewMoment('user'));
    }

    // ---------- CSS 注入 ----------
    function injectCSS() {
        if (document.getElementById('moments-style')) return;
        const style = document.createElement('style');
        style.id = 'moments-style';
        style.textContent = `
            .moments-card {
                background: var(--secondary-bg);
                border-radius: var(--radius);
                padding: 16px;
                margin-bottom: 14px;
                border: 1px solid var(--border-color);
                transition: box-shadow 0.2s;
            }
            .moments-card:hover { box-shadow: 0 4px 16px rgba(var(--accent-color-rgb,197,164,126),0.08); }
            .moments-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
            }
            .moments-avatar {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: rgba(var(--accent-color-rgb,197,164,126),0.12);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                flex-shrink: 0;
            }
            .moments-avatar img { width:100%; height:100%; object-fit:cover; }
            .moments-avatar i { font-size:16px; color:var(--accent-color); }
            .moments-user-info { flex:1; }
            .moments-username { font-size:14px; font-weight:600; color:var(--text-primary); }
            .moments-time { font-size:11px; color:var(--text-secondary); display:block; margin-top:2px; }
            .moments-delete-btn {
                background: none;
                border: none;
                color: var(--text-secondary);
   cursor: pointer;
                padding: 4px 8px;
                border-radius: 50%;
                transition: 0.2s;
            }
            .moments-delete-btn:hover { background: rgba(255,71,87,0.1); color:#ff4757; }
            .moments-body { margin-bottom: 12px; }
            .moments-text { font-size:14px; color:var(--text-primary); line-height:1.6; word-break:break-word; }
            .moments-image { max-width:100%; max-height:300px; border-radius:12px; margin-top:10px; cursor:pointer; }
            .moments-footer { display:flex; align-items:center; gap:15px; }
            .moments-comment-btn {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size:13px;
                display:flex; align-items:center; gap:4px;
                padding:4px 8px; border-radius:6px;
                transition:0.2s;
            }
            .moments-comment-btn:hover { background: var(--primary-bg); color:var(--accent-color); }
            .moments-comments { margin-top:10px; padding-top:10px; border-top:1px solid var(--border-color); }
            .moments-comments-list { display:flex; flex-direction:column; gap:10px; margin-bottom:12px; }
            .moments-comment-item { display:flex; gap:8px; align-items:flex-start; }
            .moments-comment-avatar {
                width:26px; height:26px; border-radius:50%;
                background: rgba(var(--accent-color-rgb,197,164,126),0.1);
                display:flex; align-items:center; justify-content:center;
                overflow:hidden; flex-shrink:0;
            }
            .moments-comment-avatar img { width:100%; height:100%; object-fit:cover; }
            .moments-comment-avatar i { font-size:11px; color:var(--accent-color); }
            .moments-comment-content { flex:1; }
            .moments-comment-name { font-size:12px; font-weight:600; color:var(--accent-color); margin-right:6px; }
            .moments-comment-text { font-size:13px; color:var(--text-primary); }
            .moments-comment-time { font-size:10px; color:var(--text-secondary); display:block; margin-top:2px; }
            .moments-add-comment { display:flex; gap:8px; align-items:center; }
            .moments-comment-input {
                flex:1; padding:8px 12px;
                border:1px solid var(--border-color);
                border-radius:20px;
                background:var(--primary-bg);
                color:var(--text-primary);
                font-size:13px; outline:none;
            }
            .moments-comment-send {
                background: var(--accent-color);
                color: #fff; border:none;
                padding:7px 16px; border-radius:20px;
                cursor:pointer; font-size:12px; font-weight:600;
            }
            .moments-comment-as-partner {
                background: none; border: 1px solid var(--border-color);
                color: var(--text-secondary); padding:7px 10px; border-radius:50%;
                cursor:pointer; font-size:16px;
            }
        `;
        document.head.appendChild(style);
    }

    // 转义
    function escapeHtml(text) {
        return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ---------- 初始化入口监听 ----------
    function init() {
        injectCSS();
        loadMoments();

        // 等待高级功能面板就绪后绑定点击事件
        const bindEntry = () => {
            const entry = document.getElementById('moments-function');
            if (entry) {
                entry.removeEventListener('click', openMomentsPanel);
                entry.addEventListener('click', () => {
                    hideModal(document.getElementById('advanced-modal'));
                    openMomentsPanel();
                });
            }
        };
        // 因为 modal 可能在后续才创建，用 MutationObserver 监听
        const observer = new MutationObserver(bindEntry);
        observer.observe(document.body, { childList: true, subtree: true });
        // 立即尝试一次
        setTimeout(bindEntry, 1000);
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
// ========== 梦角自动发朋友圈 ==========
function generateRandomMomentText() {
    var pool = window.customReplies && window.customReplies.length > 0 ? window.customReplies : [];
    if (pool.length === 0) return '今天天气不错~';
    var count = Math.floor(Math.random() * 3) + 1;
    var sentences = [];
    for (var i = 0; i < count; i++) {
        sentences.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return sentences.join(' ');
}

function autoPostPartnerMoment() {
    var text = generateRandomMomentText();
    momentsData.push({
        id: Date.now(),
        sender: 'partner',
        text: text,
        image: null,
        timestamp: Date.now(),
        comments: []
    });
    saveMoments();
    // 如果朋友圈面板正好打开，就刷新显示
    if (document.getElementById('moments-modal') && 
        getComputedStyle(document.getElementById('moments-modal')).display !== 'none') {
        renderMoments();
    }
}

// 每 10 分钟检查一次，如果超过 5 天没发朋友圈，就立刻发一条
function startMomentOversight() {
    setInterval(function() {
        if (window.partnerAutoControl && window.partnerAutoControl.isOverdue('moment')) {
            window.partnerAutoControl.updateLastTime('moment');
            autoPostPartnerMoment();
        }
    }, 10 * 60 * 1000);
}

// 随机提前发朋友圈
function scheduleRandomMoment() {
    var maxDelay = 5 * 24 * 60 * 60 * 1000;
    var delay = Math.random() * maxDelay;
    setTimeout(function() {
        if (window.partnerAutoControl && !window.partnerAutoControl.isOverdue('moment')) {
            window.partnerAutoControl.updateLastTime('moment');
            autoPostPartnerMoment();
        }
        scheduleRandomMoment();
    }, delay);
}

// 启动
if (!window._momentOversightStarted) {
    window._momentOversightStarted = true;
    startMomentOversight();
    scheduleRandomMoment();
}
})();
