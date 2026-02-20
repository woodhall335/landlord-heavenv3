// @ts-expect-error -- @playwright/test is an optional dev dependency in this repo
const playwright = await import('@playwright/test').catch(() => null) as typeof import('@playwright/test') | null;

if (!playwright) {
  // @ts-expect-error -- fallback for environments without Playwright
  describe('hero mobile layout regression', () => {
    // @ts-expect-error -- fallback for environments without Playwright
    it.skip('requires @playwright/test', () => {});
  });
} else {
  const { test, expect, devices } = playwright;

  test.describe('hero mobile layout regression', () => {
    test.use({
      ...devices['iPhone 12'],
      viewport: { width: 390, height: 844 },
    });

    test('keeps mobile hero media floated, wrapped by subtitle text, and bleeding offscreen', async ({ page }) => {
      await page.goto('/products/notice-only');

      const hero = page.locator('section[aria-label="Landlord Heaven legal document hero"]').first();
      const mediaWrapper = hero.locator('div.float-right.lg\\:hidden').first();
      const subtitle = hero.locator('p.leading-relaxed.text-white\\/85').first();
      const cta = hero.locator('div.clear-both.mt-6').first();

      await expect(hero).toBeVisible();
      await expect(mediaWrapper).toBeVisible();
      await expect(subtitle).toBeVisible();
      await expect(cta).toBeVisible();

      const geometry = await page.evaluate(() => {
        const heroRoot = document.querySelector('section[aria-label="Landlord Heaven legal document hero"]');
        const media = heroRoot?.querySelector('div.float-right.lg\\:hidden');
        const subtitleEl = heroRoot?.querySelector('p.leading-relaxed.text-white\\/85');
        const ctaEl = heroRoot?.querySelector('div.clear-both.mt-6');

        if (!media || !subtitleEl || !ctaEl) {
          throw new Error('Missing hero layout elements.');
        }

        const mediaRect = media.getBoundingClientRect();
        const subtitleRect = subtitleEl.getBoundingClientRect();
        const ctaRect = ctaEl.getBoundingClientRect();

        return {
          viewportWidth: window.innerWidth,
          mediaLeft: mediaRect.left,
          mediaRight: mediaRect.right,
          mediaTop: mediaRect.top,
          mediaBottom: mediaRect.bottom,
          subtitleLeft: subtitleRect.left,
          subtitleTop: subtitleRect.top,
          subtitleBottom: subtitleRect.bottom,
          ctaTop: ctaRect.top,
        };
      });

      expect(geometry.mediaRight).toBeGreaterThan(geometry.viewportWidth);
      expect(geometry.subtitleLeft).toBeLessThan(geometry.mediaLeft);
      expect(geometry.subtitleTop).toBeLessThan(geometry.mediaBottom);
      expect(geometry.ctaTop).toBeGreaterThanOrEqual(Math.max(geometry.subtitleBottom, geometry.mediaBottom) - 1);
    });
  });
}
