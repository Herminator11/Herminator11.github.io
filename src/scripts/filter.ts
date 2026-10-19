import { dur, ease } from './motion';

/** Category filter with FLIP reflow. Only transform and opacity are animated. */
export function initFilter() {
  const grid = document.querySelector<HTMLElement>('[data-grid]');
  const chips = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  if (!grid || !chips.length) return;
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-card]')];
  const countEl = document.querySelector<HTMLElement>('[data-count-visible]')!;
  const live = document.querySelector<HTMLElement>('[data-count-live]')!;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const matches = (c: HTMLElement, f: string) => f === 'all' || c.dataset.categories!.split(' ').includes(f);
  let current = 'all';
  let running: Animation[] = [];

  const setCount = (n: number) => {
    const text = (n === 1 ? countEl.dataset.one! : countEl.dataset.other!).replace('{n}', String(n));
    countEl.textContent = text;
    live.textContent = text;
  };

  const apply = async (f: string) => {
    if (f === current) return;
    current = f;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === f)));
    running.forEach((a) => a.cancel());
    running = [];
    const show = cards.filter((c) => matches(c, f));
    const hide = cards.filter((c) => !matches(c, f));
    setCount(show.length);
    const keep = show.filter((c) => !c.hidden);
    const entering = show.filter((c) => c.hidden);

    if (reduce()) {
      hide.forEach((c) => (c.hidden = true));
      show.forEach((c) => (c.hidden = false));
      return;
    }
    const first = new Map(keep.map((c) => [c, c.getBoundingClientRect()]));
    const leaving = hide.filter((c) => !c.hidden);
    // 1) fade leaving cards out
    // (tracked in `running` so a newer filter click cancels them instead of stranding cards at opacity 0)
    await Promise.all(leaving.map((c) => {
      const a = c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur('dur-1'), easing: ease(), fill: 'forwards' });
      running.push(a);
      return a.finished.catch(() => {});
    }));
    if (current !== f) return;
    leaving.forEach((c) => { c.hidden = true; c.getAnimations().forEach((a) => a.cancel()); });
    entering.forEach((c) => (c.hidden = false));
    // 2) FLIP the cards that stayed, fade the new ones in
    for (const c of keep) {
      const a = first.get(c)!;
      const b = c.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (dx || dy) running.push(c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: dur('dur-3'), easing: ease() }));
    }
    entering.forEach((c) => running.push(c.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: dur('dur-3'), delay: dur('dur-1'), easing: ease(), fill: 'backwards' })));
    (window as unknown as { __scanImages?: () => void }).__scanImages?.();
  };

  chips.forEach((c) => c.addEventListener('click', () => apply(c.dataset.filter!)));
}
