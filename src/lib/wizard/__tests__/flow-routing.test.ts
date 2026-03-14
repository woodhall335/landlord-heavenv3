import { describe, expect, it } from 'vitest';

import { isResidentialStandaloneTenancyProduct } from '@/lib/wizard/flow-routing';

describe('isResidentialStandaloneTenancyProduct', () => {
  it('returns true for standalone residential letting products', () => {
    expect(isResidentialStandaloneTenancyProduct('rent_arrears_letter')).toBe(true);
    expect(isResidentialStandaloneTenancyProduct('guarantor_agreement')).toBe(true);
    expect(isResidentialStandaloneTenancyProduct('residential_tenancy_application')).toBe(true);
    expect(isResidentialStandaloneTenancyProduct('inventory_schedule_condition')).toBe(true);
  });

  it('returns false for core tenancy products', () => {
    expect(isResidentialStandaloneTenancyProduct('ast_standard')).toBe(false);
    expect(isResidentialStandaloneTenancyProduct('ast_premium')).toBe(false);
    expect(isResidentialStandaloneTenancyProduct('tenancy_agreement')).toBe(false);
  });

  it('returns false for nullish/unknown values', () => {
    expect(isResidentialStandaloneTenancyProduct(null)).toBe(false);
    expect(isResidentialStandaloneTenancyProduct(undefined)).toBe(false);
    expect(isResidentialStandaloneTenancyProduct('invalid_product')).toBe(false);
  });
});
