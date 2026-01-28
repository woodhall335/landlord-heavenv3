/**
 * Emergency Rule Suppression System
 *
 * Phase 19: Governance & Change Management
 *
 * Provides a "break glass" mechanism to immediately disable validation rules
 * in emergency situations without code deployment.
 *
 * Usage:
 * 1. Environment variable (fastest): VALIDATION_SUPPRESS_RULES=rule1,rule2
 * 2. Code-level suppression (for longer-term): Add to EMERGENCY_SUPPRESSED_RULES
 *
 * All suppressions are logged for audit compliance.
 */

// ============================================================================
// EMERGENCY SUPPRESSED RULES
// ============================================================================

/**
 * Code-level emergency suppressions.
 * Add rules here when environment variable suppression is insufficient.
 *
 * IMPORTANT: Each entry must include:
 * - Rule ID
 * - Date suppressed
 * - Reason
 * - Ticket number
 * - Expected restoration date
 *
 * Format: 'rule_id' // YYYY-MM-DD - Reason - Ticket #123 - Restore by YYYY-MM-DD
 */
export const EMERGENCY_SUPPRESSED_RULES: string[] = [
  // Example (commented out):
  // 's21_problematic_rule',  // 2026-01-26 - False positives - INC-123 - Restore by 2026-01-28
];

// ============================================================================
// TYPES
// ============================================================================

export interface SuppressionEntry {
  ruleId: string;
  source: 'environment' | 'code' | 'tenant';
  suppressedAt: string;
  reason?: string;
  ticketNumber?: string;
  expiresAt?: string;
}

export interface SuppressionLog {
  timestamp: string;
  action: 'suppressed' | 'restored' | 'checked';
  ruleId: string;
  source: SuppressionEntry['source'];
  reason?: string;
  actor?: string;
}

// ============================================================================
// SUPPRESSION STATE
// ============================================================================

/**
 * Runtime cache of suppressed rules.
 * Populated on first check, invalidated on refresh.
 */
let suppressedRulesCache: Set<string> | null = null;

/**
 * Suppression audit log.
 * In production, this should be persisted to external storage.
 */
const suppressionLog: SuppressionLog[] = [];

// ============================================================================
// ENVIRONMENT VARIABLE PARSING
// ============================================================================

/**
 * Get suppressed rules from environment variable.
 * Format: VALIDATION_SUPPRESS_RULES=rule1,rule2,rule3
 */
function getEnvironmentSuppressedRules(): string[] {
  const envValue = process.env.VALIDATION_SUPPRESS_RULES;
  if (!envValue) return [];

  return envValue
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
}

// ============================================================================
// SUPPRESSION CHECKING
// ============================================================================

/**
 * Build the complete set of suppressed rules from all sources.
 */
function buildSuppressedRulesSet(): Set<string> {
  const suppressed = new Set<string>();

  // 1. Environment variable suppressions (highest priority, fastest to apply)
  const envSuppressed = getEnvironmentSuppressedRules();
  for (const ruleId of envSuppressed) {
    suppressed.add(ruleId);
    logSuppression({
      timestamp: new Date().toISOString(),
      action: 'checked',
      ruleId,
      source: 'environment',
      reason: 'Environment variable VALIDATION_SUPPRESS_RULES',
    });
  }

  // 2. Code-level suppressions
  for (const ruleId of EMERGENCY_SUPPRESSED_RULES) {
    suppressed.add(ruleId);
    logSuppression({
      timestamp: new Date().toISOString(),
      action: 'checked',
      ruleId,
      source: 'code',
      reason: 'EMERGENCY_SUPPRESSED_RULES constant',
    });
  }

  return suppressed;
}

/**
 * Check if a rule is currently suppressed.
 */
export function isRuleSuppressed(ruleId: string): boolean {
  if (!suppressedRulesCache) {
    suppressedRulesCache = buildSuppressedRulesSet();
  }
  return suppressedRulesCache.has(ruleId);
}

/**
 * Get all currently suppressed rules.
 */
export function getSuppressedRules(): SuppressionEntry[] {
  const entries: SuppressionEntry[] = [];

  // Environment suppressions
  for (const ruleId of getEnvironmentSuppressedRules()) {
    entries.push({
      ruleId,
      source: 'environment',
      suppressedAt: 'runtime',
      reason: 'VALIDATION_SUPPRESS_RULES environment variable',
    });
  }

  // Code suppressions
  for (const ruleId of EMERGENCY_SUPPRESSED_RULES) {
    entries.push({
      ruleId,
      source: 'code',
      suppressedAt: 'deployment',
      reason: 'EMERGENCY_SUPPRESSED_RULES constant',
    });
  }

  return entries;
}

/**
 * Refresh the suppression cache.
 * Call this after environment variable changes.
 */
export function refreshSuppressionCache(): void {
  suppressedRulesCache = null;
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Log a suppression event.
 */
function logSuppression(entry: SuppressionLog): void {
  // Deduplicate: don't log the same check twice in quick succession
  const recent = suppressionLog.slice(-100);
  const isDuplicate = recent.some(
    (e) =>
      e.ruleId === entry.ruleId &&
      e.action === entry.action &&
      e.source === entry.source &&
      new Date(e.timestamp).getTime() > Date.now() - 60000 // Within last minute
  );

  if (!isDuplicate) {
    suppressionLog.push(entry);
  }
}

/**
 * Log an emergency suppression action.
 */
export function logEmergencySuppression(
  ruleId: string,
  source: SuppressionEntry['source'],
  reason: string,
  actor?: string,
  ticketNumber?: string
): void {
  suppressionLog.push({
    timestamp: new Date().toISOString(),
    action: 'suppressed',
    ruleId,
    source,
    reason,
    actor,
  });

  // Also log to console for immediate visibility
  console.warn(
    `[EMERGENCY SUPPRESSION] Rule ${ruleId} suppressed by ${actor || 'unknown'}` +
      ` via ${source}. Reason: ${reason}. Ticket: ${ticketNumber || 'N/A'}`
  );
}

/**
 * Log a rule restoration.
 */
export function logRuleRestoration(
  ruleId: string,
  source: SuppressionEntry['source'],
  actor?: string
): void {
  suppressionLog.push({
    timestamp: new Date().toISOString(),
    action: 'restored',
    ruleId,
    source,
    actor,
  });

  console.info(`[RULE RESTORED] Rule ${ruleId} restored by ${actor || 'unknown'}`);
}

/**
 * Get the suppression audit log.
 */
export function getSuppressionLog(): SuppressionLog[] {
  return [...suppressionLog];
}

/**
 * Clear the suppression log (for testing only).
 */
export function clearSuppressionLog(): void {
  suppressionLog.length = 0;
}

// ============================================================================
// FILTER FUNCTION FOR ENGINE INTEGRATION
// ============================================================================

/**
 * Filter out suppressed rules from a list of rule results.
 * Use this in the validation engine to apply emergency suppressions.
 */
export function filterSuppressedRules<T extends { id: string }>(results: T[]): T[] {
  return results.filter((result) => !isRuleSuppressed(result.id));
}

// ============================================================================
// STATUS REPORTING
// ============================================================================

/**
 * Get suppression system status for monitoring/dashboards.
 */
export function getSuppressionStatus(): {
  isActive: boolean;
  suppressedCount: number;
  suppressedRules: SuppressionEntry[];
  recentLogEntries: SuppressionLog[];
} {
  const suppressed = getSuppressedRules();

  return {
    isActive: suppressed.length > 0,
    suppressedCount: suppressed.length,
    suppressedRules: suppressed,
    recentLogEntries: suppressionLog.slice(-20),
  };
}

/**
 * Print suppression status to console (for debugging/monitoring).
 */
export function printSuppressionStatus(): void {
  const status = getSuppressionStatus();

  console.log('=== Emergency Suppression Status ===');
  console.log(`Active: ${status.isActive ? 'YES - RULES SUPPRESSED' : 'No'}`);
  console.log(`Suppressed rule count: ${status.suppressedCount}`);

  if (status.suppressedRules.length > 0) {
    console.log('\nSuppressed Rules:');
    for (const entry of status.suppressedRules) {
      console.log(`  - ${entry.ruleId} (${entry.source}): ${entry.reason || 'No reason'}`);
    }
  }

  if (status.recentLogEntries.length > 0) {
    console.log('\nRecent Log Entries:');
    for (const entry of status.recentLogEntries.slice(-5)) {
      console.log(`  [${entry.timestamp}] ${entry.action}: ${entry.ruleId} (${entry.source})`);
    }
  }
}
