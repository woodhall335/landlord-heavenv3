import { PRICING_PACKAGE_CARDS, PRICING_SCHEMA_ITEMS } from '@/lib/marketing/pricing-page';
import { PRODUCTS } from '@/lib/pricing/products';
import fs from 'node:fs';
import path from 'node:path';

describe('pricing page product mapping', () => {
  it('shows the full current 10-product catalogue', () => {
    expect(PRICING_PACKAGE_CARDS.map((card) => card.productSku)).toEqual([
      'notice_only',
      'complete_pack',
      'money_claim',
      'section13_standard',
      'section13_defensive',
      'england_standard_tenancy_agreement',
      'england_premium_tenancy_agreement',
      'england_student_tenancy_agreement',
      'england_hmo_shared_house_tenancy_agreement',
      'england_lodger_agreement',
    ]);
  });

  it('keeps a pricing-page image mapping for every visible pricing card', () => {
    const pricingPageSource = fs.readFileSync(
      path.join(process.cwd(), 'src/app/(marketing)/pricing/page.tsx'),
      'utf-8'
    );

    for (const card of PRICING_PACKAGE_CARDS) {
      expect(pricingPageSource).toContain(`${card.productSku}: {`);
    }
  });

  it('shows both Section 13 products in the visible pricing cards', () => {
    const standardCard = PRICING_PACKAGE_CARDS.find((card) => card.productSku === 'section13_standard');
    const defenceCard = PRICING_PACKAGE_CARDS.find((card) => card.productSku === 'section13_defensive');

    expect(standardCard).toBeDefined();
    expect(defenceCard).toBeDefined();

    expect(standardCard?.price).toBe(PRODUCTS.section13_standard.displayPrice);
    expect(defenceCard?.price).toBe(PRODUCTS.section13_defensive.displayPrice);
    expect(standardCard?.name).toBe('Standard Section 13 Rent Increase Notice');
    expect(defenceCard?.name).toBe('Challenge Ready Section 13 Defence Pack');
    expect(standardCard?.href).toBe('/products/section-13-standard');
    expect(defenceCard?.href).toBe('/products/section-13-defence');
  });

  it('keeps pricing cards in plain-English landlord wording', () => {
    expect(PRICING_PACKAGE_CARDS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productSku: 'notice_only',
          bestFor: expect.stringContaining('Section 8 notice and service file'),
          points: expect.arrayContaining([
            expect.stringContaining('Form 3A, N215'),
          ]),
        }),
        expect.objectContaining({
          productSku: 'money_claim',
          bestFor: expect.stringContaining('claim unpaid rent'),
        }),
        expect.objectContaining({
          productSku: 'section13_standard',
          bestFor: expect.stringContaining('Form 4A, current local comparables'),
        }),
        expect.objectContaining({
          productSku: 'england_hmo_shared_house_tenancy_agreement',
          price: PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice,
        }),
        expect.objectContaining({
          productSku: 'england_lodger_agreement',
          price: PRODUCTS.england_lodger_agreement.displayPrice,
        }),
      ])
    );
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
