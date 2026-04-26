type RiskSource = Record<string, any>;

export function getDefenceRiskValue<T = unknown>(source: RiskSource | null | undefined, key: string): T | undefined {
  if (!source) return undefined;
  const direct = source[key];
  if (direct !== undefined && direct !== null) return direct as T;

  const nestedRisk = source.risk;
  if (nestedRisk && typeof nestedRisk === 'object') {
    const nested = nestedRisk[key];
    if (nested !== undefined && nested !== null) return nested as T;
  }

  return undefined;
}

export function normalizeDefenceRiskList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|;/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

export function stringifyDefenceRiskList(value: unknown): string {
  return normalizeDefenceRiskList(value).join('\n');
}

export function mergeDefenceRiskUpdate(
  source: RiskSource | null | undefined,
  patch: Record<string, any>,
  topLevelKeys: string[] = Object.keys(patch),
): Record<string, any> {
  const topLevelPatch = topLevelKeys.reduce<Record<string, any>>((acc, key) => {
    acc[key] = patch[key];
    return acc;
  }, {});

  return {
    ...topLevelPatch,
    risk: {
      ...((source?.risk as Record<string, any> | undefined) || {}),
      ...patch,
    },
  };
}

interface DefenceRiskCompletionOptions {
  requireArrearsContext?: boolean;
}

export function hasCompleteDefenceRiskAnswers(
  source: RiskSource | null | undefined,
  options: DefenceRiskCompletionOptions = {},
): boolean {
  const tenantDisputesClaim = getDefenceRiskValue<boolean | null>(source, 'tenant_disputes_claim');
  const knownTenantDefences = String(getDefenceRiskValue(source, 'known_tenant_defences') || '').trim();

  const disrepairComplaints = getDefenceRiskValue<boolean | null>(source, 'disrepair_complaints');
  const disrepairIssues = String(getDefenceRiskValue(source, 'disrepair_issues_list') || '').trim();

  const previousCourtProceedings = getDefenceRiskValue<boolean | null>(source, 'previous_court_proceedings');
  const previousProceedingsDetails = String(getDefenceRiskValue(source, 'previous_proceedings_details') || '').trim();

  const tenantVulnerability = getDefenceRiskValue<boolean | null>(source, 'tenant_vulnerability');
  const tenantVulnerabilityDetails = String(getDefenceRiskValue(source, 'tenant_vulnerability_details') || '').trim();

  const tenantCounterclaimLikely = getDefenceRiskValue<boolean | null>(source, 'tenant_counterclaim_likely');
  const counterclaimGrounds = normalizeDefenceRiskList(getDefenceRiskValue(source, 'counterclaim_grounds'));

  const paymentPlanOffered = getDefenceRiskValue<boolean | null>(source, 'payment_plan_offered');
  const paymentPlanResponse = String(getDefenceRiskValue(source, 'payment_plan_response') || '').trim();

  return (
    tenantDisputesClaim !== undefined &&
    (!tenantDisputesClaim || knownTenantDefences.length > 0) &&
    disrepairComplaints !== undefined &&
    (!disrepairComplaints || disrepairIssues.length > 0) &&
    previousCourtProceedings !== undefined &&
    (!previousCourtProceedings || previousProceedingsDetails.length > 0) &&
    tenantVulnerability !== undefined &&
    (!tenantVulnerability || tenantVulnerabilityDetails.length > 0) &&
    tenantCounterclaimLikely !== undefined &&
    (!tenantCounterclaimLikely || counterclaimGrounds.length > 0) &&
    (!options.requireArrearsContext ||
      (paymentPlanOffered !== undefined && (!paymentPlanOffered || paymentPlanResponse.length > 0)))
  );
}
