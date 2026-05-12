// fix-all.js —— 终极简洁版 (无侵入)
(function() {
    'use strict';
    // 只修复音乐播放器的迷你窗口展开
    function fixMiniView() {
        var miniView = document.getElementById('mini-view');
        var player = document.getElementById('player');
        if (miniView && player && !miniView._fixedMusic) {
            miniView._fixedMusic = true;
            miniView.addEventListener('click', function(e) {
                e.stopPropagation();
                if (player.classList.contains('collapsed')) {
                    player.classList.remove('collapsed');
                }
            });
        }
    }
    setTimeout(fixMiniView, 1000);
    setTimeout(fixMiniView, 3000);
})();
