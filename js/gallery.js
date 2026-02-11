// gallery.js — Shared mosaic gallery for flashbook & tattoo
// Reads section config from data.json, uses numbered images (0.webp, 1.webp, ...)

(async function () {
  // Determine which section we're on from the data-section attribute on <body>
  const section = document.body.dataset.section;
  if (!section) {
    console.error('gallery.js: No data-section attribute on <body>');
    return;
  }

  // Load config
  const data = await fetch('data.json').then(r => r.json());
  const config = data.sections[section];
  if (!config) {
    console.error(`gallery.js: Section "${section}" not found in data.json`);
    return;
  }

  // Set background
  const bgEl = document.querySelector('.gallery-bg');
  if (bgEl) {
    bgEl.style.backgroundImage = `url('${config.background}')`;
  }

  // Set title
  const titleEl = document.querySelector('.gallery-title');
  if (titleEl) {
    titleEl.textContent = config.title;
  }

  // Mosaic config
  const MOSAIC = {
    containerWidth: 2400,
    minSize: 200,
    maxSize: 400,
    padding: 20,
    maxAttempts: 100,
  };

  // Build image list from numbered files
  const images = [];
  for (let i = 0; i < config.imageCount; i++) {
    images.push(`${config.imagePath}${i}.webp`);
  }

  // Shuffle
  const shuffled = images.sort(() => Math.random() - 0.5);

  // Collision detection
  function collides(r1, r2, pad) {
    return !(
      r1.x + r1.w + pad < r2.x ||
      r1.x > r2.x + r2.w + pad ||
      r1.y + r1.h + pad < r2.y ||
      r1.y > r2.y + r2.h + pad
    );
  }

  function findPosition(w, h, placed, containerW, pad) {
    for (let i = 0; i < MOSAIC.maxAttempts; i++) {
      const x = Math.random() * (containerW - w - pad * 2) + pad;
      const y = Math.random() * 3000 + pad;
      const rect = { x, y, w, h };

      let ok = true;
      for (const p of placed) {
        if (collides(rect, p, pad)) { ok = false; break; }
      }
      if (ok) return { x, y };
    }

    // Fallback: place below everything
    const maxY = placed.reduce((m, r) => Math.max(m, r.y + r.h), 0);
    return {
      x: Math.random() * (containerW - w - pad * 2) + pad,
      y: maxY + pad * 2,
    };
  }

  // Create mosaic
  const mosaic = document.getElementById('mosaic');
  const placed = [];
  let maxHeight = 0;

  for (const src of shuffled) {
    const size = Math.random() * (MOSAIC.maxSize - MOSAIC.minSize) + MOSAIC.minSize;

    const img = document.createElement('img');
    img.className = 'mosaic-image';
    img.src = src;
    img.alt = `${config.title} image`;

    await new Promise((resolve) => {
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        const w = size;
        const h = size / ratio;

        const pos = findPosition(w, h, placed, MOSAIC.containerWidth, MOSAIC.padding);

        img.style.left = pos.x + 'px';
        img.style.top = pos.y + 'px';
        img.style.width = w + 'px';
        img.style.height = h + 'px';

        placed.push({ x: pos.x, y: pos.y, w, h });
        maxHeight = Math.max(maxHeight, pos.y + h);

        mosaic.appendChild(img);
        resolve();
      };

      img.onerror = () => {
        console.warn('Failed to load:', src);
        resolve();
      };
    });
  }

  mosaic.style.height = (maxHeight + MOSAIC.padding * 2) + 'px';
})();
