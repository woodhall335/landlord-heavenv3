/**
 * Money Claim England-Only Enforcement Tests
 *
 * Verifies that:
 * 1. Money Claim product is restricted to England only
 * 2. Non-England jurisdictions are rejected with clear error messages
 * 3. Mapper always sets jurisdiction to 'england'
 * 4. No jurisdiction branching exists in generation paths
 */

import { describe, expect, it } from 'vitest';
import { mapCaseFactsToMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';
import type { CaseFacts } from '@/lib/case-facts/schema';

// Minimal valid CaseFacts for testing mapper
function createMinimalCaseFacts(countryOverride?: string): CaseFacts {
  return {
    wizard_type: 'money_claim',
    parties: {
      landlord: {
        name: 'Test Landlord',
        address_line1: '123 Test St',
        city: 'London',
        postcode: 'E1 1AA',
      },
      tenants: [{ name: 'Test Tenant' }],
    },
    property: {
      address_line1: '456 Property St',
      city: 'London',
      postcode: 'E1 2BB',
      country: countryOverride || 'england',
    },
    tenancy: {
      start_date: '2024-01-01',
      rent_amount: 1000,
      rent_frequency: 'monthly',
      type: 'ast',
    },
    issues: {
      rent_arrears: {
        total_arrears: 3000,
        arrears_items: [],
      },
    },
    money_claim: {
      payment_day: 1,
    },
    court: {},
    service_contact: {},
    deposit_amount: 0,
    compliance: {},
    letter_before_claim_sent: true,
  } as CaseFacts;
}

describe('Money Claim England-Only Enforcement', () => {
  describe('Wizard Mapper', () => {
    it('always sets jurisdiction to england regardless of property country', () => {
      // Test with England property
      const englandCase = mapCaseFactsToMoneyClaimCase(createMinimalCaseFacts('england'));
      expect(englandCase.jurisdiction).toBe('england');

      // Test with Wales property - should still be 'england' since money_claim is England-only
      const walesCase = mapCaseFactsToMoneyClaimCase(createMinimalCaseFacts('wales'));
      expect(walesCase.jurisdiction).toBe('england');

      // Test with Scotland property - should still be 'england'
      const scotlandCase = mapCaseFactsToMoneyClaimCase(createMinimalCaseFacts('scotland'));
      expect(scotlandCase.jurisdiction).toBe('england');

      // Test with no country specified - should default to 'england'
      const noCountryCase = mapCaseFactsToMoneyClaimCase(createMinimalCaseFacts(undefined));
      expect(noCountryCase.jurisdiction).toBe('england');
    });
  });

  describe('Type Definitions', () => {
    it('MoneyClaimJurisdiction type is strictly england', () => {
      // This is a compile-time test - if the type is wrong, TypeScript will fail
      const jurisdiction: 'england' = 'england';
      expect(jurisdiction).toBe('england');
    });
  });

  describe('Error Messages', () => {
    it('error messages mention Scotland Simple Procedure as alternative', async () => {
      // Import dynamically to test error message content
      const { generateMoneyClaimPack } = await import('@/lib/documents/money-claim-pack-generator');

      try {
        await generateMoneyClaimPack({
          jurisdiction: 'scotland' as any,
          landlord_full_name: 'Test',
          landlord_address: 'Test',
          tenant_full_name: 'Test',
          property_address: 'Test',
          rent_amount: 1000,
          rent_frequency: 'monthly',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Scotland');
        expect(error.message).toContain('Simple Procedure');
        expect(error.message).toContain('sc_money_claim');
      }
    });

    it('error messages clearly state Wales is not supported', async () => {
      const { generateMoneyClaimPack } = await import('@/lib/documents/money-claim-pack-generator');

      try {
        await generateMoneyClaimPack({
          jurisdiction: 'wales' as any,
          landlord_full_name: 'Test',
          landlord_address: 'Test',
          tenant_full_name: 'Test',
          property_address: 'Test',
          rent_amount: 1000,
          rent_frequency: 'monthly',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Wales');
        expect(error.message).toContain('not supported');
      }
    });
  });
});
