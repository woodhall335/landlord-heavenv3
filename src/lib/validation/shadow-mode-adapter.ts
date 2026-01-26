/**
 * YAML Validation Adapter
 *
 * Phase 12: YAML is the sole validation system. All legacy TypeScript validators
 * have been removed following successful completion of Phase 11B stability window.
 *
 * This module provides:
 * - YAML-only validation wrappers for notice_only and complete_pack products
 * - Telemetry and metrics collection
 * - Environment variable checks
 *
 * HISTORICAL NOTE:
 * This file previously contained shadow mode comparison logic between TS and YAML
 * validators. That code has been removed as part of Phase 12 (TS Code Removal).
 * For historical reference, see git history prior to Phase 12.
 */

import {
  evaluateEvictionRules,
  type Jurisdiction,
  type Product,
  type EvictionRoute,
} from './eviction-rules-engine';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationTelemetryEvent {
  timestamp: string;
  jurisdiction: string;
  product: string;
  route: string;
  blockerCount: number;
  warningCount: number;
  blockerIds: string[];
  warningIds: string[];
  durationMs: number;
  isValid: boolean;
}

export interface TelemetryMetrics {
  totalValidations: number;
  validCount: number;
  invalidCount: number;
  avgDurationMs: number;
  blockerFrequency: Map<string, number>;
}

// In-memory metrics store
const metricsStore: ValidationTelemetryEvent[] = [];
const MAX_METRICS_STORE_SIZE = 1000;

// YAML-only mode counters
let yamlOnlyValidationCount = 0;
let yamlOnlyErrorCount = 0;

// ============================================================================
// ENVIRONMENT CHECKS
// ============================================================================

/**
 * Check if YAML-only mode is enabled.
 * Phase 12: This is the only supported mode. Returns true for compatibility.
 */
export function isYamlOnlyMode(): boolean {
  // Phase 12: YAML-only is always active
  return true;
}

/**
 * Check if telemetry is enabled.
 */
export function isTelemetryEnabled(): boolean {
  return process.env.EVICTION_TELEMETRY_ENABLED === 'true';
}

// ============================================================================
// YAML-ONLY VALIDATION STATISTICS
// ============================================================================

/**
 * Get YAML-only mode statistics for monitoring.
 */
export function getYamlOnlyStats(): {
  totalValidations: number;
  errorCount: number;
  errorRate: number;
  isYamlOnlyActive: boolean;
} {
  return {
    totalValidations: yamlOnlyValidationCount,
    errorCount: yamlOnlyErrorCount,
    errorRate: yamlOnlyValidationCount > 0 ? yamlOnlyErrorCount / yamlOnlyValidationCount : 0,
    isYamlOnlyActive: true, // Phase 12: Always active
  };
}

/**
 * Reset YAML-only statistics (for testing).
 */
export function resetYamlOnlyStats(): void {
  yamlOnlyValidationCount = 0;
  yamlOnlyErrorCount = 0;
}

/**
 * Increment YAML-only validation counter.
 */
export function trackYamlOnlyValidation(success: boolean): void {
  yamlOnlyValidationCount++;
  if (!success) {
    yamlOnlyErrorCount++;
  }
}

/**
 * Get fallback statistics for monitoring.
 * Phase 12: Always returns zero fallbacks since TS is removed.
 */
export function getFallbackStats(): {
  totalRequests: number;
  fallbackCount: number;
  fallbackRate: number;
} {
  return {
    totalRequests: yamlOnlyValidationCount,
    fallbackCount: 0, // Phase 12: No TS fallback exists
    fallbackRate: 0,
  };
}

// ============================================================================
// TELEMETRY FUNCTIONS
// ============================================================================

/**
 * Record a validation telemetry event.
 */
export function recordValidationTelemetry(
  event: ValidationTelemetryEvent
): ValidationTelemetryEvent {
  // Store in memory (with size limit)
  if (metricsStore.length >= MAX_METRICS_STORE_SIZE) {
    metricsStore.shift(); // Remove oldest
  }
  metricsStore.push(event);

  // Log if telemetry enabled
  if (isTelemetryEnabled()) {
    console.log('[Telemetry]', JSON.stringify(event));
  }

  return event;
}

/**
 * Get aggregated metrics from the in-memory store.
 */
export function getAggregatedMetrics(
  filter?: {
    jurisdiction?: string;
    product?: string;
    route?: string;
    since?: Date;
  }
): TelemetryMetrics {
  let events = [...metricsStore];

  // Apply filters
  if (filter?.jurisdiction) {
    events = events.filter((e) => e.jurisdiction === filter.jurisdiction);
  }
  if (filter?.product) {
    events = events.filter((e) => e.product === filter.product);
  }
  if (filter?.route) {
    events = events.filter((e) => e.route === filter.route);
  }
  if (filter?.since) {
    const sinceTs = filter.since.toISOString();
    events = events.filter((e) => e.timestamp >= sinceTs);
  }

  // Calculate metrics
  const totalValidations = events.length;
  const validCount = events.filter((e) => e.isValid).length;
  const invalidCount = totalValidations - validCount;
  const avgDurationMs =
    totalValidations > 0
      ? events.reduce((sum, e) => sum + e.durationMs, 0) / totalValidations
      : 0;

  // Count blocker frequency
  const blockerFrequency = new Map<string, number>();
  for (const event of events) {
    for (const id of event.blockerIds) {
      blockerFrequency.set(id, (blockerFrequency.get(id) || 0) + 1);
    }
  }

  return {
    totalValidations,
    validCount,
    invalidCount,
    avgDurationMs,
    blockerFrequency,
  };
}

/**
 * Get top N blockers by frequency.
 */
export function getTopBlockers(
  n: number = 10,
  filter?: {
    jurisdiction?: string;
    product?: string;
    route?: string;
  }
): Array<{ ruleId: string; count: number }> {
  const metrics = getAggregatedMetrics(filter);
  return Array.from(metrics.blockerFrequency.entries())
    .map(([ruleId, count]) => ({ ruleId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * Get top N discrepancies by frequency.
 * Phase 12: Returns empty array since TS comparison no longer exists.
 */
export function getTopDiscrepancies(
  n: number = 10,
  filter?: {
    jurisdiction?: string;
    product?: string;
    route?: string;
  }
): Array<{ key: string; count: number }> {
  // Phase 12: No TS comparison = no discrepancies
  return [];
}

/**
 * Clear the metrics store.
 */
export function clearMetricsStore(): void {
  metricsStore.length = 0;
}

/**
 * Get the raw metrics store.
 */
export function getMetricsStore(): ValidationTelemetryEvent[] {
  return [...metricsStore];
}

// ============================================================================
// SAMPLING CONTROLS
// ============================================================================

/**
 * Get the telemetry sampling rate from environment variable.
 */
export function getTelemetrySampleRate(): number {
  const rate = parseFloat(process.env.VALIDATION_TELEMETRY_SAMPLE_RATE || '1.0');
  if (isNaN(rate) || rate < 0) return 0;
  if (rate > 1) return 1;
  return rate;
}

/**
 * Determine if the current request should be sampled for telemetry.
 */
export function shouldSampleTelemetry(): boolean {
  if (!isTelemetryEnabled()) return false;
  const rate = getTelemetrySampleRate();
  if (rate >= 1) return true;
  if (rate <= 0) return false;
  return Math.random() < rate;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper to derive jurisdiction from wizard facts.
 */
export function deriveJurisdictionFromFacts(
  facts: Record<string, unknown>
): 'england' | 'wales' | 'scotland' {
  const jurisdiction = (facts.jurisdiction || facts.property_country || facts.country || 'england') as string;
  const normalized = String(jurisdiction).toLowerCase().replace(/[^a-z-]/g, '');

  if (normalized.includes('wales')) return 'wales';
  if (normalized.includes('scotland')) return 'scotland';
  return 'england';
}

/**
 * Helper to derive route from wizard facts.
 */
export function deriveRouteFromFacts(facts: Record<string, unknown>): string {
  return (facts.selected_notice_route || facts.eviction_route || 'unknown') as string;
}

// ============================================================================
// YAML-ONLY VALIDATION WRAPPERS
// ============================================================================

export interface YamlValidationResult {
  blockers: Array<{ id: string; severity: 'blocker'; message: string; rationale?: string }>;
  warnings: Array<{ id: string; severity: 'warning'; message: string; rationale?: string }>;
  isValid: boolean;
  durationMs: number;
}

/**
 * YAML-only notice validation.
 *
 * Phase 12: This is the sole validation path for notice_only products.
 * All validation is performed by the YAML rules engine.
 *
 * @param params - Validation parameters
 * @returns Validation result from YAML engine
 * @throws If YAML validation fails
 */
export async function runYamlOnlyNoticeValidation(params: {
  jurisdiction: 'england' | 'wales' | 'scotland';
  route: string;
  facts: Record<string, unknown>;
}): Promise<YamlValidationResult> {
  const startTime = Date.now();

  // Run YAML validation
  const yamlResult = evaluateEvictionRules(
    params.facts as Record<string, unknown>,
    params.jurisdiction as Jurisdiction,
    'notice_only' as Product,
    params.route as EvictionRoute
  );

  if (!yamlResult) {
    throw new Error(`YAML validation returned no result for ${params.jurisdiction}/notice_only/${params.route}`);
  }

  const durationMs = Date.now() - startTime;

  // Record telemetry if sampling
  if (shouldSampleTelemetry()) {
    recordValidationTelemetry({
      timestamp: new Date().toISOString(),
      jurisdiction: params.jurisdiction,
      product: 'notice_only',
      route: params.route,
      blockerCount: yamlResult.blockers.length,
      warningCount: yamlResult.warnings.length,
      blockerIds: yamlResult.blockers.map((b) => b.id),
      warningIds: yamlResult.warnings.map((w) => w.id),
      durationMs,
      isValid: yamlResult.blockers.length === 0,
    });
  }

  return {
    blockers: yamlResult.blockers.map((b) => ({
      id: b.id,
      severity: 'blocker' as const,
      message: b.message,
      rationale: b.rationale,
    })),
    warnings: yamlResult.warnings.map((w) => ({
      id: w.id,
      severity: 'warning' as const,
      message: w.message,
      rationale: w.rationale,
    })),
    isValid: yamlResult.blockers.length === 0,
    durationMs,
  };
}

/**
 * YAML-only complete_pack validation.
 *
 * Phase 12: This is the sole validation path for complete_pack products.
 * All validation is performed by the YAML rules engine.
 *
 * @param params - Validation parameters
 * @returns Validation result from YAML engine
 * @throws If YAML validation fails
 */
export async function runYamlOnlyCompletePackValidation(params: {
  jurisdiction: 'england' | 'wales' | 'scotland';
  route: string;
  facts: Record<string, unknown>;
}): Promise<YamlValidationResult> {
  const startTime = Date.now();

  // Run YAML validation
  const yamlResult = evaluateEvictionRules(
    params.facts as Record<string, unknown>,
    params.jurisdiction as Jurisdiction,
    'complete_pack' as Product,
    params.route as EvictionRoute
  );

  if (!yamlResult) {
    throw new Error(`YAML validation returned no result for ${params.jurisdiction}/complete_pack/${params.route}`);
  }

  const durationMs = Date.now() - startTime;

  // Record telemetry if sampling
  if (shouldSampleTelemetry()) {
    recordValidationTelemetry({
      timestamp: new Date().toISOString(),
      jurisdiction: params.jurisdiction,
      product: 'complete_pack',
      route: params.route,
      blockerCount: yamlResult.blockers.length,
      warningCount: yamlResult.warnings.length,
      blockerIds: yamlResult.blockers.map((b) => b.id),
      warningIds: yamlResult.warnings.map((w) => w.id),
      durationMs,
      isValid: yamlResult.blockers.length === 0,
    });
  }

  return {
    blockers: yamlResult.blockers.map((b) => ({
      id: b.id,
      severity: 'blocker' as const,
      message: b.message,
      rationale: b.rationale,
    })),
    warnings: yamlResult.warnings.map((w) => ({
      id: w.id,
      severity: 'warning' as const,
      message: w.message,
      rationale: w.rationale,
    })),
    isValid: yamlResult.blockers.length === 0,
    durationMs,
  };
}
