window.handleSendEnvelope = function() {
    if (_sending) return;
    _sending = true;

    try {
        console.log('[信封调试] 1. 开始寄信');
        
        var input = $('envelope-input');
        var content = input ? input.value.trim() : '';
        console.log('[信封调试] 2. 获取内容:', content ? content.substring(0, 20) : '空');
        
        if (!content) {
            _sending = false;
            console.log('[信封调试] 3. 内容为空，终止');
            if (typeof showNotification === 'function') {
                showNotification('请先写下你的思念...', 'warning');
            } else {
                alert('请先写下你的思念...');
            }
            return;
        }

        console.log('[信封调试] 4. 准备添加到数组');
        var outbox = window.envelopeData.outbox || [];
        outbox.unshift({
            id: 'env_' + Date.now(),
            content: content,
            sentTime: Date.now(),
            status: 'pending'
        });
        window.envelopeData.outbox = outbox;
        console.log('[信封调试] 5. 已添加到数组，开始保存');
        
        window.saveEnvelopeData();
        console.log('[信封调试] 6. 保存完毕，开始切换界面');

        // 界面切换 - 逐步调试
        var form = $('env-compose-form');
        console.log('[信封调试] 7. form元素:', form ? '存在' : '不存在');
        if (form) {
            form.style.display = 'none';
            console.log('[信封调试] 8. 隐藏form成功');
        } else {
            console.error('[信封调试] 8. form元素不存在！');
            alert('错误：找不到信件表单元素，请截图此提示');
            _sending = false;
            return;
        }

        var closeBtn = $('env-main-close-btn');
        console.log('[信封调试] 9. closeBtn:', closeBtn ? '存在' : '不存在');
        if (closeBtn) {
            closeBtn.style.display = 'flex';
            console.log('[信封调试] 10. 显示closeBtn成功');
        }

        var outboxSection = $('env-outbox-section');
        console.log('[信封调试] 11. outboxSection:', outboxSection ? '存在' : '不存在');
        if (outboxSection) {
            outboxSection.style.display = 'block';
            console.log('[信封调试] 12. 显示outboxSection成功');
        }

        var inboxSection = $('env-inbox-section');
        if (inboxSection) inboxSection.style.display = 'none';

        if (input) input.value = '';
        console.log('[信封调试] 13. 清空输入框，准备渲染列表');

        renderAll();
        console.log('[信封调试] 14. 渲染列表完成，准备显示通知');

        if (typeof showNotification === 'function') {
            showNotification('信已寄出 ✨', 'success');
            console.log('[信封调试] 15. 通知已显示');
        } else {
            alert('信已寄出！');
            console.log('[信封调试] 15. 使用alert通知');
        }

        console.log('[信封调试] 16. 寄信流程全部完成');
    } catch(e) {
        console.error('[信封调试] 出错:', e.message);
        alert('寄信失败，错误信息：' + e.message + '\n请截图此提示并发送');
    } finally {
        setTimeout(function() { _sending = false; }, 500);
    }
};
