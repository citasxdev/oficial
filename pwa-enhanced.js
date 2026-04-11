/**
 * CitasXdev — PWA Mejorada con Badging API, Share API y Assets
 * Características avanzadas: notificación de badge, compartir, instalación mejorada.
 */

(function () {
  "use strict";

  const BASE = "/oficial";
  let swRegistration = null;
  let badgeCount = 0;

  /* ── 1. Badging API — Mostrar contador en el ícono ── */
  async function updateBadge(count) {
    badgeCount = count;
    if ("setAppBadge" in navigator) {
      try {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      } catch (err) {
        console.warn("[PWA] Error en Badging API:", err);
      }
    }
  }

  /* ── 2. Share API — Compartir perfil ── */
  async function shareProfile(person) {
    if (!navigator.share) return false;

    try {
      await navigator.share({
        title: `${person.nombre}, ${person.edad}`,
        text: `Mira este perfil: ${person.descripcion}`,
        url: `${BASE}/?profile=${person.id}`
      });
      return true;
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("[PWA] Error en Share API:", err);
      }
      return false;
    }
  }

  /* ── 3. Web Share Target API — Recibir comparticiones ── */
  function handleSharedData() {
    if ("launchQueue" in window) {
      window.launchQueue.setConsumer(launchParams => {
        if (launchParams.files && launchParams.files.length > 0) {
          console.log("[PWA] Archivos compartidos:", launchParams.files);
        }
      });
    }
  }

  /* ── 4. Periodic Background Sync — Sincronización periódica ── */
  async function registerPeriodicSync(swReg) {
    if (!("periodicSync" in swReg)) return;
    try {
      await swReg.periodicSync.register("sync-profiles", {
        minInterval: 24 * 60 * 60 * 1000 // 24 horas
      });
      console.log("[PWA] Sincronización periódica registrada");
    } catch (err) {
      console.warn("[PWA] Error en Periodic Sync:", err);
    }
  }

  /* ── 5. File Handling API — Abrir archivos con la app ── */
  async function registerFileHandling() {
    if (!("launchQueue" in window)) return;
    // Configurado en manifest.json
    console.log("[PWA] File Handling API disponible");
  }

  /* ── 6. Notificaciones avanzadas con acciones ── */
  async function sendAdvancedNotification(title, options = {}) {
    if (!("serviceWorker" in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        icon: `${BASE}/icons/icon-192x192.png`,
        badge: `${BASE}/icons/icon-96x96.png`,
        vibrate: [200, 100, 200],
        tag: "citasxdev-notification",
        renotify: true,
        requireInteraction: false,
        ...options
      });
    } catch (err) {
      console.warn("[PWA] Error en notificación avanzada:", err);
    }
  }

  /* ── 7. Gestor de instalación mejorado ── */
  async function handleInstallPrompt() {
    let deferredPrompt = null;

    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      deferredPrompt = e;
      console.log("[PWA] beforeinstallprompt capturado");
    });

    window.addEventListener("appinstalled", () => {
      console.log("[PWA] Aplicación instalada exitosamente");
      deferredPrompt = null;
      updateBadge(0);
    });

    return {
      canInstall: () => !!deferredPrompt,
      install: async () => {
        if (!deferredPrompt) return false;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        return outcome === "accepted";
      }
    };
  }

  /* ── 8. Detectar cambios de conectividad ── */
  function monitorConnectivity() {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      document.body.classList.toggle("offline", !isOnline);
      if (isOnline) {
        console.log("[PWA] Conexión restaurada");
      } else {
        console.log("[PWA] Modo offline activado");
      }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus(); // Estado inicial
  }

  /* ── 9. Gestor de actualizaciones del SW ── */
  async function handleSWUpdates() {
    if (!("serviceWorker" in navigator)) return;

    try {
      swRegistration = await navigator.serviceWorker.ready;

      swRegistration.addEventListener("updatefound", () => {
        const newWorker = swRegistration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("[PWA] Nueva versión disponible");
            sendAdvancedNotification("CitasXdev actualizado", {
              body: "Toca para recargar y obtener las últimas mejoras",
              tag: "update-notification"
            });
          }
        });
      });

      // Verificar actualizaciones cada 30 minutos
      setInterval(() => swRegistration.update(), 30 * 60 * 1000);
    } catch (err) {
      console.warn("[PWA] Error en gestor de actualizaciones:", err);
    }
  }

  /* ── 10. Estadísticas de uso ── */
  function trackUsage() {
    const stats = {
      sessions: parseInt(localStorage.getItem("citasxdev_sessions") || "0") + 1,
      lastVisit: new Date().toISOString(),
      profilesViewed: parseInt(localStorage.getItem("citasxdev_profiles_viewed") || "0")
    };

    localStorage.setItem("citasxdev_sessions", String(stats.sessions));
    localStorage.setItem("citasxdev_last_visit", stats.lastVisit);

    console.log("[PWA] Estadísticas:", stats);
    return stats;
  }

  /* ── API pública ── */
  window.CitasPWA = {
    async updateBadge(count) {
      await updateBadge(count);
    },

    async shareProfile(person) {
      return await shareProfile(person);
    },

    async sendNotification(title, options) {
      return await sendAdvancedNotification(title, options);
    },

    async registerPeriodicSync(swReg) {
      return await registerPeriodicSync(swReg);
    },

    getInstallPrompt() {
      return handleInstallPrompt();
    },

    getStats() {
      return trackUsage();
    },

    isOnline() {
      return navigator.onLine;
    }
  };

  /* ── Inicialización ── */
  window.addEventListener("load", () => {
    handleSharedData();
    registerFileHandling();
    monitorConnectivity();
    handleSWUpdates();
    trackUsage();
  }, { once: true });

})();
