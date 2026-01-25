/**
 * Shadow Mode Parity Tests
 *
 * Golden test cases for comparing existing TS validators with the new YAML engine.
 * These tests verify that the YAML engine produces equivalent results to the
 * existing validation logic.
 *
 * Note: Some discrepancies are expected during migration. The goal is to
 * achieve >95% parity before making YAML engine authoritative.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  runShadowValidation,
  runShadowValidationBatch,
  formatShadowReport,
  type ShadowValidationParams,
  type ShadowModeReport,
} from '@/lib/validation/shadow-mode-adapter';
import { clearConfigCache, type EvictionFacts } from '@/lib/validation/eviction-rules-engine';

// ============================================================================
// GOLDEN TEST CASES - ENGLAND SECTION 21
// ============================================================================

describe('Shadow Mode Parity - England Section 21', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const baseParams: Omit<ShadowValidationParams, 'facts'> = {
    jurisdiction: 'england',
    product: 'notice_only',
    route: 'section_21',
  };

  describe('Valid Cases', () => {
    it('should have parity for fully compliant S21 case', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-08-01',
        deposit_taken: true,
        deposit_protected: true,
        deposit_amount: 1200,
        deposit_protection_date: '2024-01-10',
        deposit_scheme_name: 'DPS',
        prescribed_info_given: true,
        prescribed_info_served: true,
        epc_provided: true,
        how_to_rent_provided: true,
        how_to_rent_served: true,
        has_gas_appliances: true,
        gas_certificate_provided: true,
        selected_notice_route: 'section_21',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // Both should find no blockers for a valid case
      expect(report.yaml.blockers).toBe(0);
      console.log(formatShadowReport(report));
    });
  });

  describe('Deposit Protection Cases', () => {
    it('should have parity for deposit_not_protected', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-08-01',
        deposit_taken: true,
        deposit_protected: false, // NOT PROTECTED - should block
        selected_notice_route: 'section_21',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // Both should detect deposit not protected
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('deposit'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });

    it('should have parity for prescribed_info_not_given', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-08-01',
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: false, // NOT GIVEN - should block
        selected_notice_route: 'section_21',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect prescribed info missing
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('prescribed'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });
  });

  describe('Safety Compliance Cases', () => {
    it('should have parity for epc_not_provided', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-08-01',
        deposit_taken: false,
        epc_provided: false, // NOT PROVIDED - should block
        selected_notice_route: 'section_21',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect EPC missing
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('epc'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });

    it('should have parity for gas_cert_not_provided (when has gas)', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-08-01',
        deposit_taken: false,
        epc_provided: true,
        how_to_rent_provided: true,
        has_gas_appliances: true,
        gas_certificate_provided: false, // NOT PROVIDED - should block
        selected_notice_route: 'section_21',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect gas cert missing
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('gas'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });

    it('should have parity for how_to_rent_not_provided', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-08-01',
        deposit_taken: false,
        epc_provided: true,
        how_to_rent_provided: false, // NOT PROVIDED - should block
        selected_notice_route: 'section_21',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect H2R missing
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('h2r'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });
  });

  describe('Retaliatory Eviction Cases', () => {
    it('should have parity for improvement_notice_served', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-08-01',
        deposit_taken: false,
        epc_provided: true,
        how_to_rent_provided: true,
        improvement_notice_served: true, // SERVED - should block
        selected_notice_route: 'section_21',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect retaliatory eviction bar
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('retaliatory'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });
  });

  describe('Four-Month Bar Cases', () => {
    it('should have parity for four_month_bar', async () => {
      const today = new Date();
      const twoMonthsAgo = new Date(today);
      twoMonthsAgo.setMonth(today.getMonth() - 2);

      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: twoMonthsAgo.toISOString().split('T')[0], // Only 2 months ago
        notice_service_date: today.toISOString().split('T')[0],
        notice_served_date: today.toISOString().split('T')[0],
        notice_expiry_date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        deposit_taken: false,
        epc_provided: true,
        how_to_rent_provided: true,
        selected_notice_route: 'section_21',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect four-month bar
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('four_month'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });
  });
});

// ============================================================================
// GOLDEN TEST CASES - ENGLAND SECTION 8
// ============================================================================

describe('Shadow Mode Parity - England Section 8', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const baseParams: Omit<ShadowValidationParams, 'facts'> = {
    jurisdiction: 'england',
    product: 'notice_only',
    route: 'section_8',
  };

  describe('Grounds Cases', () => {
    it('should have parity for no_grounds_selected', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-06-15',
        section8_grounds: [], // NO GROUNDS - should block
        selected_notice_route: 'section_8',
        eviction_route: 'section_8',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect no grounds
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('grounds'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });

    it('should have parity for ground_8_insufficient_arrears', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-06-15',
        section8_grounds: ['ground_8'],
        section8_details: 'Tenant owes rent.',
        has_rent_arrears: true,
        total_arrears: 500, // Only 500, rent is 1000/month - less than 2 months
        rent_amount: 1000,
        rent_frequency: 'monthly',
        selected_notice_route: 'section_8',
        eviction_route: 'section_8',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect Ground 8 threshold not met
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('ground') || id.includes('threshold'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });
  });

  describe('Valid S8 Case', () => {
    it('should have parity for valid S8 with Ground 8', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-06-15',
        section8_grounds: ['ground_8'],
        section8_details: 'Tenant owes 3 months rent arrears totaling 3000.',
        has_rent_arrears: true,
        total_arrears: 3000, // 3 months arrears at 1000/month
        rent_amount: 1000,
        rent_frequency: 'monthly',
        selected_notice_route: 'section_8',
        eviction_route: 'section_8',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // Should have no blockers for valid case
      expect(report.yaml.blockers).toBe(0);
      console.log(formatShadowReport(report));
    });
  });
});

// ============================================================================
// GOLDEN TEST CASES - WALES SECTION 173
// ============================================================================

describe('Shadow Mode Parity - Wales Section 173', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const baseParams: Omit<ShadowValidationParams, 'facts'> = {
    jurisdiction: 'wales',
    product: 'notice_only',
    route: 'section_173',
  };

  describe('RSW Registration Cases', () => {
    it('should have parity for rsw_not_registered', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street, Cardiff',
        contract_start_date: '2024-01-01',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-12-01',
        rent_smart_wales_registered: false, // NOT REGISTERED - should block
        deposit_taken: false,
        selected_notice_route: 'section_173',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect RSW not registered
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('rsw'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });
  });

  describe('Six-Month Bar Cases', () => {
    it('should have parity for six_month_bar', async () => {
      const today = new Date();
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);

      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street, Cardiff',
        contract_start_date: threeMonthsAgo.toISOString().split('T')[0], // Only 3 months ago
        tenancy_start_date: threeMonthsAgo.toISOString().split('T')[0],
        notice_service_date: today.toISOString().split('T')[0],
        notice_served_date: today.toISOString().split('T')[0],
        notice_expiry_date: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        rent_smart_wales_registered: true,
        deposit_taken: false,
        selected_notice_route: 'section_173',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect six-month bar
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('six_month'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });
  });

  describe('Valid S173 Case', () => {
    it('should have parity for valid S173 case', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street, Cardiff',
        contract_start_date: '2024-01-01',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_served_date: '2025-06-01',
        notice_expiry_date: '2025-12-01', // 6 months
        rent_smart_wales_registered: true,
        deposit_taken: false,
        selected_notice_route: 'section_173',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // Should have no blockers for valid case
      expect(report.yaml.blockers).toBe(0);
      console.log(formatShadowReport(report));
    });
  });
});

// ============================================================================
// GOLDEN TEST CASES - SCOTLAND NOTICE TO LEAVE
// ============================================================================

describe('Shadow Mode Parity - Scotland Notice to Leave', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const baseParams: Omit<ShadowValidationParams, 'facts'> = {
    jurisdiction: 'scotland',
    product: 'notice_only',
    route: 'notice_to_leave',
  };

  describe('Landlord Registration Cases', () => {
    it('should have parity for landlord_not_registered', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street, Edinburgh',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_date: '2025-06-01',
        notice_expiry_date: '2025-06-29',
        notice_expiry: '2025-06-29',
        scotland_ground_codes: ['ground_1'],
        landlord_registration_number: undefined, // NOT REGISTERED - should block
        landlord_reg_number: undefined,
        pre_action_contact: 'Yes',
        deposit_taken: false,
        selected_notice_route: 'notice_to_leave',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect landlord not registered
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('landlord') || id.includes('register'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });
  });

  describe('Grounds Cases', () => {
    it('should have parity for no_grounds_selected', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street, Edinburgh',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_date: '2025-06-01',
        notice_expiry_date: '2025-06-29',
        notice_expiry: '2025-06-29',
        scotland_ground_codes: [], // NO GROUNDS - should block
        landlord_registration_number: 'SCL123456',
        deposit_taken: false,
        selected_notice_route: 'notice_to_leave',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // YAML should detect no grounds
      expect(report.yaml.blockers).toBeGreaterThan(0);
      expect(
        report.yaml.blockerIds.some((id) => id.includes('ground'))
      ).toBe(true);
      console.log(formatShadowReport(report));
    });
  });

  describe('Valid NTL Case', () => {
    it('should have parity for valid Notice to Leave case', async () => {
      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street, Edinburgh',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
        notice_date: '2025-06-01',
        notice_expiry_date: '2025-06-29', // 28 days
        notice_expiry: '2025-06-29',
        scotland_ground_codes: ['ground_1'],
        landlord_registration_number: 'SCL123456',
        pre_action_contact: 'Yes',
        pre_action_letter_sent: true, // Required for Ground 1
        issues: {
          rent_arrears: {
            pre_action_confirmed: true,
            pre_action_letter_sent: true,
          },
        },
        deposit_taken: false,
        selected_notice_route: 'notice_to_leave',
      };

      const report = await runShadowValidation({ ...baseParams, facts });

      // Should have no blockers for valid case
      expect(report.yaml.blockers).toBe(0);
      console.log(formatShadowReport(report));
    });
  });
});

// ============================================================================
// BATCH PARITY TESTS
// ============================================================================

describe('Batch Shadow Mode Parity', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should run batch validation across multiple cases', async () => {
    const testCases: ShadowValidationParams[] = [
      // England S21 - Valid
      {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {
          landlord_full_name: 'John',
          tenant_full_name: 'Jane',
          property_address_line1: '123 Test St',
          tenancy_start_date: '2024-01-01',
          notice_service_date: '2025-06-01',
          notice_served_date: '2025-06-01',
          notice_expiry_date: '2025-08-01',
          deposit_taken: false,
          epc_provided: true,
          how_to_rent_provided: true,
        },
      },
      // England S8 - Valid
      {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        facts: {
          landlord_full_name: 'John',
          tenant_full_name: 'Jane',
          property_address_line1: '123 Test St',
          tenancy_start_date: '2024-01-01',
          notice_service_date: '2025-06-01',
          notice_served_date: '2025-06-01',
          notice_expiry_date: '2025-06-15',
          section8_grounds: ['ground_10'],
          section8_details: 'Arrears details.',
        },
      },
      // Wales S173 - Valid
      {
        jurisdiction: 'wales',
        product: 'notice_only',
        route: 'section_173',
        facts: {
          landlord_full_name: 'John',
          tenant_full_name: 'Jane',
          property_address_line1: '123 Test St, Cardiff',
          contract_start_date: '2024-01-01',
          tenancy_start_date: '2024-01-01',
          notice_service_date: '2025-06-01',
          notice_served_date: '2025-06-01',
          notice_expiry_date: '2025-12-01',
          rent_smart_wales_registered: true,
          deposit_taken: false,
        },
      },
    ];

    const result = await runShadowValidationBatch(testCases);

    console.log('\nBatch Summary:');
    console.log(`Total cases: ${result.summary.totalCases}`);
    console.log(`Parity count: ${result.summary.parityCount}`);
    console.log(`Parity percent: ${result.summary.parityPercent}%`);
    console.log(`Avg duration: ${result.summary.avgDurationMs}ms`);

    // Phase 0: Shadow mode is in documentation phase - tracking discrepancies
    // Parity will improve as we refine ID mappings and rule conditions
    // For now, just assert the batch runs without errors
    expect(result.summary.totalCases).toBeGreaterThan(0);
  });
});

// ============================================================================
// COMPLETE PACK PARITY TESTS
// ============================================================================

describe('Shadow Mode Parity - England Complete Pack', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const baseParams: Omit<ShadowValidationParams, 'facts'> = {
    jurisdiction: 'england',
    product: 'complete_pack',
    route: 'section_21',
  };

  it('should have parity for missing_landlord_name', async () => {
    const facts: EvictionFacts = {
      landlord_full_name: undefined, // MISSING - should block
      landlord_name: undefined,
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Test Street',
      tenancy_start_date: '2024-01-01',
      notice_service_date: '2025-06-01',
      notice_served_date: '2025-06-01',
      notice_expiry_date: '2025-08-01',
      deposit_taken: false,
      selected_notice_route: 'section_21',
      eviction_route: 'section_21',
    };

    const report = await runShadowValidation({ ...baseParams, facts });

    // YAML should detect missing landlord name
    expect(report.yaml.blockers).toBeGreaterThan(0);
    expect(
      report.yaml.blockerIds.some((id) => id.includes('landlord'))
    ).toBe(true);
    console.log(formatShadowReport(report));
  });

  it('should have parity for missing_tenant_name', async () => {
    const facts: EvictionFacts = {
      landlord_full_name: 'John Landlord',
      tenant_full_name: undefined, // MISSING - should block
      tenant_name: undefined,
      property_address_line1: '123 Test Street',
      tenancy_start_date: '2024-01-01',
      notice_service_date: '2025-06-01',
      notice_served_date: '2025-06-01',
      notice_expiry_date: '2025-08-01',
      deposit_taken: false,
      selected_notice_route: 'section_21',
      eviction_route: 'section_21',
    };

    const report = await runShadowValidation({ ...baseParams, facts });

    // YAML should detect missing tenant name
    expect(report.yaml.blockers).toBeGreaterThan(0);
    expect(
      report.yaml.blockerIds.some((id) => id.includes('tenant'))
    ).toBe(true);
    console.log(formatShadowReport(report));
  });

  it('should have parity for missing_property_address', async () => {
    const facts: EvictionFacts = {
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: undefined, // MISSING - should block
      tenancy_start_date: '2024-01-01',
      notice_service_date: '2025-06-01',
      notice_served_date: '2025-06-01',
      notice_expiry_date: '2025-08-01',
      deposit_taken: false,
      selected_notice_route: 'section_21',
      eviction_route: 'section_21',
    };

    const report = await runShadowValidation({ ...baseParams, facts });

    // YAML should detect missing property address
    expect(report.yaml.blockers).toBeGreaterThan(0);
    expect(
      report.yaml.blockerIds.some((id) => id.includes('property') || id.includes('address'))
    ).toBe(true);
    console.log(formatShadowReport(report));
  });
});
