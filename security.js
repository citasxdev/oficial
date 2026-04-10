(function(){
  "use strict";
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
    }
    if (e.key === 'F12') e.preventDefault();
  });
  document.addEventListener('selectstart', e => e.preventDefault());
  setInterval(() => {
    if (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
      document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">Acceso denegado</h1>';
    }
  }, 1000);
})();