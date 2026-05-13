// features.js —— 原始功能 + 组字卡管理面板
(function() {
    var MY_SYM_KEY   = 'pokeSym_my';
    var PTR_SYM_KEY  = 'pokeSym_partner';
    // ... 这里省略了戳一戳、保活、搜索等原始功能代码（保持原样）...
})();

// ========== 组字卡管理面板 ==========
function openComboManager() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="background:var(--secondary-bg);border-radius:20px;padding:24px;width:90%;max-width:420px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 50px rgba(0,0,0,0.3);">
            <h3 style="margin-bottom:15px;color:var(--text-primary);"><i class="fas fa-puzzle-piece" style="color:var(--accent-color);margin-right:6px;"></i>组字卡管理</h3>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;padding:10px 14px;background:var(--primary-bg);border-radius:12px;">
                <span style="font-weight:600;">开启组字卡功能</span>
                <label class="notif-toggle-switch" style="position:relative;display:inline-block;width:44px;height:24px;">
                    <input type="checkbox" id="combo-enable-toggle" style="opacity:0;width:0;height:0;" ${window.comboCardsEnabled ? 'checked' : ''}>
                    <span class="notif-toggle-slider"></span>
                </label>
            </div>
            <button id="add-combo-inner-btn" style="width:100%;padding:12px;margin-bottom:12px;background:var(--accent-color);color:white;border:none;border-radius:12px;font-size:15px;font-weight:bold;cursor:pointer;">+ 新建组字卡</button>
            <div id="combo-list-inner" style="max-height:200px;overflow-y:auto;"></div>
            <button id="close-combo-manager" style="width:100%;margin-top:12px;padding:10px;background:var(--primary-bg);border:1px solid var(--border-color);border-radius:10px;color:var(--text-secondary);cursor:pointer;">关闭</button>
        </div>`;
    document.body.appendChild(overlay);

    function refreshList() {
        const list = document.getElementById('combo-list-inner');
        if (!list) return;
        const cards = window.comboCards || [];
        if (cards.length === 0) {
            list.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:1em;">还没有组合，点击上方按钮创建</div>';
            return;
        }
        list.innerHTML = cards.map((combo, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;margin-bottom:6px;background:var(--primary-bg);border-radius:8px;">
                <span><strong>${combo.name}</strong> <span style="font-size:11px;color:var(--text-secondary);">· ${combo.items.length}条</span></span>
                <button id="del-combo-${i}" style="background:none;border:none;color:#ff5050;cursor:pointer;">删除</button>
            </div>
        `).join('');

        cards.forEach((_, i) => {
            document.getElementById('del-combo-' + i).addEventListener('click', () => {
                window.comboCards.splice(i, 1);
                localStorage.setItem('comboCards', JSON.stringify(window.comboCards));
                if (typeof throttledSaveData === 'function') throttledSaveData();
                refreshList();
            });
        });
    }

    document.getElementById('combo-enable-toggle').addEventListener('change', function() {
        window.comboCardsEnabled = this.checked;
        if (typeof throttledSaveData === 'function') throttledSaveData();
    });

    document.getElementById('add-combo-inner-btn').addEventListener('click', function() {
        if (!window.comboCards) window.comboCards = [];
        window.comboCards.push({
            id: Date.now(),
            name: '新组合 ' + (window.comboCards.length + 1),
            items: ['字卡A', '字卡B'],
            separator: ' '
        });
        localStorage.setItem('comboCards', JSON.stringify(window.comboCards));
        if (typeof throttledSaveData === 'function') throttledSaveData();
        if (typeof showNotification === 'function') showNotification('新组合已添加', 'success');
        refreshList();
    });

    document.getElementById('close-combo-manager').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    refreshList();
}
