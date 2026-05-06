import { describe, expect, it } from 'vitest';

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
});
