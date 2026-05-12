// 2. 修复组字卡面板：强制调用原生 openComboManager
function fixComboPanel() {
    // 绝对不碰任何点击入口，只做两件事：
    // 1. 监听页面，如果发现空白组字卡页，立刻在上面显示“打开管理面板”
    // 2. 修复新建按钮（以防万一）

    // 每隔 800ms 检查一次
    setInterval(function() {
        // 如果 openComboManager 存在，且当前有空白组字卡内容区
        if (typeof openComboManager === 'function') {
            var blankArea = document.querySelector('.combo-content-area, #combo-content');
            if (blankArea && window.getComputedStyle(blankArea).display !== 'none' && !document.getElementById('combo-rescue-btn')) {
                var btn = document.createElement('button');
                btn.id = 'combo-rescue-btn';
                btn.textContent = '打开组字卡管理面板';
                btn.style.cssText = 'display:block;width:calc(100%-20px);margin:15px 10px;padding:14px;background:var(--accent-color);color:white;border:none;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.2);z-index:9999;text-align:center;';
                btn.onclick = function() {
                    openComboManager();
                };
                blankArea.innerHTML = ''; // 清空空白内容
                blankArea.appendChild(btn);
            }
        }
    }, 800);

    // 最后，修复一下新建按钮（如果你的管理面板使用这个 ID）
    setTimeout(function() {
        var addBtn = document.getElementById('add-combo-inner-btn');
        if (addBtn && !addBtn._fixedCombo) {
            addBtn._fixedCombo = true;
            addBtn.addEventListener('click', function() {
                if (!window.comboCards) window.comboCards = [];
                window.comboCards.push({
                    id: Date.now(),
                    name: '新组合 ' + (window.comboCards.length + 1),
                    items: ['字卡A', '字卡B'],
                    separator: ' '
                });
                try { localStorage.setItem('comboCards', JSON.stringify(window.comboCards)); } catch(e) {}
                if (typeof throttledSaveData === 'function') throttledSaveData();
                if (typeof showNotification === 'function') showNotification('新组合已添加', 'success');
                // 如果管理面板有列表，刷新它
                var list = document.getElementById('combo-list-inner');
                if (list) {
                    var cards = window.comboCards || [];
                    list.innerHTML = cards.map(function(combo, i) {
                        return '<div class="combo-item" data-index="' + i + '"><span>' + combo.name + '</span></div>';
                    }).join('');
                }
            });
        }
    }, 1000);
}
