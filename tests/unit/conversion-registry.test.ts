import { describe, expect, it } from 'vitest';
import { CONVERSION_REGISTRY, getConversionMapping } from '@/lib/conversion/registry';

describe('SALES-001 conversion registry', () => {
  it('maps each source route once', () => {
    const routes = CONVERSION_REGISTRY.map((mapping) => mapping.sourceRoute);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('maps the highest-intent organic routes to the immediate paid task', () => {
    expect(getConversionMapping('/blog/how-to-write-letter-before-action-unpaid-rent')?.primaryProduct)
      .toBe('money_claim');
    expect(getConversionMapping('/tools/hmo-license-checker')?.primaryProduct)
      .toBe('hmo_shared_house');
    expect(getConversionMapping('/blog/england-section-8-ground-10-11')?.primaryProduct)
      .toBe('notice_only');
    expect(getConversionMapping('/blog/england-county-court-forms')?.primaryProduct)
      .toBe('complete_pack');
  });

  it('uses central live prices and preview declarations for every mapping', () => {
    for (const mapping of CONVERSION_REGISTRY) {
      expect(mapping.price).toMatch(/^£\d/);
      expect(typeof mapping.previewAvailable).toBe('boolean');
    }
  });

  it('sends evidence-backed ground articles into a preselected Form 3A builder', () => {
    const ground10And11 = getConversionMapping('/blog/england-section-8-ground-10-11');
    const ground14 = getConversionMapping('/blog/england-section-8-ground-14');

    expect(ground10And11?.destinationRoute).toContain('/wizard/flow?');
    expect(ground10And11?.destinationRoute).toContain('product=notice_only');
    expect(ground10And11?.destinationRoute).toContain('ground=10%2C11');
    expect(ground14?.destinationRoute).toContain('ground=14');
    expect(ground10And11?.builderPreselection).toMatchObject({ ground: '10,11' });
  });
});
