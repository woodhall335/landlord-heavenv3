import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

import {
  getSeoPageTaxonomy,
  isExplicitTaxonomyExemption,
  SEO_PRODUCT_ROUTES,
} from '../page-taxonomy';

describe('Section 13 product SEO taxonomy', () => {
  it('treats Section 13 products as first-class product routes', () => {
    expect(SEO_PRODUCT_ROUTES.section13Standard).toBe('/products/section-13-standard');
    expect(SEO_PRODUCT_ROUTES.section13Defence).toBe('/products/section-13-defence');

    expect(isExplicitTaxonomyExemption('/products/section-13-standard')).toBe(false);
    expect(isExplicitTaxonomyExemption('/products/section-13-defence')).toBe(false);

    expect(getSeoPageTaxonomy('/products/section-13-standard')).toMatchObject({
      pathname: '/products/section-13-standard',
      cluster: 'rent-increase',
      primaryProduct: '/products/section-13-standard',
      secondaryProduct: '/products/section-13-defence',
      canonicalTarget: '/products/section-13-standard',
    });

    expect(getSeoPageTaxonomy('/products/section-13-defence')).toMatchObject({
      pathname: '/products/section-13-defence',
      cluster: 'rent-increase',
      primaryProduct: '/products/section-13-defence',
      secondaryProduct: '/products/section-13-standard',
      canonicalTarget: '/products/section-13-defence',
    });
  });

  it('keeps the broad rent-increase route priced and Standard-first', () => {
    const source = readFileSync(path.join(process.cwd(), 'src/app/rent-increase/page.tsx'), 'utf8');
    const supportedIndex = source.indexOf('Supported Rent Increase Pack');
    const tribunalIndex = source.indexOf('Tribunal-Ready Rent Increase Pack');

    expect(source).toContain('Rent Increase Pack England | Form 4A from £24.99');
    expect(source).toContain('Start Supported pack — £24.99');
    expect(source).toContain('Compare Tribunal-Ready — £34.99');
    expect(supportedIndex).toBeGreaterThan(-1);
    expect(tribunalIndex).toBeGreaterThan(supportedIndex);
  });

  it('passes price into product views and emits add_to_cart from product wizard CTAs', () => {
    const standard = readFileSync(
      path.join(process.cwd(), 'src/app/products/section-13-standard/page.tsx'),
      'utf8',
    );
    const defence = readFileSync(
      path.join(process.cwd(), 'src/app/products/section-13-defence/page.tsx'),
      'utf8',
    );
    const trackedCta = readFileSync(
      path.join(process.cwd(), 'src/components/seo/CommercialSeoTrackedCta.tsx'),
      'utf8',
    );

    expect(standard).toContain('priceLabel: product.displayPrice');
    expect(defence).toContain('priceLabel: product.displayPrice');
    expect(trackedCta).toContain('trackAddToCart');
    expect(trackedCta).toContain("href.includes('/wizard')");
    expect(trackedCta).toContain("pageType === 'product_page'");
  });
});
