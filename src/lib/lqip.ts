import sharp from 'sharp';
import type { ImageMetadata } from 'astro';

const cache = new Map<string, Promise<string>>();

/** ~300-byte pre-blurred WebP as a data URI: the blur-up placeholder painted behind the real image. */
export function lqip(img: ImageMetadata): Promise<string> {
  const path = (img as ImageMetadata & { fsPath?: string }).fsPath;
  if (!path) return Promise.resolve('');
  let hit = cache.get(path);
  if (!hit) {
    hit = sharp(path)
      .resize(20, 20, { fit: 'inside' })
      .blur(1.2)
      .webp({ quality: 40 })
      .toBuffer()
      .then((b) => `data:image/webp;base64,${b.toString('base64')}`)
      .catch(() => '');
    cache.set(path, hit);
  }
  return hit;
}
