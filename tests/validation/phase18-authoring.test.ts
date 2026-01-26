/**
 * Phase 18 Tests: Rule Authoring, Explainability & Platform Expansion
 *
 * Tests for:
 * - Rule linting CLI functionality
 * - Explainability mode
 * - Multi-tenant rule targeting
 * - Rule override model
 * - Engine abstraction interfaces
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  evaluateEvictionRulesExplained,
  getValidationSummary,
  explainRule,
  evaluateEvictionRules,
  clearConfigCache,
} from '../../src/lib/validation/eviction-rules-engine';
import {
  setTenantContext,
  getTenantContext,
  resetTenantContext,
  findRuleOverride,
  applyRuleOverride,
  processRuleOverrides,
  getTenantCustomRules,
  getTenantRulesForRoute,
  validateTenantRule,
  getOverrideAuditLog,
  clearOverrideAuditLog,
  canUseCustomRules,
  canUseRuleOverrides,
  isFeatureAvailableForTier,
  createTenantContext,
  serializeTenantContext,
  deserializeTenantContext,
  isTenantFeatureEnabled,
  type TenantContext,
  type RuleOverride,
  type TenantRule,
} from '../../src/lib/validation/rule-targeting';
import {
  ValidationResult,
  ValidationIssue,
  productRegistry,
  mergeResults,
  emptyResult,
  countIssues,
  hasBlockers,
  hasWarnings,
  isValidResult,
  ResultTransformers,
} from '../../src/lib/validation/engine-interface';
import { clearAllCaches, resetEngineStats } from '../../src/lib/validation/eviction-rules-optimizer';

// Reset state before each test
beforeEach(() => {
  resetTenantContext();
  clearOverrideAuditLog();
  clearAllCaches();
  resetEngineStats();
  clearConfigCache();
});

// ============================================================================
// EXPLAINABILITY MODE TESTS
// ============================================================================

describe('Phase 18: Explainability Mode', () => {
  const baseFacts = {
    landlord_name: 'Test Landlord',
    tenant_name: 'Test Tenant',
    property_address_line1: '123 Test St',
    property_address_postcode: 'TE1 1ST',
  };

  describe('evaluateEvictionRulesExplained', () => {
    it('should return explanations for all evaluated rules', () => {
      const result = evaluateEvictionRulesExplained(
        baseFacts,
        'england',
        'notice_only',
        'section_21'
      );

      expect(result.explanations).toBeDefined();
      expect(result.explanations.length).toBeGreaterThan(0);
    });

    it('should include timing information', () => {
      const result = evaluateEvictionRulesExplained(
        baseFacts,
        'england',
        'notice_only',
        'section_21'
      );

      expect(result.timing).toBeDefined();
      expect(result.timing.totalMs).toBeGreaterThanOrEqual(0);
      expect(result.timing.rulesEvaluated).toBeGreaterThan(0);
      expect(result.timing.conditionsEvaluated).toBeGreaterThanOrEqual(0);
    });

    it('should include computed context', () => {
      const result = evaluateEvictionRulesExplained(
        baseFacts,
        'england',
        'notice_only',
        'section_21'
      );

      expect(result.computedContext).toBeDefined();
    });

    it('should mark rules as fired when conditions match', () => {
      const factsWithIssue = {
        ...baseFacts,
        deposit_taken: true,
        deposit_protected: false,
      };

      const result = evaluateEvictionRulesExplained(
        factsWithIssue,
        'england',
        'notice_only',
        'section_21'
      );

      const depositRule = result.explanations.find(
        (e) => e.ruleId === 's21_deposit_not_protected'
      );

      if (depositRule) {
        expect(depositRule.evaluated).toBe(true);
        expect(depositRule.fired).toBe(true);
      }
    });

    it('should provide condition-level explanations', () => {
      const result = evaluateEvictionRulesExplained(
        baseFacts,
        'england',
        'notice_only',
        'section_21'
      );

      const ruleWithConditions = result.explanations.find(
        (e) => e.conditions.length > 0
      );

      if (ruleWithConditions) {
        expect(ruleWithConditions.conditions[0]).toHaveProperty('condition');
        expect(ruleWithConditions.conditions[0]).toHaveProperty('result');
        expect(ruleWithConditions.conditions[0]).toHaveProperty('explanation');
      }
    });
  });

  describe('getValidationSummary', () => {
    it('should return human-readable summary', () => {
      const result = evaluateEvictionRulesExplained(
        baseFacts,
        'england',
        'notice_only',
        'section_21'
      );

      const summary = getValidationSummary(result);

      expect(summary).toContain('Validation Summary');
      expect(summary).toContain('Jurisdiction: england');
      expect(summary).toContain('Route: section_21');
    });
  });

  describe('explainRule', () => {
    it('should return explanation for specific rule', () => {
      const result = evaluateEvictionRulesExplained(
        baseFacts,
        'england',
        'notice_only',
        'section_21'
      );

      // Find any evaluated rule
      const evaluatedRule = result.explanations.find((e) => e.evaluated);
      if (evaluatedRule) {
        const explanation = explainRule(result, evaluatedRule.ruleId);
        expect(explanation).not.toBeNull();
        expect(explanation?.ruleId).toBe(evaluatedRule.ruleId);
      }
    });

    it('should return null for non-existent rule', () => {
      const result = evaluateEvictionRulesExplained(
        baseFacts,
        'england',
        'notice_only',
        'section_21'
      );

      const explanation = explainRule(result, 'non_existent_rule_id');
      expect(explanation).toBeNull();
    });
  });
});

// ============================================================================
// MULTI-TENANT RULE TARGETING TESTS
// ============================================================================

describe('Phase 18A: Multi-Tenant Rule Targeting', () => {
  describe('Tenant Context', () => {
    it('should set and get tenant context', () => {
      setTenantContext({
        tenantId: 'test-tenant',
        tenantName: 'Test Tenant',
        tier: 'enterprise',
        features: ['feature1', 'feature2'],
      });

      const context = getTenantContext();

      expect(context.tenantId).toBe('test-tenant');
      expect(context.tenantName).toBe('Test Tenant');
      expect(context.tier).toBe('enterprise');
      expect(context.features).toContain('feature1');
    });

    it('should reset to default context', () => {
      setTenantContext({
        tenantId: 'test-tenant',
        tier: 'enterprise',
      });

      resetTenantContext();

      const context = getTenantContext();
      expect(context.tenantId).toBe('default');
      expect(context.tier).toBe('free');
    });

    it('should check tenant features', () => {
      setTenantContext({
        tenantId: 'test',
        tier: 'pro',
        features: ['custom_feature'],
      });

      expect(isTenantFeatureEnabled('custom_feature')).toBe(true);
      expect(isTenantFeatureEnabled('nonexistent')).toBe(false);
    });
  });

  describe('Tier-Based Features', () => {
    it('should gate features by tier', () => {
      setTenantContext({ tenantId: 'free-tenant', tier: 'free' });
      expect(isFeatureAvailableForTier('basic_validation')).toBe(true);
      expect(isFeatureAvailableForTier('custom_rules')).toBe(false);

      setTenantContext({ tenantId: 'enterprise-tenant', tier: 'enterprise' });
      expect(isFeatureAvailableForTier('custom_rules')).toBe(true);
      expect(isFeatureAvailableForTier('rule_overrides')).toBe(true);
    });

    it('should check custom rules availability', () => {
      setTenantContext({ tenantId: 't1', tier: 'free' });
      expect(canUseCustomRules()).toBe(false);

      setTenantContext({ tenantId: 't2', tier: 'enterprise' });
      expect(canUseCustomRules()).toBe(true);
    });

    it('should check rule overrides availability', () => {
      setTenantContext({ tenantId: 't1', tier: 'pro' });
      expect(canUseRuleOverrides()).toBe(false);

      setTenantContext({ tenantId: 't2', tier: 'enterprise' });
      expect(canUseRuleOverrides()).toBe(true);
    });
  });

  describe('Context Serialization', () => {
    it('should serialize and deserialize context', () => {
      const original: TenantContext = {
        tenantId: 'test',
        tenantName: 'Test',
        tier: 'enterprise',
        features: ['f1', 'f2'],
        ruleOverrides: [],
        customRules: [],
      };

      const json = serializeTenantContext(original);
      const restored = deserializeTenantContext(json);

      expect(restored.tenantId).toBe(original.tenantId);
      expect(restored.tier).toBe(original.tier);
    });

    it('should create context from config', () => {
      const context = createTenantContext({
        tenantId: 'config-test',
        tier: 'pro',
        features: ['feature1'],
      });

      expect(context.tenantId).toBe('config-test');
      expect(context.tier).toBe('pro');
    });
  });
});

// ============================================================================
// RULE OVERRIDE MODEL TESTS
// ============================================================================

describe('Phase 18A: Rule Override Model', () => {
  describe('findRuleOverride', () => {
    it('should find matching override', () => {
      setTenantContext({
        tenantId: 'test',
        tier: 'enterprise',
        ruleOverrides: [
          {
            ruleId: 's21_test_rule',
            action: 'suppress',
            reason: 'Test reason',
          },
        ],
      });

      const override = findRuleOverride('s21_test_rule');
      expect(override).not.toBeNull();
      expect(override?.action).toBe('suppress');
    });

    it('should return null for non-matching rule', () => {
      setTenantContext({
        tenantId: 'test',
        tier: 'enterprise',
        ruleOverrides: [
          {
            ruleId: 's21_other_rule',
            action: 'suppress',
            reason: 'Test reason',
          },
        ],
      });

      const override = findRuleOverride('s21_test_rule');
      expect(override).toBeNull();
    });

    it('should respect expiration dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      setTenantContext({
        tenantId: 'test',
        tier: 'enterprise',
        ruleOverrides: [
          {
            ruleId: 's21_expired_rule',
            action: 'suppress',
            reason: 'Test reason',
            expiresAt: pastDate.toISOString(),
          },
        ],
      });

      const override = findRuleOverride('s21_expired_rule');
      expect(override).toBeNull();
    });

    it('should apply conditional overrides', () => {
      setTenantContext({
        tenantId: 'test',
        tier: 'enterprise',
        ruleOverrides: [
          {
            ruleId: 's21_conditional_rule',
            action: 'suppress',
            reason: 'Test reason',
            conditions: {
              jurisdictions: ['england'],
              routes: ['section_21'],
            },
          },
        ],
      });

      // Should match
      expect(findRuleOverride('s21_conditional_rule', 'england', undefined, 'section_21')).not.toBeNull();

      // Should not match (wrong jurisdiction)
      expect(findRuleOverride('s21_conditional_rule', 'wales', undefined, 'section_21')).toBeNull();
    });
  });

  describe('applyRuleOverride', () => {
    const testResult = {
      id: 's21_test',
      severity: 'blocker',
      message: 'Original message',
    };

    beforeEach(() => {
      setTenantContext({ tenantId: 'test', tier: 'enterprise' });
    });

    it('should suppress rules', () => {
      const override: RuleOverride = {
        ruleId: 's21_test',
        action: 'suppress',
        reason: 'Suppressed for testing',
      };

      const result = applyRuleOverride(testResult, override);
      expect(result).toBeNull();
    });

    it('should downgrade severity', () => {
      const override: RuleOverride = {
        ruleId: 's21_test',
        action: 'downgrade',
        newSeverity: 'warning',
        reason: 'Downgraded for testing',
      };

      const result = applyRuleOverride(testResult, override);
      expect(result?.severity).toBe('warning');
    });

    it('should upgrade severity', () => {
      const override: RuleOverride = {
        ruleId: 's21_test',
        action: 'upgrade',
        newSeverity: 'blocker',
        reason: 'Upgraded for testing',
      };

      const input = { ...testResult, severity: 'warning' };
      const result = applyRuleOverride(input, override);
      expect(result?.severity).toBe('blocker');
    });

    it('should modify message', () => {
      const override: RuleOverride = {
        ruleId: 's21_test',
        action: 'modify',
        newMessage: 'Modified message',
        reason: 'Modified for testing',
      };

      const result = applyRuleOverride(testResult, override);
      expect(result?.message).toBe('Modified message');
    });

    it('should log to audit trail', () => {
      const override: RuleOverride = {
        ruleId: 's21_test',
        action: 'suppress',
        reason: 'Audit test',
        approvedBy: 'tester@example.com',
      };

      applyRuleOverride(testResult, override, 'england', 'notice_only', 'section_21');

      const auditLog = getOverrideAuditLog();
      expect(auditLog.length).toBe(1);
      expect(auditLog[0].ruleId).toBe('s21_test');
      expect(auditLog[0].action).toBe('suppress');
      expect(auditLog[0].approvedBy).toBe('tester@example.com');
    });
  });

  describe('processRuleOverrides', () => {
    it('should process multiple results', () => {
      setTenantContext({
        tenantId: 'test',
        tier: 'enterprise',
        ruleOverrides: [
          { ruleId: 'rule1', action: 'suppress', reason: 'Test' },
          { ruleId: 'rule2', action: 'downgrade', newSeverity: 'warning', reason: 'Test' },
        ],
      });

      const results = [
        { id: 'rule1', severity: 'blocker', message: 'Message 1' },
        { id: 'rule2', severity: 'blocker', message: 'Message 2' },
        { id: 'rule3', severity: 'blocker', message: 'Message 3' },
      ];

      const processed = processRuleOverrides(results);

      expect(processed.length).toBe(2); // rule1 suppressed
      expect(processed.find((r) => r.id === 'rule2')?.severity).toBe('warning');
      expect(processed.find((r) => r.id === 'rule3')?.severity).toBe('blocker');
    });
  });
});

// ============================================================================
// CUSTOM RULES TESTS
// ============================================================================

describe('Phase 18A: Custom Rules', () => {
  describe('getTenantCustomRules', () => {
    it('should return custom rules for tenant', () => {
      setTenantContext({
        tenantId: 'test',
        tier: 'enterprise',
        customRules: [
          {
            id: 'test_custom_rule',
            severity: 'warning',
            applies_to: ['section_21'],
            applies_when: [{ condition: 'true' }],
            message: 'Custom message',
            rationale: 'Custom rationale',
          },
        ],
      });

      const rules = getTenantCustomRules();
      expect(rules.length).toBe(1);
      expect(rules[0].id).toBe('test_custom_rule');
    });
  });

  describe('getTenantRulesForRoute', () => {
    it('should filter rules by route', () => {
      setTenantContext({
        tenantId: 'test',
        tier: 'enterprise',
        customRules: [
          {
            id: 'test_s21_rule',
            severity: 'warning',
            applies_to: ['section_21'],
            applies_when: [{ condition: 'true' }],
            message: 'S21 message',
            rationale: 'S21 rationale',
          },
          {
            id: 'test_all_rule',
            severity: 'warning',
            applies_to: ['all'],
            applies_when: [{ condition: 'true' }],
            message: 'All message',
            rationale: 'All rationale',
          },
        ],
      });

      const s21Rules = getTenantRulesForRoute('section_21');
      expect(s21Rules.length).toBe(2);

      const s8Rules = getTenantRulesForRoute('section_8');
      expect(s8Rules.length).toBe(1);
      expect(s8Rules[0].id).toBe('test_all_rule');
    });
  });

  describe('validateTenantRule', () => {
    beforeEach(() => {
      setTenantContext({ tenantId: 'test', tier: 'enterprise' });
    });

    it('should validate valid rule', () => {
      const rule: TenantRule = {
        id: 'test_valid_rule',
        severity: 'warning',
        applies_to: ['section_21'],
        applies_when: [{ condition: 'true' }],
        message: 'Valid message',
        rationale: 'Valid rationale',
      };

      const { valid, errors } = validateTenantRule(rule);
      expect(valid).toBe(true);
      expect(errors.length).toBe(0);
    });

    it('should detect missing required fields', () => {
      const rule = {
        id: 'test_invalid',
        severity: 'warning',
        // missing applies_to, applies_when, message, rationale
      } as TenantRule;

      const { valid, errors } = validateTenantRule(rule);
      expect(valid).toBe(false);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate severity values', () => {
      const rule: TenantRule = {
        id: 'test_invalid_severity',
        severity: 'invalid' as any,
        applies_to: ['section_21'],
        applies_when: [{ condition: 'true' }],
        message: 'Message',
        rationale: 'Rationale',
      };

      const { valid, errors } = validateTenantRule(rule);
      expect(valid).toBe(false);
      expect(errors.some((e) => e.includes('Invalid severity'))).toBe(true);
    });

    it('should require tenant ID prefix', () => {
      const rule: TenantRule = {
        id: 's21_wrong_prefix',
        severity: 'warning',
        applies_to: ['section_21'],
        applies_when: [{ condition: 'true' }],
        message: 'Message',
        rationale: 'Rationale',
      };

      const { valid, errors } = validateTenantRule(rule);
      expect(valid).toBe(false);
      expect(errors.some((e) => e.includes('prefixed with tenant ID'))).toBe(true);
    });
  });
});

// ============================================================================
// ENGINE INTERFACE TESTS
// ============================================================================

describe('Phase 18B: Engine Interface', () => {
  describe('ProductRegistry', () => {
    it('should have eviction-notices registered', () => {
      expect(productRegistry.has('eviction-notices')).toBe(true);
    });

    it('should return product config', () => {
      const config = productRegistry.get('eviction-notices');
      expect(config).toBeDefined();
      expect(config?.name).toBe('Eviction Notices');
      expect(config?.contexts).toContain('section_21');
    });

    it('should list all products', () => {
      const products = productRegistry.getAll();
      expect(products.length).toBeGreaterThan(0);
    });
  });

  describe('Result Utilities', () => {
    it('should create empty result', () => {
      const result = emptyResult();
      expect(result.isValid).toBe(true);
      expect(result.blockers.length).toBe(0);
    });

    it('should merge results', () => {
      const result1: ValidationResult = {
        blockers: [{ id: 'b1', severity: 'blocker', message: 'B1', rationale: 'R1', field: null }],
        warnings: [],
        suggestions: [],
        isValid: false,
        ruleCount: 1,
      };

      const result2: ValidationResult = {
        blockers: [],
        warnings: [{ id: 'w1', severity: 'warning', message: 'W1', rationale: 'R2', field: null }],
        suggestions: [],
        isValid: true,
        ruleCount: 1,
      };

      const merged = mergeResults(result1, result2);

      expect(merged.blockers.length).toBe(1);
      expect(merged.warnings.length).toBe(1);
      expect(merged.isValid).toBe(false); // Has blockers
      expect(merged.ruleCount).toBe(2);
    });

    it('should count issues', () => {
      const result: ValidationResult = {
        blockers: [{ id: 'b1', severity: 'blocker', message: 'B1', rationale: 'R1', field: null }],
        warnings: [{ id: 'w1', severity: 'warning', message: 'W1', rationale: 'R2', field: null }],
        suggestions: [{ id: 's1', severity: 'suggestion', message: 'S1', rationale: 'R3', field: null }],
        isValid: false,
        ruleCount: 3,
      };

      expect(countIssues(result)).toBe(3);
    });

    it('should check for blockers', () => {
      const withBlockers: ValidationResult = {
        blockers: [{ id: 'b1', severity: 'blocker', message: 'B1', rationale: 'R1', field: null }],
        warnings: [],
        suggestions: [],
        isValid: false,
        ruleCount: 1,
      };

      const withoutBlockers: ValidationResult = {
        blockers: [],
        warnings: [],
        suggestions: [],
        isValid: true,
        ruleCount: 0,
      };

      expect(hasBlockers(withBlockers)).toBe(true);
      expect(hasBlockers(withoutBlockers)).toBe(false);
    });

    it('should check validity', () => {
      expect(isValidResult({ blockers: [], warnings: [], suggestions: [], isValid: true, ruleCount: 0 })).toBe(true);
      expect(isValidResult({ blockers: [], warnings: [], suggestions: [], isValid: false, ruleCount: 0 })).toBe(false);
    });
  });

  describe('Result Transformers', () => {
    const fullResult: ValidationResult = {
      blockers: [{ id: 'b1', severity: 'blocker', message: 'B1', rationale: 'R1', field: null }],
      warnings: [{ id: 'w1', severity: 'warning', message: 'W1', rationale: 'R2', field: null }],
      suggestions: [{ id: 's1', severity: 'suggestion', message: 'S1', rationale: 'R3', field: null }],
      isValid: false,
      ruleCount: 3,
    };

    it('should filter to blockers only', () => {
      const filtered = ResultTransformers.blockersOnly(fullResult);
      expect(filtered.blockers.length).toBe(1);
      expect(filtered.warnings.length).toBe(0);
      expect(filtered.suggestions.length).toBe(0);
    });

    it('should remove suggestions', () => {
      const filtered = ResultTransformers.noSuggestions(fullResult);
      expect(filtered.blockers.length).toBe(1);
      expect(filtered.warnings.length).toBe(1);
      expect(filtered.suggestions.length).toBe(0);
    });

    it('should limit issues', () => {
      const limiter = ResultTransformers.limitIssues(0, 0, 0);
      const limited = limiter(fullResult);
      expect(limited.blockers.length).toBe(0);
      expect(limited.warnings.length).toBe(0);
      expect(limited.suggestions.length).toBe(0);
    });
  });
});
