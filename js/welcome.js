// welcome.js — Landing page with positioned decorative images

(async function () {
  const data = await fetch('data.json').then(r => r.json());
  const container = document.getElementById('grid-container');

  // Build the single welcome cell with background (full screen)
  const cell = document.createElement('div');
  cell.classList.add('cell', 'cell-welcome', 'active');

  const bg = document.createElement('div');
  bg.classList.add('cell-bg');
  bg.style.backgroundImage = `url('${data.welcome.background}')`;
  cell.appendChild(bg);

  // Positioned decorative images (based on REFERENCE.webp layout)
  const images = [
    { src: 'data/welcome/0.webp', position: 'top-left' },
    { src: 'data/welcome/1.webp', position: 'top-center' },
    { src: 'data/welcome/2.webp', position: 'top-right-1' },
    { src: 'data/welcome/3.webp', position: 'top-right-2' },
    { src: 'data/welcome/4.webp', position: 'bottom-left' },
    { src: 'data/welcome/5.webp', position: 'bottom-center' },
    { src: 'data/welcome/6.webp', position: 'bottom-right' },
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
