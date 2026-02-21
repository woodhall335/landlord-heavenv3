#!/usr/bin/env npx tsx
/**
 * Phase 14 Impact Report Script
 *
 * Analyzes the impact of Phase 13 correctness improvements rollout.
 * Provides metrics for monitoring and decision-making on full enablement.
 *
 * Run with: npm run validation:phase14-report
 * Or directly: npx tsx scripts/phase14-impact-report.ts
 *
 * Key Metrics:
 * - Phase 13 blocker frequency by rule ID
 * - % of cases newly blocked vs Phase 12 baseline
 * - Warnings vs blockers ratio
 * - Rollout percentage and enablement status
 */

import {
  getAggregatedMetrics,
  getTopBlockers,
  getTopPhase13Blockers,
  getPhase14ImpactMetrics,
  getMetricsStore,
  isYamlOnlyMode,
  isTelemetryEnabled,
  isPhase13Rule,
} from '../src/lib/validation/shadow-mode-adapter';
import {
  isPhase13Enabled,
  getPhase13RolloutPercent,
} from '../src/lib/validation/eviction-rules-engine';

// ============================================================================
// TYPES
// ============================================================================

interface Phase14Report {
  timestamp: string;
  environment: {
    yamlOnlyMode: boolean;
    telemetryEnabled: boolean;
    phase13Enabled: boolean;
    phase13RolloutPercent: number;
  };
  telemetry: {
    totalEvents: number;
    validCount: number;
    invalidCount: number;
    phase13EnabledCount: number;
    phase13EnabledPercent: string;
  };
  phase13Impact: {
    phase13NewlyBlockedCount: number;
    newlyBlockedPercent: string;
    warningToBlockerRatio: number;
  };
  topPhase13Blockers: Array<{ ruleId: string; count: number; description: string }>;
  topAllBlockers: Array<{ ruleId: string; count: number; isPhase13: boolean }>;
  jurisdictionBreakdown: Array<{
    jurisdiction: string;
    total: number;
    phase13Blocked: number;
    percent: string;
  }>;
  recommendation: {
    status: 'safe_to_proceed' | 'monitor' | 'investigate' | 'rollback';
    message: string;
    newlyBlockedThreshold: number;
  };
}

// ============================================================================
// PHASE 13 RULE DESCRIPTIONS
// ============================================================================

const PHASE_13_RULE_DESCRIPTIONS: Record<string, string> = {
  // England S21
  's21_deposit_cap_exceeded': 'Deposit exceeds Tenant Fees Act cap (5/6 weeks)',
  's21_four_month_bar': 'Cannot serve S21 in first 4 months of tenancy',
  's21_notice_period_short': 'S21 notice period less than 2 months',
  's21_licensing_required_not_licensed': 'Selective licensing required but not held',
  's21_retaliatory_improvement_notice': 'Council improvement notice served (retaliatory eviction)',
  's21_retaliatory_emergency_action': 'Council emergency remedial action (retaliatory eviction)',
  // England S8
  's8_notice_period_short': 'S8 notice period less than statutory minimum',
  // Wales S173
  's173_notice_period_short': 'S173 notice period less than 6 months',
  's173_deposit_not_protected': 'Deposit not protected (Wales)',
  's173_written_statement_missing': 'Written statement not provided (Wales)',
  // Scotland NTL
  'ntl_landlord_not_registered': 'Landlord not registered with Scottish Landlord Register',
  'ntl_pre_action_letter_not_sent': 'Pre-action letter not sent for Ground 1',
  'ntl_pre_action_signposting_missing': 'Tenant not signposted to debt advice',
  'ntl_ground_1_arrears_threshold': 'Arrears less than typical 3-month threshold',
  'ntl_deposit_not_protected': 'Deposit not protected (Scotland)',
};

// ============================================================================
// THRESHOLDS
// ============================================================================

const THRESHOLDS = {
  // % of Phase 13 validations that result in new blocks
  safeNewlyBlockedPercent: 5,      // Below this = safe to proceed
  monitorNewlyBlockedPercent: 10,  // Below this = monitor
  investigateNewlyBlockedPercent: 20, // Below this = investigate
  // Above this = consider rollback
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRecommendation(newlyBlockedPercent: number): Phase14Report['recommendation'] {
  if (newlyBlockedPercent < THRESHOLDS.safeNewlyBlockedPercent) {
    return {
      status: 'safe_to_proceed',
      message: 'Phase 13 impact is within expected range. Safe to increase rollout or proceed to full enablement.',
      newlyBlockedThreshold: THRESHOLDS.safeNewlyBlockedPercent,
    };
  }
  if (newlyBlockedPercent < THRESHOLDS.monitorNewlyBlockedPercent) {
    return {
      status: 'monitor',
      message: 'Phase 13 impact is slightly elevated. Continue monitoring before increasing rollout.',
      newlyBlockedThreshold: THRESHOLDS.monitorNewlyBlockedPercent,
    };
  }
  if (newlyBlockedPercent < THRESHOLDS.investigateNewlyBlockedPercent) {
    return {
      status: 'investigate',
      message: 'Phase 13 impact is higher than expected. Review top blockers and user feedback before proceeding.',
      newlyBlockedThreshold: THRESHOLDS.investigateNewlyBlockedPercent,
    };
  }
  return {
    status: 'rollback',
    message: 'Phase 13 impact is significantly higher than expected. Consider reducing rollout percentage or disabling.',
    newlyBlockedThreshold: THRESHOLDS.investigateNewlyBlockedPercent,
  };
}

function getJurisdictionBreakdown(): Phase14Report['jurisdictionBreakdown'] {
  const events = getMetricsStore();
  const jurisdictions = ['england', 'wales', 'scotland'];

  return jurisdictions.map((jurisdiction) => {
    const jurisdictionEvents = events.filter((e) => e.jurisdiction === jurisdiction);
    const phase13Events = jurisdictionEvents.filter((e) => e.phase13Enabled);
    const phase13Blocked = phase13Events.filter(
      (e) => e.phase13BlockerIds && e.phase13BlockerIds.length > 0
    ).length;

    return {
      jurisdiction,
      total: phase13Events.length,
      phase13Blocked,
      percent: phase13Events.length > 0
        ? ((phase13Blocked / phase13Events.length) * 100).toFixed(1) + '%'
        : '0.0%',
    };
  });
}

// ============================================================================
// MAIN REPORT GENERATION
// ============================================================================

function generatePhase14Report(): Phase14Report {
  const metrics = getAggregatedMetrics();
  const impactMetrics = getPhase14ImpactMetrics();
  const topAllBlockers = getTopBlockers(15);
  const topPhase13Blockers = getTopPhase13Blockers(10);

  const newlyBlockedPercent = impactMetrics.newlyBlockedPercent;

  return {
    timestamp: new Date().toISOString(),
    environment: {
      yamlOnlyMode: isYamlOnlyMode(),
      telemetryEnabled: isTelemetryEnabled(),
      phase13Enabled: isPhase13Enabled(),
      phase13RolloutPercent: getPhase13RolloutPercent(),
    },
    telemetry: {
      totalEvents: metrics.totalValidations,
      validCount: metrics.validCount,
      invalidCount: metrics.invalidCount,
      phase13EnabledCount: impactMetrics.phase13EnabledCount,
      phase13EnabledPercent: impactMetrics.phase13EnabledPercent.toFixed(1) + '%',
    },
    phase13Impact: {
      phase13NewlyBlockedCount: impactMetrics.phase13NewlyBlockedCount,
      newlyBlockedPercent: newlyBlockedPercent.toFixed(2) + '%',
      warningToBlockerRatio: Math.round(impactMetrics.warningToBlockerRatio * 100) / 100,
    },
    topPhase13Blockers: topPhase13Blockers.map((b) => ({
      ...b,
      description: PHASE_13_RULE_DESCRIPTIONS[b.ruleId] || 'Unknown rule',
    })),
    topAllBlockers: topAllBlockers.map((b) => ({
      ...b,
      isPhase13: isPhase13Rule(b.ruleId),
    })),
    jurisdictionBreakdown: getJurisdictionBreakdown(),
    recommendation: getRecommendation(newlyBlockedPercent),
  };
}

// ============================================================================
// OUTPUT FORMATTING
// ============================================================================

function printReport(report: Phase14Report): void {
  const hr = '='.repeat(75);
  const hrThin = '-'.repeat(75);

  console.log('\n' + hr);
  console.log(' PHASE 14: PHASE 13 CORRECTNESS IMPROVEMENTS ROLLOUT REPORT');
  console.log(hr);
  console.log(`\nTimestamp: ${report.timestamp}\n`);

  // Environment Status
  console.log(hrThin);
  console.log(' ENVIRONMENT STATUS');
  console.log(hrThin);
  console.log(`  YAML-Only Mode:         ${report.environment.yamlOnlyMode ? 'ENABLED' : 'DISABLED'}`);
  console.log(`  Telemetry:              ${report.environment.telemetryEnabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`  Phase 13 Enabled:       ${report.environment.phase13Enabled ? 'YES' : 'NO'}`);
  console.log(`  Rollout Percentage:     ${report.environment.phase13RolloutPercent}%`);
  console.log('');

  // Telemetry Summary
  console.log(hrThin);
  console.log(' TELEMETRY SUMMARY');
  console.log(hrThin);
  console.log(`  Total Validations:      ${report.telemetry.totalEvents}`);
  console.log(`  Valid (no blockers):    ${report.telemetry.validCount}`);
  console.log(`  Invalid (blocked):      ${report.telemetry.invalidCount}`);
  console.log(`  Phase 13 Enabled:       ${report.telemetry.phase13EnabledCount} (${report.telemetry.phase13EnabledPercent})`);
  console.log('');

  // Phase 13 Impact
  console.log(hrThin);
  console.log(' PHASE 13 IMPACT METRICS');
  console.log(hrThin);
  console.log(`  Newly Blocked Count:    ${report.phase13Impact.phase13NewlyBlockedCount}`);
  console.log(`  Newly Blocked Percent:  ${report.phase13Impact.newlyBlockedPercent}`);
  console.log(`  Warning/Blocker Ratio:  ${report.phase13Impact.warningToBlockerRatio}`);
  console.log('');

  // Recommendation
  console.log(hrThin);
  console.log(' ROLLOUT RECOMMENDATION');
  console.log(hrThin);
  const statusEmoji =
    report.recommendation.status === 'safe_to_proceed' ? '✅' :
    report.recommendation.status === 'monitor' ? '👀' :
    report.recommendation.status === 'investigate' ? '⚠️ ' : '🛑';
  console.log(`  Status: ${statusEmoji} ${report.recommendation.status.toUpperCase()}`);
  console.log(`  ${report.recommendation.message}`);
  console.log('');

  // Top Phase 13 Blockers
  if (report.topPhase13Blockers.length > 0) {
    console.log(hrThin);
    console.log(' TOP PHASE 13 BLOCKERS');
    console.log(hrThin);
    for (const blocker of report.topPhase13Blockers) {
      const count = String(blocker.count).padStart(5);
      console.log(`  ${count}  ${blocker.ruleId}`);
      console.log(`         ${blocker.description}`);
    }
    console.log('');
  } else {
    console.log(' No Phase 13 blockers recorded yet.\n');
  }

  // Top All Blockers (with Phase 13 indicator)
  if (report.topAllBlockers.length > 0) {
    console.log(hrThin);
    console.log(' TOP ALL BLOCKERS (Phase 13 rules marked with *)');
    console.log(hrThin);
    for (const blocker of report.topAllBlockers) {
      const count = String(blocker.count).padStart(5);
      const marker = blocker.isPhase13 ? ' *' : '  ';
      console.log(`  ${count}${marker} ${blocker.ruleId}`);
    }
    console.log('');
  }

  // Jurisdiction Breakdown
  if (report.jurisdictionBreakdown.some((j) => j.total > 0)) {
    console.log(hrThin);
    console.log(' JURISDICTION BREAKDOWN (Phase 13 enabled validations)');
    console.log(hrThin);
    console.log('  Jurisdiction    Total    Phase 13 Blocked    Percent');
    console.log('  ------------    -----    ----------------    -------');
    for (const jur of report.jurisdictionBreakdown) {
      const name = jur.jurisdiction.padEnd(14);
      const total = String(jur.total).padStart(5);
      const blocked = String(jur.phase13Blocked).padStart(16);
      const percent = jur.percent.padStart(10);
      console.log(`  ${name}  ${total}  ${blocked}  ${percent}`);
    }
    console.log('');
  }

  // Thresholds Reference
  console.log(hrThin);
  console.log(' PHASE 14 THRESHOLDS');
  console.log(hrThin);
  console.log(`  Safe to Proceed:        < ${THRESHOLDS.safeNewlyBlockedPercent}% newly blocked`);
  console.log(`  Monitor:                < ${THRESHOLDS.monitorNewlyBlockedPercent}% newly blocked`);
  console.log(`  Investigate:            < ${THRESHOLDS.investigateNewlyBlockedPercent}% newly blocked`);
  console.log(`  Consider Rollback:      >= ${THRESHOLDS.investigateNewlyBlockedPercent}% newly blocked`);
  console.log('');

  // Configuration Guide
  console.log(hrThin);
  console.log(' ROLLOUT CONFIGURATION');
  console.log(hrThin);
  console.log('  To adjust Phase 13 rollout:');
  console.log('');
  console.log('    # Disable Phase 13 (default)');
  console.log('    unset VALIDATION_PHASE13_ENABLED');
  console.log('    unset VALIDATION_PHASE13_ROLLOUT_PERCENT');
  console.log('');
  console.log('    # Enable at specific percentage');
  console.log('    export VALIDATION_PHASE13_ROLLOUT_PERCENT=10  # 10%');
  console.log('');
  console.log('    # Enable at 100%');
  console.log('    export VALIDATION_PHASE13_ENABLED=true');
  console.log('');

  console.log(hr);
  console.log(' Phase 14: Monitor Phase 13 correctness improvements rollout.');
  console.log(hr + '\n');
}

function printJsonReport(report: Phase14Report): void {
  console.log(JSON.stringify(report, null, 2));
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json') || args.includes('-j');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Usage: npm run validation:phase14-report [options]

Options:
  --json, -j    Output report as JSON
  --help, -h    Show this help message

Description:
  Analyzes the impact of Phase 13 correctness improvements rollout.
  Provides metrics for monitoring and decision-making on full enablement.

Key Metrics:
  - Phase 13 blocker frequency by rule ID
  - % of cases newly blocked vs Phase 12 baseline
  - Warnings vs blockers ratio
  - Rollout percentage and enablement status

Environment Variables:
  VALIDATION_PHASE13_ENABLED=true         # Enable Phase 13 at 100%
  VALIDATION_PHASE13_ROLLOUT_PERCENT=N    # Enable Phase 13 at N% (0-100)
  EVICTION_TELEMETRY_ENABLED=true         # Enable telemetry collection

Examples:
  npm run validation:phase14-report           # Human-readable output
  npm run validation:phase14-report --json    # JSON output for scripting
`);
    process.exit(0);
  }

  try {
    const report = generatePhase14Report();

    if (jsonOutput) {
      printJsonReport(report);
    } else {
      printReport(report);
    }

    // Exit with appropriate code based on recommendation
    if (report.recommendation.status === 'rollback') {
      process.exit(2);
    } else if (report.recommendation.status === 'investigate') {
      process.exit(1);
    }

    process.exit(0);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error generating Phase 14 impact report:', message);
    console.error('');
    console.error('Note: This script requires the validation adapter to be importable.');
    console.error("Make sure you're running from the project root directory.");
    process.exit(1);
  }
}

main();
