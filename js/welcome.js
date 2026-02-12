// welcome.js — Landing page with positioned decorative images

(async function () {
  let data;
  try {
    data = await fetch('data.json').then(r => r.json());
  } catch (err) {
    console.error('welcome.js: Failed to load data.json', err);
    return;
  }
  const container = document.getElementById('grid-container');
  const welcomeBackground = data.welcome.background;

  // Mirror welcome background at body level to avoid dark flash on load
  document.body.style.backgroundImage = `url('${welcomeBackground}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundRepeat = 'no-repeat';

  // Build the single welcome cell with background (full screen)
  const cell = document.createElement('div');
  cell.classList.add('cell', 'cell-welcome', 'active');

  const bg = document.createElement('div');
  bg.classList.add('cell-bg');
  bg.style.backgroundImage = `url('${welcomeBackground}')`;
  cell.appendChild(bg);

  // Positioned decorative images (based on REFERENCE.webp layout)
  const images = [
    { src: 'data/welcome/0.webp', position: 'hang-left' },       // Creature, top-left hanging
    { src: 'data/welcome/1.webp', position: 'birds-overlay' },   // Birds/butterflies over welcome
    { src: 'data/welcome/2.webp', position: 'hang-center' },     // Floral ornament, top-center hanging
    { src: 'data/welcome/3.webp', position: 'floor-left' },      // Geometric horse + plant, bottom-left
    { src: 'data/welcome/4.webp', position: 'hang-right' },      // Two stacked paintings, top-right
    { src: 'data/welcome/5.webp', position: 'hang-left-center' },// Carousel horses, between 0 and 2
    { src: 'data/welcome/6.webp', position: 'floor-right' },     // Galloping horse, bottom-right
  ];

  images.forEach(item => {
    const img = document.createElement('img');
    img.classList.add('welcome-image', `pos-${item.position}`);
    img.src = item.src;
    img.alt = 'Decoration';
    cell.appendChild(img);
  });

  // Central "Welcome" text/image
  const welcomeText = document.createElement('img');
  welcomeText.classList.add('welcome-text');
  welcomeText.src = 'data/welcome/welcome.webp';
  welcomeText.alt = 'Welcome';
  cell.appendChild(welcomeText);

  // Navigation buttons using unified system
  const navItems = [
    { name: 'flashbook', href: 'flashbook.html', position: 'pos-left' },
    { name: 'tattoo', href: 'tattoo.html', position: 'pos-right' },
    { name: 'how to book', href: 'booking.html', position: 'pos-bottom' },
  ];

  for (const item of navItems) {
    const btn = document.createElement('a');
    btn.classList.add('nav-btn', item.position);
    btn.href = item.href;
    btn.textContent = item.name;
    cell.appendChild(btn);
  }

  container.appendChild(cell);
})();
