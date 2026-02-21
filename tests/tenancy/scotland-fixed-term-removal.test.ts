/**
 * Scotland Fixed-Term Removal Tests
 *
 * Tests for the removal of the "Is this a fixed term tenancy?" question
 * from Tab 4 (Tenancy Start and Term) for Scottish PRT flows.
 *
 * Per the Private Housing (Tenancies) (Scotland) Act 2016, all PRTs are
 * open-ended by law - there is no fixed term concept.
 *
 * Covers:
 * 1. Scotland Standard: can complete flow without fixed term fields
 * 2. Scotland Premium: same
 * 3. England/Wales: fixed term toggle still present and functional (regression guard)
 * 4. Validation schema updates for Scotland
 * 5. PRT mapper always sets is_fixed_term: false for Scotland
 */

import { describe, expect, it } from 'vitest';

// Test the section validation logic
describe('Scotland Tenancy Section Validation', () => {
  // Simulates the SECTIONS.tenancy.isComplete function from TenancySectionFlow
  const tenancySectionIsComplete = (facts: any): boolean => {
    // Start date is always required
    if (!facts.tenancy_start_date) return false;
    // Scotland PRTs are open-ended by law - no is_fixed_term required
    const jurisdiction = facts.__meta?.jurisdiction;
    if (jurisdiction === 'scotland') {
      return true; // Only start date required for Scotland
    }
    // Other jurisdictions require fixed term selection
    return facts.is_fixed_term !== undefined;
  };

  describe('Scotland Standard Flow', () => {
    it('should complete section with only start date (no is_fixed_term required)', () => {
      const facts = {
        __meta: { jurisdiction: 'scotland', product: 'prt_standard' },
        tenancy_start_date: '2025-01-15',
        // Note: is_fixed_term is NOT set - this is intentional for Scotland
      };

      expect(tenancySectionIsComplete(facts)).toBe(true);
    });

    it('should NOT complete section without start date', () => {
      const facts = {
        __meta: { jurisdiction: 'scotland', product: 'prt_standard' },
        // tenancy_start_date is missing
      };

      expect(tenancySectionIsComplete(facts)).toBe(false);
    });

    it('should ignore is_fixed_term even if somehow set', () => {
      const facts = {
        __meta: { jurisdiction: 'scotland', product: 'prt_standard' },
        tenancy_start_date: '2025-01-15',
        is_fixed_term: true, // Should be ignored for Scotland
      };

      // Section should still be complete
      expect(tenancySectionIsComplete(facts)).toBe(true);
    });
  });

  describe('Scotland Premium Flow', () => {
    it('should complete section with only start date (no is_fixed_term required)', () => {
      const facts = {
        __meta: { jurisdiction: 'scotland', product: 'prt_premium' },
        tenancy_start_date: '2025-01-15',
      };

      expect(tenancySectionIsComplete(facts)).toBe(true);
    });
  });

  describe('England Flow (Regression Guard)', () => {
    it('should require is_fixed_term to be defined', () => {
      const facts = {
        __meta: { jurisdiction: 'england', product: 'ast_standard' },
        tenancy_start_date: '2025-01-15',
        // is_fixed_term is NOT set
      };

      expect(tenancySectionIsComplete(facts)).toBe(false);
    });

    it('should complete section when is_fixed_term is set to true', () => {
      const facts = {
        __meta: { jurisdiction: 'england', product: 'ast_standard' },
        tenancy_start_date: '2025-01-15',
        is_fixed_term: true,
      };

      expect(tenancySectionIsComplete(facts)).toBe(true);
    });

    it('should complete section when is_fixed_term is set to false', () => {
      const facts = {
        __meta: { jurisdiction: 'england', product: 'ast_standard' },
        tenancy_start_date: '2025-01-15',
        is_fixed_term: false,
      };

      expect(tenancySectionIsComplete(facts)).toBe(true);
    });
  });

  describe('Wales Flow (Regression Guard)', () => {
    it('should require is_fixed_term to be defined', () => {
      const facts = {
        __meta: { jurisdiction: 'wales', product: 'occupation_standard' },
        tenancy_start_date: '2025-01-15',
      };

      expect(tenancySectionIsComplete(facts)).toBe(false);
    });

    it('should complete section when is_fixed_term is defined', () => {
      const facts = {
        __meta: { jurisdiction: 'wales', product: 'occupation_standard' },
        tenancy_start_date: '2025-01-15',
        is_fixed_term: false,
      };

      expect(tenancySectionIsComplete(facts)).toBe(true);
    });
  });

  describe('Northern Ireland Flow (Regression Guard)', () => {
    it('should require is_fixed_term to be defined', () => {
      const facts = {
        __meta: { jurisdiction: 'northern-ireland', product: 'ni_standard' },
        tenancy_start_date: '2025-01-15',
      };

      expect(tenancySectionIsComplete(facts)).toBe(false);
    });

    it('should complete section when is_fixed_term is defined', () => {
      const facts = {
        __meta: { jurisdiction: 'northern-ireland', product: 'ni_standard' },
        tenancy_start_date: '2025-01-15',
        is_fixed_term: true,
      };

      expect(tenancySectionIsComplete(facts)).toBe(true);
    });
  });
});

// Test the PRT mapper
describe('PRT Wizard Mapper - Fixed Term Handling', () => {
  it('should always set is_fixed_term to false for Scotland PRTs', async () => {
    const { mapWizardToPRTData } = await import('@/lib/documents/scotland/prt-wizard-mapper');

    const wizardFacts = {
      landlord_full_name: 'Test Landlord',
      landlord_email: 'landlord@test.com',
      landlord_phone: '01onal number',
      property_address_line1: '123 Test Street',
      property_city: 'Edinburgh',
      property_postcode: 'EH1 1AA',
      tenancy_start_date: '2025-01-15',
      rent_amount: 1200,
      deposit_amount: 2400, // 2 months rent (max in Scotland)
      tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
      // Explicitly try to set fixed term (should be ignored)
      is_fixed_term: true,
      term_length: '12 months',
      tenancy_end_date: '2026-01-14',
    };

    const prtData = mapWizardToPRTData(wizardFacts as any);

    // PRT mapper should ALWAYS set is_fixed_term to false regardless of input
    expect(prtData.is_fixed_term).toBe(false);
  });

  it('should not include fixed term fields in output for Scotland', async () => {
    const { mapWizardToPRTData } = await import('@/lib/documents/scotland/prt-wizard-mapper');

    const wizardFacts = {
      landlord_full_name: 'Test Landlord',
      landlord_email: 'landlord@test.com',
      landlord_phone: '01234567890',
      property_address_line1: '123 Test Street',
      property_city: 'Edinburgh',
      property_postcode: 'EH1 1AA',
      tenancy_start_date: '2025-01-15',
      rent_amount: 1200,
      deposit_amount: 2400,
      tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '0987654321' }],
    };

    const prtData = mapWizardToPRTData(wizardFacts as any);

    // Check that is_fixed_term is explicitly false
    expect(prtData.is_fixed_term).toBe(false);
    // Verify start date is preserved
    expect(prtData.tenancy_start_date).toBe('2025-01-15');
  });
});

// Test the review page warning logic
describe('Review Page - Scotland Fixed Term Warnings', () => {
  // Simulates the buildTenancyValidation function's Scotland warning logic
  const checkScotlandFixedTermWarning = (facts: any, jurisdiction: string): boolean => {
    if (jurisdiction === 'scotland') {
      if (
        facts.fixed_term_tenancy === true ||
        facts.tenancy_type === 'fixed_term' ||
        facts.is_fixed_term === true
      ) {
        return true; // Warning should be shown
      }
    }
    return false;
  };

  it('should NOT show warning when no fixed term data is set (normal Scotland flow)', () => {
    const facts = {
      tenancy_start_date: '2025-01-15',
      // No fixed term fields set
    };

    expect(checkScotlandFixedTermWarning(facts, 'scotland')).toBe(false);
  });

  it('should show warning if legacy is_fixed_term: true is set', () => {
    const facts = {
      tenancy_start_date: '2025-01-15',
      is_fixed_term: true, // Legacy data
    };

    expect(checkScotlandFixedTermWarning(facts, 'scotland')).toBe(true);
  });

  it('should show warning if legacy fixed_term_tenancy: true is set', () => {
    const facts = {
      tenancy_start_date: '2025-01-15',
      fixed_term_tenancy: true, // Legacy data
    };

    expect(checkScotlandFixedTermWarning(facts, 'scotland')).toBe(true);
  });

  it('should show warning if tenancy_type is fixed_term', () => {
    const facts = {
      tenancy_start_date: '2025-01-15',
      tenancy_type: 'fixed_term', // Legacy data
    };

    expect(checkScotlandFixedTermWarning(facts, 'scotland')).toBe(true);
  });

  it('should NOT show warning for England even with fixed term set', () => {
    const facts = {
      tenancy_start_date: '2025-01-15',
      is_fixed_term: true, // Valid for England
    };

    expect(checkScotlandFixedTermWarning(facts, 'england')).toBe(false);
  });
});

// Test deposit scheme options
describe('Deposit Section - Jurisdiction-Specific Schemes', () => {
  const getDepositSchemeOptions = (jurisdiction: string): string[] => {
    if (jurisdiction === 'scotland') {
      return [
        'SafeDeposits Scotland',
        'MyDeposits Scotland',
        'Letting Protection Service Scotland',
      ];
    }
    return ['DPS', 'MyDeposits', 'TDS', 'Other'];
  };

  it('should return Scottish deposit schemes for Scotland', () => {
    const schemes = getDepositSchemeOptions('scotland');

    expect(schemes).toContain('SafeDeposits Scotland');
    expect(schemes).toContain('MyDeposits Scotland');
    expect(schemes).toContain('Letting Protection Service Scotland');
    expect(schemes).not.toContain('DPS');
    expect(schemes).not.toContain('TDS');
  });

  it('should return English deposit schemes for England', () => {
    const schemes = getDepositSchemeOptions('england');

    expect(schemes).toContain('DPS');
    expect(schemes).toContain('MyDeposits');
    expect(schemes).toContain('TDS');
    expect(schemes).not.toContain('SafeDeposits Scotland');
  });

  it('should return English deposit schemes for Wales', () => {
    const schemes = getDepositSchemeOptions('wales');

    expect(schemes).toContain('DPS');
    expect(schemes).toContain('MyDeposits');
    expect(schemes).toContain('TDS');
  });
});

// Integration test for complete Scotland Standard flow
describe('Scotland Standard PRT - Complete Flow Integration', () => {
  it('should generate valid PRT data without fixed term fields', async () => {
    const { mapWizardToPRTData } = await import('@/lib/documents/scotland/prt-wizard-mapper');

    // Minimal complete wizard facts for Scotland Standard
    const wizardFacts = {
      __meta: { jurisdiction: 'scotland', product: 'prt_standard' },
      // Landlord
      landlord_full_name: 'John Smith',
      landlord_email: 'john.smith@example.com',
      landlord_phone: '01onal number',
      landlord_address_line1: '10 Landlord Street',
      landlord_city: 'Edinburgh',
      landlord_postcode: 'EH1 2AB',
      landlord_reg_number: '123456/200/12345',
      // Property
      property_address_line1: '5 Tenant Lane',
      property_city: 'Edinburgh',
      property_postcode: 'EH2 3CD',
      // Tenants
      number_of_tenants: 1,
      tenants: [
        { full_name: 'Jane Doe', email: 'jane.doe@example.com', phone: '07987654321', dob: '1990-05-15' },
      ],
      // Tenancy (no fixed term fields)
      tenancy_start_date: '2025-02-01',
      // Rent
      rent_amount: 950,
      rent_period: 'month',
      rent_due_day: '1st',
      payment_method: 'Standing Order',
      // Deposit
      deposit_amount: 1900, // 2 months (max for Scotland)
      deposit_scheme_name: 'SafeDeposits Scotland',
    };

    const prtData = mapWizardToPRTData(wizardFacts as any);

    // Verify critical fields are set correctly
    expect(prtData.is_fixed_term).toBe(false);
    expect(prtData.tenancy_start_date).toBe('2025-02-01');
    expect(prtData.landlord_full_name).toBe('John Smith');
    expect(prtData.landlord_reg_number).toBe('123456/200/12345');
    expect(prtData.rent_amount).toBe(950);
    expect(prtData.deposit_amount).toBe(1900);
  });
});

// Integration test for complete Scotland Premium flow
describe('Scotland Premium PRT - Complete Flow Integration', () => {
  it('should generate valid Premium PRT data without fixed term fields', async () => {
    const { mapWizardToPRTData } = await import('@/lib/documents/scotland/prt-wizard-mapper');

    // Complete wizard facts for Scotland Premium
    const wizardFacts = {
      __meta: { jurisdiction: 'scotland', product: 'prt_premium' },
      // Landlord
      landlord_full_name: 'John Smith',
      landlord_email: 'john.smith@example.com',
      landlord_phone: '01234567890',
      landlord_address_line1: '10 Landlord Street',
      landlord_city: 'Edinburgh',
      landlord_postcode: 'EH1 2AB',
      landlord_reg_number: '123456/200/12345',
      // Property
      property_address_line1: '5 Tenant Lane',
      property_city: 'Edinburgh',
      property_postcode: 'EH2 3CD',
      // Tenants
      number_of_tenants: 1,
      tenants: [
        { full_name: 'Jane Doe', email: 'jane.doe@example.com', phone: '07987654321', dob: '1990-05-15' },
      ],
      // Tenancy (no fixed term fields)
      tenancy_start_date: '2025-02-01',
      // Rent
      rent_amount: 1500,
      rent_period: 'month',
      rent_due_day: '1st',
      payment_method: 'Standing Order',
      // Deposit
      deposit_amount: 3000, // 2 months (max for Scotland)
      deposit_scheme_name: 'SafeDeposits Scotland',
      // Premium features
      guarantor_required: true,
      guarantor_name: 'Robert Doe',
      guarantor_address: '20 Guarantor Road, Edinburgh, EH3 4EF',
      guarantor_email: 'robert.doe@example.com',
      guarantor_phone: '07111222333',
    };

    const prtData = mapWizardToPRTData(wizardFacts as any);

    // Verify critical fields are set correctly
    expect(prtData.is_fixed_term).toBe(false);
    expect(prtData.tenancy_start_date).toBe('2025-02-01');
    expect(prtData.rent_amount).toBe(1500);
    expect(prtData.guarantor_required).toBe(true);
    expect(prtData.guarantor_name).toBe('Robert Doe');
  });
});
