import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['/', '/de/', '/ko/']) {
  test.describe(`shell ${path}`, () => {
    test('no console errors, one h1, skip link', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main');
      expect(errors).toEqual([]);
    });

    test('anchor navigation lands under the header and marks the active link', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
      await page.locator('[data-nav="resume"]').click();
      await page.waitForTimeout(400);
      const top = await page.locator('#resume').evaluate((el) => el.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThan(120);
      await expect(page.locator('[data-nav="resume"]')).toHaveAttribute('aria-current', 'true');
    });

    test('theme toggle cycles and persists', async ({ page }) => {
      await page.goto(path);
      const btn = page.locator('[data-theme-toggle]');
      await btn.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      await btn.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    for (const scheme of ['light', 'dark'] as const) {
      test(`axe ${scheme}`, async ({ browser }) => {
        const ctx = await browser.newContext({ colorScheme: scheme });
        const page = await ctx.newPage();
        await page.goto(path);
        await page.evaluate(() => document.querySelectorAll('.will-reveal').forEach((e) => e.classList.add('is-in')));
        await page.waitForTimeout(900);
        const res = await new AxeBuilder({ page }).analyze();
        expect(res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
        await ctx.close();
      });
    }
  });
}

test('language switch keeps the hash', async ({ page }) => {
  await page.goto('/#resume');
  await expect(page.locator('[data-lang-switch="de"]')).toHaveAttribute('href', /\/de\/#resume$/);
});
