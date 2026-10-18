/** Fades images in once decoded (blur-up placeholder sits behind). Handles cached + dynamically cloned images. */
export function initImages() {
  const mark = (img: HTMLImageElement) => img.classList.add('is-loaded');
  const scan = (root: ParentNode = document) =>
    root.querySelectorAll<HTMLImageElement>('.pic img').forEach((img) => {
      if (img.complete && img.naturalWidth) mark(img);
    });
  document.addEventListener('load', (e) => e.target instanceof HTMLImageElement && mark(e.target), true);
  scan();
  addEventListener('pageshow', () => scan());
  (window as unknown as { __scanImages: typeof scan }).__scanImages = scan;
}
