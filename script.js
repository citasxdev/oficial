(function(){
  "use strict";

  const STATE = {
    index: 0,
    list: [],
    timer: null,
    view: 'discover'
  };

  const DOM = {
    discoverView: document.getElementById('discover-view'),
    addedView: document.getElementById('added-view'),
    card: document.getElementById('profile-card'),
    addBtn: document.getElementById('add-btn'),
    blockBtn: document.getElementById('block-btn'),
    addedBtn: document.getElementById('added-btn'),
    backBtn: document.getElementById('back-to-discover'),
    notification: document.getElementById('notification'),
    currentSpan: document.getElementById('current-count'),
    totalSpan: document.getElementById('total-count'),
    counterDisplay: document.getElementById('counter-display'),
    actionButtons: document.getElementById('action-buttons'),
    addedList: document.getElementById('added-list')
  };

  function loadData() {
    if (typeof peopleData !== 'undefined' && Array.isArray(peopleData)) {
      STATE.list = peopleData.map(p => ({...p}));
    } else {
      STATE.list = [{ id: 0, nombre: "Demo", edad: 0, pais: "Error", descripcion: "No se pudo cargar people.js", movil: "+0 000" }];
    }
    if (window.Permisos) {
      STATE.list = Permisos.obtenerPerfilesNoVistos(STATE.list);
    }
    DOM.totalSpan.textContent = STATE.list.length;
  }

  function sanitizeText(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderProfile() {
    if (STATE.list.length === 0 || STATE.index >= STATE.list.length) {
      DOM.card.innerHTML = `
        <div class="profile-content" style="justify-content:center;text-align:center;">
          <i class="fas fa-users-slash" style="font-size:3.5rem;color:#a28ab7;margin-bottom:16px;"></i>
          <h2 style="font-weight:600;margin-bottom:8px; color:#e0d2f2;">Perfiles agotados</h2>
          <p style="color:#b6a3cc;">Vuelve otro día a partir de las 18:00</p>
        </div>
      `;
      DOM.addBtn.disabled = true;
      DOM.blockBtn.disabled = true;
      DOM.currentSpan.textContent = STATE.list.length;
      return;
    }

    DOM.addBtn.disabled = false;
    DOM.blockBtn.disabled = false;

    const p = STATE.list[STATE.index];
    const avatarHtml = p.imagen 
      ? `<img src="${sanitizeText(p.imagen)}" alt="${sanitizeText(p.nombre)}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'%3E%3Ccircle cx=\\'50\\' cy=\\'50\\' r=\\'45\\' fill=\\'%236d3f9c\\'/%3E%3Ctext x=\\'50\\' y=\\'67\\' font-size=\\'50\\' text-anchor=\\'middle\\' fill=\\'%23f0eaff\\'%3E👤%3C/text%3E%3C/svg%3E';">`
      : `<i class="fas fa-user-circle"></i>`;
    
    const verifiedBadge = p.verificado 
      ? `<span class="verified-badge"><i class="fas fa-check-circle"></i> Verificado</span>` 
      : '';

    DOM.card.innerHTML = `
      <div class="profile-content">
        <div class="profile-avatar">
          ${avatarHtml}
        </div>
        <div class="profile-name">
          ${sanitizeText(p.nombre)}, ${p.edad}
          ${verifiedBadge}
        </div>
        <div class="profile-badge">
          <span><i class="fas fa-map-pin"></i>${sanitizeText(p.pais)}</span>
        </div>
        <div class="profile-desc">${sanitizeText(p.descripcion)}</div>
        <div class="profile-contact">
          <i class="fas fa-mobile-alt"></i>
          <span style="font-family:monospace;">${sanitizeText(p.movil)}</span>
        </div>
      </div>
    `;
    DOM.currentSpan.textContent = STATE.index + 1;
  }

  function showNotification(msg, isSuccess = false) {
    if (STATE.timer) clearTimeout(STATE.timer);
    const noti = DOM.notification;
    noti.textContent = msg;
    noti.classList.remove('hidden', 'match');
    noti.classList.add('show');
    if (isSuccess) noti.classList.add('match');
    STATE.timer = setTimeout(() => {
      noti.classList.remove('show');
      STATE.timer = setTimeout(() => noti.classList.add('hidden'), 100);
    }, 1800);
  }

  function nextProfile() {
    if (STATE.index < STATE.list.length - 1) {
      STATE.index++;
      renderProfile();
    } else if (STATE.index === STATE.list.length - 1) {
      STATE.index = STATE.list.length;
      renderProfile();
    }
  }

  function onAdd() {
    if (STATE.index >= STATE.list.length) return;
    const person = STATE.list[STATE.index];
    if (window.Permisos) Permisos.registrarAccion(person.id, 'add');
    showNotification(`✅ ${person.nombre} agregado a tu lista`, true);
    nextProfile();
  }

  function onBlock() {
    if (STATE.index >= STATE.list.length) return;
    const person = STATE.list[STATE.index];
    if (window.Permisos) Permisos.registrarAccion(person.id, 'block');
    showNotification(`🚫 Has bloqueado a ${person.nombre}`, false);
    nextProfile();
  }

  function getAddedProfiles() {
    const history = window.Permisos ? JSON.parse(localStorage.getItem('citasimple_history') || '[]') : [];
    const addedIds = history.filter(h => h.accion === 'add').map(h => h.id);
    const allPeople = (typeof peopleData !== 'undefined') ? peopleData : [];
    return allPeople.filter(p => addedIds.includes(p.id));
  }

  function cleanPhoneNumber(phone) {
    return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
  }

  function renderAdded() {
    const added = getAddedProfiles();
    if (added.length === 0) {
      DOM.addedList.innerHTML = `<div class="empty-likes"><i class="fas fa-address-book" style="font-size:2.5rem; opacity:0.6;"></i><p style="margin-top:12px;">Aún no has agregado a nadie.</p></div>`;
      return;
    }
    let html = '';
    added.forEach(p => {
      const avatarHtml = p.imagen 
        ? `<img src="${sanitizeText(p.imagen)}" alt="${sanitizeText(p.nombre)}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'%3E%3Ccircle cx=\\'50\\' cy=\\'50\\' r=\\'45\\' fill=\\'%236d3f9c\\'/%3E%3Ctext x=\\'50\\' y=\\'67\\' font-size=\\'50\\' text-anchor=\\'middle\\' fill=\\'%23f0eaff\\'%3E👤%3C/text%3E%3C/svg%3E';">`
        : `<i class="fas fa-user-circle"></i>`;
      const verifiedIcon = p.verificado ? '<i class="fas fa-check-circle" style="color:#1e90ff; margin-left:4px;"></i>' : '';
      
      const phoneClean = cleanPhoneNumber(p.movil);
      const whatsappUrl = `https://wa.me/${phoneClean}`;

      html += `
        <div class="added-item">
          ${avatarHtml}
          <div class="added-info">
            <h3>${sanitizeText(p.nombre)}, ${p.edad} ${verifiedIcon}</h3>
            <p><i class="fas fa-map-pin"></i> ${sanitizeText(p.pais)} · ${sanitizeText(p.descripcion)}</p>
            <span class="added-contact"><i class="fas fa-mobile-alt"></i> ${sanitizeText(p.movil)}</span>
          </div>
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="chat-btn" title="Chatear por WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>
      `;
    });
    DOM.addedList.innerHTML = html;
  }

  function switchView(view) {
    STATE.view = view;
    if (view === 'discover') {
      DOM.discoverView.classList.remove('hidden');
      DOM.addedView.classList.add('hidden');
      DOM.actionButtons.classList.remove('hidden');
      DOM.counterDisplay.classList.remove('hidden');
      renderProfile();
    } else {
      DOM.discoverView.classList.add('hidden');
      DOM.addedView.classList.remove('hidden');
      DOM.actionButtons.classList.add('hidden');
      DOM.counterDisplay.classList.add('hidden');
      renderAdded();
    }
  }

  function init() {
    loadData();
    renderProfile();

    DOM.addBtn.addEventListener('click', onAdd);
    DOM.blockBtn.addEventListener('click', onBlock);
    DOM.addedBtn.addEventListener('click', () => switchView('added'));
    DOM.backBtn.addEventListener('click', () => switchView('discover'));
  }

  init();
})();