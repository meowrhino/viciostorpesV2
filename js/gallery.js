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

  // ===========================
  // Grid-based mosaic config
  // ===========================

  // Cell size in viewport units — each cell is 50dvw × 50dvh
  const CELL_DVW = 50;
  const CELL_DVH = 50;

  // Convert to pixels for positioning
  const vw = window.innerWidth / 100;
  const vh = window.innerHeight / 100;
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
    minSize: 200,
    maxSize: 400,
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

  // Build image list & shuffle
  const images = [];
  for (let i = 0; i < config.imageCount; i++) {
    images.push({ index: i, src: `${config.imagePath}${i}.webp` });
  }
  const shuffled = [...images].sort(() => Math.random() - 0.5);

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

  // ===========================
  // Mosaic Mode Functions
  // ===========================

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

        mosaic.appendChild(img);
        imageElements.push(img);

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
      pinStart();
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    pinStart();
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
    }, 600);
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
    mosaic.style.height = mosaicModeHeight;

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

    const containerRect = mosaicContainer.getBoundingClientRect();
    const imgRect = targetImg.getBoundingClientRect();

    const desiredTop = imgRect.top - containerRect.top + mosaicContainer.scrollTop - (containerRect.height - imgRect.height) / 2;
    const desiredLeft = imgRect.left - containerRect.left + mosaicContainer.scrollLeft - (containerRect.width - imgRect.width) / 2;

    const maxTop = mosaicContainer.scrollHeight - containerRect.height;
    const maxLeft = mosaicContainer.scrollWidth - containerRect.width;

    mosaicContainer.scrollTo({
      top: Math.max(0, Math.min(desiredTop, maxTop)),
      left: Math.max(0, Math.min(desiredLeft, maxLeft)),
      behavior: 'smooth',
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
        currentScrollIndex = index;
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
