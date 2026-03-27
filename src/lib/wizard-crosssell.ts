import { hasArrearsGround } from '@/lib/grounds/notice-period-utils';
import { PRODUCTS, type ProductSku } from '@/lib/pricing/products';

export interface WizardAddOnRecommendation {
  sku: ProductSku;
  label: string;
  description: string;
  displayPrice: string;
  reason: string;
}

const ELIGIBLE_EVICTION_PRODUCTS = new Set<ProductSku>([
  'notice_only',
  'complete_pack',
]);

const ARREARS_TEXT_MARKERS = [
  'ground_8',
  'ground_10',
  'ground_11',
  'rent_arrears',
  'arrears',
];

function extractGroundCodes(value: unknown): Array<string | number> {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (typeof entry === 'string' || typeof entry === 'number') {
      return [entry];
    }

    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>;
      return [
        record.code,
        record.ground,
        record.ground_code,
        record.id,
      ].filter((item): item is string | number =>
        typeof item === 'string' || typeof item === 'number'
      );
    }

    return [];
  });
}

function hasArrearsTextMarker(value: unknown): boolean {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return ARREARS_TEXT_MARKERS.some((marker) => normalized.includes(marker));
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasArrearsTextMarker(item));
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some((item) => hasArrearsTextMarker(item));
  }

  return false;
}

export function caseHasArrearsSignals(collectedFacts: Record<string, unknown> = {}): boolean {
  const caseFacts = collectedFacts as Record<string, unknown>;
  const selectedGrounds = extractGroundCodes(caseFacts.section8_grounds);
  const recommendedGrounds = extractGroundCodes(caseFacts.recommended_grounds);
  const routeRecommendation = caseFacts.route_recommendation as
    | Record<string, unknown>
    | undefined;
  const issueMap = caseFacts.issues as Record<string, unknown> | undefined;
  const rentArrearsIssue = (issueMap?.rent_arrears ?? null) as Record<string, unknown> | null;
  const routeGrounds = extractGroundCodes(routeRecommendation?.recommended_grounds);

  if (hasArrearsGround([...selectedGrounds, ...recommendedGrounds, ...routeGrounds])) {
    return true;
  }

  const arrearsItems =
    (Array.isArray(caseFacts.arrears_items) && caseFacts.arrears_items.length > 0) ||
    (Array.isArray(rentArrearsIssue?.['arrears_items']) &&
      (rentArrearsIssue['arrears_items'] as unknown[]).length > 0);

  if (arrearsItems) {
    return true;
  }

  return hasArrearsTextMarker({
    issues: caseFacts.issues,
    selected_reason: caseFacts.selected_reason,
    selected_reasons: caseFacts.selected_reasons,
    eviction_reason: caseFacts.eviction_reason,
    unpaid: caseFacts.unpaid,
  });
}

export function isMoneyClaimAddOnEligible({
  productFlow,
  jurisdiction,
  caseType,
  collectedFacts,
}: {
  productFlow: string;
  jurisdiction?: string | null;
  caseType?: string | null;
  collectedFacts?: Record<string, unknown> | null;
}): boolean {
  if (!ELIGIBLE_EVICTION_PRODUCTS.has(productFlow as ProductSku)) {
    return false;
  }

  if (jurisdiction !== 'england') {
    return false;
  }

  if (caseType && caseType !== 'eviction') {
    return false;
  }

  return caseHasArrearsSignals(collectedFacts ?? {});
}

export function buildMoneyClaimAddOnRecommendation(): WizardAddOnRecommendation {
  return {
    sku: 'money_claim',
    label: 'Money Claim Pack',
    description: 'Recover unpaid rent as a separate county court money claim.',
    displayPrice: PRODUCTS.money_claim.displayPrice,
    reason:
      'Eviction gets you possession. A money claim helps you recover the arrears at the same time.',
  };
}
