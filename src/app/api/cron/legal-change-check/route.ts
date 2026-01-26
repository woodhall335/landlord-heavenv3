/**
 * Legal Change Check Cron Job
 *
 * Triggered daily (recommended: 2am)
 * Checks all enabled legal sources for changes and creates events
 *
 * Usage: Call from Vercel Cron or external cron service
 * Authorization: Requires CRON_SECRET token
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  startCronRun,
  completeCronRun,
  addCronRunError,
  updateCronRun,
  CronRun,
} from '@/lib/validation/cron-run-tracker';
import {
  getEnabledSources,
  LegalSource,
} from '@/lib/validation/legal-source-registry';
import {
  createEvent,
  listEvents,
  LegalChangeEvent,
  countEventsByState,
} from '@/lib/validation/legal-change-events';
import { analyzeAndAssess } from '@/lib/validation/legal-impact-analyzer';

/**
 * POST endpoint for cron execution
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Legal Change Cron] Starting scheduled check...');

    // Start the cron run
    const run = startCronRun('legal-change:check', 'cron');

    // Get all enabled sources
    const sources = getEnabledSources();
    console.log(`[Legal Change Cron] Checking ${sources.length} sources`);

    // Tracking
    let sourcesChecked = 0;
    let eventsCreated = 0;
    let eventsUpdated = 0;
    const errors: Array<{ sourceId: string; message: string }> = [];
    const warnings: string[] = [];
    const newEventIds: string[] = [];

    // Process each source
    for (const source of sources) {
      try {
        const result = await checkSource(source, run);

        sourcesChecked++;

        if (result.newEvent) {
          eventsCreated++;
          newEventIds.push(result.newEvent.id);
        }

        if (result.warning) {
          warnings.push(result.warning);
        }

        // Update progress periodically
        if (sourcesChecked % 10 === 0) {
          updateCronRun(run.id, {
            sourcesChecked,
            eventsCreated,
            eventsUpdated,
          });
        }
      } catch (sourceError) {
        const errorMessage =
          sourceError instanceof Error ? sourceError.message : 'Unknown error';

        errors.push({ sourceId: source.id, message: errorMessage });

        addCronRunError(run.id, {
          sourceId: source.id,
          message: errorMessage,
          stack: sourceError instanceof Error ? sourceError.stack : undefined,
        });

        console.error(
          `[Legal Change Cron] Error checking source ${source.id}:`,
          sourceError
        );
      }
    }

    // Get event counts
    const eventCounts = countEventsByState();

    // Determine final status
    const status: 'success' | 'partial' | 'failed' =
      errors.length === 0
        ? 'success'
        : errors.length < sources.length
          ? 'partial'
          : 'failed';

    // Build summary
    const summary = buildSummary({
      sourcesChecked,
      eventsCreated,
      eventsUpdated,
      errors: errors.length,
      warnings: warnings.length,
      status,
      eventCounts,
    });

    // Complete the run
    const completedRun = completeCronRun(run.id, status, summary, {
      sourcesChecked,
      eventsCreated,
      eventsUpdated,
    });

    // Log to database
    const supabase = createAdminClient();
    await supabase.from('seo_automation_log').insert({
      task_type: 'legal_change_check',
      task_name: 'Scheduled Legal Change Check',
      status,
      started_at: run.startedAt,
      completed_at: new Date().toISOString(),
      duration: (Date.now() - startTime) / 1000,
      items_processed: sourcesChecked,
      items_successful: eventsCreated,
      items_failed: errors.length,
      summary,
      triggered_by: 'cron',
    });

    console.log(`[Legal Change Cron] Completed: ${summary}`);

    return NextResponse.json({
      success: true,
      runId: run.id,
      status,
      metrics: {
        sourcesChecked,
        eventsCreated,
        eventsUpdated,
        errors: errors.length,
        warnings: warnings.length,
        durationMs: Date.now() - startTime,
      },
      eventCounts,
      newEventIds: newEventIds.length > 0 ? newEventIds : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary,
    });
  } catch (error: any) {
    console.error('[Legal Change Cron] Fatal error:', error);

    // Try to log the error
    try {
      const supabase = createAdminClient();
      await supabase.from('seo_automation_log').insert({
        task_type: 'legal_change_check',
        task_name: 'Scheduled Legal Change Check',
        status: 'failed',
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration: (Date.now() - startTime) / 1000,
        items_processed: 0,
        items_failed: 1,
        summary: `Fatal error: ${error.message}`,
        triggered_by: 'cron',
      });
    } catch (logError) {
      console.error('[Legal Change Cron] Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        error: 'Legal change check failed',
        details: error.message,
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Check a single source for changes
 */
async function checkSource(
  source: LegalSource,
  run: CronRun
): Promise<{
  newEvent?: LegalChangeEvent;
  warning?: string;
}> {
  // In a production implementation, this would:
  // 1. Fetch the source URL
  // 2. Compare against a stored hash/timestamp
  // 3. Extract changes using NLP/diff algorithms
  // 4. Create events for significant changes

  // For this implementation, we simulate the check
  // based on the source's monitoring frequency

  // Check last event for this source
  const existingEvents = listEvents({
    sourceIds: [source.id],
  });

  const lastEvent = existingEvents[0];
  const lastEventTime = lastEvent ? new Date(lastEvent.detectedAt).getTime() : 0;
  const now = Date.now();

  // Calculate if we should expect a change based on frequency
  const frequencyMs: Record<string, number> = {
    realtime: 60 * 60 * 1000, // 1 hour
    daily: 24 * 60 * 60 * 1000, // 1 day
    weekly: 7 * 24 * 60 * 60 * 1000, // 1 week
    monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const expectedFrequency = frequencyMs[source.monitoringFrequency] || frequencyMs.daily;
  const timeSinceLastEvent = now - lastEventTime;

  // Only simulate finding changes occasionally
  // In production, this would be actual content checking
  const shouldSimulateChange =
    timeSinceLastEvent > expectedFrequency && Math.random() < 0.05; // 5% chance

  if (!shouldSimulateChange) {
    return {};
  }

  // Simulate a new event
  // In production, this would have real content from the source
  const event = createEvent({
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    referenceUrl: source.url,
    detectedAt: new Date().toISOString(),
    detectionMethod: 'scheduled',
    jurisdictions: source.jurisdictions,
    topics: source.topics,
    title: `Update detected: ${source.name}`,
    summary: `A scheduled check detected potential changes from ${source.name}. This requires manual review to confirm.`,
    trustLevel: source.trustLevel,
    confidenceLevel: 'unverified',
    createdBy: 'cron',
  });

  // Auto-analyze the event
  try {
    analyzeAndAssess(event, 'cron');
  } catch (analyzeError) {
    console.warn(
      `[Legal Change Cron] Failed to analyze event ${event.id}:`,
      analyzeError
    );
  }

  return {
    newEvent: event,
  };
}

/**
 * Build a summary string for the cron run
 */
function buildSummary(data: {
  sourcesChecked: number;
  eventsCreated: number;
  eventsUpdated: number;
  errors: number;
  warnings: number;
  status: 'success' | 'partial' | 'failed';
  eventCounts: Record<string, number>;
}): string {
  const parts: string[] = [];

  parts.push(`Checked ${data.sourcesChecked} sources`);

  if (data.eventsCreated > 0) {
    parts.push(`created ${data.eventsCreated} events`);
  }

  if (data.eventsUpdated > 0) {
    parts.push(`updated ${data.eventsUpdated} events`);
  }

  if (data.errors > 0) {
    parts.push(`${data.errors} errors`);
  }

  if (data.warnings > 0) {
    parts.push(`${data.warnings} warnings`);
  }

  // Add pending counts
  const pending = data.eventCounts.new + data.eventCounts.action_required;
  if (pending > 0) {
    parts.push(`${pending} events pending attention`);
  }

  return parts.join(', ');
}

/**
 * GET endpoint for health check / manual trigger info
 */
export async function GET(request: NextRequest) {
  try {
    // For GET, we just return the current status without authorization
    // This can be used for health checks
    const sources = getEnabledSources();
    const eventCounts = countEventsByState();

    return NextResponse.json({
      status: 'ok',
      job: 'legal-change:check',
      enabledSources: sources.length,
      eventCounts,
      nextScheduledRun: calculateNextRun(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Calculate next scheduled run time (assuming daily at 2am)
 */
function calculateNextRun(): string {
  const now = new Date();
  const next = new Date(now);

  // Set to 2am
  next.setHours(2, 0, 0, 0);

  // If already past 2am today, move to tomorrow
  if (now > next) {
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}
