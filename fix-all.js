// fix-all.js —— 纯净修复版 (不干扰原生代码)
(function() {
    'use strict';
    console.log('[fix-all] 纯净修复已激活');

    // 1. 顶部按钮兜底（只补真正缺失的）
    if (typeof window.toggleImmersiveMode === 'undefined') {
        window.toggleImmersiveMode = function(force) {
            var isOn = (force !== undefined) ? force : !document.body.classList.contains('immersive-mode');
            document.body.classList.toggle('immersive-mode', isOn);
            var toggle = document.getElementById('immersive-toggle');
            if (toggle) toggle.classList.toggle('active', isOn);
            var exitBtn = document.getElementById('immersive-exit-btn');
            if (exitBtn) exitBtn.style.display = isOn ? 'flex' : 'none';
        };
    }

    if (typeof window.reopenDailyGreeting === 'undefined') {
        window.reopenDailyGreeting = function() {
            var modal = document.getElementById('daily-greeting-modal');
            if (modal) {
                modal.style.opacity = '0';
                modal.classList.remove('hidden');
                requestAnimationFrame(function() {
                    modal.style.transition = 'opacity 0.3s ease';
                    modal.style.opacity = '1';
                });
            }
            if (typeof _buildDailyGreeting === 'function') {
                _buildDailyGreeting();
            }
        };
    }

    if (typeof window.closeDailyGreeting === 'undefined') {
        window.closeDailyGreeting = function() {
            var modal = document.getElementById('daily-greeting-modal');
            if (modal) {
                modal.style.opacity = '0';
                modal.style.transition = 'opacity 0.3s ease';
                setTimeout(function() {
                    modal.classList.add('hidden');
                    modal.style.opacity = '';
                    modal.style.transition = '';
                }, 320);
                localStorage.setItem('dailyGreetingShown', new Date().toDateString());
            }
        };
    }

    // 2. 音乐播放器：不做任何修复，信任原生的 initMusicPlayer
    // 3. 组字卡：不做任何修复，信任 features.js 中的 openComboManager
})();
