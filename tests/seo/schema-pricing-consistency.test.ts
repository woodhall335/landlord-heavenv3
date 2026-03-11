import { describe, it, expect } from 'vitest';
import { productSchema } from '@/lib/seo/structured-data';
import { PRODUCTS } from '@/lib/pricing/products';

describe('Schema pricing consistency', () => {
  it('Product offer prices and currency align with canonical pricing', () => {
    const targets = [
      PRODUCTS.notice_only,
      PRODUCTS.complete_pack,
      PRODUCTS.money_claim,
      PRODUCTS.ast_standard,
      PRODUCTS.ast_premium,
    ];

    for (const product of targets) {
      const schema = productSchema({
        name: product.label,
        description: product.description,
        price: product.price.toFixed(2),
        url: `https://landlordheaven.co.uk${product.productPageHref ?? product.wizardHref}`,
      });

      const offers = schema.offers as { price: string; priceCurrency: string };
      expect(parseFloat(offers.price)).toBe(product.price);
      expect(offers.priceCurrency).toBe('GBP');
    }
  });
});
