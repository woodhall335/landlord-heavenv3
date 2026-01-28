/**
 * Admin API - Legal Change Event Actions
 *
 * POST /api/admin/legal-change/events/:id/actions
 * Executes workflow actions on a legal change event
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import {
  apiExecuteWorkflowAction,
  apiPreviewGovernanceChecks,
  apiAnalyzeImpact,
} from '@/lib/validation/legal-change-api';
import { WorkflowAction, logAuditEntry } from '@/lib/validation/legal-change-workflow';
import { EventState, getEvent } from '@/lib/validation/legal-change-events';

interface ActionRequestBody {
  action: WorkflowAction;
  reason?: string;
  prUrl?: string;
  rolloutId?: string;
  incidentId?: string;
  assignee?: string;
  targetState?: EventState;
}

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
    const body: ActionRequestBody = await request.json();

    // Validate request
    if (!body.action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Get the event to verify it exists
    const event = getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: `Event not found: ${eventId}` },
        { status: 404 }
      );
    }

    // Handle special actions
    if (body.action === 'analyze' as unknown as WorkflowAction) {
      // Trigger impact analysis
      const result = apiAnalyzeImpact(eventId, user.id);
      return NextResponse.json(result);
    }

    // Handle governance preview
    if (body.action === 'preview_governance' as unknown as WorkflowAction && body.targetState) {
      const result = apiPreviewGovernanceChecks(eventId, body.targetState, user.id);
      return NextResponse.json(result);
    }

    // Execute the workflow action
    const result = apiExecuteWorkflowAction({
      eventId,
      action: body.action,
      actor: user.id,
      reason: body.reason,
      prUrl: body.prUrl,
      rolloutId: body.rolloutId,
      incidentId: body.incidentId,
      assignee: body.assignee,
    });

    // Log to Supabase if configured
    try {
      const { createAdminClient } = await import('@/lib/supabase/server');
      const supabase = createAdminClient();

      await supabase.from('seo_automation_log').insert({
        task_type: 'legal_change_action',
        task_name: `${body.action} on ${eventId}`,
        status: result.success ? 'success' : 'failed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        summary: result.success
          ? `Action '${body.action}' executed successfully on event ${eventId}`
          : `Action '${body.action}' failed: ${result.error}`,
        triggered_by: user.id,
      });
    } catch (logError) {
      console.warn('[Admin Legal Change Action] Failed to log to database:', logError);
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('[Admin Legal Change Event Actions] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Preview governance checks for a state transition
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
    const searchParams = request.nextUrl.searchParams;
    const targetState = searchParams.get('targetState') as EventState | null;

    if (!targetState) {
      return NextResponse.json(
        { error: 'targetState query parameter is required' },
        { status: 400 }
      );
    }

    const result = apiPreviewGovernanceChecks(eventId, targetState, user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('[Admin Legal Change Event Actions] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
