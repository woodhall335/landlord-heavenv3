import { readFileSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { describe, expect, it } from 'vitest';

import sitemap from '@/app/sitemap';
import {
  RETIRED_ENGLAND_DOCUMENT_SKUS,
  RETIRED_PUBLIC_ROUTE_REDIRECTS,
  RETIRED_PUBLIC_ROUTES,
} from '@/lib/public-retirements';
import { PRODUCTS, SEO_LANDING_ROUTES } from '@/lib/pricing/products';
import { PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS } from '@/lib/residential-letting/products';

function applyPathRedirect(rawUrl: string, redirects: Array<{ source: string; destination: string }>) {
  const url = new URL(rawUrl, 'https://landlordheaven.co.uk');
  const match = redirects.find((redirect) => redirect.source === url.pathname);

  if (!match) {
    return null;
  }

  return `${match.destination}${url.search}`;
}

describe('retired public route decommission', () => {
  it('registers permanent redirects for every retired public route', async () => {
    const configModule = await import(
      pathToFileURL(path.join(process.cwd(), 'next.config.mjs')).href
    );
    const redirects = await configModule.default.redirects();

    Object.entries(RETIRED_PUBLIC_ROUTE_REDIRECTS).forEach(([source, destination]) => {
      expect(redirects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            source,
            destination,
            permanent: true,
          }),
        ])
      );
    });
  });

  it('preserves arbitrary query strings for retired free generator pathnames', async () => {
    const configModule = await import(
      pathToFileURL(path.join(process.cwd(), 'next.config.mjs')).href
    );
    const redirects = await configModule.default.redirects();

    expect(
      applyPathRedirect(
        '/tools/free-section-21-notice-generator?type=eviction&jurisdiction=england&product=notice_only&src=product_page&topic=eviction',
        redirects
      )
    ).toBe('/section-21-notice?type=eviction&jurisdiction=england&product=notice_only&src=product_page&topic=eviction');

    expect(
      applyPathRedirect(
        '/tools/free-section-8-notice-generator?type=eviction&jurisdiction=england&product=notice_only&src=product_page&topic=eviction',
        redirects
      )
    ).toBe('/eviction-notice-england?type=eviction&jurisdiction=england&product=notice_only&src=product_page&topic=eviction');
  });

  it('keeps retired public routes out of the sitemap output', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => new URL(entry.url).pathname);

    RETIRED_PUBLIC_ROUTES.forEach((retiredRoute) => {
      expect(urls).not.toContain(retiredRoute);
    });
  });

  it('removes retired England document skus from public registries', () => {
    RETIRED_ENGLAND_DOCUMENT_SKUS.forEach((sku) => {
      expect(PRODUCTS).not.toHaveProperty(sku);
      expect(PUBLIC_RESIDENTIAL_LETTING_PRODUCT_SKUS).not.toContain(sku);
      expect(Object.prototype.hasOwnProperty.call(SEO_LANDING_ROUTES, sku)).toBe(false);
    });
  });

  it('keeps the England documents bridge page on surviving destinations only', () => {
    const bridgePagePath = path.join(
      process.cwd(),
      'src',
      'app',
      'landlord-documents-england',
      'page.tsx'
    );
    const source = readFileSync(bridgePagePath, 'utf8');

    RETIRED_PUBLIC_ROUTES.forEach((retiredRoute) => {
      expect(source).not.toContain(retiredRoute);
    });

    expect(source).toContain('/tenancy-agreement');
    expect(source).toContain('/premium-tenancy-agreement');
    expect(source).toContain('/money-claim');
  });
});
