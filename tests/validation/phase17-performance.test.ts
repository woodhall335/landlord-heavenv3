/**
 * Phase 17 Performance Tests
 *
 * Tests for performance optimizations and safeguards in the validation engine:
 * - Condition caching and precompilation
 * - Engine safeguards (max rules, max conditions)
 * - Timing hooks
 * - Cache hit rates
 */

import {
  compileCondition,
  evaluateConditionOptimized,
  validateConditionCached,
  validateRuleCount,
  validateConditionCount,
  validateRuleStructure,
  configureOptimizer,
  resetOptimizerConfig,
  getEngineStats,
  resetEngineStats,
  getCacheSizes,
  clearAllCaches,
  precompileConditions,
  getDiagnostics,
  startTiming,
  endTiming,
  EngineValidationError,
} from '../../src/lib/validation/eviction-rules-optimizer';
import {
  evaluateEvictionRules,
  loadRulesConfig,
  warmConditionCache,
  clearConfigCache,
} from '../../src/lib/validation/eviction-rules-engine';
import {
  getPhase13Message,
  getSupportCategory,
  clearMessageCatalogCache,
} from '../../src/lib/validation/phase13-messages';

// Reset caches before each test
beforeEach(() => {
  clearAllCaches();
  resetEngineStats();
  resetOptimizerConfig();
  clearConfigCache();
  clearMessageCatalogCache();
});

describe('Phase 17: Condition Caching', () => {
  describe('compileCondition', () => {
    it('should compile a valid condition', () => {
      const result = compileCondition('facts.deposit_taken === true');
      expect(result.validated).toBe(true);
      expect(result.fn).toBeInstanceOf(Function);
    });

    it('should cache compiled conditions', () => {
      const condition = 'facts.deposit_taken === true';

      // First call - cache miss
      compileCondition(condition);
      const stats1 = getEngineStats();
      expect(stats1.conditionCacheMisses).toBe(1);
      expect(stats1.conditionCacheHits).toBe(0);

      // Second call - cache hit
      compileCondition(condition);
      const stats2 = getEngineStats();
      expect(stats2.conditionCacheHits).toBe(1);
      expect(stats2.conditionCacheMisses).toBe(1);
    });

    it('should reject invalid conditions', () => {
      const result = compileCondition('eval("malicious")');
      expect(result.validated).toBe(false);
      expect(result.validationError).toBeDefined();
    });

    it('should return false for invalid conditions when evaluated', () => {
      const result = compileCondition('eval("malicious")');
      expect(result.fn({}, {}, 'section_21')).toBe(false);
    });
  });

  describe('evaluateConditionOptimized', () => {
    it('should evaluate simple conditions', () => {
      const result = evaluateConditionOptimized(
        'facts.deposit_taken === true',
        { deposit_taken: true },
        {},
        'section_21'
      );
      expect(result).toBe(true);
    });

    it('should return false for non-matching conditions', () => {
      const result = evaluateConditionOptimized(
        'facts.deposit_taken === true',
        { deposit_taken: false },
        {},
        'section_21'
      );
      expect(result).toBe(false);
    });

    it('should use cached functions on repeated calls', () => {
      const condition = 'facts.deposit_taken === true';
      const facts = { deposit_taken: true };

      // Evaluate multiple times
      for (let i = 0; i < 10; i++) {
        evaluateConditionOptimized(condition, facts, {}, 'section_21');
      }

      const stats = getEngineStats();
      expect(stats.conditionCacheHits).toBe(9); // First is miss, rest are hits
      expect(stats.conditionCacheMisses).toBe(1);
    });
  });

  describe('validateConditionCached', () => {
    it('should cache validation results', () => {
      const condition = 'facts.deposit_taken === true';

      // First call - miss
      validateConditionCached(condition);
      const stats1 = getEngineStats();
      expect(stats1.validationCacheMisses).toBe(1);

      // Second call - hit
      validateConditionCached(condition);
      const stats2 = getEngineStats();
      expect(stats2.validationCacheHits).toBe(1);
    });
  });
});

describe('Phase 17: Engine Safeguards', () => {
  describe('validateRuleCount', () => {
    it('should pass for rule counts under limit', () => {
      expect(() => validateRuleCount(100)).not.toThrow();
      expect(() => validateRuleCount(500)).not.toThrow();
    });

    it('should throw for rule counts over default limit', () => {
      expect(() => validateRuleCount(501)).toThrow(EngineValidationError);
    });

    it('should respect custom limit', () => {
      configureOptimizer({ maxRulesPerEvaluation: 10 });
      expect(() => validateRuleCount(11)).toThrow(EngineValidationError);
    });

    it('should not throw when failFastOnMalformed is false', () => {
      configureOptimizer({ failFastOnMalformed: false });
      expect(() => validateRuleCount(1000)).not.toThrow();
    });
  });

  describe('validateConditionCount', () => {
    it('should pass for condition counts under limit', () => {
      expect(() => validateConditionCount('test_rule', 5)).not.toThrow();
      expect(() => validateConditionCount('test_rule', 20)).not.toThrow();
    });

    it('should throw for condition counts over default limit', () => {
      expect(() => validateConditionCount('test_rule', 21)).toThrow(EngineValidationError);
    });
  });

  describe('validateRuleStructure', () => {
    it('should validate valid rule structure', () => {
      const result = validateRuleStructure({
        id: 'test_rule',
        severity: 'blocker',
        applies_when: [{ condition: 'facts.test === true' }],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing id', () => {
      const result = validateRuleStructure({
        severity: 'blocker',
        applies_when: [{ condition: 'facts.test === true' }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Rule missing id');
    });

    it('should detect invalid severity', () => {
      const result = validateRuleStructure({
        id: 'test_rule',
        severity: 'invalid',
        applies_when: [{ condition: 'facts.test === true' }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('invalid severity'))).toBe(true);
    });

    it('should detect missing applies_when', () => {
      const result = validateRuleStructure({
        id: 'test_rule',
        severity: 'blocker',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('applies_when must be an array'))).toBe(true);
    });
  });
});

describe('Phase 17: Timing Hooks', () => {
  it('should record timing data when enabled', () => {
    let capturedData: any = null;

    configureOptimizer({
      enableTimingHooks: true,
      onTimingData: (data) => {
        capturedData = data;
      },
    });

    const timing = startTiming();
    // Simulate some work
    const data = endTiming(timing, {
      ruleCount: 10,
      conditionCount: 25,
      blockerCount: 1,
      warningCount: 2,
      cacheHits: 20,
      cacheMisses: 5,
    });

    expect(data.evaluationTimeMs).toBeGreaterThanOrEqual(0);
    expect(data.ruleCount).toBe(10);
    expect(data.conditionCount).toBe(25);
    expect(capturedData).not.toBeNull();
    expect(capturedData.ruleCount).toBe(10);
  });

  it('should track peak evaluation time', () => {
    configureOptimizer({ enableTimingHooks: true });

    // Record multiple timings
    for (let i = 0; i < 5; i++) {
      const timing = startTiming();
      endTiming(timing, {
        ruleCount: 10,
        conditionCount: 25,
        blockerCount: 0,
        warningCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
      });
    }

    const stats = getEngineStats();
    expect(stats.totalEvaluations).toBe(5);
    expect(stats.peakEvaluationTimeMs).toBeGreaterThanOrEqual(0);
  });
});

describe('Phase 17: Cache Management', () => {
  describe('precompileConditions', () => {
    it('should precompile conditions from rules', () => {
      // Use identifiers that are in the allowlist
      const rules = [
        { applies_when: [
          { condition: 'facts.deposit_taken === true' },
          { condition: 'facts.deposit_protected === false' },
        ]},
        { applies_when: [{ condition: 'facts.landlord_name !== null' }] },
      ];

      const result = precompileConditions(rules);
      expect(result.compiled).toBe(3);
      expect(result.failed).toBe(0);

      const sizes = getCacheSizes();
      expect(sizes.conditionCache).toBe(3);
    });

    it('should report failed compilations', () => {
      const rules = [
        { applies_when: [{ condition: 'eval("bad")' }] }, // Should fail (dangerous pattern)
        { applies_when: [{ condition: 'facts.deposit_taken === true' }] }, // Should pass
      ];

      const result = precompileConditions(rules);
      // eval is rejected at validation, so compiled=1 (valid one), failed=1 (eval one)
      expect(result.compiled).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('clearAllCaches', () => {
    it('should clear all caches', () => {
      // Populate caches
      compileCondition('facts.a === true');
      compileCondition('facts.b === true');

      let sizes = getCacheSizes();
      expect(sizes.conditionCache).toBe(2);

      clearAllCaches();

      sizes = getCacheSizes();
      expect(sizes.conditionCache).toBe(0);
      expect(sizes.validationCache).toBe(0);
    });
  });
});

describe('Phase 17: Diagnostics', () => {
  it('should return comprehensive diagnostics', () => {
    // Generate some activity
    compileCondition('facts.a === true');
    compileCondition('facts.a === true'); // Hit

    const diag = getDiagnostics();

    expect(diag.config).toBeDefined();
    expect(diag.stats).toBeDefined();
    expect(diag.cacheSizes).toBeDefined();
    expect(diag.cacheHitRate).toBeDefined();

    // Should have 50% condition cache hit rate (1 hit, 1 miss)
    expect(diag.cacheHitRate.condition).toBe(0.5);
    // Validation cache is also used internally by compileCondition
    expect(diag.cacheHitRate.validation).toBeGreaterThanOrEqual(0);
  });
});

describe('Phase 17: Integration with Rules Engine', () => {
  it('should use optimized condition evaluation in evaluateEvictionRules', () => {
    // Clear stats
    resetEngineStats();

    // Run a validation
    const result = evaluateEvictionRules(
      {
        landlord_name: 'Test Landlord',
        tenant_name: 'Test Tenant',
        property_address_line1: '123 Test St',
        property_address_postcode: 'TE1 1ST',
        notice_service_date: '2024-01-01',
        notice_expiry_date: '2024-06-01',
        deposit_taken: true,
        deposit_protected: true,
      },
      'england',
      'notice_only',
      'section_21'
    );

    // Should have evaluated conditions
    const stats = getEngineStats();
    expect(stats.totalConditionEvaluations).toBeGreaterThan(0);

    // Cache should have entries
    const sizes = getCacheSizes();
    expect(sizes.conditionCache).toBeGreaterThan(0);
  });

  it('should benefit from cache on repeated evaluations', () => {
    resetEngineStats();

    const facts = {
      landlord_name: 'Test Landlord',
      tenant_name: 'Test Tenant',
      property_address_line1: '123 Test St',
      property_address_postcode: 'TE1 1ST',
    };

    // First evaluation - populates cache
    evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');
    const stats1 = getEngineStats();

    // Second evaluation - should have more cache hits
    evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');
    const stats2 = getEngineStats();

    expect(stats2.conditionCacheHits).toBeGreaterThan(stats1.conditionCacheHits);
  });
});

describe('Phase 17: warmConditionCache', () => {
  it('should warm cache for all configs', () => {
    clearAllCaches();
    clearConfigCache();

    const result = warmConditionCache();

    expect(result.configsLoaded).toBeGreaterThan(0);
    expect(result.conditionsCompiled).toBeGreaterThan(0);

    // Cache should be populated
    const sizes = getCacheSizes();
    expect(sizes.conditionCache).toBeGreaterThan(0);
  });
});

describe('Phase 17: Message Catalog O(1) Lookup', () => {
  it('should have O(1) lookup for Phase 13 messages', () => {
    // First call loads catalog
    const msg1 = getPhase13Message('s21_deposit_cap_exceeded');
    expect(msg1).not.toBeNull();

    // Subsequent calls should be fast (O(1) from Map)
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      getPhase13Message('s21_deposit_cap_exceeded');
    }
    const elapsed = performance.now() - start;

    // 1000 lookups should take less than 10ms (conservative)
    expect(elapsed).toBeLessThan(10);
  });

  it('should have O(1) lookup for support categories', () => {
    // First call loads catalog
    const cat1 = getSupportCategory('s21_deposit_cap_exceeded');
    expect(cat1).not.toBeNull();

    // Subsequent calls should be fast
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      getSupportCategory('s21_deposit_cap_exceeded');
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(10);
  });
});

describe('Phase 17: Performance Benchmarks', () => {
  it('should evaluate rules within acceptable time', () => {
    const facts = {
      landlord_name: 'Test Landlord',
      tenant_name: 'Test Tenant',
      property_address_line1: '123 Test St',
      property_address_postcode: 'TE1 1ST',
      notice_service_date: '2024-01-01',
      notice_expiry_date: '2024-06-01',
      deposit_taken: true,
      deposit_protected: true,
      prescribed_info_given: true,
      gas_safety_cert_provided: true,
      epc_provided: true,
      how_to_rent_provided: true,
    };

    // Warm the cache
    evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');

    // Benchmark
    const iterations = 100;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      evaluateEvictionRules(facts, 'england', 'notice_only', 'section_21');
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;

    // Average should be under 5ms per evaluation (with cache warmed)
    expect(avgMs).toBeLessThan(5);
    console.log(`Average evaluation time (cached): ${avgMs.toFixed(2)}ms`);
  });
});
