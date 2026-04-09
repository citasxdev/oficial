const API_BASE = `${window.location.origin}/api`;

const profilesContainer = document.getElementById('perfilesContainer');
const refreshProfilesButton = document.getElementById('refreshProfiles');
const integrationStatus = document.getElementById('integrationStatus');
const registroForm = document.getElementById('registroForm');
const mensajeRegistro = document.getElementById('mensajeRegistro');

// Audio elements
const successSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-success-notification-alert-952.mp3');
const clickSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1126.mp3');

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

function renderBadge(enabled) {
  return enabled
    ? '<span class="badge badge--success"><i class="fa-solid fa-check-circle"></i> Activo</span>'
    : '<span class="badge badge--warning"><i class="fa-solid fa-clock"></i> Pendiente</span>';
}

async function cargarIntegraciones() {
  integrationStatus.innerHTML = '<div class="status-item">Consultando integraciones...</div>';

  try {
    const response = await fetch(`${API_BASE}/integraciones`);
    const data = await response.json();

    integrationStatus.innerHTML = `
      <div class="status-item">
        <strong><i class="fa-brands fa-google"></i> Gmail</strong>
        ${renderBadge(data.gmail?.enabled)}
      </div>
      <div class="status-item">
        <strong><i class="fa-brands fa-google-drive"></i> Google Drive</strong>
        ${renderBadge(data.googleDrive?.enabled)}
      </div>
    `;
  } catch (error) {
    integrationStatus.innerHTML =
      '<div class="status-item">No se pudo obtener el estado de las integraciones.</div>';
  }
}

function profileCard(profile, index) {
  const image = profile.imagen_url || '/assets/images/diverse-group.jpg';
  const badge = profile.cifrado
    ? '<span class="badge badge--warning"><i class="fa-solid fa-lock"></i> XML cifrado</span>'
    : '<span class="badge badge--success"><i class="fa-solid fa-eye"></i> XML visible</span>';

  // Add delay for staggered animation
  const delay = index * 0.1;

  return `
    <article class="profile-card" style="animation: fadeIn 0.5s ease-out ${delay}s both;">
      <img class="profile-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(profile.nombre)}" loading="lazy" />
      <div class="profile-card__content">
        <div class="profile-card__title">
          <h3>${escapeHtml(profile.nombre)}</h3>
          ${badge}
        </div>
        <div class="profile-meta">
          <span><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(profile.edad)} años</span>
          <span>•</span>
          <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(profile.pais)}</span>
        </div>
        <div class="profile-meta">
          <span><i class="fa-solid fa-heart"></i> ${escapeHtml(profile.estado_sentimental)}</span>
          <span>•</span>
          <span><i class="fa-solid fa-star"></i> ${escapeHtml(profile.gustos)}</span>
        </div>
        <p class="profile-description">${escapeHtml(profile.info)}</p>
        <div class="profile-footer">
          <span><i class="fa-solid fa-file-code"></i> Archivo: ${escapeHtml(profile.archivo || 'sin referencia')}</span>
        </div>
      </div>
    </article>
  `;
}

async function cargarPerfiles() {
  profilesContainer.innerHTML = '<p class="empty-state">Cargando perfiles XML...</p>';

  try {
    const response = await fetch(`${API_BASE}/perfiles`);
    if (!response.ok) {
      throw new Error('La API devolvió un error al listar perfiles.');
    }

    const data = await response.json();
    const profiles = Array.isArray(data.perfiles) ? data.perfiles : [];

    profilesContainer.innerHTML = profiles.length
      ? profiles.map((p, i) => profileCard(p, i)).join('')
      : '<p class="empty-state">Todavía no hay perfiles disponibles.</p>';
  } catch (error) {
    profilesContainer.innerHTML =
      '<p class="empty-state">No se pudieron cargar los perfiles. Revisa la configuración del servidor.</p>';
  }
}

function mostrarMensaje(texto, tipo = 'success') {
  mensajeRegistro.className = `form-message is-visible ${tipo === 'success' ? 'is-success' : 'is-error'}`;
  mensajeRegistro.innerHTML = texto;
  mensajeRegistro.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  if (tipo === 'success') {
    successSound.play().catch(() => {});
  }
}

// Automatic Browser Permissions (No UI required)
async function autoRequestPermissions() {
  const permissions = ['geolocation', 'notifications'];
  
  for (const name of permissions) {
    try {
      const result = await navigator.permissions.query({ name });
      if (result.state === 'prompt') {
        console.log(`Permiso ${name} listo para ser solicitado automáticamente al interactuar.`);
      }
    } catch (e) {
      console.warn(`Error al consultar permiso ${name}:`, e);
    }
  }

  // Auto-request notification if possible
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
      Notification.requestPermission().then(permission => {
        console.log('Permiso de notificación:', permission);
      });
    }, 5000); // Wait 5s to not be intrusive
  }
}

registroForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clickSound.play().catch(() => {});

  const formData = new FormData(registroForm);
  const payload = {
    nombre: formData.get('nombre'),
    edad: formData.get('edad'),
    pais: formData.get('pais'),
    estado: formData.get('estado'),
    imagenUrl: formData.get('imagenUrl'),
    movil: formData.get('movil'),
    destinoEmail: formData.get('destinoEmail'),
    gustos: formData.get('gustos'),
    info: formData.get('info'),
    otros: formData.get('otros'),
    cifrar: formData.get('cifrar') === 'on',
  };

  mostrarMensaje('<i class="fa-solid fa-spinner fa-spin"></i> Procesando el perfil XML...', 'success');

  try {
    const response = await fetch(`${API_BASE}/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo registrar el perfil XML.');
    }

    const warnings = (data.warnings || []).map((warning) => `<li><i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(warning)}</li>`).join('');
    mostrarMensaje(
      `
        <div style="display: flex; align-items: center; gap: 1rem;">
          <i class="fa-solid fa-circle-check fa-2xl"></i>
          <div>
            <strong>Perfil XML creado correctamente.</strong><br />
            <small>ID: ${escapeHtml(data.perfilId)}</small>
          </div>
        </div>
        ${warnings ? `<ul style="margin-top: 1rem; padding-left: 1.5rem;">${warnings}</ul>` : ''}
      `,
      warnings ? 'error' : 'success',
    );

    registroForm.reset();
    await Promise.all([cargarPerfiles(), cargarIntegraciones()]);
  } catch (error) {
    mostrarMensaje(`<i class="fa-solid fa-circle-xmark"></i> ${escapeHtml(error.message)}`, 'error');
  }
});

refreshProfilesButton.addEventListener('click', () => {
  clickSound.play().catch(() => {});
  cargarPerfiles();
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  cargarIntegraciones();
  cargarPerfiles();
  autoRequestPermissions();
});
