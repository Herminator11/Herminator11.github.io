// Capture screenshots (or a screen recording) of a running project into its media folder.
// npm run capture -- <url> --slug <slug> --name 01 [--viewport 1440x900] [--mobile] [--dark] [--full]
//                    [--wait 800] [--click "<selector>"] [--record 8]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { chromium, devices } from '@playwright/test';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const flag = (n) => args.includes(`--${n}`);
const fail = (m) => { console.error(`capture: ${m}`); process.exit(1); };

const slug = opt('slug');
if (!url || !slug) fail('usage: capture <url> --slug <slug> --name <file-name> [options]');
const media = path.join('src/content/projects', slug, 'media');
if (!fs.existsSync(media)) fail(`${media} does not exist (run new-project first)`);
const name = opt('name', 'shot');
const [w, h] = opt('viewport', '1440x900').split('x').map(Number);
const record = Number(opt('record', 0));

const browser = await chromium.launch();
const base = flag('mobile') ? devices['iPhone 14'] : { viewport: { width: w, height: h }, deviceScaleFactor: 2 };
const tmp = path.join(media, '.rec');
const ctx = await browser.newContext({
  ...base,
  colorScheme: flag('dark') ? 'dark' : 'light',
  ...(record ? { recordVideo: { dir: tmp, size: { width: w, height: h } } } : {}),
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(Number(opt('wait', 800)));
if (opt('click')) { await page.click(opt('click')); await page.waitForTimeout(600); }

if (record) {
  await page.waitForTimeout(record * 1000);
  await ctx.close();
  const f = fs.readdirSync(tmp).find((x) => x.endsWith('.webm'));
  const out = path.join(media, `${name}.raw.webm`);
  fs.renameSync(path.join(tmp, f), out);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`Recorded ${out}\nNext: node scripts/optimize-video.mjs ${out} --slug ${slug} --name ${name}`);
} else {
  const buf = await page.screenshot({ fullPage: flag('full') });
  await ctx.close();
  const out = path.join(media, `${name}.png`);
  const img = sharp(buf);
  const meta = await img.metadata();
  await (meta.width > 2400 ? img.resize({ width: 2400 }) : img).png({ compressionLevel: 9 }).toFile(out);
  console.log(`Saved ${out} (${Math.min(meta.width, 2400)}px wide)`);
}
await browser.close();
