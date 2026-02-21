/**
 * Admin API - Legal Change Event Details
 *
 * GET /api/admin/legal-change/events/:id
 * Gets detailed information about a specific legal change event
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 * Updated to use database persistence instead of in-memory storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { dbGetEvent } from '@/lib/validation/legal-change-db';
import { getSourceById } from '@/lib/validation/legal-source-registry';
import { getEventPRInfo, checkPushPREligibility } from '@/lib/validation/admin-push-pr';
import { getAuditLogForEvent, WorkflowAction } from '@/lib/validation/legal-change-workflow';
import { EventState } from '@/lib/validation/legal-change-events';

/**
 * Get allowed actions for a state.
 */
function getAllowedActionsForState(state: EventState): WorkflowAction[] {
  const actions: WorkflowAction[] = ['assign', 'link_pr', 'link_rollout', 'link_incident'];

  switch (state) {
    case 'new':
      actions.push('triage');
      break;
    case 'triaged':
      actions.push('mark_action_required', 'mark_no_action');
      break;
    case 'action_required':
      actions.push('mark_implemented');
      break;
    case 'no_action':
      actions.push('close', 'reopen');
      break;
    case 'implemented':
      actions.push('mark_rolled_out');
      break;
    case 'rolled_out':
      actions.push('close');
      break;
    case 'closed':
      actions.push('reopen');
      break;
  }

  return actions;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access (with proper trimming of env var)
    const user = await requireServerAuth();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const include = searchParams.get('include')?.split(',') || [];

    // Get event details from database
    const event = await dbGetEvent(eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event not found: ${eventId}` },
        { status: 404 }
      );
    }

    const source = getSourceById(event.sourceId) ?? null;
    const auditLog = getAuditLogForEvent(eventId);
    const allowedActions = getAllowedActionsForState(event.state);

    // Build response
    const response: Record<string, unknown> = {
      success: true,
      data: {
        event,
        source,
        auditLog,
        allowedActions,
      },
      meta: { timestamp: new Date().toISOString() },
    };

    // Include PR info if requested
    if (include.includes('prInfo')) {
      const prInfo = await getEventPRInfo(eventId, user.id);
      response.prInfo = prInfo;
    }

    // Include Push PR eligibility if requested
    if (include.includes('pushPREligibility')) {
      const eligibility = checkPushPREligibility(event, user.id);
      response.pushPREligibility = eligibility;
    }

    // Include full audit log if requested
    if (include.includes('fullAuditLog')) {
      response.fullAuditLog = auditLog;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('[Admin Legal Change Event Details] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
