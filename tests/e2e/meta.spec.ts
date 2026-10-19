import { test, expect } from '@playwright/test';

for (const [path, lang] of [['/', 'en'], ['/de/', 'de'], ['/ko/', 'ko']] as const) {
  test(`meta tags ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="ko"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', new RegExp(`og-default-${lang}\\.png$`));
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(ld['@type']).toBe('Person');
  });

  test(`no horizontal overflow at 320px ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(path);
    const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(o).toBeLessThanOrEqual(0);
  });
}

test('static assets exist', async ({ request }) => {
  for (const p of ['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/og/og-default-en.png', '/og/og-default-de.png', '/og/og-default-ko.png', '/resume/resume-en.pdf', '/resume/resume-de.pdf', '/robots.txt', '/sitemap-index.xml']) {
    const r = await request.get(p);
    expect(r.status(), p).toBe(200);
  }
});

test('language switch keeps an open project (EN to DE)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#ito');
  await expect(page.locator('dialog[data-dialog]')).toBeVisible();
  await expect(page.locator('[data-lang-switch="de"]')).toHaveAttribute('href', /\/de\/#ito$/);
  await expect(page.locator('[data-lang-switch="ko"]')).toHaveAttribute('href', /\/ko\/#ito$/);
});

test('KO page states that it is a courtesy translation', async ({ page }) => {
  await page.goto('/ko/');
  await expect(page.locator('[data-translation-note]')).toContainText('번역본');
  await expect(page.locator('footer')).toContainText('번역본');
  await page.goto('/');
  await expect(page.locator('[data-translation-note]')).toHaveCount(0);
});

test('language dropdown lists all languages, opens and closes', async ({ page }) => {
  await page.goto('/ko/');
  const btn = page.locator('[data-lang-btn]');
  const list = page.locator('#lang-list');
  await expect(list).toBeHidden();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(list.locator('a')).toHaveText(['English', 'Deutsch', '한국어']);
  await expect(list.locator('a[aria-current="true"]')).toContainText('한국어');
  await page.keyboard.press('Escape');
  await expect(list).toBeHidden();
  await btn.click();
  await page.locator('h1').click();
  await expect(list).toBeHidden();
  await btn.click();
  await list.locator('a[hreflang="en"]').click();
  await expect(page).toHaveURL(/localhost:\d+\/$/);
});
