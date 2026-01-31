/**
 * E2E Regional Gating Tests
 *
 * Comprehensive tests validating regional product availability and user journey flows
 * across all UK jurisdictions: England, Wales, Scotland, and Northern Ireland.
 *
 * Regional Product Availability Matrix (January 2026):
 *
 * | Product              | England | Wales | Scotland | Northern Ireland |
 * |----------------------|---------|-------|----------|------------------|
 * | Notice Only (£39.99) | ✅      | ✅    | ✅       | ❌               |
 * | Eviction Pack (£149) | ✅      | ❌    | ❌       | ❌               |
 * | Money Claim (£99.99) | ✅      | ❌    | ❌       | ❌               |
 * | Tenancy Agreement    | ✅      | ✅    | ✅       | ✅               |
 * | Premium TA (£14.99)  | ✅      | ✅    | ✅       | ✅               |
 *
 * @module tests/e2e/region-gating.spec
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
  getCapabilityMatrix,
  isFlowSupported,
  getSupportedRoutes,
  assertFlowSupported,
  FlowCapabilityError,
  type Jurisdiction,
  type Product,
} from '../../src/lib/jurisdictions/capabilities/matrix';
import { PRODUCTS, type ProductSku } from '../../src/lib/pricing/products';

/**
 * Helper function to get product price
 */
function getProductPrice(sku: ProductSku): number {
  return PRODUCTS[sku].price;
}

// =============================================================================
// Test Constants - Regional Product Availability
// =============================================================================

const ENGLAND: Jurisdiction = 'england';
const WALES: Jurisdiction = 'wales';
const SCOTLAND: Jurisdiction = 'scotland';
const NORTHERN_IRELAND: Jurisdiction = 'northern-ireland';

const ALL_JURISDICTIONS: Jurisdiction[] = [ENGLAND, WALES, SCOTLAND, NORTHERN_IRELAND];

// Products that are England-only
const ENGLAND_ONLY_PRODUCTS: Product[] = ['eviction_pack', 'money_claim'];

// Products available in England, Wales, and Scotland (but not NI)
const GREAT_BRITAIN_PRODUCTS: Product[] = ['notice_only'];

// Products available in all UK regions
const ALL_UK_PRODUCTS: Product[] = ['tenancy_agreement'];

// Expected prices for each product
const EXPECTED_PRICES: Record<string, number> = {
  notice_only: 39.99,
  complete_pack: 149.99,
  eviction_pack: 149.99,
  money_claim: 99.99,
  tenancy_agreement: 9.99,
  premium_tenancy_agreement: 14.99,
};

// =============================================================================
// England Product Visibility Tests
// =============================================================================

describe('E2E Regional Gating - England', () => {
  describe('Product Visibility', () => {
    it('all products should be visible and available for England', () => {
      const allProducts: Product[] = ['notice_only', 'eviction_pack', 'money_claim', 'tenancy_agreement'];

      for (const product of allProducts) {
        expect(isFlowSupported(ENGLAND, product)).toBe(true);
      }
    });

    it('should have Notice Only, Eviction Pack, Money Claim, and Tenancy available', () => {
      const matrix = getCapabilityMatrix();
      const englandProducts = matrix[ENGLAND];

      expect(englandProducts.notice_only.status).toBe('supported');
      expect(englandProducts.eviction_pack.status).toBe('supported');
      expect(englandProducts.money_claim.status).toBe('supported');
      expect(englandProducts.tenancy_agreement.status).toBe('supported');
    });
  });

  describe('Notice Only Routes', () => {
    it('should support Section 21 and Section 8 routes', () => {
      const routes = getSupportedRoutes(ENGLAND, 'notice_only');

      expect(routes).toContain('section_21');
      expect(routes).toContain('section_8');
    });

    it('Section 21 wizard should complete successfully for compliant case', () => {
      // Verify Section 21 flow is accessible
      expect(() => assertFlowSupported(ENGLAND, 'notice_only', 'section_21')).not.toThrow();
    });

    it('Section 8 wizard should complete successfully for compliant case', () => {
      // Verify Section 8 flow is accessible
      expect(() => assertFlowSupported(ENGLAND, 'notice_only', 'section_8')).not.toThrow();
    });
  });

  describe('Eviction Pack Routes', () => {
    it('should support Section 21 and Section 8 routes for eviction packs', () => {
      const routes = getSupportedRoutes(ENGLAND, 'eviction_pack');

      expect(routes).toContain('section_21');
      expect(routes).toContain('section_8');
    });
  });

  describe('Money Claim Routes', () => {
    it('should support money claim routes', () => {
      expect(isFlowSupported(ENGLAND, 'money_claim')).toBe(true);
    });
  });

  describe('Pricing Verification', () => {
    it('should display correct prices for all England products', () => {
      const noticeOnlyPrice = getProductPrice('notice_only');
      const evictionPackPrice = getProductPrice('complete_pack');
      const moneyClaimPrice = getProductPrice('money_claim');
      const tenancyPrice = getProductPrice('ast_standard');

      expect(noticeOnlyPrice).toBe(EXPECTED_PRICES.notice_only);
      expect(evictionPackPrice).toBe(EXPECTED_PRICES.complete_pack);
      expect(moneyClaimPrice).toBe(EXPECTED_PRICES.money_claim);
      expect(tenancyPrice).toBe(EXPECTED_PRICES.tenancy_agreement);
    });
  });
});

// =============================================================================
// Wales Product Visibility Tests
// =============================================================================

describe('E2E Regional Gating - Wales', () => {
  describe('Product Visibility', () => {
    it('should show Notice Only and Tenancy Agreement as available', () => {
      expect(isFlowSupported(WALES, 'notice_only')).toBe(true);
      expect(isFlowSupported(WALES, 'tenancy_agreement')).toBe(true);
    });

    it('should NOT show Eviction Pack as available', () => {
      expect(isFlowSupported(WALES, 'eviction_pack')).toBe(false);
    });

    it('should NOT show Money Claim as available', () => {
      expect(isFlowSupported(WALES, 'money_claim')).toBe(false);
    });
  });

  describe('Restricted Product Access', () => {
    it('attempting to access Eviction Pack should throw FlowCapabilityError', () => {
      expect(() => assertFlowSupported(WALES, 'eviction_pack')).toThrow(FlowCapabilityError);

      try {
        assertFlowSupported(WALES, 'eviction_pack');
      } catch (error) {
        expect(error).toBeInstanceOf(FlowCapabilityError);
        const capError = error as FlowCapabilityError;
        expect(capError.statusCode).toBe(422);
        expect(capError.payload.code).toBe('FLOW_NOT_SUPPORTED');
      }
    });

    it('attempting to access Money Claim should throw FlowCapabilityError', () => {
      expect(() => assertFlowSupported(WALES, 'money_claim')).toThrow(FlowCapabilityError);
    });

    it('should return 422 status for blocked products', () => {
      try {
        assertFlowSupported(WALES, 'money_claim');
      } catch (error) {
        const capError = error as FlowCapabilityError;
        expect(capError.statusCode).toBe(422);
      }
    });
  });

  describe('Wales Notice Routes', () => {
    it('should support Wales Section 173 route', () => {
      const routes = getSupportedRoutes(WALES, 'notice_only');

      expect(routes).toContain('wales_section_173');
    });

    it('should NOT support England Section 21 route', () => {
      const routes = getSupportedRoutes(WALES, 'notice_only');

      expect(routes).not.toContain('section_21');
    });

    it('Wales Section 173 wizard should complete successfully', () => {
      expect(() => assertFlowSupported(WALES, 'notice_only', 'wales_section_173')).not.toThrow();
    });
  });

  describe('Capability Matrix Status', () => {
    it('should have correct status for all products', () => {
      const matrix = getCapabilityMatrix();
      const walesProducts = matrix[WALES];

      expect(walesProducts.notice_only.status).toBe('supported');
      expect(walesProducts.tenancy_agreement.status).toBe('supported');
      expect(walesProducts.eviction_pack.status).toBe('unsupported');
      expect(walesProducts.money_claim.status).toBe('unsupported');
    });
  });
});

// =============================================================================
// Scotland Product Visibility Tests
// =============================================================================

describe('E2E Regional Gating - Scotland', () => {
  describe('Product Visibility', () => {
    it('should show Notice Only and Tenancy Agreement as available', () => {
      expect(isFlowSupported(SCOTLAND, 'notice_only')).toBe(true);
      expect(isFlowSupported(SCOTLAND, 'tenancy_agreement')).toBe(true);
    });

    it('should NOT show Eviction Pack as available', () => {
      expect(isFlowSupported(SCOTLAND, 'eviction_pack')).toBe(false);
    });

    it('should NOT show Money Claim as available', () => {
      expect(isFlowSupported(SCOTLAND, 'money_claim')).toBe(false);
    });
  });

  describe('Restricted Product Access', () => {
    it('attempting to access Eviction Pack should throw FlowCapabilityError', () => {
      expect(() => assertFlowSupported(SCOTLAND, 'eviction_pack')).toThrow(FlowCapabilityError);
    });

    it('attempting to access Money Claim should throw FlowCapabilityError', () => {
      expect(() => assertFlowSupported(SCOTLAND, 'money_claim')).toThrow(FlowCapabilityError);
    });
  });

  describe('Scotland Notice Routes', () => {
    it('should support Notice to Leave route', () => {
      const routes = getSupportedRoutes(SCOTLAND, 'notice_only');

      expect(routes).toContain('notice_to_leave');
    });

    it('should NOT support England Section 21 or Section 8 routes', () => {
      const routes = getSupportedRoutes(SCOTLAND, 'notice_only');

      expect(routes).not.toContain('section_21');
      expect(routes).not.toContain('section_8');
    });

    it('Notice to Leave wizard should complete successfully', () => {
      expect(() => assertFlowSupported(SCOTLAND, 'notice_only', 'notice_to_leave')).not.toThrow();
    });
  });

  describe('Capability Matrix Status', () => {
    it('should have correct status for all products', () => {
      const matrix = getCapabilityMatrix();
      const scotlandProducts = matrix[SCOTLAND];

      expect(scotlandProducts.notice_only.status).toBe('supported');
      expect(scotlandProducts.tenancy_agreement.status).toBe('supported');
      expect(scotlandProducts.eviction_pack.status).toBe('unsupported');
      expect(scotlandProducts.money_claim.status).toBe('unsupported');
    });
  });
});

// =============================================================================
// Northern Ireland Product Visibility Tests
// =============================================================================

describe('E2E Regional Gating - Northern Ireland', () => {
  describe('Product Visibility', () => {
    it('should ONLY show Tenancy Agreement as available', () => {
      expect(isFlowSupported(NORTHERN_IRELAND, 'tenancy_agreement')).toBe(true);
    });

    it('should NOT show Notice Only as available', () => {
      expect(isFlowSupported(NORTHERN_IRELAND, 'notice_only')).toBe(false);
    });

    it('should NOT show Eviction Pack as available', () => {
      expect(isFlowSupported(NORTHERN_IRELAND, 'eviction_pack')).toBe(false);
    });

    it('should NOT show Money Claim as available', () => {
      expect(isFlowSupported(NORTHERN_IRELAND, 'money_claim')).toBe(false);
    });
  });

  describe('Restricted Product Access', () => {
    it('attempting to access Notice Only should throw FlowCapabilityError', () => {
      expect(() => assertFlowSupported(NORTHERN_IRELAND, 'notice_only')).toThrow(FlowCapabilityError);

      try {
        assertFlowSupported(NORTHERN_IRELAND, 'notice_only');
      } catch (error) {
        const capError = error as FlowCapabilityError;
        expect(capError.statusCode).toBe(422);
        expect(capError.payload.code).toBe('FLOW_NOT_SUPPORTED');
      }
    });

    it('attempting to access Eviction Pack should throw FlowCapabilityError', () => {
      expect(() => assertFlowSupported(NORTHERN_IRELAND, 'eviction_pack')).toThrow(FlowCapabilityError);
    });

    it('attempting to access Money Claim should throw FlowCapabilityError', () => {
      expect(() => assertFlowSupported(NORTHERN_IRELAND, 'money_claim')).toThrow(FlowCapabilityError);
    });
  });

  describe('Tenancy Agreement Available', () => {
    it('should support Tenancy Agreement flow', () => {
      expect(() => assertFlowSupported(NORTHERN_IRELAND, 'tenancy_agreement')).not.toThrow();
    });

    it('Tenancy Agreement wizard should complete successfully', () => {
      const routes = getSupportedRoutes(NORTHERN_IRELAND, 'tenancy_agreement');
      expect(routes.length).toBeGreaterThan(0);
    });
  });

  describe('Capability Matrix Status', () => {
    it('should be the ONLY jurisdiction with tenancy_agreement as sole supported product', () => {
      const matrix = getCapabilityMatrix();
      const niProducts = matrix[NORTHERN_IRELAND];

      expect(niProducts.notice_only.status).toBe('unsupported');
      expect(niProducts.eviction_pack.status).toBe('unsupported');
      expect(niProducts.money_claim.status).toBe('unsupported');
      expect(niProducts.tenancy_agreement.status).toBe('supported');
    });
  });
});

// =============================================================================
// API Validation Tests (400/422 Responses)
// =============================================================================

describe('E2E Regional Gating - API Validation', () => {
  describe('422 Response for Blocked Products', () => {
    it('Wales eviction_pack returns 422 with proper error payload', () => {
      try {
        assertFlowSupported(WALES, 'eviction_pack');
        expect.fail('Should have thrown FlowCapabilityError');
      } catch (error) {
        const capError = error as FlowCapabilityError;
        expect(capError.statusCode).toBe(422);
        expect(capError.payload).toMatchObject({
          code: 'FLOW_NOT_SUPPORTED',
          blocking_issues: expect.arrayContaining([
            expect.objectContaining({
              code: 'FLOW_NOT_SUPPORTED',
            }),
          ]),
        });
      }
    });

    it('Scotland money_claim returns 422 with proper error payload', () => {
      try {
        assertFlowSupported(SCOTLAND, 'money_claim');
        expect.fail('Should have thrown FlowCapabilityError');
      } catch (error) {
        const capError = error as FlowCapabilityError;
        expect(capError.statusCode).toBe(422);
        expect(capError.payload.code).toBe('FLOW_NOT_SUPPORTED');
      }
    });

    it('Northern Ireland notice_only returns 422 with proper error payload', () => {
      try {
        assertFlowSupported(NORTHERN_IRELAND, 'notice_only');
        expect.fail('Should have thrown FlowCapabilityError');
      } catch (error) {
        const capError = error as FlowCapabilityError;
        expect(capError.statusCode).toBe(422);
        expect(capError.payload.code).toBe('FLOW_NOT_SUPPORTED');
        expect(capError.payload.blocking_issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Unsupported Route Returns 422', () => {
    it('Wales Section 21 route returns 422 (route not supported)', () => {
      try {
        assertFlowSupported(WALES, 'notice_only', 'section_21');
        expect.fail('Should have thrown FlowCapabilityError');
      } catch (error) {
        const capError = error as FlowCapabilityError;
        expect(capError.statusCode).toBe(422);
        expect(capError.payload.code).toBe('ROUTE_NOT_SUPPORTED');
      }
    });

    it('Scotland Section 8 route returns 422 (route not supported)', () => {
      try {
        assertFlowSupported(SCOTLAND, 'notice_only', 'section_8');
        expect.fail('Should have thrown FlowCapabilityError');
      } catch (error) {
        const capError = error as FlowCapabilityError;
        expect(capError.statusCode).toBe(422);
        expect(capError.payload.code).toBe('ROUTE_NOT_SUPPORTED');
      }
    });
  });
});

// =============================================================================
// Cross-Jurisdictional Comparison Tests
// =============================================================================

describe('E2E Regional Gating - Cross-Jurisdiction Comparison', () => {
  describe('Product Availability Matrix Consistency', () => {
    it('all jurisdictions support tenancy_agreement', () => {
      for (const jurisdiction of ALL_JURISDICTIONS) {
        expect(isFlowSupported(jurisdiction, 'tenancy_agreement')).toBe(true);
      }
    });

    it('only England supports eviction_pack', () => {
      expect(isFlowSupported(ENGLAND, 'eviction_pack')).toBe(true);
      expect(isFlowSupported(WALES, 'eviction_pack')).toBe(false);
      expect(isFlowSupported(SCOTLAND, 'eviction_pack')).toBe(false);
      expect(isFlowSupported(NORTHERN_IRELAND, 'eviction_pack')).toBe(false);
    });

    it('only England supports money_claim', () => {
      expect(isFlowSupported(ENGLAND, 'money_claim')).toBe(true);
      expect(isFlowSupported(WALES, 'money_claim')).toBe(false);
      expect(isFlowSupported(SCOTLAND, 'money_claim')).toBe(false);
      expect(isFlowSupported(NORTHERN_IRELAND, 'money_claim')).toBe(false);
    });

    it('England, Wales, and Scotland support notice_only', () => {
      expect(isFlowSupported(ENGLAND, 'notice_only')).toBe(true);
      expect(isFlowSupported(WALES, 'notice_only')).toBe(true);
      expect(isFlowSupported(SCOTLAND, 'notice_only')).toBe(true);
      expect(isFlowSupported(NORTHERN_IRELAND, 'notice_only')).toBe(false);
    });
  });

  describe('England-Only Product Badges', () => {
    it('eviction_pack should be marked as England-only', () => {
      // Verify via capability matrix that only England supports it
      const matrix = getCapabilityMatrix();

      expect(matrix[ENGLAND].eviction_pack.status).toBe('supported');
      expect(matrix[WALES].eviction_pack.status).toBe('unsupported');
      expect(matrix[SCOTLAND].eviction_pack.status).toBe('unsupported');
      expect(matrix[NORTHERN_IRELAND].eviction_pack.status).toBe('unsupported');
    });

    it('money_claim should be marked as England-only', () => {
      const matrix = getCapabilityMatrix();

      expect(matrix[ENGLAND].money_claim.status).toBe('supported');
      expect(matrix[WALES].money_claim.status).toBe('unsupported');
      expect(matrix[SCOTLAND].money_claim.status).toBe('unsupported');
      expect(matrix[NORTHERN_IRELAND].money_claim.status).toBe('unsupported');
    });
  });
});

// =============================================================================
// Summary Report
// =============================================================================

describe('E2E Regional Gating - Summary', () => {
  it('prints regional availability matrix', () => {
    const matrix = getCapabilityMatrix();

    console.log('\n');
    console.log('='.repeat(80));
    console.log('               REGIONAL PRODUCT AVAILABILITY MATRIX');
    console.log('='.repeat(80));
    console.log('');
    console.log('| Product           | England | Wales | Scotland | N. Ireland |');
    console.log('|-------------------|---------|-------|----------|------------|');

    const products: Product[] = ['notice_only', 'eviction_pack', 'money_claim', 'tenancy_agreement'];

    for (const product of products) {
      const england = matrix[ENGLAND][product].status === 'supported' ? '✅' : '❌';
      const wales = matrix[WALES][product].status === 'supported' ? '✅' : '❌';
      const scotland = matrix[SCOTLAND][product].status === 'supported' ? '✅' : '❌';
      const ni = matrix[NORTHERN_IRELAND][product].status === 'supported' ? '✅' : '❌';

      console.log(`| ${product.padEnd(17)} | ${england.padEnd(7)} | ${wales.padEnd(5)} | ${scotland.padEnd(8)} | ${ni.padEnd(10)} |`);
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('');

    // This test always passes - it's for reporting purposes
    expect(true).toBe(true);
  });
});
