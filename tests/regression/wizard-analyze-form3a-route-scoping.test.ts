import { describe, expect, it } from 'vitest';
import type { DecisionOutput } from '@/lib/decision-engine';
import {
  augmentDecisionOutputWithRouteScope,
  formatBlockingIssueAsRedFlag,
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
    route_explanations: {
      section_8: 'Use Form 3A.',
      section_21: 'Section 21 is not available post-May 2026.',
    },
  };
}

describe('Wizard analyze Form 3A route scoping', () => {
  it('keeps Section 21 abolition out of selected-route blockers for England Form 3A cases', () => {
    const decisionOutput = buildDecisionOutput([
      {
        route: 'section_21',
        issue: 'section_21_abolished',
        description:
          'Section 21 notices and accelerated possession are not available for England private-rented possession claims on or after 1 May 2026.',
        action_required: 'Use Form 3A and proceed through the standard possession route.',
        severity: 'blocking',
      },
      {
        route: 'section_8',
        issue: 'grounds_required',
        description: 'No possession grounds selected yet. Form 3A requires at least one valid ground.',
        action_required: 'Select at least one valid Section 8 ground before proceeding.',
        severity: 'blocking',
      },
    ]);

    const scoped = augmentDecisionOutputWithRouteScope(decisionOutput, 'section_8');

    expect(scoped).not.toBeNull();
    expect(scoped?.selected_route).toBe('section_8');
    expect(scoped?.selected_route_has_blockers).toBe(true);
    expect(scoped?.selected_route_blocking_issues).toHaveLength(1);
    expect(scoped?.selected_route_blocking_issues[0].issue).toBe('grounds_required');
    expect(scoped?.alternative_route_blocking_issues).toHaveLength(1);
    expect(scoped?.alternative_route_blocking_issues[0].issue).toBe('section_21_abolished');
  });

  it('produces clean Form 3A review red flags when only the legacy Section 21 route is blocked', () => {
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
    const redFlags = scoped?.selected_route_blocking_issues.map(formatBlockingIssueAsRedFlag) || [];

    expect(redFlags).toEqual([]);
    expect(scoped?.selected_route_has_blockers).toBe(false);
  });

  it('keeps real Form 3A blockers available for analyze payload and purchase gating', () => {
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
    const redFlags = scoped?.selected_route_blocking_issues.map(formatBlockingIssueAsRedFlag) || [];

    expect(redFlags).toHaveLength(1);
    expect(redFlags[0]).toContain('SECTION_8 BLOCKED');
    expect(redFlags[0]).not.toContain('SECTION_21 BLOCKED');
  });
});
