// envelope.js - 精简版（只负责数据存取）
var envelopeData = { outbox: [], inbox: [] };

function saveEnvelopeData() {
    try {
        if (typeof localforage !== 'undefined' && typeof getStorageKey === 'function') {
            localforage.setItem(getStorageKey('envelopeData'), envelopeData).catch(function(){});
        }
    } catch(e) {}
}

function loadEnvelopeData(callback) {
    try {
        if (typeof localforage !== 'undefined' && typeof getStorageKey === 'function') {
            localforage.getItem(getStorageKey('envelopeData')).then(function(data) {
                envelopeData = (data && typeof data === 'object') ? data : { outbox: [], inbox: [] };
                if (!Array.isArray(envelopeData.outbox)) envelopeData.outbox = [];
                if (!Array.isArray(envelopeData.inbox)) envelopeData.inbox = [];
                if (callback) callback(envelopeData);
            }).catch(function() {
                envelopeData = { outbox: [], inbox: [] };
                if (callback) callback(envelopeData);
            });
        } else {
            if (callback) callback(envelopeData);
        }
    } catch(e) {
        if (callback) callback(envelopeData);
    }
}
