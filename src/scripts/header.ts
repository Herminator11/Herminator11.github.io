/** Scrolled state for the blur layer, active-section highlighting, language switch keeps the hash. */
export function initHeader() {
  const root = document.documentElement;
  let scrolled = false;
  const onScroll = () => {
    const s = window.scrollY > 8;
    if (s !== scrolled) root.classList.toggle('is-scrolled', (scrolled = s));
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const links = new Map<string, HTMLAnchorElement>();
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => links.set(a.dataset.nav!, a));
  const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')];
  const setActive = (id: string | null) =>
    links.forEach((a, k) => (k === id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));

  const visible = new Set<string>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id);
      // Active = last (lowest) section currently crossing the reading line.
      const active = sections.filter((s) => visible.has(s.id)).pop();
      setActive(active?.id ?? null);
    },
    { rootMargin: '-35% 0px -60% 0px' },
  );
  sections.forEach((s) => io.observe(s));

  const menu = document.querySelector<HTMLElement>('[data-lang-menu]');
  if (menu) {
    const btn = menu.querySelector<HTMLButtonElement>('[data-lang-btn]')!;
    const list = menu.querySelector<HTMLElement>('ul')!;
    const isOpen = () => menu.hasAttribute('data-lang-open');
    const set = (open: boolean) => {
      menu.toggleAttribute('data-lang-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => {
      set(!isOpen());
      if (isOpen()) list.querySelector<HTMLElement>('[aria-current]')?.focus();
    });
    document.addEventListener('click', (e) => !menu.contains(e.target as Node) && set(false));
    menu.addEventListener('focusout', (e) => !menu.contains(e.relatedTarget as Node | null) && set(false));
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        set(false);
        btn.focus();
      }
    });
  }

  const switches = document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]');
  if (switches.length) {
    const bases = [...switches].map((a) => a.getAttribute('href')!);
    const sync = () => switches.forEach((a, i) => (a.href = new URL(bases[i] + location.hash, location.href).href));
    sync();
    addEventListener('hashchange', sync);
    addEventListener('popstate', sync);
  }
}
