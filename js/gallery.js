// gallery.js — Dual-mode gallery (mosaic + scroll) for flashbook & tattoo
// Reads section config from data.json, uses numbered images (0.webp, 1.webp, ...)
// Grid-based mosaic with jitter + center-to-position animation
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

  let data;
  try {
    data = await fetch('data.json').then(r => r.json());
  } catch (err) {
    console.error('gallery.js: Failed to load data.json', err);
    return;
  }
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

  // Auto-detect how many sequentially-numbered images exist in the folder,
  // so users don't have to hand-update imageCount in data.json every time
  // they add/remove photos. Images are numbered starting at 1.webp. Uses
  // doubling + binary search: ~2·log₂(N) HEAD requests (≈16 for 200 images).
  async function detectImageCount(imagePath) {
    const exists = (n) =>
      fetch(`${imagePath}${n}.webp`, { method: 'HEAD', cache: 'no-cache' })
        .then(r => r.ok)
        .catch(() => false);

    if (!(await exists(1))) return 0;

    let lo = 1, hi = 2;
    while (await exists(hi)) {
      lo = hi;
      hi *= 2;
      if (hi > 10000) break; // sanity cap
    }
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (await exists(mid)) lo = mid;
      else hi = mid;
    }
    return lo; // highest existing index == total count (1-indexed)
  }

  const detected = await detectImageCount(config.imagePath);
  if (detected > 0) {
    config.imageCount = detected;
  } else {
    console.error(`gallery.js: No images found at ${config.imagePath}`);
    return;
  }

  // ===========================
  // Grid-based mosaic config
  // ===========================

  // Cell size in viewport units — each cell is 50dvw × 50dvh
  const CELL_DVW = 50;
  const CELL_DVH = 50;

  // Convert to pixels for positioning
  const vw = window.innerWidth / 100;
  const vh = window.innerHeight / 100;
  const vmin = Math.min(vw, vh);
  const cellW = CELL_DVW * vw;
  const cellH = CELL_DVH * vh;

  // Grid dimensions from image count
  const cols = Math.ceil(Math.sqrt(config.imageCount));
  const rows = Math.ceil(config.imageCount / cols);

  // Total mosaic dimensions in px
  const mosaicWidth = cols * cellW;
  const mosaicHeight = rows * cellH;

  const MOSAIC = {
    cols,
    rows,
    cellW,
    cellH,
    mosaicWidth,
    mosaicHeight,
    minSize: 40 * vmin,
    maxSize: 50 * vmin,
    padding: 6,
    batchSize: 8,
  };

  // ===========================
  // Pre-compute grid positions
  // ===========================

  // How many images are in the last row
  const lastRowCount = config.imageCount % cols || cols;
  const lastRowIndex = rows - 1;

  function getGridCell(index) {
    const row = Math.floor(index / cols);
    const col = index % cols;

    // Center incomplete last row
    let offsetX = 0;
    if (row === lastRowIndex && lastRowCount < cols) {
      offsetX = ((cols - lastRowCount) * cellW) / 2;
    }

    return {
      x: col * cellW + offsetX,
      y: row * cellH,
    };
  }

  // Build image list & shuffle — files are numbered 1.webp .. N.webp
  const images = [];
  for (let i = 1; i <= config.imageCount; i++) {
    images.push({ index: i, src: `${config.imagePath}${i}.webp` });
  }
  // Fisher-Yates shuffle
  const shuffled = [...images];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const mosaic = document.getElementById('mosaic');
  const mosaicContainer = document.querySelector('.mosaic-container');

  // Set mosaic dimensions upfront
  mosaic.style.width = mosaicWidth + 'px';
  mosaic.style.height = mosaicHeight + 'px';
  const mosaicModeHeight = mosaicHeight + 'px';

  // State
  let currentMode = 'mosaic';
  let imageElements = [];
  let currentScrollIndex = 0;
  let topZ = 1;
  let mouseActive = false;
  let mouseX = 0;
  let mouseY = 0;
  let mouseTimeout = null;
  let currentViewportHover = null;
  let hoverCooldown = false;

  // ===========================
  // Mosaic Mode Functions
  // ===========================

  // Insert a just-loaded image into the DOM and imageElements in the right
  // spot. In mosaic mode order is cosmetic (position is absolute) so we just
  // append. In scroll mode order IS the visual layout, so we splice the image
  // into index-sorted position to keep late-loading images from landing at the
  // end of the row.
  function registerImage(img) {
    const idx = parseInt(img.dataset.index);

    if (currentMode === 'scroll') {
      const nextSibling = [...mosaic.children].find(c => {
        const cIdx = parseInt(c.dataset.index);
        return !isNaN(cIdx) && cIdx > idx;
      });
      if (nextSibling) mosaic.insertBefore(img, nextSibling);
      else mosaic.appendChild(img);

      let insertAt = imageElements.findIndex(e => parseInt(e.dataset.index) > idx);
      if (insertAt === -1) imageElements.push(img);
      else imageElements.splice(insertAt, 0, img);
    } else {
      mosaic.appendChild(img);
      imageElements.push(img);
    }
  }

  async function loadImage(item, gridIndex) {
    // Random size within range
    let size = Math.random() * (MOSAIC.maxSize - MOSAIC.minSize) + MOSAIC.minSize;

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

        // Grid cell position
        const cell = getGridCell(gridIndex);

        // Center in cell + heavy jitter (can overflow into neighboring cells)
        const centerX = cell.x + (cellW - w) / 2;
        const centerY = cell.y + (cellH - h) / 2;
        const jitterX = (Math.random() - 0.5) * cellW * 0.8;
        const jitterY = (Math.random() - 0.5) * cellH * 0.8;

        // Clamp so images don't go outside the mosaic bounds
        const finalX = Math.max(0, Math.min(centerX + jitterX, mosaicWidth - w));
        const finalY = Math.max(0, Math.min(centerY + jitterY, mosaicHeight - h));

        // Set final position immediately
        img.style.left = finalX + 'px';
        img.style.top = finalY + 'px';
        img.style.width = w + 'px';
        img.style.height = h + 'px';

        // Store mosaic position data
        img.dataset.mosaicX = finalX;
        img.dataset.mosaicY = finalY;
        img.dataset.mosaicW = w;
        img.dataset.mosaicH = h;

        // Calculate translate offset: from viewport center to final position
        const containerRect = mosaicContainer.getBoundingClientRect();
        const vpCenterX = mosaicContainer.scrollLeft + containerRect.width / 2;
        const vpCenterY = mosaicContainer.scrollTop + containerRect.height / 2;
        const translateX = vpCenterX - finalX - w / 2;
        const translateY = vpCenterY - finalY - h / 2;

        // Initial state: at viewport center, small & transparent
        img.style.transition = 'none';
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.5)`;
        img.style.opacity = '0';

        registerImage(img);

        // Click handler
        img.addEventListener('click', () => {
          const clickedIndex = parseInt(img.dataset.index);
          if (currentMode === 'mosaic') {
            switchToScrollMode(clickedIndex);
          } else {
            scrollToImage(clickedIndex);
          }
        });


        // Animate: appear at center then fly to grid position
        requestAnimationFrame(() => {
          img.style.opacity = '0.8';
          requestAnimationFrame(() => {
            img.style.transition = '';
            img.style.transform = 'scale(1) translate(0, 0)';
            img.style.opacity = '1';
            img.classList.add('emerged');
          });
        });

        resolve();
      };

      img.onerror = () => {
        console.warn('Failed to load:', item.src);
        resolve();
      };
    });
  }

  async function loadBatch(batch, startIndex) {
    const promises = batch.map((item, i) => {
      return new Promise(resolve => {
        setTimeout(() => {
          loadImage(item, startIndex + i).then(resolve);
        }, i * 40);
      });
    });
    await Promise.all(promises);
  }

  // Flashbook starts at top-right, tattoo at top-left
  const startRight = section === 'flashbook';
  function pinStart() {
    if (startRight) {
      mosaicContainer.scrollTo({ left: mosaicContainer.scrollWidth, top: 0, behavior: 'instant' });
    } else {
      mosaicContainer.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    }
  }

  async function buildMosaicMode() {
    pinStart();

    for (let i = 0; i < shuffled.length; i += MOSAIC.batchSize) {
      const batch = shuffled.slice(i, i + MOSAIC.batchSize);
      await loadBatch(batch, i);
      await new Promise(resolve => setTimeout(resolve, 80));
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

    // Add scroll mode classes — but disable transitions first so we can position instantly
    mosaicContainer.style.transition = 'none';
    mosaic.style.transition = 'none';

    document.body.classList.add('scroll-mode');
    mosaicContainer.classList.add('scroll-mode');
    mosaic.classList.add('scroll-mode');
    mosaic.style.height = '100%';
    // Let the flex row size itself to its children — the mosaic-mode inline
    // width would otherwise clip the scrollable area to a fraction of the images.
    mosaic.style.width = 'max-content';

    // Reorder DOM elements
    imageElements.forEach(img => {
      mosaic.appendChild(img);
    });

    // Position scroll instantly on the target image before anything is visible
    const targetImg = imageElements.find(img => parseInt(img.dataset.index) === targetIndex);
    if (targetImg) {
      // Force layout so scroll-mode dimensions are computed
      mosaicContainer.offsetHeight;
      targetImg.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
      targetImg.classList.add('centered');
    }

    // Now re-enable transitions and fade in from opacity
    requestAnimationFrame(() => {
      mosaicContainer.style.transition = '';
      mosaic.style.transition = '';
    });

    // Enable scroll listener
    mosaicContainer.addEventListener('scroll', updateCurrentImageIndicator);
  }

  function switchToMosaicMode() {
    if (currentMode === 'mosaic') return;

    currentMode = 'mosaic';

    // Clean URL hash
    history.replaceState(null, null, window.location.pathname);

    // Remove body data attribute
    document.body.removeAttribute('data-current-index');

    // Disable scroll listener & clean up centered class
    mosaicContainer.removeEventListener('scroll', updateCurrentImageIndicator);
    imageElements.forEach(img => img.classList.remove('centered'));

    // Remove scroll mode classes — but disable transitions to position instantly first
    mosaicContainer.style.transition = 'none';
    mosaic.style.transition = 'none';

    document.body.classList.remove('scroll-mode');
    mosaicContainer.classList.remove('scroll-mode');
    mosaic.classList.remove('scroll-mode');
    mosaic.style.height = mosaicModeHeight;

    // Reset zoom to 1x
    if (zoomLevel !== 1) {
      zoomLevel = 1;
      for (const img of imageElements) {
        img.style.left = img.dataset.mosaicX + 'px';
        img.style.top = img.dataset.mosaicY + 'px';
        img.style.width = img.dataset.mosaicW + 'px';
        img.style.height = img.dataset.mosaicH + 'px';
      }
    }
    // Always restore mosaic-mode width — scroll mode set it to max-content.
    mosaic.style.width = mosaicWidth + 'px';

    // Center on the image we were viewing, instantly
    mosaicContainer.offsetHeight;
    centerMosaicOnImage(currentScrollIndex, true);

    // Re-enable transitions
    requestAnimationFrame(() => {
      mosaicContainer.style.transition = '';
      mosaic.style.transition = '';
    });
  }

  function scrollToImage(index) {
    const targetImg = imageElements.find(img => parseInt(img.dataset.index) === index);
    if (!targetImg) return;

    // scrollIntoView works correctly regardless of LTR/RTL direction
    targetImg.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  function centerMosaicOnImage(index, instant) {
    const targetImg = imageElements.find(img => parseInt(img.dataset.index) === index);
    if (!targetImg) return;

    const containerRect = mosaicContainer.getBoundingClientRect();
    const imgRect = targetImg.getBoundingClientRect();

    const desiredTop = imgRect.top - containerRect.top + mosaicContainer.scrollTop - (containerRect.height - imgRect.height) / 2;
    const desiredLeft = imgRect.left - containerRect.left + mosaicContainer.scrollLeft - (containerRect.width - imgRect.width) / 2;

    const maxTop = mosaicContainer.scrollHeight - containerRect.height;
    const maxLeft = mosaicContainer.scrollWidth - containerRect.width;

    mosaicContainer.scrollTo({
      top: Math.max(0, Math.min(desiredTop, maxTop)),
      left: Math.max(0, Math.min(desiredLeft, maxLeft)),
      behavior: instant ? 'instant' : 'smooth',
    });
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
        // Remove centered class from previous
        const prev = imageElements.find(img => parseInt(img.dataset.index) === currentScrollIndex);
        if (prev) prev.classList.remove('centered');

        currentScrollIndex = index;
        closestImg.classList.add('centered');
        history.replaceState(null, null, `#scroll-${index}`);
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

  // Exit scroll mode on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentMode === 'scroll') {
      switchToMosaicMode();
    }
  });

  // ===========================
  // Viewport hover system (mosaic mode)
  // Center of viewport acts as virtual cursor; real mouse takes priority
  // ===========================

  function getHoverPoint() {
    if (mouseActive) return { x: mouseX, y: mouseY };
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  function findBottomImageAt(px, py) {
    // Find all images under the point, return the one with lowest z-index (buried one)
    let best = null;
    let bestZ = Infinity;
    for (const img of imageElements) {
      const rect = img.getBoundingClientRect();
      if (px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom) {
        const z = parseInt(img.style.zIndex) || 0;
        if (z < bestZ) {
          bestZ = z;
          best = img;
        }
      }
    }
    return best;
  }

  function updateViewportHover() {
    if (currentMode !== 'mosaic') return;
    const { x, y } = getHoverPoint();
    const hit = findBottomImageAt(x, y);

    if (hit !== currentViewportHover && !hoverCooldown) {
      if (currentViewportHover) currentViewportHover.classList.remove('viewport-hover');
      if (hit) {
        hit.classList.add('viewport-hover');
        hit.style.zIndex = ++topZ;
        hoverCooldown = true;
        setTimeout(() => { hoverCooldown = false; }, 300);
      }
      currentViewportHover = hit;
    }
  }

  // Track real mouse — active while moving, falls back to viewport center when idle
  mosaicContainer.addEventListener('mouseleave', () => {
    mouseActive = false;
    clearTimeout(mouseTimeout);
    updateViewportHover();
  });
  mosaicContainer.addEventListener('mousemove', (e) => {
    mouseActive = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => {
      mouseActive = false;
      updateViewportHover();
    }, 200);
    updateViewportHover();
  });

  // Update on scroll (viewport center changes)
  mosaicContainer.addEventListener('scroll', () => {
    if (currentMode === 'mosaic') updateViewportHover();
  });

  // ===========================
  // Initialize
  // ===========================

  await buildMosaicMode();

  // Handle initial hash
  handleHashChange();

  // Listen for hash changes
  window.addEventListener('hashchange', handleHashChange);

  // (scroll listener for updateCurrentImageIndicator is added inside switchToScrollMode)

  // ===========================
  // Zoom system (mosaic mode only)
  // Ctrl+scroll on desktop, pinch on mobile
  // Resizes mosaic + repositions all images so scrollable area matches
  // ===========================

  let zoomLevel = 1;
  const ZOOM_MIN = 0.3;
  const ZOOM_MAX = 2;
  const ZOOM_STEP = 0.1;

  function applyZoom(newZoom, originX, originY) {
    const oldZoom = zoomLevel;
    zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
    if (zoomLevel === oldZoom) return;

    // Resize mosaic container to match zoom
    mosaic.style.width = (mosaicWidth * zoomLevel) + 'px';
    mosaic.style.height = (mosaicHeight * zoomLevel) + 'px';

    // Reposition and resize all images
    for (const img of imageElements) {
      const ox = parseFloat(img.dataset.mosaicX);
      const oy = parseFloat(img.dataset.mosaicY);
      const ow = parseFloat(img.dataset.mosaicW);
      const oh = parseFloat(img.dataset.mosaicH);

      img.style.left = (ox * zoomLevel) + 'px';
      img.style.top = (oy * zoomLevel) + 'px';
      img.style.width = (ow * zoomLevel) + 'px';
      img.style.height = (oh * zoomLevel) + 'px';
    }

    // Adjust scroll to keep the zoom centered on the pointer
    const ratio = zoomLevel / oldZoom;
    const scrollLeft = (mosaicContainer.scrollLeft + originX) * ratio - originX;
    const scrollTop = (mosaicContainer.scrollTop + originY) * ratio - originY;
    mosaicContainer.scrollTo({ left: scrollLeft, top: scrollTop, behavior: 'instant' });
  }

  // Ctrl + scroll wheel
  mosaicContainer.addEventListener('wheel', (e) => {
    if (currentMode !== 'mosaic') return;
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();

    const rect = mosaicContainer.getBoundingClientRect();
    const originX = e.clientX - rect.left;
    const originY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    applyZoom(zoomLevel + delta, originX, originY);
  }, { passive: false });

  // Pinch to zoom (touch)
  let lastPinchDist = 0;
  let pinching = false;

  mosaicContainer.addEventListener('touchstart', (e) => {
    if (currentMode !== 'mosaic') return;
    if (e.touches.length === 2) {
      pinching = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist = Math.hypot(dx, dy);
    }
  });

  mosaicContainer.addEventListener('touchmove', (e) => {
    if (!pinching || e.touches.length !== 2) return;
    e.preventDefault();

    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);

    const rect = mosaicContainer.getBoundingClientRect();
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

    const scale = dist / lastPinchDist;
    applyZoom(zoomLevel * scale, midX, midY);
    lastPinchDist = dist;
  }, { passive: false });

  mosaicContainer.addEventListener('touchend', () => {
    pinching = false;
  });
})();
