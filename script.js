// NERO research log - scroll-triggered motion

// Nav shadow after scrolling past the hero fold
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

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
