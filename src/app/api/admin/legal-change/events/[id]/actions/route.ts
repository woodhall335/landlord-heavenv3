/**
 * Admin API - Legal Change Event Actions
 *
 * POST /api/admin/legal-change/events/:id/actions
 * Executes workflow actions on a legal change event
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 * Updated to use database persistence instead of in-memory storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth, createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  dbGetEvent,
  dbTransitionEvent,
  dbUpdateEvent,
  dbSetImpactAssessment,
  dbLinkPrToEvent,
  dbLinkRolloutToEvent,
  dbAssignEvent,
} from '@/lib/validation/legal-change-db';
import { WorkflowAction, runGovernanceChecks } from '@/lib/validation/legal-change-workflow';
import { EventState, validateTransition, LegalChangeEvent } from '@/lib/validation/legal-change-events';
import { analyzeAndAssess, analyzeImpact } from '@/lib/validation/legal-impact-analyzer';

interface ActionRequestBody {
  action: WorkflowAction | 'analyze' | 'preview_governance';
  reason?: string;
  prUrl?: string;
  rolloutId?: string;
  incidentId?: string;
  assignee?: string;
  targetState?: EventState;
}

// Map actions to target states
const ACTION_TO_STATE: Partial<Record<WorkflowAction, EventState>> = {
  triage: 'triaged',
  mark_action_required: 'action_required',
  mark_no_action: 'no_action',
  mark_implemented: 'implemented',
  mark_rolled_out: 'rolled_out',
  close: 'closed',
  reopen: 'triaged',
};

async function executeWorkflowAction(
  event: LegalChangeEvent,
  action: WorkflowAction,
  actor: string,
  options: { reason?: string; prUrl?: string; rolloutId?: string; incidentId?: string; assignee?: string }
): Promise<{ success: boolean; event?: LegalChangeEvent; error?: string; warnings?: string[] }> {
  const { reason, prUrl, rolloutId, incidentId, assignee } = options;

  // Handle non-state-changing actions
  switch (action) {
    case 'assign':
      if (!assignee) {
        return { success: false, error: 'Assignee is required for assign action' };
      }
      await dbAssignEvent(event.id, assignee, actor);
      const assignedEvent = await dbGetEvent(event.id);
      return { success: true, event: assignedEvent };

    case 'link_pr':
      if (!prUrl) {
        return { success: false, error: 'PR URL is required for link_pr action' };
      }
      await dbLinkPrToEvent(event.id, prUrl);
      const prLinkedEvent = await dbGetEvent(event.id);
      return { success: true, event: prLinkedEvent };

    case 'link_rollout':
      if (!rolloutId) {
        return { success: false, error: 'Rollout ID is required for link_rollout action' };
      }
      await dbLinkRolloutToEvent(event.id, rolloutId);
      const rolloutLinkedEvent = await dbGetEvent(event.id);
      return { success: true, event: rolloutLinkedEvent };

    case 'link_incident':
      if (!incidentId) {
        return { success: false, error: 'Incident ID is required for link_incident action' };
      }
      // Update linked incident IDs
      const linkedIncidentIds = event.linkedIncidentIds ?? [];
      if (!linkedIncidentIds.includes(incidentId)) {
        linkedIncidentIds.push(incidentId);
        await dbUpdateEvent(event.id, { linkedIncidentIds });
      }
      const incidentLinkedEvent = await dbGetEvent(event.id);
      return { success: true, event: incidentLinkedEvent };
  }

  // Handle state-changing actions
  const targetState = ACTION_TO_STATE[action];
  if (!targetState) {
    return { success: false, error: `Unknown action: ${action}` };
  }

  // Validate state transition
  const validation = validateTransition(event.state, targetState);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Run governance checks
  const governance = runGovernanceChecks(event, targetState, actor);

  // For triage action, auto-assess if not already done
  if (action === 'triage' && !event.impactAssessment) {
    const assessment = analyzeAndAssess(event, actor);
    await dbSetImpactAssessment(event.id, assessment);
  }

  // Check governance for certain actions
  if (['mark_action_required', 'mark_no_action'].includes(action)) {
    if (!governance.passed) {
      const failures = governance.checks.filter((c) => !c.passed);
      return {
        success: false,
        error: `Governance checks failed: ${failures.map((f) => f.message).join('; ')}`,
      };
    }
  }

  // Execute state transition
  const result = await dbTransitionEvent(event.id, targetState, actor, reason);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, event: result.event, warnings: governance.warnings };
}

export async function POST(
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
    const body: ActionRequestBody = await request.json();

    // Validate request
    if (!body.action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Get the event from database
    const event = await dbGetEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: `Event not found: ${eventId}` },
        { status: 404 }
      );
    }

    // Handle special actions
    if (body.action === 'analyze') {
      // Trigger impact analysis
      const assessment = analyzeAndAssess(event, user.id);
      await dbSetImpactAssessment(eventId, assessment);
      const updatedEvent = await dbGetEvent(eventId);
      return NextResponse.json({
        success: true,
        data: {
          event: updatedEvent,
          analysis: analyzeImpact(event),
        },
        meta: { timestamp: new Date().toISOString() },
      });
    }

    // Handle governance preview
    if (body.action === 'preview_governance' && body.targetState) {
      const governance = runGovernanceChecks(event, body.targetState, user.id);
      return NextResponse.json({
        success: true,
        data: governance,
        meta: { timestamp: new Date().toISOString() },
      });
    }

    // Execute the workflow action
    const result = await executeWorkflowAction(event, body.action as WorkflowAction, user.id, {
      reason: body.reason,
      prUrl: body.prUrl,
      rolloutId: body.rolloutId,
      incidentId: body.incidentId,
      assignee: body.assignee,
    });

    // Log to Supabase
    try {
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
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { event: result.event },
      warnings: result.warnings,
      meta: { timestamp: new Date().toISOString() },
    });
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
    const targetState = searchParams.get('targetState') as EventState | null;

    if (!targetState) {
      return NextResponse.json(
        { error: 'targetState query parameter is required' },
        { status: 400 }
      );
    }

    // Get event from database
    const event = await dbGetEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event not found: ${eventId}` },
        { status: 404 }
      );
    }

    const governance = runGovernanceChecks(event, targetState, user.id);

    return NextResponse.json({
      success: true,
      data: governance,
      meta: { timestamp: new Date().toISOString() },
    });
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
