import { describe, expect, it } from 'vitest';
import {
  PUBLIC_JURISDICTIONS,
  getPublicCatalogProducts,
  getPublicProductOwnerHref,
  getPublicTenancyProducts,
  isPubliclyStartableProduct,
} from './public-products';

describe('public-products', () => {
  it('limits public catalog and tenancy products to England', () => {
    const publicProducts = [...getPublicCatalogProducts(), ...getPublicTenancyProducts()];

    expect(PUBLIC_JURISDICTIONS).toEqual(['england']);
    expect(publicProducts.length).toBeGreaterThan(0);
    expect(publicProducts.every((product) => product.public)).toBe(true);
    expect(publicProducts.every((product) => product.jurisdiction === 'england')).toBe(true);
  });

  it('does not expose legacy non-England products as publicly startable', () => {
    expect(isPubliclyStartableProduct('notice_only')).toBe(true);
    expect(isPubliclyStartableProduct('complete_pack')).toBe(true);
    expect(isPubliclyStartableProduct('tenancy_agreement')).toBe(true);

    expect(isPubliclyStartableProduct('money_claim_scotland')).toBe(false);
    expect(isPubliclyStartableProduct('prt_standard')).toBe(false);
    expect(isPubliclyStartableProduct('occupation_standard')).toBe(false);
    expect(isPubliclyStartableProduct('ni_standard')).toBe(false);
  });

  it('routes retired non-England tenancy intent back to the England hub', () => {
    expect(getPublicProductOwnerHref('occupation_standard', 'tenancy_agreement')).toBe('/products/ast');
    expect(getPublicProductOwnerHref('prt_standard', 'tenancy_agreement')).toBe('/products/ast');
    expect(getPublicProductOwnerHref('ni_standard', 'tenancy_agreement')).toBe('/products/ast');
  });
});
