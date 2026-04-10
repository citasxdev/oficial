(function(){
  "use strict";

  const modal = document.getElementById('register-modal');
  const openBtn = document.getElementById('register-btn');
  const closeBtn = document.querySelector('.close-modal');
  const form = document.getElementById('register-form');

  openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const descripcion = document.getElementById('reg-descripcion').value.trim();
    const pais = document.getElementById('reg-pais').value.trim();
    const movil = document.getElementById('reg-movil').value.trim();
    const edad = document.getElementById('reg-edad').value.trim();

    if (!nombre || !descripcion || !pais || !movil || !edad) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const mensaje = `*Nuevo registro en Personas de Compañía*%0A%0A` +
      `👤 *Nombre:* ${encodeURIComponent(nombre)}%0A` +
      `📝 *Descripción:* ${encodeURIComponent(descripcion)}%0A` +
      `🌍 *País:* ${encodeURIComponent(pais)}%0A` +
      `📱 *Móvil:* ${encodeURIComponent(movil)}%0A` +
      `🎂 *Edad:* ${encodeURIComponent(edad)}`;

    const url = `https://wa.me/5350369270?text=${mensaje}`;
    window.open(url, '_blank');
    
    modal.classList.add('hidden');
    form.reset();
    alert('Redirigiendo a WhatsApp para enviar tu registro.');
  });
})();