// transitions.js — Directional slide transitions between sections
// Reads the position class (pos-left, pos-right, pos-top, pos-bottom)
// and slides the page in the opposite direction before navigating

document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-btn');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('#')) return;

  e.preventDefault();

  // Determine slide direction based on link position
  // Link is on the left → page slides right (we go left)
  // Link is on the right → page slides left (we go right)
  // Link is on top → page slides down (we go up)
  // Link is on bottom → page slides up (we go down)
  let direction = 'left';
  if (link.classList.contains('pos-left')) direction = 'right';
  else if (link.classList.contains('pos-right')) direction = 'left';
  else if (link.classList.contains('pos-top')) direction = 'down';
  else if (link.classList.contains('pos-bottom')) direction = 'up';

  document.body.classList.add('navigating', `slide-${direction}`);

  let navigated = false;
  function goToHref() {
    if (navigated) return;
    navigated = true;
    window.location.href = href;
  }

  // animationend bubbles: ignore child animations (welcome fade-ins) and
  // body's own page-fade-in — only the slide-out animation ends navigation
  document.body.addEventListener('animationend', (ev) => {
    if (ev.target === document.body && ev.animationName.startsWith('slide-out')) goToHref();
  });
  setTimeout(goToHref, 600);
});
