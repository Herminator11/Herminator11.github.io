import { initGallery, galleryIndex } from './gallery';

const VT_NAME = 'project-cover';
type Doc = Document & { startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> } };

export function initModal() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-dialog]');
  if (!dialog) return;
  const panel = dialog.querySelector<HTMLElement>('[data-panel]')!;
  const mount = dialog.querySelector<HTMLElement>('[data-mount]')!;
  const root = document.documentElement;
  const slugs = new Set([...document.querySelectorAll('template[id^="project-"]')].map((t) => t.id.slice(8)));
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canVT = () => typeof (document as Doc).startViewTransition === 'function' && !reduce();

  let current: string | null = null;
  let origin: HTMLElement | null = null; // the card link that opened the dialog
  let openedByNav = false; // we arrived via a hash navigation (a history entry exists to go back to)
  let closing = false;
  let destroyGallery: () => void = () => {};

  const tag = (el: Element | null | undefined, on: boolean) =>
    el instanceof HTMLElement && (on ? el.style.setProperty('view-transition-name', VT_NAME) : el.style.removeProperty('view-transition-name'));
  const cardFor = (slug: string) => document.querySelector<HTMLElement>(`[data-card][data-slug="${slug}"]`);
  const coverOf = (slug: string) => {
    const card = cardFor(slug);
    const pic = card && !card.hidden ? card.querySelector<HTMLElement>('.card__media .pic') : null;
    if (!pic) return null;
    const r = pic.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth ? pic : null;
  };
  const slugFromHash = () => {
    const s = decodeURIComponent(location.hash.slice(1));
    return slugs.has(s) ? s : null;
  };
  const focusHeading = () => mount.querySelector<HTMLElement>('#dialog-title')?.focus({ preventScroll: true });

  const fill = (slug: string) => {
    const tpl = document.getElementById(`project-${slug}`) as HTMLTemplateElement;
    destroyGallery();
    mount.replaceChildren(tpl.content.cloneNode(true));
    current = slug;
    panel.scrollTop = 0;
    mount.querySelector('.detail__text')?.scrollTo(0, 0);
    destroyGallery = initGallery(mount, dialog);
    (window as unknown as { __scanImages?: () => void }).__scanImages?.();
  };

  const open = (slug: string, fromNav: boolean) => {
    if (closing) return;
    if (dialog.open) {
      if (slug !== current) { fill(slug); focusHeading(); }
      return;
    }
    openedByNav = fromNav;
    const src = fromNav ? coverOf(slug) : null;
    const show = () => {
      fill(slug);
      root.classList.add('dialog-open');
      dialog.showModal();
      dialog.dataset.state = 'open';
    };
    if (canVT() && src) {
      dialog.dataset.vt = '';
      tag(src, true);
      const t = (document as Doc).startViewTransition!(() => {
        tag(src, false);
        show();
        tag(mount.querySelector('.slide .pic'), true);
        focusHeading();
      });
      t.finished.finally(() => { tag(mount.querySelector('.slide .pic'), false); tag(src, false); delete dialog.dataset.vt; });
    } else {
      fill(slug);
      root.classList.add('dialog-open');
      dialog.showModal();
      void dialog.offsetWidth; // commit the closed state so the open transition runs
      dialog.dataset.state = 'open';
      focusHeading();
    }
  };

  const restoreFocus = () => {
    const target = origin && document.contains(origin) && !origin.closest('[hidden]') ? origin : document.getElementById('projects-title');
    if (target) {
      if (!target.matches('a, button')) target.setAttribute('tabindex', '-1');
      (target as HTMLElement).focus({ preventScroll: true });
    }
  };

  const closeUI = () => {
    if (!dialog.open || closing) return;
    closing = true;
    const slug = current;
    const finish = () => {
      dialog.close();
      dialog.dataset.state = '';
      root.classList.remove('dialog-open');
      destroyGallery();
      mount.replaceChildren();
      current = null;
      closing = false;
      restoreFocus();
    };
    const src = slug ? coverOf(slug) : null;
    const slidePic = mount.querySelector('.slide .pic');
    if (canVT() && src && slidePic && galleryIndex(mount) === 0) {
      dialog.dataset.vt = '';
      tag(slidePic, true);
      const t = (document as Doc).startViewTransition!(() => { tag(slidePic, false); finish(); tag(src, true); });
      t.finished.finally(() => { tag(src, false); delete dialog.dataset.vt; });
    } else if (reduce()) {
      finish();
    } else {
      dialog.dataset.state = '';
      setTimeout(finish, 280);
    }
  };

  const requestClose = () => {
    if (closing || !dialog.open) return;
    if (openedByNav) {
      history.back(); // hashchange -> sync() -> closeUI()
      setTimeout(() => dialog.open && !closing && slugFromHash() === null && closeUI(), 400);
    } else {
      history.replaceState(null, '', location.pathname + location.search);
      closeUI();
    }
  };

  const sync = (initial: boolean) => {
    const slug = slugFromHash();
    if (slug) {
      if (initial) document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
      open(slug, !initial);
    } else if (dialog.open) closeUI();
  };

  // Remember which card opened the dialog (for the shared-element transition and focus return).
  document.querySelector('[data-grid]')?.addEventListener('click', (e) => {
    origin = (e.target as HTMLElement).closest<HTMLElement>('[data-project]');
  });
  // Explicit focus trap: browsers otherwise let Tab leave a modal dialog for their own chrome.
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), video[controls], iframe, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => el.getClientRects().length > 0,
    );
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialog || active?.id === 'dialog-title')) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); requestClose(); });
  let downOnBackdrop = false;
  dialog.addEventListener('pointerdown', (e) => (downOnBackdrop = e.target === dialog));
  dialog.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === dialog && downOnBackdrop) return requestClose();
    if (t.closest('[data-close]')) return requestClose();

    const sw = t.closest<HTMLAnchorElement>('[data-switch]');
    if (sw) {
      e.preventDefault();
      const slug = sw.dataset.switch!;
      history.replaceState(null, '', `#${slug}`);
      fill(slug);
      focusHeading();
      if (!reduce()) mount.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
      return;
    }
    const share = t.closest<HTMLButtonElement>('[data-share]');
    if (share) void shareLink(share);
  });
  const shareLink = async (btn: HTMLButtonElement) => {
    const status = mount.querySelector<HTMLElement>('[data-share-status]');
    const title = mount.querySelector('#dialog-title')?.textContent ?? document.title;
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) await navigator.share({ title, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        const label = btn.textContent;
        btn.textContent = btn.dataset.copied!;
        if (status) status.textContent = btn.dataset.copied!;
        setTimeout(() => (btn.textContent = label), 2000);
      }
    } catch { /* user cancelled or clipboard unavailable */ }
  };

  addEventListener('hashchange', () => sync(false));
  sync(true);
}
