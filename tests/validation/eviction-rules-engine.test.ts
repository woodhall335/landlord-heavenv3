/**
 * Eviction Rules Engine Tests
 *
 * Tests for the YAML-based eviction rules engine covering:
 * - Rule loading and schema validation
 * - Allowlist security checks
 * - Condition evaluation
 * - Section grouping
 * - Jurisdiction-specific rules
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  evaluateEvictionRules,
  loadRulesConfig,
  getAllRules,
  getAllRuleIds,
  validateRulesSchema,
  clearConfigCache,
  groupResultsBySection,
  resetPhase13SessionDecision,
  type EvictionFacts,
  type Jurisdiction,
  type Product,
  type EvictionRoute,
} from '@/lib/validation/eviction-rules-engine';
import {
  validateEvictionCondition,
  areAllConditionsValid,
  extractIdentifiers,
  DANGEROUS_PATTERNS,
  isIdentifierAllowed,
} from '@/lib/validation/eviction-rules-allowlist';

// ============================================================================
// YAML SCHEMA VALIDATION TESTS
// ============================================================================

describe('YAML Schema Validation', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  describe('England Notice Only Rules', () => {
    it('should load England notice_only rules without errors', () => {
      const config = loadRulesConfig('england', 'notice_only');
      expect(config).toBeDefined();
      expect(config.jurisdiction).toBe('england');
      expect(config.product).toBe('notice_only');
    });

    it('should have unique rule IDs', () => {
      const config = loadRulesConfig('england', 'notice_only');
      const errors = validateRulesSchema(config);
      const duplicateErrors = errors.filter((e) => e.type === 'duplicate_id');
      expect(duplicateErrors).toEqual([]);
    });

    it('should have valid summary section rule references', () => {
      const config = loadRulesConfig('england', 'notice_only');
      const errors = validateRulesSchema(config);
      const refErrors = errors.filter((e) => e.type === 'missing_rule_reference');
      expect(refErrors).toEqual([]);
    });

    it('should have valid condition strings (pass allowlist)', () => {
      const config = loadRulesConfig('england', 'notice_only');
      const errors = validateRulesSchema(config);
      const conditionErrors = errors.filter((e) => e.type === 'invalid_condition');
      expect(conditionErrors).toEqual([]);
    });

    it('should include Section 21 rules', () => {
      const config = loadRulesConfig('england', 'notice_only');
      expect(config.section_21_rules).toBeDefined();
      expect(config.section_21_rules!.length).toBeGreaterThan(0);
    });

    it('should include Section 8 rules', () => {
      const config = loadRulesConfig('england', 'notice_only');
      expect(config.section_8_rules).toBeDefined();
      expect(config.section_8_rules!.length).toBeGreaterThan(0);
    });
  });

  describe('Wales Notice Only Rules', () => {
    it('should load Wales notice_only rules without errors', () => {
      const config = loadRulesConfig('wales', 'notice_only');
      expect(config).toBeDefined();
      expect(config.jurisdiction).toBe('wales');
      expect(config.product).toBe('notice_only');
    });

    it('should have unique rule IDs', () => {
      const config = loadRulesConfig('wales', 'notice_only');
      const errors = validateRulesSchema(config);
      const duplicateErrors = errors.filter((e) => e.type === 'duplicate_id');
      expect(duplicateErrors).toEqual([]);
    });

    it('should have valid condition strings', () => {
      const config = loadRulesConfig('wales', 'notice_only');
      const errors = validateRulesSchema(config);
      const conditionErrors = errors.filter((e) => e.type === 'invalid_condition');
      expect(conditionErrors).toEqual([]);
    });

    it('should include Section 173 rules', () => {
      const config = loadRulesConfig('wales', 'notice_only');
      expect(config.section_173_rules).toBeDefined();
      expect(config.section_173_rules!.length).toBeGreaterThan(0);
    });

    it('should include fault-based rules', () => {
      const config = loadRulesConfig('wales', 'notice_only');
      expect(config.fault_based_rules).toBeDefined();
      expect(config.fault_based_rules!.length).toBeGreaterThan(0);
    });
  });

  describe('Scotland Notice Only Rules', () => {
    it('should load Scotland notice_only rules without errors', () => {
      const config = loadRulesConfig('scotland', 'notice_only');
      expect(config).toBeDefined();
      expect(config.jurisdiction).toBe('scotland');
      expect(config.product).toBe('notice_only');
    });

    it('should have unique rule IDs', () => {
      const config = loadRulesConfig('scotland', 'notice_only');
      const errors = validateRulesSchema(config);
      const duplicateErrors = errors.filter((e) => e.type === 'duplicate_id');
      expect(duplicateErrors).toEqual([]);
    });

    it('should have valid condition strings', () => {
      const config = loadRulesConfig('scotland', 'notice_only');
      const errors = validateRulesSchema(config);
      const conditionErrors = errors.filter((e) => e.type === 'invalid_condition');
      expect(conditionErrors).toEqual([]);
    });

    it('should include Notice to Leave rules', () => {
      const config = loadRulesConfig('scotland', 'notice_only');
      expect(config.notice_to_leave_rules).toBeDefined();
      expect(config.notice_to_leave_rules!.length).toBeGreaterThan(0);
    });
  });

  describe('England Complete Pack Rules', () => {
    it('should load England complete_pack rules without errors', () => {
      const config = loadRulesConfig('england', 'complete_pack');
      expect(config).toBeDefined();
      expect(config.jurisdiction).toBe('england');
      expect(config.product).toBe('complete_pack');
    });

    it('should have unique rule IDs', () => {
      const config = loadRulesConfig('england', 'complete_pack');
      const errors = validateRulesSchema(config);
      const duplicateErrors = errors.filter((e) => e.type === 'duplicate_id');
      expect(duplicateErrors).toEqual([]);
    });

    it('should have valid condition strings', () => {
      const config = loadRulesConfig('england', 'complete_pack');
      const errors = validateRulesSchema(config);
      const conditionErrors = errors.filter((e) => e.type === 'invalid_condition');
      expect(conditionErrors).toEqual([]);
    });
  });
});

// ============================================================================
// ALLOWLIST SECURITY TESTS
// ============================================================================

describe('Allowlist Security', () => {
  describe('Valid Conditions', () => {
    it('should accept simple property access', () => {
      expect(validateEvictionCondition('facts.deposit_taken === true').valid).toBe(true);
    });

    it('should accept nested property access', () => {
      expect(validateEvictionCondition('facts.tenancy?.rent_amount > 0').valid).toBe(true);
    });

    it('should accept array methods', () => {
      expect(validateEvictionCondition('facts.section8_grounds && facts.section8_grounds.length > 0').valid).toBe(true);
    });

    it('should accept array includes', () => {
      expect(validateEvictionCondition("facts.section8_grounds?.includes('ground_8')").valid).toBe(true);
    });

    it('should accept computed values', () => {
      expect(validateEvictionCondition('computed.within_four_month_bar === true').valid).toBe(true);
    });

    it('should accept Date comparisons', () => {
      expect(validateEvictionCondition('new Date(facts.tenancy_start_date) > new Date()').valid).toBe(true);
    });

    it('should accept Math operations', () => {
      expect(validateEvictionCondition('Math.floor(computed.arrears_months) >= 2').valid).toBe(true);
    });

    it('should accept string literals in quotes', () => {
      expect(validateEvictionCondition("facts.deposit_reduced_to_legal_cap_confirmed !== 'yes'").valid).toBe(true);
    });

    it('should accept Array.isArray check', () => {
      expect(validateEvictionCondition('Array.isArray(facts.section8_grounds)').valid).toBe(true);
    });
  });

  describe('Dangerous Patterns', () => {
    it('should reject eval', () => {
      const result = validateEvictionCondition("eval('malicious code')");
      expect(result.valid).toBe(false);
    });

    it('should reject Function constructor', () => {
      const result = validateEvictionCondition("new Function('return 1')");
      expect(result.valid).toBe(false);
    });

    it('should reject process access', () => {
      const result = validateEvictionCondition('process.env.SECRET');
      expect(result.valid).toBe(false);
    });

    it('should reject require', () => {
      const result = validateEvictionCondition("require('fs')");
      expect(result.valid).toBe(false);
    });

    it('should reject global', () => {
      const result = validateEvictionCondition('global.setTimeout');
      expect(result.valid).toBe(false);
    });

    it('should reject __proto__', () => {
      const result = validateEvictionCondition('facts.__proto__.polluted = true');
      expect(result.valid).toBe(false);
    });

    it('should reject fetch', () => {
      const result = validateEvictionCondition("fetch('http://evil.com')");
      expect(result.valid).toBe(false);
    });

    it('should reject window', () => {
      const result = validateEvictionCondition('window.location.href');
      expect(result.valid).toBe(false);
    });

    it('should reject setTimeout', () => {
      const result = validateEvictionCondition("setTimeout(() => {}, 1000)");
      expect(result.valid).toBe(false);
    });

    it('should reject import', () => {
      const result = validateEvictionCondition("import('fs')");
      expect(result.valid).toBe(false);
    });
  });

  describe('Unknown Identifiers', () => {
    it('should reject unknown identifiers', () => {
      const result = validateEvictionCondition('unknownVariable === true');
      expect(result.valid).toBe(false);
      expect(result.invalidIdentifier).toBe('unknownVariable');
    });

    it('should reject unknown functions', () => {
      const result = validateEvictionCondition('customFunction()');
      expect(result.valid).toBe(false);
    });
  });

  describe('Identifier Extraction', () => {
    it('should extract all identifiers from condition', () => {
      const identifiers = extractIdentifiers('facts.deposit_taken && computed.deposit_exceeds_cap');
      expect(identifiers.has('facts')).toBe(true);
      expect(identifiers.has('deposit_taken')).toBe(true);
      expect(identifiers.has('computed')).toBe(true);
      expect(identifiers.has('deposit_exceeds_cap')).toBe(true);
    });

    it('should not extract string content', () => {
      const identifiers = extractIdentifiers("facts.field === 'not_an_identifier'");
      expect(identifiers.has('not_an_identifier')).toBe(false);
    });
  });
});

// ============================================================================
// ENGLAND SECTION 21 RULE EVALUATION TESTS
// ============================================================================

describe('England Section 21 Rule Evaluation', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const baseValidFacts: EvictionFacts = {
    landlord_full_name: 'John Landlord',
    tenant_full_name: 'Jane Tenant',
    property_address_line1: '123 Test Street',
    tenancy_start_date: '2024-01-01',
    notice_service_date: '2025-06-01',
    notice_expiry_date: '2025-08-01',
    deposit_taken: true,
    deposit_protected: true,
    prescribed_info_given: true,
    epc_provided: true,
    how_to_rent_provided: true,
    has_gas_appliances: true,
    gas_certificate_provided: true,
    // Explicit licensing status for Phase 1 parity
    property_licensing_status: 'licensed',
  };

  describe('Deposit Protection Rules', () => {
    it('should trigger s21_deposit_noncompliant when deposit is not protected', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: true,
        deposit_protected: false,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_deposit_noncompliant')).toBe(true);
    });

    it('should NOT trigger s21_deposit_noncompliant when deposit is protected', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: true,
        deposit_protected: true,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_deposit_noncompliant')).toBe(false);
    });

    it('should NOT trigger deposit rules when no deposit was taken', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: false,
        deposit_protected: false,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id.includes('deposit'))).toBe(false);
    });

    it('should trigger s21_deposit_noncompliant when prescribed info not given', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: false,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_deposit_noncompliant')).toBe(true);
    });
  });

  describe('How to Rent Rule', () => {
    it('should trigger s21_h2r when How to Rent not provided', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        how_to_rent_provided: false,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_h2r')).toBe(true);
    });
  });

  describe('EPC Rule', () => {
    it('should trigger s21_epc when EPC not provided', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        epc_provided: false,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_epc')).toBe(true);
    });
  });

  describe('Gas Safety Rule', () => {
    it('should trigger s21_gas_cert when gas cert not provided (has gas)', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        has_gas_appliances: true,
        gas_certificate_provided: false,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_gas_cert')).toBe(true);
    });

    it('should NOT trigger gas rule when no gas appliances', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        has_gas_appliances: false,
        gas_certificate_provided: false,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_gas_cert')).toBe(false);
    });
  });

  describe('Retaliatory Eviction Rules', () => {
    it('should trigger s21_retaliatory_improvement_notice when improvement notice served', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        improvement_notice_served: true,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_retaliatory_improvement_notice')).toBe(true);
    });
  });

  describe('Four-Month Bar Rule', () => {
    it('should trigger s21_four_month_bar when notice served within 4 months of tenancy start', () => {
      const today = new Date();
      const recentStart = new Date(today);
      recentStart.setMonth(today.getMonth() - 2); // 2 months ago

      const facts: EvictionFacts = {
        ...baseValidFacts,
        tenancy_start_date: recentStart.toISOString().split('T')[0],
        notice_service_date: today.toISOString().split('T')[0],
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_four_month_bar')).toBe(true);
    });

    it('should NOT trigger four-month bar when tenancy is old enough', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2025-06-01',
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_four_month_bar')).toBe(false);
    });
  });

  describe('Valid Case', () => {
    it('should return no blockers for valid Section 21 case', () => {
      const result = evaluateEvictionRules(baseValidFacts, 'england', 'notice_only', 'section_21');

      expect(result.isValid).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });
  });
});

// ============================================================================
// ENGLAND SECTION 8 RULE EVALUATION TESTS
// ============================================================================

describe('England Section 8 Rule Evaluation', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const baseValidFacts: EvictionFacts = {
    landlord_full_name: 'John Landlord',
    tenant_full_name: 'Jane Tenant',
    property_address_line1: '123 Test Street',
    tenancy_start_date: '2024-01-01',
    notice_service_date: '2025-06-01',
    notice_expiry_date: '2025-06-15',
    section8_grounds: ['ground_8'],
    section8_details: 'Detailed particulars of arrears.',
    has_rent_arrears: true,
    total_arrears: 3000,
    rent_amount: 1000,
    rent_frequency: 'monthly',
  };

  describe('Grounds Selection Rule', () => {
    it('should trigger s8_grounds_required when no grounds selected', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        section8_grounds: [],
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_8');

      expect(result.blockers.some((b) => b.id === 's8_grounds_required')).toBe(true);
    });

    it('should NOT trigger when grounds are selected', () => {
      const result = evaluateEvictionRules(baseValidFacts, 'england', 'notice_only', 'section_8');

      expect(result.blockers.some((b) => b.id === 's8_grounds_required')).toBe(false);
    });
  });

  // Note: Ground 8 threshold and particulars rules are commented out in YAML
  // for notice_only parity with TS evaluateNoticeCompliance. These rules
  // are preserved for complete_pack product. Tests updated accordingly.

  describe('Valid S8 Case', () => {
    it('should return no blockers for valid Section 8 with grounds', () => {
      const result = evaluateEvictionRules(baseValidFacts, 'england', 'notice_only', 'section_8');

      expect(result.isValid).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('should allow Ground 8 even with low arrears (TS parity - not validated in notice_only)', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        section8_grounds: ['ground_8'],
        total_arrears: 500, // Less than 2 months - but TS doesn't check this
        rent_amount: 1000,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_8');

      // For notice_only parity, ground 8 threshold is NOT validated
      expect(result.blockers.some((b) => b.id === 's8_ground8_threshold_not_met')).toBe(false);
    });
  });
});

// ============================================================================
// WALES RULES TESTS
// ============================================================================

describe('Wales Section 173 Rule Evaluation', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const baseValidFacts: EvictionFacts = {
    landlord_full_name: 'John Landlord',
    tenant_full_name: 'Jane Tenant',
    property_address_line1: '123 Test Street, Cardiff',
    contract_start_date: '2024-01-01',
    notice_service_date: '2025-06-01',
    notice_expiry_date: '2025-12-01', // 6 months
    rent_smart_wales_registered: true,
    deposit_taken: false,
  };

  describe('RSW Registration Rule', () => {
    it('should trigger s173_licensing when not registered', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        rent_smart_wales_registered: false,
      };

      const result = evaluateEvictionRules(facts, 'wales', 'notice_only', 'section_173');

      expect(result.blockers.some((b) => b.id === 's173_licensing')).toBe(true);
    });
  });

  describe('Six-Month Bar Rule', () => {
    it('should trigger s173_period_bar when notice served within 6 months', () => {
      const today = new Date();
      const recentStart = new Date(today);
      recentStart.setMonth(today.getMonth() - 3); // 3 months ago

      const facts: EvictionFacts = {
        ...baseValidFacts,
        contract_start_date: recentStart.toISOString().split('T')[0],
        notice_service_date: today.toISOString().split('T')[0],
      };

      const result = evaluateEvictionRules(facts, 'wales', 'notice_only', 'section_173');

      expect(result.blockers.some((b) => b.id === 's173_period_bar')).toBe(true);
    });
  });

  describe('Valid Case', () => {
    it('should return no blockers for valid Section 173 case', () => {
      const result = evaluateEvictionRules(baseValidFacts, 'wales', 'notice_only', 'section_173');

      expect(result.isValid).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });
  });
});

// ============================================================================
// SCOTLAND RULES TESTS
// ============================================================================
// NOTE: For notice_only parity, TS only checks:
// - NTL-GROUND-REQUIRED, NTL-MIXED-GROUNDS, NTL-PRE-ACTION, NTL-NOTICE-PERIOD
// Landlord registration, pre-action letter, deposit are NOT checked by TS for notice_only.

describe('Scotland Notice to Leave Rule Evaluation', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  // Base facts for a valid Ground 1 NTL (with pre-action confirmed)
  const baseValidFacts: EvictionFacts = {
    landlord_full_name: 'John Landlord',
    tenant_full_name: 'Jane Tenant',
    property_address_line1: '123 Test Street, Edinburgh',
    tenancy_start_date: '2024-01-01',
    notice_service_date: '2025-06-01',
    notice_expiry_date: '2025-06-29', // 28 days
    scotland_ground_codes: [1], // Numeric format (TS expects numbers)
    issues: {
      rent_arrears: {
        pre_action_confirmed: true,
      },
    },
    deposit_taken: false,
  };

  describe('Ground Selection Rule', () => {
    it('should trigger ntl_ground_required when no grounds selected', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        scotland_ground_codes: [],
      };

      const result = evaluateEvictionRules(facts, 'scotland', 'notice_only', 'notice_to_leave');

      expect(result.blockers.some((b) => b.id === 'ntl_ground_required')).toBe(true);
    });
  });

  describe('Pre-Action Requirements Rule', () => {
    it('should trigger ntl_pre_action for Ground 1 without pre-action confirmed', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        scotland_ground_codes: [1], // Ground 1 - rent arrears
        issues: {
          rent_arrears: {
            pre_action_confirmed: false, // NOT confirmed
          },
        },
      };

      const result = evaluateEvictionRules(facts, 'scotland', 'notice_only', 'notice_to_leave');

      expect(result.blockers.some((b) => b.id === 'ntl_pre_action')).toBe(true);
    });

    it('should NOT trigger ntl_pre_action for Ground 12 (non-arrears)', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        scotland_ground_codes: [12], // Ground 12 - landlord selling
        // No pre-action needed for Ground 12
      };

      const result = evaluateEvictionRules(facts, 'scotland', 'notice_only', 'notice_to_leave');

      expect(result.blockers.some((b) => b.id === 'ntl_pre_action')).toBe(false);
    });
  });

  describe('Valid Case', () => {
    it('should return no blockers for valid Notice to Leave case', () => {
      const result = evaluateEvictionRules(baseValidFacts, 'scotland', 'notice_only', 'notice_to_leave');

      // Should have no blockers for valid case
      expect(result.blockers).toHaveLength(0);
    });
  });
});

// ============================================================================
// SECTION GROUPING TESTS
// ============================================================================

describe('Section Grouping', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('should group results by section from summary config', () => {
    const facts: EvictionFacts = {
      landlord_full_name: 'John',
      tenant_full_name: 'Jane',
      property_address_line1: '123 Test St',
      tenancy_start_date: '2024-01-01',
      notice_service_date: '2025-06-01',
      notice_expiry_date: '2025-08-01',
      deposit_taken: true,
      deposit_protected: false, // Should trigger deposit blocker
      epc_provided: false, // Should trigger EPC blocker
    };

    const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');
    const grouped = groupResultsBySection(result);

    // Should have deposit section with blockers
    expect(grouped['deposit']).toBeDefined();
    expect(grouped['deposit'].blockers.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// RULE COUNT TESTS
// ============================================================================

describe('Rule Counts', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  it('England notice_only should have 25+ rules', () => {
    // Note: Rule count reduced from 40 to 28 after Phase 1-2 consolidation
    // for parity with TS evaluateNoticeCompliance
    const ruleIds = getAllRuleIds('england', 'notice_only');
    expect(ruleIds.length).toBeGreaterThanOrEqual(25);
  });

  it('Wales notice_only should have 15+ rules', () => {
    const ruleIds = getAllRuleIds('wales', 'notice_only');
    expect(ruleIds.length).toBeGreaterThanOrEqual(15);
  });

  it('Scotland notice_only should have 10+ rules', () => {
    const ruleIds = getAllRuleIds('scotland', 'notice_only');
    expect(ruleIds.length).toBeGreaterThanOrEqual(10);
  });

  it('England complete_pack should have 20+ rules', () => {
    // Note: Some rules are commented out for TS parity (Phase 5)
    // The TS runRuleBasedChecks doesn't validate: licensing, four_month_bar, notice_period, deposit_cap
    const ruleIds = getAllRuleIds('england', 'complete_pack');
    expect(ruleIds.length).toBeGreaterThanOrEqual(20);
  });
});

// ============================================================================
// PHASE 13 CORRECTNESS IMPROVEMENTS TESTS
// ============================================================================
// These tests verify that Phase 13 rules are:
// 1. NOT evaluated when VALIDATION_PHASE13_ENABLED is not set (default behavior)
// 2. Evaluated when VALIDATION_PHASE13_ENABLED=true
// 3. Have correct condition logic

import { isPhase13Enabled, getEnabledFeatures, getPhase13RolloutPercent } from '@/lib/validation/eviction-rules-engine';

describe('Phase 13 Feature Flag System', () => {
  const originalEnv = process.env.VALIDATION_PHASE13_ENABLED;

  beforeEach(() => {
    // Reset the session-level Phase 13 decision cache before each test
    resetPhase13SessionDecision();
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv === undefined) {
      delete process.env.VALIDATION_PHASE13_ENABLED;
    } else {
      process.env.VALIDATION_PHASE13_ENABLED = originalEnv;
    }
  });

  describe('isPhase13Enabled', () => {
    it('should return false when env var is not set', () => {
      delete process.env.VALIDATION_PHASE13_ENABLED;
      expect(isPhase13Enabled()).toBe(false);
    });

    it('should return false when env var is set to anything other than "true"', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'false';
      expect(isPhase13Enabled()).toBe(false);

      process.env.VALIDATION_PHASE13_ENABLED = '1';
      expect(isPhase13Enabled()).toBe(false);
    });

    it('should return true when env var is set to "true"', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      expect(isPhase13Enabled()).toBe(true);
    });
  });

  describe('getEnabledFeatures', () => {
    it('should return empty array when Phase 13 is disabled', () => {
      delete process.env.VALIDATION_PHASE13_ENABLED;
      expect(getEnabledFeatures()).toEqual([]);
    });

    it('should include "phase13" when Phase 13 is enabled', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      expect(getEnabledFeatures()).toContain('phase13');
    });
  });
});

// ============================================================================
// PHASE 15: FLAG PRECEDENCE AND ROLLOUT BEHAVIOR TESTS
// ============================================================================
// These tests verify the correctness of Phase 13 feature flag behavior
// for CI validation during full enablement rollout.

describe('Phase 15: Flag Precedence and Rollout Behavior', () => {
  const originalEnabled = process.env.VALIDATION_PHASE13_ENABLED;
  const originalRolloutPercent = process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT;

  beforeEach(() => {
    resetPhase13SessionDecision();
    delete process.env.VALIDATION_PHASE13_ENABLED;
    delete process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT;
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnabled === undefined) {
      delete process.env.VALIDATION_PHASE13_ENABLED;
    } else {
      process.env.VALIDATION_PHASE13_ENABLED = originalEnabled;
    }
    if (originalRolloutPercent === undefined) {
      delete process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT;
    } else {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = originalRolloutPercent;
    }
    resetPhase13SessionDecision();
  });

  describe('VALIDATION_PHASE13_ENABLED=true overrides rollout percent', () => {
    it('should return 100% rollout when VALIDATION_PHASE13_ENABLED=true regardless of rollout percent', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '10';
      expect(getPhase13RolloutPercent()).toBe(100);
    });

    it('should enable Phase 13 when VALIDATION_PHASE13_ENABLED=true even if rollout percent is 0', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '0';
      expect(isPhase13Enabled()).toBe(true);
    });

    it('should enable Phase 13 when VALIDATION_PHASE13_ENABLED=true and no rollout percent set', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      expect(isPhase13Enabled()).toBe(true);
    });
  });

  describe('Rollout percent = 0 disables Phase 13', () => {
    it('should return 0% rollout when rollout percent is 0', () => {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '0';
      expect(getPhase13RolloutPercent()).toBe(0);
    });

    it('should disable Phase 13 when rollout percent is 0', () => {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '0';
      expect(isPhase13Enabled()).toBe(false);
    });

    it('should return 0% when no env vars are set', () => {
      expect(getPhase13RolloutPercent()).toBe(0);
    });

    it('should disable Phase 13 when no env vars are set', () => {
      expect(isPhase13Enabled()).toBe(false);
    });
  });

  describe('Rollout percent boundary conditions', () => {
    it('should clamp rollout percent to 100 when over 100', () => {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '150';
      expect(getPhase13RolloutPercent()).toBe(100);
    });

    it('should clamp rollout percent to 0 when negative', () => {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '-10';
      expect(getPhase13RolloutPercent()).toBe(0);
    });

    it('should return 0 for invalid rollout percent values', () => {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = 'invalid';
      expect(getPhase13RolloutPercent()).toBe(0);
    });

    it('should handle rollout percent of exactly 100', () => {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '100';
      expect(getPhase13RolloutPercent()).toBe(100);
      expect(isPhase13Enabled()).toBe(true);
    });
  });

  describe('Session-level decision caching (sticky per request)', () => {
    it('should return consistent results within a session when rollout percent is partial', () => {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '50';

      // First call makes a decision
      const firstResult = isPhase13Enabled();

      // Subsequent calls should return the same result (sticky)
      for (let i = 0; i < 10; i++) {
        expect(isPhase13Enabled()).toBe(firstResult);
      }
    });

    it('should allow resetting the session decision', () => {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '100';

      // Set to 100% so we get deterministic true
      expect(isPhase13Enabled()).toBe(true);

      // Reset and change env var
      resetPhase13SessionDecision();
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '0';

      // Should now be false after reset
      expect(isPhase13Enabled()).toBe(false);
    });

    it('should cache decision even when env var changes mid-request', () => {
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '100';

      // Make initial decision (should be true at 100%)
      expect(isPhase13Enabled()).toBe(true);

      // Change env var mid-request
      process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT = '0';

      // Decision should remain cached (still true)
      expect(isPhase13Enabled()).toBe(true);

      // Only reset clears the cache
      resetPhase13SessionDecision();
      expect(isPhase13Enabled()).toBe(false);
    });
  });

  describe('Phase 13 rules are evaluated correctly under full enablement', () => {
    it('should evaluate Phase 13 rules when VALIDATION_PHASE13_ENABLED=true', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2024-02-01', // Within 4-month bar
        notice_expiry_date: '2024-04-01',
        deposit_taken: false,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
      };

      const result = evaluateEvictionRules(facts, 'england', 'complete_pack', 'section_21');
      // s21_four_month_bar is a Phase 13 rule that should fire
      expect(result.blockers.some((b) => b.id === 's21_four_month_bar')).toBe(true);
    });

    it('should NOT evaluate Phase 13 rules when both flags are disabled', () => {
      delete process.env.VALIDATION_PHASE13_ENABLED;
      delete process.env.VALIDATION_PHASE13_ROLLOUT_PERCENT;
      clearConfigCache();

      const facts: EvictionFacts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        notice_service_date: '2024-02-01', // Within 4-month bar
        notice_expiry_date: '2024-04-01',
        deposit_taken: false,
        gas_certificate_provided: true,
        epc_provided: true,
        how_to_rent_provided: true,
      };

      const result = evaluateEvictionRules(facts, 'england', 'complete_pack', 'section_21');
      // s21_four_month_bar is a Phase 13 rule that should NOT fire
      expect(result.blockers.some((b) => b.id === 's21_four_month_bar')).toBe(false);
    });
  });
});

describe('Phase 13 England Complete Pack Rules', () => {
  const originalEnv = process.env.VALIDATION_PHASE13_ENABLED;

  beforeEach(() => {
    resetPhase13SessionDecision();
    clearConfigCache();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.VALIDATION_PHASE13_ENABLED;
    } else {
      process.env.VALIDATION_PHASE13_ENABLED = originalEnv;
    }
    clearConfigCache();
  });

  const baseValidFacts: EvictionFacts = {
    landlord_full_name: 'John Landlord',
    tenant_full_name: 'Jane Tenant',
    property_address_line1: '123 Test Street',
    tenancy_start_date: '2024-01-01',
    notice_service_date: '2025-06-01',
    notice_expiry_date: '2025-08-01',
    deposit_taken: true,
    deposit_protected: true,
    deposit_protected_scheme: true,
    prescribed_info_served: true,
    epc_provided: true,
    how_to_rent_provided: true,
    has_gas_appliances: false,
  };

  describe('s21_four_month_bar (Phase 13)', () => {
    it('should NOT trigger when Phase 13 is disabled', () => {
      delete process.env.VALIDATION_PHASE13_ENABLED;
      clearConfigCache();

      const today = new Date();
      const recentStart = new Date(today);
      recentStart.setMonth(today.getMonth() - 2);

      const facts: EvictionFacts = {
        ...baseValidFacts,
        tenancy_start_date: recentStart.toISOString().split('T')[0],
        notice_service_date: today.toISOString().split('T')[0],
      };

      const result = evaluateEvictionRules(facts, 'england', 'complete_pack', 'section_21');
      expect(result.blockers.some((b) => b.id === 's21_four_month_bar')).toBe(false);
    });

    it('should trigger when Phase 13 is enabled and notice served within 4 months', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      const today = new Date();
      const recentStart = new Date(today);
      recentStart.setMonth(today.getMonth() - 2);

      const facts: EvictionFacts = {
        ...baseValidFacts,
        tenancy_start_date: recentStart.toISOString().split('T')[0],
        notice_service_date: today.toISOString().split('T')[0],
      };

      const result = evaluateEvictionRules(facts, 'england', 'complete_pack', 'section_21');
      expect(result.blockers.some((b) => b.id === 's21_four_month_bar')).toBe(true);
    });
  });

  describe('s21_deposit_cap_exceeded (Phase 13)', () => {
    it('should NOT trigger when Phase 13 is disabled', () => {
      delete process.env.VALIDATION_PHASE13_ENABLED;
      clearConfigCache();

      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: true,
        deposit_amount: 2000,
        rent_amount: 800,
        rent_frequency: 'monthly',
        deposit_reduced_to_legal_cap_confirmed: undefined,
      };

      const result = evaluateEvictionRules(facts, 'england', 'complete_pack', 'section_21');
      expect(result.blockers.some((b) => b.id === 's21_deposit_cap_exceeded')).toBe(false);
    });

    it('should trigger when Phase 13 is enabled and deposit exceeds cap', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      // £800/month = £9600/year, max deposit = 5 weeks = £923
      // £2000 deposit exceeds cap
      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: true,
        deposit_amount: 2000,
        rent_amount: 800,
        rent_frequency: 'monthly',
        deposit_reduced_to_legal_cap_confirmed: undefined,
      };

      const result = evaluateEvictionRules(facts, 'england', 'complete_pack', 'section_21');
      expect(result.blockers.some((b) => b.id === 's21_deposit_cap_exceeded')).toBe(true);
    });

    it('should NOT trigger when deposit is within cap', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      // £800/month = £9600/year, max deposit = 5 weeks = £923
      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: true,
        deposit_amount: 900,
        rent_amount: 800,
        rent_frequency: 'monthly',
      };

      const result = evaluateEvictionRules(facts, 'england', 'complete_pack', 'section_21');
      expect(result.blockers.some((b) => b.id === 's21_deposit_cap_exceeded')).toBe(false);
    });
  });

  describe('s21_licensing_required_not_licensed (Phase 13)', () => {
    it('should trigger when Phase 13 enabled and licensing required but no valid licence', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      const facts: EvictionFacts = {
        ...baseValidFacts,
        licensing_required: 'hmo',
        has_valid_licence: false,
      };

      const result = evaluateEvictionRules(facts, 'england', 'complete_pack', 'section_21');
      expect(result.blockers.some((b) => b.id === 's21_licensing_required_not_licensed')).toBe(true);
    });

    it('should NOT trigger when licensing is not required', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      const facts: EvictionFacts = {
        ...baseValidFacts,
        licensing_required: 'not_required',
        has_valid_licence: false,
      };

      const result = evaluateEvictionRules(facts, 'england', 'complete_pack', 'section_21');
      expect(result.blockers.some((b) => b.id === 's21_licensing_required_not_licensed')).toBe(false);
    });
  });
});

describe('Phase 13 Scotland Rules', () => {
  const originalEnv = process.env.VALIDATION_PHASE13_ENABLED;

  beforeEach(() => {
    resetPhase13SessionDecision();
    clearConfigCache();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.VALIDATION_PHASE13_ENABLED;
    } else {
      process.env.VALIDATION_PHASE13_ENABLED = originalEnv;
    }
    clearConfigCache();
  });

  const baseValidFacts: EvictionFacts = {
    landlord_full_name: 'John Landlord',
    tenant_full_name: 'Jane Tenant',
    property_address_line1: '123 Test Street, Edinburgh',
    tenancy_start_date: '2024-01-01',
    notice_service_date: '2025-06-01',
    notice_expiry_date: '2025-09-01',
    scotland_ground_codes: ['1'],
    issues: {
      rent_arrears: {
        pre_action_confirmed: true,
      },
    },
    landlord_registration_number: 'REG123456',
  };

  describe('ntl_landlord_not_registered (Phase 13)', () => {
    it('should NOT trigger when Phase 13 is disabled', () => {
      delete process.env.VALIDATION_PHASE13_ENABLED;
      clearConfigCache();

      const facts: EvictionFacts = {
        ...baseValidFacts,
        landlord_registration_number: undefined,
        landlord_reg_number: undefined,
      };

      const result = evaluateEvictionRules(facts, 'scotland', 'notice_only', 'notice_to_leave');
      expect(result.blockers.some((b) => b.id === 'ntl_landlord_not_registered')).toBe(false);
    });

    it('should trigger when Phase 13 enabled and no registration number', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      const facts: EvictionFacts = {
        ...baseValidFacts,
        landlord_registration_number: undefined,
        landlord_reg_number: undefined,
      };

      const result = evaluateEvictionRules(facts, 'scotland', 'notice_only', 'notice_to_leave');
      expect(result.blockers.some((b) => b.id === 'ntl_landlord_not_registered')).toBe(true);
    });
  });

  describe('ntl_deposit_not_protected (Phase 13)', () => {
    it('should trigger when Phase 13 enabled and deposit not protected', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: true,
        deposit_protected: false,
      };

      const result = evaluateEvictionRules(facts, 'scotland', 'notice_only', 'notice_to_leave');
      expect(result.blockers.some((b) => b.id === 'ntl_deposit_not_protected')).toBe(true);
    });
  });
});

describe('Phase 13 Wales Rules', () => {
  const originalEnv = process.env.VALIDATION_PHASE13_ENABLED;

  beforeEach(() => {
    resetPhase13SessionDecision();
    clearConfigCache();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.VALIDATION_PHASE13_ENABLED;
    } else {
      process.env.VALIDATION_PHASE13_ENABLED = originalEnv;
    }
    clearConfigCache();
  });

  const baseValidFacts: EvictionFacts = {
    landlord_full_name: 'John Landlord',
    tenant_full_name: 'Jane Tenant',
    property_address_line1: '123 Test Street, Cardiff',
    contract_start_date: '2024-01-01',
    notice_service_date: '2025-06-01',
    notice_expiry_date: '2025-12-01',
    rent_smart_wales_registered: true,
  };

  describe('s173_deposit_not_protected (Phase 13)', () => {
    it('should NOT trigger when Phase 13 is disabled', () => {
      delete process.env.VALIDATION_PHASE13_ENABLED;
      clearConfigCache();

      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: true,
        deposit_protected: false,
      };

      const result = evaluateEvictionRules(facts, 'wales', 'notice_only', 'section_173');
      expect(result.blockers.some((b) => b.id === 's173_deposit_not_protected')).toBe(false);
    });

    it('should trigger when Phase 13 enabled and deposit not protected', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      const facts: EvictionFacts = {
        ...baseValidFacts,
        deposit_taken: true,
        deposit_protected: false,
      };

      const result = evaluateEvictionRules(facts, 'wales', 'notice_only', 'section_173');
      expect(result.blockers.some((b) => b.id === 's173_deposit_not_protected')).toBe(true);
    });
  });

  describe('s173_written_statement_missing (Phase 13)', () => {
    it('should trigger warning when Phase 13 enabled and written statement not provided', () => {
      process.env.VALIDATION_PHASE13_ENABLED = 'true';
      clearConfigCache();

      const facts: EvictionFacts = {
        ...baseValidFacts,
        written_statement_provided: false,
      };

      const result = evaluateEvictionRules(facts, 'wales', 'notice_only', 'section_173');
      expect(result.warnings.some((w) => w.id === 's173_written_statement_missing')).toBe(true);
    });
  });
});

// ============================================================================
// PHASE 15: TELEMETRY VERIFICATION TESTS
// ============================================================================
// Tests to verify telemetry functions correctly identify and track Phase 13 rules.

import {
  isPhase13Rule,
  getAggregatedMetrics,
  getPhase14ImpactMetrics,
  recordValidationTelemetry,
  clearMetricsStore,
  type ValidationTelemetryEvent,
} from '@/lib/validation/shadow-mode-adapter';
import { buildRuleFactsView } from '@/lib/validation/eviction-rules-engine';

describe('Phase 15: Telemetry Verification', () => {
  const originalEnabled = process.env.VALIDATION_PHASE13_ENABLED;

  beforeEach(() => {
    resetPhase13SessionDecision();
    clearMetricsStore();
  });

  afterEach(() => {
    if (originalEnabled === undefined) {
      delete process.env.VALIDATION_PHASE13_ENABLED;
    } else {
      process.env.VALIDATION_PHASE13_ENABLED = originalEnabled;
    }
    resetPhase13SessionDecision();
    clearMetricsStore();
  });

  describe('isPhase13Rule identification', () => {
    it('should correctly identify Phase 13 England S21 rules', () => {
      expect(isPhase13Rule('s21_deposit_cap_exceeded')).toBe(true);
      expect(isPhase13Rule('s21_four_month_bar')).toBe(true);
      expect(isPhase13Rule('s21_notice_period_short')).toBe(true);
      expect(isPhase13Rule('s21_licensing_required_not_licensed')).toBe(true);
      expect(isPhase13Rule('s21_retaliatory_improvement_notice')).toBe(true);
      expect(isPhase13Rule('s21_retaliatory_emergency_action')).toBe(true);
    });

    it('should correctly identify Phase 13 England S8 rules', () => {
      expect(isPhase13Rule('s8_notice_period_short')).toBe(true);
    });

    it('should correctly identify Phase 13 Wales S173 rules', () => {
      expect(isPhase13Rule('s173_notice_period_short')).toBe(true);
      expect(isPhase13Rule('s173_deposit_not_protected')).toBe(true);
      expect(isPhase13Rule('s173_written_statement_missing')).toBe(true);
    });

    it('should correctly identify Phase 13 Scotland NTL rules', () => {
      expect(isPhase13Rule('ntl_landlord_not_registered')).toBe(true);
      expect(isPhase13Rule('ntl_pre_action_letter_not_sent')).toBe(true);
      expect(isPhase13Rule('ntl_pre_action_signposting_missing')).toBe(true);
      expect(isPhase13Rule('ntl_ground_1_arrears_threshold')).toBe(true);
      expect(isPhase13Rule('ntl_deposit_not_protected')).toBe(true);
    });

    it('should return false for non-Phase 13 rules', () => {
      expect(isPhase13Rule('s21_deposit_not_protected')).toBe(false);
      expect(isPhase13Rule('s21_how_to_rent_missing')).toBe(false);
      expect(isPhase13Rule('landlord_name_required')).toBe(false);
      expect(isPhase13Rule('ntl_ground_required')).toBe(false);
      expect(isPhase13Rule('s173_licensing')).toBe(false);
    });
  });

  describe('Telemetry metrics aggregation with Phase 13 tracking', () => {
    it('should track Phase 13 enabled events correctly', () => {
      // Record a Phase 13 enabled event
      const event: ValidationTelemetryEvent = {
        timestamp: new Date().toISOString(),
        jurisdiction: 'england',
        product: 'complete_pack',
        route: 'section_21',
        blockerCount: 2,
        warningCount: 0,
        blockerIds: ['s21_deposit_not_protected', 's21_four_month_bar'],
        warningIds: [],
        durationMs: 10,
        isValid: false,
        phase13Enabled: true,
        phase13BlockerIds: ['s21_four_month_bar'],
        phase13WarningIds: [],
      };

      recordValidationTelemetry(event);

      const metrics = getAggregatedMetrics();
      expect(metrics.totalValidations).toBe(1);
      expect(metrics.invalidCount).toBe(1);
      expect(metrics.phase13EnabledCount).toBe(1);
      expect(metrics.phase13BlockerFrequency.get('s21_four_month_bar')).toBe(1);
    });

    it('should track Phase 13 disabled events correctly', () => {
      // Record a Phase 13 disabled event
      const event: ValidationTelemetryEvent = {
        timestamp: new Date().toISOString(),
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        blockerCount: 1,
        warningCount: 0,
        blockerIds: ['s21_deposit_not_protected'],
        warningIds: [],
        durationMs: 10,
        isValid: false,
        phase13Enabled: false,
        phase13BlockerIds: [],
        phase13WarningIds: [],
      };

      recordValidationTelemetry(event);

      const metrics = getAggregatedMetrics();
      expect(metrics.totalValidations).toBe(1);
      expect(metrics.phase13EnabledCount).toBe(0);
      expect(metrics.phase13NewlyBlockedCount).toBe(0);
    });

    it('should correctly calculate newly blocked count', () => {
      // Case 1: Would have passed without Phase 13 (newly blocked)
      const newlyBlockedEvent: ValidationTelemetryEvent = {
        timestamp: new Date().toISOString(),
        jurisdiction: 'england',
        product: 'complete_pack',
        route: 'section_21',
        blockerCount: 1,
        warningCount: 0,
        blockerIds: ['s21_four_month_bar'],
        warningIds: [],
        durationMs: 10,
        isValid: false,
        phase13Enabled: true,
        phase13BlockerIds: ['s21_four_month_bar'],
        phase13WarningIds: [],
      };

      // Case 2: Would have failed anyway (non-Phase 13 blocker)
      const existingBlockerEvent: ValidationTelemetryEvent = {
        timestamp: new Date().toISOString(),
        jurisdiction: 'england',
        product: 'complete_pack',
        route: 'section_21',
        blockerCount: 2,
        warningCount: 0,
        blockerIds: ['s21_deposit_not_protected', 's21_four_month_bar'],
        warningIds: [],
        durationMs: 10,
        isValid: false,
        phase13Enabled: true,
        phase13BlockerIds: ['s21_four_month_bar'],
        phase13WarningIds: [],
      };

      recordValidationTelemetry(newlyBlockedEvent);
      recordValidationTelemetry(existingBlockerEvent);

      const metrics = getAggregatedMetrics();
      expect(metrics.phase13EnabledCount).toBe(2);
      // Only 1 newly blocked (the one with only Phase 13 blockers)
      expect(metrics.phase13NewlyBlockedCount).toBe(1);
    });
  });

  describe('Phase 14 impact metrics under full enablement', () => {
    it('should calculate correct impact metrics when Phase 13 is fully enabled', () => {
      // Simulate Phase 13 at 100%
      const events: ValidationTelemetryEvent[] = [
        // Valid case - no blockers
        {
          timestamp: new Date().toISOString(),
          jurisdiction: 'england',
          product: 'complete_pack',
          route: 'section_21',
          blockerCount: 0,
          warningCount: 0,
          blockerIds: [],
          warningIds: [],
          durationMs: 10,
          isValid: true,
          phase13Enabled: true,
          phase13BlockerIds: [],
          phase13WarningIds: [],
        },
        // Newly blocked by Phase 13
        {
          timestamp: new Date().toISOString(),
          jurisdiction: 'england',
          product: 'complete_pack',
          route: 'section_21',
          blockerCount: 1,
          warningCount: 0,
          blockerIds: ['s21_four_month_bar'],
          warningIds: [],
          durationMs: 10,
          isValid: false,
          phase13Enabled: true,
          phase13BlockerIds: ['s21_four_month_bar'],
          phase13WarningIds: [],
        },
        // Warning only from Phase 13
        {
          timestamp: new Date().toISOString(),
          jurisdiction: 'wales',
          product: 'notice_only',
          route: 'section_173',
          blockerCount: 0,
          warningCount: 1,
          blockerIds: [],
          warningIds: ['s173_written_statement_missing'],
          durationMs: 10,
          isValid: true,
          phase13Enabled: true,
          phase13BlockerIds: [],
          phase13WarningIds: ['s173_written_statement_missing'],
        },
      ];

      for (const event of events) {
        recordValidationTelemetry(event);
      }

      const impact = getPhase14ImpactMetrics();
      expect(impact.totalValidations).toBe(3);
      expect(impact.phase13EnabledCount).toBe(3);
      expect(impact.phase13EnabledPercent).toBe(100);
      expect(impact.phase13NewlyBlockedCount).toBe(1);
      expect(impact.newlyBlockedPercent).toBeCloseTo(33.33, 1);
      expect(impact.warningToBlockerRatio).toBe(1); // 1 warning / 1 blocker
    });
  });
});

// ============================================================================
// FACT CANONICALIZATION REGRESSION TESTS
// ============================================================================
// Tests to verify that variant keys (epc_served, how_to_rent_served, etc.)
// are correctly mapped to canonical keys (epc_provided, how_to_rent_provided)
// before YAML rule evaluation.
//
// See: notice_only_rules.yaml uses epc_provided/how_to_rent_provided as canonical keys.
// The wizard may save answers under variant keys like epc_served/how_to_rent_served.

describe('Fact Canonicalization for YAML Rules', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  // Base facts for a valid Section 21 case (excluding EPC/H2R which we'll test)
  const baseMinimalFacts: EvictionFacts = {
    landlord_full_name: 'John Landlord',
    tenant_full_name: 'Jane Tenant',
    property_address_line1: '123 Test Street',
    tenancy_start_date: '2024-01-01',
    notice_service_date: '2025-06-01',
    notice_expiry_date: '2025-08-01',
    deposit_taken: true,
    deposit_protected: true,
    prescribed_info_given: true,
    has_gas_appliances: false,
    property_licensing_status: 'licensed',
  };

  describe('buildRuleFactsView', () => {
    it('should map epc_served to epc_provided', () => {
      const facts = { epc_served: true };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.epc_provided).toBe(true);
    });

    it('should map how_to_rent_served to how_to_rent_provided', () => {
      const facts = { how_to_rent_served: true };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.how_to_rent_provided).toBe(true);
    });

    it('should map how_to_rent_given to how_to_rent_provided', () => {
      const facts = { how_to_rent_given: true };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.how_to_rent_provided).toBe(true);
    });

    it('should NOT override explicit epc_provided=false with epc_served=true', () => {
      const facts = { epc_provided: false, epc_served: true };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.epc_provided).toBe(false);
    });

    it('should NOT override explicit how_to_rent_provided=false with how_to_rent_served=true', () => {
      const facts = { how_to_rent_provided: false, how_to_rent_served: true };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.how_to_rent_provided).toBe(false);
    });
  });

  describe('Nested Object Flattening', () => {
    it('should flatten compliance.epc_served to epc_provided', () => {
      const facts = { compliance: { epc_served: true } };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.epc_provided).toBe(true);
    });

    it('should flatten compliance.how_to_rent_served to how_to_rent_provided', () => {
      const facts = { compliance: { how_to_rent_served: true } };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.how_to_rent_provided).toBe(true);
    });

    it('should flatten section21.epc_served to epc_provided', () => {
      const facts = { section21: { epc_served: true } };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.epc_provided).toBe(true);
    });

    it('should flatten section_21.how_to_rent_given to how_to_rent_provided', () => {
      const facts = { section_21: { how_to_rent_given: true } };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.how_to_rent_provided).toBe(true);
    });

    it('should flatten property.epc_served to epc_provided', () => {
      const facts = { property: { epc_served: true } };
      const normalized = buildRuleFactsView(facts);
      expect(normalized.epc_provided).toBe(true);
    });
  });

  describe('Case A: Top-level variant keys satisfy S21 rules', () => {
    it('should NOT trigger s21_epc or s21_h2r when epc_served=true and how_to_rent_served=true', () => {
      const facts: EvictionFacts = {
        ...baseMinimalFacts,
        epc_served: true,
        how_to_rent_served: true,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_epc')).toBe(false);
      expect(result.blockers.some((b) => b.id === 's21_h2r')).toBe(false);
    });
  });

  describe('Case B: Nested variant keys satisfy S21 rules', () => {
    it('should NOT trigger s21_epc or s21_h2r when compliance contains epc_served/how_to_rent_served', () => {
      const facts: EvictionFacts = {
        ...baseMinimalFacts,
        compliance: {
          epc_served: true,
          how_to_rent_served: true,
        },
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_epc')).toBe(false);
      expect(result.blockers.some((b) => b.id === 's21_h2r')).toBe(false);
    });

    it('should NOT trigger s21_epc or s21_h2r when section21 contains epc_served/how_to_rent_given', () => {
      const facts: EvictionFacts = {
        ...baseMinimalFacts,
        section21: {
          epc_served: true,
          how_to_rent_given: true,
        },
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_epc')).toBe(false);
      expect(result.blockers.some((b) => b.id === 's21_h2r')).toBe(false);
    });
  });

  describe('Case C: Explicit provided=false should still block', () => {
    it('should trigger s21_epc when epc_provided=false even if epc_served=true', () => {
      const facts: EvictionFacts = {
        ...baseMinimalFacts,
        epc_provided: false,
        epc_served: true, // Should NOT override explicit false
        how_to_rent_provided: true,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_epc')).toBe(true);
    });

    it('should trigger s21_h2r when how_to_rent_provided=false even if how_to_rent_served=true', () => {
      const facts: EvictionFacts = {
        ...baseMinimalFacts,
        epc_provided: true,
        how_to_rent_provided: false,
        how_to_rent_served: true, // Should NOT override explicit false
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_h2r')).toBe(true);
    });
  });

  describe('Case D: how_to_rent_given should satisfy how_to_rent_provided', () => {
    it('should NOT trigger s21_h2r when how_to_rent_given=true', () => {
      const facts: EvictionFacts = {
        ...baseMinimalFacts,
        epc_provided: true,
        how_to_rent_given: true,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.blockers.some((b) => b.id === 's21_h2r')).toBe(false);
    });
  });

  describe('Complete valid S21 case with variant keys', () => {
    it('should return isValid=true when all requirements met via variant keys', () => {
      const facts: EvictionFacts = {
        ...baseMinimalFacts,
        epc_served: true,
        how_to_rent_given: true,
      };

      const result = evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

      expect(result.isValid).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });
  });
});
