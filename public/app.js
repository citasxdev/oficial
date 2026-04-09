const API_BASE = `${window.location.origin}/api`;

const profilesContainer = document.getElementById('perfilesContainer');
const refreshProfilesButton = document.getElementById('refreshProfiles');
const integrationStatus = document.getElementById('integrationStatus');
const registroForm = document.getElementById('registroForm');
const mensajeRegistro = document.getElementById('mensajeRegistro');

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

function renderBadge(enabled) {
  return enabled
    ? '<span class="badge badge--success">Activo</span>'
    : '<span class="badge badge--warning">Pendiente</span>';
}

async function cargarIntegraciones() {
  integrationStatus.innerHTML = '<div class="status-item">Consultando integraciones...</div>';

  try {
    const response = await fetch(`${API_BASE}/integraciones`);
    const data = await response.json();

    integrationStatus.innerHTML = `
      <div class="status-item">
        <strong>Gmail</strong>
        ${renderBadge(data.gmail?.enabled)}
      </div>
      <div class="status-item">
        <strong>Google Drive</strong>
        ${renderBadge(data.googleDrive?.enabled)}
      </div>
    `;
  } catch (error) {
    integrationStatus.innerHTML =
      '<div class="status-item">No se pudo obtener el estado de las integraciones.</div>';
  }
}

function profileCard(profile) {
  const image = profile.imagen_url || 'https://placehold.co/640x480/e9d5ff/4c1d95?text=Perfil+XML';
  const badge = profile.cifrado
    ? '<span class="badge badge--warning">XML cifrado</span>'
    : '<span class="badge badge--success">XML visible</span>';

  return `
    <article class="profile-card">
      <img class="profile-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(profile.nombre)}" loading="lazy" />
      <div class="profile-card__content">
        <div class="profile-card__title">
          <h3>${escapeHtml(profile.nombre)}</h3>
          ${badge}
        </div>
        <div class="profile-meta">
          <span>${escapeHtml(profile.edad)} años</span>
          <span>•</span>
          <span>${escapeHtml(profile.pais)}</span>
        </div>
        <div class="profile-meta">
          <span>${escapeHtml(profile.estado_sentimental)}</span>
          <span>•</span>
          <span>${escapeHtml(profile.gustos)}</span>
        </div>
        <p class="profile-description">${escapeHtml(profile.info)}</p>
        <div class="profile-footer">
          <span>Archivo: ${escapeHtml(profile.archivo || 'sin referencia')}</span>
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
      ? profiles.map(profileCard).join('')
      : '<p class="empty-state">Todavía no hay perfiles disponibles.</p>';
  } catch (error) {
    profilesContainer.innerHTML =
      '<p class="empty-state">No se pudieron cargar los perfiles. Revisa la configuración del servidor.</p>';
  }
}

function mostrarMensaje(texto, tipo = 'success') {
  mensajeRegistro.className = `form-message is-visible ${tipo === 'success' ? 'is-success' : 'is-error'}`;
  mensajeRegistro.innerHTML = texto;
}

registroForm.addEventListener('submit', async (event) => {
  event.preventDefault();

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

  mostrarMensaje('Procesando el perfil XML...', 'success');

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

    const warnings = (data.warnings || []).map((warning) => `<li>${escapeHtml(warning)}</li>`).join('');
    mostrarMensaje(
      `
        <strong>Perfil XML creado correctamente.</strong><br />
        Archivo: ${escapeHtml(data.archivo)}<br />
        ID: ${escapeHtml(data.perfilId)}
        ${warnings ? `<ul>${warnings}</ul>` : ''}
      `,
      warnings ? 'error' : 'success',
    );

    registroForm.reset();
    await Promise.all([cargarPerfiles(), cargarIntegraciones()]);
  } catch (error) {
    mostrarMensaje(escapeHtml(error.message), 'error');
  }
});

refreshProfilesButton.addEventListener('click', cargarPerfiles);

cargarIntegraciones();
cargarPerfiles();
