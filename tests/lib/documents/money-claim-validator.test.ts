import { describe, expect, it } from 'vitest';
import {
  validateMoneyClaimData,
  assertValidMoneyClaimData,
  assertTotalsReconcile,
} from '@/lib/documents/money-claim-validator';
import type { MoneyClaimCase } from '@/lib/documents/money-claim-pack-generator';

// =============================================================================
// TEST DATA FIXTURES
// =============================================================================

const validClaim: MoneyClaimCase = {
  jurisdiction: 'england',
  case_id: 'test-case-001',
  landlord_full_name: 'Alice Landlord',
  landlord_address: '1 High Street\nLondon',
  landlord_postcode: 'E1 1AA',
  landlord_email: 'alice@example.com',
  tenant_full_name: 'Tom Tenant',
  property_address: '2 High Street\nLondon',
  property_postcode: 'E1 2BB',
  rent_amount: 950,
  rent_frequency: 'monthly' as const,
  tenancy_start_date: '2024-01-01',
  arrears_total: 1450,
  arrears_schedule: [
    { period: 'Jan 2024', due_date: '2024-01-01', amount_due: 950, amount_paid: 0, arrears: 950 },
    { period: 'Feb 2024', due_date: '2024-02-01', amount_due: 950, amount_paid: 450, arrears: 500 },
  ],
  damage_items: [{ description: 'Broken door', amount: 200 }],
  other_charges: [{ description: 'Locksmith call-out', amount: 80 }],
  signatory_name: 'Alice Landlord',
  signature_date: '2025-01-15',
  lba_date: '2024-12-01',
};

describe('Money Claim Validator', () => {
  describe('validateMoneyClaimData', () => {
    it('passes validation for complete, valid claim data', () => {
      const result = validateMoneyClaimData(validClaim);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.computedTotals.arrears_total).toBe(1450);
      expect(result.computedTotals.damages_total).toBe(200);
      expect(result.computedTotals.other_charges_total).toBe(80);
      expect(result.computedTotals.principal_total).toBe(1730);
    });

    it('fails validation when landlord name is missing', () => {
      const claim = { ...validClaim, landlord_full_name: '' };
      const result = validateMoneyClaimData(claim);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_REQUIRED_FIELD',
          field: 'landlord_full_name',
        })
      );
    });

    it('fails validation when tenant name is missing', () => {
      const claim = { ...validClaim, tenant_full_name: undefined as any };
      const result = validateMoneyClaimData(claim);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_REQUIRED_FIELD',
          field: 'tenant_full_name',
        })
      );
    });

    it('fails validation when property address is missing', () => {
      const claim = { ...validClaim, property_address: '' };
      const result = validateMoneyClaimData(claim);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_REQUIRED_FIELD',
          field: 'property_address',
        })
      );
    });

    it('fails validation when rent amount is missing', () => {
      const claim = { ...validClaim, rent_amount: undefined as any };
      const result = validateMoneyClaimData(claim);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_REQUIRED_FIELD',
          field: 'rent_amount',
        })
      );
    });

    it('fails validation when no claim amount (arrears/damages/other)', () => {
      const claim = {
        ...validClaim,
        arrears_total: 0,
        arrears_schedule: [],
        damage_items: [],
        other_charges: [],
      };
      const result = validateMoneyClaimData(claim);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'NO_CLAIM_AMOUNT',
        })
      );
    });

    it('fails validation when postcode is missing', () => {
      const claim = {
        ...validClaim,
        landlord_postcode: undefined,
        service_postcode: undefined,
      };
      const result = validateMoneyClaimData(claim);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_POSTCODE',
          field: 'landlord_postcode',
        })
      );
    });

    it('warns when arrears total mismatches schedule sum', () => {
      const claim = {
        ...validClaim,
        arrears_total: 2000, // Doesn't match schedule sum of 1450
      };
      const result = validateMoneyClaimData(claim);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'ARREARS_TOTAL_MISMATCH',
        })
      );
    });

    it('warns when signatory name differs from landlord name (no solicitor)', () => {
      const claim = {
        ...validClaim,
        signatory_name: 'Different Person',
        solicitor_firm: undefined,
      };
      const result = validateMoneyClaimData(claim);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'SIGNATORY_NAME_MISMATCH',
        })
      );
    });

    it('does NOT warn about signatory mismatch when solicitor is signing', () => {
      const claim = {
        ...validClaim,
        signatory_name: 'John Solicitor',
        solicitor_firm: 'Law Firm LLP',
      };
      const result = validateMoneyClaimData(claim);

      expect(result.warnings.find((w) => w.code === 'SIGNATORY_NAME_MISMATCH')).toBeUndefined();
    });

    it('warns when no court fee specified', () => {
      const claim = {
        ...validClaim,
        court_fee: undefined,
      };
      const result = validateMoneyClaimData(claim);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'NO_COURT_FEE',
        })
      );
    });

    it('warns when no LBA date recorded', () => {
      const claim = {
        ...validClaim,
        lba_date: undefined,
      };
      const result = validateMoneyClaimData(claim);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'NO_LBA_DATE',
        })
      );
    });

    it('warns when interest claimed but no rate specified', () => {
      const claim = {
        ...validClaim,
        claim_interest: true,
        interest_rate: undefined,
      };
      const result = validateMoneyClaimData(claim);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'INTEREST_NO_RATE',
        })
      );
    });

    it('calculates interest when claim_interest is true', () => {
      const claim = {
        ...validClaim,
        claim_interest: true,
        interest_rate: 8,
      };
      const result = validateMoneyClaimData(claim);

      expect(result.computedTotals.interest_amount).not.toBeNull();
      expect(result.computedTotals.interest_amount).toBeGreaterThan(0);
    });

    it('does NOT calculate interest when claim_interest is false', () => {
      const claim = {
        ...validClaim,
        claim_interest: false,
      };
      const result = validateMoneyClaimData(claim);

      expect(result.computedTotals.interest_amount).toBeNull();
    });
  });

  describe('assertValidMoneyClaimData', () => {
    it('returns validation result when data is valid', () => {
      const result = assertValidMoneyClaimData(validClaim);

      expect(result.valid).toBe(true);
      expect(result.computedTotals).toBeDefined();
    });

    it('throws human-readable error when validation fails', () => {
      const invalidClaim = {
        ...validClaim,
        landlord_full_name: '',
        tenant_full_name: '',
      };

      expect(() => assertValidMoneyClaimData(invalidClaim)).toThrow(
        /Money claim data validation failed/
      );
      expect(() => assertValidMoneyClaimData(invalidClaim)).toThrow(/Missing required field/);
    });

    it('throws error listing all missing fields', () => {
      const invalidClaim = {
        ...validClaim,
        landlord_full_name: '',
        landlord_address: '',
        tenant_full_name: '',
      };

      try {
        assertValidMoneyClaimData(invalidClaim);
        expect.fail('Should have thrown');
      } catch (err: any) {
        expect(err.message).toContain('Claimant (landlord) full name');
        expect(err.message).toContain('Claimant address');
        expect(err.message).toContain('Defendant (tenant) full name');
      }
    });
  });

  describe('assertTotalsReconcile', () => {
    it('passes when totals match exactly', () => {
      expect(() => assertTotalsReconcile(1730.0, 1730.0)).not.toThrow();
    });

    it('passes when totals are within tolerance', () => {
      expect(() => assertTotalsReconcile(1730.0, 1730.005)).not.toThrow();
    });

    it('throws when totals differ beyond tolerance', () => {
      expect(() => assertTotalsReconcile(1730.0, 1735.0)).toThrow(/Total mismatch/);
    });

    it('includes expected and rendered values in error message', () => {
      try {
        assertTotalsReconcile(1730.0, 1800.0);
        expect.fail('Should have thrown');
      } catch (err: any) {
        expect(err.message).toContain('£1730.00');
        expect(err.message).toContain('£1800.00');
      }
    });
  });
});

describe('Money Claim Validation - Required Data Matrix', () => {
  // This test documents the required data matrix for England money claims
  const requiredFields = [
    'landlord_full_name',
    'landlord_address',
    'tenant_full_name',
    'property_address',
    'rent_amount',
    'rent_frequency',
  ];

  it.each(requiredFields)('requires %s field', (field) => {
    const claim = { ...validClaim, [field]: undefined };
    const result = validateMoneyClaimData(claim);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === field)).toBe(true);
  });
});
