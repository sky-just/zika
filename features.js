// features.js - 完整修复版
// 包括：自定义回复逻辑修复 + 音乐播放器初始化 + 所有缺失面板函数

(function() {
    // ========== 全局状态 ==========
    let currentMainTab = 'reply';        // 'reply' | 'vibe'
    let currentSubTab = 'mainCard';      // 回复库子tab: mainCard | emoji | emojiPack
                                         // 氛围感子tab: pat | status | motto

    // ========== 面板切换函数（缺失补全） ==========
    function switchToReplyPanel() {
        // 切换到回复库主面板（如果需要）
        currentMainTab = 'reply';
        currentSubTab = 'mainCard';
        renderReplyContent();
    }

    function switchToVibePanel() {
        // 切换到氛围感主面板
        currentMainTab = 'vibe';
        currentSubTab = 'pat';
        renderVibeContent();
    }

    function switchToAnnouncementPanel() {
        // 切换到公告栏面板（修复大段空白问题）
        const announceContent = document.getElementById('announcementContent');
        if (announceContent) {
            // 显示公告栏内容区，隐藏其他面板
            document.querySelectorAll('.custom-reply-panel').forEach(p => p.style.display = 'none');
            announceContent.style.display = 'block';
            // 强制滚动到顶部，移除多余空白
            announceContent.scrollTop = 0;
        }
    }

    // 关闭/重开每日问候（占位，可根据实际逻辑扩充）
    function closeDailyGreeting() {
        const greeting = document.getElementById('dailyGreeting');
        if (greeting) greeting.style.display = 'none';
    }

    function reopenDailyGreeting() {
        const greeting = document.getElementById('dailyGreeting');
        if (greeting) greeting.style.display = 'block';
    }

    // 沉浸模式切换（占位）
    function toggleImmersiveMode() {
        document.body.classList.toggle('immersive-mode');
    }

    // ========== 自定义回复渲染逻辑 ==========
    function renderReplyContent() {
        const container = document.getElementById('replyContentArea');
        if (!container) return;

        // 根据 currentSubTab 显示不同子内容
        let html = '';
        if (currentSubTab === 'mainCard') {
            html = renderMainCardList();
        } else if (currentSubTab === 'emoji') {
            html = renderEmojiList();
        } else if (currentSubTab === 'emojiPack') {
            html = renderEmojiPackList();
        }
        container.innerHTML = html;
        
        // 重新绑定新增按钮事件（防止丢失）
        bindAddButtons();
    }

    function renderVibeContent() {
        const container = document.getElementById('replyContentArea');
        if (!container) return;

        let html = '';
        if (currentSubTab === 'pat') {
            html = renderPatList();
        } else if (currentSubTab === 'status') {
            html = renderStatusList();
        } else if (currentSubTab === 'motto') {
            html = renderMottoList();
        }
        container.innerHTML = html;
        bindAddButtons();
    }

 // 示例渲染函数（实际会从 reply-library.js 的数据中获取）
    function renderMainCardList() {
        // 假设 window.replyLibrary 已由 reply-library.js 定义
        const items = window.replyLibrary?.mainCard || [];
        if (items.length === 0) return '<div class="empty-tip">暂无主字卡，点击下方添加</div>';
        return items.map(item => `<div class="reply-item">${item}</div>`).join('');
    }

    function renderEmojiList() {
        const items = window.replyLibrary?.emoji || [];
        if (items.length === 0) return '<div class="empty-tip">暂无Emoji</div>';
        return items.map(item => `<div class="reply-item">${item}</div>`).join('');
    }

    function renderEmojiPackList() {
        const items = window.replyLibrary?.emojiPack || [];
        if (items.length === 0) return '<div class="empty-tip">暂无表情库</div>';
        return items.map(item => `<div class="reply-item">${item}</div>`).join('');
    }

    function renderPatList() {
        const items = window.replyLibrary?.pat || [];
        if (items.length === 0) return '<div class="empty-tip">暂无拍一拍</div>';
        return items.map(item => `<div class="reply-item">${item}</div>`).join('');
    }

    function renderStatusList() {
        const items = window.replyLibrary?.status || [];
        if (items.length === 0) return '<div class="empty-tip">暂无状态</div>';
        return items.map(item => `<div class="reply-item">${item}</div>`).join('');
    }

    function renderMottoList() {
        const items = window.replyLibrary?.motto || [];
        if (items.length === 0) return '<div class="empty-tip">暂无格言</div>';
        return items.map(item => `<div class="reply-item">${item}</div>`).join('');
    }

    function bindAddButtons() {
        // 根据当前主tab和子tab绑定新增按钮的行为
        const addBtn = document.getElementById('addReplyItemBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                let category = '';
                if (currentMainTab === 'reply') {
                    if (currentSubTab === 'mainCard') category = 'mainCard';
                    else if (currentSubTab === 'emoji') category = 'emoji';
                    else if (currentSubTab === 'emojiPack') category = 'emojiPack';
                } else if (currentMainTab === 'vibe') {
                    if (currentSubTab === 'pat') category = 'pat';
                    else if (currentSubTab === 'status') category = 'status';
                    else if (currentSubTab === 'motto') category = 'motto';
                }
                // 调用原始新增逻辑（假设存在全局函数 addReplyItem）
                if (typeof window.addReplyItem === 'function') {
                    window.addReplyItem(category);
                }
            };
        }
    }

 // ========== 侧边栏主选项卡切换 ==========
    function switchMainTab(tabId) {
        // 更新当前主选项卡
        if (tabId === 'tab-reply') {
            currentMainTab = 'reply';
            currentSubTab = 'mainCard';   // 默认子选项卡
            renderReplyContent();
        } else if (tabId === 'tab-vibe') {
            currentMainTab = 'vibe';
            currentSubTab = 'pat';        // 默认子选项卡
            renderVibeContent();
        } else if (tabId === 'tab-announce') {
            switchToAnnouncementPanel();
            return; // 公告栏不走子tab逻辑
        }

        // 高亮侧边栏项
        document.querySelectorAll('.sidebar-tab').forEach(tab => tab.classList.remove('active'));
        const activeTab = document.getElementById(tabId);
        if (activeTab) activeTab.classList.add('active');

        // 刷新子选项卡栏（如果存在）
        updateSubTabBar();
    }

    // 更新子选项卡UI（根据 currentMainTab 显示不同子tab）
    function updateSubTabBar() {
        const subTabContainer = document.getElementById('subTabBar');
        if (!subTabContainer) return;

        let subTabs = [];
        if (currentMainTab === 'reply') {
            subTabs = [
                { id: 'mainCard', label: '主字卡' },
                { id: 'emoji', label: 'Emoji' },
                { id: 'emojiPack', label: '表情库' }
            ];
        } else if (currentMainTab === 'vibe') {
            subTabs = [
                { id: 'pat', label: '拍一拍' },
                { id: 'status', label: '对方状态' },
                { id: 'motto', label: '格言' }
            ];
        }

        subTabContainer.innerHTML = subTabs.map(st => 
            `<span class="sub-tab ${currentSubTab === st.id ? 'active' : ''}" data-subtab="${st.id}">${st.label}</span>`
        ).join('');

        // 绑定子选项卡点击
        subTabContainer.querySelectorAll('.sub-tab').forEach(el => {
            el.addEventListener('click', function() {
                const subtab = this.dataset.subtab;
                currentSubTab = subtab;
                // 重新渲染对应内容
                if (currentMainTab === 'reply') {
                    renderReplyContent();
                } else if (currentMainTab === 'vibe') {
                    renderVibeContent();
                }
                // 高亮当前子tab
                subTabContainer.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // ========== 初始化音乐播放器 ==========
    function initMusicPlayer() {
        const musicFloater = document.getElementById('musicFloater');
        if (!musicFloater) return;

        // 收起/展开逻辑
        const toggleBtn = musicFloater.querySelector('.music-toggle');
        const songListBtn = musicFloater.querySelector('.music-songlist-btn'); // 三条杠按钮

        if (toggleBtn) {
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                musicFloater.classList.toggle('collapsed');
            });
        }

    // 歌单按钮点击（确保不冒泡，避免触发其他事件）
        if (songListBtn) {
            songListBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                // 显示歌单弹出层
                const songListPopup = document.getElementById('songListPopup');
                if (songListPopup) {
                    songListPopup.style.display = 'block';
                    // 如果之前是空白的，这里可以重新加载歌单数据
                    if (typeof window.loadSongList === 'function') {
                        window.loadSongList();
                    }
                }
            });
        }

        // 可以在这里添加播放控制逻辑...
        console.log('✅ 音乐播放器初始化完成');
    }

    // ========== 页面完全加载后执行 ==========
    function onDOMReady() {
        // 绑定侧边栏主选项卡点击
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.id;
                switchMainTab(tabId);
            });
        });

        // 默认打开“回复库”面板
        switchMainTab('tab-reply');

        // 初始化音乐悬浮器
        if (typeof initMusicPlayer === 'function') {
            initMusicPlayer();
        } else {
            console.warn('⚠️ initMusicPlayer 未定义，尝试手动调用');
        }

        // 组字卡入口（如果存在按钮）
        const comboBtn = document.getElementById('openComboBtn');
        if (comboBtn && typeof openComboManager === 'function') {
            comboBtn.addEventListener('click', openComboManager);
        }
    }

    // 确保 initMusicPlayer 在页面完全加载后调用一次（无论是否异步）
    window.addEventListener('load', function() {
        // 稍微延迟，确保所有元素都已渲染
        setTimeout(function() {
            if (typeof initMusicPlayer === 'function') {
                initMusicPlayer();
            }
        }, 100);
    });

    // DOMContentLoaded 时执行主初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
        onDOMReady();
    }

    // 对外暴露需要的函数（配合 HTML 中的 onclick）
    window.switchToReplyPanel = switchToReplyPanel;
    window.switchToVibePanel = switchToVibePanel;
    window.switchToAnnouncementPanel = switchToAnnouncementPanel;
    window.closeDailyGreeting = closeDailyGreeting;
    window.reopenDailyGreeting = reopenDailyGreeting;
    window.toggleImmersiveMode = toggleImmersiveMode;
    window.initMusicPlayer = initMusicPlayer;   // 确保全局可访问
})();
