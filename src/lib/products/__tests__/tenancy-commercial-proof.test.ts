import { describe, expect, it } from 'vitest';

import { REGIONAL_PRODUCT_AVAILABILITY, PRODUCTS } from '@/lib/pricing/products';
import { getASTDocuments } from '@/lib/documents/document-configs';
import { getJurisdictionConfig, getDocumentKey, type TenancyJurisdiction } from '@/lib/documents/ast-generator';

const JURISDICTIONS: TenancyJurisdiction[] = [
  'england',
  'wales',
  'scotland',
  'northern-ireland',
];

describe('Tenancy premium commercial proof points', () => {
  it('sells one premium tenancy product across all jurisdictions', () => {
    expect(PRODUCTS.ast_premium).toBeDefined();
    expect(PRODUCTS.ast_premium.label.toLowerCase()).toContain('premium');
    expect(REGIONAL_PRODUCT_AVAILABILITY.ast_premium.available).toEqual(JURISDICTIONS);
  });

  it.each(JURISDICTIONS)('premium tier is materially broader in %s pack contents', (jurisdiction) => {
    const docs = getASTDocuments(jurisdiction, 'premium', { hasInventoryData: true });
    const agreement = docs[0];

    expect(agreement.id).toContain('hmo');
    expect(agreement.title.toLowerCase()).toContain('premium');
    expect(agreement.description.toLowerCase()).toContain('broader drafting');
    expect(agreement.pages).toBe('20-25 pages');

    const inventory = docs.find((doc) => doc.id === 'inventory-schedule');
    expect(inventory?.description.toLowerCase()).toContain('wizard-completed');

    expect(docs.find((doc) => doc.id === 'key-schedule')).toBeDefined();
    expect(docs.find((doc) => doc.id === 'property-maintenance-guide')).toBeDefined();
    expect(docs.find((doc) => doc.id === 'checkout-procedure')).toBeDefined();

    if (jurisdiction === 'scotland') {
      expect(docs.find((doc) => doc.id === 'easy-read-notes-scotland')).toBeDefined();
    }
  });

  it.each(JURISDICTIONS)('premium template and document key are jurisdiction-specific in %s', (jurisdiction) => {
    const config = getJurisdictionConfig(jurisdiction);

    const premiumTemplate = config.templatePaths.premiumHmo || config.templatePaths.premium;
    expect(premiumTemplate).not.toEqual(config.templatePaths.standard);
    expect(premiumTemplate.toLowerCase()).toMatch(/hmo|premium/);

    const premiumDocKey = getDocumentKey(jurisdiction, 'premium');
    expect(premiumDocKey.toLowerCase()).toContain('hmo');
  });

  it.each(JURISDICTIONS)('maps each jurisdiction to explicit legal framework in %s', (jurisdiction) => {
    const config = getJurisdictionConfig(jurisdiction);

    expect(config.legalFramework.length).toBeGreaterThan(12);
    expect(config.legalFramework).toMatch(/Act|Order/);
  });
});
