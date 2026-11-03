// All demos use their existing step buttons, including pause and boundary behavior.
(() => {
  'use strict';
  if (window.demoKeyboardReady) return;
  window.demoKeyboardReady = true;
  const prev = document.getElementById('prev'), next = document.getElementById('next');
  if (prev && next) {
    prev.setAttribute('aria-keyshortcuts', 'ArrowLeft');
    next.setAttribute('aria-keyshortcuts', 'ArrowRight');
    const rule = document.createElement('p');
    rule.className = 'keyboard-rule';
    rule.textContent = '键盘规则：← 上一步 · → 下一步；编辑输入框、下拉选项时保留原操作。';
    Object.assign(rule.style, { flexBasis: '100%', margin: '6px 0 0', fontSize: '12px', lineHeight: '1.7', color: '#637665' });
    (next.closest('.controls') || next.parentElement).append(rule);
  }
  function editable(target) {
    return target?.isContentEditable || target?.closest?.('input, textarea, select, [role="textbox"]');
  }
  function step(doc, id) {
    // Access only this site's known demo frames, never unrelated embedded pages.
    if (editable(doc.activeElement)) return false;
    const button = doc.getElementById(id);
    if (button) {
      if (!button.disabled) button.click();
      return true;
    }
    const frame = doc.getElementById('method-demo') || doc.getElementById('demo');
    try { return frame?.contentDocument ? step(frame.contentDocument, id) : false; }
    catch { return false; } // Local file frames may have separate browser origins.
  }
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || editable(event.target)) return;
    const id = event.key === 'ArrowLeft' ? 'prev' : event.key === 'ArrowRight' ? 'next' : null;
    if (id && step(document, id)) event.preventDefault();
  });
})();
