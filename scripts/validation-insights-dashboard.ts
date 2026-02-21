#!/usr/bin/env npx tsx
/**
 * Validation Insights Dashboard
 *
 * Phase 20: Validation Platform Productization & Visibility
 *
 * Provides an internal dashboard view showing:
 * - Validation volume by jurisdiction / product
 * - Top blockers & warnings (last 7 / 30 days)
 * - Newly introduced blockers (Phase 13+)
 * - Tenant override usage
 * - Emergency suppressions (active / historical)
 *
 * Run with: npm run validation:dashboard
 * Or directly: npx tsx scripts/validation-insights-dashboard.ts
 *
 * Options:
 *   --json    Output as JSON instead of formatted text
 *   --period  Time period filter: '7d', '30d', 'all' (default: all)
 */

import {
  getAggregatedMetrics,
  getTopBlockers,
  getPhase14ImpactMetrics,
  getYamlOnlyStats,
  getMetricsStore,
} from '../src/lib/validation/shadow-mode-adapter';
import { getSuppressionStatus, getSuppressedRules } from '../src/lib/validation/emergency-suppressions';
import { getTenantContext, getOverrideAuditLog } from '../src/lib/validation/rule-targeting';
import { getAllPhase13Messages, getSupportCategory, PHASE_13_RULE_IDS } from '../src/lib/validation/phase13-messages';
import { isPhase13Enabled } from '../src/lib/validation/eviction-rules-engine';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardData {
  generated_at: string;
  period: string;

  // Overall metrics
  overall: {
    total_validations: number;
    valid_count: number;
    invalid_count: number;
    error_rate: number;
    avg_duration_ms: number;
  };

  // By jurisdiction
  by_jurisdiction: Record<string, {
    total: number;
    valid: number;
    invalid: number;
    avg_duration_ms: number;
  }>;

  // By product
  by_product: Record<string, {
    total: number;
    valid: number;
    invalid: number;
  }>;

  // Top blockers
  top_blockers: Array<{
    rule_id: string;
    count: number;
    is_phase13: boolean;
    support_category?: string;
  }>;

  // Phase 13 impact
  phase13: {
    enabled: boolean;
    enabled_percent: number;
    newly_blocked_percent: number;
    top_phase13_blockers: Array<{
      rule_id: string;
      count: number;
      title?: string;
    }>;
  };

  // Tenant overrides
  tenant_overrides: {
    current_tenant: string;
    tier: string;
    override_count: number;
    custom_rule_count: number;
    recent_audit_entries: number;
  };

  // Emergency suppressions
  emergency_suppressions: {
    is_active: boolean;
    suppressed_count: number;
    suppressed_rules: Array<{
      rule_id: string;
      source: string;
      reason?: string;
    }>;
  };
}

// ============================================================================
// DATA COLLECTION
// ============================================================================

function collectDashboardData(period: string): DashboardData {
  const now = new Date();
  let sinceDate: Date | undefined;

  if (period === '7d') {
    sinceDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30d') {
    sinceDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get overall metrics
  const overallMetrics = getAggregatedMetrics(sinceDate ? { since: sinceDate } : undefined);
  const yamlStats = getYamlOnlyStats();

  // Get metrics by jurisdiction
  const jurisdictions = ['england', 'wales', 'scotland'];
  const byJurisdiction: DashboardData['by_jurisdiction'] = {};

  for (const jurisdiction of jurisdictions) {
    const metrics = getAggregatedMetrics({
      jurisdiction,
      since: sinceDate,
    });
    byJurisdiction[jurisdiction] = {
      total: metrics.totalValidations,
      valid: metrics.validCount,
      invalid: metrics.invalidCount,
      avg_duration_ms: Math.round(metrics.avgDurationMs * 100) / 100,
    };
  }

  // Get metrics by product
  const products = ['notice_only', 'complete_pack'];
  const byProduct: DashboardData['by_product'] = {};

  for (const product of products) {
    const metrics = getAggregatedMetrics({
      product,
      since: sinceDate,
    });
    byProduct[product] = {
      total: metrics.totalValidations,
      valid: metrics.validCount,
      invalid: metrics.invalidCount,
    };
  }

  // Get top blockers with Phase 13 annotation
  const topBlockers = getTopBlockers(15, sinceDate ? { since: sinceDate } : undefined);
  const phase13RuleSet = new Set(PHASE_13_RULE_IDS);

  const annotatedBlockers = topBlockers.map(b => {
    const supportCat = getSupportCategory(b.ruleId);
    return {
      rule_id: b.ruleId,
      count: b.count,
      is_phase13: phase13RuleSet.has(b.ruleId),
      support_category: supportCat?.category,
    };
  });

  // Get Phase 13 impact metrics
  const phase14Impact = getPhase14ImpactMetrics(sinceDate ? { since: sinceDate } : undefined);
  const phase13Messages = getAllPhase13Messages();
  const messageMap = new Map(phase13Messages.map(m => [m.ruleId, m]));

  const topPhase13Blockers = phase14Impact.topPhase13Blockers.map(b => ({
    rule_id: b.ruleId,
    count: b.count,
    title: messageMap.get(b.ruleId)?.title,
  }));

  // Get tenant context
  const tenantContext = getTenantContext();
  const auditLog = getOverrideAuditLog();

  // Get emergency suppression status
  const suppressionStatus = getSuppressionStatus();

  return {
    generated_at: now.toISOString(),
    period,

    overall: {
      total_validations: overallMetrics.totalValidations,
      valid_count: overallMetrics.validCount,
      invalid_count: overallMetrics.invalidCount,
      error_rate: Math.round(yamlStats.errorRate * 10000) / 100,
      avg_duration_ms: Math.round(overallMetrics.avgDurationMs * 100) / 100,
    },

    by_jurisdiction: byJurisdiction,
    by_product: byProduct,
    top_blockers: annotatedBlockers,

    phase13: {
      enabled: isPhase13Enabled(),
      enabled_percent: Math.round(phase14Impact.phase13EnabledPercent * 100) / 100,
      newly_blocked_percent: Math.round(phase14Impact.newlyBlockedPercent * 100) / 100,
      top_phase13_blockers: topPhase13Blockers,
    },

    tenant_overrides: {
      current_tenant: tenantContext.tenantId,
      tier: tenantContext.tier,
      override_count: tenantContext.ruleOverrides?.length || 0,
      custom_rule_count: tenantContext.customRules?.length || 0,
      recent_audit_entries: auditLog.length,
    },

    emergency_suppressions: {
      is_active: suppressionStatus.isActive,
      suppressed_count: suppressionStatus.suppressedCount,
      suppressed_rules: suppressionStatus.suppressedRules.map(r => ({
        rule_id: r.ruleId,
        source: r.source,
        reason: r.reason,
      })),
    },
  };
}

// ============================================================================
// FORMATTED OUTPUT
// ============================================================================

function printDashboard(data: DashboardData): void {
  const { overall, by_jurisdiction, by_product, top_blockers, phase13, tenant_overrides, emergency_suppressions } = data;

  // Header
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    VALIDATION INSIGHTS DASHBOARD                             ║');
  console.log('║                         Phase 20: Productization                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Generated: ${data.generated_at}`);
  console.log(`Period: ${data.period === 'all' ? 'All time' : data.period}`);
  console.log('');

  // Overall Stats
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ OVERALL VALIDATION METRICS                                                   │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  console.log(`│ Total Validations: ${String(overall.total_validations).padEnd(15)} Valid: ${String(overall.valid_count).padEnd(10)} Invalid: ${overall.invalid_count.toString().padEnd(10)}│`);
  console.log(`│ Error Rate: ${(overall.error_rate + '%').padEnd(18)} Avg Duration: ${(overall.avg_duration_ms + 'ms').padEnd(15)}           │`);
  console.log('└──────────────────────────────────────────────────────────────────────────────┘');
  console.log('');

  // By Jurisdiction
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ BY JURISDICTION                                                              │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  for (const [jurisdiction, stats] of Object.entries(by_jurisdiction)) {
    const validRate = stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : '0.0';
    console.log(`│ ${jurisdiction.padEnd(12)} │ Total: ${String(stats.total).padEnd(8)} Valid: ${(validRate + '%').padEnd(8)} Avg: ${(stats.avg_duration_ms + 'ms').padEnd(10)}│`);
  }
  console.log('└──────────────────────────────────────────────────────────────────────────────┘');
  console.log('');

  // By Product
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ BY PRODUCT                                                                   │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  for (const [product, stats] of Object.entries(by_product)) {
    const validRate = stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : '0.0';
    console.log(`│ ${product.padEnd(15)} │ Total: ${String(stats.total).padEnd(8)} Valid: ${(validRate + '%').padEnd(8)} Invalid: ${String(stats.invalid).padEnd(8)}│`);
  }
  console.log('└──────────────────────────────────────────────────────────────────────────────┘');
  console.log('');

  // Top Blockers
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ TOP BLOCKERS                                                                 │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  if (top_blockers.length === 0) {
    console.log('│ No blockers recorded                                                         │');
  } else {
    for (const blocker of top_blockers.slice(0, 10)) {
      const phase13Tag = blocker.is_phase13 ? ' [P13]' : '';
      const catTag = blocker.support_category ? ` (${blocker.support_category})` : '';
      const line = `${blocker.rule_id}${phase13Tag}${catTag}`;
      console.log(`│ ${String(blocker.count).padStart(6)}x │ ${line.padEnd(60)}│`);
    }
  }
  console.log('└──────────────────────────────────────────────────────────────────────────────┘');
  console.log('');

  // Phase 13 Impact
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ PHASE 13 IMPACT                                                              │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  const p13Status = phase13.enabled ? '✅ ENABLED' : '❌ DISABLED';
  console.log(`│ Status: ${p13Status.padEnd(20)} Enabled %: ${(phase13.enabled_percent + '%').padEnd(12)}               │`);
  console.log(`│ Newly Blocked %: ${(phase13.newly_blocked_percent + '%').padEnd(12)}                                         │`);
  if (phase13.top_phase13_blockers.length > 0) {
    console.log('│                                                                              │');
    console.log('│ Top Phase 13 Blockers:                                                       │');
    for (const b of phase13.top_phase13_blockers.slice(0, 5)) {
      const title = b.title ? ` - ${b.title}` : '';
      const line = `${b.rule_id}${title}`;
      console.log(`│   ${String(b.count).padStart(4)}x │ ${line.slice(0, 55).padEnd(55)}│`);
    }
  }
  console.log('└──────────────────────────────────────────────────────────────────────────────┘');
  console.log('');

  // Tenant Overrides
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ TENANT OVERRIDES                                                             │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  console.log(`│ Tenant: ${tenant_overrides.current_tenant.padEnd(20)} Tier: ${tenant_overrides.tier.padEnd(12)}              │`);
  console.log(`│ Rule Overrides: ${String(tenant_overrides.override_count).padEnd(8)} Custom Rules: ${String(tenant_overrides.custom_rule_count).padEnd(8)}              │`);
  console.log(`│ Audit Entries: ${tenant_overrides.recent_audit_entries}                                                        │`);
  console.log('└──────────────────────────────────────────────────────────────────────────────┘');
  console.log('');

  // Emergency Suppressions
  console.log('┌──────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ EMERGENCY SUPPRESSIONS                                                       │');
  console.log('├──────────────────────────────────────────────────────────────────────────────┤');
  if (emergency_suppressions.is_active) {
    console.log(`│ ⚠️  ACTIVE - ${emergency_suppressions.suppressed_count} rule(s) suppressed                                      │`);
    for (const rule of emergency_suppressions.suppressed_rules) {
      console.log(`│   • ${rule.rule_id} (${rule.source})                                              │`);
      if (rule.reason) {
        console.log(`│     Reason: ${rule.reason.slice(0, 50).padEnd(50)}│`);
      }
    }
  } else {
    console.log('│ ✅ No active suppressions                                                    │');
  }
  console.log('└──────────────────────────────────────────────────────────────────────────────┘');
  console.log('');
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');

  let period = 'all';
  const periodArg = args.find(a => a.startsWith('--period='));
  if (periodArg) {
    period = periodArg.split('=')[1] || 'all';
    if (!['7d', '30d', 'all'].includes(period)) {
      console.error('Invalid period. Use: 7d, 30d, or all');
      process.exit(1);
    }
  }

  const data = collectDashboardData(period);

  if (jsonOutput) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    printDashboard(data);
  }
}

main();
