// welcome.js — Responsive landing page with positioned images

(async function () {
  const data = await fetch('data.json').then(r => r.json());
  const container = document.getElementById('grid-container');

  // Create welcome container with aspect ratio
  const welcomeContainer = document.createElement('div');
  welcomeContainer.classList.add('welcome-container');

  // Background image (welcome.webp as main bg)
  const bg = document.createElement('div');
  bg.classList.add('welcome-bg');
  bg.style.backgroundImage = `url('${data.welcome.background}')`;
  welcomeContainer.appendChild(bg);

  // Positioned images based on REFERENCE.webp layout
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
    img.alt = 'Welcome decoration';
    welcomeContainer.appendChild(img);
  });

  // Central "Welcome" text/image
  const welcomeText = document.createElement('div');
  welcomeText.classList.add('welcome-text');
  // You can use an image or text here
  // For now, using the welcome.webp as text
  const textImg = document.createElement('img');
  textImg.src = 'data/welcome/welcome.webp';
  textImg.alt = 'Welcome';
  welcomeText.appendChild(textImg);
  welcomeContainer.appendChild(welcomeText);

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
    welcomeContainer.appendChild(btn);
  }

  container.appendChild(welcomeContainer);
})();
