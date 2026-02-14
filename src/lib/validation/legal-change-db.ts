/**
 * Legal Change Events Database Adapter
 *
 * Provides database persistence for legal change events using Supabase.
 * Replaces the in-memory storage to work correctly in serverless environments.
 */

import { createAdminClient } from '@/lib/supabase/server';
import type {
  LegalChangeEvent,
  EventState,
  EventFilter,
  StateTransition,
  ImpactAssessment,
  EventSummary,
} from './legal-change-events';

// Database row type (matches the SQL schema)
interface LegalChangeEventRow {
  id: string;
  source_id: string;
  source_name: string;
  source_url: string;
  reference_url: string;
  detected_at: string;
  detection_method: string;
  jurisdictions: string[];
  topics: string[];
  title: string;
  summary: string;
  diff_summary: string | null;
  extracted_notes: string | null;
  raw_content: string | null;
  trust_level: string;
  confidence_level: string;
  state: string;
  state_history: StateTransition[];
  impact_assessment: ImpactAssessment | null;
  related_event_ids: string[] | null;
  linked_pr_urls: string[] | null;
  linked_rollout_ids: string[] | null;
  linked_incident_ids: string[] | null;
  created_by: string;
  assigned_to: string | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

// Convert database row to domain model
function rowToEvent(row: LegalChangeEventRow): LegalChangeEvent {
  return {
    id: row.id,
    sourceId: row.source_id,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    referenceUrl: row.reference_url,
    detectedAt: row.detected_at,
    detectionMethod: row.detection_method as LegalChangeEvent['detectionMethod'],
    jurisdictions: row.jurisdictions as LegalChangeEvent['jurisdictions'],
    topics: row.topics as LegalChangeEvent['topics'],
    title: row.title,
    summary: row.summary,
    diffSummary: row.diff_summary ?? undefined,
    extractedNotes: row.extracted_notes ?? undefined,
    rawContent: row.raw_content ?? undefined,
    trustLevel: row.trust_level as LegalChangeEvent['trustLevel'],
    confidenceLevel: row.confidence_level as LegalChangeEvent['confidenceLevel'],
    state: row.state as EventState,
    stateHistory: row.state_history || [],
    impactAssessment: row.impact_assessment ?? undefined,
    relatedEventIds: row.related_event_ids ?? undefined,
    linkedPrUrls: row.linked_pr_urls ?? undefined,
    linkedRolloutIds: row.linked_rollout_ids ?? undefined,
    linkedIncidentIds: row.linked_incident_ids ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at ?? undefined,
    createdBy: row.created_by,
    assignedTo: row.assigned_to ?? undefined,
    tags: row.tags ?? undefined,
    notes: row.notes ?? undefined,
  };
}

// Convert domain model to database row for insert/update
function eventToRow(
  event: Partial<LegalChangeEvent> & Pick<LegalChangeEvent, 'id'>
): Partial<LegalChangeEventRow> {
  const row: Partial<LegalChangeEventRow> = {};

  if (event.id !== undefined) row.id = event.id;
  if (event.sourceId !== undefined) row.source_id = event.sourceId;
  if (event.sourceName !== undefined) row.source_name = event.sourceName;
  if (event.sourceUrl !== undefined) row.source_url = event.sourceUrl;
  if (event.referenceUrl !== undefined) row.reference_url = event.referenceUrl;
  if (event.detectedAt !== undefined) row.detected_at = event.detectedAt;
  if (event.detectionMethod !== undefined) row.detection_method = event.detectionMethod;
  if (event.jurisdictions !== undefined) row.jurisdictions = event.jurisdictions;
  if (event.topics !== undefined) row.topics = event.topics;
  if (event.title !== undefined) row.title = event.title;
  if (event.summary !== undefined) row.summary = event.summary;
  if (event.diffSummary !== undefined) row.diff_summary = event.diffSummary;
  if (event.extractedNotes !== undefined) row.extracted_notes = event.extractedNotes;
  if (event.rawContent !== undefined) row.raw_content = event.rawContent;
  if (event.trustLevel !== undefined) row.trust_level = event.trustLevel;
  if (event.confidenceLevel !== undefined) row.confidence_level = event.confidenceLevel;
  if (event.state !== undefined) row.state = event.state;
  if (event.stateHistory !== undefined) row.state_history = event.stateHistory;
  if (event.impactAssessment !== undefined) row.impact_assessment = event.impactAssessment;
  if (event.relatedEventIds !== undefined) row.related_event_ids = event.relatedEventIds;
  if (event.linkedPrUrls !== undefined) row.linked_pr_urls = event.linkedPrUrls;
  if (event.linkedRolloutIds !== undefined) row.linked_rollout_ids = event.linkedRolloutIds;
  if (event.linkedIncidentIds !== undefined) row.linked_incident_ids = event.linkedIncidentIds;
  if (event.createdBy !== undefined) row.created_by = event.createdBy;
  if (event.assignedTo !== undefined) row.assigned_to = event.assignedTo;
  if (event.tags !== undefined) row.tags = event.tags;
  if (event.notes !== undefined) row.notes = event.notes;
  if (event.closedAt !== undefined) row.closed_at = event.closedAt;

  return row;
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

let eventIdCounter = 1;

/**
 * Generate a unique event ID.
 */
export function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const counter = (eventIdCounter++).toString(36).padStart(4, '0');
  return `lce_${timestamp}_${counter}`;
}

/**
 * Create a new legal change event in the database.
 */
export async function dbCreateEvent(
  input: Omit<LegalChangeEvent, 'id' | 'state' | 'stateHistory' | 'createdAt' | 'updatedAt'>
): Promise<LegalChangeEvent> {
  const supabase = createAdminClient();
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

  const row = eventToRow(event);
  row.created_at = now;
  row.updated_at = now;

  const { error } = await supabase.from('legal_change_events').insert(row);

  if (error) {
    console.error('[LegalChangeDB] Failed to create event:', error);
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return event;
}

/**
 * Get an event by ID from the database.
 */
export async function dbGetEvent(id: string): Promise<LegalChangeEvent | undefined> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('legal_change_events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return undefined;
    }
    console.error('[LegalChangeDB] Failed to get event:', error);
    return undefined;
  }

  return data ? rowToEvent(data as unknown as LegalChangeEventRow) : undefined;
}

/**
 * Update an event in the database.
 */
export async function dbUpdateEvent(
  id: string,
  updates: Partial<Omit<LegalChangeEvent, 'id' | 'createdAt' | 'stateHistory'>>
): Promise<LegalChangeEvent | undefined> {
  const supabase = createAdminClient();

  const row = eventToRow({ id, ...updates } as LegalChangeEvent);

  const { data, error } = await supabase
    .from('legal_change_events')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[LegalChangeDB] Failed to update event:', error);
    return undefined;
  }

  return data ? rowToEvent(data as unknown as LegalChangeEventRow) : undefined;
}

/**
 * Transition an event to a new state.
 */
export async function dbTransitionEvent(
  id: string,
  newState: EventState,
  actor: string,
  reason?: string,
  metadata?: Record<string, unknown>
): Promise<{ success: true; event: LegalChangeEvent } | { success: false; error: string }> {
  const supabase = createAdminClient();

  // Get current event
  const event = await dbGetEvent(id);
  if (!event) {
    return { success: false, error: `Event not found: ${id}` };
  }

  // Create state transition record
  const transition: StateTransition = {
    from: event.state,
    to: newState,
    timestamp: new Date().toISOString(),
    actor,
    reason,
    metadata,
  };

  // Update the event
  const { data, error } = await supabase
    .from('legal_change_events')
    .update({
      state: newState,
      state_history: [...event.stateHistory, transition],
      closed_at: newState === 'closed' ? new Date().toISOString() : event.closedAt,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[LegalChangeDB] Failed to transition event:', error);
    return { success: false, error: `Failed to transition event: ${error.message}` };
  }

  return { success: true, event: rowToEvent(data as unknown as LegalChangeEventRow) };
}

/**
 * Delete an event from the database.
 */
export async function dbDeleteEvent(id: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('legal_change_events').delete().eq('id', id);

  if (error) {
    console.error('[LegalChangeDB] Failed to delete event:', error);
    return false;
  }

  return true;
}

/**
 * List events with optional filtering.
 */
export async function dbListEvents(filter?: EventFilter): Promise<LegalChangeEvent[]> {
  const supabase = createAdminClient();

  let query = supabase.from('legal_change_events').select('*');

  if (filter) {
    if (filter.states?.length) {
      query = query.in('state', filter.states);
    }
    if (filter.assignedTo) {
      query = query.eq('assigned_to', filter.assignedTo);
    }
    if (filter.createdAfter) {
      query = query.gte('created_at', filter.createdAfter);
    }
    if (filter.createdBefore) {
      query = query.lte('created_at', filter.createdBefore);
    }
    if (filter.hasImpactAssessment !== undefined) {
      if (filter.hasImpactAssessment) {
        query = query.not('impact_assessment', 'is', null);
      } else {
        query = query.is('impact_assessment', null);
      }
    }
  }

  // Sort by created date, newest first
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('[LegalChangeDB] Failed to list events:', error);
    return [];
  }

  let events = (data || []).map((row) => rowToEvent(row as unknown as LegalChangeEventRow));

  // Apply filters that can't be done in SQL easily (JSONB array contains)
  if (filter) {
    if (filter.jurisdictions?.length) {
      events = events.filter((e) =>
        e.jurisdictions.some((j) => filter.jurisdictions!.includes(j))
      );
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
    if (filter.tags?.length) {
      events = events.filter((e) => e.tags?.some((t) => filter.tags!.includes(t)));
    }
  }

  return events;
}

/**
 * Get event summaries for listings.
 */
export async function dbGetEventSummaries(filter?: EventFilter): Promise<EventSummary[]> {
  const events = await dbListEvents(filter);
  return events.map((e) => ({
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
export async function dbCountEventsByState(): Promise<Record<EventState, number>> {
  const supabase = createAdminClient();

  const counts: Record<EventState, number> = {
    new: 0,
    triaged: 0,
    action_required: 0,
    no_action: 0,
    implemented: 0,
    rolled_out: 0,
    closed: 0,
  };

  const { data, error } = await supabase
    .from('legal_change_events')
    .select('state')
    .then((result) => {
      if (result.error) return result;
      // Count manually since Supabase doesn't support GROUP BY easily
      const rows = result.data || [];
      rows.forEach((row: { state: string }) => {
        if (row.state in counts) {
          counts[row.state as EventState]++;
        }
      });
      return { data: counts, error: null };
    });

  if (error) {
    console.error('[LegalChangeDB] Failed to count events:', error);
    return counts;
  }

  return data as Record<EventState, number>;
}

/**
 * Get events requiring attention (new or action_required).
 */
export async function dbGetEventsRequiringAttention(): Promise<LegalChangeEvent[]> {
  return dbListEvents({ states: ['new', 'action_required'] });
}

/**
 * Link a PR to an event.
 */
export async function dbLinkPrToEvent(eventId: string, prUrl: string): Promise<boolean> {
  const event = await dbGetEvent(eventId);
  if (!event) return false;

  const linkedPrUrls = event.linkedPrUrls ?? [];
  if (!linkedPrUrls.includes(prUrl)) {
    linkedPrUrls.push(prUrl);
    await dbUpdateEvent(eventId, { linkedPrUrls });
  }
  return true;
}

/**
 * Link a rollout to an event.
 */
export async function dbLinkRolloutToEvent(eventId: string, rolloutId: string): Promise<boolean> {
  const event = await dbGetEvent(eventId);
  if (!event) return false;

  const linkedRolloutIds = event.linkedRolloutIds ?? [];
  if (!linkedRolloutIds.includes(rolloutId)) {
    linkedRolloutIds.push(rolloutId);
    await dbUpdateEvent(eventId, { linkedRolloutIds });
  }
  return true;
}

/**
 * Set impact assessment on an event.
 */
export async function dbSetImpactAssessment(
  eventId: string,
  assessment: ImpactAssessment
): Promise<boolean> {
  const event = await dbGetEvent(eventId);
  if (!event) return false;

  await dbUpdateEvent(eventId, { impactAssessment: assessment });
  return true;
}

/**
 * Assign an event to a user.
 */
export async function dbAssignEvent(
  eventId: string,
  assignee: string,
  actor: string
): Promise<boolean> {
  const event = await dbGetEvent(eventId);
  if (!event) return false;

  const notes = event.notes ?? '';
  const newNote = `[${new Date().toISOString()}] Assigned to ${assignee} by ${actor}`;
  await dbUpdateEvent(eventId, {
    assignedTo: assignee,
    notes: notes ? `${notes}\n${newNote}` : newNote,
  });
  return true;
}

/**
 * Get total event count.
 */
export async function dbGetEventCount(): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('legal_change_events')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('[LegalChangeDB] Failed to count events:', error);
    return 0;
  }

  return count ?? 0;
}
