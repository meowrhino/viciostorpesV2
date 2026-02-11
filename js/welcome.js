// welcome.js — Landing page with direct navigation buttons

(async function () {
  const data = await fetch('data.json').then(r => r.json());

  const container = document.getElementById('grid-container');

  // Build the single welcome cell with background
  const cell = document.createElement('div');
  cell.classList.add('cell', 'cell-welcome', 'active');

  const bg = document.createElement('div');
  bg.classList.add('cell-bg');
  bg.style.backgroundImage = `url('${data.welcome.background}')`;
  cell.appendChild(bg);

  // Navigation buttons that go directly to pages
  const navItems = [
    { name: 'flashbook', href: 'flashbook.html', cls: 'nav-btn-left' },
    { name: 'tattoo', href: 'tattoo.html', cls: 'nav-btn-right' },
    { name: 'how to book', href: 'booking.html', cls: 'nav-btn-down' },
  ];

  for (const item of navItems) {
    const btn = document.createElement('a');
    btn.classList.add('nav-btn', item.cls);
    btn.href = item.href;
    btn.textContent = item.name;
    cell.appendChild(btn);
  }

  container.appendChild(cell);
})();
