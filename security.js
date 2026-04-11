(function(){
  "use strict";

  const block = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  };

  const css = () => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      img, video, canvas, iframe, embed, object, a {
        -webkit-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto !important;
      }
      @media print {
        body { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  };

  const forbiddenKeys = new Set([
    'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
    'printscreen', 'scrolllock', 'pause', 'contextmenu',
    'insert', 'delete', 'home', 'end', 'pageup', 'pagedown'
  ]);

  const ctrlForbidden = new Set([
    'a', 'c', 'x', 'v', 's', 'p', 'u', 'i', 'j', 'f', 'g', 'h', 'k', 'l', 'd', 'n', 't', 'w', 'y', 'o'
  ]);

  const shiftForbidden = new Set(['f10', 'delete', 'insert']);

  const altForbidden = new Set(['d', 'f', 'x', 'arrowleft', 'arrowright', 'home', 'end']);

  const metaForbidden = new Set(['a', 'c', 'x', 'v', 's', 'p', 'i', 'j', 'u', 'f', 'g']);

  const keys = (e) => {
    const key = e.key?.toLowerCase();
    const ctrl = e.ctrlKey, shift = e.shiftKey, alt = e.altKey, meta = e.metaKey;

    if (forbiddenKeys.has(key) || (shift && shiftForbidden.has(key))) {
      block(e);
      return;
    }

    if (ctrl && ctrlForbidden.has(key)) {
      block(e);
      return;
    }

    if (alt && altForbidden.has(key)) {
      block(e);
      return;
    }

    if (meta && metaForbidden.has(key)) {
      block(e);
      return;
    }

    if ((ctrl || meta) && shift) {
      if (['i', 'j', 'c', 'k', 'e', 'a', 's', 'p', 'd', 'n'].includes(key)) {
        block(e);
        return;
      }
    }

    if (ctrl && alt && ['delete', 'del', 'i', 'j'].includes(key)) {
      block(e);
      return;
    }

    if (shift && alt && ['p', 's', 'd'].includes(key)) {
      block(e);
      return;
    }

    if (key === 'escape' && (ctrl || shift || alt || meta)) {
      block(e);
      return;
    }
  };

  const printBlock = () => {
    window.addEventListener('beforeprint', (e) => {
      e.preventDefault();
      document.body.innerHTML = '';
      setTimeout(() => { window.stop(); }, 10);
    });
  };

  const frameBreaker = () => {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  };

  const init = () => {
    css();
    frameBreaker();
    printBlock();

    document.addEventListener('contextmenu', block);
    document.addEventListener('selectstart', block);
    document.addEventListener('dragstart', (e) => {
      if (e.target.closest('img, video, canvas, a, iframe, embed, object')) block(e);
    });
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);
    document.addEventListener('keydown', keys);
    document.addEventListener('keyup', keys);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();