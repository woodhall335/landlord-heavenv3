/**
 * Adoption & Impact Metrics Tracking
 *
 * Phase 21: Adoption, Measurement & ROI Validation
 *
 * Provides utilities for tracking adoption metrics, support impact,
 * and ROI calculations for the validation platform.
 *
 * Features:
 * - Resolution tracking (blocked → resolved)
 * - Tool usage tracking
 * - Support ticket correlation
 * - Baseline comparison
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Resolution tracking for self-resolution rate calculation.
 */
export interface ResolutionEvent {
  case_id: string;
  user_id?: string;
  jurisdiction: string;
  product: string;
  route: string;
  blocked_at: string;
  blocked_rule_ids: string[];
  resolved_at?: string;
  resolution_type?: 'self' | 'support' | 'abandoned';
  ticket_id?: string;
}

/**
 * Tool usage event for adoption tracking.
 */
export interface ToolUsageEvent {
  tool: 'dashboard' | 'rule-lookup' | 'governance-check' | 'roi-report';
  timestamp: string;
  user?: string;
  args?: string[];
  rule_id_queried?: string;
  search_term?: string;
  output_format?: 'text' | 'json';
}

/**
 * Baseline metrics for comparison.
 */
export interface BaselineMetrics {
  captured_at: string;
  period_days: number;

  // Support metrics
  weekly_validation_tickets: number;
  avg_handling_time_minutes: number;
  escalation_rate_percent: number;

  // User metrics
  self_resolution_rate_percent: number;
  avg_time_to_fix_hours: number;

  // Volume metrics
  weekly_validations: number;
  blocker_rate_percent: number;
}

/**
 * Comparison result between current and baseline.
 */
export interface MetricsComparison {
  metric: string;
  baseline: number;
  current: number;
  delta: number;
  delta_percent: number;
  improved: boolean;
  target?: number;
  meets_target?: boolean;
}

// ============================================================================
// IN-MEMORY STORES
// ============================================================================

const resolutionStore: ResolutionEvent[] = [];
const toolUsageStore: ToolUsageEvent[] = [];
const MAX_STORE_SIZE = 5000;

// ============================================================================
// RESOLUTION TRACKING
// ============================================================================

/**
 * Record a validation that was blocked.
 */
export function recordBlockedValidation(event: {
  case_id: string;
  user_id?: string;
  jurisdiction: string;
  product: string;
  route: string;
  blocked_rule_ids: string[];
}): void {
  // Check if this case already has a pending resolution
  const existing = resolutionStore.find(
    (r) => r.case_id === event.case_id && !r.resolved_at
  );

  if (existing) {
    // Update existing record with new blockers
    existing.blocked_rule_ids = event.blocked_rule_ids;
    return;
  }

  // Add new resolution event
  if (resolutionStore.length >= MAX_STORE_SIZE) {
    resolutionStore.shift();
  }

  resolutionStore.push({
    ...event,
    blocked_at: new Date().toISOString(),
  });
}

/**
 * Record that a previously blocked validation is now resolved.
 */
export function recordResolution(
  case_id: string,
  resolution_type: 'self' | 'support' | 'abandoned',
  ticket_id?: string
): boolean {
  const event = resolutionStore.find(
    (r) => r.case_id === case_id && !r.resolved_at
  );

  if (!event) {
    return false;
  }

  event.resolved_at = new Date().toISOString();
  event.resolution_type = resolution_type;
  event.ticket_id = ticket_id;

  return true;
}

/**
 * Calculate self-resolution rate from tracked events.
 */
export function calculateSelfResolutionRate(since?: Date): {
  total_blocked: number;
  self_resolved: number;
  support_resolved: number;
  abandoned: number;
  pending: number;
  self_resolution_rate: number;
} {
  let events = resolutionStore;

  if (since) {
    const sinceTs = since.toISOString();
    events = events.filter((e) => e.blocked_at >= sinceTs);
  }

  const total_blocked = events.length;
  const self_resolved = events.filter((e) => e.resolution_type === 'self').length;
  const support_resolved = events.filter((e) => e.resolution_type === 'support').length;
  const abandoned = events.filter((e) => e.resolution_type === 'abandoned').length;
  const pending = events.filter((e) => !e.resolved_at).length;

  const resolved = self_resolved + support_resolved + abandoned;
  const self_resolution_rate = resolved > 0 ? (self_resolved / resolved) * 100 : 0;

  return {
    total_blocked,
    self_resolved,
    support_resolved,
    abandoned,
    pending,
    self_resolution_rate: Math.round(self_resolution_rate * 100) / 100,
  };
}

/**
 * Calculate average time-to-fix for resolved validations.
 */
export function calculateAvgTimeToFix(since?: Date): {
  total_resolved: number;
  avg_time_to_fix_hours: number;
  by_resolution_type: Record<string, number>;
} {
  let events = resolutionStore.filter((e) => e.resolved_at);

  if (since) {
    const sinceTs = since.toISOString();
    events = events.filter((e) => e.blocked_at >= sinceTs);
  }

  if (events.length === 0) {
    return {
      total_resolved: 0,
      avg_time_to_fix_hours: 0,
      by_resolution_type: {},
    };
  }

  const times: number[] = [];
  const byType: Record<string, number[]> = {
    self: [],
    support: [],
    abandoned: [],
  };

  for (const event of events) {
    if (!event.resolved_at) continue;

    const blockedTime = new Date(event.blocked_at).getTime();
    const resolvedTime = new Date(event.resolved_at).getTime();
    const hours = (resolvedTime - blockedTime) / (1000 * 60 * 60);

    times.push(hours);
    if (event.resolution_type) {
      byType[event.resolution_type].push(hours);
    }
  }

  const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;

  const byResolutionType: Record<string, number> = {};
  for (const [type, typeTimes] of Object.entries(byType)) {
    if (typeTimes.length > 0) {
      byResolutionType[type] =
        Math.round((typeTimes.reduce((a, b) => a + b, 0) / typeTimes.length) * 100) / 100;
    }
  }

  return {
    total_resolved: events.length,
    avg_time_to_fix_hours: Math.round(avg * 100) / 100,
    by_resolution_type: byResolutionType,
  };
}

/**
 * Get resolution events for export/analysis.
 */
export function getResolutionEvents(since?: Date): ResolutionEvent[] {
  let events = [...resolutionStore];

  if (since) {
    const sinceTs = since.toISOString();
    events = events.filter((e) => e.blocked_at >= sinceTs);
  }

  return events;
}

/**
 * Clear resolution store (for testing).
 */
export function clearResolutionStore(): void {
  resolutionStore.length = 0;
}

// ============================================================================
// TOOL USAGE TRACKING
// ============================================================================

/**
 * Record a tool usage event.
 */
export function recordToolUsage(event: Omit<ToolUsageEvent, 'timestamp'>): void {
  if (toolUsageStore.length >= MAX_STORE_SIZE) {
    toolUsageStore.shift();
  }

  toolUsageStore.push({
    ...event,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get tool usage statistics.
 */
export function getToolUsageStats(since?: Date): {
  total_usage: number;
  by_tool: Record<string, number>;
  unique_rules_queried: number;
  unique_users: number;
} {
  let events = toolUsageStore;

  if (since) {
    const sinceTs = since.toISOString();
    events = events.filter((e) => e.timestamp >= sinceTs);
  }

  const byTool: Record<string, number> = {};
  const rulesQueried = new Set<string>();
  const users = new Set<string>();

  for (const event of events) {
    byTool[event.tool] = (byTool[event.tool] || 0) + 1;

    if (event.rule_id_queried) {
      rulesQueried.add(event.rule_id_queried);
    }

    if (event.user) {
      users.add(event.user);
    }
  }

  return {
    total_usage: events.length,
    by_tool: byTool,
    unique_rules_queried: rulesQueried.size,
    unique_users: users.size,
  };
}

/**
 * Get tool usage events for export.
 */
export function getToolUsageEvents(since?: Date): ToolUsageEvent[] {
  let events = [...toolUsageStore];

  if (since) {
    const sinceTs = since.toISOString();
    events = events.filter((e) => e.timestamp >= sinceTs);
  }

  return events;
}

/**
 * Clear tool usage store (for testing).
 */
export function clearToolUsageStore(): void {
  toolUsageStore.length = 0;
}

// ============================================================================
// BASELINE COMPARISON
// ============================================================================

/**
 * Create a baseline snapshot from current metrics.
 */
export function createBaseline(periodDays: number = 30): BaselineMetrics {
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  const resolutionStats = calculateSelfResolutionRate(since);
  const ttfStats = calculateAvgTimeToFix(since);

  return {
    captured_at: new Date().toISOString(),
    period_days: periodDays,
    weekly_validation_tickets: 20, // Placeholder - would come from support system
    avg_handling_time_minutes: 25, // Placeholder
    escalation_rate_percent: 15, // Placeholder
    self_resolution_rate_percent: resolutionStats.self_resolution_rate,
    avg_time_to_fix_hours: ttfStats.avg_time_to_fix_hours,
    weekly_validations: Math.round(resolutionStats.total_blocked / (periodDays / 7)),
    blocker_rate_percent: 15, // Placeholder
  };
}

/**
 * Compare current metrics against baseline.
 */
export function compareToBaseline(
  baseline: BaselineMetrics,
  current: Partial<BaselineMetrics>,
  targets?: Partial<BaselineMetrics>
): MetricsComparison[] {
  const comparisons: MetricsComparison[] = [];

  const metrics = [
    { key: 'weekly_validation_tickets', lowerIsBetter: true },
    { key: 'avg_handling_time_minutes', lowerIsBetter: true },
    { key: 'escalation_rate_percent', lowerIsBetter: true },
    { key: 'self_resolution_rate_percent', lowerIsBetter: false },
    { key: 'avg_time_to_fix_hours', lowerIsBetter: true },
    { key: 'blocker_rate_percent', lowerIsBetter: true },
  ] as const;

  for (const { key, lowerIsBetter } of metrics) {
    const baselineValue = baseline[key];
    const currentValue = current[key];

    if (baselineValue === undefined || currentValue === undefined) continue;

    const delta = currentValue - baselineValue;
    const deltaPercent = baselineValue !== 0 ? (delta / baselineValue) * 100 : 0;
    const improved = lowerIsBetter ? delta < 0 : delta > 0;

    const comparison: MetricsComparison = {
      metric: key,
      baseline: baselineValue,
      current: currentValue,
      delta: Math.round(delta * 100) / 100,
      delta_percent: Math.round(deltaPercent * 100) / 100,
      improved,
    };

    if (targets && targets[key] !== undefined) {
      comparison.target = targets[key];
      comparison.meets_target = lowerIsBetter
        ? currentValue <= targets[key]!
        : currentValue >= targets[key]!;
    }

    comparisons.push(comparison);
  }

  return comparisons;
}

// ============================================================================
// ROI HELPERS
// ============================================================================

/**
 * Default cost assumptions for ROI calculations.
 */
export const DEFAULT_COST_ASSUMPTIONS = {
  cost_per_ticket: 10, // £
  cost_per_minute_support: 0.5, // £
  eng_hours_per_escalation: 3,
  eng_hourly_rate: 85, // £
  user_hourly_value: 35, // £
};

/**
 * Calculate support cost savings.
 */
export function calculateSupportSavings(
  baselineTicketsWeekly: number,
  currentTicketsWeekly: number,
  baselineAHTMinutes: number,
  currentAHTMinutes: number,
  assumptions = DEFAULT_COST_ASSUMPTIONS
): {
  ticket_reduction_annual: number;
  aht_reduction_annual: number;
  total_annual: number;
} {
  const weeksPerYear = 52;

  const ticketReduction = Math.max(0, baselineTicketsWeekly - currentTicketsWeekly);
  const ticketReductionAnnual =
    ticketReduction * weeksPerYear * assumptions.cost_per_ticket;

  const ahtReduction = Math.max(0, baselineAHTMinutes - currentAHTMinutes);
  const ahtReductionAnnual =
    ahtReduction *
    currentTicketsWeekly *
    weeksPerYear *
    assumptions.cost_per_minute_support;

  return {
    ticket_reduction_annual: Math.round(ticketReductionAnnual),
    aht_reduction_annual: Math.round(ahtReductionAnnual),
    total_annual: Math.round(ticketReductionAnnual + ahtReductionAnnual),
  };
}

/**
 * Calculate engineering escalation savings.
 */
export function calculateEngineeringSavings(
  baselineEscalationRate: number,
  currentEscalationRate: number,
  ticketsWeekly: number,
  assumptions = DEFAULT_COST_ASSUMPTIONS
): {
  escalation_reduction_annual: number;
} {
  const weeksPerYear = 52;
  const escalationReduction = Math.max(0, baselineEscalationRate - currentEscalationRate);

  const savings =
    escalationReduction *
    ticketsWeekly *
    weeksPerYear *
    assumptions.eng_hours_per_escalation *
    assumptions.eng_hourly_rate;

  return {
    escalation_reduction_annual: Math.round(savings),
  };
}

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Export all metrics data for external analysis.
 */
export function exportMetricsData(since?: Date): {
  resolution_events: ResolutionEvent[];
  tool_usage_events: ToolUsageEvent[];
  resolution_stats: ReturnType<typeof calculateSelfResolutionRate>;
  ttf_stats: ReturnType<typeof calculateAvgTimeToFix>;
  tool_usage_stats: ReturnType<typeof getToolUsageStats>;
} {
  return {
    resolution_events: getResolutionEvents(since),
    tool_usage_events: getToolUsageEvents(since),
    resolution_stats: calculateSelfResolutionRate(since),
    ttf_stats: calculateAvgTimeToFix(since),
    tool_usage_stats: getToolUsageStats(since),
  };
}
