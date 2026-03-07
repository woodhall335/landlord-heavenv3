/**
 * Legal Change API / Admin Portal Hooks
 *
 * Phase 22: Legal Change Ingestion Pipeline
 *
 * Provides the backend contract for admin portal integration.
 * These services can be consumed by an admin UI or exposed via API routes.
 */

import {
  LegalChangeEvent,
  EventState,
  EventFilter,
  EventSummary,
  ImpactAssessment,
  getEvent,
  listEvents,
  getEventSummaries,
  countEventsByState,
  createEvent,
  updateEvent,
  exportEvents,
  importEvents,
} from './legal-change-events';
import {
  LegalSource,
  Jurisdiction,
  LegalTopic,
  getEnabledSources,
  getSourceById,
  getSourcesByJurisdiction,
  getRegistryStats,
  exportRegistry,
} from './legal-source-registry';
import {
  ImpactAnalysisResult,
  analyzeImpact,
  analyzeAndAssess,
} from './legal-impact-analyzer';
import {
  WorkflowAction,
  WorkflowActionResult,
  GovernanceCheckResult,
  AuditLogEntry,
  executeWorkflowAction,
  runGovernanceChecks,
  getAuditLogForEvent,
  getRecentAuditLog,
  getWorkflowStats,
  exportAuditLog,
  getRequiredReviewers,
  getReviewerHandles,
} from './legal-change-workflow';

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    totalCount?: number;
    page?: number;
    pageSize?: number;
    timestamp: string;
  };
}

/**
 * Pagination options.
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

/**
 * Event list request.
 */
export interface ListEventsRequest extends PaginationOptions {
  filter?: EventFilter;
  sortBy?: 'createdAt' | 'updatedAt' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Event details response.
 */
export interface EventDetailsResponse {
  event: LegalChangeEvent;
  source: LegalSource | null;
  impactAnalysis: ImpactAnalysisResult | null;
  auditLog: AuditLogEntry[];
  allowedActions: WorkflowAction[];
}

/**
 * Dashboard data response.
 */
export interface DashboardResponse {
  summary: {
    totalEvents: number;
    byState: Record<EventState, number>;
    requiresTriage: number;
    requiresAction: number;
    avgTimeToTriage: number | null;
    avgTimeToClose: number | null;
  };
  recentEvents: EventSummary[];
  sourceStats: {
    totalSources: number;
    enabledSources: number;
    byJurisdiction: Record<string, number>;
  };
  recentActivity: AuditLogEntry[];
}

/**
 * Workflow action request via API.
 */
export interface ApiWorkflowActionRequest {
  eventId: string;
  action: WorkflowAction;
  actor: string;
  reason?: string;
  prUrl?: string;
  rolloutId?: string;
  incidentId?: string;
  assignee?: string;
}

// ============================================================================
// EVENT ENDPOINTS
// ============================================================================

/**
 * List events with filtering and pagination.
 */
export function apiListEvents(request: ListEventsRequest): ApiResponse<EventSummary[]> {
  try {
    const { filter, page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = request;

    let events = listEvents(filter);

    // Sort
    events.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt.localeCompare(b.createdAt);
          break;
        case 'updatedAt':
          comparison = a.updatedAt.localeCompare(b.updatedAt);
          break;
        case 'severity': {
          const severityOrder = { emergency: 0, legal_critical: 1, behavioral: 2, clarification: 3 };
          const aSev = a.impactAssessment?.severity ?? 'clarification';
          const bSev = b.impactAssessment?.severity ?? 'clarification';
          comparison = severityOrder[aSev] - severityOrder[bSev];
          break;
        }
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const totalCount = events.length;

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const paginatedEvents = events.slice(startIndex, startIndex + pageSize);

    // Convert to summaries
    const summaries = paginatedEvents.map((e) => ({
      id: e.id,
      title: e.title,
      state: e.state,
      severity: e.impactAssessment?.severity,
      jurisdictions: e.jurisdictions,
      sourceId: e.sourceId,
      detectedAt: e.detectedAt,
      impactedRuleCount: e.impactAssessment?.impactedRuleIds.length ?? 0,
      assignedTo: e.assignedTo,
    }));

    return {
      success: true,
      data: summaries,
      meta: {
        totalCount,
        page,
        pageSize,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to list events: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

/**
 * Get event details.
 */
export function apiGetEventDetails(eventId: string): ApiResponse<EventDetailsResponse> {
  try {
    const event = getEvent(eventId);
    if (!event) {
      return {
        success: false,
        error: `Event not found: ${eventId}`,
        meta: { timestamp: new Date().toISOString() },
      };
    }

    const source = getSourceById(event.sourceId) ?? null;
    const impactAnalysis = event.impactAssessment ? analyzeImpact(event) : null;
    const auditLog = getAuditLogForEvent(eventId);
    const allowedActions = getAllowedActionsForState(event.state);

    return {
      success: true,
      data: {
        event,
        source,
        impactAnalysis,
        auditLog,
        allowedActions,
      },
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get event details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

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

/**
 * Execute a workflow action.
 */
export function apiExecuteWorkflowAction(
  request: ApiWorkflowActionRequest
): ApiResponse<LegalChangeEvent> {
  try {
    const { eventId, action, actor, reason, prUrl, rolloutId, incidentId, assignee } = request;

    // Build metadata from optional fields
    const metadata: Record<string, unknown> = {};
    if (prUrl) metadata.prUrl = prUrl;
    if (rolloutId) metadata.rolloutId = rolloutId;
    if (incidentId) metadata.incidentId = incidentId;
    if (assignee) metadata.assignee = assignee;

    const result = executeWorkflowAction({
      eventId,
      action,
      actor,
      reason,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        meta: { timestamp: new Date().toISOString() },
      };
    }

    return {
      success: true,
      data: result.event!,
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

/**
 * Update event status with rationale.
 */
export function apiUpdateEventStatus(
  eventId: string,
  newState: EventState,
  actor: string,
  rationale: string
): ApiResponse<LegalChangeEvent> {
  const actionMap: Record<EventState, WorkflowAction> = {
    new: 'reopen', // Can only reach new via reopen
    triaged: 'triage',
    action_required: 'mark_action_required',
    no_action: 'mark_no_action',
    implemented: 'mark_implemented',
    rolled_out: 'mark_rolled_out',
    closed: 'close',
  };

  const action = actionMap[newState];
  if (!action) {
    return {
      success: false,
      error: `Invalid target state: ${newState}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  return apiExecuteWorkflowAction({
    eventId,
    action,
    actor,
    reason: rationale,
  });
}

/**
 * Get governance check preview.
 */
export function apiPreviewGovernanceChecks(
  eventId: string,
  targetState: EventState,
  actor: string
): ApiResponse<GovernanceCheckResult> {
  try {
    const event = getEvent(eventId);
    if (!event) {
      return {
        success: false,
        error: `Event not found: ${eventId}`,
        meta: { timestamp: new Date().toISOString() },
      };
    }

    const result = runGovernanceChecks(event, targetState, actor);

    return {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to check governance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

/**
 * Trigger impact analysis for an event.
 */
export function apiAnalyzeImpact(
  eventId: string,
  actor: string
): ApiResponse<ImpactAssessment> {
  try {
    const event = getEvent(eventId);
    if (!event) {
      return {
        success: false,
        error: `Event not found: ${eventId}`,
        meta: { timestamp: new Date().toISOString() },
      };
    }

    const assessment = analyzeAndAssess(event, actor);

    return {
      success: true,
      data: assessment,
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to analyze impact: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

// ============================================================================
// SOURCE ENDPOINTS
// ============================================================================

/**
 * List legal sources.
 */
export function apiListSources(
  jurisdiction?: Jurisdiction
): ApiResponse<LegalSource[]> {
  try {
    const sources = jurisdiction
      ? getSourcesByJurisdiction(jurisdiction)
      : getEnabledSources();

    return {
      success: true,
      data: sources,
      meta: {
        totalCount: sources.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to list sources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

/**
 * Get source details.
 */
export function apiGetSourceDetails(sourceId: string): ApiResponse<LegalSource> {
  try {
    const source = getSourceById(sourceId);
    if (!source) {
      return {
        success: false,
        error: `Source not found: ${sourceId}`,
        meta: { timestamp: new Date().toISOString() },
      };
    }

    return {
      success: true,
      data: source,
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get source: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

/**
 * Get dashboard data.
 */
export function apiGetDashboard(): ApiResponse<DashboardResponse> {
  try {
    const workflowStats = getWorkflowStats();
    const sourceStats = getRegistryStats();
    const recentEvents = getEventSummaries().slice(0, 10);
    const recentActivity = getRecentAuditLog(10);

    const totalEvents = Object.values(workflowStats.byState).reduce((a, b) => a + b, 0);

    return {
      success: true,
      data: {
        summary: {
          totalEvents,
          byState: workflowStats.byState,
          requiresTriage: workflowStats.requiresTriage,
          requiresAction: workflowStats.requiresAction,
          avgTimeToTriage: workflowStats.avgTimeToTriage,
          avgTimeToClose: workflowStats.avgTimeToClose,
        },
        recentEvents,
        sourceStats: {
          totalSources: sourceStats.totalSources,
          enabledSources: sourceStats.enabledSources,
          byJurisdiction: sourceStats.byJurisdiction,
        },
        recentActivity,
      },
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

/**
 * Get events requiring attention.
 */
export function apiGetAttentionRequired(): ApiResponse<EventSummary[]> {
  try {
    const events = listEvents({ states: ['new', 'action_required'] });
    const summaries = events.map((e) => ({
      id: e.id,
      title: e.title,
      state: e.state,
      severity: e.impactAssessment?.severity,
      jurisdictions: e.jurisdictions,
      sourceId: e.sourceId,
      detectedAt: e.detectedAt,
      impactedRuleCount: e.impactAssessment?.impactedRuleIds.length ?? 0,
      assignedTo: e.assignedTo,
    }));

    return {
      success: true,
      data: summaries,
      meta: {
        totalCount: summaries.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get attention required: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

// ============================================================================
// AUDIT ENDPOINTS
// ============================================================================

/**
 * Get audit log for an event.
 */
export function apiGetEventAuditLog(eventId: string): ApiResponse<AuditLogEntry[]> {
  try {
    const event = getEvent(eventId);
    if (!event) {
      return {
        success: false,
        error: `Event not found: ${eventId}`,
        meta: { timestamp: new Date().toISOString() },
      };
    }

    const auditLog = getAuditLogForEvent(eventId);

    return {
      success: true,
      data: auditLog,
      meta: {
        totalCount: auditLog.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get audit log: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

/**
 * Get recent audit log entries.
 */
export function apiGetRecentAuditLog(limit = 100): ApiResponse<AuditLogEntry[]> {
  try {
    const entries = getRecentAuditLog(limit);

    return {
      success: true,
      data: entries,
      meta: {
        totalCount: entries.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get audit log: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

// ============================================================================
// EXPORT/IMPORT ENDPOINTS
// ============================================================================

/**
 * Export all data for backup.
 */
export function apiExportAll(): ApiResponse<{
  events: ReturnType<typeof exportEvents>;
  sources: ReturnType<typeof exportRegistry>;
  auditLog: ReturnType<typeof exportAuditLog>;
}> {
  try {
    return {
      success: true,
      data: {
        events: exportEvents(),
        sources: exportRegistry(),
        auditLog: exportAuditLog(),
      },
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

/**
 * Import events from backup.
 */
export function apiImportEvents(
  events: LegalChangeEvent[],
  overwrite = false
): ApiResponse<{ imported: number; skipped: number }> {
  try {
    const result = importEvents(events, overwrite);

    return {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

// ============================================================================
// HELPER EXPORTS
// ============================================================================

/**
 * Get reviewer information for a severity level.
 */
export function apiGetReviewerInfo(
  severity: string,
  jurisdictions: string[]
): ApiResponse<{ roles: string[]; handles: string[] }> {
  try {
    const roles = getRequiredReviewers(
      severity as any,
      jurisdictions
    );
    const handles = getReviewerHandles(roles);

    return {
      success: true,
      data: { roles, handles },
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get reviewers: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

/**
 * Create a manual event (for testing or external sources).
 */
export function apiCreateManualEvent(
  input: {
    sourceId: string;
    title: string;
    summary: string;
    jurisdictions: Jurisdiction[];
    topics: LegalTopic[];
    referenceUrl: string;
    createdBy: string;
  }
): ApiResponse<LegalChangeEvent> {
  try {
    const source = getSourceById(input.sourceId);

    const event = createEvent({
      sourceId: input.sourceId,
      sourceName: source?.name ?? 'Manual Entry',
      sourceUrl: source?.url ?? '',
      referenceUrl: input.referenceUrl,
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: input.jurisdictions,
      topics: input.topics,
      title: input.title,
      summary: input.summary,
      trustLevel: source?.trustLevel ?? 'informational',
      confidenceLevel: 'unverified',
      createdBy: input.createdBy,
    });

    return {
      success: true,
      data: event,
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
