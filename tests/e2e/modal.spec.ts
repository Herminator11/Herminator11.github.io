import { test, expect, type Page } from '@playwright/test';

const dlg = (p: Page) => p.locator('dialog[data-dialog]');
const card = (p: Page, slug: string) => p.locator(`[data-card][data-slug="${slug}"] a`);
const openCard = async (p: Page, slug: string) => {
  await card(p, slug).scrollIntoViewIfNeeded();
  await card(p, slug).click();
  await expect(dlg(p)).toBeVisible();
  await expect(dlg(p)).toHaveAttribute('data-state', 'open');
};
const closed = (p: Page) => expect(dlg(p)).not.toHaveAttribute('open', /.*/);

test.describe('project modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('opens from a card: hash, heading focus, aria, scroll lock', async ({ page }) => {
    await page.goto('/');
    await openCard(page, 'duemmste-fliegt');
    await expect(page).toHaveURL(/#duemmste-fliegt$/);
    await expect(dlg(page)).toHaveAttribute('aria-labelledby', 'dialog-title');
    await expect(page.locator('#dialog-title')).toHaveText('Der Dümmste fliegt');
    await expect(page.locator('#dialog-title')).toBeFocused();
    await expect(page.locator('html')).toHaveClass(/dialog-open/);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
  });

  test('closes via X and returns focus to the card', async ({ page }) => {
    await page.goto('/');
    await openCard(page, 'duemmste-fliegt');
    await page.locator('[data-close]').click();
    await closed(page);
    await expect(page).not.toHaveURL(/#duemmste-fliegt/);
    await expect(card(page, 'duemmste-fliegt')).toBeFocused();
    await expect(page.locator('html')).not.toHaveClass(/dialog-open/);
  });

  test('closes via Escape', async ({ page }) => {
    await page.goto('/');
    await openCard(page, 'duemmste-fliegt');
    await page.keyboard.press('Escape');
    await closed(page);
    await expect(page).not.toHaveURL(/#duemmste-fliegt/);
  });

  test('closes via backdrop click', async ({ page }) => {
    await page.goto('/');
    await openCard(page, 'cinemasub');
    await page.waitForTimeout(600); // let the open transition finish
    await page.mouse.click(8, 450);
    await closed(page);
  });

  test('closes via browser Back, and Forward reopens', async ({ page }) => {
    await page.goto('/');
    await openCard(page, 'cinemasub');
    await page.goBack();
    await closed(page);
    await page.goForward();
    await expect(dlg(page)).toBeVisible();
    await expect(page.locator('#dialog-title')).toHaveText('CinemaSub');
  });

  test('focus never escapes to the page behind while tabbing', async ({ page }) => {
    await page.goto('/');
    await openCard(page, 'duemmste-fliegt');
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      // Focus never reaches the (inert) page behind; Safari may route Tab via browser chrome (body) and back.
      expect(await page.evaluate(() => !!document.activeElement && !document.activeElement.closest('dialog') && !!document.activeElement.closest('main, header, footer'))).toBe(false);
    }
  });

  test('gallery: arrow keys, buttons and thumbnails change the slide', async ({ page }) => {
    await page.goto('/');
    await openCard(page, 'duemmste-fliegt'); // 2 images
    const count = page.locator('[data-count]');
    await expect(count).toHaveText('1 of 2');
    await page.keyboard.press('ArrowRight');
    await expect(count).toHaveText('2 of 2');
    await page.locator('[data-thumb="0"]').click();
    await expect(count).toHaveText('1 of 2');
    await page.keyboard.press('ArrowLeft'); // clamps at the start
    await expect(count).toHaveText('1 of 2');
    await expect(page.locator('[data-thumb="0"]')).toHaveAttribute('aria-current', 'true');
  });

  test('project without media opens as a single reading column with its disclosures', async ({ page }) => {
    await page.goto('/');
    await openCard(page, 'cinemasub');
    await expect(page.locator('.detail--text')).toBeVisible();
    await expect(page.locator('[data-gallery]')).toHaveCount(0);
    await expect(page.locator('.detail__notes li')).toHaveCount(2);
    await expect(page.locator('.detail__notes')).toContainText('Next Player');
    await expect(page.locator('.detail__notes')).toContainText('Vibe-coded');
    await page.keyboard.press('ArrowRight'); // no gallery: must not throw
    await page.keyboard.press('Escape');
    await closed(page);
  });

  test('ito states it is based on a card game', async ({ page }) => {
    await page.goto('/#ito');
    await expect(page.locator('.detail__notes')).toContainText('card game ito');
    await page.goto('/de/#ito');
    await expect(page.locator('.detail__notes')).toContainText('Kartenspiel ito');
  });

  test('prev/next project switch in place and one close still closes', async ({ page }) => {
    await page.goto('/');
    await openCard(page, 'cinemasub');
    await page.locator('[data-switch][rel="next"]').click();
    await expect(page.locator('#dialog-title')).not.toHaveText('CinemaSub');
    const slug = (await page.url()).split('#')[1];
    expect(slug).toBeTruthy();
    await page.locator('[data-close]').click();
    await closed(page);
    await expect(page).not.toHaveURL(/#/);
  });

  test('deep link opens directly (EN and DE) and Escape cleans the URL', async ({ page }) => {
    await page.goto('/#duemmste-fliegt');
    await expect(dlg(page)).toBeVisible();
    await expect(page.locator('#dialog-title')).toHaveText('Der Dümmste fliegt');
    await page.keyboard.press('Escape');
    await closed(page);
    await expect(page).not.toHaveURL(/#/);

    await page.goto('/de/#mywatchlist');
    await expect(page.locator('#dialog-title')).toHaveText('MyWatchlist');
    await expect(page.locator('[data-close]')).toHaveAttribute('aria-label', 'Schließen');
  });

  test('unknown hash is ignored', async ({ page }) => {
    await page.goto('/#does-not-exist');
    await expect(dlg(page)).toBeHidden();
  });

  test('share button copies the link', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are chromium-only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await openCard(page, 'duemmste-fliegt');
    await page.locator('[data-share]').click();
    await expect(page.locator('[data-share]')).toHaveText('Link copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/#duemmste-fliegt$/);
  });

  test('mobile: full-screen sheet with reachable close button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await openCard(page, 'duemmste-fliegt');
    const box = await page.locator('.dialog__panel').boundingBox();
    expect(box!.width).toBeCloseTo(375, 0);
    expect(box!.height).toBeCloseTo(800, 0);
    await page.locator('[data-close]').click();
    await closed(page);
  });

  test('no console errors through open/close', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await openCard(page, 'duemmste-fliegt');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    await closed(page);
    expect(errors).toEqual([]);
  });
});
