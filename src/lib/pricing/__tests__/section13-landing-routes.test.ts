import { PRODUCTS, SEO_LANDING_ROUTES, getProductLandingHref } from '@/lib/pricing/products';

describe('Section 13 landing routes', () => {
  it('maps Section 13 products to public landing pages', () => {
    expect(SEO_LANDING_ROUTES.section13_standard).toBe('/products/section-13-standard');
    expect(SEO_LANDING_ROUTES.section13_defensive).toBe('/products/section-13-defence');

    expect(PRODUCTS.section13_standard.productPageHref).toBe('/products/section-13-standard');
    expect(PRODUCTS.section13_defensive.productPageHref).toBe('/products/section-13-defence');
  });

  it('builds Section 13 landing hrefs from the canonical route helper', () => {
    expect(getProductLandingHref('section13_standard')).toBe('/products/section-13-standard');
    expect(getProductLandingHref('section13_defensive', { src: 'pricing' })).toBe(
      '/products/section-13-defence?src=pricing'
    );
  });
});
