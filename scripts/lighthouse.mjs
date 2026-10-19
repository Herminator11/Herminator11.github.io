// Mobile Lighthouse, median of N runs per URL, against a running preview server.
// Usage: npx astro preview --port 4321 --ignore-lock &  then  npm run lighthouse -- [baseUrl] [runs]
import fs from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:4322';
const runs = Number(process.argv[3] ?? 3);
const paths = ['/', '/de/', '/ko/', '/#cinemasub'];
const cats = ['performance', 'accessibility', 'best-practices', 'seo'];
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
const rows = [];
fs.mkdirSync('lighthouse', { recursive: true });
for (const p of paths) {
  const results = [];
  for (let i = 0; i < runs; i++) {
    const r = await lighthouse(base + p, { port: chrome.port, output: 'json', onlyCategories: cats, logLevel: 'error' });
    results.push(r.lhr);
  }
  const score = (c) => Math.round(median(results.map((l) => l.categories[c].score * 100)));
  const m = (id) => median(results.map((l) => l.audits[id].numericValue));
  rows.push({ path: p, perf: score('performance'), a11y: score('accessibility'), bp: score('best-practices'), seo: score('seo'), LCP: Math.round(m('largest-contentful-paint')), CLS: +m('cumulative-layout-shift').toFixed(3), TBT: Math.round(m('total-blocking-time')) });
  fs.writeFileSync(`lighthouse/${p.replace(/[^\w]+/g, '_') || 'home'}.json`, JSON.stringify(results[Math.floor(runs / 2)], null, 1));
}
await chrome.kill();
console.table(rows);
const failing = rows.filter((r) => [r.perf, r.a11y, r.bp, r.seo].some((s) => s < 95));
if (failing.length) { console.log('Below 95:', failing.map((f) => f.path).join(', ')); process.exitCode = 1; }
