(function () {
  "use strict";

  /* ── Bloquear evento ── */
  const block = e => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  };

  /* ── Inyectar CSS de protección ── */
  const injectCSS = () => {
    const style = document.createElement("style");
    style.id = "security-styles";
    style.textContent = `
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        user-select: text !important;
      }
      img, video, canvas, iframe, embed, object, a {
        -webkit-user-drag: none !important;
        user-drag: none !important;
      }
      @media print {
        body { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  };

  /* ── Teclas prohibidas (sin bloquear navegación del navegador) ── */
  const forbiddenKeys = new Set([
    "f12", "printscreen", "scrolllock", "pause", "contextmenu"
  ]);

  /* Ctrl/Cmd: bloquear solo herramientas de desarrollador y fuente */
  const ctrlForbidden = new Set(["u", "i", "j", "s", "p"]);
  const metaForbidden = new Set(["u", "i", "j", "s", "p"]);

  const handleKeys = e => {
    const key  = e.key?.toLowerCase();
    const ctrl = e.ctrlKey;
    const meta = e.metaKey;
    const shift = e.shiftKey;

    if (forbiddenKeys.has(key)) { block(e); return; }
    if (ctrl && ctrlForbidden.has(key)) { block(e); return; }
    if (meta && metaForbidden.has(key)) { block(e); return; }

    /* Ctrl+Shift+I/J/C (DevTools) */
    if ((ctrl || meta) && shift && ["i", "j", "c"].includes(key)) {
      block(e); return;
    }
  };

  /* ── Bloquear impresión ── */
  const blockPrint = () => {
    window.addEventListener("beforeprint", e => {
      e.preventDefault();
      document.body.innerHTML = "";
      setTimeout(() => window.stop(), 10);
    });
  };

  /* ── Anti-iframe ── */
  const frameBreaker = () => {
    if (window.top !== window.self) {
      try { window.top.location = window.self.location; } catch (_) {}
    }
  };

  /* ── Inicialización ── */
  const init = () => {
    injectCSS();
    frameBreaker();
    blockPrint();

    document.addEventListener("contextmenu", block);
    document.addEventListener("selectstart", e => {
      /* Permitir selección en inputs y textareas */
      if (e.target.closest("input, textarea")) return;
      block(e);
    });
    document.addEventListener("dragstart", e => {
      if (e.target.closest("img, video, canvas, a, iframe, embed, object")) block(e);
    });
    document.addEventListener("copy",  block);
    document.addEventListener("cut",   block);
    document.addEventListener("keydown", handleKeys);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

})();
