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
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
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

  const altForbidden = new Set(['d', 'f', 'x', 'left', 'right', 'home', 'end']);

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

    if (ctrl && alt && ['del', 'delete', 'i', 'j'].includes(key)) {
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

  const devtools = () => {
    let open = false;
    const threshold = 160;
    const check = () => {
      const width = window.outerWidth - window.innerWidth > threshold;
      const height = window.outerHeight - window.innerHeight > threshold;
      if (width || height) {
        if (!open) {
          open = true;
          document.body.style.filter = 'blur(12px)';
          document.body.style.pointerEvents = 'none';
          const div = document.createElement('div');
          div.id = 'devtools-lock';
          div.style.cssText = `
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            background:#0b0b0f;color:#f0f0f0;padding:30px 40px;border-radius:16px;
            box-shadow:0 0 60px rgba(0,0,0,0.9);z-index:2147483647;
            font-family:system-ui;text-align:center;border:2px solid #e63946;
            backdrop-filter:blur(4px);
          `;
          div.innerHTML = `<h2 style="margin:0 0 16px;color:#e63946;font-size:1.8rem;">⛔ Acceso Denegado</h2><p style="margin:0;font-size:1.1rem;">Las herramientas de desarrollo están bloqueadas.</p>`;
          document.body.appendChild(div);
        }
      } else if (open) {
        open = false;
        document.body.style.filter = '';
        document.body.style.pointerEvents = '';
        const el = document.getElementById('devtools-lock');
        if (el) el.remove();
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  };

  const consoleOverride = () => {
    const noop = () => {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'clear', 'assert', 'count', 'countReset'];
    methods.forEach(m => { console[m] = noop; });
    Object.defineProperty(window, 'console', { configurable: false, writable: false });
  };

  const printBlock = () => {
    window.addEventListener('beforeprint', (e) => {
      e.preventDefault();
      document.body.innerHTML = '';
      setTimeout(() => { window.stop(); }, 10);
    });
    const style = document.createElement('style');
    style.media = 'print';
    style.textContent = `body { display: none !important; }`;
    document.head.appendChild(style);
  };

  const frameBreaker = () => {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  };

  const init = () => {
    css();
    consoleOverride();
    frameBreaker();
    printBlock();

    document.addEventListener('contextmenu', block);
    document.addEventListener('selectstart', block);
    document.addEventListener('dragstart', (e) => { if (e.target.closest('img, video, canvas, a, iframe, embed, object')) block(e); });
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);
    document.addEventListener('keydown', keys);
    document.addEventListener('keyup', keys);

    window.addEventListener('resize', () => {
      if (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
        document.body.style.filter = 'blur(12px)';
        document.body.style.pointerEvents = 'none';
      }
    });

    devtools();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();