#!/usr/bin/env npx tsx
/**
 * Validation Status Script
 *
 * Outputs YAML-only validation statistics and key telemetry aggregates
 * for on-call engineers.
 *
 * Run with: npm run validation:status
 * Or directly: npx tsx scripts/validation-status.ts
 *
 * Phase 12: This script has been simplified following removal of TS validators.
 * YAML is now the sole validation system.
 */

import {
  getYamlOnlyStats,
  getAggregatedMetrics,
  getTopBlockers,
  getTopDiscrepancies,
  getFallbackStats,
  getMetricsStore,
  isYamlOnlyMode,
  isTelemetryEnabled,
} from '../src/lib/validation/shadow-mode-adapter';

// ============================================================================
// TYPES
// ============================================================================

interface StatusReport {
  timestamp: string;
  environment: {
    yamlOnlyMode: boolean;
    telemetryEnabled: boolean;
  };
  yamlOnlyStats: {
    totalValidations: number;
    errorCount: number;
    errorRate: number;
    errorRatePercent: string;
  };
  fallbackStats: {
    totalRequests: number;
    fallbackCount: number;
    fallbackRate: number;
    fallbackRatePercent: string;
  };
  telemetry: {
    totalEvents: number;
    validCount: number;
    invalidCount: number;
    avgDurationMs: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  topBlockers: Array<{ ruleId: string; count: number }>;
  topDiscrepancies: Array<{ key: string; count: number }>;
  alerts: {
    critical: string[];
    warning: string[];
  };
}

// ============================================================================
// ALERT THRESHOLDS
// ============================================================================

const THRESHOLDS = {
  criticalErrorRate: 0.005, // 0.5%
  warningErrorRate: 0.001, // 0.1%
  criticalLatencyMultiplier: 1.25, // +25%
  baselineP95Ms: 50, // Default baseline if not measured
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculatePercentiles(durations: number[]): { p50: number; p95: number; p99: number } {
  if (durations.length === 0) {
    return { p50: 0, p95: 0, p99: 0 };
  }
  const sorted = [...durations].sort((a, b) => a - b);
  return {
    p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
    p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
    p99: sorted[Math.floor(sorted.length * 0.99)] || 0,
  };
}

function checkAlerts(stats: StatusReport): { critical: string[]; warning: string[] } {
  const critical: string[] = [];
  const warning: string[] = [];

  // Check YAML-only error rate
  const errorRate = stats.yamlOnlyStats.errorRate;
  if (errorRate > THRESHOLDS.criticalErrorRate) {
    critical.push(
      `YamlOnlyHighErrorRate: ${stats.yamlOnlyStats.errorRatePercent} > ${THRESHOLDS.criticalErrorRate * 100}%`
    );
  } else if (errorRate > THRESHOLDS.warningErrorRate) {
    warning.push(
      `YamlOnlyElevatedErrorRate: ${stats.yamlOnlyStats.errorRatePercent} > ${THRESHOLDS.warningErrorRate * 100}%`
    );
  }

  // Check latency (if we have data)
  if (stats.latency.p95 > THRESHOLDS.baselineP95Ms * THRESHOLDS.criticalLatencyMultiplier) {
    critical.push(
      `ValidationLatencySpike: P95 ${stats.latency.p95}ms > ${THRESHOLDS.baselineP95Ms * THRESHOLDS.criticalLatencyMultiplier}ms threshold`
    );
  }

  // Check telemetry coverage
  if (stats.telemetry.totalEvents === 0 && stats.yamlOnlyStats.totalValidations > 0) {
    warning.push(
      `TelemetryCoverageDrop: No telemetry events recorded despite ${stats.yamlOnlyStats.totalValidations} validations`
    );
  }

  return { critical, warning };
}

function formatDuration(ms: number): string {
  return ms.toFixed(1) + 'ms';
}

// ============================================================================
// MAIN REPORT GENERATION
// ============================================================================

function generateStatusReport(): StatusReport {
  // Get all stats
  const yamlStats = getYamlOnlyStats();
  const fallbackStats = getFallbackStats();
  const metrics = getAggregatedMetrics();
  const events = getMetricsStore();
  const topBlockers = getTopBlockers(10);
  const topDiscrepancies = getTopDiscrepancies(10);

  // Calculate latency percentiles from events
  const durations = events.map((e) => e.durationMs);
  const latency = calculatePercentiles(durations);

  // Build report
  const report: StatusReport = {
    timestamp: new Date().toISOString(),
    environment: {
      yamlOnlyMode: isYamlOnlyMode(),
      telemetryEnabled: isTelemetryEnabled(),
    },
    yamlOnlyStats: {
      totalValidations: yamlStats.totalValidations,
      errorCount: yamlStats.errorCount,
      errorRate: yamlStats.errorRate,
      errorRatePercent: (yamlStats.errorRate * 100).toFixed(4) + '%',
    },
    fallbackStats: {
      totalRequests: fallbackStats.totalRequests,
      fallbackCount: fallbackStats.fallbackCount,
      fallbackRate: fallbackStats.fallbackRate,
      fallbackRatePercent: (fallbackStats.fallbackRate * 100).toFixed(4) + '%',
    },
    telemetry: {
      totalEvents: metrics.totalValidations,
      validCount: metrics.validCount,
      invalidCount: metrics.invalidCount,
      avgDurationMs: Math.round(metrics.avgDurationMs * 100) / 100,
    },
    latency,
    topBlockers,
    topDiscrepancies,
    alerts: { critical: [], warning: [] },
  };

  // Check for alerts
  report.alerts = checkAlerts(report);

  return report;
}

// ============================================================================
// OUTPUT FORMATTING
// ============================================================================

function printReport(report: StatusReport): void {
  const hr = '='.repeat(70);
  const hrThin = '-'.repeat(70);

  console.log('\n' + hr);
  console.log(' YAML-ONLY VALIDATION STATUS REPORT (Phase 12)');
  console.log(hr);
  console.log(`\nTimestamp: ${report.timestamp}\n`);

  // Environment Status
  console.log(hrThin);
  console.log(' ENVIRONMENT STATUS');
  console.log(hrThin);
  console.log(`  YAML-Only Mode:     ${report.environment.yamlOnlyMode ? 'ENABLED (permanent)' : 'DISABLED'}`);
  console.log(`  Telemetry:          ${report.environment.telemetryEnabled ? 'ENABLED' : 'DISABLED'}`);
  console.log('');

  // Alerts (if any)
  if (report.alerts.critical.length > 0 || report.alerts.warning.length > 0) {
    console.log(hrThin);
    console.log(' ACTIVE ALERTS');
    console.log(hrThin);
    for (const alert of report.alerts.critical) {
      console.log(`  [CRITICAL] ${alert}`);
    }
    for (const alert of report.alerts.warning) {
      console.log(`  [WARNING]  ${alert}`);
    }
    console.log('');
  } else {
    console.log('No active alerts\n');
  }

  // YAML-Only Stats
  console.log(hrThin);
  console.log(' YAML-ONLY VALIDATION METRICS');
  console.log(hrThin);
  console.log(`  Total Validations:  ${report.yamlOnlyStats.totalValidations}`);
  console.log(`  Error Count:        ${report.yamlOnlyStats.errorCount}`);
  console.log(`  Error Rate:         ${report.yamlOnlyStats.errorRatePercent}`);
  console.log('');

  // Fallback Stats (Phase 12: should always be 0)
  console.log(hrThin);
  console.log(' TS FALLBACK METRICS (Phase 12: always 0)');
  console.log(hrThin);
  console.log(`  Total Requests:     ${report.fallbackStats.totalRequests}`);
  console.log(`  Fallback Count:     ${report.fallbackStats.fallbackCount}`);
  console.log(`  Fallback Rate:      ${report.fallbackStats.fallbackRatePercent}`);
  console.log('');

  // Telemetry
  console.log(hrThin);
  console.log(' TELEMETRY AGGREGATES');
  console.log(hrThin);
  console.log(`  Events Recorded:    ${report.telemetry.totalEvents}`);
  console.log(`  Valid Validations:  ${report.telemetry.validCount}`);
  console.log(`  Invalid (blocked):  ${report.telemetry.invalidCount}`);
  console.log(`  Avg Duration:       ${formatDuration(report.telemetry.avgDurationMs)}`);
  console.log('');

  // Latency
  console.log(hrThin);
  console.log(' LATENCY PERCENTILES');
  console.log(hrThin);
  console.log(`  P50:                ${formatDuration(report.latency.p50)}`);
  console.log(`  P95:                ${formatDuration(report.latency.p95)}`);
  console.log(`  P99:                ${formatDuration(report.latency.p99)}`);
  console.log('');

  // Top Blockers
  if (report.topBlockers.length > 0) {
    console.log(hrThin);
    console.log(' TOP BLOCKERS (by frequency)');
    console.log(hrThin);
    for (const blocker of report.topBlockers.slice(0, 10)) {
      console.log(`  ${blocker.ruleId.padEnd(50)} ${String(blocker.count).padStart(5)}`);
    }
    console.log('');
  }

  // Thresholds Reference
  console.log(hrThin);
  console.log(' MONITORING THRESHOLDS');
  console.log(hrThin);
  console.log('  Daily Error Rate:   <= 0.05%');
  console.log('  Rolling 7-Day Rate: <= 0.02%');
  console.log('  P95 Latency:        <= +10% vs baseline');
  console.log('');

  console.log(hr);
  console.log(' Phase 12: YAML is the sole validation system.');
  console.log(' TS validators have been permanently removed.');
  console.log(hr + '\n');
}

function printJsonReport(report: StatusReport): void {
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
Usage: npm run validation:status [options]

Options:
  --json, -j    Output report as JSON
  --help, -h    Show this help message

Description:
  Outputs YAML-only validation statistics and telemetry aggregates.
  Phase 12: YAML is the sole validation system (TS validators removed).

Examples:
  npm run validation:status           # Human-readable output
  npm run validation:status --json    # JSON output for scripting
`);
    process.exit(0);
  }

  try {
    const report = generateStatusReport();

    if (jsonOutput) {
      printJsonReport(report);
    } else {
      printReport(report);
    }

    // Exit with error code if critical alerts
    if (report.alerts.critical.length > 0) {
      process.exit(1);
    }

    process.exit(0);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error generating status report:', message);
    console.error('');
    console.error('Note: This script requires the validation adapter to be importable.');
    console.error("Make sure you're running from the project root directory.");
    process.exit(1);
  }
}

main();
