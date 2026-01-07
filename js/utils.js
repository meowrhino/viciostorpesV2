// utils.js — Utilidades compartidas

// Precargar una imagen
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Precargar múltiples imágenes
export async function preloadImages(sources) {
  const promises = sources.map(src => preloadImage(src));
  return Promise.all(promises);
}

// Logging mejorado
export function log(message, data = null) {
  const timestamp = new Date().toLocaleTimeString();
  if (data) {
    console.log(`[${timestamp}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

// Detectar si es móvil
export function isMobile() {
  return window.innerWidth <= 768;
}

// Debounce para eventos
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
