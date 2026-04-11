/**
 * CitasXdev — Módulo PWA
 * Gestiona: registro del SW, banner de instalación,
 * detección de actualizaciones, estado offline.
 */

(function () {
  "use strict";

  const BASE = "/oficial";
  const INSTALL_DISMISSED_KEY = "citasxdev_pwa_dismissed";
  const INSTALL_INSTALLED_KEY = "citasxdev_pwa_installed";

  let deferredPrompt = null;
  let swRegistration = null;

  /* ── 1. Registrar Service Worker ── */
  async function registerSW() {
    if (!("serviceWorker" in navigator)) return;

    try {
      swRegistration = await navigator.serviceWorker.register(
        `${BASE}/sw.js`,
        { scope: `${BASE}/`, updateViaCache: "none" }
      );

      console.log("[PWA] Service Worker registrado:", swRegistration.scope);

      /* Detectar nueva versión disponible */
      swRegistration.addEventListener("updatefound", () => {
        const newWorker = swRegistration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateToast(newWorker);
          }
        });
      });

      /* Verificar actualizaciones cada 30 minutos */
      setInterval(() => swRegistration.update(), 30 * 60 * 1000);

    } catch (err) {
      console.warn("[PWA] Error al registrar Service Worker:", err);
    }
  }

  /* ── 2. Capturar evento de instalación ── */
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;

    /* No mostrar si ya fue instalada o descartada recientemente */
    if (
      localStorage.getItem(INSTALL_INSTALLED_KEY) ||
      wasRecentlyDismissed()
    ) return;

    /* Mostrar banner después de 3 segundos de uso */
    setTimeout(showInstallBanner, 3000);
  });

  /* ── 3. Detectar instalación exitosa ── */
  window.addEventListener("appinstalled", () => {
    console.log("[PWA] Aplicación instalada correctamente.");
    localStorage.setItem(INSTALL_INSTALLED_KEY, "1");
    hideInstallBanner();
    deferredPrompt = null;

    /* Notificar a los clientes del SW */
    if (swRegistration?.active) {
      swRegistration.active.postMessage({ type: "APP_INSTALLED" });
    }
  });

  /* ── 4. Banner de instalación ── */
  function showInstallBanner() {
    const banner = document.getElementById("pwa-install-banner");
    if (!banner || !deferredPrompt) return;
    banner.classList.remove("hidden");
  }

  function hideInstallBanner() {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) banner.classList.add("hidden");
  }

  function wasRecentlyDismissed() {
    const ts = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (!ts) return false;
    const days = (Date.now() - parseInt(ts, 10)) / (1000 * 60 * 60 * 24);
    return days < 7; /* No mostrar por 7 días tras descartar */
  }

  /* Botón de instalación */
  document.addEventListener("DOMContentLoaded", () => {
    const installBtn  = document.getElementById("pwa-install-btn");
    const dismissBtn  = document.getElementById("pwa-dismiss-btn");

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        hideInstallBanner();
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log("[PWA] Respuesta del usuario:", outcome);
        if (outcome === "accepted") {
          localStorage.setItem(INSTALL_INSTALLED_KEY, "1");
        }
        deferredPrompt = null;
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        hideInstallBanner();
        localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()));
      });
    }
  });

  /* ── 5. Toast de actualización disponible ── */
  function showUpdateToast(newWorker) {
    const toast = document.getElementById("pwa-update-toast");
    if (!toast) return;
    toast.classList.remove("hidden");

    const updateBtn = toast.querySelector("button");
    if (updateBtn) {
      updateBtn.addEventListener("click", () => {
        newWorker.postMessage({ type: "SKIP_WAITING" });
        toast.classList.add("hidden");
        window.location.reload();
      }, { once: true });
    }

    /* Auto-ocultar tras 10 segundos */
    setTimeout(() => toast.classList.add("hidden"), 10000);
  }

  /* ── 6. Indicador de estado offline ── */
  const offlineIndicator = document.getElementById("offline-indicator");

  function updateOnlineStatus() {
    if (!offlineIndicator) return;
    if (navigator.onLine) {
      offlineIndicator.classList.remove("visible");
    } else {
      offlineIndicator.classList.add("visible");
    }
  }

  window.addEventListener("online",  updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus(); /* Estado inicial */

  /* ── 7. Suscripción a notificaciones Push ── */
  async function subscribeToPush() {
    if (!swRegistration || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      const existing = await swRegistration.pushManager.getSubscription();
      if (existing) return; /* Ya suscrito */

      /* VAPID key pública (reemplazar con la real en producción) */
      /* const VAPID_PUBLIC_KEY = "TU_VAPID_PUBLIC_KEY_AQUI"; */
      /* const sub = await swRegistration.pushManager.subscribe({
           userVisibleOnly: true,
           applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
         }); */
      console.log("[PWA] Push subscription lista para configurar con VAPID.");
    } catch (err) {
      console.warn("[PWA] Error en suscripción Push:", err);
    }
  }

  /* ── 8. Inicialización ── */
  window.addEventListener("load", () => {
    registerSW().then(() => {
      /* Intentar suscripción push tras registro */
      setTimeout(subscribeToPush, 2000);
    });
  }, { once: true });

  /* ── Utilidad: convertir VAPID key ── */
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
  }

})();
