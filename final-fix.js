').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var parentModal = btn.closest('.modal');
            if (parentModal && typeof hideModal === 'function') hideModal(parentModal);
            var settingsModal = document.getElementById('settings-modal');
            if (settingsModal && typeof showModal === 'function') showModal(settingsModal);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}
