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
  isPhase13Enabled,
  type Jurisdiction,
  type Product,
  type EvictionRoute,
} from './eviction-rules-engine';
import {
  getPhase13Message,
  enhanceValidationIssue,
  type EnhancedValidationMessage,
  type ValidationIssueWithHelp,
} from './phase13-messages';

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
  // Phase 14: Track Phase 13 rules separately
  phase13BlockerIds?: string[];
  phase13WarningIds?: string[];
  phase13Enabled?: boolean;
}

export interface TelemetryMetrics {
  totalValidations: number;
  validCount: number;
  invalidCount: number;
  avgDurationMs: number;
  blockerFrequency: Map<string, number>;
  // Phase 14: Phase 13 specific metrics
  phase13BlockerFrequency: Map<string, number>;
  phase13EnabledCount: number;
  phase13NewlyBlockedCount: number;
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

  // Phase 14: Count Phase 13 specific blocker frequency
  const phase13BlockerFrequency = new Map<string, number>();
  let phase13EnabledCount = 0;
  let phase13NewlyBlockedCount = 0;

  for (const event of events) {
    if (event.phase13Enabled) {
      phase13EnabledCount++;
      // Count Phase 13 specific blockers
      if (event.phase13BlockerIds && event.phase13BlockerIds.length > 0) {
        for (const id of event.phase13BlockerIds) {
          phase13BlockerFrequency.set(id, (phase13BlockerFrequency.get(id) || 0) + 1);
        }
        // Case was newly blocked if it only has Phase 13 blockers
        // (would have passed without Phase 13 rules)
        const nonPhase13Blockers = event.blockerIds.filter(
          (id) => !event.phase13BlockerIds?.includes(id)
        );
        if (nonPhase13Blockers.length === 0 && event.phase13BlockerIds.length > 0) {
          phase13NewlyBlockedCount++;
        }
      }
    }
  }

  return {
    totalValidations,
    validCount,
    invalidCount,
    avgDurationMs,
    blockerFrequency,
    phase13BlockerFrequency,
    phase13EnabledCount,
    phase13NewlyBlockedCount,
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
 * Get top N Phase 13 blockers by frequency.
 * Phase 14: Specifically tracks blockers from Phase 13 correctness improvements.
 */
export function getTopPhase13Blockers(
  n: number = 10,
  filter?: {
    jurisdiction?: string;
    product?: string;
    route?: string;
  }
): Array<{ ruleId: string; count: number }> {
  const metrics = getAggregatedMetrics(filter);
  return Array.from(metrics.phase13BlockerFrequency.entries())
    .map(([ruleId, count]) => ({ ruleId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * Get Phase 14 rollout impact metrics.
 * Provides key statistics for monitoring Phase 13 rule rollout.
 */
export function getPhase14ImpactMetrics(
  filter?: {
    jurisdiction?: string;
    product?: string;
    route?: string;
  }
): {
  totalValidations: number;
  phase13EnabledCount: number;
  phase13EnabledPercent: number;
  phase13NewlyBlockedCount: number;
  newlyBlockedPercent: number;
  topPhase13Blockers: Array<{ ruleId: string; count: number }>;
  warningToBlockerRatio: number;
} {
  const metrics = getAggregatedMetrics(filter);
  const events = getMetricsStore();

  // Calculate warning to blocker ratio for Phase 13 rules
  let phase13Warnings = 0;
  let phase13Blockers = 0;
  for (const event of events) {
    if (event.phase13Enabled) {
      phase13Blockers += event.phase13BlockerIds?.length || 0;
      phase13Warnings += event.phase13WarningIds?.length || 0;
    }
  }

  return {
    totalValidations: metrics.totalValidations,
    phase13EnabledCount: metrics.phase13EnabledCount,
    phase13EnabledPercent: metrics.totalValidations > 0
      ? (metrics.phase13EnabledCount / metrics.totalValidations) * 100
      : 0,
    phase13NewlyBlockedCount: metrics.phase13NewlyBlockedCount,
    newlyBlockedPercent: metrics.phase13EnabledCount > 0
      ? (metrics.phase13NewlyBlockedCount / metrics.phase13EnabledCount) * 100
      : 0,
    topPhase13Blockers: getTopPhase13Blockers(10, filter),
    warningToBlockerRatio: phase13Blockers > 0 ? phase13Warnings / phase13Blockers : 0,
  };
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
// PHASE 13 RULE IDENTIFICATION
// ============================================================================

/**
 * List of rule IDs that require Phase 13 feature flag.
 * These rules represent correctness improvements beyond legacy TS parity.
 *
 * Phase 14: Used for telemetry tracking to identify Phase 13 impacts.
 */
const PHASE_13_RULE_IDS: Set<string> = new Set([
  // England S21
  's21_deposit_cap_exceeded',
  's21_four_month_bar',
  's21_notice_period_short',
  's21_licensing_required_not_licensed',
  's21_retaliatory_improvement_notice',
  's21_retaliatory_emergency_action',
  // England S8
  's8_notice_period_short',
  // Wales S173
  's173_notice_period_short',
  's173_deposit_not_protected',
  's173_written_statement_missing',
  // Scotland NTL
  'ntl_landlord_not_registered',
  'ntl_pre_action_letter_not_sent',
  'ntl_pre_action_signposting_missing',
  'ntl_ground_1_arrears_threshold',
  'ntl_deposit_not_protected',
]);

/**
 * Check if a rule ID is a Phase 13 rule.
 */
export function isPhase13Rule(ruleId: string): boolean {
  return PHASE_13_RULE_IDS.has(ruleId);
}

/**
 * Filter rule IDs to only Phase 13 rules.
 */
function filterPhase13Rules(ruleIds: string[]): string[] {
  return ruleIds.filter((id) => PHASE_13_RULE_IDS.has(id));
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

  // Extract rule IDs for telemetry
  const blockerIds = yamlResult.blockers.map((b) => b.id);
  const warningIds = yamlResult.warnings.map((w) => w.id);

  // Record telemetry if sampling
  if (shouldSampleTelemetry()) {
    recordValidationTelemetry({
      timestamp: new Date().toISOString(),
      jurisdiction: params.jurisdiction,
      product: 'notice_only',
      route: params.route,
      blockerCount: yamlResult.blockers.length,
      warningCount: yamlResult.warnings.length,
      blockerIds,
      warningIds,
      durationMs,
      isValid: yamlResult.blockers.length === 0,
      // Phase 14: Track Phase 13 specific rules
      phase13Enabled: isPhase13Enabled(),
      phase13BlockerIds: filterPhase13Rules(blockerIds),
      phase13WarningIds: filterPhase13Rules(warningIds),
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

  // Extract rule IDs for telemetry
  const blockerIds = yamlResult.blockers.map((b) => b.id);
  const warningIds = yamlResult.warnings.map((w) => w.id);

  // Record telemetry if sampling
  if (shouldSampleTelemetry()) {
    recordValidationTelemetry({
      timestamp: new Date().toISOString(),
      jurisdiction: params.jurisdiction,
      product: 'complete_pack',
      route: params.route,
      blockerCount: yamlResult.blockers.length,
      warningCount: yamlResult.warnings.length,
      blockerIds,
      warningIds,
      durationMs,
      isValid: yamlResult.blockers.length === 0,
      // Phase 14: Track Phase 13 specific rules
      phase13Enabled: isPhase13Enabled(),
      phase13BlockerIds: filterPhase13Rules(blockerIds),
      phase13WarningIds: filterPhase13Rules(warningIds),
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

// ============================================================================
// PHASE 16: ENHANCED VALIDATION WITH HELP CONTENT
// ============================================================================

export interface EnhancedValidationIssue {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
  rationale?: string;
  // Phase 16 enhanced fields
  title?: string;
  howToFix?: string[];
  legalRef?: string;
  helpUrl?: string;
}

export interface EnhancedYamlValidationResult {
  blockers: EnhancedValidationIssue[];
  warnings: EnhancedValidationIssue[];
  isValid: boolean;
  durationMs: number;
}

/**
 * Enhance a validation issue with Phase 13 message catalog details.
 * Adds title, howToFix steps, legal reference, and help URL.
 */
function enhanceIssue(issue: {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
  rationale?: string;
}): EnhancedValidationIssue {
  const phase13Message = getPhase13Message(issue.id);

  if (!phase13Message) {
    return issue;
  }

  return {
    ...issue,
    title: phase13Message.title,
    howToFix: phase13Message.howToFix,
    legalRef: phase13Message.legalRef,
    helpUrl: phase13Message.helpUrl,
  };
}

/**
 * Run YAML validation with enhanced Phase 16 messaging.
 * Returns validation results with help content for Phase 13 rules.
 *
 * Phase 16: UX Messaging + Help Content + Support Readiness
 */
export async function runEnhancedNoticeValidation(params: {
  jurisdiction: 'england' | 'wales' | 'scotland';
  route: string;
  facts: Record<string, unknown>;
}): Promise<EnhancedYamlValidationResult> {
  const baseResult = await runYamlOnlyNoticeValidation(params);

  return {
    blockers: baseResult.blockers.map(enhanceIssue),
    warnings: baseResult.warnings.map(enhanceIssue),
    isValid: baseResult.isValid,
    durationMs: baseResult.durationMs,
  };
}

/**
 * Run YAML complete_pack validation with enhanced Phase 16 messaging.
 * Returns validation results with help content for Phase 13 rules.
 *
 * Phase 16: UX Messaging + Help Content + Support Readiness
 */
export async function runEnhancedCompletePackValidation(params: {
  jurisdiction: 'england' | 'wales' | 'scotland';
  route: string;
  facts: Record<string, unknown>;
}): Promise<EnhancedYamlValidationResult> {
  const baseResult = await runYamlOnlyCompletePackValidation(params);

  return {
    blockers: baseResult.blockers.map(enhanceIssue),
    warnings: baseResult.warnings.map(enhanceIssue),
    isValid: baseResult.isValid,
    durationMs: baseResult.durationMs,
  };
}

// Re-export Phase 16 message types for consumers
export {
  getPhase13Message,
  type EnhancedValidationMessage,
  type ValidationIssueWithHelp,
} from './phase13-messages';
