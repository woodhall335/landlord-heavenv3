/**
 * Wizard Gating API Tests
 *
 * Tests that wizard gating rules correctly block invalid states across all products.
 */

import { describe, it, expect } from 'vitest';
import { evaluateWizardGate } from '@/lib/wizard/gating';

describe('Wizard Gating - Eviction (England)', () => {
  const baseInput = {
    case_type: 'eviction',
    product: 'notice_only' as const,
    jurisdiction: 'england',
  };

  describe('Gate 1: Ground 8 Threshold', () => {
    it('should block Ground 8 when arrears < 2 months', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          section8_grounds: ['Ground 8 - Serious rent arrears'],
          rent_amount: 1000,
          rent_frequency: 'monthly',
          arrears_total: 1500, // 1.5 months
        },
      });

      expect(result.blocking.some((b) => b.code === 'GROUND_8_THRESHOLD_NOT_MET')).toBe(true);
      const ground8Block = result.blocking.find((b) => b.code === 'GROUND_8_THRESHOLD_NOT_MET');
      expect(ground8Block?.message).toContain('1.50 months');
    });

    it('should allow Ground 8 when arrears >= 2 months', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          section8_grounds: ['Ground 8 - Serious rent arrears'],
          rent_amount: 1000,
          rent_frequency: 'monthly',
          arrears_total: 2100, // 2.1 months
        },
      });

      expect(result.blocking.some((b) => b.code === 'GROUND_8_THRESHOLD_NOT_MET')).toBe(false);
    });

    it('should warn when arrears are borderline (2-3 months)', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          section8_grounds: ['Ground 8 - Serious rent arrears'],
          rent_amount: 1000,
          rent_frequency: 'monthly',
          arrears_total: 2200, // 2.2 months
        },
      });

      expect(result.blocking.some((b) => b.code === 'GROUND_8_THRESHOLD_NOT_MET')).toBe(false);
      expect(result.warnings.some((w) => w.code === 'GROUND_8_BORDERLINE')).toBe(true);
    });

    it('should block Ground 8 when rent_amount is missing', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          section8_grounds: ['Ground 8 - Serious rent arrears'],
          rent_frequency: 'monthly',
          arrears_total: 2000,
        },
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      expect(result.blocking.some((b) => b.code === 'GROUND_8_MISSING_RENT_AMOUNT')).toBe(true);
    });

    it('should block Ground 8 when arrears_amount is missing', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          section8_grounds: ['Ground 8 - Serious rent arrears'],
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      expect(result.blocking.some((b) => b.code === 'GROUND_8_MISSING_ARREARS')).toBe(true);
    });

    it('should calculate arrears correctly for weekly rent', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          section8_grounds: ['Ground 8 - Serious rent arrears'],
          rent_amount: 250, // £250/week
          rent_frequency: 'weekly',
          arrears_total: 2000, // Should be ~8 weeks = ~1.85 months
        },
      });

      // 1.85 months is less than 2 months, should block
      expect(result.blocking.length).toBeGreaterThan(0);
      expect(result.blocking.some((b) => b.code === 'GROUND_8_THRESHOLD_NOT_MET')).toBe(true);
    });

    it('should allow weekly rent with sufficient arrears', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          section8_grounds: ['Ground 8 - Serious rent arrears'],
          rent_amount: 250, // £250/week
          rent_frequency: 'weekly',
          arrears_total: 2500, // 10 weeks = ~2.3 months
        },
      });

      expect(result.blocking.some((b) => b.code === 'GROUND_8_THRESHOLD_NOT_MET')).toBe(false);
    });
  });

  describe('Gate 2: Deposit Consistency', () => {
    it('should block when deposit_taken is true but deposit_amount is missing', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          deposit_taken: true,
          // deposit_amount is missing
        },
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      expect(result.blocking.some((b) => b.code === 'DEPOSIT_AMOUNT_REQUIRED')).toBe(true);
    });

    it('should allow when deposit_taken is true and deposit_amount is provided', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          deposit_taken: true,
          deposit_amount: 1500,
        },
      });

      // Should not block on deposit amount (may have other gates)
      expect(result.blocking.some((b) => b.code === 'DEPOSIT_AMOUNT_REQUIRED')).toBe(false);
    });

    it('should warn when deposit_taken is false but deposit_amount > 0', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          deposit_taken: false,
          deposit_amount: 1500,
        },
      });

      expect(result.warnings.some((w) => w.code === 'DEPOSIT_INCONSISTENCY')).toBe(true);
    });

    it('should block when deposit_amount > 0 but deposit_protected is missing', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          deposit_taken: true,
          deposit_amount: 1500,
          // deposit_protected is missing
        },
      });

      expect(result.blocking.some((b) => b.code === 'DEPOSIT_PROTECTION_STATUS_REQUIRED')).toBe(
        true
      );
    });
  });

  describe('Gate 3: Section 21 Route Blockers', () => {
    it('should block Section 21 when deposit is not protected', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_21',
          deposit_taken: true,
          deposit_amount: 1500,
          deposit_protected: false,
        },
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      expect(result.blocking.some((b) => b.code === 'SECTION_21_DEPOSIT_NOT_PROTECTED')).toBe(
        true
      );
    });

    it('should block Section 21 when prescribed info not given', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_21',
          deposit_taken: true,
          deposit_amount: 1500,
          deposit_protected: true,
          prescribed_info_given: false,
        },
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      expect(
        result.blocking.some((b) => b.code === 'SECTION_21_PRESCRIBED_INFO_NOT_GIVEN')
      ).toBe(true);
    });

    it('should block Section 21 when gas cert not provided', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_21',
          has_gas_appliances: true,
          gas_certificate_provided: false,
        },
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      expect(result.blocking.some((b) => b.code === 'SECTION_21_GAS_CERT_MISSING')).toBe(true);
    });

    it('should block Section 21 when EPC not provided', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_21',
          epc_provided: false,
        },
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      expect(result.blocking.some((b) => b.code === 'SECTION_21_EPC_MISSING')).toBe(true);
    });

    it('should block Section 21 for unlicensed property', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_21',
          property_licensing_status: 'unlicensed',
        },
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      expect(result.blocking.some((b) => b.code === 'SECTION_21_UNLICENSED_PROPERTY')).toBe(true);
    });

    it('should allow Section 21 when all compliance requirements met', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_21',
          deposit_taken: true,
          deposit_amount: 1500,
          deposit_protected: true,
          prescribed_info_given: true,
          has_gas_appliances: true,
          gas_certificate_provided: true,
          epc_provided: true,
          property_licensing_status: 'not_required',
        },
      });

      expect(result.blocking).toHaveLength(0);
    });

    it('should allow Section 21 when no deposit was taken', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_21',
          deposit_taken: false,
          has_gas_appliances: true,
          gas_certificate_provided: true,
          epc_provided: true,
          property_licensing_status: 'not_required',
        },
      });

      expect(result.blocking).toHaveLength(0);
    });
  });

  describe('Gate 4: Ground Particulars Completeness', () => {
    it('should block when ground particulars are missing for selected grounds', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8 - Serious rent arrears', 'Ground 11 - Persistent late payment'],
          // No ground_particulars provided
        },
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      expect(result.blocking.some((b) => b.code === 'GROUND_PARTICULARS_INCOMPLETE')).toBe(true);
      expect(result.blocking[0].message).toContain('Ground(s): 8, 11');
    });

    it('should allow when ground particulars are provided (flat format)', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8 - Serious rent arrears'],
          ground_particulars: 'Ground 8: Tenant owes £2,500 in arrears from January 2024 onwards...',
        },
      });

      // Should not block on particulars (but may have other gates like threshold check)
      expect(result.blocking.some((b) => b.code === 'GROUND_PARTICULARS_INCOMPLETE')).toBe(false);
    });

    it('should allow when ground particulars are provided (structured format)', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 8 - Serious rent arrears'],
          ground_particulars: {
            ground_8: {
              summary: 'Tenant owes £2,500 in arrears from January 2024 onwards...',
            },
          },
        },
      });

      expect(result.blocking.some((b) => b.code === 'GROUND_PARTICULARS_INCOMPLETE')).toBe(false);
    });

    it('should warn when only discretionary grounds selected', () => {
      const result = evaluateWizardGate({
        ...baseInput,
        facts: {
          selected_notice_route: 'section_8',
          section8_grounds: ['Ground 10 - Some rent arrears', 'Ground 11 - Persistent late payment'],
          ground_particulars: 'Ground 10 and 11: Tenant has history of late payments...',
        },
      });

      expect(result.warnings.some((w) => w.code === 'SECTION_8_ONLY_DISCRETIONARY')).toBe(true);
    });
  });
});

describe('Wizard Gating - Money Claim', () => {
  const baseInput = {
    case_type: 'money_claim',
    product: 'money_claim' as const,
    jurisdiction: 'england',
  };

  it('should block when claim_amount is missing', () => {
    const result = evaluateWizardGate({
      ...baseInput,
      facts: {
        defendant_name: 'John Smith',
      },
    });

    expect(result.blocking.some((b) => b.code === 'CLAIM_AMOUNT_REQUIRED')).toBe(true);
  });

  it('should block when defendant_name is missing', () => {
    const result = evaluateWizardGate({
      ...baseInput,
      facts: {
        claim_amount: 5000,
      },
    });

    expect(result.blocking.some((b) => b.code === 'DEFENDANT_NAME_REQUIRED')).toBe(true);
  });

  it('should allow when all required fields are present', () => {
    const result = evaluateWizardGate({
      ...baseInput,
      facts: {
        claim_amount: 5000,
        defendant_name: 'John Smith',
      },
    });

    expect(result.blocking).toHaveLength(0);
  });
});

describe('Wizard Gating - Tenancy Agreement', () => {
  const baseInput = {
    case_type: 'tenancy_agreement',
    product: 'tenancy_agreement' as const,
    jurisdiction: 'england',
  };

  it('should block when deposit_taken is true but deposit_amount is missing', () => {
    const result = evaluateWizardGate({
      ...baseInput,
      facts: {
        deposit_taken: true,
      },
    });

    expect(result.blocking.some((b) => b.code === 'DEPOSIT_AMOUNT_REQUIRED')).toBe(true);
  });

  it('should allow when deposit_taken is true and deposit_amount is provided', () => {
    const result = evaluateWizardGate({
      ...baseInput,
      facts: {
        deposit_taken: true,
        deposit_amount: 1500,
      },
    });

    expect(result.blocking).toHaveLength(0);
  });

  it('should allow when deposit_taken is false', () => {
    const result = evaluateWizardGate({
      ...baseInput,
      facts: {
        deposit_taken: false,
      },
    });

    expect(result.blocking).toHaveLength(0);
  });
});
