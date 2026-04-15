import type { BlockingIssue, DecisionOutput } from './index';

export interface RouteScopedBlockingIssues {
  selectedRoute: string | null;
  selectedRouteBlockingIssues: BlockingIssue[];
  alternativeRouteBlockingIssues: BlockingIssue[];
  selectedRouteHasBlockers: boolean;
}

export type RouteScopedDecisionOutput = DecisionOutput & {
  selected_route: string | null;
  selected_route_blocking_issues: BlockingIssue[];
  alternative_route_blocking_issues: BlockingIssue[];
  selected_route_has_blockers: boolean;
};

function normalizeRoute(route: string | null | undefined): string | null {
  if (typeof route !== 'string') {
    return null;
  }

  const trimmed = route.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function isBlockingIssue(issue: BlockingIssue | null | undefined): issue is BlockingIssue {
  return !!issue && issue.severity === 'blocking';
}

function issueAppliesToSelectedRoute(
  issue: BlockingIssue,
  selectedRoute: string | null,
): boolean {
  if (!selectedRoute) {
    return true;
  }

  const issueRoute = normalizeRoute(issue.route);
  return !issueRoute || issueRoute === 'all' || issueRoute === selectedRoute;
}

export function splitBlockingIssuesBySelectedRoute(
  decisionOutput: Pick<DecisionOutput, 'blocking_issues'> | null | undefined,
  selectedRoute: string | null | undefined,
): RouteScopedBlockingIssues {
  const normalizedSelectedRoute = normalizeRoute(selectedRoute);
  const blockingIssues = Array.isArray(decisionOutput?.blocking_issues)
    ? decisionOutput.blocking_issues.filter(isBlockingIssue)
    : [];

  const selectedRouteBlockingIssues = blockingIssues.filter((issue) =>
    issueAppliesToSelectedRoute(issue, normalizedSelectedRoute),
  );
  const alternativeRouteBlockingIssues = blockingIssues.filter(
    (issue) => !issueAppliesToSelectedRoute(issue, normalizedSelectedRoute),
  );

  return {
    selectedRoute: normalizedSelectedRoute,
    selectedRouteBlockingIssues,
    alternativeRouteBlockingIssues,
    selectedRouteHasBlockers: selectedRouteBlockingIssues.length > 0,
  };
}

export function augmentDecisionOutputWithRouteScope(
  decisionOutput: DecisionOutput | null | undefined,
  selectedRoute: string | null | undefined,
): RouteScopedDecisionOutput | null {
  if (!decisionOutput) {
    return null;
  }

  const scopedIssues = splitBlockingIssuesBySelectedRoute(decisionOutput, selectedRoute);

  return {
    ...decisionOutput,
    selected_route: scopedIssues.selectedRoute,
    selected_route_blocking_issues: scopedIssues.selectedRouteBlockingIssues,
    alternative_route_blocking_issues: scopedIssues.alternativeRouteBlockingIssues,
    selected_route_has_blockers: scopedIssues.selectedRouteHasBlockers,
  };
}

export function getSelectedRouteBlockingIssues(
  decisionOutput: Partial<RouteScopedDecisionOutput> | null | undefined,
  fallbackSelectedRoute?: string | null,
): BlockingIssue[] {
  if (Array.isArray(decisionOutput?.selected_route_blocking_issues)) {
    return decisionOutput.selected_route_blocking_issues.filter(isBlockingIssue);
  }

  const scopedIssues = splitBlockingIssuesBySelectedRoute(
    decisionOutput as Pick<DecisionOutput, 'blocking_issues'> | null | undefined,
    decisionOutput?.selected_route ?? fallbackSelectedRoute,
  );

  return scopedIssues.selectedRouteBlockingIssues;
}

export function formatBlockingIssueAsRedFlag(issue: BlockingIssue): string {
  return `${issue.route.toUpperCase()} BLOCKED: ${issue.description} - ${issue.action_required}`;
}
