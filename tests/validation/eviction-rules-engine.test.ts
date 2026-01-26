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

describe('Scotland Notice to Leave Rule Evaluation', () => {
  beforeEach(() => {
    clearConfigCache();
  });

  const baseValidFacts: EvictionFacts = {
    landlord_full_name: 'John Landlord',
    tenant_full_name: 'Jane Tenant',
    property_address_line1: '123 Test Street, Edinburgh',
    tenancy_start_date: '2024-01-01',
    notice_service_date: '2025-06-01',
    notice_expiry_date: '2025-06-29', // 28 days
    scotland_ground_codes: ['ground_1'],
    landlord_registration_number: 'SCL123456',
    pre_action_contact: 'Yes',
    pre_action_letter_sent: true, // Required for Ground 1
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

  describe('Landlord Registration Rule', () => {
    it('should trigger ntl_landlord_not_registered when no registration number', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        landlord_registration_number: undefined,
        landlord_reg_number: undefined,
      };

      const result = evaluateEvictionRules(facts, 'scotland', 'notice_only', 'notice_to_leave');

      expect(result.blockers.some((b) => b.id === 'ntl_landlord_not_registered')).toBe(true);
    });
  });

  describe('Pre-Action Requirements Rule', () => {
    it('should trigger ntl_pre_action_required for Ground 1 without pre-action', () => {
      const facts: EvictionFacts = {
        ...baseValidFacts,
        scotland_ground_codes: ['ground_1'],
        pre_action_contact: undefined,
        issues: {
          rent_arrears: {
            pre_action_confirmed: false,
          },
        },
      };

      const result = evaluateEvictionRules(facts, 'scotland', 'notice_only', 'notice_to_leave');

      expect(result.blockers.some((b) => b.id === 'ntl_pre_action_required')).toBe(true);
    });
  });

  describe('Valid Case', () => {
    it('should return no blockers for valid Notice to Leave case', () => {
      const result = evaluateEvictionRules(baseValidFacts, 'scotland', 'notice_only', 'notice_to_leave');

      // May have warnings but no blockers
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

  it('England complete_pack should have 30+ rules', () => {
    const ruleIds = getAllRuleIds('england', 'complete_pack');
    expect(ruleIds.length).toBeGreaterThanOrEqual(30);
  });
});
