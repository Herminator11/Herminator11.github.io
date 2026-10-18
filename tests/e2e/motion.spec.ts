import { test, expect } from '@playwright/test';

const LAYOUT = /^(width|height|top|left|right|bottom|margin.*|padding.*|inset.*|font-size|line-height|gap|flex.*|grid.*|border-width|box-shadow|filter|background-size)$/;

test('CSS animates no layout properties (transitions + keyframes)', async ({ page }) => {
  await page.goto('/');
  const bad = await page.evaluate((src) => {
    const re = new RegExp(src);
    const out: string[] = [];
    const walk = (rules: CSSRuleList) => {
      for (const r of Array.from(rules)) {
        if (r instanceof CSSStyleRule) {
          const tp = r.style.transitionProperty;
          if (tp && tp !== 'all') tp.split(',').map((x) => x.trim()).filter((x) => re.test(x)).forEach((x) => out.push(`${r.selectorText} transition ${x}`));
          if (tp === 'all') out.push(`${r.selectorText} transition all`);
        } else if (r instanceof CSSKeyframesRule) {
          for (const k of Array.from(r.cssRules) as CSSKeyframeRule[])
            for (const p of Array.from(k.style)) if (re.test(p)) out.push(`@keyframes ${r.name} ${p}`);
        } else if ('cssRules' in r) walk((r as CSSGroupingRule).cssRules);
      }
    };
    for (const sh of Array.from(document.styleSheets)) { try { walk(sh.cssRules); } catch {} }
    return out;
  }, LAYOUT.source);
  expect(bad).toEqual([]);
});

test.describe('View Transitions', () => {
  test.skip(({ browserName }) => browserName === 'firefox', 'no same-document VT in Firefox');
  const spy = () => {
    (window as any).__vt = 0;
    const d = document as any;
    const orig = d.startViewTransition?.bind(d);
    if (orig) d.startViewTransition = (cb: any) => { (window as any).__vt++; return orig(cb); };
  };

  test('card click and close use a view transition (when supported)', async ({ page }) => {
    await page.addInitScript(spy);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const supported = await page.evaluate(() => typeof (document as any).startViewTransition === 'function');
    test.skip(!supported, 'startViewTransition unsupported in this engine');
    const a = page.locator('[data-card][data-slug="duemmste-fliegt"] a');
    await a.scrollIntoViewIfNeeded();
    await a.click();
    await expect(page.locator('dialog[data-dialog]')).toBeVisible();
    expect(await page.evaluate(() => (window as any).__vt)).toBe(1);
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[data-dialog]')).toBeHidden();
    expect(await page.evaluate(() => (window as any).__vt)).toBe(2);
  });

  test('reduced motion: no view transition, no reveal offsets, instant close', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(spy);
    await page.goto('/');
    expect(await page.locator('.will-reveal').count()).toBe(0);
    const a = page.locator('[data-card][data-slug="duemmste-fliegt"] a');
    await a.scrollIntoViewIfNeeded();
    await a.click();
    await expect(page.locator('dialog[data-dialog]')).toBeVisible();
    expect(await page.evaluate(() => (window as any).__vt)).toBe(0);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[data-dialog]')).toBeHidden({ timeout: 250 });
    await ctx.close();
  });
});

test('scroll reveal: below-fold blocks start hidden and reveal once on scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const target = page.locator('#contact [data-reveal]').first();
  await expect(target).toHaveClass(/will-reveal/);
  expect(await target.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveClass(/is-in/);
  await expect.poll(() => target.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});
