/**
 * Legal Change Events
 *
 * Phase 22: Legal Change Ingestion Pipeline
 *
 * Defines the event model, state machine, and storage for legal change events.
 */

import { Jurisdiction, LegalTopic, TrustLevel } from './legal-source-registry';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Event states for the workflow.
 */
export type EventState =
  | 'new'
  | 'triaged'
  | 'action_required'
  | 'no_action'
  | 'implemented'
  | 'rolled_out'
  | 'closed';

/**
 * Severity/impact level of a change.
 */
export type ChangeSeverity = 'clarification' | 'behavioral' | 'legal_critical' | 'emergency';

/**
 * Confidence level in the detection.
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unverified';

/**
 * A legal change event.
 */
export interface LegalChangeEvent {
  id: string;

  // Source information
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  referenceUrl: string;

  // Detection metadata
  detectedAt: string;
  detectionMethod: 'scheduled' | 'manual' | 'webhook' | 'external_alert';

  // Scope
  jurisdictions: Jurisdiction[];
  topics: LegalTopic[];

  // Content
  title: string;
  summary: string;
  diffSummary?: string;
  extractedNotes?: string;
  rawContent?: string;

  // Trust and confidence
  trustLevel: TrustLevel;
  confidenceLevel: ConfidenceLevel;

  // Workflow state
  state: EventState;
  stateHistory: StateTransition[];

  // Impact assessment (populated during triage)
  impactAssessment?: ImpactAssessment;

  // Related items
  relatedEventIds?: string[];
  linkedPrUrls?: string[];
  linkedRolloutIds?: string[];
  linkedIncidentIds?: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  createdBy: string;
  assignedTo?: string;
  tags?: string[];
  notes?: string;
}

/**
 * State transition record for audit trail.
 */
export interface StateTransition {
  from: EventState;
  to: EventState;
  timestamp: string;
  actor: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Impact assessment for a change event.
 */
export interface ImpactAssessment {
  assessedAt: string;
  assessedBy: string;

  // Severity
  severity: ChangeSeverity;
  severityRationale: string;

  // Impacted rules
  impactedRuleIds: string[];
  impactedProducts: string[];
  impactedRoutes: string[];

  // Required actions
  requiresRuleChange: boolean;
  requiresMessageUpdate: boolean;
  requiresDocUpdate: boolean;
  requiresUrgentAction: boolean;

  // Reviewers
  requiredReviewers: string[];

  // Estimates
  estimatedEffortHours?: number;
  targetCompletionDate?: string;

  // Human-readable summary
  humanSummary: string;
  machineSummary: {
    ruleCount: number;
    productCount: number;
    routeCount: number;
  };
}

/**
 * Event filter options.
 */
export interface EventFilter {
  states?: EventState[];
  jurisdictions?: Jurisdiction[];
  topics?: LegalTopic[];
  severities?: ChangeSeverity[];
  sourceIds?: string[];
  assignedTo?: string;
  createdAfter?: string;
  createdBefore?: string;
  hasImpactAssessment?: boolean;
  tags?: string[];
}

/**
 * Event summary for listings.
 */
export interface EventSummary {
  id: string;
  title: string;
  state: EventState;
  severity?: ChangeSeverity;
  jurisdictions: Jurisdiction[];
  sourceId: string;
  detectedAt: string;
  impactedRuleCount: number;
  assignedTo?: string;
}

// ============================================================================
// STATE MACHINE
// ============================================================================

/**
 * Valid state transitions.
 */
const VALID_TRANSITIONS: Record<EventState, EventState[]> = {
  new: ['triaged'],
  triaged: ['action_required', 'no_action'],
  action_required: ['implemented', 'triaged'], // can re-triage if assessment changes
  no_action: ['triaged', 'closed'], // can reopen or close
  implemented: ['rolled_out', 'action_required'], // can revert to action_required
  rolled_out: ['closed', 'implemented'], // can revert if rollout fails
  closed: ['triaged'], // can reopen if needed
};

/**
 * Check if a state transition is valid.
 */
export function isValidTransition(from: EventState, to: EventState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get allowed next states from current state.
 */
export function getAllowedNextStates(current: EventState): EventState[] {
  return VALID_TRANSITIONS[current] ?? [];
}

/**
 * Validate an event state transition and return error if invalid.
 */
export function validateTransition(
  from: EventState,
  to: EventState
): { valid: true } | { valid: false; error: string } {
  if (!isValidTransition(from, to)) {
    const allowed = getAllowedNextStates(from);
    return {
      valid: false,
      error: `Invalid transition from '${from}' to '${to}'. Allowed: ${allowed.join(', ') || 'none'}`,
    };
  }
  return { valid: true };
}

// ============================================================================
// IN-MEMORY EVENT STORE
// ============================================================================

const eventStore: Map<string, LegalChangeEvent> = new Map();
let eventIdCounter = 1;

/**
 * Generate a unique event ID.
 */
function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const counter = (eventIdCounter++).toString(36).padStart(4, '0');
  return `lce_${timestamp}_${counter}`;
}

/**
 * Create a new legal change event.
 */
export function createEvent(
  input: Omit<LegalChangeEvent, 'id' | 'state' | 'stateHistory' | 'createdAt' | 'updatedAt'>
): LegalChangeEvent {
  const id = generateEventId();
  const now = new Date().toISOString();

  const event: LegalChangeEvent = {
    ...input,
    id,
    state: 'new',
    stateHistory: [],
    createdAt: now,
    updatedAt: now,
  };

  eventStore.set(id, event);
  return event;
}

/**
 * Get an event by ID.
 */
export function getEvent(id: string): LegalChangeEvent | undefined {
  return eventStore.get(id);
}

/**
 * Update an event.
 */
export function updateEvent(
  id: string,
  updates: Partial<Omit<LegalChangeEvent, 'id' | 'createdAt' | 'stateHistory'>>
): LegalChangeEvent | undefined {
  const event = eventStore.get(id);
  if (!event) return undefined;

  const updated: LegalChangeEvent = {
    ...event,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  eventStore.set(id, updated);
  return updated;
}

/**
 * Transition an event to a new state.
 */
export function transitionEvent(
  id: string,
  newState: EventState,
  actor: string,
  reason?: string,
  metadata?: Record<string, unknown>
): { success: true; event: LegalChangeEvent } | { success: false; error: string } {
  const event = eventStore.get(id);
  if (!event) {
    return { success: false, error: `Event not found: ${id}` };
  }

  const validation = validateTransition(event.state, newState);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const transition: StateTransition = {
    from: event.state,
    to: newState,
    timestamp: new Date().toISOString(),
    actor,
    reason,
    metadata,
  };

  const updated: LegalChangeEvent = {
    ...event,
    state: newState,
    stateHistory: [...event.stateHistory, transition],
    updatedAt: new Date().toISOString(),
    closedAt: newState === 'closed' ? new Date().toISOString() : event.closedAt,
  };

  eventStore.set(id, updated);
  return { success: true, event: updated };
}

/**
 * Delete an event (for testing/cleanup).
 */
export function deleteEvent(id: string): boolean {
  return eventStore.delete(id);
}

/**
 * List events with optional filtering.
 */
export function listEvents(filter?: EventFilter): LegalChangeEvent[] {
  let events = Array.from(eventStore.values());

  if (filter) {
    if (filter.states?.length) {
      events = events.filter((e) => filter.states!.includes(e.state));
    }
    if (filter.jurisdictions?.length) {
      events = events.filter((e) => e.jurisdictions.some((j) => filter.jurisdictions!.includes(j)));
    }
    if (filter.topics?.length) {
      events = events.filter((e) => e.topics.some((t) => filter.topics!.includes(t)));
    }
    if (filter.severities?.length) {
      events = events.filter(
        (e) => e.impactAssessment && filter.severities!.includes(e.impactAssessment.severity)
      );
    }
    if (filter.sourceIds?.length) {
      events = events.filter((e) => filter.sourceIds!.includes(e.sourceId));
    }
    if (filter.assignedTo) {
      events = events.filter((e) => e.assignedTo === filter.assignedTo);
    }
    if (filter.createdAfter) {
      events = events.filter((e) => e.createdAt >= filter.createdAfter!);
    }
    if (filter.createdBefore) {
      events = events.filter((e) => e.createdAt <= filter.createdBefore!);
    }
    if (filter.hasImpactAssessment !== undefined) {
      events = events.filter((e) => (e.impactAssessment !== undefined) === filter.hasImpactAssessment);
    }
    if (filter.tags?.length) {
      events = events.filter((e) => e.tags?.some((t) => filter.tags!.includes(t)));
    }
  }

  // Sort by created date, newest first
  events.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return events;
}

/**
 * Get event summaries for listings.
 */
export function getEventSummaries(filter?: EventFilter): EventSummary[] {
  return listEvents(filter).map((e) => ({
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
}

/**
 * Count events by state.
 */
export function countEventsByState(): Record<EventState, number> {
  const counts: Record<EventState, number> = {
    new: 0,
    triaged: 0,
    action_required: 0,
    no_action: 0,
    implemented: 0,
    rolled_out: 0,
    closed: 0,
  };

  for (const event of eventStore.values()) {
    counts[event.state]++;
  }

  return counts;
}

/**
 * Get events requiring attention (new or action_required).
 */
export function getEventsRequiringAttention(): LegalChangeEvent[] {
  return listEvents({ states: ['new', 'action_required'] });
}

/**
 * Link a PR to an event.
 */
export function linkPrToEvent(eventId: string, prUrl: string): boolean {
  const event = eventStore.get(eventId);
  if (!event) return false;

  const linkedPrUrls = event.linkedPrUrls ?? [];
  if (!linkedPrUrls.includes(prUrl)) {
    linkedPrUrls.push(prUrl);
    updateEvent(eventId, { linkedPrUrls });
  }
  return true;
}

/**
 * Link a rollout to an event.
 */
export function linkRolloutToEvent(eventId: string, rolloutId: string): boolean {
  const event = eventStore.get(eventId);
  if (!event) return false;

  const linkedRolloutIds = event.linkedRolloutIds ?? [];
  if (!linkedRolloutIds.includes(rolloutId)) {
    linkedRolloutIds.push(rolloutId);
    updateEvent(eventId, { linkedRolloutIds });
  }
  return true;
}

/**
 * Link an incident to an event.
 */
export function linkIncidentToEvent(eventId: string, incidentId: string): boolean {
  const event = eventStore.get(eventId);
  if (!event) return false;

  const linkedIncidentIds = event.linkedIncidentIds ?? [];
  if (!linkedIncidentIds.includes(incidentId)) {
    linkedIncidentIds.push(incidentId);
    updateEvent(eventId, { linkedIncidentIds });
  }
  return true;
}

/**
 * Set impact assessment on an event.
 */
export function setImpactAssessment(eventId: string, assessment: ImpactAssessment): boolean {
  const event = eventStore.get(eventId);
  if (!event) return false;

  updateEvent(eventId, { impactAssessment: assessment });
  return true;
}

/**
 * Assign an event to a user.
 */
export function assignEvent(eventId: string, assignee: string, actor: string): boolean {
  const event = eventStore.get(eventId);
  if (!event) return false;

  updateEvent(eventId, { assignedTo: assignee });

  // Add note about assignment
  const notes = event.notes ?? '';
  const newNote = `[${new Date().toISOString()}] Assigned to ${assignee} by ${actor}`;
  updateEvent(eventId, { notes: notes ? `${notes}\n${newNote}` : newNote });

  return true;
}

/**
 * Clear all events (for testing).
 */
export function clearEventStore(): void {
  eventStore.clear();
  eventIdCounter = 1;
}

/**
 * Get store size (for testing/monitoring).
 */
export function getEventStoreSize(): number {
  return eventStore.size;
}

/**
 * Export all events for backup.
 */
export function exportEvents(): {
  events: LegalChangeEvent[];
  exportedAt: string;
  totalCount: number;
} {
  return {
    events: Array.from(eventStore.values()),
    exportedAt: new Date().toISOString(),
    totalCount: eventStore.size,
  };
}

/**
 * Import events from backup.
 */
export function importEvents(events: LegalChangeEvent[], overwrite = false): {
  imported: number;
  skipped: number;
} {
  let imported = 0;
  let skipped = 0;

  for (const event of events) {
    if (eventStore.has(event.id) && !overwrite) {
      skipped++;
      continue;
    }
    eventStore.set(event.id, event);
    imported++;
  }

  return { imported, skipped };
}
