// tattoo.js — Galería de tattoos

console.log('Tattoo - Cargando galería...');

// Lista de imágenes de tattoos
const tattooImages = [
  "IMG_6985 2.webp",
  "IMG_7700.webp",
  "IMG_7701.webp",
  "IMG_7702.webp",
  "IMG_7703.webp",
  "IMG_7704.webp",
  "IMG_7705.webp",
  "IMG_7706.webp",
  "IMG_7707.webp",
  "IMG_7708.webp"
];

const imageFolder = 'data/images/tattoo/';

// Crear la galería
function createGallery() {
  const gallery = document.getElementById('gallery');
  
  tattooImages.forEach((imageName, index) => {
    // Crear contenedor de item
    const item = document.createElement('div');
    item.className = 'gallery-item loading';
    
    // Crear imagen
    const img = document.createElement('img');
    img.src = imageFolder + imageName;
    img.alt = `Tattoo ${index + 1}`;
    img.loading = 'lazy';
    
    // Añadir al DOM
    item.appendChild(img);
    gallery.appendChild(item);
    
    // Log cuando cargue
    img.onload = () => {
      console.log(`Imagen ${index + 1}/${tattooImages.length} cargada`);
    };
    
    img.onerror = () => {
      console.error('Error cargando:', imageName);
    };
  });
  
  console.log(`Galería creada con ${tattooImages.length} imágenes`);
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', createGallery);
