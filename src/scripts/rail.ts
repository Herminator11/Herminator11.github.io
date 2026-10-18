/** Positions the dot on the left rail from scroll progress; ticks mark the real section offsets. */
export function initRail() {
  const rail = document.querySelector<HTMLElement>('[data-rail]');
  const dot = document.querySelector<HTMLElement>('[data-rail-dot]');
  if (!rail || !dot || getComputedStyle(rail).display === 'none') return;
  const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')];
  let ticks: HTMLElement[] = [];
  let railH = 0;
  let max = 1;
  let raf = 0;

  const layout = () => {
    railH = rail.clientHeight - 7;
    max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    ticks.forEach((t) => t.remove());
    ticks = sections.map((s) => {
      const t = document.createElement('i');
      t.className = 'rail__tick';
      const y = Math.min(1, Math.max(0, (s.getBoundingClientRect().top + scrollY - 64) / max));
      t.style.transform = `translateY(${y * railH + 3}px)`;
      t.style.top = '0';
      rail.appendChild(t);
      return t;
    });
    update();
  };
  const update = () => {
    raf = 0;
    const p = Math.min(1, Math.max(0, scrollY / max));
    dot.style.transform = `translateY(${p * railH}px)`;
  };
  addEventListener('scroll', () => (raf ||= requestAnimationFrame(update)), { passive: true });
  addEventListener('resize', layout);
  new ResizeObserver(layout).observe(document.body);
  layout();
}
