(function(){
  "use strict";
  const legalLink = document.getElementById('legal-link');
  const legalModal = document.getElementById('legal-modal');
  const closeLegal = document.getElementById('close-legal');

  legalLink.addEventListener('click', (e) => {
    e.preventDefault();
    legalModal.classList.remove('hidden');
  });

  closeLegal.addEventListener('click', () => {
    legalModal.classList.add('hidden');
  });

  window.addEventListener('click', (e) => {
    if (e.target === legalModal) {
      legalModal.classList.add('hidden');
    }
  });
})();