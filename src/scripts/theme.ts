type Pref = 'system' | 'light' | 'dark';
const order: Pref[] = ['system', 'light', 'dark'];

const read = (): Pref => {
  try {
    const v = localStorage.getItem('theme');
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};

export function initTheme() {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!btn) return;
  const label = btn.querySelector<HTMLElement>('[data-theme-label]')!;
  const root = document.documentElement;

  const apply = (p: Pref) => {
    if (p === 'system') root.removeAttribute('data-theme');
    else root.dataset.theme = p;
    btn.dataset.themeState = p;
    root.dataset.themeState = p;
    const name = btn.dataset['l' + p[0].toUpperCase() + p.slice(1)];
    label.textContent = `${btn.dataset.label}: ${name}`;
    btn.title = label.textContent!;
  };

  let pref = read();
  apply(pref);
  btn.addEventListener('click', () => {
    pref = order[(order.indexOf(pref) + 1) % order.length];
    try {
      pref === 'system' ? localStorage.removeItem('theme') : localStorage.setItem('theme', pref);
    } catch {}
    apply(pref);
  });
}
