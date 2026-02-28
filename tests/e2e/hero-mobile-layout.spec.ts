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

    const targets = ['/products/notice-only', '/products/complete-pack', '/products/money-claim', '/products/ast'];

    for (const route of targets) {
      test(`keeps mobile hero media floated with readable wrapped subtitle and right bleed on ${route}`, async ({ page }) => {
        await page.goto(route);

        const hero = page.locator('section[aria-label="Landlord Heaven legal document hero"]').first();
        const mediaWrapper = hero.locator('div.float-right.lg\\:hidden').first();
        const subtitle = hero.locator('p.leading-relaxed.text-white\\/85').first();

        await expect(hero).toBeVisible();
        await expect(mediaWrapper).toBeVisible();
        await expect(subtitle).toBeVisible();

        const viewportWidth = await page.evaluate(() => window.innerWidth);
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);

        const geometry = await page.evaluate(() => {
          const heroRoot = document.querySelector('section[aria-label="Landlord Heaven legal document hero"]');
          const heading = heroRoot?.querySelector('h1, h2');
          const media = heroRoot?.querySelector('div.float-right.lg\\:hidden');
          const subtitleEl = heroRoot?.querySelector('p.leading-relaxed.text-white\\/85');

          if (!heroRoot || !heading || !media || !subtitleEl) {
            throw new Error('Missing hero layout elements.');
          }

          const mediaRect = media.getBoundingClientRect();
          const subtitleRect = subtitleEl.getBoundingClientRect();
          const headingRect = heading.getBoundingClientRect();
          const subtitleStyle = window.getComputedStyle(subtitleEl);
          const mediaStyle = window.getComputedStyle(media);

          const overlapWidth = Math.max(0, Math.min(subtitleRect.right, mediaRect.right) - Math.max(subtitleRect.left, mediaRect.left));
          const overlapHeight = Math.max(0, Math.min(subtitleRect.bottom, mediaRect.bottom) - Math.max(subtitleRect.top, mediaRect.top));
          const overlapArea = overlapWidth * overlapHeight;
          const subtitleArea = Math.max(1, subtitleRect.width * subtitleRect.height);

          const subtitleZ = Number.parseInt(subtitleStyle.zIndex || '0', 10);
          const mediaZ = Number.parseInt(mediaStyle.zIndex || '0', 10);

          return {
            viewportWidth: window.innerWidth,
            mediaLeft: mediaRect.left,
            mediaRight: mediaRect.right,
            mediaTop: mediaRect.top,
            mediaBottom: mediaRect.bottom,
            subtitleLeft: subtitleRect.left,
            subtitleRight: subtitleRect.right,
            subtitleTop: subtitleRect.top,
            subtitleBottom: subtitleRect.bottom,
            headingBottom: headingRect.bottom,
            subtitleZ: Number.isNaN(subtitleZ) ? 0 : subtitleZ,
            mediaZ: Number.isNaN(mediaZ) ? 0 : mediaZ,
            overlapRatio: overlapArea / subtitleArea,
          };
        });

        expect(geometry.mediaRight).toBeGreaterThan(geometry.viewportWidth);

        const layeredAboveMedia = geometry.subtitleZ >= geometry.mediaZ;
        const subtitleStartsLeftOfMedia = geometry.subtitleLeft < geometry.mediaLeft;
        const subtitleCloseUnderHeadline = geometry.subtitleTop - geometry.headingBottom < 48;
        const subtitleNotMostlyObscured = geometry.overlapRatio < 0.75;

        expect(layeredAboveMedia || (subtitleStartsLeftOfMedia && subtitleCloseUnderHeadline && subtitleNotMostlyObscured)).toBeTruthy();
      });
    }
  });
}
