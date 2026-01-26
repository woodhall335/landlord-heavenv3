/**
 * Admin API - Push PR for Legal Change Event
 *
 * POST /api/admin/legal-change/events/:id/push-pr
 * Creates a GitHub PR for a legal change event
 *
 * GET /api/admin/legal-change/events/:id/push-pr
 * Gets PR status and eligibility info
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import {
  executePushPR,
  checkPushPREligibility,
  getEventPRInfo,
  canPushPR,
  PushPROptions,
} from '@/lib/validation/admin-push-pr';
import { getEvent } from '@/lib/validation/legal-change-events';

interface PushPRRequestBody {
  options?: Partial<PushPROptions>;
  dryRun?: boolean;
}

/**
 * POST - Execute Push PR workflow
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const user = await requireServerAuth();
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];

    if (!adminIds.includes(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;

    let body: PushPRRequestBody = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is OK
    }

    // Get the event
    const event = getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: `Event not found: ${eventId}` },
        { status: 404 }
      );
    }

    // Check eligibility first
    const eligibility = checkPushPREligibility(event, user.id);
    if (!eligibility.eligible && !body.options?.skipGovernanceCheck) {
      return NextResponse.json({
        success: false,
        error: 'Event is not eligible for Push PR',
        eligibility,
      }, { status: 400 });
    }

    // Execute Push PR workflow
    const result = await executePushPR({
      eventId,
      actor: user.id,
      options: {
        ...body.options,
        dryRun: body.dryRun ?? body.options?.dryRun ?? false,
      },
    });

    // Log to Supabase if configured
    try {
      const { createAdminClient } = await import('@/lib/supabase/server');
      const supabase = createAdminClient();

      await supabase.from('seo_automation_log').insert({
        task_type: 'legal_change_push_pr',
        task_name: `Push PR for ${eventId}`,
        status: result.success ? 'success' : 'failed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        items_processed: 1,
        items_successful: result.success ? 1 : 0,
        items_failed: result.success ? 0 : 1,
        summary: result.success
          ? `PR created: ${result.prUrl}`
          : `Push PR failed: ${result.error}`,
        triggered_by: user.id,
      });
    } catch (logError) {
      console.warn('[Admin Push PR] Failed to log to database:', logError);
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        prUrl: result.prUrl,
        prNumber: result.prNumber,
        branchName: result.branchName,
        changeset: result.changeset ? {
          summary: result.changeset.summary,
          validation: result.changeset.validation,
          filesCount: result.changeset.files.length,
        } : undefined,
        workflowDispatchResult: result.workflowDispatchResult,
      },
      warnings: result.warnings,
      meta: {
        timestamp: new Date().toISOString(),
        dryRun: body.dryRun ?? false,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('[Admin Push PR] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Get PR status and eligibility
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const user = await requireServerAuth();
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];

    if (!adminIds.includes(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;

    // Get the event
    const event = getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: `Event not found: ${eventId}` },
        { status: 404 }
      );
    }

    // Get eligibility
    const eligibility = checkPushPREligibility(event, user.id);

    // Get PR info
    const prInfo = await getEventPRInfo(eventId, user.id);

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        canPushPR: eligibility.eligible,
        eligibility,
        prInfo,
        currentState: event.state,
        hasImpactAssessment: !!event.impactAssessment,
        linkedPRs: event.linkedPrUrls || [],
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('[Admin Push PR Status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
