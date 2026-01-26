/**
 * Legal Change Workflow & Governance
 *
 * Phase 22: Legal Change Ingestion Pipeline
 *
 * Implements workflow management and governance controls for legal change events.
 * Aligns with Phase 19 governance framework.
 */

import {
  LegalChangeEvent,
  EventState,
  ChangeSeverity,
  transitionEvent,
  updateEvent,
  getEvent,
  listEvents,
} from './legal-change-events';
import { ImpactAssessment, analyzeAndAssess } from './legal-impact-analyzer';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Workflow action that can be performed on an event.
 */
export type WorkflowAction =
  | 'triage'
  | 'mark_action_required'
  | 'mark_no_action'
  | 'mark_implemented'
  | 'mark_rolled_out'
  | 'close'
  | 'reopen'
  | 'assign'
  | 'link_pr'
  | 'link_rollout'
  | 'link_incident';

/**
 * Required reviewer role based on change type.
 */
export type ReviewerRole =
  | 'engineering'
  | 'product'
  | 'legal_england'
  | 'legal_wales'
  | 'legal_scotland'
  | 'validation_team'
  | 'on_call';

/**
 * Workflow action request.
 */
export interface WorkflowActionRequest {
  eventId: string;
  action: WorkflowAction;
  actor: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Workflow action result.
 */
export interface WorkflowActionResult {
  success: boolean;
  event?: LegalChangeEvent;
  error?: string;
  warnings?: string[];
}

/**
 * Governance check result.
 */
export interface GovernanceCheckResult {
  passed: boolean;
  checks: GovernanceCheck[];
  requiredReviewers: ReviewerRole[];
  warnings: string[];
}

/**
 * Individual governance check.
 */
export interface GovernanceCheck {
  name: string;
  passed: boolean;
  message: string;
}

/**
 * Audit log entry.
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventId: string;
  action: WorkflowAction | 'create' | 'update' | 'assess';
  actor: string;
  details: Record<string, unknown>;
  previousState?: EventState;
  newState?: EventState;
}

// ============================================================================
// REVIEWER REQUIREMENTS
// ============================================================================

/**
 * Get required reviewers based on severity and jurisdictions.
 */
export function getRequiredReviewers(
  severity: ChangeSeverity,
  jurisdictions: string[]
): ReviewerRole[] {
  const reviewers: ReviewerRole[] = [];

  // Always need validation team
  reviewers.push('validation_team');

  // Severity-based requirements
  switch (severity) {
    case 'emergency':
      reviewers.push('on_call');
      reviewers.push('engineering');
      reviewers.push('product');
      break;
    case 'legal_critical':
      reviewers.push('engineering');
      reviewers.push('product');
      break;
    case 'behavioral':
      reviewers.push('product');
      break;
    case 'clarification':
      // Just validation team
      break;
  }

  // Jurisdiction-specific reviewers
  for (const jurisdiction of jurisdictions) {
    switch (jurisdiction) {
      case 'england':
        if (severity === 'legal_critical' || severity === 'emergency') {
          reviewers.push('legal_england');
        }
        break;
      case 'wales':
        if (severity === 'legal_critical' || severity === 'emergency') {
          reviewers.push('legal_wales');
        }
        break;
      case 'scotland':
        if (severity === 'legal_critical' || severity === 'emergency') {
          reviewers.push('legal_scotland');
        }
        break;
    }
  }

  return [...new Set(reviewers)];
}

/**
 * Map reviewer roles to team handles.
 */
export function getReviewerHandles(roles: ReviewerRole[]): string[] {
  const handles: Record<ReviewerRole, string> = {
    engineering: '@platform-eng',
    product: '@product-team',
    legal_england: '@legal-england',
    legal_wales: '@legal-wales',
    legal_scotland: '@legal-scotland',
    validation_team: '@validation-team',
    on_call: '@on-call',
  };

  return roles.map((role) => handles[role]);
}

// ============================================================================
// GOVERNANCE CHECKS
// ============================================================================

/**
 * Run governance checks for a state transition.
 */
export function runGovernanceChecks(
  event: LegalChangeEvent,
  targetState: EventState,
  actor: string
): GovernanceCheckResult {
  const checks: GovernanceCheck[] = [];
  const warnings: string[] = [];
  const requiredReviewers: ReviewerRole[] = [];

  // Check 1: Impact assessment required for action states
  if (['action_required', 'no_action'].includes(targetState)) {
    const hasAssessment = event.impactAssessment !== undefined;
    checks.push({
      name: 'impact_assessment',
      passed: hasAssessment,
      message: hasAssessment
        ? 'Impact assessment completed'
        : 'Impact assessment required before triage decision',
    });
  }

  // Check 2: PR required for implemented state
  if (targetState === 'implemented') {
    const hasPr = (event.linkedPrUrls?.length ?? 0) > 0;
    checks.push({
      name: 'pr_linked',
      passed: hasPr,
      message: hasPr ? 'PR linked to event' : 'No PR linked - implementation should have associated PR',
    });
    if (!hasPr) {
      warnings.push('Consider linking the implementation PR before marking as implemented');
    }
  }

  // Check 3: Rollout reference for rolled_out state
  if (targetState === 'rolled_out') {
    const hasRollout = (event.linkedRolloutIds?.length ?? 0) > 0;
    checks.push({
      name: 'rollout_linked',
      passed: hasRollout,
      message: hasRollout ? 'Rollout linked to event' : 'No rollout linked',
    });
    if (!hasRollout) {
      warnings.push('Consider linking the rollout ID before marking as rolled out');
    }
  }

  // Check 4: Severity-based reviewer requirements
  if (event.impactAssessment) {
    const severity = event.impactAssessment.severity;
    const required = getRequiredReviewers(severity, event.jurisdictions);
    requiredReviewers.push(...required);

    // Check for high-severity actions
    if (severity === 'emergency' && targetState === 'no_action') {
      checks.push({
        name: 'emergency_no_action',
        passed: false,
        message: 'Emergency severity events should not be marked as no_action without escalation',
      });
    }

    if (severity === 'legal_critical' && targetState === 'no_action') {
      warnings.push('Legal-critical event marked as no_action - ensure this is intentional');
    }
  }

  // Check 5: Actor authorization (simplified - would integrate with real auth)
  const isAuthorizedActor = actor && actor.length > 0;
  checks.push({
    name: 'actor_authorized',
    passed: isAuthorizedActor,
    message: isAuthorizedActor ? `Action by ${actor}` : 'Actor identification required',
  });

  // Check 6: Closure requirements
  if (targetState === 'closed') {
    const hasResolution =
      event.state === 'rolled_out' || event.state === 'no_action';
    checks.push({
      name: 'closure_valid',
      passed: hasResolution,
      message: hasResolution
        ? 'Event can be closed from current state'
        : 'Event should reach rolled_out or no_action before closing',
    });
  }

  const passed = checks.every((c) => c.passed);

  return {
    passed,
    checks,
    requiredReviewers: [...new Set(requiredReviewers)],
    warnings,
  };
}

// ============================================================================
// WORKFLOW ACTIONS
// ============================================================================

/**
 * Execute a workflow action on an event.
 */
export function executeWorkflowAction(request: WorkflowActionRequest): WorkflowActionResult {
  const { eventId, action, actor, reason, metadata } = request;

  const event = getEvent(eventId);
  if (!event) {
    return { success: false, error: `Event not found: ${eventId}` };
  }

  // Log the action
  logAuditEntry({
    eventId,
    action,
    actor,
    details: { reason, metadata },
    previousState: event.state,
  });

  switch (action) {
    case 'triage': {
      // Auto-assess if not already done
      if (!event.impactAssessment) {
        analyzeAndAssess(event, actor);
      }

      const result = transitionEvent(eventId, 'triaged', actor, reason, metadata);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      return { success: true, event: result.event };
    }

    case 'mark_action_required': {
      const governance = runGovernanceChecks(event, 'action_required', actor);
      if (!governance.passed) {
        const failures = governance.checks.filter((c) => !c.passed);
        return {
          success: false,
          error: `Governance checks failed: ${failures.map((f) => f.message).join('; ')}`,
        };
      }

      const result = transitionEvent(eventId, 'action_required', actor, reason, metadata);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      return { success: true, event: result.event, warnings: governance.warnings };
    }

    case 'mark_no_action': {
      const governance = runGovernanceChecks(event, 'no_action', actor);
      const warnings = governance.warnings;

      // Allow with warnings for non-critical failures
      const criticalFailures = governance.checks.filter(
        (c) => !c.passed && c.name !== 'emergency_no_action'
      );

      if (criticalFailures.length > 0) {
        return {
          success: false,
          error: `Governance checks failed: ${criticalFailures.map((f) => f.message).join('; ')}`,
        };
      }

      const result = transitionEvent(eventId, 'no_action', actor, reason, metadata);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      return { success: true, event: result.event, warnings };
    }

    case 'mark_implemented': {
      const governance = runGovernanceChecks(event, 'implemented', actor);

      const result = transitionEvent(eventId, 'implemented', actor, reason, metadata);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      return { success: true, event: result.event, warnings: governance.warnings };
    }

    case 'mark_rolled_out': {
      const governance = runGovernanceChecks(event, 'rolled_out', actor);

      const result = transitionEvent(eventId, 'rolled_out', actor, reason, metadata);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      return { success: true, event: result.event, warnings: governance.warnings };
    }

    case 'close': {
      const governance = runGovernanceChecks(event, 'closed', actor);

      if (!governance.passed) {
        const failures = governance.checks.filter((c) => !c.passed);
        return {
          success: false,
          error: `Cannot close: ${failures.map((f) => f.message).join('; ')}`,
        };
      }

      const result = transitionEvent(eventId, 'closed', actor, reason, metadata);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      return { success: true, event: result.event };
    }

    case 'reopen': {
      const result = transitionEvent(eventId, 'triaged', actor, reason ?? 'Reopened for review', metadata);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      return { success: true, event: result.event };
    }

    case 'assign': {
      const assignee = metadata?.assignee as string;
      if (!assignee) {
        return { success: false, error: 'Assignee required for assign action' };
      }

      const updated = updateEvent(eventId, { assignedTo: assignee });
      if (!updated) {
        return { success: false, error: 'Failed to update event' };
      }
      return { success: true, event: updated };
    }

    case 'link_pr': {
      const prUrl = metadata?.prUrl as string;
      if (!prUrl) {
        return { success: false, error: 'PR URL required for link_pr action' };
      }

      const linkedPrUrls = [...(event.linkedPrUrls ?? []), prUrl];
      const updated = updateEvent(eventId, { linkedPrUrls });
      if (!updated) {
        return { success: false, error: 'Failed to update event' };
      }
      return { success: true, event: updated };
    }

    case 'link_rollout': {
      const rolloutId = metadata?.rolloutId as string;
      if (!rolloutId) {
        return { success: false, error: 'Rollout ID required for link_rollout action' };
      }

      const linkedRolloutIds = [...(event.linkedRolloutIds ?? []), rolloutId];
      const updated = updateEvent(eventId, { linkedRolloutIds });
      if (!updated) {
        return { success: false, error: 'Failed to update event' };
      }
      return { success: true, event: updated };
    }

    case 'link_incident': {
      const incidentId = metadata?.incidentId as string;
      if (!incidentId) {
        return { success: false, error: 'Incident ID required for link_incident action' };
      }

      const linkedIncidentIds = [...(event.linkedIncidentIds ?? []), incidentId];
      const updated = updateEvent(eventId, { linkedIncidentIds });
      if (!updated) {
        return { success: false, error: 'Failed to update event' };
      }
      return { success: true, event: updated };
    }

    default:
      return { success: false, error: `Unknown action: ${action}` };
  }
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

const auditLog: AuditLogEntry[] = [];
let auditIdCounter = 1;
const MAX_AUDIT_LOG_SIZE = 10000;

/**
 * Log an audit entry.
 */
export function logAuditEntry(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): AuditLogEntry {
  const logEntry: AuditLogEntry = {
    ...entry,
    id: `audit_${(auditIdCounter++).toString(36).padStart(6, '0')}`,
    timestamp: new Date().toISOString(),
  };

  // Maintain max size
  if (auditLog.length >= MAX_AUDIT_LOG_SIZE) {
    auditLog.shift();
  }

  auditLog.push(logEntry);
  return logEntry;
}

/**
 * Get audit log entries for an event.
 */
export function getAuditLogForEvent(eventId: string): AuditLogEntry[] {
  return auditLog.filter((e) => e.eventId === eventId);
}

/**
 * Get recent audit log entries.
 */
export function getRecentAuditLog(limit = 100): AuditLogEntry[] {
  return auditLog.slice(-limit).reverse();
}

/**
 * Export full audit log.
 */
export function exportAuditLog(): {
  entries: AuditLogEntry[];
  exportedAt: string;
  totalCount: number;
} {
  return {
    entries: [...auditLog],
    exportedAt: new Date().toISOString(),
    totalCount: auditLog.length,
  };
}

/**
 * Clear audit log (for testing).
 */
export function clearAuditLog(): void {
  auditLog.length = 0;
  auditIdCounter = 1;
}

// ============================================================================
// WORKFLOW QUERIES
// ============================================================================

/**
 * Get events by workflow state.
 */
export function getEventsByWorkflowState(state: EventState): LegalChangeEvent[] {
  return listEvents({ states: [state] });
}

/**
 * Get events requiring triage (new events).
 */
export function getEventsRequiringTriage(): LegalChangeEvent[] {
  return listEvents({ states: ['new'] });
}

/**
 * Get events with pending actions.
 */
export function getEventsWithPendingActions(): LegalChangeEvent[] {
  return listEvents({ states: ['action_required'] });
}

/**
 * Get events assigned to a user.
 */
export function getEventsAssignedTo(assignee: string): LegalChangeEvent[] {
  return listEvents({ assignedTo: assignee });
}

/**
 * Get workflow statistics.
 */
export function getWorkflowStats(): {
  byState: Record<EventState, number>;
  requiresTriage: number;
  requiresAction: number;
  avgTimeToTriage: number | null;
  avgTimeToClose: number | null;
} {
  const events = listEvents();

  const byState: Record<EventState, number> = {
    new: 0,
    triaged: 0,
    action_required: 0,
    no_action: 0,
    implemented: 0,
    rolled_out: 0,
    closed: 0,
  };

  const triageTimes: number[] = [];
  const closeTimes: number[] = [];

  for (const event of events) {
    byState[event.state]++;

    // Calculate time to triage
    const triageTransition = event.stateHistory.find((t) => t.to === 'triaged');
    if (triageTransition) {
      const created = new Date(event.createdAt).getTime();
      const triaged = new Date(triageTransition.timestamp).getTime();
      triageTimes.push((triaged - created) / (1000 * 60 * 60)); // hours
    }

    // Calculate time to close
    if (event.closedAt) {
      const created = new Date(event.createdAt).getTime();
      const closed = new Date(event.closedAt).getTime();
      closeTimes.push((closed - created) / (1000 * 60 * 60 * 24)); // days
    }
  }

  const avgTimeToTriage =
    triageTimes.length > 0
      ? Math.round((triageTimes.reduce((a, b) => a + b, 0) / triageTimes.length) * 10) / 10
      : null;

  const avgTimeToClose =
    closeTimes.length > 0
      ? Math.round((closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length) * 10) / 10
      : null;

  return {
    byState,
    requiresTriage: byState.new,
    requiresAction: byState.action_required,
    avgTimeToTriage,
    avgTimeToClose,
  };
}
