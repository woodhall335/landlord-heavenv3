import { PRICING_PACKAGE_CARDS, PRICING_SCHEMA_ITEMS } from '@/lib/marketing/pricing-page';
import { PRODUCTS } from '@/lib/pricing/products';

describe('pricing page product mapping', () => {
  it('shows both Section 13 products in the visible pricing cards', () => {
    const standardCard = PRICING_PACKAGE_CARDS.find((card) => card.productSku === 'section13_standard');
    const defenceCard = PRICING_PACKAGE_CARDS.find((card) => card.productSku === 'section13_defensive');

    expect(standardCard).toBeDefined();
    expect(defenceCard).toBeDefined();

    expect(standardCard?.price).toBe(PRODUCTS.section13_standard.displayPrice);
    expect(defenceCard?.price).toBe(PRODUCTS.section13_defensive.displayPrice);
    expect(standardCard?.href).toBe('/products/section-13-standard');
    expect(defenceCard?.href).toBe('/products/section-13-defence');
  });

  it('includes both Section 13 products in pricing structured data', () => {
    expect(PRICING_SCHEMA_ITEMS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sku: 'section13_standard',
          url: '/products/section-13-standard',
        }),
        expect.objectContaining({
          sku: 'section13_defensive',
          url: '/products/section-13-defence',
        }),
      ])
    );
  });
});
