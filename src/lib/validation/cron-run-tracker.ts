/**
 * Cron Run Tracker
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 *
 * Tracks cron job executions, their status, and determines when attention is needed.
 * Persists run results for display in the admin dashboard.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Status of a cron run.
 */
export type CronRunStatus = 'running' | 'success' | 'partial' | 'failed';

/**
 * Known cron job names.
 */
export type CronJobName =
  | 'legal-change:check'
  | 'legal-change:ingest'
  | 'compliance:check'
  | 'validation:audit';

/**
 * A cron run record.
 */
export interface CronRun {
  id: string;
  jobName: CronJobName;
  startedAt: string;
  finishedAt?: string;
  status: CronRunStatus;
  durationMs?: number;

  // Metrics
  sourcesChecked: number;
  eventsCreated: number;
  eventsUpdated: number;

  // Issues
  errors: CronRunError[];
  warnings: string[];

  // Output
  summary: string;
  rawOutput?: string;

  // Trigger info
  triggeredBy: 'cron' | 'manual' | 'webhook';
  triggeredByUserId?: string;
}

/**
 * Error details for a cron run.
 */
export interface CronRunError {
  sourceId?: string;
  message: string;
  code?: string;
  timestamp: string;
  stack?: string;
}

/**
 * Configuration for "needs checking" logic.
 */
export interface NeedsCheckingConfig {
  maxHoursSinceLastRun: number;
  maxFailedRunsBeforeAlert: number;
  minSuccessRate: number; // percentage (0-100)
  alertOnNewEvents: boolean;
  alertOnHighUnverifiedRate: number; // percentage (0-100)
}

/**
 * Default configuration for "needs checking".
 */
export const DEFAULT_NEEDS_CHECKING_CONFIG: NeedsCheckingConfig = {
  maxHoursSinceLastRun: 24,
  maxFailedRunsBeforeAlert: 2,
  minSuccessRate: 80,
  alertOnNewEvents: true,
  alertOnHighUnverifiedRate: 50,
};

/**
 * Reason why a job needs checking.
 */
export interface NeedsCheckingReason {
  reason: string;
  severity: 'warning' | 'error' | 'info';
  value?: string | number;
  threshold?: string | number;
}

/**
 * Status summary for a job.
 */
export interface JobStatusSummary {
  jobName: CronJobName;
  lastRun?: CronRun;
  nextScheduledTime?: string;
  needsChecking: boolean;
  needsCheckingReasons: NeedsCheckingReason[];
  recentRuns: CronRun[];
  successRate: number;
  totalRuns: number;
}

/**
 * Filter options for listing cron runs.
 */
export interface CronRunFilter {
  jobName?: CronJobName;
  status?: CronRunStatus[];
  startedAfter?: string;
  startedBefore?: string;
  triggeredBy?: 'cron' | 'manual' | 'webhook';
  limit?: number;
}

// ============================================================================
// IN-MEMORY STORE
// ============================================================================

const cronRunStore: Map<string, CronRun> = new Map();
let runIdCounter = 1;

// Maximum runs to keep in memory per job
const MAX_RUNS_PER_JOB = 100;

/**
 * Generate a unique run ID.
 */
function generateRunId(): string {
  const timestamp = Date.now().toString(36);
  const counter = (runIdCounter++).toString(36).padStart(4, '0');
  return `run_${timestamp}_${counter}`;
}

// ============================================================================
// CRON RUN OPERATIONS
// ============================================================================

/**
 * Start a new cron run.
 */
export function startCronRun(
  jobName: CronJobName,
  triggeredBy: 'cron' | 'manual' | 'webhook',
  triggeredByUserId?: string
): CronRun {
  const id = generateRunId();
  const now = new Date().toISOString();

  const run: CronRun = {
    id,
    jobName,
    startedAt: now,
    status: 'running',
    sourcesChecked: 0,
    eventsCreated: 0,
    eventsUpdated: 0,
    errors: [],
    warnings: [],
    summary: `${jobName} started`,
    triggeredBy,
    triggeredByUserId,
  };

  cronRunStore.set(id, run);

  // Cleanup old runs for this job
  cleanupOldRuns(jobName);

  return run;
}

/**
 * Update a running cron run with progress.
 */
export function updateCronRun(
  runId: string,
  updates: Partial<Pick<CronRun, 'sourcesChecked' | 'eventsCreated' | 'eventsUpdated' | 'warnings' | 'rawOutput'>>
): CronRun | undefined {
  const run = cronRunStore.get(runId);
  if (!run) return undefined;

  const updated = {
    ...run,
    ...updates,
    warnings: updates.warnings ? [...run.warnings, ...updates.warnings] : run.warnings,
  };

  cronRunStore.set(runId, updated);
  return updated;
}

/**
 * Add an error to a running cron run.
 */
export function addCronRunError(
  runId: string,
  error: Omit<CronRunError, 'timestamp'>
): CronRun | undefined {
  const run = cronRunStore.get(runId);
  if (!run) return undefined;

  const errorWithTimestamp: CronRunError = {
    ...error,
    timestamp: new Date().toISOString(),
  };

  const updated = {
    ...run,
    errors: [...run.errors, errorWithTimestamp],
  };

  cronRunStore.set(runId, updated);
  return updated;
}

/**
 * Complete a cron run.
 */
export function completeCronRun(
  runId: string,
  status: 'success' | 'partial' | 'failed',
  summary: string,
  finalMetrics?: {
    sourcesChecked?: number;
    eventsCreated?: number;
    eventsUpdated?: number;
  }
): CronRun | undefined {
  const run = cronRunStore.get(runId);
  if (!run) return undefined;

  const finishedAt = new Date().toISOString();
  const durationMs = new Date(finishedAt).getTime() - new Date(run.startedAt).getTime();

  const updated: CronRun = {
    ...run,
    finishedAt,
    status,
    durationMs,
    summary,
    sourcesChecked: finalMetrics?.sourcesChecked ?? run.sourcesChecked,
    eventsCreated: finalMetrics?.eventsCreated ?? run.eventsCreated,
    eventsUpdated: finalMetrics?.eventsUpdated ?? run.eventsUpdated,
  };

  cronRunStore.set(runId, updated);
  return updated;
}

/**
 * Get a cron run by ID.
 */
export function getCronRun(runId: string): CronRun | undefined {
  return cronRunStore.get(runId);
}

/**
 * List cron runs with filtering.
 */
export function listCronRuns(filter?: CronRunFilter): CronRun[] {
  let runs = Array.from(cronRunStore.values());

  if (filter) {
    if (filter.jobName) {
      runs = runs.filter((r) => r.jobName === filter.jobName);
    }
    if (filter.status?.length) {
      runs = runs.filter((r) => filter.status!.includes(r.status));
    }
    if (filter.startedAfter) {
      runs = runs.filter((r) => r.startedAt >= filter.startedAfter!);
    }
    if (filter.startedBefore) {
      runs = runs.filter((r) => r.startedAt <= filter.startedBefore!);
    }
    if (filter.triggeredBy) {
      runs = runs.filter((r) => r.triggeredBy === filter.triggeredBy);
    }
  }

  // Sort by started date, newest first
  runs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  // Apply limit
  if (filter?.limit && filter.limit > 0) {
    runs = runs.slice(0, filter.limit);
  }

  return runs;
}

/**
 * Get the last run for a job.
 */
export function getLastRunForJob(jobName: CronJobName): CronRun | undefined {
  const runs = listCronRuns({ jobName, limit: 1 });
  return runs[0];
}

/**
 * Get recent runs for a job.
 */
export function getRecentRunsForJob(jobName: CronJobName, count = 10): CronRun[] {
  return listCronRuns({ jobName, limit: count });
}

/**
 * Cleanup old runs for a job.
 */
function cleanupOldRuns(jobName: CronJobName): void {
  const runs = listCronRuns({ jobName });

  if (runs.length > MAX_RUNS_PER_JOB) {
    // Keep only the most recent runs
    const runsToDelete = runs.slice(MAX_RUNS_PER_JOB);
    for (const run of runsToDelete) {
      cronRunStore.delete(run.id);
    }
  }
}

// ============================================================================
// "NEEDS CHECKING" LOGIC
// ============================================================================

/**
 * Check if a job needs attention.
 */
export function checkJobNeedsAttention(
  jobName: CronJobName,
  config: NeedsCheckingConfig = DEFAULT_NEEDS_CHECKING_CONFIG,
  newEventsCount = 0,
  unverifiedImpactsRate = 0
): NeedsCheckingReason[] {
  const reasons: NeedsCheckingReason[] = [];
  const recentRuns = getRecentRunsForJob(jobName, 10);
  const lastRun = recentRuns[0];

  // Check 1: No runs found
  if (!lastRun) {
    reasons.push({
      reason: 'No runs recorded',
      severity: 'warning',
    });
    return reasons;
  }

  // Check 2: Last run failed
  if (lastRun.status === 'failed') {
    reasons.push({
      reason: 'Last run failed',
      severity: 'error',
      value: lastRun.summary,
    });
  }

  // Check 3: Last run is still running (potentially stuck)
  if (lastRun.status === 'running') {
    const runningTime = Date.now() - new Date(lastRun.startedAt).getTime();
    const maxRunTime = 30 * 60 * 1000; // 30 minutes

    if (runningTime > maxRunTime) {
      reasons.push({
        reason: 'Run appears to be stuck',
        severity: 'error',
        value: `${Math.round(runningTime / 60000)} minutes`,
        threshold: '30 minutes',
      });
    }
  }

  // Check 4: Too long since last successful run
  const lastSuccessfulRun = recentRuns.find((r) => r.status === 'success');
  if (lastSuccessfulRun) {
    const hoursSinceSuccess = (Date.now() - new Date(lastSuccessfulRun.startedAt).getTime()) / (1000 * 60 * 60);

    if (hoursSinceSuccess > config.maxHoursSinceLastRun) {
      reasons.push({
        reason: 'Too long since last successful run',
        severity: 'warning',
        value: `${Math.round(hoursSinceSuccess)} hours`,
        threshold: `${config.maxHoursSinceLastRun} hours`,
      });
    }
  } else if (recentRuns.length > 0) {
    // No successful runs found in recent history
    reasons.push({
      reason: 'No recent successful runs',
      severity: 'error',
    });
  }

  // Check 5: Multiple consecutive failures
  const consecutiveFailures = countConsecutiveFailures(recentRuns);
  if (consecutiveFailures >= config.maxFailedRunsBeforeAlert) {
    reasons.push({
      reason: 'Multiple consecutive failures',
      severity: 'error',
      value: consecutiveFailures,
      threshold: config.maxFailedRunsBeforeAlert,
    });
  }

  // Check 6: Low success rate
  const successRate = calculateSuccessRate(recentRuns);
  if (successRate < config.minSuccessRate && recentRuns.length >= 5) {
    reasons.push({
      reason: 'Low success rate',
      severity: 'warning',
      value: `${successRate}%`,
      threshold: `${config.minSuccessRate}%`,
    });
  }

  // Check 7: New events created (if configured)
  if (config.alertOnNewEvents && newEventsCount > 0) {
    reasons.push({
      reason: 'New events created',
      severity: 'info',
      value: newEventsCount,
    });
  }

  // Check 8: High unverified rate
  if (unverifiedImpactsRate >= config.alertOnHighUnverifiedRate) {
    reasons.push({
      reason: 'High unverified impacts rate',
      severity: 'warning',
      value: `${unverifiedImpactsRate}%`,
      threshold: `${config.alertOnHighUnverifiedRate}%`,
    });
  }

  // Check 9: Errors in last run
  if (lastRun.errors.length > 0) {
    reasons.push({
      reason: 'Errors in last run',
      severity: lastRun.status === 'failed' ? 'error' : 'warning',
      value: lastRun.errors.length,
    });
  }

  return reasons;
}

/**
 * Count consecutive failures from the start of the list.
 */
function countConsecutiveFailures(runs: CronRun[]): number {
  let count = 0;
  for (const run of runs) {
    if (run.status === 'failed') {
      count++;
    } else if (run.status === 'success') {
      break;
    }
    // 'partial' and 'running' don't break the streak but don't add to it
  }
  return count;
}

/**
 * Calculate success rate from recent runs.
 */
function calculateSuccessRate(runs: CronRun[]): number {
  const completedRuns = runs.filter((r) => r.status !== 'running');
  if (completedRuns.length === 0) return 100;

  const successfulRuns = completedRuns.filter((r) => r.status === 'success').length;
  return Math.round((successfulRuns / completedRuns.length) * 100);
}

/**
 * Get full status summary for a job.
 */
export function getJobStatusSummary(
  jobName: CronJobName,
  config: NeedsCheckingConfig = DEFAULT_NEEDS_CHECKING_CONFIG,
  newEventsCount = 0,
  unverifiedImpactsRate = 0
): JobStatusSummary {
  const recentRuns = getRecentRunsForJob(jobName, 10);
  const lastRun = recentRuns[0];
  const needsCheckingReasons = checkJobNeedsAttention(
    jobName,
    config,
    newEventsCount,
    unverifiedImpactsRate
  );

  // Calculate next scheduled time based on job type
  const nextScheduledTime = calculateNextScheduledTime(jobName, lastRun);

  return {
    jobName,
    lastRun,
    nextScheduledTime,
    needsChecking: needsCheckingReasons.length > 0,
    needsCheckingReasons,
    recentRuns,
    successRate: calculateSuccessRate(recentRuns),
    totalRuns: recentRuns.length,
  };
}

/**
 * Calculate next scheduled time for a job.
 */
function calculateNextScheduledTime(jobName: CronJobName, lastRun?: CronRun): string | undefined {
  // Define schedule intervals per job (in hours)
  const schedules: Record<CronJobName, number> = {
    'legal-change:check': 24, // Daily
    'legal-change:ingest': 6, // Every 6 hours
    'compliance:check': 24, // Daily
    'validation:audit': 168, // Weekly
  };

  const intervalHours = schedules[jobName];
  if (!intervalHours) return undefined;

  // Base on last run or current time
  const baseTime = lastRun?.startedAt ? new Date(lastRun.startedAt) : new Date();
  const nextTime = new Date(baseTime.getTime() + intervalHours * 60 * 60 * 1000);

  // If next time is in the past, calculate from now
  if (nextTime < new Date()) {
    return new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString();
  }

  return nextTime.toISOString();
}

/**
 * Get all job statuses.
 */
export function getAllJobStatuses(
  config: NeedsCheckingConfig = DEFAULT_NEEDS_CHECKING_CONFIG
): JobStatusSummary[] {
  const jobNames: CronJobName[] = [
    'legal-change:check',
    'legal-change:ingest',
    'compliance:check',
    'validation:audit',
  ];

  return jobNames.map((jobName) => getJobStatusSummary(jobName, config));
}

/**
 * Get jobs that need attention.
 */
export function getJobsNeedingAttention(
  config: NeedsCheckingConfig = DEFAULT_NEEDS_CHECKING_CONFIG
): JobStatusSummary[] {
  return getAllJobStatuses(config).filter((s) => s.needsChecking);
}

// ============================================================================
// METRICS & AGGREGATION
// ============================================================================

/**
 * Get aggregated metrics for a job over a time period.
 */
export function getJobMetrics(
  jobName: CronJobName,
  startDate: string,
  endDate: string
): {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalSourcesChecked: number;
  totalEventsCreated: number;
  totalEventsUpdated: number;
  totalErrors: number;
  avgDurationMs: number;
} {
  const runs = listCronRuns({
    jobName,
    startedAfter: startDate,
    startedBefore: endDate,
  });

  const completedRuns = runs.filter((r) => r.status !== 'running');
  const successfulRuns = completedRuns.filter((r) => r.status === 'success');
  const failedRuns = completedRuns.filter((r) => r.status === 'failed');

  const totalDurationMs = completedRuns
    .filter((r) => r.durationMs !== undefined)
    .reduce((sum, r) => sum + (r.durationMs ?? 0), 0);

  return {
    totalRuns: runs.length,
    successfulRuns: successfulRuns.length,
    failedRuns: failedRuns.length,
    totalSourcesChecked: runs.reduce((sum, r) => sum + r.sourcesChecked, 0),
    totalEventsCreated: runs.reduce((sum, r) => sum + r.eventsCreated, 0),
    totalEventsUpdated: runs.reduce((sum, r) => sum + r.eventsUpdated, 0),
    totalErrors: runs.reduce((sum, r) => sum + r.errors.length, 0),
    avgDurationMs: completedRuns.length > 0 ? Math.round(totalDurationMs / completedRuns.length) : 0,
  };
}

// ============================================================================
// CLEAR / TESTING UTILITIES
// ============================================================================

/**
 * Clear all cron runs (for testing).
 */
export function clearCronRuns(): void {
  cronRunStore.clear();
  runIdCounter = 1;
}

/**
 * Get total run count (for testing/monitoring).
 */
export function getTotalRunCount(): number {
  return cronRunStore.size;
}

/**
 * Export all runs for backup.
 */
export function exportCronRuns(): {
  runs: CronRun[];
  exportedAt: string;
  totalCount: number;
} {
  return {
    runs: Array.from(cronRunStore.values()),
    exportedAt: new Date().toISOString(),
    totalCount: cronRunStore.size,
  };
}

/**
 * Import runs from backup.
 */
export function importCronRuns(
  runs: CronRun[],
  overwrite = false
): { imported: number; skipped: number } {
  let imported = 0;
  let skipped = 0;

  for (const run of runs) {
    if (cronRunStore.has(run.id) && !overwrite) {
      skipped++;
      continue;
    }
    cronRunStore.set(run.id, run);
    imported++;
  }

  return { imported, skipped };
}
