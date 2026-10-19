import { dur } from './motion';

/** Scroll-snap gallery: arrows, thumbnails, arrow keys, counter, pauses off-screen video. Returns a destroy fn. */
export function initGallery(scope: HTMLElement, dialog: HTMLElement) {
  const root = scope.querySelector<HTMLElement>('[data-gallery]');
  const track = root?.querySelector<HTMLElement>('[data-track]');
  if (!root || !track) return () => {};
  const slides = [...track.querySelectorAll<HTMLElement>('[data-slide]')];
  const prev = root.querySelector<HTMLButtonElement>('[data-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-next]');
  const strip = root.querySelector<HTMLElement>('[data-thumbs]');
  const thumbs = [...root.querySelectorAll<HTMLButtonElement>('[data-thumb]')];
  const count = root.querySelector<HTMLElement>('[data-count]');
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let raf = 0;
  let settleTimer = 0;

  const clamp = (i: number) => Math.max(0, Math.min(slides.length - 1, i));
  const goTo = (i: number, smooth = true) =>
    track.scrollTo({ left: clamp(i) * track.clientWidth, behavior: smooth && !reduce() ? 'smooth' : 'auto' });

  const render = () => {
    if (count) count.textContent = `${index + 1} ${count.dataset.of} ${slides.length}`;
    prev?.setAttribute('aria-disabled', String(index === 0));
    next?.setAttribute('aria-disabled', String(index === slides.length - 1));
    thumbs.forEach((t, i) => (i === index ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current')));
  };

  // Runs once the index stops changing, so a multi-slide smooth scroll moves the strip a single time.
  const settle = () => {
    const t = thumbs[index];
    if (strip && t) strip.scrollTo({ left: t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2, behavior: reduce() ? 'auto' : 'smooth' });
    slides.forEach((s, i) => i !== index && s.querySelectorAll('video').forEach((v) => v.pause()));
  };

  const onScroll = () => {
    raf ||= requestAnimationFrame(() => {
      raf = 0;
      const i = clamp(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
      if (i !== index) {
        index = i;
        render();
        clearTimeout(settleTimer);
        settleTimer = window.setTimeout(settle, dur('dur-1'));
      }
    });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const el = e.target as HTMLElement;
    if (el.closest('video, input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
  };
  const onResize = () => goTo(index, false);

  prev?.addEventListener('click', () => goTo(index - 1));
  next?.addEventListener('click', () => goTo(index + 1));
  thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
  track.addEventListener('scroll', onScroll, { passive: true });
  dialog.addEventListener('keydown', onKey);
  const ro = new ResizeObserver(onResize);
  ro.observe(track);
  render();
  settle();

  // Slides sit side by side in a scroller, so native lazy loading waits until they are scrolled into view and
  // shows blank frames on slower connections. Load the rest right away, the first slide's image going first.
  const preload = () => slides.forEach((s) => s.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => (img.loading = 'eager')));
  const first = slides[0]?.querySelector<HTMLImageElement>('img');
  if (!first || first.complete) preload();
  else (['load', 'error'] as const).forEach((ev) => first.addEventListener(ev, preload, { once: true }));

  return () => {
    clearTimeout(settleTimer);
    dialog.removeEventListener('keydown', onKey);
    ro.disconnect();
    cancelAnimationFrame(raf);
    track.querySelectorAll('video').forEach((v) => v.pause());
  };
}

export const galleryIndex = (scope: ParentNode) => {
  const track = scope.querySelector<HTMLElement>('[data-track]');
  return track ? Math.round(track.scrollLeft / Math.max(1, track.clientWidth)) : 0;
};
