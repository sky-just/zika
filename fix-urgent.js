// fix-urgent.js —— 纯净版（不干预音乐和侧边栏，只做基础保障）
(function() {
    'use strict';

    // 备份函数
    if (typeof window._backupCriticalData === 'undefined') {
        window._backupCriticalData = function() {};
    }

    // 手帐修复
    function fixMoodModule() {
        if (typeof initMoodListeners === 'function') {
            initMoodListeners();
            if (typeof renderMoodCalendar === 'function') {
                renderMoodCalendar();
            }
        } else {
            setTimeout(fixMoodModule, 500);
        }
    }

    // 顶部按钮（保留，已修复）
    // ... 这部分代码保持不变 ...

    setTimeout(fixMoodModule, 2000);
})();
