import { test } from '@playwright/test';

const widths = { mobile: 375, tablet: 768, desktop: 1440 } as const;
const pages = (process.env.SHOT_PAGES ?? '/').split(',');

for (const path of pages) {
  for (const [name, width] of Object.entries(widths)) {
    for (const scheme of ['light', 'dark'] as const) {
      test(`screenshot ${path} ${name} ${scheme}`, async ({ browser }) => {
        test.skip(test.info().project.name !== 'chromium', 'screenshots on chromium only');
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
        const page = await ctx.newPage();
        const errors: string[] = [];
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 200)); }
          scrollTo(0, 0);
        });
        await page.waitForTimeout(1000);
        const slug = path.replace(/[^\w]+/g, '_') || 'home';
        await page.screenshot({ path: `tests/screenshots/${slug}-${name}-${scheme}.png`, fullPage: true });
        await ctx.close();
        if (errors.length) throw new Error(errors.join('\n'));
      });
    }
  }
}
