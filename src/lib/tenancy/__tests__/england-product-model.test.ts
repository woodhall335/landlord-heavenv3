import { describe, expect, it } from 'vitest';
import {
  ENGLAND_MODERN_TENANCY_PRODUCTS,
  ENGLAND_TENANCY_PRODUCT_ORDER,
  getEnglandCanonicalTenancyProduct,
  getEnglandTenancyProductLabel,
  isEnglandModernTenancyProductSku,
  isEnglandTenancyProductOrAlias,
} from '../england-product-model';

describe('england-product-model', () => {
  it('defines five first-class England tenancy products', () => {
    expect(ENGLAND_MODERN_TENANCY_PRODUCTS).toEqual([
      'england_standard_tenancy_agreement',
      'england_premium_tenancy_agreement',
      'england_student_tenancy_agreement',
      'england_hmo_shared_house_tenancy_agreement',
      'england_lodger_agreement',
    ]);
    expect(ENGLAND_TENANCY_PRODUCT_ORDER).toEqual(ENGLAND_MODERN_TENANCY_PRODUCTS);
  });

  it('maps legacy England AST aliases to their canonical modern products', () => {
    expect(getEnglandCanonicalTenancyProduct('ast_standard')).toBe('england_standard_tenancy_agreement');
    expect(getEnglandCanonicalTenancyProduct('ast_premium')).toBe('england_premium_tenancy_agreement');
  });

  it('recognizes modern products and legacy aliases separately from unknown values', () => {
    expect(isEnglandModernTenancyProductSku('england_student_tenancy_agreement')).toBe(true);
    expect(isEnglandModernTenancyProductSku('ast_standard')).toBe(false);
    expect(isEnglandTenancyProductOrAlias('england_lodger_agreement')).toBe(true);
    expect(isEnglandTenancyProductOrAlias('ast_premium')).toBe(true);
    expect(isEnglandTenancyProductOrAlias('unknown_product')).toBe(false);
  });

  it('returns stable display labels for the England tenancy products', () => {
    expect(getEnglandTenancyProductLabel('england_standard_tenancy_agreement')).toBe('Standard Tenancy Agreement');
    expect(getEnglandTenancyProductLabel('england_premium_tenancy_agreement')).toBe('Premium Tenancy Agreement');
    expect(getEnglandTenancyProductLabel('england_student_tenancy_agreement')).toBe('Student Tenancy Agreement');
    expect(getEnglandTenancyProductLabel('england_hmo_shared_house_tenancy_agreement')).toBe('HMO / Shared House Tenancy Agreement');
    expect(getEnglandTenancyProductLabel('england_lodger_agreement')).toBe('Room Let / Lodger Agreement');
  });
});
