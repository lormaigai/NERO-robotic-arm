// NERO research log - scroll-triggered motion, menu, to-do

// Topbar shadow after scrolling past the fold
const topbar = document.querySelector('.topbar');
if (topbar) {
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Hamburger menu
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
const setMenu = (open) => {
  document.body.classList.toggle('nav-open', open);
  if (burger) burger.setAttribute('aria-expanded', String(open));
  if (menu) menu.setAttribute('aria-hidden', String(!open));
};
if (burger) burger.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
document.querySelectorAll('.menu-links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Reveal-on-scroll
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);
document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

// Count-up stats in the blue band
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.6 }
);
document.querySelectorAll('.count').forEach((el) => countObserver.observe(el));

// Open the date entry when an in-page link targets something inside it
for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    const entry = target.closest('details');
    if (entry) entry.open = true;
  });
}
