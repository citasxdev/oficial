(function(){
  "use strict";

  const modal = document.getElementById('register-modal');
  const openBtn = document.getElementById('register-btn');
  const closeBtn = document.querySelector('.close-modal');
  const form = document.getElementById('register-form');
  const submitBtn = document.getElementById('register-submit-btn');

  openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('reg-nombre').value.trim();
    const descripcion = document.getElementById('reg-descripcion').value.trim();
    const pais = document.getElementById('reg-pais').value.trim();
    let movil = document.getElementById('reg-movil').value.trim();
    const edad = document.getElementById('reg-edad').value.trim();

    if (!nombre || !descripcion || !pais || !movil || !edad) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const edadNum = parseInt(edad, 10);
    if (isNaN(edadNum) || edadNum < 18 || edadNum > 99) {
      alert('La edad debe ser un número entre 18 y 99.');
      return;
    }

    movil = movil.replace(/[^\d+]/g, '');
    if (!movil.match(/^\+?\d{7,15}$/)) {
      alert('Ingrese un número de teléfono válido (mínimo 7 dígitos).');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Enviando...';

    const mensaje = `*Nuevo registro en Personas de Compañía*%0A%0A` +
      `👤 *Nombre:* ${encodeURIComponent(nombre)}%0A` +
      `📝 *Descripción:* ${encodeURIComponent(descripcion)}%0A` +
      `🌍 *País:* ${encodeURIComponent(pais)}%0A` +
      `📱 *Móvil:* ${encodeURIComponent(movil)}%0A` +
      `🎂 *Edad:* ${encodeURIComponent(edad)}`;

    const url = `https://wa.me/5350369270?text=${mensaje}`;
    
    setTimeout(() => {
      window.open(url, '_blank');
      modal.classList.add('hidden');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Enviar por WhatsApp';
    }, 300);
  });
})();