/**
 * Eviction Rules Engine Optimizer
 *
 * Phase 17: Performance, Cost & Reliability Hardening
 *
 * Provides:
 * - Condition function precompilation and caching
 * - Condition validation result caching
 * - Pre-filtered rule sets by route and feature flags
 * - Engine safeguards (max rules, max conditions)
 * - Debug timing hooks for observability
 *
 * Performance improvements:
 * - Avoids per-request Function constructor calls
 * - Avoids repeated allowlist validation for same conditions
 * - Reduces array allocations in hot paths
 * - Provides early-exit optimizations
 */

import { validateEvictionCondition } from './eviction-rules-allowlist';

// ============================================================================
// TYPES
// ============================================================================

export interface CompiledCondition {
  condition: string;
  fn: (
    facts: Record<string, unknown>,
    computed: Record<string, unknown>,
    route: string
  ) => boolean;
  validated: boolean;
  validationError?: string;
}

export interface EngineStats {
  conditionCacheHits: number;
  conditionCacheMisses: number;
  validationCacheHits: number;
  validationCacheMisses: number;
  totalEvaluations: number;
  totalConditionEvaluations: number;
  avgEvaluationTimeMs: number;
  peakEvaluationTimeMs: number;
}

export interface TimingHook {
  ruleCount: number;
  conditionCount: number;
  blockerCount: number;
  warningCount: number;
  evaluationTimeMs: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface EngineConfig {
  /** Maximum rules that can be evaluated per request (default: 500) */
  maxRulesPerEvaluation: number;
  /** Maximum conditions per rule (default: 20) */
  maxConditionsPerRule: number;
  /** Enable debug timing hooks (default: false) */
  enableTimingHooks: boolean;
  /** Callback for timing data (dev/staging only) */
  onTimingData?: (data: TimingHook) => void;
  /** Fail-fast on malformed rules (default: true) */
  failFastOnMalformed: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: EngineConfig = {
  maxRulesPerEvaluation: 500,
  maxConditionsPerRule: 20,
  enableTimingHooks: false,
  failFastOnMalformed: true,
};

let currentConfig: EngineConfig = { ...DEFAULT_CONFIG };

// ============================================================================
// CACHES
// ============================================================================

/**
 * Cache for compiled condition functions.
 * Key: condition string
 * Value: compiled function that evaluates the condition
 */
const conditionFunctionCache = new Map<string, CompiledCondition>();

/**
 * Cache for condition validation results.
 * Key: condition string
 * Value: { valid: boolean, reason?: string }
 */
const validationCache = new Map<string, { valid: boolean; reason?: string }>();

/**
 * Cache size limits to prevent unbounded memory growth
 */
const MAX_CONDITION_CACHE_SIZE = 1000;
const MAX_VALIDATION_CACHE_SIZE = 2000;

// ============================================================================
// STATISTICS
// ============================================================================

let stats: EngineStats = {
  conditionCacheHits: 0,
  conditionCacheMisses: 0,
  validationCacheHits: 0,
  validationCacheMisses: 0,
  totalEvaluations: 0,
  totalConditionEvaluations: 0,
  avgEvaluationTimeMs: 0,
  peakEvaluationTimeMs: 0,
};

let evaluationTimes: number[] = [];
const MAX_TIMING_SAMPLES = 100;

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configure the engine optimizer.
 */
export function configureOptimizer(config: Partial<EngineConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Get current configuration.
 */
export function getOptimizerConfig(): EngineConfig {
  return { ...currentConfig };
}

/**
 * Reset configuration to defaults.
 */
export function resetOptimizerConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
}

// ============================================================================
// CONDITION VALIDATION CACHING
// ============================================================================

/**
 * Validate a condition with caching.
 * Returns cached result if available.
 */
export function validateConditionCached(condition: string): { valid: boolean; reason?: string } {
  // Check cache first
  const cached = validationCache.get(condition);
  if (cached !== undefined) {
    stats.validationCacheHits++;
    return cached;
  }

  stats.validationCacheMisses++;

  // Validate and cache
  const result = validateEvictionCondition(condition);
  const cacheValue = { valid: result.valid, reason: result.reason };

  // Enforce cache size limit with LRU-like eviction
  if (validationCache.size >= MAX_VALIDATION_CACHE_SIZE) {
    // Remove oldest entry (first entry in Map)
    const firstKey = validationCache.keys().next().value;
    if (firstKey) {
      validationCache.delete(firstKey);
    }
  }

  validationCache.set(condition, cacheValue);
  return cacheValue;
}

// ============================================================================
// CONDITION FUNCTION COMPILATION & CACHING
// ============================================================================

/**
 * Compile a condition string into a reusable function.
 * Caches the compiled function for future use.
 */
export function compileCondition(condition: string): CompiledCondition {
  // Check cache first
  const cached = conditionFunctionCache.get(condition);
  if (cached !== undefined) {
    stats.conditionCacheHits++;
    return cached;
  }

  stats.conditionCacheMisses++;

  // Validate first
  const validation = validateConditionCached(condition);
  if (!validation.valid) {
    const compiled: CompiledCondition = {
      condition,
      fn: () => false, // Return false for invalid conditions
      validated: false,
      validationError: validation.reason,
    };

    cacheCompiledCondition(condition, compiled);
    return compiled;
  }

  // Compile the function
  try {
    const evalFn = new Function(
      'facts',
      'computed',
      'route',
      'Array',
      'String',
      'Number',
      'Boolean',
      'Math',
      'Date',
      'Object',
      'parseInt',
      'parseFloat',
      'isNaN',
      'isFinite',
      `return (${condition});`
    ) as (
      facts: Record<string, unknown>,
      computed: Record<string, unknown>,
      route: string,
      ...builtins: unknown[]
    ) => boolean;

    // Create wrapper that passes builtins
    const wrappedFn = (
      facts: Record<string, unknown>,
      computed: Record<string, unknown>,
      route: string
    ): boolean => {
      try {
        return evalFn(
          facts,
          computed,
          route,
          Array,
          String,
          Number,
          Boolean,
          Math,
          Date,
          Object,
          parseInt,
          parseFloat,
          isNaN,
          isFinite
        );
      } catch {
        return false;
      }
    };

    const compiled: CompiledCondition = {
      condition,
      fn: wrappedFn,
      validated: true,
    };

    cacheCompiledCondition(condition, compiled);
    return compiled;
  } catch (error) {
    // Compilation failed
    const compiled: CompiledCondition = {
      condition,
      fn: () => false,
      validated: false,
      validationError: `Compilation failed: ${error instanceof Error ? error.message : 'unknown'}`,
    };

    cacheCompiledCondition(condition, compiled);
    return compiled;
  }
}

/**
 * Cache a compiled condition with size limit enforcement.
 */
function cacheCompiledCondition(condition: string, compiled: CompiledCondition): void {
  // Enforce cache size limit
  if (conditionFunctionCache.size >= MAX_CONDITION_CACHE_SIZE) {
    const firstKey = conditionFunctionCache.keys().next().value;
    if (firstKey) {
      conditionFunctionCache.delete(firstKey);
    }
  }

  conditionFunctionCache.set(condition, compiled);
}

/**
 * Evaluate a condition using cached compiled function.
 */
export function evaluateConditionOptimized(
  condition: string,
  facts: Record<string, unknown>,
  computed: Record<string, unknown>,
  route: string
): boolean {
  stats.totalConditionEvaluations++;

  const compiled = compileCondition(condition);
  if (!compiled.validated) {
    return false;
  }

  return compiled.fn(facts, computed, route);
}

// ============================================================================
// SAFEGUARDS
// ============================================================================

export class EngineValidationError extends Error {
  constructor(
    message: string,
    public code: 'MAX_RULES_EXCEEDED' | 'MAX_CONDITIONS_EXCEEDED' | 'MALFORMED_RULE'
  ) {
    super(message);
    this.name = 'EngineValidationError';
  }
}

/**
 * Validate rule count against limit.
 */
export function validateRuleCount(count: number): void {
  if (count > currentConfig.maxRulesPerEvaluation) {
    if (currentConfig.failFastOnMalformed) {
      throw new EngineValidationError(
        `Rule count ${count} exceeds maximum ${currentConfig.maxRulesPerEvaluation}`,
        'MAX_RULES_EXCEEDED'
      );
    }
  }
}

/**
 * Validate condition count for a rule.
 */
export function validateConditionCount(ruleId: string, count: number): void {
  if (count > currentConfig.maxConditionsPerRule) {
    if (currentConfig.failFastOnMalformed) {
      throw new EngineValidationError(
        `Rule ${ruleId} has ${count} conditions, exceeds maximum ${currentConfig.maxConditionsPerRule}`,
        'MAX_CONDITIONS_EXCEEDED'
      );
    }
  }
}

/**
 * Validate a rule's structure before evaluation.
 */
export function validateRuleStructure(rule: {
  id?: string;
  applies_when?: Array<{ condition?: string }>;
  severity?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!rule.id) {
    errors.push('Rule missing id');
  }

  if (!rule.applies_when || !Array.isArray(rule.applies_when)) {
    errors.push(`Rule ${rule.id || 'unknown'}: applies_when must be an array`);
  } else {
    for (let i = 0; i < rule.applies_when.length; i++) {
      const cond = rule.applies_when[i];
      if (!cond.condition || typeof cond.condition !== 'string') {
        errors.push(`Rule ${rule.id || 'unknown'}: applies_when[${i}] missing condition string`);
      }
    }
  }

  if (!rule.severity || !['blocker', 'warning', 'suggestion'].includes(rule.severity)) {
    errors.push(`Rule ${rule.id || 'unknown'}: invalid severity`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// TIMING HOOKS
// ============================================================================

/**
 * Start timing an evaluation.
 */
export function startTiming(): { startTime: number } {
  return { startTime: performance.now() };
}

/**
 * End timing and record metrics.
 */
export function endTiming(
  timing: { startTime: number },
  data: Omit<TimingHook, 'evaluationTimeMs'>
): TimingHook {
  const evaluationTimeMs = performance.now() - timing.startTime;

  const hookData: TimingHook = {
    ...data,
    evaluationTimeMs,
  };

  // Update stats
  stats.totalEvaluations++;
  evaluationTimes.push(evaluationTimeMs);

  // Keep only recent samples
  if (evaluationTimes.length > MAX_TIMING_SAMPLES) {
    evaluationTimes = evaluationTimes.slice(-MAX_TIMING_SAMPLES);
  }

  // Update averages
  stats.avgEvaluationTimeMs =
    evaluationTimes.reduce((a, b) => a + b, 0) / evaluationTimes.length;
  stats.peakEvaluationTimeMs = Math.max(stats.peakEvaluationTimeMs, evaluationTimeMs);

  // Call timing hook if enabled
  if (currentConfig.enableTimingHooks && currentConfig.onTimingData) {
    currentConfig.onTimingData(hookData);
  }

  return hookData;
}

// ============================================================================
// STATISTICS & MONITORING
// ============================================================================

/**
 * Get current engine statistics.
 */
export function getEngineStats(): EngineStats {
  return { ...stats };
}

/**
 * Reset statistics (for testing).
 */
export function resetEngineStats(): void {
  stats = {
    conditionCacheHits: 0,
    conditionCacheMisses: 0,
    validationCacheHits: 0,
    validationCacheMisses: 0,
    totalEvaluations: 0,
    totalConditionEvaluations: 0,
    avgEvaluationTimeMs: 0,
    peakEvaluationTimeMs: 0,
  };
  evaluationTimes = [];
}

/**
 * Get cache sizes for monitoring.
 */
export function getCacheSizes(): { conditionCache: number; validationCache: number } {
  return {
    conditionCache: conditionFunctionCache.size,
    validationCache: validationCache.size,
  };
}

/**
 * Clear all caches (for testing or memory pressure).
 */
export function clearAllCaches(): void {
  conditionFunctionCache.clear();
  validationCache.clear();
}

/**
 * Precompile conditions for a set of rules.
 * Call during startup or config reload to warm the cache.
 */
export function precompileConditions(
  rules: Array<{ applies_when: Array<{ condition: string }> }>
): { compiled: number; failed: number } {
  let compiled = 0;
  let failed = 0;

  for (const rule of rules) {
    for (const cond of rule.applies_when) {
      const result = compileCondition(cond.condition);
      if (result.validated) {
        compiled++;
      } else {
        failed++;
      }
    }
  }

  return { compiled, failed };
}

// ============================================================================
// DIAGNOSTIC HELPERS
// ============================================================================

/**
 * Get diagnostic information for debugging.
 */
export function getDiagnostics(): {
  config: EngineConfig;
  stats: EngineStats;
  cacheSizes: { conditionCache: number; validationCache: number };
  cacheHitRate: { condition: number; validation: number };
} {
  const conditionTotal = stats.conditionCacheHits + stats.conditionCacheMisses;
  const validationTotal = stats.validationCacheHits + stats.validationCacheMisses;

  return {
    config: getOptimizerConfig(),
    stats: getEngineStats(),
    cacheSizes: getCacheSizes(),
    cacheHitRate: {
      condition: conditionTotal > 0 ? stats.conditionCacheHits / conditionTotal : 0,
      validation: validationTotal > 0 ? stats.validationCacheHits / validationTotal : 0,
    },
  };
}

/**
 * Print diagnostic summary to console.
 */
export function printDiagnostics(): void {
  const diag = getDiagnostics();
  console.log('=== Eviction Rules Engine Diagnostics ===');
  console.log('Configuration:');
  console.log(`  Max rules per evaluation: ${diag.config.maxRulesPerEvaluation}`);
  console.log(`  Max conditions per rule: ${diag.config.maxConditionsPerRule}`);
  console.log(`  Timing hooks: ${diag.config.enableTimingHooks ? 'enabled' : 'disabled'}`);
  console.log(`  Fail-fast: ${diag.config.failFastOnMalformed ? 'enabled' : 'disabled'}`);
  console.log('Statistics:');
  console.log(`  Total evaluations: ${diag.stats.totalEvaluations}`);
  console.log(`  Total condition evaluations: ${diag.stats.totalConditionEvaluations}`);
  console.log(`  Avg evaluation time: ${diag.stats.avgEvaluationTimeMs.toFixed(2)}ms`);
  console.log(`  Peak evaluation time: ${diag.stats.peakEvaluationTimeMs.toFixed(2)}ms`);
  console.log('Cache:');
  console.log(`  Condition cache size: ${diag.cacheSizes.conditionCache}`);
  console.log(`  Validation cache size: ${diag.cacheSizes.validationCache}`);
  console.log(`  Condition hit rate: ${(diag.cacheHitRate.condition * 100).toFixed(1)}%`);
  console.log(`  Validation hit rate: ${(diag.cacheHitRate.validation * 100).toFixed(1)}%`);
}
