(function () {
  "use strict";

  const modal     = document.getElementById("register-modal");
  const openBtn   = document.getElementById("register-btn");
  const closeBtn  = document.getElementById("close-register");
  const form      = document.getElementById("register-form");
  const submitBtn = document.getElementById("register-submit-btn");

  /* ── Abrir modal ── */
  function openModal() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    /* Enfocar el primer campo */
    const firstInput = form.querySelector("input");
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  /* ── Cerrar modal ── */
  function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    openBtn.focus();
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  /* Cerrar al hacer clic en el fondo */
  window.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  /* Cerrar con Escape */
  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });

  /* ── Envío del formulario ── */
  form.addEventListener("submit", e => {
    e.preventDefault();

    const nombre      = document.getElementById("reg-nombre").value.trim();
    const descripcion = document.getElementById("reg-descripcion").value.trim();
    const pais        = document.getElementById("reg-pais").value.trim();
    let   movil       = document.getElementById("reg-movil").value.trim();
    const edad        = document.getElementById("reg-edad").value.trim();

    /* Validación de campos requeridos */
    if (!nombre || !descripcion || !pais || !movil || !edad) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    /* Validación de edad */
    const edadNum = parseInt(edad, 10);
    if (isNaN(edadNum) || edadNum < 18 || edadNum > 99) {
      alert("La edad debe ser un número entre 18 y 99.");
      return;
    }

    /* Validación de teléfono */
    movil = movil.replace(/[^\d+]/g, "");
    if (!/^\+?\d{7,15}$/.test(movil)) {
      alert("Ingrese un número de teléfono válido (mínimo 7 dígitos).");
      return;
    }

    /* Estado de envío */
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse" aria-hidden="true"></i> Enviando...';

    const mensaje =
      `*Nuevo registro en CitasXdev*%0A%0A` +
      `👤 *Nombre:* ${encodeURIComponent(nombre)}%0A` +
      `📝 *Descripción:* ${encodeURIComponent(descripcion)}%0A` +
      `🌍 *País:* ${encodeURIComponent(pais)}%0A` +
      `📱 *Móvil:* ${encodeURIComponent(movil)}%0A` +
      `🎂 *Edad:* ${encodeURIComponent(edad)}`;

    const url = `https://wa.me/5350369270?text=${mensaje}`;

    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      closeModal();
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Enviar por WhatsApp";
    }, 300);
  });

})();
