import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  DIGITAL_PRODUCT_RETURN_POLICY_ID,
  DIGITAL_PRODUCT_SHIPPING_SERVICE_ID,
  organizationSchema,
  pricingItemListSchema,
  productSchema,
} from '@/lib/seo/structured-data';

describe('Merchant listing structured data', () => {
  it('organizationSchema exposes stable merchant-wide return and shipping policies', () => {
    const schema = organizationSchema() as {
      hasMerchantReturnPolicy?: Record<string, unknown>;
      hasShippingService?: Record<string, unknown>;
    };

    expect(schema.hasMerchantReturnPolicy).toMatchObject({
      '@id': DIGITAL_PRODUCT_RETURN_POLICY_ID,
      url: 'https://landlordheaven.co.uk/refunds',
      applicableCountry: 'GB',
      returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    });

    expect(schema.hasShippingService).toMatchObject({
      '@id': DIGITAL_PRODUCT_SHIPPING_SERVICE_ID,
      name: 'Digital delivery',
    });
  });

  it('pricingItemListSchema emits image, brand, sku, shippingDetails, and return policy refs', () => {
    const schema = pricingItemListSchema([
      { sku: 'notice_only', url: '/products/notice-only' },
      { sku: 'england_lodger_agreement', url: '/lodger-agreement' },
    ]) as {
      itemListElement: Array<{ item: Record<string, any> }>;
    };

    const noticeItem = schema.itemListElement[0].item;
    expect(noticeItem.sku).toBe('notice_only');
    expect(noticeItem.brand).toMatchObject({
      '@type': 'Brand',
      name: 'Landlord Heaven',
    });
    expect(noticeItem.image).toBe('https://landlordheaven.co.uk/images/notice_bundles.webp');
    expect(noticeItem.offers.shippingDetails.hasShippingService['@id']).toBe(
      DIGITAL_PRODUCT_SHIPPING_SERVICE_ID
    );
    expect(noticeItem.offers.hasMerchantReturnPolicy['@id']).toBe(
      DIGITAL_PRODUCT_RETURN_POLICY_ID
    );

    const lodgerItem = schema.itemListElement[1].item;
    expect(lodgerItem.image).toBe(
      'https://landlordheaven.co.uk/images/tenancy_agreements.webp'
    );
  });

  it('productSchema uses merchant policy references instead of MIN-coded delivery blocks', () => {
    const schema = productSchema({
      name: 'Test Product',
      description: 'Test description',
      price: '29.99',
      url: 'https://landlordheaven.co.uk/products/test-product',
    }) as {
      offers: Record<string, any>;
    };

    expect(schema.offers.shippingDetails.hasShippingService['@id']).toBe(
      DIGITAL_PRODUCT_SHIPPING_SERVICE_ID
    );
    expect(schema.offers.hasMerchantReturnPolicy['@id']).toBe(
      DIGITAL_PRODUCT_RETURN_POLICY_ID
    );
    expect(JSON.stringify(schema)).not.toContain('"unitCode":"MIN"');
  });

  it('does not leave hardcoded MIN shipping unit codes in app schema sources', () => {
    const violations: string[] = [];
    const appRoot = path.join(process.cwd(), 'src/app');
    const allowedExtensions = new Set(['.ts', '.tsx']);

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath);
          continue;
        }

        if (!allowedExtensions.has(path.extname(entry.name))) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');
        if (/unitCode\s*:\s*['"]MIN['"]/.test(content)) {
          violations.push(fullPath);
        }
      }
    };

    walk(appRoot);
    expect(violations).toEqual([]);
  });
});
