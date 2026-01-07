// flashbook.js — Mosaico scrolleable con algoritmo de colocación sin colisiones

console.log('Flashbook - Cargando mosaico...');

// Configuración del mosaico
const CONFIG = {
  imageFolder: 'data/images/flashbook_scroll/',
  containerWidth: 2400, // ancho máximo del contenedor
  minImageSize: 200,    // tamaño mínimo de imagen
  maxImageSize: 400,    // tamaño máximo de imagen
  padding: 20,          // espacio entre imágenes
  maxAttempts: 100      // intentos máximos para colocar una imagen
};

// Cargar lista de imágenes dinámicamente
async function loadImageList() {
  // Como no podemos hacer un listado del servidor sin backend,
  // definimos la lista manualmente (generada desde el sistema de archivos)
  const images = [
    "16 sin título_20250217155254.webp",
    "16 sin título_20250217155417 2.webp",
    "16 sin título_20250217155445.webp",
    "16 sin título_20250217155638.webp",
    "16 sin título_20250217160009.webp",
    "16 sin título_20250217192222 2.webp",
    "18 sin título_20241128175142.webp",
    "20250215-131158012.webp",
    "20250215-131158014.webp",
    "20250215-131158021.webp",
    "20250215-131158026.webp",
    "22 sin título_20250430103932.webp",
    "23 sin título_20250926103318.webp",
    "23 sin título_20250926103336.webp",
    "25 sin título_20251120091824.webp",
    "25 sin título_20251225153651.webp",
    "25 sin título_20251225153809.webp",
    "48623EB8-AF46-4C65-B1E6-5E3798EDFA80.webp",
    "Escanear 106.webp",
    "Escanear 109.webp",
    "Escanear 124.webp",
    "Escanear 125.webp",
    "Escanear 127.webp",
    "Escanear 26.webp",
    "Escanear 59.webp",
    "Escanear 61.webp",
    "Escanear 70.webp",
    "IMG_0170.webp",
    "IMG_1514.webp",
    "IMG_1515.webp",
    "IMG_1516.webp",
    "IMG_1536.webp",
    "IMG_1538.webp",
    "IMG_1539.webp",
    "IMG_1542.webp",
    "IMG_1552.webp",
    "IMG_1932.webp",
    "IMG_1934.webp",
    "IMG_2298.webp",
    "IMG_2301.webp",
    "IMG_2377.webp",
    "IMG_3184.webp",
    "IMG_3431.webp",
    "IMG_4984.webp",
    "IMG_5006.webp",
    "IMG_5007.webp",
    "IMG_5009.webp",
    "IMG_5011.webp",
    "IMG_5012.webp",
    "IMG_5062.webp",
    "IMG_5064.webp",
    "IMG_5072.webp",
    "IMG_5075.webp",
    "IMG_5078.webp",
    "IMG_5079.webp",
    "IMG_5082.webp",
    "IMG_5083.webp",
    "IMG_5085.webp",
    "IMG_5105.webp",
    "IMG_5115.webp",
    "IMG_5242.webp",
    "IMG_5246.webp",
    "IMG_5421.webp",
    "IMG_5788.webp",
    "IMG_5789.webp",
    "IMG_5792.webp",
    "IMG_5891.webp",
    "IMG_5916.webp",
    "IMG_5935.webp",
    "IMG_5936.webp",
    "IMG_6169.webp",
    "IMG_6172.webp",
    "IMG_6173.webp",
    "IMG_6180.webp",
    "IMG_6326.webp",
    "IMG_6432.webp",
    "IMG_6525.webp",
    "IMG_6763.webp",
    "IMG_6764.webp",
    "IMG_6768.webp",
    "IMG_6771.webp",
    "IMG_6773.webp",
    "IMG_6775.webp",
    "IMG_6776.webp",
    "IMG_6777.webp",
    "IMG_6778.webp",
    "IMG_6779.webp",
    "IMG_6785.webp",
    "IMG_6787 2.webp",
    "IMG_6797.webp",
    "IMG_6859.webp",
    "IMG_6860.webp",
    "IMG_6893.webp",
    "IMG_6956 2.webp",
    "IMG_7308.webp",
    "IMG_7309.webp",
    "IMG_7311.webp",
    "IMG_7452.webp",
    "IMG_7494.webp",
    "IMG_7495.webp",
    "IMG_7496.webp",
    "IMG_7501.webp",
    "IMG_7502.webp",
    "IMG_7503.webp",
    "IMG_7505.webp",
    "IMG_7509.webp",
    "IMG_7512.webp",
    "IMG_7513.webp",
    "IMG_7514.webp",
    "IMG_7559.webp",
    "IMG_7669.webp",
    "IMG_7674.webp",
    "IMG_7677.webp",
    "IMG_8378.webp",
    "IMG_8379.webp",
    "IMG_8380.webp",
    "IMG_8381.webp",
    "IMG_8382.webp",
    "IMG_8383.webp",
    "IMG_8384.webp",
    "IMG_8385.webp",
    "IMG_8399.webp",
    "IMG_9629.webp",
    "IMG_9631.webp",
    "IMG_9908.webp",
    "eb0dc0b11757582a1c858468476a6d06.webp"
  ];
  
  return images.map(name => CONFIG.imageFolder + name);
}

// Verificar si dos rectángulos colisionan
function checkCollision(rect1, rect2, padding) {
  return !(
    rect1.x + rect1.width + padding < rect2.x ||
    rect1.x > rect2.x + rect2.width + padding ||
    rect1.y + rect1.height + padding < rect2.y ||
    rect1.y > rect2.y + rect2.height + padding
  );
}

// Encontrar posición válida para una imagen
function findValidPosition(width, height, placedRects, containerWidth, padding) {
  const maxAttempts = CONFIG.maxAttempts;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generar posición aleatoria
    const x = Math.random() * (containerWidth - width - padding * 2) + padding;
    const y = Math.random() * 3000 + padding; // altura inicial grande
    
    const newRect = { x, y, width, height };
    
    // Verificar colisiones con imágenes ya colocadas
    let hasCollision = false;
    for (const rect of placedRects) {
      if (checkCollision(newRect, rect, padding)) {
        hasCollision = true;
        break;
      }
    }
    
    if (!hasCollision) {
      return { x, y };
    }
  }
  
  // Si no encuentra posición después de maxAttempts, colocar al final
  const maxY = placedRects.reduce((max, rect) => 
    Math.max(max, rect.y + rect.height), 0);
  return { 
    x: Math.random() * (containerWidth - width - padding * 2) + padding,
    y: maxY + padding * 2
  };
}

// Crear el mosaico
async function createMosaic() {
  const mosaic = document.getElementById('mosaic');
  const images = await loadImageList();
  const placedRects = [];
  
  console.log(`Colocando ${images.length} imágenes...`);
  
  // Mezclar imágenes aleatoriamente
  const shuffled = images.sort(() => Math.random() - 0.5);
  
  let loadedCount = 0;
  let maxHeight = 0;
  
  // Procesar cada imagen
  for (const src of shuffled) {
    // Tamaño aleatorio para cada imagen
    const size = Math.random() * (CONFIG.maxImageSize - CONFIG.minImageSize) + CONFIG.minImageSize;
    
    // Crear elemento img
    const img = document.createElement('img');
    img.className = 'mosaic-image loading';
    img.src = src;
    img.alt = 'Flashbook image';
    
    // Esperar a que cargue para obtener dimensiones reales
    await new Promise((resolve) => {
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const width = size;
        const height = size / aspectRatio;
        
        // Encontrar posición válida
        const pos = findValidPosition(
          width, 
          height, 
          placedRects, 
          CONFIG.containerWidth, 
          CONFIG.padding
        );
        
        // Aplicar posición y tamaño
        img.style.left = pos.x + 'px';
        img.style.top = pos.y + 'px';
        img.style.width = width + 'px';
        img.style.height = height + 'px';
        
        // Guardar rectángulo
        placedRects.push({
          x: pos.x,
          y: pos.y,
          width: width,
          height: height
        });
        
        // Actualizar altura máxima
        maxHeight = Math.max(maxHeight, pos.y + height);
        
        // Añadir al DOM
        mosaic.appendChild(img);
        
        loadedCount++;
        if (loadedCount % 10 === 0) {
          console.log(`Cargadas ${loadedCount}/${images.length} imágenes`);
        }
        
        resolve();
      };
      
      img.onerror = () => {
        console.error('Error cargando imagen:', src);
        resolve();
      };
    });
  }
  
  // Ajustar altura del contenedor
  mosaic.style.height = (maxHeight + CONFIG.padding * 2) + 'px';
  
  console.log(`Mosaico completado: ${loadedCount} imágenes colocadas`);
  console.log(`Altura total del mosaico: ${maxHeight}px`);
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', createMosaic);
