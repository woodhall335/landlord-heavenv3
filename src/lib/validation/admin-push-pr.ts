/**
 * Admin Push PR Orchestration
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 *
 * Orchestrates the complete Push PR workflow:
 * - Validates governance requirements
 * - Generates changeset
 * - Creates GitHub PR
 * - Updates event state
 * - Logs audit trail
 */

import {
  LegalChangeEvent,
  EventState,
  getEvent,
  updateEvent,
  transitionEvent,
  linkPrToEvent,
} from './legal-change-events';
import {
  GovernanceCheckResult,
  ReviewerRole,
  runGovernanceChecks,
  getRequiredReviewers,
  getReviewerHandles,
  logAuditEntry,
  executeWorkflowAction,
} from './legal-change-workflow';
import { analyzeImpact, ImpactAnalysisResult } from './legal-impact-analyzer';
import {
  generateChangeset,
  generatePRBody,
  generatePRTitle,
  Changeset,
  ChangesetGenerationOptions,
} from './changeset-generator';
import {
  getGitHubConfig,
  isGitHubConfigured,
  createPullRequest,
  generateBranchName,
  getPRLabels,
  getPRReviewers,
  getPRStatus,
  dispatchWorkflow,
  GitHubConfig,
  CreatePRResult,
  PRStatus,
} from './github-integration';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Push PR request options.
 */
export interface PushPRRequest {
  eventId: string;
  actor: string;
  options?: Partial<PushPROptions>;
}

/**
 * Push PR options.
 */
export interface PushPROptions {
  // Generation options
  includeTests: boolean;
  includeMessages: boolean;
  includeDocs: boolean;

  // PR options
  draft: boolean;
  dispatchWorkflow: boolean;
  workflowId: string;

  // Validation
  skipGovernanceCheck: boolean;
  skipValidation: boolean;

  // Dry run
  dryRun: boolean;
}

/**
 * Default Push PR options.
 */
export const DEFAULT_PUSH_PR_OPTIONS: PushPROptions = {
  includeTests: true,
  includeMessages: true,
  includeDocs: true,
  draft: false,
  dispatchWorkflow: false,
  workflowId: 'validation-ci.yml',
  skipGovernanceCheck: false,
  skipValidation: false,
  dryRun: false,
};

/**
 * Push PR result.
 */
export interface PushPRResult {
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  branchName?: string;
  changeset?: Changeset;
  governanceCheck?: GovernanceCheckResult;
  workflowDispatchResult?: { success: boolean; workflowRunUrl?: string };
  error?: string;
  errors?: string[];
  warnings?: string[];
}

/**
 * Push PR eligibility check result.
 */
export interface PushPREligibility {
  eligible: boolean;
  reasons: string[];
  governance: GovernanceCheckResult;
  requiredReviewers: ReviewerRole[];
  reviewerHandles: string[];
}

/**
 * Event with PR info.
 */
export interface EventPRInfo {
  eventId: string;
  prUrl: string | null;
  prNumber: number | null;
  branchName: string | null;
  prStatus: PRStatus | null;
  canPushPR: boolean;
  eligibility: PushPREligibility | null;
}

// ============================================================================
// ELIGIBILITY CHECKS
// ============================================================================

/**
 * Check if an event is eligible for Push PR.
 */
export function checkPushPREligibility(
  event: LegalChangeEvent,
  actor: string
): PushPREligibility {
  const reasons: string[] = [];
  let eligible = true;

  // Check 1: Event must exist
  if (!event) {
    return {
      eligible: false,
      reasons: ['Event not found'],
      governance: { passed: false, checks: [], requiredReviewers: [], warnings: [] },
      requiredReviewers: [],
      reviewerHandles: [],
    };
  }

  // Check 2: Event must be in action_required state
  if (event.state !== 'action_required') {
    eligible = false;
    reasons.push(
      `Event must be in 'action_required' state (current: '${event.state}')`
    );
  }

  // Check 3: Event must have impact assessment
  if (!event.impactAssessment) {
    eligible = false;
    reasons.push('Event must have an impact assessment');
  }

  // Check 4: GitHub must be configured
  if (!isGitHubConfigured()) {
    eligible = false;
    reasons.push('GitHub integration is not configured');
  }

  // Check 5: Event should not already have a PR
  if (event.linkedPrUrls && event.linkedPrUrls.length > 0) {
    reasons.push(
      `Event already has ${event.linkedPrUrls.length} linked PR(s) - creating another PR is allowed but may not be necessary`
    );
  }

  // Run governance checks
  const governance = runGovernanceChecks(event, 'implemented', actor);

  // Check 6: Governance must pass (unless skipped)
  if (!governance.passed) {
    const failedChecks = governance.checks.filter((c) => !c.passed);
    for (const check of failedChecks) {
      reasons.push(`Governance check failed: ${check.message}`);
    }
    eligible = false;
  }

  // Get required reviewers
  const severity = event.impactAssessment?.severity || 'clarification';
  const requiredReviewers = getRequiredReviewers(severity, event.jurisdictions);
  const reviewerHandles = getReviewerHandles(requiredReviewers);

  return {
    eligible,
    reasons,
    governance,
    requiredReviewers,
    reviewerHandles,
  };
}

/**
 * Check if event can have Push PR action.
 */
export function canPushPR(event: LegalChangeEvent, actor: string): boolean {
  const eligibility = checkPushPREligibility(event, actor);
  return eligibility.eligible;
}

// ============================================================================
// PUSH PR WORKFLOW
// ============================================================================

/**
 * Execute the Push PR workflow.
 */
export async function executePushPR(request: PushPRRequest): Promise<PushPRResult> {
  const { eventId, actor, options: requestOptions } = request;
  const options = { ...DEFAULT_PUSH_PR_OPTIONS, ...requestOptions };
  const warnings: string[] = [];

  // Step 1: Get the event
  const event = getEvent(eventId);
  if (!event) {
    return {
      success: false,
      error: `Event not found: ${eventId}`,
    };
  }

  // Step 2: Check eligibility
  const eligibility = checkPushPREligibility(event, actor);
  if (!eligibility.eligible && !options.skipGovernanceCheck) {
    return {
      success: false,
      error: 'Event is not eligible for Push PR',
      errors: eligibility.reasons,
      governanceCheck: eligibility.governance,
    };
  }

  if (!eligibility.eligible && options.skipGovernanceCheck) {
    warnings.push('Governance checks were skipped');
    warnings.push(...eligibility.reasons);
  }

  // Step 3: Get GitHub config
  const githubConfig = getGitHubConfig();
  if (!githubConfig) {
    return {
      success: false,
      error: 'GitHub integration is not configured',
    };
  }

  // Step 4: Generate changeset
  const changeset = generateChangeset(event, actor, {
    includeTests: options.includeTests,
    includeMessages: options.includeMessages,
    includeDocs: options.includeDocs,
  });

  // Step 5: Validate changeset
  if (!changeset.validation.passed && !options.skipValidation) {
    return {
      success: false,
      error: 'Changeset validation failed',
      errors: changeset.validation.errors.map((e) => e.message),
      warnings: changeset.validation.warnings.map((w) => w.message),
      changeset,
    };
  }

  if (!changeset.validation.passed && options.skipValidation) {
    warnings.push('Changeset validation was skipped');
    warnings.push(...changeset.validation.errors.map((e) => e.message));
  }

  warnings.push(...changeset.validation.warnings.map((w) => w.message));

  // Step 6: Check dry run
  if (options.dryRun) {
    return {
      success: true,
      changeset,
      governanceCheck: eligibility.governance,
      warnings,
      branchName: generateBranchName(event.id, event.title),
    };
  }

  // Step 7: Analyze impact for PR content
  const analysis = analyzeImpact(event);

  // Step 8: Generate PR content
  const branchName = generateBranchName(event.id, event.title);
  const prTitle = generatePRTitle(event);
  const prBody = generatePRBody(event, changeset, analysis);
  const labels = getPRLabels(event.impactAssessment?.severity || 'clarification');
  const reviewers = getPRReviewers(
    event.impactAssessment?.severity || 'clarification',
    event.jurisdictions
  );

  // Step 9: Create the PR
  let prResult: CreatePRResult;
  try {
    prResult = await createPullRequest(githubConfig, {
      title: prTitle,
      body: prBody,
      branchName,
      files: changeset.files,
      labels,
      reviewers: reviewers.users,
      teamReviewers: reviewers.teams,
      draft: options.draft,
    });
  } catch (error) {
    return {
      success: false,
      error: `Failed to create PR: ${error instanceof Error ? error.message : 'Unknown error'}`,
      changeset,
      warnings,
    };
  }

  if (!prResult.success) {
    return {
      success: false,
      error: prResult.error || 'Failed to create PR',
      branchName: prResult.branchName,
      changeset,
      warnings,
    };
  }

  // Step 10: Update event with PR info
  linkPrToEvent(eventId, prResult.prUrl!);
  updateEvent(eventId, {
    notes: event.notes
      ? `${event.notes}\n[${new Date().toISOString()}] PR created: ${prResult.prUrl}`
      : `[${new Date().toISOString()}] PR created: ${prResult.prUrl}`,
  });

  // Step 11: Transition event to implemented
  const transitionResult = transitionEvent(
    eventId,
    'implemented',
    actor,
    `PR created: ${prResult.prUrl}`,
    {
      prUrl: prResult.prUrl,
      prNumber: prResult.prNumber,
      branchName,
    }
  );

  if (!transitionResult.success) {
    warnings.push(`Failed to transition event state: ${transitionResult.error}`);
  }

  // Step 12: Log audit entry
  logAuditEntry({
    eventId,
    action: 'create' as any, // Using 'create' for PR creation
    actor,
    details: {
      type: 'push_pr',
      prUrl: prResult.prUrl,
      prNumber: prResult.prNumber,
      branchName,
      filesChanged: changeset.summary.totalFilesChanged,
      rulesUpdated: changeset.summary.rulesUpdated,
      rulesAdded: changeset.summary.rulesAdded,
      testsAdded: changeset.summary.testsAdded,
    },
    previousState: event.state,
    newState: 'implemented',
  });

  // Step 13: Dispatch workflow if requested
  let workflowDispatchResult: { success: boolean; workflowRunUrl?: string } | undefined;
  if (options.dispatchWorkflow && options.workflowId) {
    try {
      workflowDispatchResult = await dispatchWorkflow(githubConfig, {
        workflowId: options.workflowId,
        ref: branchName,
        inputs: {
          event_id: eventId,
          pr_number: prResult.prNumber?.toString() || '',
        },
      });
    } catch (error) {
      warnings.push(
        `Failed to dispatch workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      workflowDispatchResult = { success: false };
    }
  }

  return {
    success: true,
    prUrl: prResult.prUrl,
    prNumber: prResult.prNumber,
    branchName,
    changeset,
    governanceCheck: eligibility.governance,
    workflowDispatchResult,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// ============================================================================
// PR STATUS TRACKING
// ============================================================================

/**
 * Get PR info for an event.
 */
export async function getEventPRInfo(
  eventId: string,
  actor: string
): Promise<EventPRInfo | null> {
  const event = getEvent(eventId);
  if (!event) {
    return null;
  }

  const githubConfig = getGitHubConfig();
  let prStatus: PRStatus | null = null;

  // Get PR status if we have a linked PR and GitHub is configured
  if (event.linkedPrUrls && event.linkedPrUrls.length > 0 && githubConfig) {
    // Extract PR number from the last linked URL
    const lastPrUrl = event.linkedPrUrls[event.linkedPrUrls.length - 1];
    const prNumberMatch = lastPrUrl.match(/\/pull\/(\d+)/);

    if (prNumberMatch) {
      const prNumber = parseInt(prNumberMatch[1], 10);
      try {
        prStatus = await getPRStatus(githubConfig, prNumber);
      } catch (error) {
        console.error(`Failed to get PR status for PR #${prNumber}:`, error);
      }
    }
  }

  // Check eligibility
  const canPush = event.state === 'action_required';
  const eligibility = canPush ? checkPushPREligibility(event, actor) : null;

  return {
    eventId,
    prUrl: event.linkedPrUrls?.[event.linkedPrUrls.length - 1] || null,
    prNumber: prStatus?.number || null,
    branchName: null, // Would need to store this on the event
    prStatus,
    canPushPR: canPush,
    eligibility,
  };
}

/**
 * Refresh PR status for an event.
 */
export async function refreshPRStatus(eventId: string): Promise<PRStatus | null> {
  const event = getEvent(eventId);
  if (!event || !event.linkedPrUrls || event.linkedPrUrls.length === 0) {
    return null;
  }

  const githubConfig = getGitHubConfig();
  if (!githubConfig) {
    return null;
  }

  // Get PR number from the last linked URL
  const lastPrUrl = event.linkedPrUrls[event.linkedPrUrls.length - 1];
  const prNumberMatch = lastPrUrl.match(/\/pull\/(\d+)/);

  if (!prNumberMatch) {
    return null;
  }

  const prNumber = parseInt(prNumberMatch[1], 10);
  return getPRStatus(githubConfig, prNumber);
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Get all events eligible for Push PR.
 */
export function getEventsEligibleForPushPR(actor: string): LegalChangeEvent[] {
  // Import locally to avoid circular dependency
  const { listEvents } = require('./legal-change-events');

  const actionRequiredEvents = listEvents({ states: ['action_required'] });

  return actionRequiredEvents.filter((event: LegalChangeEvent) => {
    const eligibility = checkPushPREligibility(event, actor);
    return eligibility.eligible;
  });
}

/**
 * Get Push PR dashboard data.
 */
export function getPushPRDashboard(actor: string): {
  totalActionRequired: number;
  eligibleForPushPR: number;
  pendingGovernance: number;
  recentPRs: Array<{
    eventId: string;
    title: string;
    prUrl: string;
    createdAt: string;
  }>;
} {
  // Import locally to avoid circular dependency
  const { listEvents, getEvent } = require('./legal-change-events');

  const actionRequiredEvents = listEvents({ states: ['action_required'] });
  const implementedEvents = listEvents({ states: ['implemented'] });

  let eligibleCount = 0;
  let pendingGovernanceCount = 0;

  for (const event of actionRequiredEvents) {
    const eligibility = checkPushPREligibility(event, actor);
    if (eligibility.eligible) {
      eligibleCount++;
    } else if (!eligibility.governance.passed) {
      pendingGovernanceCount++;
    }
  }

  // Get recent PRs from implemented events
  const recentPRs = implementedEvents
    .filter((e: LegalChangeEvent) => e.linkedPrUrls && e.linkedPrUrls.length > 0)
    .slice(0, 5)
    .map((e: LegalChangeEvent) => ({
      eventId: e.id,
      title: e.title,
      prUrl: e.linkedPrUrls![e.linkedPrUrls!.length - 1],
      createdAt: e.updatedAt,
    }));

  return {
    totalActionRequired: actionRequiredEvents.length,
    eligibleForPushPR: eligibleCount,
    pendingGovernance: pendingGovernanceCount,
    recentPRs,
  };
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export {
  getGitHubConfig,
  isGitHubConfigured,
  generateBranchName,
  getPRLabels,
  getPRReviewers,
} from './github-integration';

export { generateChangeset, generatePRBody, generatePRTitle } from './changeset-generator';
