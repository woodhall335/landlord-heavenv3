/**
 * Legal Change Check Cron Job
 *
 * Triggered daily (recommended: 2am)
 * Checks all enabled legal sources for changes and creates events
 *
 * Usage: Call from Vercel Cron or external cron service
 * Authorization: Requires CRON_SECRET token (Bearer or Vercel header)
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 *
 * Environment Variables:
 * - CRON_SECRET: Required for authorization
 * - LEGAL_CHANGE_SIMULATION_ENABLED: Set to "true" to enable test event simulation
 *   (defaults to false - no simulated events in production)
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
 * Check if simulation mode is enabled.
 * Defaults to false for production safety.
 */
function isSimulationEnabled(): boolean {
  return process.env.LEGAL_CHANGE_SIMULATION_ENABLED === 'true';
}

/**
 * Verify cron authorization.
 * Supports both Bearer token and Vercel cron header.
 */
function verifyCronAuth(request: NextRequest): { authorized: boolean; source: string } {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return { authorized: false, source: 'no_secret_configured' };
  }

  // Check Bearer token (standard auth)
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true, source: 'bearer' };
  }

  // Check Vercel cron header (for Vercel Cron jobs)
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader === cronSecret) {
    return { authorized: true, source: 'vercel_cron' };
  }

  return { authorized: false, source: 'invalid_credentials' };
}

/**
 * POST endpoint for cron execution
 */
export async function POST(request: NextRequest) {
  return executeCronJob(request, 'post');
}

/**
 * GET endpoint for Vercel Cron compatibility
 * Vercel Cron uses GET requests by default
 */
export async function GET(request: NextRequest) {
  // Check if this is a health check (no auth header)
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');

  // If no auth headers present, return status info only
  if (!authHeader && !vercelCronHeader) {
    try {
      const sources = getEnabledSources();
      const eventCounts = countEventsByState();

      return NextResponse.json({
        status: 'ok',
        job: 'legal-change:check',
        enabledSources: sources.length,
        eventCounts,
        simulationEnabled: isSimulationEnabled(),
        nextScheduledRun: calculateNextRun(),
      });
    } catch (error: any) {
      return NextResponse.json(
        { status: 'error', error: error.message },
        { status: 500 }
      );
    }
  }

  // Otherwise, execute the cron job
  return executeCronJob(request, 'get');
}

/**
 * Execute the cron job (shared logic for GET and POST)
 */
async function executeCronJob(
  request: NextRequest,
  method: 'get' | 'post'
): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Verify authorization
    const auth = verifyCronAuth(request);
    if (!auth.authorized) {
      console.warn(`[Legal Change Cron] Unauthorized attempt via ${method.toUpperCase()}: ${auth.source}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[Legal Change Cron] Starting scheduled check (via ${method.toUpperCase()}, auth: ${auth.source})...`);

    // Start the cron run (now async)
    const run = await startCronRun('legal-change:check', 'cron');

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

        // Update progress periodically (now async)
        if (sourcesChecked % 10 === 0) {
          await updateCronRun(run.id, {
            sourcesChecked,
            eventsCreated,
            eventsUpdated,
          });
        }
      } catch (sourceError) {
        const errorMessage =
          sourceError instanceof Error ? sourceError.message : 'Unknown error';

        errors.push({ sourceId: source.id, message: errorMessage });

        await addCronRunError(run.id, {
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

    // Complete the run (now async)
    const completedRun = await completeCronRun(run.id, status, summary, {
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
 *
 * PRODUCTION: Only creates events when real changes are detected.
 * SIMULATION MODE (LEGAL_CHANGE_SIMULATION_ENABLED=true): Creates test events
 * for development/testing purposes only.
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

  // Check last event for this source
  const existingEvents = listEvents({
    sourceIds: [source.id],
  });

  const lastEvent = existingEvents[0];
  const lastEventTime = lastEvent ? new Date(lastEvent.detectedAt).getTime() : 0;
  const now = Date.now();

  // Calculate time since last event based on frequency
  const frequencyMs: Record<string, number> = {
    realtime: 60 * 60 * 1000, // 1 hour
    daily: 24 * 60 * 60 * 1000, // 1 day
    weekly: 7 * 24 * 60 * 60 * 1000, // 1 week
    monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const expectedFrequency = frequencyMs[source.monitoringFrequency] || frequencyMs.daily;
  const timeSinceLastEvent = now - lastEventTime;

  // PRODUCTION: Real content checking would happen here
  // TODO: Implement actual source content fetching and comparison
  // For now, we only create events in simulation mode

  // Simulation mode: Create test events for development/testing
  // This is explicitly opt-in and disabled by default
  if (!isSimulationEnabled()) {
    // Production mode: No simulated events
    // Real implementation would check actual source content here
    return {};
  }

  // SIMULATION MODE ONLY
  // Only create simulated events if enough time has passed since last event
  // This provides deterministic behavior for testing
  const shouldCreateSimulatedEvent = timeSinceLastEvent > expectedFrequency;

  if (!shouldCreateSimulatedEvent) {
    return {};
  }

  console.log(`[Legal Change Cron] SIMULATION: Creating test event for source ${source.id}`);

  // Create a simulated event for testing
  const event = createEvent({
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    referenceUrl: source.url,
    detectedAt: new Date().toISOString(),
    detectionMethod: 'scheduled',
    jurisdictions: source.jurisdictions,
    topics: source.topics,
    title: `[SIMULATED] Update detected: ${source.name}`,
    summary: `[SIMULATION MODE] A test event was created for ${source.name}. This is not a real legal change - simulation is enabled for testing.`,
    trustLevel: source.trustLevel,
    confidenceLevel: 'unverified',
    createdBy: 'cron:simulation',
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
    warning: 'Event created in simulation mode - not from real source content',
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
