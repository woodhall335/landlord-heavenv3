import { describe, expect, it } from 'vitest';
import type { DecisionOutput } from '@/lib/decision-engine';
import {
  augmentDecisionOutputWithRouteScope,
  getSelectedRouteBlockingIssues,
} from '@/lib/decision-engine/routeScopedBlockingIssues';

function buildDecisionOutput(blockingIssues: DecisionOutput['blocking_issues']): DecisionOutput {
  return {
    recommended_routes: ['section_8'],
    allowed_routes: ['section_8'],
    blocked_routes: ['section_21'],
    recommended_grounds: [],
    notice_period_suggestions: {},
    pre_action_requirements: {
      required: false,
      met: null,
      details: [],
    },
    blocking_issues: blockingIssues,
    warnings: [],
    analysis_summary: 'Test output',
    route_explanations: {},
  };
}

function getReviewRouteLabel(recommendedRoute: string, jurisdiction: string): string {
  if (recommendedRoute === 'section_8') {
    return jurisdiction === 'england' ? 'FORM 3A POSSESSION ROUTE' : 'SECTION 8 (Fault-based)';
  }

  if (recommendedRoute === 'section_21') {
    return 'SECTION 21 (No-fault)';
  }

  return recommendedRoute.toUpperCase().replace(/_/g, ' ');
}

describe('Form 3A review route scoping', () => {
  it('notice_only review stays purchasable when only Section 21 is blocked', () => {
    const decisionOutput = buildDecisionOutput([
      {
        route: 'section_21',
        issue: 'section_21_abolished',
        description:
          'Section 21 notices and accelerated possession are not available for England private-rented possession claims on or after 1 May 2026.',
        action_required: 'Use Form 3A and proceed through the standard possession route.',
        severity: 'blocking',
      },
    ]);

    const scoped = augmentDecisionOutputWithRouteScope(decisionOutput, 'section_8');
    const blockingIssues = getSelectedRouteBlockingIssues(scoped, 'section_8');
    const hasBlockingIssues = blockingIssues.length > 0;
    const buttonDisabled = hasBlockingIssues || false || false;

    expect(getReviewRouteLabel('section_8', 'england')).toBe('FORM 3A POSSESSION ROUTE');
    expect(blockingIssues).toEqual([]);
    expect(buttonDisabled).toBe(false);
    expect(
      blockingIssues.some((issue) => issue.description.includes('Section 21 notices and accelerated possession')),
    ).toBe(false);
  });

  it('complete_pack review stays purchasable when only Section 21 is blocked', () => {
    const decisionOutput = buildDecisionOutput([
      {
        route: 'section_21',
        issue: 'section_21_abolished',
        description:
          'Section 21 notices and accelerated possession are not available for England private-rented possession claims on or after 1 May 2026.',
        action_required: 'Use Form 3A and proceed through the standard possession route.',
        severity: 'blocking',
      },
    ]);

    const scoped = augmentDecisionOutputWithRouteScope(decisionOutput, 'section_8');
    const blockingIssues = getSelectedRouteBlockingIssues(scoped, 'section_8');
    const hasBlockingIssues = blockingIssues.length > 0;
    const includesArrearsGrounds = false;
    const arrearsEvidenceComplete = true;
    const buttonDisabled =
      hasBlockingIssues || (includesArrearsGrounds && !arrearsEvidenceComplete) || false || false;

    expect(blockingIssues).toEqual([]);
    expect(buttonDisabled).toBe(false);
  });

  it('review still blocks when Form 3A has a real grounds blocker', () => {
    const decisionOutput = buildDecisionOutput([
      {
        route: 'section_8',
        issue: 'grounds_required',
        description: 'No possession grounds selected yet. Form 3A requires at least one valid ground.',
        action_required: 'Select at least one valid Section 8 ground before proceeding.',
        severity: 'blocking',
      },
    ]);

    const scoped = augmentDecisionOutputWithRouteScope(decisionOutput, 'section_8');
    const blockingIssues = getSelectedRouteBlockingIssues(scoped, 'section_8');
    const hasBlockingIssues = blockingIssues.length > 0;

    expect(blockingIssues).toHaveLength(1);
    expect(blockingIssues[0].issue).toBe('grounds_required');
    expect(hasBlockingIssues).toBe(true);
  });
});
