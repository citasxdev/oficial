(function () {
  "use strict";

  /* ── Estado global ── */
  const STATE = {
    index: 0,
    list:  [],
    timer: null,
    view:  "discover"
  };

  /* ── Referencias al DOM ── */
  const DOM = {
    discoverView:   document.getElementById("discover-view"),
    addedView:      document.getElementById("added-view"),
    card:           document.getElementById("profile-card"),
    addBtn:         document.getElementById("add-btn"),
    blockBtn:       document.getElementById("block-btn"),
    addedBtn:       document.getElementById("added-btn"),
    backBtn:        document.getElementById("back-to-discover"),
    notification:   document.getElementById("notification"),
    currentSpan:    document.getElementById("current-count"),
    totalSpan:      document.getElementById("total-count"),
    counterDisplay: document.getElementById("counter-display"),
    actionButtons:  document.getElementById("action-buttons"),
    addedList:      document.getElementById("added-list")
  };

  /* ── Carga de datos ── */
  function loadData() {
    if (typeof peopleData !== "undefined" && Array.isArray(peopleData)) {
      STATE.list = peopleData.map(p => ({ ...p }));
    } else {
      STATE.list = [{
        id: 0,
        nombre: "Demo",
        edad: 0,
        pais: "Error",
        descripcion: "No se pudo cargar people.js",
        movil: "+0 000"
      }];
    }
    if (window.Permisos) {
      STATE.list = Permisos.obtenerPerfilesNoVistos(STATE.list);
    }
    DOM.totalSpan.textContent = STATE.list.length;
  }

  /* ── Sanitización XSS ── */
  function sanitizeText(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ── SVG de avatar de respaldo ── */
  const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%236d3f9c'/%3E%3Ctext x='50' y='67' font-size='50' text-anchor='middle' fill='%23f0eaff'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";

  /* ── Renderizar perfil actual ── */
  function renderProfile() {
    if (STATE.list.length === 0 || STATE.index >= STATE.list.length) {
      DOM.card.innerHTML = `
        <div class="profile-content" style="justify-content:center;text-align:center;">
          <i class="fas fa-users-slash" style="font-size:3.5rem;color:#a28ab7;margin-bottom:16px;" aria-hidden="true"></i>
          <h2 style="font-weight:600;margin-bottom:8px;color:#e0d2f2;">Perfiles agotados</h2>
          <p style="color:#b6a3cc;">Vuelve otro día a partir de las 18:00</p>
        </div>
      `;
      DOM.addBtn.disabled  = true;
      DOM.blockBtn.disabled = true;
      DOM.currentSpan.textContent = STATE.list.length;
      return;
    }

    DOM.addBtn.disabled  = false;
    DOM.blockBtn.disabled = false;

    const p = STATE.list[STATE.index];
    const isValidImage = p.imagen && p.imagen !== "#" && p.imagen.startsWith("http");

    const avatarHtml = isValidImage
      ? `<img src="${sanitizeText(p.imagen)}" alt="Foto de perfil de ${sanitizeText(p.nombre)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}';">`
      : `<i class="fas fa-user-circle" aria-hidden="true"></i>`;

    const verifiedBadge = p.verificado
      ? `<span class="verified-badge" title="Perfil verificado"><i class="fas fa-check-circle" aria-hidden="true"></i> Verificado</span>`
      : "";

    DOM.card.innerHTML = `
      <div class="profile-content">
        <div class="profile-avatar">${avatarHtml}</div>
        <div class="profile-name">
          ${sanitizeText(p.nombre)}, ${sanitizeText(String(p.edad))}
          ${verifiedBadge}
        </div>
        <div class="profile-badge">
          <span><i class="fas fa-map-pin" aria-hidden="true"></i>${sanitizeText(p.pais)}</span>
        </div>
        <div class="profile-desc">${sanitizeText(p.descripcion)}</div>
        <div class="profile-contact">
          <i class="fas fa-mobile-alt" aria-hidden="true"></i>
          <span style="font-family:monospace;">${sanitizeText(p.movil)}</span>
        </div>
      </div>
    `;

    DOM.currentSpan.textContent = STATE.index + 1;

    /* Actualizar aria-label del botón agregar con el nombre actual */
    DOM.addBtn.setAttribute("aria-label", `Agregar a ${sanitizeText(p.nombre)}`);
    DOM.blockBtn.setAttribute("aria-label", `Bloquear a ${sanitizeText(p.nombre)}`);
  }

  /* ── Notificación flotante ── */
  function showNotification(msg, isSuccess = false) {
    if (STATE.timer) clearTimeout(STATE.timer);
    const noti = DOM.notification;
    noti.textContent = msg;
    noti.classList.remove("hidden", "match");
    noti.classList.add("show");
    if (isSuccess) noti.classList.add("match");
    /* Anunciar a lectores de pantalla */
    noti.setAttribute("role", "status");
    noti.setAttribute("aria-live", "polite");
    STATE.timer = setTimeout(() => {
      noti.classList.remove("show");
      STATE.timer = setTimeout(() => noti.classList.add("hidden"), 200);
    }, 1800);
  }

  /* ── Avanzar al siguiente perfil ── */
  function nextProfile() {
    if (STATE.index < STATE.list.length - 1) {
      STATE.index++;
    } else {
      STATE.index = STATE.list.length;
    }
    renderProfile();
  }

  /* ── Acción: Agregar ── */
  function onAdd() {
    if (STATE.index >= STATE.list.length) return;
    const person = STATE.list[STATE.index];
    if (window.Permisos) Permisos.registrarAccion(person.id, "add");
    showNotification(`✅ ${person.nombre} agregado a tu lista`, true);
    nextProfile();
  }

  /* ── Acción: Bloquear ── */
  function onBlock() {
    if (STATE.index >= STATE.list.length) return;
    const person = STATE.list[STATE.index];
    if (window.Permisos) Permisos.registrarAccion(person.id, "block");
    showNotification(`🚫 Has bloqueado a ${person.nombre}`, false);
    nextProfile();
  }

  /* ── Obtener perfiles agregados ── */
  function getAddedProfiles() {
    const raw = localStorage.getItem("citasimple_history");
    let history = [];
    try { history = raw ? JSON.parse(raw) : []; } catch (_) { history = []; }
    const addedIds = history.filter(h => h.accion === "add").map(h => h.id);
    const allPeople = (typeof peopleData !== "undefined") ? peopleData : [];
    return allPeople.filter(p => addedIds.includes(p.id));
  }

  /* ── Limpiar número de teléfono ── */
  function cleanPhone(phone) {
    return phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  }

  /* ── Renderizar lista de agregados ── */
  function renderAdded() {
    const added = getAddedProfiles();
    if (added.length === 0) {
      DOM.addedList.innerHTML = `
        <div class="empty-likes">
          <i class="fas fa-address-book" style="font-size:2.5rem;opacity:.6;" aria-hidden="true"></i>
          <p style="margin-top:12px;">Aún no has agregado a nadie.</p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    added.forEach(p => {
      const isValidImage = p.imagen && p.imagen !== "#" && p.imagen.startsWith("http");
      const avatarHtml = isValidImage
        ? `<img src="${sanitizeText(p.imagen)}" alt="Foto de ${sanitizeText(p.nombre)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}';">`
        : `<i class="fas fa-user-circle" aria-hidden="true"></i>`;

      const verifiedIcon = p.verificado
        ? `<i class="fas fa-check-circle" style="color:#1e90ff;margin-left:4px;" aria-label="Verificado"></i>`
        : "";

      const phoneClean  = cleanPhone(p.movil);
      const whatsappUrl = `https://wa.me/${phoneClean}`;

      const item = document.createElement("div");
      item.className = "added-item";
      item.innerHTML = `
        ${avatarHtml}
        <div class="added-info">
          <h3>${sanitizeText(p.nombre)}, ${sanitizeText(String(p.edad))} ${verifiedIcon}</h3>
          <p><i class="fas fa-map-pin" aria-hidden="true"></i> ${sanitizeText(p.pais)} · ${sanitizeText(p.descripcion)}</p>
          <span class="added-contact"><i class="fas fa-mobile-alt" aria-hidden="true"></i> ${sanitizeText(p.movil)}</span>
        </div>
        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="chat-btn" title="Chatear con ${sanitizeText(p.nombre)} por WhatsApp" aria-label="WhatsApp de ${sanitizeText(p.nombre)}">
          <i class="fab fa-whatsapp" aria-hidden="true"></i>
        </a>
      `;
      fragment.appendChild(item);
    });

    DOM.addedList.innerHTML = "";
    DOM.addedList.appendChild(fragment);
  }

  /* ── Cambiar vista ── */
  function switchView(view) {
    STATE.view = view;
    const isDiscover = view === "discover";
    DOM.discoverView.classList.toggle("hidden", !isDiscover);
    DOM.addedView.classList.toggle("hidden", isDiscover);
    DOM.actionButtons.classList.toggle("hidden", !isDiscover);
    DOM.counterDisplay.classList.toggle("hidden", !isDiscover);
    if (isDiscover) {
      renderProfile();
    } else {
      renderAdded();
    }
  }

  /* ── Inicialización ── */
  function init() {
    loadData();
    renderProfile();

    DOM.addBtn.addEventListener("click", onAdd);
    DOM.blockBtn.addEventListener("click", onBlock);
    DOM.addedBtn.addEventListener("click", () => switchView("added"));
    DOM.backBtn.addEventListener("click", () => switchView("discover"));

    /* Soporte de teclado para las tarjetas */
    document.addEventListener("keydown", e => {
      if (STATE.view !== "discover") return;
      if (e.key === "ArrowRight" || e.key === "Enter") onAdd();
      if (e.key === "ArrowLeft"  || e.key === "Escape") onBlock();
    });
  }

  init();
})();
