// Generates favicon.ico, apple-touch-icon, per-locale OG images.
// Re-run after changing the name/statement in content: `node scripts/make-assets.mjs`
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import yaml from 'yaml';
import { chromium } from '@playwright/test';

const abs = (p) => path.resolve(p);
const site = yaml.parse(fs.readFileSync('src/content/site.yaml', 'utf8'));
const aboutFm = (l) => yaml.parse(/^---\n([\s\S]*?)\n---/.exec(fs.readFileSync(`src/content/about/${l}.md`, 'utf8'))[1]);
const font = (p) => 'data:font/woff2;base64,' + fs.readFileSync(abs(p)).toString('base64');

// --- icons ---
const iconSvg = (size) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><rect width="32" height="32" fill="#f4f4f1"/><circle cx="16" cy="16" r="6" fill="#c9301a"/></svg>`);
await sharp(iconSvg(180)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
const png32 = await sharp(iconSvg(32)).resize(32, 32).png().toBuffer();
// ICO container wrapping a single PNG image
const hdr = Buffer.alloc(22);
hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);
hdr.writeUInt8(32, 6); hdr.writeUInt8(32, 7); hdr.writeUInt16LE(1, 10); hdr.writeUInt16LE(32, 12);
hdr.writeUInt32LE(png32.length, 14); hdr.writeUInt32LE(22, 18);
fs.writeFileSync('public/favicon.ico', Buffer.concat([hdr, png32]));

const browser = await chromium.launch();
const serif = font('node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2');
const sans = font('node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2');

// --- OG images ---
for (const l of ['en', 'de', 'ko']) {
  const a = aboutFm(l);
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(`<style>
    @font-face{font-family:S;src:url(${serif})} @font-face{font-family:H;src:url(${sans});font-weight:100 900}
    *{box-sizing:border-box;margin:0} body{width:1200px;height:630px;background:#f4f4f1;color:#14130f;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between;font-family:H,'Apple SD Gothic Neo','Noto Sans KR',sans-serif}
    h1{font:400 118px/0.94 S,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;word-break:keep-all;letter-spacing:-0.025em;max-width:980px} .r{font:400 30px/1.35 H,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;word-break:keep-all;color:#5c5a53;max-width:760px;margin-top:28px}
    .f{display:flex;align-items:center;gap:16px;font:500 28px H}.dot{width:18px;height:18px;border-radius:50%;background:#c9301a}
  </style><div class="f"><i class="dot"></i>${site.name}</div><div><h1>${a.statement}</h1><p class="r">${a.statementRest ?? ''}</p></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/og/og-default-${l}.png` });
  await page.close();
}

await browser.close();
console.log('assets written');
