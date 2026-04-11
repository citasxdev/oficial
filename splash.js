/**
 * CitasXdev — Splash Screen (Pantalla de Presentación)
 * Pantalla elegante que se muestra antes de que el usuario acceda a la plataforma.
 * Incluye preload de recursos críticos y animaciones profesionales.
 */

(function () {
  "use strict";

  const SPLASH_DURATION = 2500; // 2.5 segundos
  const SPLASH_ID = "citasxdev-splash";

  /* ── Crear HTML del splash screen ── */
  function createSplashHTML() {
    return `
      <div id="${SPLASH_ID}" class="splash-container">
        <div class="splash-content">
          <!-- Logo animado -->
          <div class="splash-logo-wrapper">
            <img src="/oficial/citasxdev.png" alt="CitasXdev" class="splash-logo" loading="eager" fetchpriority="high">
            <div class="splash-logo-glow"></div>
          </div>

          <!-- Título y descripción -->
          <div class="splash-text">
            <h1 class="splash-title">CitasXdev</h1>
            <p class="splash-subtitle">Personas de Compañía</p>
          </div>

          <!-- Indicador de carga -->
          <div class="splash-loader">
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
            <div class="loader-dot"></div>
          </div>

          <!-- Texto de estado ── -->
          <p class="splash-status">Preparando plataforma...</p>
        </div>

        <!-- Fondo decorativo ── -->
        <div class="splash-background">
          <div class="splash-blob splash-blob-1"></div>
          <div class="splash-blob splash-blob-2"></div>
          <div class="splash-blob splash-blob-3"></div>
        </div>
      </div>
    `;
  }

  /* ── Inyectar estilos del splash screen ── */
  function injectSplashStyles() {
    const style = document.createElement("style");
    style.id = "splash-styles";
    style.textContent = `
      /* ── Splash Screen Styles ── */
      #${SPLASH_ID} {
        position: fixed;
        inset: 0;
        background: linear-gradient(135deg, #0c0b0e 0%, #1a181c 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        overflow: hidden;
      }

      .splash-background {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }

      .splash-blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        opacity: 0.15;
        animation: blobFloat 8s ease-in-out infinite;
      }

      .splash-blob-1 {
        width: 300px;
        height: 300px;
        background: #9f7ec2;
        top: -50px;
        right: -50px;
        animation-delay: 0s;
      }

      .splash-blob-2 {
        width: 250px;
        height: 250px;
        background: #b185db;
        bottom: -30px;
        left: -30px;
        animation-delay: 2s;
      }

      .splash-blob-3 {
        width: 200px;
        height: 200px;
        background: #6d3f9c;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation-delay: 4s;
      }

      @keyframes blobFloat {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -30px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }

      .splash-content {
        position: relative;
        z-index: 10;
        text-align: center;
        animation: contentFadeIn 0.6s ease-out;
      }

      @keyframes contentFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .splash-logo-wrapper {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 30px;
        animation: logoScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes logoScale {
        from {
          opacity: 0;
          transform: scale(0.5) rotateZ(-10deg);
        }
        to {
          opacity: 1;
          transform: scale(1) rotateZ(0deg);
        }
      }

      .splash-logo {
        width: 100%;
        height: 100%;
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(177, 133, 219, 0.3);
        animation: logoPulse 2s ease-in-out infinite;
      }

      @keyframes logoPulse {
        0%, 100% {
          box-shadow: 0 20px 60px rgba(177, 133, 219, 0.3);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 20px 80px rgba(177, 133, 219, 0.5);
          transform: scale(1.02);
        }
      }

      .splash-logo-glow {
        position: absolute;
        inset: -10px;
        border-radius: 24px;
        background: radial-gradient(circle, rgba(177, 133, 219, 0.2) 0%, transparent 70%);
        animation: glowPulse 3s ease-in-out infinite;
      }

      @keyframes glowPulse {
        0%, 100% {
          opacity: 0.5;
          transform: scale(1);
        }
        50% {
          opacity: 1;
          transform: scale(1.1);
        }
      }

      .splash-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #ede4ff;
        margin: 0 0 8px;
        letter-spacing: -0.5px;
        animation: titleSlideIn 0.6s ease-out 0.2s both;
      }

      @keyframes titleSlideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .splash-subtitle {
        font-size: 1.1rem;
        color: #b6a3cc;
        margin: 0 0 40px;
        font-weight: 500;
        letter-spacing: 1px;
        animation: subtitleSlideIn 0.6s ease-out 0.3s both;
      }

      @keyframes subtitleSlideIn {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .splash-loader {
        position: relative;
        width: 60px;
        height: 60px;
        margin: 0 auto 30px;
      }

      .loader-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 3px solid transparent;
        border-radius: 50%;
        border-top-color: #9f7ec2;
        border-right-color: #b185db;
        animation: spin 1.5s linear infinite;
      }

      .loader-ring:nth-child(1) {
        animation-delay: 0s;
        opacity: 0.8;
      }

      .loader-ring:nth-child(2) {
        animation-delay: 0.3s;
        opacity: 0.6;
        transform: scale(0.8);
      }

      .loader-ring:nth-child(3) {
        animation-delay: 0.6s;
        opacity: 0.4;
        transform: scale(0.6);
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .loader-dot {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #b185db;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: dotPulse 1.5s ease-in-out infinite;
      }

      @keyframes dotPulse {
        0%, 100% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        50% {
          opacity: 0.5;
          transform: translate(-50%, -50%) scale(0.5);
        }
      }

      .splash-status {
        font-size: 0.9rem;
        color: #a394b8;
        margin: 0;
        animation: statusFadeIn 0.6s ease-out 0.4s both;
      }

      @keyframes statusFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* ── Animación de salida ── */
      #${SPLASH_ID}.splash-exit {
        animation: splashFadeOut 0.5s ease-out forwards;
      }

      @keyframes splashFadeOut {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.95);
        }
      }

      /* ── Responsive ── */
      @media (max-width: 480px) {
        .splash-title { font-size: 2rem; }
        .splash-subtitle { font-size: 1rem; }
        .splash-logo-wrapper { width: 100px; height: 100px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .splash-logo,
        .splash-logo-glow,
        .splash-content,
        .splash-title,
        .splash-subtitle,
        .splash-status,
        .loader-ring,
        .loader-dot,
        .splash-blob {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Precargar recursos críticos ── */
  function preloadCriticalResources() {
    const resources = [
      { href: "/oficial/style.css", as: "style" },
      { href: "/oficial/script.js", as: "script" },
      { href: "/oficial/audio.js", as: "script" },
      { href: "/oficial/pwa-enhanced.js", as: "script" },
      { href: "/oficial/assets/audio/pop.mp3", as: "audio" },
      { href: "/oficial/assets/audio/match.mp3", as: "audio" }
    ];

    resources.forEach(resource => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource.href;
      link.as = resource.as;
      if (resource.as === "style") {
        link.onload = function () { this.onload = null; this.rel = "stylesheet"; };
      }
      document.head.appendChild(link);
    });
  }

  /* ── Mostrar splash screen ── */
  function showSplash() {
    // Inyectar estilos
    injectSplashStyles();

    // Crear HTML
    const splashHTML = createSplashHTML();
    document.body.insertAdjacentHTML("afterbegin", splashHTML);

    // Precargar recursos
    preloadCriticalResources();

    // Retornar función para cerrar
    return function closeSplash() {
      const splash = document.getElementById(SPLASH_ID);
      if (!splash) return;

      splash.classList.add("splash-exit");
      setTimeout(() => {
        splash.remove();
        // Limpiar estilos
        const styleEl = document.getElementById("splash-styles");
        if (styleEl) styleEl.remove();
      }, 500);
    };
  }

  /* ── Inicializar splash screen ── */
  function init() {
    // Solo mostrar si no está en caché o es primera carga
    const splashShown = sessionStorage.getItem("citasxdev_splash_shown");
    if (splashShown) return;

    const closeSplash = showSplash();
    sessionStorage.setItem("citasxdev_splash_shown", "1");

    // Cerrar splash después del tiempo especificado o cuando el DOM esté listo
    const splashTimer = setTimeout(closeSplash, SPLASH_DURATION);

    // Cerrar también cuando el DOM esté completamente cargado
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        clearTimeout(splashTimer);
        setTimeout(closeSplash, 300); // Pequeño delay para que se vea bien
      }, { once: true });
    } else {
      // Si el DOM ya está cargado, cerrar inmediatamente
      clearTimeout(splashTimer);
      closeSplash();
    }
  }

  // Inicializar cuando el documento esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

})();
