/**
 * Cron Run Tracker
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 *
 * Tracks cron job executions, their status, and determines when attention is needed.
 * Uses Supabase for persistent storage (serverless-safe).
 *
 * Production-hardened: All data persisted to database for reliability across deploys.
 */

import { createAdminClient } from '@/lib/supabase/server';

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

/**
 * Database row type for cron_runs table.
 */
interface CronRunRow {
  id: string;
  job_name: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  duration_ms: number | null;
  sources_checked: number;
  events_created: number;
  events_updated: number;
  errors: CronRunError[];
  warnings: string[];
  summary: string | null;
  raw_output: string | null;
  triggered_by: string;
  triggered_by_user_id: string | null;
  created_at: string;
}

// ============================================================================
// DATABASE HELPERS
// ============================================================================

/**
 * Convert database row to CronRun object.
 */
function rowToCronRun(row: CronRunRow): CronRun {
  return {
    id: row.id,
    jobName: row.job_name as CronJobName,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
    status: row.status as CronRunStatus,
    durationMs: row.duration_ms ?? undefined,
    sourcesChecked: row.sources_checked,
    eventsCreated: row.events_created,
    eventsUpdated: row.events_updated ?? 0,
    errors: row.errors || [],
    warnings: row.warnings || [],
    summary: row.summary || '',
    rawOutput: row.raw_output ?? undefined,
    triggeredBy: row.triggered_by as 'cron' | 'manual' | 'webhook',
    triggeredByUserId: row.triggered_by_user_id ?? undefined,
  };
}

// ============================================================================
// IN-MEMORY CACHE (short-lived for current request only)
// ============================================================================

// Cache for the current request's run (avoids extra DB calls during a single run)
let currentRunCache: CronRun | null = null;

// ============================================================================
// CRON RUN OPERATIONS
// ============================================================================

/**
 * Start a new cron run.
 * Persists to database immediately.
 */
export async function startCronRun(
  jobName: CronJobName,
  triggeredBy: 'cron' | 'manual' | 'webhook',
  triggeredByUserId?: string
): Promise<CronRun> {
  const now = new Date().toISOString();

  const run: CronRun = {
    id: '', // Will be set by database
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

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('cron_runs')
      .insert({
        job_name: run.jobName,
        started_at: run.startedAt,
        status: run.status,
        sources_checked: run.sourcesChecked,
        events_created: run.eventsCreated,
        events_updated: run.eventsUpdated,
        errors: run.errors,
        warnings: run.warnings,
        summary: run.summary,
        triggered_by: run.triggeredBy,
        triggered_by_user_id: run.triggeredByUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('[CronRunTracker] Failed to insert cron run:', error);
      // Generate a fallback ID for in-memory only operation
      run.id = `run_${Date.now().toString(36)}_fallback`;
    } else if (data) {
      run.id = (data as unknown as CronRunRow).id;
    }
  } catch (err) {
    console.error('[CronRunTracker] Database error on start:', err);
    run.id = `run_${Date.now().toString(36)}_fallback`;
  }

  // Cache current run
  currentRunCache = run;

  return run;
}

/**
 * Update a running cron run with progress.
 */
export async function updateCronRun(
  runId: string,
  updates: Partial<Pick<CronRun, 'sourcesChecked' | 'eventsCreated' | 'eventsUpdated' | 'warnings' | 'rawOutput'>>
): Promise<CronRun | undefined> {
  // Update cache if it's the current run
  if (currentRunCache && currentRunCache.id === runId) {
    currentRunCache = {
      ...currentRunCache,
      ...updates,
      warnings: updates.warnings
        ? [...currentRunCache.warnings, ...updates.warnings]
        : currentRunCache.warnings,
    };
  }

  try {
    const supabase = createAdminClient();

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (updates.sourcesChecked !== undefined) updateData.sources_checked = updates.sourcesChecked;
    if (updates.eventsCreated !== undefined) updateData.events_created = updates.eventsCreated;
    if (updates.eventsUpdated !== undefined) updateData.events_updated = updates.eventsUpdated;
    if (updates.rawOutput !== undefined) updateData.raw_output = updates.rawOutput;

    // For warnings, we need to append to existing
    if (updates.warnings && updates.warnings.length > 0) {
      // Fetch current warnings and append
      const { data: current } = await supabase
        .from('cron_runs')
        .select('warnings')
        .eq('id', runId)
        .single();

      const existingWarnings = (current?.warnings as string[]) || [];
      updateData.warnings = [...existingWarnings, ...updates.warnings];
    }

    if (Object.keys(updateData).length > 0) {
      const { data, error } = await supabase
        .from('cron_runs')
        .update(updateData)
        .eq('id', runId)
        .select()
        .single();

      if (error) {
        console.error('[CronRunTracker] Failed to update cron run:', error);
      } else if (data) {
        const updated = rowToCronRun(data as unknown as CronRunRow);
        currentRunCache = updated;
        return updated;
      }
    }
  } catch (err) {
    console.error('[CronRunTracker] Database error on update:', err);
  }

  return currentRunCache ?? undefined;
}

/**
 * Add an error to a running cron run.
 */
export async function addCronRunError(
  runId: string,
  error: Omit<CronRunError, 'timestamp'>
): Promise<CronRun | undefined> {
  const errorWithTimestamp: CronRunError = {
    ...error,
    timestamp: new Date().toISOString(),
  };

  // Update cache if it's the current run
  if (currentRunCache && currentRunCache.id === runId) {
    currentRunCache = {
      ...currentRunCache,
      errors: [...currentRunCache.errors, errorWithTimestamp],
    };
  }

  try {
    const supabase = createAdminClient();

    // Fetch current errors and append
    const { data: current } = await supabase
      .from('cron_runs')
      .select('errors')
      .eq('id', runId)
      .single();

    const existingErrors = (current?.errors as CronRunError[]) || [];
    const newErrors = [...existingErrors, errorWithTimestamp];

    const { data, error: updateError } = await supabase
      .from('cron_runs')
      .update({ errors: newErrors })
      .eq('id', runId)
      .select()
      .single();

    if (updateError) {
      console.error('[CronRunTracker] Failed to add error:', updateError);
    } else if (data) {
      const updated = rowToCronRun(data as unknown as CronRunRow);
      currentRunCache = updated;
      return updated;
    }
  } catch (err) {
    console.error('[CronRunTracker] Database error on addError:', err);
  }

  return currentRunCache ?? undefined;
}

/**
 * Complete a cron run.
 */
export async function completeCronRun(
  runId: string,
  status: 'success' | 'partial' | 'failed',
  summary: string,
  finalMetrics?: {
    sourcesChecked?: number;
    eventsCreated?: number;
    eventsUpdated?: number;
  }
): Promise<CronRun | undefined> {
  const finishedAt = new Date().toISOString();

  // Calculate duration from cache or estimate
  let durationMs = 0;
  if (currentRunCache && currentRunCache.id === runId) {
    durationMs = new Date(finishedAt).getTime() - new Date(currentRunCache.startedAt).getTime();
  }

  try {
    const supabase = createAdminClient();

    // If we don't have the start time from cache, fetch it
    if (durationMs === 0) {
      const { data: current } = await supabase
        .from('cron_runs')
        .select('started_at')
        .eq('id', runId)
        .single();

      if (current?.started_at) {
        durationMs = new Date(finishedAt).getTime() - new Date(current.started_at).getTime();
      }
    }

    const updateData: Record<string, unknown> = {
      finished_at: finishedAt,
      status,
      duration_ms: durationMs,
      summary,
    };

    if (finalMetrics?.sourcesChecked !== undefined) {
      updateData.sources_checked = finalMetrics.sourcesChecked;
    }
    if (finalMetrics?.eventsCreated !== undefined) {
      updateData.events_created = finalMetrics.eventsCreated;
    }
    if (finalMetrics?.eventsUpdated !== undefined) {
      updateData.events_updated = finalMetrics.eventsUpdated;
    }

    const { data, error } = await supabase
      .from('cron_runs')
      .update(updateData)
      .eq('id', runId)
      .select()
      .single();

    if (error) {
      console.error('[CronRunTracker] Failed to complete cron run:', error);
    } else if (data) {
      const completed = rowToCronRun(data as unknown as CronRunRow);
      currentRunCache = null; // Clear cache
      return completed;
    }
  } catch (err) {
    console.error('[CronRunTracker] Database error on complete:', err);
  }

  // Clear cache regardless
  currentRunCache = null;
  return undefined;
}

/**
 * Get a cron run by ID.
 */
export async function getCronRun(runId: string): Promise<CronRun | undefined> {
  // Check cache first
  if (currentRunCache && currentRunCache.id === runId) {
    return currentRunCache;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('cron_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (error || !data) {
      return undefined;
    }

    return rowToCronRun(data as unknown as CronRunRow);
  } catch (err) {
    console.error('[CronRunTracker] Database error on getCronRun:', err);
    return undefined;
  }
}

/**
 * List cron runs with filtering.
 */
export async function listCronRuns(filter?: CronRunFilter): Promise<CronRun[]> {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('cron_runs')
      .select('*')
      .order('started_at', { ascending: false });

    if (filter?.jobName) {
      query = query.eq('job_name', filter.jobName);
    }
    if (filter?.status?.length) {
      query = query.in('status', filter.status);
    }
    if (filter?.startedAfter) {
      query = query.gte('started_at', filter.startedAfter);
    }
    if (filter?.startedBefore) {
      query = query.lte('started_at', filter.startedBefore);
    }
    if (filter?.triggeredBy) {
      query = query.eq('triggered_by', filter.triggeredBy);
    }
    if (filter?.limit) {
      query = query.limit(filter.limit);
    } else {
      query = query.limit(100); // Default limit
    }

    const { data, error } = await query;

    if (error) {
      console.error('[CronRunTracker] Failed to list cron runs:', error);
      return [];
    }

    return (data || []).map((row) => rowToCronRun(row as unknown as CronRunRow));
  } catch (err) {
    console.error('[CronRunTracker] Database error on listCronRuns:', err);
    return [];
  }
}

/**
 * Get the last run for a job.
 */
export async function getLastRunForJob(jobName: CronJobName): Promise<CronRun | undefined> {
  const runs = await listCronRuns({ jobName, limit: 1 });
  return runs[0];
}

/**
 * Get recent runs for a job.
 */
export async function getRecentRunsForJob(jobName: CronJobName, count = 10): Promise<CronRun[]> {
  return listCronRuns({ jobName, limit: count });
}

// ============================================================================
// "NEEDS CHECKING" LOGIC
// ============================================================================

/**
 * Check if a job needs attention.
 */
export async function checkJobNeedsAttention(
  jobName: CronJobName,
  config: NeedsCheckingConfig = DEFAULT_NEEDS_CHECKING_CONFIG,
  newEventsCount = 0,
  unverifiedImpactsRate = 0
): Promise<NeedsCheckingReason[]> {
  const reasons: NeedsCheckingReason[] = [];
  const recentRuns = await getRecentRunsForJob(jobName, 10);
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
    const hoursSinceSuccess =
      (Date.now() - new Date(lastSuccessfulRun.startedAt).getTime()) / (1000 * 60 * 60);

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
export async function getJobStatusSummary(
  jobName: CronJobName,
  config: NeedsCheckingConfig = DEFAULT_NEEDS_CHECKING_CONFIG,
  newEventsCount = 0,
  unverifiedImpactsRate = 0
): Promise<JobStatusSummary> {
  const recentRuns = await getRecentRunsForJob(jobName, 10);
  const lastRun = recentRuns[0];
  const needsCheckingReasons = await checkJobNeedsAttention(
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
export async function getAllJobStatuses(
  config: NeedsCheckingConfig = DEFAULT_NEEDS_CHECKING_CONFIG
): Promise<JobStatusSummary[]> {
  const jobNames: CronJobName[] = [
    'legal-change:check',
    'legal-change:ingest',
    'compliance:check',
    'validation:audit',
  ];

  return Promise.all(jobNames.map((jobName) => getJobStatusSummary(jobName, config)));
}

/**
 * Get jobs that need attention.
 */
export async function getJobsNeedingAttention(
  config: NeedsCheckingConfig = DEFAULT_NEEDS_CHECKING_CONFIG
): Promise<JobStatusSummary[]> {
  const allStatuses = await getAllJobStatuses(config);
  return allStatuses.filter((s) => s.needsChecking);
}

// ============================================================================
// METRICS & AGGREGATION
// ============================================================================

/**
 * Get aggregated metrics for a job over a time period.
 */
export async function getJobMetrics(
  jobName: CronJobName,
  startDate: string,
  endDate: string
): Promise<{
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalSourcesChecked: number;
  totalEventsCreated: number;
  totalEventsUpdated: number;
  totalErrors: number;
  avgDurationMs: number;
}> {
  const runs = await listCronRuns({
    jobName,
    startedAfter: startDate,
    startedBefore: endDate,
    limit: 1000, // Higher limit for metrics
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
// TESTING UTILITIES
// ============================================================================

/**
 * Clear all cron runs (for testing only - deletes from database).
 * WARNING: This permanently deletes data.
 */
export async function clearCronRuns(): Promise<void> {
  currentRunCache = null;

  // Only clear in test environment
  if (process.env.NODE_ENV === 'test') {
    try {
      const supabase = createAdminClient();
      await supabase.from('cron_runs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err) {
      console.error('[CronRunTracker] Failed to clear cron runs:', err);
    }
  }
}

/**
 * Get total run count (for testing/monitoring).
 */
export async function getTotalRunCount(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from('cron_runs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[CronRunTracker] Failed to get count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('[CronRunTracker] Database error on getTotalRunCount:', err);
    return 0;
  }
}
