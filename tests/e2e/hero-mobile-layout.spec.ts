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

    const targets = ['/products/notice-only', '/products/money-claim'];

    for (const route of targets) {
      test(`keeps mobile hero media floated with readable wrapped subtitle and right bleed on ${route}`, async ({ page }) => {
        await page.goto(route);

        const hero = page.locator('section[aria-label="Landlord Heaven legal document hero"]').first();
        const mediaWrapper = hero.locator('div.float-right.lg\\:hidden').first();
        const subtitle = hero.locator('p.leading-relaxed.text-white\\/85').first();

        await expect(hero).toBeVisible();
        await expect(mediaWrapper).toBeVisible();
        await expect(subtitle).toBeVisible();

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth).toBe(innerWidth);

        const geometry = await page.evaluate(() => {
          const heroRoot = document.querySelector('section[aria-label="Landlord Heaven legal document hero"]');
          const media = heroRoot?.querySelector('div.float-right.lg\\:hidden');
          const subtitleEl = heroRoot?.querySelector('p.leading-relaxed.text-white\\/85');

          if (!media || !subtitleEl) {
            throw new Error('Missing hero layout elements.');
          }

          const mediaRect = media.getBoundingClientRect();
          const subtitleRect = subtitleEl.getBoundingClientRect();
          const computed = window.getComputedStyle(subtitleEl);

          return {
            viewportWidth: window.innerWidth,
            mediaLeft: mediaRect.left,
            mediaRight: mediaRect.right,
            subtitleLeft: subtitleRect.left,
            subtitleRight: subtitleRect.right,
            subtitleTop: subtitleRect.top,
            subtitleBottom: subtitleRect.bottom,
            mediaTop: mediaRect.top,
            mediaBottom: mediaRect.bottom,
            subtitleZ: computed.zIndex,
          };
        });

        expect(geometry.mediaRight).toBeGreaterThan(geometry.viewportWidth);

        const subtitleVerticallyOverlapsMedia =
          geometry.subtitleTop < geometry.mediaBottom && geometry.subtitleBottom > geometry.mediaTop;

        if (subtitleVerticallyOverlapsMedia) {
          expect(geometry.subtitleRight).toBeLessThanOrEqual(geometry.mediaLeft + 4);
        }

        expect(geometry.subtitleZ).toBe('10');
      });
    }
  });
}
