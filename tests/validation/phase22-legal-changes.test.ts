/**
 * Phase 22: Legal Change Ingestion Tests
 *
 * Tests for legal source registry, change events, impact analysis,
 * workflow governance, and admin portal API hooks.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Source Registry
import {
  getEnabledSources,
  getSourcesByJurisdiction,
  getSourcesByTopic,
  getSourceById,
  getSourcesForRule,
  getSourceGroup,
  getSourcesInGroup,
  getRegistryStats,
  LEGAL_SOURCES,
  SOURCE_GROUPS,
} from '../../src/lib/validation/legal-source-registry';

// Change Events
import {
  createEvent,
  getEvent,
  listEvents,
  updateEvent,
  transitionEvent,
  isValidTransition,
  getAllowedNextStates,
  countEventsByState,
  linkPrToEvent,
  linkRolloutToEvent,
  setImpactAssessment,
  clearEventStore,
  exportEvents,
  importEvents,
  LegalChangeEvent,
} from '../../src/lib/validation/legal-change-events';

// Impact Analyzer
import {
  analyzeImpact,
  analyzeAndAssess,
  getRuleMappings,
  getMappingForRule,
  getRulesForJurisdiction,
  getRulesForTopic,
} from '../../src/lib/validation/legal-impact-analyzer';

// Workflow
import {
  executeWorkflowAction,
  runGovernanceChecks,
  getRequiredReviewers,
  getReviewerHandles,
  getWorkflowStats,
  getAuditLogForEvent,
  clearAuditLog,
  logAuditEntry,
} from '../../src/lib/validation/legal-change-workflow';

// Admin API
import {
  apiListEvents,
  apiGetEventDetails,
  apiExecuteWorkflowAction,
  apiGetDashboard,
  apiAnalyzeImpact,
  apiCreateManualEvent,
  apiListSources,
  apiExportAll,
} from '../../src/lib/validation/legal-change-api';

// ============================================================================
// SOURCE REGISTRY TESTS
// ============================================================================

describe('Legal Source Registry', () => {
  it('should have legal sources defined', () => {
    expect(LEGAL_SOURCES.length).toBeGreaterThan(0);
  });

  it('should have source groups defined', () => {
    expect(SOURCE_GROUPS.length).toBeGreaterThan(0);
  });

  it('should return enabled sources', () => {
    const sources = getEnabledSources();
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every((s) => s.enabled)).toBe(true);
  });

  it('should filter sources by jurisdiction', () => {
    const englandSources = getSourcesByJurisdiction('england');
    expect(englandSources.length).toBeGreaterThan(0);
    expect(
      englandSources.every(
        (s) => s.jurisdictions.includes('england') || s.jurisdictions.includes('uk_wide')
      )
    ).toBe(true);
  });

  it('should filter sources by topic', () => {
    const depositSources = getSourcesByTopic('deposit_protection');
    expect(depositSources.length).toBeGreaterThan(0);
    expect(depositSources.every((s) => s.topics.includes('deposit_protection'))).toBe(true);
  });

  it('should get source by ID', () => {
    const source = getSourceById('uk_legislation_gov');
    expect(source).toBeDefined();
    expect(source?.name).toBe('UK Legislation');
  });

  it('should get sources for a rule', () => {
    const sources = getSourcesForRule('s21_deposit_not_protected');
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((s) => s.ruleIdPrefixes?.includes('s21_deposit_'))).toBe(true);
  });

  it('should get source group', () => {
    const group = getSourceGroup('england_eviction');
    expect(group).toBeDefined();
    expect(group?.jurisdictions).toContain('england');
  });

  it('should get sources in group', () => {
    const sources = getSourcesInGroup('england_eviction');
    expect(sources.length).toBeGreaterThan(0);
  });

  it('should return registry stats', () => {
    const stats = getRegistryStats();
    expect(stats.totalSources).toBeGreaterThan(0);
    expect(stats.enabledSources).toBeGreaterThan(0);
    expect(stats.byJurisdiction.england).toBeGreaterThan(0);
  });
});

// ============================================================================
// CHANGE EVENTS TESTS
// ============================================================================

describe('Legal Change Events', () => {
  beforeEach(() => {
    clearEventStore();
    clearAuditLog();
  });

  it('should create an event', () => {
    const event = createEvent({
      sourceId: 'uk_legislation_gov',
      sourceName: 'UK Legislation',
      sourceUrl: 'https://www.legislation.gov.uk/',
      referenceUrl: 'https://www.legislation.gov.uk/test',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'scheduled',
      jurisdictions: ['england'],
      topics: ['deposit_protection'],
      title: 'Test Change',
      summary: 'Test summary',
      trustLevel: 'authoritative',
      confidenceLevel: 'high',
      createdBy: 'test',
    });

    expect(event.id).toMatch(/^lce_/);
    expect(event.state).toBe('new');
    expect(event.stateHistory).toHaveLength(0);
  });

  it('should get an event by ID', () => {
    const created = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const retrieved = getEvent(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });

  it('should list events', () => {
    createEvent({
      sourceId: 'test',
      sourceName: 'Test 1',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test 1',
      summary: 'Test 1',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    createEvent({
      sourceId: 'test',
      sourceName: 'Test 2',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['wales'],
      topics: ['eviction'],
      title: 'Test 2',
      summary: 'Test 2',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const allEvents = listEvents();
    expect(allEvents).toHaveLength(2);

    const englandEvents = listEvents({ jurisdictions: ['england'] });
    expect(englandEvents).toHaveLength(1);
  });

  it('should validate state transitions', () => {
    expect(isValidTransition('new', 'triaged')).toBe(true);
    expect(isValidTransition('new', 'closed')).toBe(false);
    expect(isValidTransition('triaged', 'action_required')).toBe(true);
    expect(isValidTransition('triaged', 'no_action')).toBe(true);
    expect(isValidTransition('action_required', 'implemented')).toBe(true);
    expect(isValidTransition('implemented', 'rolled_out')).toBe(true);
    expect(isValidTransition('rolled_out', 'closed')).toBe(true);
  });

  it('should get allowed next states', () => {
    expect(getAllowedNextStates('new')).toEqual(['triaged']);
    expect(getAllowedNextStates('triaged')).toContain('action_required');
    expect(getAllowedNextStates('triaged')).toContain('no_action');
  });

  it('should transition event state', () => {
    const event = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const result = transitionEvent(event.id, 'triaged', 'test-user', 'Initial triage');
    expect(result.success).toBe(true);
    expect(result.event?.state).toBe('triaged');
    expect(result.event?.stateHistory).toHaveLength(1);
    expect(result.event?.stateHistory[0].from).toBe('new');
    expect(result.event?.stateHistory[0].to).toBe('triaged');
  });

  it('should reject invalid state transitions', () => {
    const event = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const result = transitionEvent(event.id, 'closed', 'test-user');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid transition');
  });

  it('should link PR to event', () => {
    const event = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const result = linkPrToEvent(event.id, 'https://github.com/test/pr/1');
    expect(result).toBe(true);

    const updated = getEvent(event.id);
    expect(updated?.linkedPrUrls).toContain('https://github.com/test/pr/1');
  });

  it('should export and import events', () => {
    createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const exported = exportEvents();
    expect(exported.totalCount).toBe(1);

    clearEventStore();
    expect(listEvents()).toHaveLength(0);

    const imported = importEvents(exported.events);
    expect(imported.imported).toBe(1);
    expect(listEvents()).toHaveLength(1);
  });
});

// ============================================================================
// IMPACT ANALYZER TESTS
// ============================================================================

describe('Legal Impact Analyzer', () => {
  beforeEach(() => {
    clearEventStore();
  });

  it('should have rule mappings defined', () => {
    const mappings = getRuleMappings();
    expect(mappings.length).toBeGreaterThan(0);
  });

  it('should get mapping for a rule', () => {
    const mapping = getMappingForRule('s21_deposit_not_protected');
    expect(mapping).toBeDefined();
    expect(mapping?.jurisdiction).toBe('england');
    expect(mapping?.topics).toContain('deposit_protection');
  });

  it('should get rules for jurisdiction', () => {
    const rules = getRulesForJurisdiction('england');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every((r) => r.jurisdiction === 'england')).toBe(true);
  });

  it('should get rules for topic', () => {
    const rules = getRulesForTopic('deposit_protection');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every((r) => r.topics.includes('deposit_protection'))).toBe(true);
  });

  it('should analyze impact of an event', () => {
    const event = createEvent({
      sourceId: 'uk_legislation_gov',
      sourceName: 'UK Legislation',
      sourceUrl: 'https://www.legislation.gov.uk/',
      referenceUrl: 'https://www.legislation.gov.uk/test',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'scheduled',
      jurisdictions: ['england'],
      topics: ['deposit_protection'],
      title: 'Changes to Deposit Protection Requirements',
      summary:
        'The Tenant Fees Act 2019 deposit cap rules have been clarified. ' +
        'The five weeks maximum deposit applies to tenancies with annual rent under £50,000.',
      trustLevel: 'authoritative',
      confidenceLevel: 'high',
      createdBy: 'test',
    });

    const analysis = analyzeImpact(event);

    expect(analysis.eventId).toBe(event.id);
    expect(analysis.impactedRules.length).toBeGreaterThan(0);
    expect(analysis.suggestedSeverity).toBeDefined();
    expect(analysis.humanSummary).toContain('Impact Analysis');
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });

  it('should assess and store impact assessment', () => {
    const event = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['deposit_protection'],
      title: 'Deposit Cap Changes',
      summary: 'New Tenant Fees Act guidance on deposit limits',
      trustLevel: 'official',
      confidenceLevel: 'medium',
      createdBy: 'test',
    });

    const assessment = analyzeAndAssess(event, 'test-user');

    expect(assessment.assessedBy).toBe('test-user');
    expect(assessment.severity).toBeDefined();
    expect(assessment.impactedRuleIds.length).toBeGreaterThanOrEqual(0);

    const updated = getEvent(event.id);
    expect(updated?.impactAssessment).toBeDefined();
    expect(updated?.impactAssessment?.assessedBy).toBe('test-user');
  });
});

// ============================================================================
// WORKFLOW TESTS
// ============================================================================

describe('Legal Change Workflow', () => {
  beforeEach(() => {
    clearEventStore();
    clearAuditLog();
  });

  it('should get required reviewers based on severity', () => {
    const emergencyReviewers = getRequiredReviewers('emergency', ['england']);
    expect(emergencyReviewers).toContain('on_call');
    expect(emergencyReviewers).toContain('engineering');

    const clarificationReviewers = getRequiredReviewers('clarification', ['england']);
    expect(clarificationReviewers).toContain('validation_team');
    expect(clarificationReviewers).not.toContain('on_call');
  });

  it('should get reviewer handles', () => {
    const handles = getReviewerHandles(['engineering', 'product']);
    expect(handles).toContain('@platform-eng');
    expect(handles).toContain('@product-team');
  });

  it('should execute workflow action', () => {
    const event = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const result = executeWorkflowAction({
      eventId: event.id,
      action: 'triage',
      actor: 'test-user',
      reason: 'Initial triage',
    });

    expect(result.success).toBe(true);
    expect(result.event?.state).toBe('triaged');
  });

  it('should run governance checks', () => {
    const event = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    // First transition to triaged
    transitionEvent(event.id, 'triaged', 'test-user');

    // Check governance for action_required (should fail without assessment)
    const updatedEvent = getEvent(event.id)!;
    const checks = runGovernanceChecks(updatedEvent, 'action_required', 'test-user');

    expect(checks.checks.some((c) => c.name === 'impact_assessment')).toBe(true);
    expect(checks.checks.find((c) => c.name === 'impact_assessment')?.passed).toBe(false);
  });

  it('should log audit entries', () => {
    const event = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    executeWorkflowAction({
      eventId: event.id,
      action: 'triage',
      actor: 'test-user',
    });

    const auditLog = getAuditLogForEvent(event.id);
    expect(auditLog.length).toBeGreaterThan(0);
    expect(auditLog[0].action).toBe('triage');
    expect(auditLog[0].actor).toBe('test-user');
  });

  it('should calculate workflow stats', () => {
    createEvent({
      sourceId: 'test',
      sourceName: 'Test 1',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test 1',
      summary: 'Test 1',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    createEvent({
      sourceId: 'test',
      sourceName: 'Test 2',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['wales'],
      topics: ['eviction'],
      title: 'Test 2',
      summary: 'Test 2',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const stats = getWorkflowStats();
    expect(stats.byState.new).toBe(2);
    expect(stats.requiresTriage).toBe(2);
  });
});

// ============================================================================
// ADMIN API TESTS
// ============================================================================

describe('Legal Change Admin API', () => {
  beforeEach(() => {
    clearEventStore();
    clearAuditLog();
  });

  it('should list events via API', () => {
    createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const result = apiListEvents({});
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
    expect(result.meta?.totalCount).toBe(1);
  });

  it('should get event details via API', () => {
    const event = createEvent({
      sourceId: 'uk_legislation_gov',
      sourceName: 'UK Legislation',
      sourceUrl: 'https://www.legislation.gov.uk/',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'authoritative',
      confidenceLevel: 'high',
      createdBy: 'test',
    });

    const result = apiGetEventDetails(event.id);
    expect(result.success).toBe(true);
    expect(result.data?.event.id).toBe(event.id);
    expect(result.data?.source).toBeDefined();
    expect(result.data?.allowedActions).toContain('triage');
  });

  it('should execute workflow action via API', () => {
    const event = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const result = apiExecuteWorkflowAction({
      eventId: event.id,
      action: 'triage',
      actor: 'test-user',
    });

    expect(result.success).toBe(true);
    expect(result.data?.state).toBe('triaged');
  });

  it('should get dashboard data via API', () => {
    createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const result = apiGetDashboard();
    expect(result.success).toBe(true);
    expect(result.data?.summary.totalEvents).toBe(1);
    expect(result.data?.sourceStats.enabledSources).toBeGreaterThan(0);
  });

  it('should analyze impact via API', () => {
    const event = createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['deposit_protection'],
      title: 'Deposit Protection Changes',
      summary: 'New requirements for Tenant Fees Act deposit cap',
      trustLevel: 'official',
      confidenceLevel: 'medium',
      createdBy: 'test',
    });

    const result = apiAnalyzeImpact(event.id, 'test-user');
    expect(result.success).toBe(true);
    expect(result.data?.assessedBy).toBe('test-user');
    expect(result.data?.severity).toBeDefined();
  });

  it('should create manual event via API', () => {
    const result = apiCreateManualEvent({
      sourceId: 'manual',
      title: 'Manual Test Event',
      summary: 'Created via API',
      jurisdictions: ['england'],
      topics: ['housing'],
      referenceUrl: 'https://example.com',
      createdBy: 'test-user',
    });

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Manual Test Event');
    expect(result.data?.detectionMethod).toBe('manual');
  });

  it('should list sources via API', () => {
    const result = apiListSources();
    expect(result.success).toBe(true);
    expect(result.data?.length).toBeGreaterThan(0);
  });

  it('should export all data via API', () => {
    createEvent({
      sourceId: 'test',
      sourceName: 'Test',
      sourceUrl: '',
      referenceUrl: '',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'manual',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'Test',
      summary: 'Test',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'test',
    });

    const result = apiExportAll();
    expect(result.success).toBe(true);
    expect(result.data?.events.totalCount).toBe(1);
    expect(result.data?.sources.sources.length).toBeGreaterThan(0);
  });

  it('should handle errors gracefully', () => {
    const result = apiGetEventDetails('nonexistent');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Legal Change Integration', () => {
  beforeEach(() => {
    clearEventStore();
    clearAuditLog();
  });

  it('should complete full workflow: create → triage → assess → implement → rollout → close', () => {
    // 1. Create event
    const event = createEvent({
      sourceId: 'uk_legislation_gov',
      sourceName: 'UK Legislation',
      sourceUrl: 'https://www.legislation.gov.uk/',
      referenceUrl: 'https://www.legislation.gov.uk/test',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'scheduled',
      jurisdictions: ['england'],
      topics: ['deposit_protection'],
      title: 'Deposit Cap Amendment',
      summary: 'The Tenant Fees Act deposit cap has been amended.',
      trustLevel: 'authoritative',
      confidenceLevel: 'high',
      createdBy: 'system',
    });
    expect(event.state).toBe('new');

    // 2. Triage (auto-assesses)
    let result = executeWorkflowAction({
      eventId: event.id,
      action: 'triage',
      actor: 'legal-analyst',
    });
    expect(result.success).toBe(true);
    expect(result.event?.state).toBe('triaged');
    expect(result.event?.impactAssessment).toBeDefined();

    // 3. Mark action required
    result = executeWorkflowAction({
      eventId: event.id,
      action: 'mark_action_required',
      actor: 'legal-analyst',
      reason: 'Rule update needed',
    });
    expect(result.success).toBe(true);
    expect(result.event?.state).toBe('action_required');

    // 4. Link PR
    result = executeWorkflowAction({
      eventId: event.id,
      action: 'link_pr',
      actor: 'developer',
      metadata: { prUrl: 'https://github.com/org/repo/pull/123' },
    });
    expect(result.success).toBe(true);
    expect(result.event?.linkedPrUrls).toContain('https://github.com/org/repo/pull/123');

    // 5. Mark implemented
    result = executeWorkflowAction({
      eventId: event.id,
      action: 'mark_implemented',
      actor: 'developer',
      reason: 'PR merged',
    });
    expect(result.success).toBe(true);
    expect(result.event?.state).toBe('implemented');

    // 6. Link rollout
    result = executeWorkflowAction({
      eventId: event.id,
      action: 'link_rollout',
      actor: 'devops',
      metadata: { rolloutId: 'deploy-2026-01-26-001' },
    });
    expect(result.success).toBe(true);

    // 7. Mark rolled out
    result = executeWorkflowAction({
      eventId: event.id,
      action: 'mark_rolled_out',
      actor: 'devops',
      reason: 'Deployed to production',
    });
    expect(result.success).toBe(true);
    expect(result.event?.state).toBe('rolled_out');

    // 8. Close
    result = executeWorkflowAction({
      eventId: event.id,
      action: 'close',
      actor: 'legal-analyst',
      reason: 'Change fully implemented',
    });
    expect(result.success).toBe(true);
    expect(result.event?.state).toBe('closed');
    expect(result.event?.closedAt).toBeDefined();

    // Verify audit trail
    const auditLog = getAuditLogForEvent(event.id);
    expect(auditLog.length).toBeGreaterThanOrEqual(6);

    // Verify state history
    const finalEvent = getEvent(event.id);
    expect(finalEvent?.stateHistory.length).toBe(6); // new→triaged→action_required→implemented→rolled_out→closed
  });

  it('should allow no_action path for clarification changes', () => {
    const event = createEvent({
      sourceId: 'shelter_england',
      sourceName: 'Shelter England',
      sourceUrl: 'https://england.shelter.org.uk/',
      referenceUrl: 'https://england.shelter.org.uk/test',
      detectedAt: new Date().toISOString(),
      detectionMethod: 'scheduled',
      jurisdictions: ['england'],
      topics: ['housing'],
      title: 'General Housing Advice Update',
      summary: 'Updated housing advice article with no legal changes.',
      trustLevel: 'informational',
      confidenceLevel: 'low',
      createdBy: 'system',
    });

    // Triage
    let result = executeWorkflowAction({
      eventId: event.id,
      action: 'triage',
      actor: 'analyst',
    });
    expect(result.success).toBe(true);

    // Mark no action
    result = executeWorkflowAction({
      eventId: event.id,
      action: 'mark_no_action',
      actor: 'analyst',
      reason: 'Informational only, no rule impact',
    });
    expect(result.success).toBe(true);
    expect(result.event?.state).toBe('no_action');

    // Close
    result = executeWorkflowAction({
      eventId: event.id,
      action: 'close',
      actor: 'analyst',
    });
    expect(result.success).toBe(true);
    expect(result.event?.state).toBe('closed');
  });
});
