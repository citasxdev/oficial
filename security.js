(function(){
  "use strict";

  const block = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const css = () => {
    const style = document.createElement('style');
    style.textContent = `body{user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}img{-webkit-user-drag:none;user-drag:none;pointer-events:auto;-webkit-touch-callout:none}`;
    document.head.appendChild(style);
  };

  const keys = (e) => {
    const key = e.key;
    if (key === 'F12' || key === 'PrintScreen' || key === 'ContextMenu' || (e.shiftKey && key === 'F10')) {
      block(e);
      return;
    }
    if (e.ctrlKey) {
      const k = key.toLowerCase();
      if (['u', 's', 'i', 'j', 'c', 'p'].includes(k)) {
        block(e);
        return;
      }
      if (e.shiftKey && ['i', 'j', 'c', 'k', 'e', 'a'].includes(k)) {
        block(e);
        return;
      }
    }
    if (e.altKey && (key === 'D' || key === 'F' || key === 'X')) {
      block(e);
    }
  };

  const detect = () => {
    if (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
      document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">Acceso denegado</h1>';
    }
  };

  const init = () => {
    css();
    document.addEventListener('contextmenu', block);
    document.addEventListener('keydown', keys);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);
    document.addEventListener('dragstart', (e) => { if (e.target.closest('img')) block(e); });
    document.addEventListener('selectstart', block);
    setInterval(detect, 1000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();