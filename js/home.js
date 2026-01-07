// home.js — Lógica del home
// Por ahora solo logging, pero preparado para futuras interacciones

console.log('ViciosTorpes V2 - Home cargado');

// Precargar imágenes de fondo para transiciones suaves
const preloadImages = () => {
  const sections = document.querySelectorAll('.section-card');
  sections.forEach(section => {
    const bg = section.querySelector('.section-bg');
    const bgImage = window.getComputedStyle(bg).backgroundImage;
    const url = bgImage.match(/url\(["']?([^"']*)["']?\)/)?.[1];
    if (url) {
      const img = new Image();
      img.src = url;
    }
  });
};

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', preloadImages);
