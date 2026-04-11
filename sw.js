/**
 * CitasXdev — Service Worker Inteligente
 * URL: https://citasxdev.github.io/oficial/
 * 
 * Estrategias:
 *  - App Shell: Cache-First (HTML, CSS, JS, íconos)
 *  - Imágenes externas: Stale-While-Revalidate
 *  - API / Datos: Network-First con fallback a caché
 *  - Offline: Página de fallback personalizada
 */

"use strict";

const APP_VERSION   = "v2.1.0";
const CACHE_SHELL   = `citasxdev-shell-${APP_VERSION}`;
const CACHE_IMAGES  = `citasxdev-images-${APP_VERSION}`;
const CACHE_DYNAMIC = `citasxdev-dynamic-${APP_VERSION}`;

const BASE_PATH = "/oficial";

/* ── Recursos del App Shell (precache completo) ── */
const SHELL_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/splash.js`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/audio.js`,
  `${BASE_PATH}/pwa.js`,
  `${BASE_PATH}/pwa-enhanced.js`,
  `${BASE_PATH}/people.js`,
  `${BASE_PATH}/security.js`,
  `${BASE_PATH}/permisos.js`,
  `${BASE_PATH}/register.js`,
  `${BASE_PATH}/legal.js`,
  `${BASE_PATH}/assets/icons/custom-icons.js`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/citasxdev.png`,
  `${BASE_PATH}/offline.html`,
  /* Iconos PWA - Todos los tamaños */
  `${BASE_PATH}/icons/icon-72x72.png`,
  `${BASE_PATH}/icons/icon-96x96.png`,
  `${BASE_PATH}/icons/icon-128x128.png`,
  `${BASE_PATH}/icons/icon-144x144.png`,
  `${BASE_PATH}/icons/icon-152x152.png`,
  `${BASE_PATH}/icons/icon-192x192.png`,
  `${BASE_PATH}/icons/icon-384x384.png`,
  `${BASE_PATH}/icons/icon-512x512.png`,
  `${BASE_PATH}/icons/icon-maskable-192x192.png`,
  `${BASE_PATH}/icons/icon-maskable-512x512.png`,
  /* Efectos de sonido */
  `${BASE_PATH}/assets/audio/pop.mp3`,
  `${BASE_PATH}/assets/audio/match.mp3`,
  `${BASE_PATH}/assets/audio/error.mp3`,
  `${BASE_PATH}/assets/audio/notify.mp3`
];

/* ── Instalación: precachear el App Shell ── */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_SHELL)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn("[SW] Error en precache:", err))
  );
});

/* ── Activación: limpiar cachés antiguas ── */
self.addEventListener("activate", event => {
  const currentCaches = new Set([CACHE_SHELL, CACHE_IMAGES, CACHE_DYNAMIC]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !currentCaches.has(key))
          .map(key => {
            console.log("[SW] Eliminando caché antigua:", key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Interceptar peticiones ── */
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Solo manejar peticiones GET */
  if (request.method !== "GET") return;

  /* Ignorar extensiones del navegador */
  if (url.protocol === "chrome-extension:" || url.protocol === "moz-extension:") return;

  /* Estrategia según el tipo de recurso */
  if (isShellAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_SHELL));
  } else if (isExternalImage(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_IMAGES));
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirstWithOffline(request));
  } else {
    event.respondWith(staleWhileRevalidate(request, CACHE_DYNAMIC));
  }
});

/* ── Mensajes desde el cliente ── */
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "GET_VERSION") {
    event.ports[0]?.postMessage({ version: APP_VERSION });
  }
});

/* ── Notificaciones Push ── */
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  const options = {
    body:    data.body    || "Hay nuevos perfiles disponibles.",
    icon:    `${BASE_PATH}/icons/icon-192x192.png`,
    badge:   `${BASE_PATH}/icons/icon-96x96.png`,
    vibrate: [200, 100, 200],
    data:    { url: data.url || `${BASE_PATH}/` },
    actions: [
      { action: "open",    title: "Ver ahora" },
      { action: "dismiss", title: "Más tarde" }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(
      data.title || "CitasXdev",
      options
    )
  );
});

/* ── Clic en notificación ── */
self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const targetUrl = event.notification.data?.url || `${BASE_PATH}/`;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(clientList => {
        const existing = clientList.find(c => c.url.includes(BASE_PATH) && "focus" in c);
        if (existing) return existing.focus();
        return clients.openWindow(targetUrl);
      })
  );
});

/* ── Sincronización en background ── */
self.addEventListener("sync", event => {
  if (event.tag === "sync-profiles") {
    event.waitUntil(syncProfiles());
  }
});

/* ── Helpers ── */

function isShellAsset(url) {
  return url.origin === self.location.origin &&
    SHELL_ASSETS.some(asset => url.pathname === asset || url.pathname === asset + "index.html");
}

function isExternalImage(url) {
  return url.origin !== self.location.origin &&
    /\.(jpe?g|png|gif|webp|svg|avif)(\?.*)?$/i.test(url.pathname);
}

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

/* Cache-First: sirve desde caché, si falla va a red */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return offlineFallback(request);
  }
}

/* Stale-While-Revalidate: sirve caché inmediatamente, actualiza en background */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

/* Network-First con fallback a offline */
async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    return cached || caches.match(`${BASE_PATH}/offline.html`);
  }
}

/* Página de fallback offline */
async function offlineFallback(request) {
  if (request.destination === "document") {
    return caches.match(`${BASE_PATH}/offline.html`);
  }
  return new Response("", { status: 503, statusText: "Service Unavailable" });
}

/* Sincronización de perfiles en background */
async function syncProfiles() {
  /* Placeholder para futura sincronización con API */
  console.log("[SW] Sincronización de perfiles en background completada.");
}
