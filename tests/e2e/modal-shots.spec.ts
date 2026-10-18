import { test } from '@playwright/test';

const widths = { mobile: 375, tablet: 768, desktop: 1440 } as const;
for (const [name, width] of Object.entries(widths)) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`modal screenshot ${name} ${scheme}`, async ({ browser }) => {
      test.skip(test.info().project.name !== 'chromium', 'chromium only');
      const ctx = await browser.newContext({ viewport: { width, height: name === 'desktop' ? 900 : 812 }, colorScheme: scheme });
      const page = await ctx.newPage();
      await page.goto('/#duemmste-fliegt');
      await page.waitForTimeout(900);
      await page.screenshot({ path: `tests/screenshots/modal-${name}-${scheme}-open.png` });
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(700);
      await page.screenshot({ path: `tests/screenshots/modal-${name}-${scheme}-slide2.png` });
      await ctx.close();
    });
  }
}
