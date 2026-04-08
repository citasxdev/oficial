(() => {
  const btnCitas = document.getElementById('btnCitas');
  const btnRegistro = document.getElementById('btnRegistro');
  const seccionCitas = document.getElementById('seccionCitas');
  const seccionRegistro = document.getElementById('seccionRegistro');
  const perfilesContainer = document.getElementById('perfilesContainer');
  const registroForm = document.getElementById('registroForm');
  const mensajeRegistro = document.getElementById('mensajeRegistro');

  const API = 'http://localhost:5000/api';

  const toggleSeccion = (mostrarCitas) => {
    btnCitas.classList.toggle('active', mostrarCitas);
    btnRegistro.classList.toggle('active', !mostrarCitas);
    seccionCitas.classList.toggle('visible', mostrarCitas);
    seccionCitas.classList.toggle('oculto', !mostrarCitas);
    seccionRegistro.classList.toggle('visible', !mostrarCitas);
    seccionRegistro.classList.toggle('oculto', mostrarCitas);
    if (mostrarCitas) cargarPerfiles();
  };

  btnCitas.addEventListener('click', () => toggleSeccion(true));
  btnRegistro.addEventListener('click', () => toggleSeccion(false));

  const cargarPerfiles = async () => {
    perfilesContainer.innerHTML = '<div style="text-align:center"><i class="fas fa-spinner fa-pulse"></i> Cargando...</div>';
    try {
      const res = await fetch(`${API}/perfiles`);
      if (!res.ok) throw new Error('Error en la red');
      const perfiles = await res.json();
      perfilesContainer.innerHTML = perfiles.length 
        ? perfiles.map(p => `
          <div class="perfil-card">
            <img src="${p.imagen_url || 'https://via.placeholder.com/300?text=Sin+imagen'}" 
                 alt="${p.nombre}" 
                 class="perfil-img" 
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/300?text=Error+imagen'">
            <div class="perfil-info">
              <h3><span>${escapeHtml(p.nombre)}</span> <span>${p.edad}</span></h3>
              <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(p.pais)}</p>
              <p><i class="fas fa-heart"></i> ${escapeHtml(p.estado_sentimental)}</p>
              <p><i class="fas fa-star"></i> ${escapeHtml(p.gustos)}</p>
              <p><i class="fas fa-comment"></i> ${escapeHtml(p.info)}</p>
            </div>
          </div>`).join('')
        : '<p><i class="fas fa-info-circle"></i> No hay perfiles disponibles. ¡Regístrate!</p>';
    } catch (err) {
      console.error(err);
      perfilesContainer.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> Error al cargar perfiles. ¿Servidor iniciado?</p>';
    }
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };

  registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(registroForm));
    mensajeRegistro.textContent = 'Enviando...';
    mensajeRegistro.className = 'mensaje';
    
    try {
      const res = await fetch(`${API}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const data = await res.json();
      if (res.ok) {
        mensajeRegistro.innerHTML = '<i class="fas fa-check-circle"></i> ✅ Registro exitoso. XML enviado y guardado.';
        mensajeRegistro.classList.add('success');
        registroForm.reset();
        setTimeout(() => {
          if (seccionCitas.classList.contains('visible')) cargarPerfiles();
          else toggleSeccion(true);
        }, 800);
      } else {
        throw new Error(data.error || 'Error en el servidor');
      }
    } catch (err) {
      mensajeRegistro.innerHTML = `<i class="fas fa-times-circle"></i> ❌ ${err.message}`;
      mensajeRegistro.classList.add('error');
    }
  });

  // Cargar perfiles al inicio
  cargarPerfiles();
})();