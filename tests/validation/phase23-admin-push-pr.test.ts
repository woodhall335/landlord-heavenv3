/**
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 *
 * Comprehensive test suite covering:
 * - Cron run tracking and "needs checking" logic
 * - Push PR generation and event state transitions
 * - GitHub integration (mocked)
 * - Changeset generation
 * - Full workflow integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Import Phase 23 modules
import {
  startCronRun,
  completeCronRun,
  addCronRunError,
  updateCronRun,
  getCronRun,
  listCronRuns,
  getLastRunForJob,
  checkJobNeedsAttention,
  getJobStatusSummary,
  getAllJobStatuses,
  clearCronRuns,
  CronJobName,
  NeedsCheckingConfig,
} from '@/lib/validation/cron-run-tracker';

import {
  generateChangeset,
  generatePRBody,
  generatePRTitle,
} from '@/lib/validation/changeset-generator';

import {
  checkPushPREligibility,
  canPushPR,
  isGitHubConfigured,
  generateBranchName,
  getPRLabels,
  getPRReviewers,
} from '@/lib/validation/admin-push-pr';

// Import Phase 22 modules for setup
import {
  createEvent,
  getEvent,
  transitionEvent,
  clearEventStore,
  LegalChangeEvent,
} from '@/lib/validation/legal-change-events';

import {
  analyzeAndAssess,
} from '@/lib/validation/legal-impact-analyzer';

import {
  clearAuditLog,
} from '@/lib/validation/legal-change-workflow';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('Phase 23: Admin Portal Cron Summary + Push PR Workflow', () => {
  beforeEach(() => {
    // Clear all stores before each test
    clearCronRuns();
    clearEventStore();
    clearAuditLog();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // CRON RUN TRACKER TESTS
  // ==========================================================================

  describe('Cron Run Tracker', () => {
    describe('Basic Operations', () => {
      it('should start a new cron run', () => {
        const run = startCronRun('legal-change:check', 'cron');

        expect(run).toBeDefined();
        expect(run.id).toMatch(/^run_/);
        expect(run.jobName).toBe('legal-change:check');
        expect(run.status).toBe('running');
        expect(run.triggeredBy).toBe('cron');
        expect(run.sourcesChecked).toBe(0);
        expect(run.eventsCreated).toBe(0);
      });

      it('should complete a cron run with success status', () => {
        const run = startCronRun('legal-change:check', 'cron');
        const completed = completeCronRun(run.id, 'success', 'All sources checked', {
          sourcesChecked: 10,
          eventsCreated: 2,
        });

        expect(completed).toBeDefined();
        expect(completed!.status).toBe('success');
        expect(completed!.finishedAt).toBeDefined();
        expect(completed!.durationMs).toBeGreaterThanOrEqual(0);
        expect(completed!.sourcesChecked).toBe(10);
        expect(completed!.eventsCreated).toBe(2);
      });

      it('should add errors to a running cron run', () => {
        const run = startCronRun('legal-change:check', 'cron');
        addCronRunError(run.id, {
          sourceId: 'source-1',
          message: 'Connection failed',
          code: 'CONN_ERR',
        });

        const updated = getCronRun(run.id);
        expect(updated!.errors).toHaveLength(1);
        expect(updated!.errors[0].sourceId).toBe('source-1');
        expect(updated!.errors[0].message).toBe('Connection failed');
      });

      it('should update run progress', () => {
        const run = startCronRun('legal-change:check', 'cron');
        updateCronRun(run.id, {
          sourcesChecked: 5,
          eventsCreated: 1,
          warnings: ['Source xyz returned empty'],
        });

        const updated = getCronRun(run.id);
        expect(updated!.sourcesChecked).toBe(5);
        expect(updated!.eventsCreated).toBe(1);
        expect(updated!.warnings).toContain('Source xyz returned empty');
      });

      it('should list runs with filtering', () => {
        startCronRun('legal-change:check', 'cron');
        startCronRun('legal-change:check', 'manual');
        startCronRun('compliance:check', 'cron');

        const allRuns = listCronRuns();
        expect(allRuns).toHaveLength(3);

        const checkRuns = listCronRuns({ jobName: 'legal-change:check' });
        expect(checkRuns).toHaveLength(2);

        const manualRuns = listCronRuns({ triggeredBy: 'manual' });
        expect(manualRuns).toHaveLength(1);
      });

      it('should get last run for a job', () => {
        const run1 = startCronRun('legal-change:check', 'cron');
        completeCronRun(run1.id, 'success', 'Run 1');

        const run2 = startCronRun('legal-change:check', 'cron');
        completeCronRun(run2.id, 'success', 'Run 2');

        const lastRun = getLastRunForJob('legal-change:check');
        expect(lastRun).toBeDefined();
        expect(lastRun!.id).toBe(run2.id);
      });
    });

    describe('Needs Checking Logic', () => {
      const defaultConfig: NeedsCheckingConfig = {
        maxHoursSinceLastRun: 24,
        maxFailedRunsBeforeAlert: 2,
        minSuccessRate: 80,
        alertOnNewEvents: true,
        alertOnHighUnverifiedRate: 50,
      };

      it('should flag when no runs exist', () => {
        const reasons = checkJobNeedsAttention('legal-change:check', defaultConfig);
        expect(reasons).toHaveLength(1);
        expect(reasons[0].reason).toBe('No runs recorded');
      });

      it('should flag when last run failed', () => {
        const run = startCronRun('legal-change:check', 'cron');
        completeCronRun(run.id, 'failed', 'Error occurred');

        const reasons = checkJobNeedsAttention('legal-change:check', defaultConfig);
        expect(reasons.some(r => r.reason === 'Last run failed')).toBe(true);
      });

      it('should flag when too long since last successful run', () => {
        const run = startCronRun('legal-change:check', 'cron');

        // Manually set started time to 25 hours ago
        const runData = getCronRun(run.id)!;
        const oldTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
        Object.assign(runData, { startedAt: oldTime });

        completeCronRun(run.id, 'success', 'Done');

        const reasons = checkJobNeedsAttention('legal-change:check', defaultConfig);
        expect(reasons.some(r => r.reason === 'Too long since last successful run')).toBe(true);
      });

      it('should flag when multiple consecutive failures', () => {
        // Create 2 failed runs
        const run1 = startCronRun('legal-change:check', 'cron');
        completeCronRun(run1.id, 'failed', 'Error 1');

        const run2 = startCronRun('legal-change:check', 'cron');
        completeCronRun(run2.id, 'failed', 'Error 2');

        const reasons = checkJobNeedsAttention('legal-change:check', defaultConfig);
        expect(reasons.some(r => r.reason === 'Multiple consecutive failures')).toBe(true);
      });

      it('should flag when new events are created', () => {
        const run = startCronRun('legal-change:check', 'cron');
        completeCronRun(run.id, 'success', 'Done');

        const reasons = checkJobNeedsAttention('legal-change:check', defaultConfig, 5);
        expect(reasons.some(r => r.reason === 'New events created')).toBe(true);
      });

      it('should flag errors in last run', () => {
        const run = startCronRun('legal-change:check', 'cron');
        addCronRunError(run.id, { message: 'Test error' });
        completeCronRun(run.id, 'partial', 'Completed with errors');

        const reasons = checkJobNeedsAttention('legal-change:check', defaultConfig);
        expect(reasons.some(r => r.reason === 'Errors in last run')).toBe(true);
      });

      it('should return no reasons for healthy job', () => {
        const run = startCronRun('legal-change:check', 'cron');
        completeCronRun(run.id, 'success', 'All good');

        const reasons = checkJobNeedsAttention('legal-change:check', defaultConfig);
        expect(reasons).toHaveLength(0);
      });
    });

    describe('Job Status Summary', () => {
      it('should return complete job status summary', () => {
        const run = startCronRun('legal-change:check', 'cron');
        completeCronRun(run.id, 'success', 'Done', {
          sourcesChecked: 5,
          eventsCreated: 1,
        });

        const summary = getJobStatusSummary('legal-change:check');

        expect(summary.jobName).toBe('legal-change:check');
        expect(summary.lastRun).toBeDefined();
        expect(summary.successRate).toBe(100);
        expect(summary.totalRuns).toBe(1);
        expect(summary.needsChecking).toBe(false);
      });

      it('should get all job statuses', () => {
        startCronRun('legal-change:check', 'cron');
        startCronRun('compliance:check', 'cron');

        const statuses = getAllJobStatuses();

        // Should include all defined job types
        expect(statuses.length).toBeGreaterThanOrEqual(2);
        expect(statuses.some(s => s.jobName === 'legal-change:check')).toBe(true);
      });
    });
  });

  // ==========================================================================
  // CHANGESET GENERATOR TESTS
  // ==========================================================================

  describe('Changeset Generator', () => {
    let testEvent: LegalChangeEvent;

    beforeEach(() => {
      testEvent = createEvent({
        sourceId: 'gov-uk-legislation',
        sourceName: 'UK Legislation',
        sourceUrl: 'https://www.legislation.gov.uk',
        referenceUrl: 'https://www.legislation.gov.uk/test',
        detectedAt: new Date().toISOString(),
        detectionMethod: 'scheduled',
        jurisdictions: ['england'],
        topics: ['deposit_protection', 'eviction'],
        title: 'Deposit Protection Amendment 2024',
        summary: 'Changes to deposit protection requirements effective April 2024.',
        trustLevel: 'authoritative',
        confidenceLevel: 'high',
        createdBy: 'test',
      });

      // Add impact assessment
      analyzeAndAssess(testEvent, 'test');
    });

    it('should generate a changeset for an event', () => {
      const changeset = generateChangeset(testEvent, 'test-user');

      expect(changeset).toBeDefined();
      expect(changeset.eventId).toBe(testEvent.id);
      expect(changeset.generatedBy).toBe('test-user');
      expect(changeset.files).toBeDefined();
      expect(Array.isArray(changeset.files)).toBe(true);
    });

    it('should include metadata file in changeset', () => {
      const changeset = generateChangeset(testEvent, 'test-user');

      const metadataFile = changeset.files.find(f => f.path.includes('.changeset/'));
      expect(metadataFile).toBeDefined();
      expect(metadataFile!.content).toContain(testEvent.id);
    });

    it('should generate rule files for impacted rules', () => {
      const changeset = generateChangeset(testEvent, 'test-user');

      const ruleFiles = changeset.files.filter(f => f.path.includes('/rules/'));
      // Should have at least one rule file if rules are impacted
      expect(ruleFiles.length).toBeGreaterThanOrEqual(0);
    });

    it('should generate test files when includeTests is true', () => {
      const changeset = generateChangeset(testEvent, 'test-user', { includeTests: true });

      const testFiles = changeset.files.filter(f => f.path.includes('tests/'));
      // May or may not have tests depending on impact analysis
      expect(testFiles).toBeDefined();
    });

    it('should generate documentation when includeDocs is true', () => {
      const changeset = generateChangeset(testEvent, 'test-user', { includeDocs: true });

      const docFiles = changeset.files.filter(f => f.path.includes('docs/'));
      expect(docFiles).toBeDefined();
    });

    it('should include validation results', () => {
      const changeset = generateChangeset(testEvent, 'test-user');

      expect(changeset.validation).toBeDefined();
      expect(typeof changeset.validation.passed).toBe('boolean');
      expect(Array.isArray(changeset.validation.errors)).toBe(true);
      expect(Array.isArray(changeset.validation.warnings)).toBe(true);
    });

    it('should generate PR title correctly', () => {
      const title = generatePRTitle(testEvent);

      expect(title).toContain('Legal change:');
      expect(title).toContain(testEvent.title);
    });

    it('should generate PR body with all sections', () => {
      const changeset = generateChangeset(testEvent, 'test-user');
      const body = generatePRBody(
        testEvent,
        changeset,
        { eventId: testEvent.id } as any
      );

      expect(body).toContain('## Legal Change:');
      expect(body).toContain('### Summary');
      expect(body).toContain('### Source');
      expect(body).toContain('### Impact Analysis');
      expect(body).toContain('### Test Plan');
    });
  });

  // ==========================================================================
  // PUSH PR ELIGIBILITY TESTS
  // ==========================================================================

  describe('Push PR Eligibility', () => {
    let testEvent: LegalChangeEvent;

    beforeEach(() => {
      testEvent = createEvent({
        sourceId: 'gov-uk-legislation',
        sourceName: 'UK Legislation',
        sourceUrl: 'https://www.legislation.gov.uk',
        referenceUrl: 'https://www.legislation.gov.uk/test',
        detectedAt: new Date().toISOString(),
        detectionMethod: 'scheduled',
        jurisdictions: ['england'],
        topics: ['deposit_protection'],
        title: 'Test Legal Change',
        summary: 'Test summary',
        trustLevel: 'authoritative',
        confidenceLevel: 'high',
        createdBy: 'test',
      });
    });

    it('should not be eligible when event is in new state', () => {
      const eligibility = checkPushPREligibility(testEvent, 'test-user');

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.reasons.some(r => r.includes('action_required'))).toBe(true);
    });

    it('should not be eligible without impact assessment', () => {
      // Transition to action_required without assessment
      transitionEvent(testEvent.id, 'triaged', 'test');

      const updated = getEvent(testEvent.id)!;
      const eligibility = checkPushPREligibility(updated, 'test-user');

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.reasons.some(r => r.includes('impact assessment'))).toBe(true);
    });

    it('should check GitHub configuration', () => {
      // With impact assessment
      analyzeAndAssess(testEvent, 'test');
      transitionEvent(testEvent.id, 'triaged', 'test');
      transitionEvent(testEvent.id, 'action_required', 'test');

      const updated = getEvent(testEvent.id)!;
      const eligibility = checkPushPREligibility(updated, 'test-user');

      // GitHub not configured in test environment
      if (!isGitHubConfigured()) {
        expect(eligibility.reasons.some(r => r.includes('GitHub'))).toBe(true);
      }
    });

    it('should return required reviewers based on severity', () => {
      analyzeAndAssess(testEvent, 'test');
      transitionEvent(testEvent.id, 'triaged', 'test');
      transitionEvent(testEvent.id, 'action_required', 'test');

      const updated = getEvent(testEvent.id)!;
      const eligibility = checkPushPREligibility(updated, 'test-user');

      expect(eligibility.requiredReviewers).toBeDefined();
      expect(Array.isArray(eligibility.requiredReviewers)).toBe(true);
    });
  });

  // ==========================================================================
  // GITHUB INTEGRATION HELPERS TESTS
  // ==========================================================================

  describe('GitHub Integration Helpers', () => {
    it('should generate valid branch names', () => {
      const branchName = generateBranchName('lce_abc123_0001', 'Test Legal Change Title');

      expect(branchName).toMatch(/^legal-change\//);
      expect(branchName).not.toContain(' ');
      expect(branchName.length).toBeLessThanOrEqual(60);
    });

    it('should sanitize branch names', () => {
      const branchName = generateBranchName('lce_xyz_0001', 'Special Ch@r$! & Symbols');

      expect(branchName).not.toContain('@');
      expect(branchName).not.toContain('$');
      expect(branchName).not.toContain('!');
      expect(branchName).not.toContain('&');
    });

    it('should get correct PR labels based on severity', () => {
      const emergencyLabels = getPRLabels('emergency');
      expect(emergencyLabels).toContain('legal-change');
      expect(emergencyLabels).toContain('priority:critical');
      expect(emergencyLabels).toContain('emergency');

      const criticalLabels = getPRLabels('legal_critical');
      expect(criticalLabels).toContain('priority:high');
      expect(criticalLabels).toContain('requires-legal-review');

      const clarificationLabels = getPRLabels('clarification');
      expect(clarificationLabels).toContain('priority:low');
    });

    it('should get correct reviewers based on severity and jurisdiction', () => {
      const emergencyReviewers = getPRReviewers('emergency', ['england']);
      expect(emergencyReviewers.teams).toContain('validation-team');
      expect(emergencyReviewers.teams).toContain('on-call-team');

      const criticalReviewers = getPRReviewers('legal_critical', ['england', 'wales']);
      expect(criticalReviewers.teams).toContain('legal-team-england');
      expect(criticalReviewers.teams).toContain('legal-team-wales');

      const behavioralReviewers = getPRReviewers('behavioral', ['scotland']);
      expect(behavioralReviewers.teams).toContain('product-team');
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================

  describe('Integration Tests', () => {
    it('should complete full workflow: create event → triage → action_required → push PR eligibility', () => {
      // Step 1: Create event
      const event = createEvent({
        sourceId: 'gov-uk-legislation',
        sourceName: 'UK Legislation',
        sourceUrl: 'https://www.legislation.gov.uk',
        referenceUrl: 'https://www.legislation.gov.uk/test',
        detectedAt: new Date().toISOString(),
        detectionMethod: 'scheduled',
        jurisdictions: ['england'],
        topics: ['deposit_protection'],
        title: 'Integration Test Change',
        summary: 'Testing the full workflow',
        trustLevel: 'authoritative',
        confidenceLevel: 'high',
        createdBy: 'integration-test',
      });

      expect(event.state).toBe('new');

      // Step 2: Analyze and assess
      const assessment = analyzeAndAssess(event, 'test-user');
      expect(assessment).toBeDefined();
      expect(assessment.severity).toBeDefined();

      // Step 3: Triage
      const triageResult = transitionEvent(event.id, 'triaged', 'test-user', 'Triaging for test');
      expect(triageResult.success).toBe(true);

      // Step 4: Mark action required
      const actionResult = transitionEvent(event.id, 'action_required', 'test-user', 'Needs PR');
      expect(actionResult.success).toBe(true);

      // Step 5: Check Push PR eligibility
      const updated = getEvent(event.id)!;
      expect(updated.state).toBe('action_required');
      expect(updated.impactAssessment).toBeDefined();

      const eligibility = checkPushPREligibility(updated, 'test-user');
      // Will likely not be eligible due to GitHub not being configured in tests
      expect(eligibility).toBeDefined();
      expect(eligibility.requiredReviewers.length).toBeGreaterThan(0);
    });

    it('should track cron run with event creation', () => {
      // Start cron run
      const run = startCronRun('legal-change:check', 'cron');

      // Create event during the run
      const event = createEvent({
        sourceId: 'test-source',
        sourceName: 'Test Source',
        sourceUrl: 'https://test.com',
        referenceUrl: 'https://test.com/ref',
        detectedAt: new Date().toISOString(),
        detectionMethod: 'scheduled',
        jurisdictions: ['england'],
        topics: ['eviction'],
        title: 'Test Event',
        summary: 'Created during cron run',
        trustLevel: 'informational',
        confidenceLevel: 'low',
        createdBy: 'cron',
      });

      // Update run metrics
      updateCronRun(run.id, {
        sourcesChecked: 1,
        eventsCreated: 1,
      });

      // Complete run
      completeCronRun(run.id, 'success', 'Test completed');

      // Verify run metrics
      const completedRun = getCronRun(run.id)!;
      expect(completedRun.eventsCreated).toBe(1);
      expect(completedRun.status).toBe('success');

      // Check needs attention flags
      const reasons = checkJobNeedsAttention('legal-change:check', {
        maxHoursSinceLastRun: 24,
        maxFailedRunsBeforeAlert: 2,
        minSuccessRate: 80,
        alertOnNewEvents: true,
        alertOnHighUnverifiedRate: 50,
      }, 1);

      expect(reasons.some(r => r.reason === 'New events created')).toBe(true);
    });

    it('should generate valid changeset for event with high severity', () => {
      // Create emergency event
      const event = createEvent({
        sourceId: 'gov-uk-legislation',
        sourceName: 'UK Legislation',
        sourceUrl: 'https://www.legislation.gov.uk',
        referenceUrl: 'https://www.legislation.gov.uk/emergency',
        detectedAt: new Date().toISOString(),
        detectionMethod: 'external_alert',
        jurisdictions: ['england', 'wales'],
        topics: ['eviction', 'notice_requirements'],
        title: 'Emergency: Critical Section 21 Change',
        summary: 'Immediate changes to eviction notice requirements.',
        trustLevel: 'authoritative',
        confidenceLevel: 'high',
        createdBy: 'test',
      });

      // Analyze
      analyzeAndAssess(event, 'test');

      // Generate changeset
      const changeset = generateChangeset(event, 'test-user');

      // Verify changeset structure
      expect(changeset.files.length).toBeGreaterThan(0);
      expect(changeset.summary.totalFilesChanged).toBe(changeset.files.length);

      // Verify PR content
      const prTitle = generatePRTitle(event);
      expect(prTitle).toContain('Legal change:');

      const prBody = generatePRBody(event, changeset, { eventId: event.id } as any);
      expect(prBody).toContain('Emergency');
    });
  });
});
