/**
 * Parity Contract Tests
 *
 * These tests enforce the parity contract defined in docs/validation/PARITY_CONTRACT.md
 * They act as CI gates to prevent unintentional changes to the validation system.
 *
 * IMPORTANT: If these tests fail, you must:
 * 1. Update the PARITY_CONTRACT.md with the new rule counts
 * 2. Add an explicit acknowledgment in your commit message
 * 3. Ensure all parity tests still pass
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadRulesConfig,
  getAllRules,
  clearConfigCache,
} from '@/lib/validation/eviction-rules-engine';
import {
  runShadowValidation,
  type ShadowValidationParams,
} from '@/lib/validation/shadow-mode-adapter';

// =============================================================================
// RULE COUNT CONTRACT
// =============================================================================
// These counts are defined in PARITY_CONTRACT.md
// Update both this file AND the contract if counts change

const RULE_COUNT_CONTRACT = {
  england: {
    notice_only: { min: 25, description: 'Full S21 + S8 coverage' },
    complete_pack: { min: 20, description: 'Subset of notice_only rules' },
  },
  wales: {
    notice_only: { min: 15, description: 'S173 + fault-based' },
  },
  scotland: {
    notice_only: { min: 10, description: 'NTL only' },
  },
} as const;

describe('Parity Contract - Rule Counts', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  describe('England', () => {
    it('notice_only should have at least 25 rules (per PARITY_CONTRACT.md)', () => {
      const config = loadRulesConfig('england', 'notice_only');
      const rules = getAllRules(config);

      expect(rules.length).toBeGreaterThanOrEqual(
        RULE_COUNT_CONTRACT.england.notice_only.min
      );

      // Log actual count for visibility
      console.log(
        `[Contract] England notice_only: ${rules.length} rules (min: ${RULE_COUNT_CONTRACT.england.notice_only.min})`
      );
    });

    it('complete_pack should have at least 20 rules (per PARITY_CONTRACT.md)', () => {
      const config = loadRulesConfig('england', 'complete_pack');
      const rules = getAllRules(config);

      expect(rules.length).toBeGreaterThanOrEqual(
        RULE_COUNT_CONTRACT.england.complete_pack.min
      );

      console.log(
        `[Contract] England complete_pack: ${rules.length} rules (min: ${RULE_COUNT_CONTRACT.england.complete_pack.min})`
      );
    });
  });

  describe('Wales', () => {
    it('notice_only should have at least 15 rules (per PARITY_CONTRACT.md)', () => {
      const config = loadRulesConfig('wales', 'notice_only');
      const rules = getAllRules(config);

      expect(rules.length).toBeGreaterThanOrEqual(
        RULE_COUNT_CONTRACT.wales.notice_only.min
      );

      console.log(
        `[Contract] Wales notice_only: ${rules.length} rules (min: ${RULE_COUNT_CONTRACT.wales.notice_only.min})`
      );
    });
  });

  describe('Scotland', () => {
    it('notice_only should have at least 10 rules (per PARITY_CONTRACT.md)', () => {
      const config = loadRulesConfig('scotland', 'notice_only');
      const rules = getAllRules(config);

      expect(rules.length).toBeGreaterThanOrEqual(
        RULE_COUNT_CONTRACT.scotland.notice_only.min
      );

      console.log(
        `[Contract] Scotland notice_only: ${rules.length} rules (min: ${RULE_COUNT_CONTRACT.scotland.notice_only.min})`
      );
    });
  });
});

// =============================================================================
// PARITY THRESHOLD CONTRACT
// =============================================================================

describe('Parity Contract - Thresholds', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  // Helper to run a valid case and check parity
  async function checkValidCaseParity(
    params: Omit<ShadowValidationParams, 'facts'>,
    facts: Record<string, any>
  ): Promise<{ parity: boolean; tsBlockers: number; yamlBlockers: number }> {
    const report = await runShadowValidation({ ...params, facts });
    return {
      parity: report.parity,
      tsBlockers: report.ts.blockers,
      yamlBlockers: report.yaml.blockers,
    };
  }

  describe('England - 100% parity required', () => {
    it('S21 notice_only valid case should have parity', async () => {
      const result = await checkValidCaseParity(
        { jurisdiction: 'england', product: 'notice_only', route: 'section_21' },
        {
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
          property_licensing_status: 'licensed',
          licensing_required: 'not_required',
          selected_notice_route: 'section_21',
        }
      );

      expect(result.parity).toBe(true);
      expect(result.tsBlockers).toBe(0);
      expect(result.yamlBlockers).toBe(0);
    });

    it('S8 notice_only valid case should have parity', async () => {
      const result = await checkValidCaseParity(
        { jurisdiction: 'england', product: 'notice_only', route: 'section_8' },
        {
          landlord_full_name: 'John Landlord',
          tenant_full_name: 'Jane Tenant',
          property_address_line1: '123 Test Street',
          tenancy_start_date: '2020-01-01',
          notice_service_date: '2025-06-01',
          notice_expiry_date: '2025-06-15',
          section8_grounds: ['ground_8'],
          has_rent_arrears: true,
          total_arrears: 5000,
          selected_notice_route: 'section_8',
        }
      );

      expect(result.parity).toBe(true);
      expect(result.tsBlockers).toBe(0);
      expect(result.yamlBlockers).toBe(0);
    });

    it('complete_pack S21 valid case should have parity', async () => {
      const result = await checkValidCaseParity(
        { jurisdiction: 'england', product: 'complete_pack', route: 'section_21' },
        {
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
          prescribed_info_served: true,
          epc_provided: true,
          how_to_rent_served: true,
          has_gas_appliances: false,
          selected_notice_route: 'section_21',
        }
      );

      expect(result.parity).toBe(true);
      expect(result.tsBlockers).toBe(0);
      expect(result.yamlBlockers).toBe(0);
    });
  });

  describe('Wales - 100% parity required (with granular exception)', () => {
    it('S173 notice_only valid case should have parity', async () => {
      const result = await checkValidCaseParity(
        { jurisdiction: 'wales', product: 'notice_only', route: 'section_173' },
        {
          landlord_full_name: 'John Landlord',
          tenant_full_name: 'Jane Tenant',
          property_address_line1: '123 Test Street, Cardiff',
          tenancy_start_date: '2024-01-01',
          contract_start_date: '2024-01-01',
          notice_service_date: '2025-08-01',
          notice_expiry_date: '2026-02-01',
          rent_smart_wales_registered: true,
          deposit_taken: false,
          selected_notice_route: 'section_173',
        }
      );

      expect(result.parity).toBe(true);
      expect(result.tsBlockers).toBe(0);
      expect(result.yamlBlockers).toBe(0);
    });
  });

  describe('Scotland - 100% parity required', () => {
    it('NTL notice_only valid case should have parity', async () => {
      const result = await checkValidCaseParity(
        { jurisdiction: 'scotland', product: 'notice_only', route: 'notice_to_leave' },
        {
          landlord_full_name: 'John Landlord',
          tenant_full_name: 'Jane Tenant',
          property_address_line1: '123 Test Street, Edinburgh',
          tenancy_start_date: '2024-01-01',
          notice_service_date: '2025-06-01',
          notice_date: '2025-06-01',
          notice_expiry_date: '2025-08-25',
          notice_expiry: '2025-08-25',
          scotland_ground_codes: [12],
          deposit_taken: false,
          selected_notice_route: 'notice_to_leave',
        }
      );

      expect(result.parity).toBe(true);
      expect(result.tsBlockers).toBe(0);
      expect(result.yamlBlockers).toBe(0);
    });
  });
});

// =============================================================================
// CRITICAL RULE COVERAGE CONTRACT
// =============================================================================
// These are the most important rules that MUST exist

describe('Parity Contract - Critical Rules Exist', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const CRITICAL_RULES = {
    england: {
      notice_only: [
        's21_deposit_noncompliant',
        's21_epc',
        's21_h2r',
        's8_grounds_required',
      ],
      complete_pack: [
        's21_deposit_not_protected',
        's21_prescribed_info_missing',
        's8_no_grounds',
        's8_no_particulars',
        'missing_landlord_name',
        'missing_tenant_name',
      ],
    },
    wales: {
      notice_only: [
        's173_licensing',
        's173_period_bar',
      ],
    },
    scotland: {
      notice_only: [
        'ntl_ground_required',
        'ntl_pre_action',
      ],
    },
  } as const;

  describe('England notice_only critical rules', () => {
    it('should contain all critical S21 rules', () => {
      const config = loadRulesConfig('england', 'notice_only');
      const rules = getAllRules(config);
      const ruleIds = rules.map((r) => r.id);

      for (const criticalRule of CRITICAL_RULES.england.notice_only) {
        expect(ruleIds).toContain(criticalRule);
      }
    });
  });

  describe('England complete_pack critical rules', () => {
    it('should contain all critical rules', () => {
      const config = loadRulesConfig('england', 'complete_pack');
      const rules = getAllRules(config);
      const ruleIds = rules.map((r) => r.id);

      for (const criticalRule of CRITICAL_RULES.england.complete_pack) {
        expect(ruleIds).toContain(criticalRule);
      }
    });
  });

  describe('Wales notice_only critical rules', () => {
    it('should contain all critical S173 rules', () => {
      const config = loadRulesConfig('wales', 'notice_only');
      const rules = getAllRules(config);
      const ruleIds = rules.map((r) => r.id);

      for (const criticalRule of CRITICAL_RULES.wales.notice_only) {
        expect(ruleIds).toContain(criticalRule);
      }
    });
  });

  describe('Scotland notice_only critical rules', () => {
    it('should contain all critical NTL rules', () => {
      const config = loadRulesConfig('scotland', 'notice_only');
      const rules = getAllRules(config);
      const ruleIds = rules.map((r) => r.id);

      for (const criticalRule of CRITICAL_RULES.scotland.notice_only) {
        expect(ruleIds).toContain(criticalRule);
      }
    });
  });
});
