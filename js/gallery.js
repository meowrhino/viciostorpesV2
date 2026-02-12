// gallery.js — Dual-mode gallery (mosaic + scroll) for flashbook & tattoo
// Reads section config from data.json, uses numbered images (0.webp, 1.webp, ...)
// Progressive loading with emergence animation in mosaic mode
// Horizontal scroll mode inspired by profilePics

(async function () {
  // ===========================
  // Configuration & Setup
  // ===========================
  
  const section = document.body.dataset.section;
  if (!section) {
    console.error('gallery.js: No data-section attribute on <body>');
    return;
  }

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

  // Mosaic config
  const MOSAIC = {
    containerWidth: 2400,
    minSize: 200,
    maxSize: 400,
    padding: 20,
    maxAttempts: 100,
    batchSize: 8,
  };

  // Build image list
  const images = [];
  for (let i = 0; i < config.imageCount; i++) {
    images.push({ index: i, src: `${config.imagePath}${i}.webp` });
  }

  // Shuffle for mosaic mode
  const shuffled = [...images].sort(() => Math.random() - 0.5);

  const mosaic = document.getElementById('mosaic');
  const mosaicContainer = document.querySelector('.mosaic-container');
  
  // State
  let currentMode = 'mosaic'; // 'mosaic' or 'scroll'
  let imageElements = []; // Store references to all image elements
  let currentScrollIndex = 0;
  let mosaicModeHeight = '';

  // ===========================
  // Mosaic Mode Functions
  // ===========================

  function collides(r1, r2, pad) {
    return !(
      r1.x + r1.w + pad < r2.x ||
      r1.x > r2.x + r2.w + pad ||
      r1.y + r1.h + pad < r2.y ||
      r1.y > r2.y + r2.h + pad
    );
  }

  function findPosition(w, h, placed, containerW, pad, currentMaxY) {
    // Dynamic search height: grows with the mosaic
    const searchHeight = Math.max(3000, currentMaxY + 1000);
    
    for (let i = 0; i < MOSAIC.maxAttempts; i++) {
      const x = Math.random() * (containerW - w - pad * 2) + pad;
      const y = Math.random() * searchHeight + pad;
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

  async function loadImage(item, placed, currentMaxY) {
    const size = Math.random() * (MOSAIC.maxSize - MOSAIC.minSize) + MOSAIC.minSize;

    const img = document.createElement('img');
    img.className = 'mosaic-image';
    img.src = item.src;
    img.alt = `${config.title} image`;
    img.dataset.index = item.index;

    return new Promise((resolve) => {
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        const w = size;
        const h = size / ratio;

        const pos = findPosition(w, h, placed, MOSAIC.containerWidth, MOSAIC.padding, currentMaxY);

        img.style.left = pos.x + 'px';
        img.style.top = pos.y + 'px';
        img.style.width = w + 'px';
        img.style.height = h + 'px';

        // Store original mosaic position
        img.dataset.mosaicX = pos.x;
        img.dataset.mosaicY = pos.y;
        img.dataset.mosaicW = w;
        img.dataset.mosaicH = h;

        placed.push({ x: pos.x, y: pos.y, w, h });
        
        mosaic.appendChild(img);
        imageElements.push(img);
        
        // Click handler: enter scroll mode from mosaic, or center clicked image in scroll mode
        img.addEventListener('click', () => {
          const clickedIndex = parseInt(img.dataset.index);
          if (currentMode === 'mosaic') {
            switchToScrollMode(clickedIndex);
          } else {
            scrollToImage(clickedIndex);
          }
        });
        
        requestAnimationFrame(() => {
          img.classList.add('emerged');
        });

        resolve({ maxHeight: pos.y + h });
      };

      img.onerror = () => {
        console.warn('Failed to load:', item.src);
        resolve({ maxHeight: 0 });
      };
    });
  }

  async function loadBatch(batch, placed, currentMaxY) {
    const promises = batch.map(item => loadImage(item, placed, currentMaxY));
    const results = await Promise.all(promises);
    return Math.max(...results.map(r => r.maxHeight));
  }

  async function buildMosaicMode() {
    const placed = [];
    let maxHeight = 0;

    for (let i = 0; i < shuffled.length; i += MOSAIC.batchSize) {
      const batch = shuffled.slice(i, i + MOSAIC.batchSize);
      const batchMaxHeight = await loadBatch(batch, placed, maxHeight);
      maxHeight = Math.max(maxHeight, batchMaxHeight);
      
      mosaicModeHeight = (maxHeight + MOSAIC.padding * 2) + 'px';
      if (currentMode === 'mosaic') {
        mosaic.style.height = mosaicModeHeight;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    mosaicModeHeight = (maxHeight + MOSAIC.padding * 2) + 'px';
    if (currentMode === 'mosaic') {
      mosaic.style.height = mosaicModeHeight;
    }
  }

  // ===========================
  // Scroll Mode Functions
  // ===========================

  function switchToScrollMode(targetIndex) {
    if (currentMode === 'scroll') return;
    
    currentMode = 'scroll';
    currentScrollIndex = targetIndex;
    
    // Update URL hash
    window.location.hash = `scroll-${targetIndex}`;
    
    // Update body data attribute for CSS counter
    document.body.setAttribute('data-current-index', targetIndex);
    
    // Sort images by index for scroll mode (always ascending)
    // Scroll direction is handled by CSS: RTL for flashbook, LTR for tattoo
    imageElements.sort((a, b) => {
      return parseInt(a.dataset.index) - parseInt(b.dataset.index);
    });
    
    // Add scroll mode classes
    document.body.classList.add('scroll-mode');
    mosaicContainer.classList.add('scroll-mode');
    mosaic.classList.add('scroll-mode');
    mosaic.style.height = '100%';
    
    // Reorder DOM elements
    imageElements.forEach(img => {
      mosaic.appendChild(img);
    });
    
    // Enable scroll listener
    mosaicContainer.addEventListener('scroll', updateCurrentImageIndicator);
    
    // Wait for transition to complete, then scroll to target
    setTimeout(() => {
      scrollToImage(targetIndex);
    }, 600); // Match CSS transition duration
  }

  function switchToMosaicMode() {
    if (currentMode === 'mosaic') return;
    
    currentMode = 'mosaic';
    
    // Update URL hash
    window.location.hash = '';
    
    // Remove body data attribute
    document.body.removeAttribute('data-current-index');
    
    // Remove scroll mode classes
    document.body.classList.remove('scroll-mode');
    mosaicContainer.classList.remove('scroll-mode');
    mosaic.classList.remove('scroll-mode');
    if (mosaicModeHeight) {
      mosaic.style.height = mosaicModeHeight;
    }
    
    // Disable scroll listener
    mosaicContainer.removeEventListener('scroll', updateCurrentImageIndicator);

    // Wait for mosaic transition, then center the current image in viewport
    setTimeout(() => {
      if (currentMode !== 'mosaic') return;
      centerMosaicOnImage(currentScrollIndex);
    }, 620);
  }

  function scrollToImage(index) {
    const targetImg = imageElements.find(img => parseInt(img.dataset.index) === index);
    if (!targetImg) return;

    // scrollIntoView works correctly regardless of LTR/RTL direction
    targetImg.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  function centerMosaicOnImage(index) {
    const targetImg = imageElements.find(img => parseInt(img.dataset.index) === index);
    if (!targetImg) return;

    const rect = targetImg.getBoundingClientRect();
    const desiredTop = rect.top + window.scrollY - (window.innerHeight - rect.height) / 2;
    const maxTop = document.documentElement.scrollHeight - window.innerHeight;
    const clampedTop = Math.max(0, Math.min(desiredTop, maxTop));

    window.scrollTo({ top: clampedTop, behavior: 'smooth' });
  }

  function updateCurrentImageIndicator() {
    if (currentMode !== 'scroll') return;
    
    const containerRect = mosaicContainer.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    
    let closestImg = null;
    let minDiff = Infinity;
    
    imageElements.forEach(img => {
      const rect = img.getBoundingClientRect();
      const imgCenter = rect.left + rect.width / 2;
      const diff = Math.abs(imgCenter - centerX);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestImg = img;
      }
    });
    
    if (closestImg) {
      const index = parseInt(closestImg.dataset.index);
      if (index !== currentScrollIndex) {
        currentScrollIndex = index;
        // Update hash without triggering hashchange event
        history.replaceState(null, null, `#scroll-${index}`);
        // Update body data attribute for CSS counter
        document.body.setAttribute('data-current-index', index);
      }
    }
  }

  // ===========================
  // URL Hash Management
  // ===========================

  function handleHashChange() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#scroll-')) {
      const index = parseInt(hash.replace('#scroll-', ''));
      if (!isNaN(index) && currentMode === 'mosaic') {
        switchToScrollMode(index);
      } else if (!isNaN(index) && currentMode === 'scroll') {
        scrollToImage(index);
      }
    } else if (hash === '' && currentMode === 'scroll') {
      switchToMosaicMode();
    }
  }

  // Exit scroll mode when clicking anywhere outside an image
  document.addEventListener('click', (e) => {
    if (currentMode !== 'scroll') return;
    if (e.target.closest('.mosaic-image')) return;
    switchToMosaicMode();
  });

  // ===========================
  // Initialize
  // ===========================

  await buildMosaicMode();
  
  // Handle initial hash
  handleHashChange();
  
  // Listen for hash changes
  window.addEventListener('hashchange', handleHashChange);
  
  // Update indicator on scroll in scroll mode
  if (currentMode === 'scroll') {
    mosaicContainer.addEventListener('scroll', updateCurrentImageIndicator);
  }
})();
