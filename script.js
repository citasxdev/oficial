(() => {
  const btnCitas = document.getElementById('btnCitas');
  const btnRegistro = document.getElementById('btnRegistro');
  const btnPermisos = document.getElementById('btnPermisos');
  const seccionCitas = document.getElementById('seccionCitas');
  const seccionRegistro = document.getElementById('seccionRegistro');
  const seccionPermisos = document.getElementById('seccionPermisos');
  const perfilesContainer = document.getElementById('perfilesContainer');
  const registroForm = document.getElementById('registroForm');
  const mensajeRegistro = document.getElementById('mensajeRegistro');

  const API = 'http://localhost:5000/api';

  const toggleSeccion = (mostrar) => {
    btnCitas.classList.toggle('active', mostrar === 'citas');
    btnRegistro.classList.toggle('active', mostrar === 'registro');
    btnPermisos.classList.toggle('active', mostrar === 'permisos');
    seccionCitas.classList.toggle('visible', mostrar === 'citas');
    seccionCitas.classList.toggle('oculto', mostrar !== 'citas');
    seccionRegistro.classList.toggle('visible', mostrar === 'registro');
    seccionRegistro.classList.toggle('oculto', mostrar !== 'registro');
    seccionPermisos.classList.toggle('visible', mostrar === 'permisos');
    seccionPermisos.classList.toggle('oculto', mostrar !== 'permisos');
    if (mostrar === 'citas') cargarPerfiles();
  };

  btnCitas.addEventListener('click', () => toggleSeccion('citas'));
  btnRegistro.addEventListener('click', () => toggleSeccion('registro'));
  btnPermisos.addEventListener('click', () => toggleSeccion('permisos'));

  const escapeHtml = (str) => {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };

  const cargarPerfiles = async () => {
    perfilesContainer.innerHTML = '<div style="text-align:center"><i class="fas fa-spinner fa-pulse"></i> Cargando...</div>';
    try {
      const res = await fetch(`${API}/perfiles`);
      if (!res.ok) throw new Error('Error en la red');
      const data = await res.json();
      perfilesContainer.innerHTML = data.perfiles.length 
        ? data.perfiles.map(p => `
          <div class="perfil-card ${p.cifrado ? 'cifrado' : ''}">
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

  registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registroForm);
    const datos = {
      nombre: formData.get('nombre'),
      edad: formData.get('edad'),
      info: formData.get('info'),
      pais: formData.get('pais'),
      imagenUrl: formData.get('imagenUrl'),
      movil: formData.get('movil'),
      estado: formData.get('estado'),
      gustos: formData.get('gustos'),
      otros: formData.get('otros'),
      cifrar: formData.has('cifrar') && formData.get('cifrar') === 'on'
    };
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
        mensajeRegistro.innerHTML = '<i class="fas fa-check-circle"></i> ✅ Registro exitoso. XML guardado' + (datos.cifrar ? ' (cifrado)' : '');
        mensajeRegistro.classList.add('success');
        registroForm.reset();
        document.getElementById('cifrarCheckbox').checked = false;
        setTimeout(() => {
          if (seccionCitas.classList.contains('visible')) cargarPerfiles();
          else toggleSeccion('citas');
        }, 800);
      } else {
        throw new Error(data.error || 'Error en el servidor');
      }
    } catch (err) {
      mensajeRegistro.innerHTML = `<i class="fas fa-times-circle"></i> ❌ ${err.message}`;
      mensajeRegistro.classList.add('error');
    }
  });

  function initPermisos() {
    if (typeof localStorage !== 'undefined') document.getElementById('storageStatus').innerHTML = '✅ Soportado';
    else document.getElementById('storageStatus').innerHTML = '❌ No soportado';

    document.querySelector('[data-permiso="geolocation"]').addEventListener('click', () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
          document.getElementById('locationStatus').innerHTML = `📍 ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
        }, err => {
          document.getElementById('locationStatus').innerHTML = '❌ Denegado o error';
        });
      } else {
        document.getElementById('locationStatus').innerHTML = '🚫 No soportado';
      }
    });

    document.querySelector('[data-permiso="notifications"]').addEventListener('click', async () => {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        document.getElementById('notifStatus').innerHTML = perm === 'granted' ? '✅ Activado' : '❌ Bloqueado';
        if (perm === 'granted') new Notification('Dating XML', { body: 'Notificaciones activadas correctamente' });
      } else {
        document.getElementById('notifStatus').innerHTML = '🚫 No soportado';
      }
    });

    document.querySelector('[data-permiso="camera"]').addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('cameraStatus').innerHTML = '✅ Acceso concedido';
        stream.getTracks().forEach(track => track.stop());
      } catch {
        document.getElementById('cameraStatus').innerHTML = '❌ Denegado o error';
      }
    });

    document.querySelector('[data-permiso="microphone"]').addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        document.getElementById('micStatus').innerHTML = '✅ Acceso concedido';
        stream.getTracks().forEach(track => track.stop());
      } catch {
        document.getElementById('micStatus').innerHTML = '❌ Denegado o error';
      }
    });

    document.querySelector('[data-permiso="clipboard"]').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('Texto copiado desde Dating XML');
        document.getElementById('clipStatus').innerHTML = '✅ Texto copiado';
        setTimeout(() => document.getElementById('clipStatus').innerHTML = '📋 Listo', 1500);
      } catch {
        document.getElementById('clipStatus').innerHTML = '❌ Falló escritura';
      }
    });

    document.querySelector('[data-permiso="network"]').addEventListener('click', () => {
      const online = navigator.onLine;
      document.getElementById('networkStatus').innerHTML = online ? '🟢 Conectado' : '🔴 Desconectado';
    });

    document.querySelector('[data-permiso="fingerprint"]').addEventListener('click', () => {
      let fp = localStorage.getItem('device_fp');
      if (!fp) {
        fp = btoa(navigator.userAgent + screen.width + screen.height + new Date().getTimezoneOffset());
        localStorage.setItem('device_fp', fp);
      }
      document.getElementById('fpStatus').innerHTML = `🆔 ${fp.slice(0, 10)}...`;
    });
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(e => console.log);
    }
  }

  function antiCopyProtection() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
        e.preventDefault();
        return false;
      }
    });
    setInterval(() => {
      if (window.devtools && window.devtools.open) {
        document.body.innerHTML = '<h1 style="color:red">🔒 Protección anti-copia activada</h1>';
      }
    }, 1000);
    const watermarkDiv = document.createElement('div');
    watermarkDiv.className = 'watermark';
    watermarkDiv.innerText = `ID: ${Math.random().toString(36).substr(2, 8)}`;
    document.body.appendChild(watermarkDiv);
  }

  function detectDevTools() {
    let devtools = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        devtools = true;
        throw new Error('DevTools detectado');
      }
    });
    setInterval(() => {
      devtools = false;
      console.log(element);
      if (devtools) {
        document.body.innerHTML = '<h1 style="color:red">⚠️ Herramientas de desarrollo deshabilitadas</h1>';
      }
    }, 3000);
  }

  initPermisos();
  antiCopyProtection();
  detectDevTools();
  cargarPerfiles();
})();