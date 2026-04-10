(function(){
  "use strict";
  const STORAGE_KEY = 'citasimple_history';
  let history = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) history = JSON.parse(saved);
  } catch(e) { history = []; }

  window.Permisos = {
    solicitarNotificaciones: () => {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    },
    solicitarUbicacion: () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(() => {}, () => {});
      }
    },
    registrarAccion: (id, accion) => {
      const existe = history.find(h => h.id === id);
      if (!existe) {
        history.push({ id, accion });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
    },
    fueVisto: (id) => history.some(h => h.id === id),
    limpiarHistorial: () => {
      history = [];
      localStorage.removeItem(STORAGE_KEY);
    },
    obtenerPerfilesNoVistos: (lista) => {
      return lista.filter(p => !history.some(h => h.id === p.id));
    }
  };

  window.addEventListener('load', () => {
    Permisos.solicitarNotificaciones();
    Permisos.solicitarUbicacion();
  });
})();