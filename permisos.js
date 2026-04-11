(function () {
  "use strict";

  const STORAGE_KEY = "citasimple_history";
  let history = [];

  /* ── Cargar historial persistido ── */
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) history = JSON.parse(saved);
    if (!Array.isArray(history)) history = [];
  } catch (_) {
    history = [];
  }

  /* ── Guardar historial ── */
  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (_) { /* storage lleno o privado */ }
  }

  /* ── API pública ── */
  window.Permisos = {

    /* Solicitar permiso de notificaciones de forma no intrusiva */
    solicitarNotificaciones() {
      if (!("Notification" in window)) return;
      if (Notification.permission === "default") {
        /* Diferir para no bloquear el primer render */
        setTimeout(() => {
          Notification.requestPermission().catch(() => {});
        }, 3000);
      }
    },

    /* Solicitar geolocalización solo si el usuario interactúa */
    solicitarUbicacion() {
      if (!("geolocation" in navigator)) return;
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { timeout: 5000, maximumAge: 60000 }
      );
    },

    /* Registrar una acción sobre un perfil (add / block) */
    registrarAccion(id, accion) {
      const existe = history.find(h => h.id === id);
      if (!existe) {
        history.push({ id, accion, ts: Date.now() });
        saveHistory();
      }
    },

    /* Verificar si un perfil ya fue visto */
    fueVisto(id) {
      return history.some(h => h.id === id);
    },

    /* Limpiar todo el historial */
    limpiarHistorial() {
      history = [];
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    },

    /* Filtrar perfiles que aún no han sido vistos */
    obtenerPerfilesNoVistos(lista) {
      if (!Array.isArray(lista)) return [];
      return lista.filter(p => !history.some(h => h.id === p.id));
    }
  };

  /* ── Solicitar permisos tras la carga completa ── */
  window.addEventListener("load", () => {
    Permisos.solicitarNotificaciones();
  }, { once: true });

})();
