/** Restrained scroll reveal: opacity + 12px translate, once. Content is visible without JS. */
export function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!els.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  els.forEach((el) => {
    // Anything already on screen at load stays put (no flash); only below-fold content reveals.
    if (el.getBoundingClientRect().top < innerHeight * 0.95) return;
    el.classList.add('will-reveal');
    io.observe(el);
  });
}
