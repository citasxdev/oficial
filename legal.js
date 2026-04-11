(function () {
  "use strict";

  const legalLink  = document.getElementById("legal-link");
  const legalModal = document.getElementById("legal-modal");
  const closeBtn   = document.getElementById("close-legal");

  function openLegal(e) {
    e.preventDefault();
    legalModal.classList.remove("hidden");
    legalModal.setAttribute("aria-hidden", "false");
    if (closeBtn) closeBtn.focus();
  }

  function closeLegal() {
    legalModal.classList.add("hidden");
    legalModal.setAttribute("aria-hidden", "true");
    if (legalLink) legalLink.focus();
  }

  if (legalLink)  legalLink.addEventListener("click", openLegal);
  if (closeBtn)   closeBtn.addEventListener("click", closeLegal);

  /* Cerrar al hacer clic en el fondo */
  if (legalModal) {
    legalModal.addEventListener("click", e => {
      if (e.target === legalModal) closeLegal();
    });
  }

  /* Cerrar con Escape */
  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && legalModal && !legalModal.classList.contains("hidden")) {
      closeLegal();
    }
  });

})();
