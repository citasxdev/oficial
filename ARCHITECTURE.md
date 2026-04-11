# CitasXdev — Arquitectura y Sincronización de Archivos

**URL:** https://citasxdev.github.io/oficial/  
**Versión:** 2.1.0  
**Última actualización:** 2026-04-11

---

## 📋 Estructura de Archivos

```
/oficial/
├── index.html                 # HTML principal con SEO, PWA, Schema
├── style.css                  # Estilos optimizados con animaciones audiovisuales
├── script.js                  # Lógica principal con integración de audio
├── people.js                  # Datos de perfiles
├── security.js                # Protección de seguridad
├── permisos.js                # Gestión de permisos y estado
├── register.js                # Modal de registro
├── legal.js                   # Modal legal
├── audio.js                   # 🆕 Módulo de audio y feedback háptico
├── pwa.js                     # PWA básica (Service Worker)
├── pwa-enhanced.js            # 🆕 PWA mejorada (Badging, Share, Sync)
├── manifest.json              # Configuración PWA
├── sw.js                      # Service Worker
├── offline.html               # Página offline
├── robots.txt                 # Configuración de bots
├── sitemap.xml                # Mapa del sitio
├── .nojekyll                  # GitHub Pages
├── _headers                   # Headers de seguridad
├── citasxdev.png              # Logo principal
│
├── assets/
│   ├── audio/
│   │   ├── pop.mp3            # 🆕 Click/Tap (80ms, 880Hz)
│   │   ├── match.mp3          # 🆕 Agregar/Success (200ms, 660Hz)
│   │   ├── error.mp3          # 🆕 Bloquear/Error (150ms, 220Hz)
│   │   └── notify.mp3         # 🆕 Notificación (250ms, 550Hz)
│   │
│   └── icons/
│       └── custom-icons.js    # 🆕 Pack de iconos SVG personalizados
│
└── icons/
    ├── icon-72x72.png         # PWA icons (múltiples tamaños)
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── icon-maskable-192x192.png
    └── icon-maskable-512x512.png
```

---

## 🔗 Dependencias y Sincronización

### 1. **HTML Principal** (`index.html`)
- ✅ Carga todos los scripts en orden correcto
- ✅ Meta tags SEO, OG, Twitter, PWA
- ✅ Schema.org estructurado (WebApplication, WebSite, BreadcrumbList, SoftwareApplication)
- ✅ Elementos de UI (modales, banner, toast, indicador offline)

**Scripts cargados (orden crítico):**
1. `custom-icons.js` — Expone `window.CitasIcons`
2. `audio.js` — Expone `window.CitasAudio`
3. `pwa-enhanced.js` — Expone `window.CitasPWA`
4. `people.js` — Expone `window.peopleData`
5. `security.js` — Inyecta protección
6. `permisos.js` — Expone `window.Permisos`
7. `register.js` — Gestiona modal de registro
8. `legal.js` — Gestiona modal legal
9. `script.js` — Lógica principal (depende de todo lo anterior)
10. `pwa.js` — Registro del Service Worker

---

### 2. **Estilos** (`style.css`)
- ✅ Variables CSS centralizadas
- ✅ Animaciones audiovisuales (cardSlideIn, buttonPress, ripple, etc.)
- ✅ Feedback táctil (active states, transforms)
- ✅ Responsive design
- ✅ Accesibilidad (focus-visible, prefers-reduced-motion)
- ✅ Soporte para dispositivos táctiles

**Animaciones principales:**
- `appLoad` — Carga inicial
- `cardSlideIn` — Entrada de tarjeta de perfil
- `avatarZoom` — Zoom del avatar
- `buttonPress` — Presión de botón
- `notificationBounce` — Notificación flotante
- `ripple` — Efecto ripple en clics
- `badgePulse` — Pulso del badge verificado

---

### 3. **Lógica Principal** (`script.js`)
**Dependencias:**
- `window.peopleData` (de `people.js`)
- `window.Permisos` (de `permisos.js`)
- `window.CitasAudio` (de `audio.js`)
- `window.CitasPWA` (de `pwa-enhanced.js`)

**Funciones principales:**
- `loadData()` — Carga perfiles
- `renderProfile()` — Renderiza tarjeta con feedback de audio
- `showNotification()` — Muestra notificación con audio/vibración
- `onAdd()` — Agrega perfil + actualiza badge
- `onBlock()` — Bloquea perfil
- `renderAdded()` — Renderiza lista de agregados
- `switchView()` — Cambia entre vistas

---

### 4. **Audio y Feedback Háptico** (`audio.js`)
**API pública:**
```javascript
window.CitasAudio = {
  init(),                    // Inicializar
  play(soundKey),            // Reproducir sonido
  feedback(soundKey),        // Audio + vibración
  vibrate(pattern),          // Solo vibración
  tone(freq, duration),      // Generar tono
  toggleAudio(enabled),      // Activar/desactivar
  toggleHaptic(enabled),     // Activar/desactivar
  isAudioEnabled(),          // Verificar estado
  isHapticEnabled()          // Verificar estado
}
```

**Sonidos disponibles:**
- `pop` — Click/Tap (80ms, 880Hz, haptic: [10])
- `match` — Agregar/Success (200ms, 660Hz, haptic: [30,50,30])
- `error` — Bloquear/Error (150ms, 220Hz, haptic: [50,30])
- `notify` — Notificación (250ms, 550Hz, haptic: [20,20,20,20])

---

### 5. **PWA Mejorada** (`pwa-enhanced.js`)
**API pública:**
```javascript
window.CitasPWA = {
  updateBadge(count),              // Badging API
  shareProfile(person),            // Share API
  sendNotification(title, options),// Notificaciones avanzadas
  registerPeriodicSync(swReg),     // Sincronización periódica
  getInstallPrompt(),              // Gestor de instalación
  getStats(),                      // Estadísticas de uso
  isOnline()                       // Estado de conectividad
}
```

**Características:**
- **Badging API** — Muestra contador en el ícono de la app
- **Share API** — Compartir perfiles en redes sociales
- **Web Share Target API** — Recibir comparticiones
- **Periodic Background Sync** — Sincronización cada 24h
- **File Handling API** — Abrir archivos con la app
- **Notificaciones avanzadas** — Con acciones y vibración
- **Conectividad** — Monitoreo de online/offline

---

### 6. **Iconos Personalizados** (`custom-icons.js`)
**API pública:**
```javascript
window.CitasIcons = {
  heart,      // Corazón
  star,       // Estrella
  user,       // Usuario
  bell,       // Campana (notificación)
  check,      // Verificado
  x,          // Cerrar
  message,    // Mensaje
  shield,     // Protección
  mapPin,     // Ubicación
  smartphone  // Teléfono
}
```

Todos son SVG inline optimizados para carga rápida.

---

### 7. **Service Worker** (`sw.js`)
**Estrategias de caché:**
- **Cache-First** — App Shell (HTML, CSS, JS, íconos)
- **Stale-While-Revalidate** — Imágenes externas
- **Network-First** — Navegación con fallback offline

**Características:**
- Precacheo automático en instalación
- Limpieza de cachés antiguas en activación
- Soporte para Push Notifications
- Background Sync
- Mensajes del cliente

---

### 8. **Seguridad** (`security.js`)
**Protecciones:**
- Bloqueo de selección de texto (excepto inputs)
- Bloqueo de menú contextual
- Bloqueo de copiar/cortar/pegar
- Bloqueo de teclas de desarrollador (F12, Ctrl+I, etc.)
- Anti-iframe
- Bloqueo de impresión

---

### 9. **Permisos** (`permisos.js`)
**API pública:**
```javascript
window.Permisos = {
  solicitarNotificaciones(),      // Pedir permiso de notificaciones
  solicitarUbicacion(),           // Pedir permiso de geolocalización
  registrarAccion(id, accion),    // Guardar acción (add/block)
  fueVisto(id),                   // Verificar si fue visto
  limpiarHistorial(),             // Limpiar historial
  obtenerPerfilesNoVistos(lista)  // Filtrar perfiles no vistos
}
```

**Almacenamiento:**
- `localStorage.citasimple_history` — Historial de acciones

---

## 🔄 Flujo de Sincronización

### 1. **Carga de página**
```
index.html carga
  ↓
custom-icons.js (window.CitasIcons)
  ↓
audio.js (window.CitasAudio) → preload de sonidos
  ↓
pwa-enhanced.js (window.CitasPWA) → setup PWA
  ↓
people.js (window.peopleData)
  ↓
security.js → inyecta protección
  ↓
permisos.js (window.Permisos) → carga historial
  ↓
register.js → setup modal
  ↓
legal.js → setup modal
  ↓
script.js → inicializa app
  ↓
pwa.js → registra Service Worker
```

### 2. **Interacción del usuario**
```
Usuario hace clic en "Agregar"
  ↓
script.js:onAdd()
  ↓
CitasAudio.feedback("match") → sonido + vibración
  ↓
CitasPWA.updateBadge(count) → actualiza badge
  ↓
showNotification() → muestra notificación con audio
  ↓
nextProfile() → renderiza siguiente perfil
  ↓
CitasAudio.play("pop") → feedback de carga
```

### 3. **Offline**
```
Usuario sin conexión
  ↓
Service Worker intercepta petición
  ↓
Devuelve caché o offline.html
  ↓
CitasPWA.isOnline() → false
  ↓
offline-indicator visible
```

---

## ✅ Checklist de Sincronización

- [x] HTML carga scripts en orden correcto
- [x] Todas las APIs públicas están expuestas en `window`
- [x] No hay conflictos de nombres
- [x] Dependencias resueltas antes de uso
- [x] LocalStorage sincronizado entre módulos
- [x] Audio preargado antes de uso
- [x] PWA registrada después de DOM ready
- [x] Estilos aplicados correctamente
- [x] Animaciones sin conflictos
- [x] Feedback audiovisual integrado
- [x] Accesibilidad mantenida
- [x] Responsive en todos los tamaños

---

## 🚀 Optimizaciones Implementadas

### Performance
- Variables CSS para evitar cálculos repetidos
- `contain: layout style` en contenedor principal
- `loading="lazy"` en imágenes
- Preload de recursos críticos
- Service Worker con estrategias de caché optimizadas

### Accesibilidad
- `aria-label` dinámicos
- `aria-live` en notificaciones
- `focus-visible` en todos los botones
- Soporte para teclado (Arrow keys, Enter, Escape)
- `prefers-reduced-motion` respetado

### Audiovisual
- Animaciones suaves (0.15s - 0.5s)
- Feedback de vibración en acciones
- Efectos de sonido estratégicos
- Ripple effect en clics
- Transiciones coherentes

### SEO
- URL canónica
- Meta tags completos
- Open Graph + Twitter Cards
- Schema.org estructurado
- Sitemap + robots.txt

---

## 📱 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Android 6+
- ✅ iOS 12+

---

## 🔐 Seguridad

- HTTPS obligatorio (GitHub Pages)
- CSP headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Sanitización XSS en todos los textos
- Validación de inputs

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| HTML | 20 KB |
| CSS | 17 KB |
| JS (total) | ~50 KB |
| Iconos PWA | 500 KB |
| Sonidos | ~200 KB |
| Tamaño total | ~800 KB |
| Lighthouse Score | 95+ |
| Core Web Vitals | Good |

