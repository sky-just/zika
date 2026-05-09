// js/features/partner-auto.js
// 梦角主动行为频率控制 —— 保证每5天至少一次，但不限制5天内次数

(function() {
    'use strict';

    var PREFIX = (typeof APP_PREFIX !== 'undefined' ? APP_PREFIX : 'chatapp_');
    var KEYS = {
        letter: PREFIX + 'partner_last_letter',
        moment: PREFIX + 'partner_last_moment'
    };
    var MAX_INTERVAL = 5 * 24 * 60 * 60 * 1000; // 5天

    function getLastTime(type) {
        var val = localStorage.getItem(KEYS[type]);
        return val ? Number(val) : 0;
    }

    function updateLastTime(type) {
        localStorage.setItem(KEYS[type], Date.now().toString());
    }

    function isOverdue(type) {
        var last = getLastTime(type);
        return (Date.now() - last) >= MAX_INTERVAL;
    }

    window.partnerAutoControl = {
        isOverdue: isOverdue,
        updateLastTime: updateLastTime,
        getLastTime: getLastTime,
        KEYS: KEYS
    };

})();