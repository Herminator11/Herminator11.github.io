import { test, expect } from '@playwright/test';

test.describe('projects grid', () => {
  test('filter chips filter, count and aria-pressed update', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('[data-card]:not([hidden])');
    await expect(cards).toHaveCount(6);
    await expect(page.locator('[data-filter="all"]')).toHaveAttribute('aria-pressed', 'true');

    await page.locator('[data-filter="android"]').click();
    await expect(cards).toHaveCount(3); // cinemasub, mywatchlist, ito
    await expect(page.locator('[data-filter="android"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-filter="all"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-count-live]')).toHaveText('3 projects');

    await page.locator('[data-filter="games"]').click();
    await expect(cards).toHaveCount(2); // duemmste-fliegt + ito
    await expect(page.locator('[data-count-live]')).toHaveText('2 projects');
    await page.locator('[data-filter="all"]').click();
    await expect(cards).toHaveCount(6);
  });

  test('German labels', async ({ page }) => {
    await page.goto('/de/');
    await expect(page.locator('[data-filter="all"]')).toHaveText('Alle');
    await page.locator('[data-filter="games"]').click();
    await expect(page.locator('[data-count-live]')).toHaveText('2 Projekte');
  });

  test('AI disclosure tag is shown on every vibe-coded card', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.card__ai')).toHaveCount(5);
    await page.goto('/de/');
    await expect(page.locator('.card__ai').first()).toHaveText('Vibe-coded');
  });

  test('cards expose real links with hash targets', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-card] a').first()).toHaveAttribute('href', /^#[a-z0-9-]+$/);
  });

  test('cumulative layout shift stays ~0 while scrolling the whole page', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/');
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    });
    await page.waitForTimeout(600);
    const cls = await page.evaluate(() => (window as any).__cls);
    expect(cls).toBeLessThan(0.02);
  });
});
