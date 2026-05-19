import type {
  Section13Comparable,
  Section13ComparableAssessment,
  Section13ComparableFreshnessBand,
  Section13ComparableRelevanceBand,
  Section13EvidenceStrengthBand,
  Section13MarketCalculation,
  Section13State,
} from './types';
import { getReliableComparableDistanceMiles } from './comparable-distance';

const DAY_MS = 24 * 60 * 60 * 1000;
const PRIMARY_FRESHNESS_DAYS = 90;
const EXTENDED_FRESHNESS_DAYS = 180;

function percentile(sortedValues: number[], quantile: number): number | null {
  if (sortedValues.length === 0) return null;
  if (sortedValues.length === 1) return sortedValues[0];
  const position = (sortedValues.length - 1) * quantile;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sortedValues[lower];
  const weight = position - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

function toUtcDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function normalizePropertyType(value: string | null | undefined): 'flat' | 'house' | 'room' | 'hmo' | 'other' | 'unknown' {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'unknown';
  if (normalized.includes('hmo')) return 'hmo';
  if (normalized.includes('room') || normalized.includes('lodger')) return 'room';
  if (
    normalized.includes('flat') ||
    normalized.includes('apartment') ||
    normalized.includes('studio') ||
    normalized.includes('maisonette')
  ) {
    return 'flat';
  }
  if (
    normalized.includes('house') ||
    normalized.includes('terrace') ||
    normalized.includes('semi') ||
    normalized.includes('detached') ||
    normalized.includes('bungalow') ||
    normalized.includes('cottage')
  ) {
    return 'house';
  }

  return 'other';
}

function readComparableFurnishedStatus(comparable: Section13Comparable): string | null {
  const direct =
    comparable.metadata?.furnishedStatus ||
    comparable.metadata?.furnishingStatus ||
    comparable.metadata?.furnished;

  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim().toLowerCase();
  }

  const title = [
    comparable.addressSnippet,
    comparable.propertyType,
    typeof comparable.metadata?.listingTitle === 'string' ? comparable.metadata.listingTitle : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (title.includes('fully furnished')) return 'furnished';
  if (title.includes('part furnished')) return 'part_furnished';
  if (title.includes('unfurnished')) return 'unfurnished';
  return null;
}

function getFreshnessDays(comparable: Section13Comparable, now: Date): number | null {
  if (comparable.sourceDateKind !== 'published' && comparable.sourceDateKind !== 'first_listed') {
    return null;
  }

  const sourceDate = toUtcDate(comparable.sourceDateValue || null);
  if (!sourceDate) return null;
  return Math.max(0, Math.round((now.getTime() - sourceDate.getTime()) / DAY_MS));
}

function getFreshnessBand(days: number | null): Section13ComparableFreshnessBand {
  if (days == null) return 'stale';
  if (days <= PRIMARY_FRESHNESS_DAYS) return 'fresh_90';
  if (days <= EXTENDED_FRESHNESS_DAYS) return 'extended_180';
  return 'stale';
}

function getFreshnessLabel(days: number | null, band: Section13ComparableFreshnessBand): string {
  if (days == null) return 'No reliable source date';
  if (band === 'fresh_90') return `${days} day${days === 1 ? '' : 's'} old`;
  if (band === 'extended_180') {
    return `${days} days old (included only if recent matches are limited)`;
  }
  return `${days} days old (stale)`;
}

function isSourceBacked(comparable: Section13Comparable): boolean {
  return (
    comparable.source === 'scraped' ||
    comparable.source === 'csv_import' ||
    comparable.source === 'manual_linked'
  );
}

function getComparableUsageOverride(
  comparable: Section13Comparable
): 'auto' | 'used' | 'context' | 'excluded' {
  const value = comparable.metadata?.userUsageOverride;
  return value === 'used' || value === 'context' || value === 'excluded' ? value : 'auto';
}

function getComparableUsageOverrideReason(comparable: Section13Comparable): string | null {
  const value = comparable.metadata?.userUsageReason;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getAdjustmentReason(comparable: Section13Comparable): string {
  if (!comparable.adjustments.length) {
    return 'No adjustment applied';
  }

  return comparable.adjustments
    .map((adjustment) => {
      const delta = adjustment.normalizedMonthlyDelta;
      const sign = delta >= 0 ? '+' : '';
      return `${capitalize(adjustment.category)} ${sign}${delta.toFixed(2)} pcm (${adjustment.reason})`;
    })
    .join('; ');
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '£0';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

interface ProvisionalAssessment {
  comparable: Section13Comparable;
  sourceBacked: boolean;
  freshnessDays: number | null;
  freshnessBand: Section13ComparableFreshnessBand;
  bedroomDifference: number | null;
  propertyTypeMismatch: boolean;
  severePropertyTypeMismatch: boolean;
  furnishedMismatch: boolean;
  billsIncludedMismatch: boolean;
  distanceMiles: number | null;
  initialRelevanceBand: Section13ComparableRelevanceBand;
  reasonParts: string[];
}

function buildProvisionalAssessment(
  state: Section13State,
  comparable: Section13Comparable,
  now: Date
): ProvisionalAssessment {
  const subjectBedrooms = state.tenancy.bedrooms ?? null;
  const subjectType = normalizePropertyType(
    state.comparablesMeta.propertyType ||
      (typeof comparable.metadata?.subjectPropertyType === 'string'
        ? comparable.metadata.subjectPropertyType
        : null)
  );
  const comparableType = normalizePropertyType(comparable.propertyType);
  const freshnessDays = getFreshnessDays(comparable, now);
  const freshnessBand = getFreshnessBand(freshnessDays);
  const sourceBacked = isSourceBacked(comparable);
  const bedroomDifference =
    subjectBedrooms == null || comparable.bedrooms == null
      ? null
      : Math.abs(subjectBedrooms - comparable.bedrooms);
  const severePropertyTypeMismatch =
    subjectType !== 'unknown' &&
    comparableType !== 'unknown' &&
    ((subjectType === 'room' && comparableType !== 'room') ||
      (comparableType === 'room' && subjectType !== 'room') ||
      (subjectType === 'hmo' && comparableType !== 'hmo') ||
      (comparableType === 'hmo' && subjectType !== 'hmo'));
  const propertyTypeMismatch =
    !severePropertyTypeMismatch &&
    subjectType !== 'unknown' &&
    comparableType !== 'unknown' &&
    subjectType !== comparableType;
  const comparableFurnished = readComparableFurnishedStatus(comparable);
  const subjectFurnished =
    typeof comparable.metadata?.subjectFurnishedStatus === 'string'
      ? String(comparable.metadata.subjectFurnishedStatus).trim().toLowerCase()
      : null;
  const furnishedMismatch =
    Boolean(subjectFurnished && comparableFurnished && subjectFurnished !== comparableFurnished);
  const billsIncludedMismatch =
    Boolean(
      typeof comparable.metadata?.allInclusive === 'boolean' &&
        comparable.metadata.allInclusive !== undefined &&
        comparable.metadata.allInclusive !== null &&
        Boolean(comparable.metadata.allInclusive) !== Boolean(comparable.metadata?.subjectBillsIncluded)
    );
  const reasonParts: string[] = [];
  const distanceMiles = getReliableComparableDistanceMiles(comparable);

  if (freshnessBand === 'extended_180') {
    reasonParts.push('Older comparable inside the 180-day fallback window.');
  } else if (freshnessBand === 'stale') {
    reasonParts.push('Older than 180 days or missing a reliable source date.');
  }

  if (bedroomDifference === 1) {
    reasonParts.push('One-bedroom difference from the subject property.');
  } else if (bedroomDifference != null && bedroomDifference >= 2) {
    reasonParts.push('Bedroom count differs materially from the subject property.');
  }

  if (severePropertyTypeMismatch) {
    reasonParts.push('Property type differs materially from the subject property.');
  } else if (propertyTypeMismatch) {
    reasonParts.push('Property type is close but not identical to the subject property.');
  }

  if (distanceMiles != null && distanceMiles > 3 && distanceMiles <= 5) {
    reasonParts.push('Farther away than the main comparable cluster.');
  } else if (distanceMiles != null && distanceMiles > 5) {
    reasonParts.push('Materially farther away than the main comparable cluster.');
  }

  if (furnishedMismatch) {
    reasonParts.push('Furnishing status differs from the subject property.');
  }

  if (billsIncludedMismatch) {
    reasonParts.push('All-inclusive / bills-included position differs.');
  }

  let initialRelevanceBand: Section13ComparableRelevanceBand = 'context_only';

  if (
    freshnessBand === 'stale' ||
    (bedroomDifference != null && bedroomDifference >= 3) ||
    severePropertyTypeMismatch ||
    (distanceMiles != null && distanceMiles > 5)
  ) {
    initialRelevanceBand = 'outlier';
  } else if (
    freshnessBand === 'fresh_90' &&
    (bedroomDifference == null || bedroomDifference === 0) &&
    !propertyTypeMismatch &&
    distanceMiles != null &&
    distanceMiles <= 1.5 &&
    !furnishedMismatch &&
    !billsIncludedMismatch
  ) {
    initialRelevanceBand = 'strong_match';
  } else if (
    (bedroomDifference == null || bedroomDifference <= 1) &&
    !severePropertyTypeMismatch &&
    (distanceMiles == null || distanceMiles <= 3)
  ) {
    initialRelevanceBand = 'partial_match';
  }

  return {
    comparable,
    sourceBacked,
    freshnessDays,
    freshnessBand,
    bedroomDifference,
    propertyTypeMismatch,
    severePropertyTypeMismatch,
    furnishedMismatch,
    billsIncludedMismatch,
    distanceMiles,
    initialRelevanceBand,
    reasonParts,
  };
}

function buildMedian(values: number[]): number | null {
  const sorted = [...values].sort((a, b) => a - b);
  return percentile(sorted, 0.5);
}

function selectUsedComparableIds(
  provisional: ProvisionalAssessment[]
): { usedIds: Set<string>; freshnessWindowUsed: 90 | 180 } {
  const getId = (item: ProvisionalAssessment) =>
    item.comparable.id || `${item.comparable.addressSnippet}|${item.comparable.sortOrder}`;
  const selected = new Set<string>();

  const pushAll = (items: ProvisionalAssessment[]) => {
    items.forEach((item) => selected.add(getId(item)));
  };

  const strongFresh = provisional.filter(
    (item) => item.initialRelevanceBand === 'strong_match' && item.freshnessBand === 'fresh_90'
  );
  pushAll(strongFresh);

  let freshnessWindowUsed: 90 | 180 = 90;

  if (selected.size < 3) {
    freshnessWindowUsed = 180;
    pushAll(
      provisional.filter(
        (item) => item.initialRelevanceBand === 'strong_match' && item.freshnessBand === 'extended_180'
      )
    );
  }

  if (selected.size < 3) {
    pushAll(
      provisional.filter(
        (item) => item.initialRelevanceBand === 'partial_match' && item.freshnessBand === 'fresh_90'
      )
    );
  }

  if (selected.size < 3) {
    freshnessWindowUsed = 180;
    pushAll(
      provisional.filter(
        (item) => item.initialRelevanceBand === 'partial_match' && item.freshnessBand === 'extended_180'
      )
    );
  }

  return { usedIds: selected, freshnessWindowUsed };
}

function buildReasonDetail(
  usageGroup: 'used' | 'context' | 'excluded',
  provisional: ProvisionalAssessment,
  inClusterOutlier: boolean
): string {
  const reasons = [...provisional.reasonParts];
  const usageOverride = getComparableUsageOverride(provisional.comparable);
  const usageOverrideReason = getComparableUsageOverrideReason(provisional.comparable);

  if (usageOverride !== 'auto') {
    const actionLabel =
      usageOverride === 'used'
        ? 'used in the calculation'
        : usageOverride === 'context'
          ? 'kept for context'
          : 'excluded from the calculation';
    reasons.unshift(
      usageOverrideReason
        ? `Landlord marked this listing as ${actionLabel}: ${usageOverrideReason}.`
        : `Landlord marked this listing as ${actionLabel}.`
    );
  }

  if (inClusterOutlier) {
    reasons.push('Rent sits well outside the main comparable cluster.');
  }

  if (usageGroup === 'used') {
    if (provisional.freshnessBand === 'extended_180') {
      reasons.unshift('Included because fewer recent like-for-like matches were available.');
    } else if (provisional.initialRelevanceBand === 'partial_match') {
      reasons.unshift('Included as a partial match because the nearby like-for-like pool was limited.');
    } else {
      reasons.unshift('Included because it is a close like-for-like market match.');
    }
  }

  if (reasons.length === 0) {
    return usageGroup === 'used'
      ? 'Included because it is a close like-for-like market match.'
      : usageGroup === 'context'
        ? 'Shown for context only.'
        : 'Excluded from the market calculation.';
  }

  return reasons.join(' ');
}

function buildAssessment(
  provisional: ProvisionalAssessment,
  usageGroup: 'used' | 'context' | 'excluded',
  inClusterOutlier: boolean
): Section13ComparableAssessment {
  const comparable = provisional.comparable;
  const id = comparable.id || `${comparable.addressSnippet}|${comparable.sortOrder}`;
  const title = comparable.addressSnippet || `Comparable ${comparable.sortOrder + 1}`;
  const adjustmentReason = getAdjustmentReason(comparable);
  const reasonDetail = buildReasonDetail(usageGroup, provisional, inClusterOutlier);
  const reasonLabel =
    usageGroup === 'used'
      ? 'Used in market calculation'
      : usageGroup === 'context'
        ? 'Context only'
        : 'Excluded / outlier';

  return {
    id,
    title,
    addressSnippet: comparable.addressSnippet,
    source: comparable.source,
    sourceDomain: comparable.sourceDomain || null,
    sourceUrl: comparable.sourceUrl || null,
    sourceDateValue: comparable.sourceDateValue || null,
    sourceDateKind: comparable.sourceDateKind,
    bedrooms: comparable.bedrooms ?? null,
    propertyType: comparable.propertyType || null,
    furnishedStatus: readComparableFurnishedStatus(comparable),
    distanceMiles: getReliableComparableDistanceMiles(comparable),
    rentPcmRaw: Number(comparable.monthlyEquivalent.toFixed(2)),
    rentPcmAdjusted: Number(comparable.adjustedMonthlyEquivalent.toFixed(2)),
    freshnessDays: provisional.freshnessDays,
    freshnessBand: provisional.freshnessBand,
    relevanceBand:
      usageGroup === 'used'
        ? provisional.initialRelevanceBand === 'context_only'
          ? 'partial_match'
          : provisional.initialRelevanceBand
        : usageGroup === 'context'
          ? 'context_only'
          : 'outlier',
    usedInCalculation: usageGroup === 'used',
    sourceBacked: provisional.sourceBacked,
    listedDateLabel: comparable.sourceDateValue || null,
    freshnessLabel: getFreshnessLabel(provisional.freshnessDays, provisional.freshnessBand),
    reasonLabel,
    reasonDetail,
    adjustmentReason,
    exclusionReason: usageGroup === 'excluded' ? reasonDetail : null,
    metadata: comparable.metadata || {},
  };
}

function buildExplanationText(calculation: {
  usedComparableCount: number;
  sourceBackedUsedCount: number;
  fresh90UsedCount: number;
  freshnessWindowUsed: 90 | 180;
  adjustmentsApplied: boolean;
}): string[] {
  const lines = [
    `Median calculated from ${calculation.usedComparableCount} comparable listing${
      calculation.usedComparableCount === 1 ? '' : 's'
    } used in the market calculation.`,
    'Listings are filtered for similar bedroom count, property type, distance, and freshness where possible.',
  ];

  if (calculation.adjustmentsApplied) {
    lines.push('Median uses adjusted monthly rents, not raw listing prices.');
  }

  if (calculation.freshnessWindowUsed === 180) {
    lines.push('The calculation extends to 180-day comparables because fewer recent matches were available within 90 days.');
  }

  if (calculation.sourceBackedUsedCount < calculation.usedComparableCount) {
    lines.push('Some included comparables are less strongly sourced than ideal, which softens the evidence strength.');
  }

  if (calculation.fresh90UsedCount < calculation.usedComparableCount) {
    lines.push('Some included comparables are older than 90 days, which softens the evidence strength.');
  }

  return lines;
}

export function buildSection13MarketCalculation(
  state: Section13State,
  comparables: Section13Comparable[],
  now = new Date()
): Section13MarketCalculation {
  const provisional = comparables
    .map((comparable) => buildProvisionalAssessment(state, comparable, now))
    .filter((item) => item.comparable.adjustedMonthlyEquivalent > 0);

  const likeForLikePool = provisional.filter(
    (item) =>
      item.initialRelevanceBand !== 'outlier' &&
      item.freshnessBand !== 'stale' &&
      (item.bedroomDifference == null || item.bedroomDifference <= 1) &&
      !item.severePropertyTypeMismatch &&
      !item.propertyTypeMismatch &&
      (item.distanceMiles == null || item.distanceMiles <= 3)
  );

  const clusterMedian = buildMedian(
    likeForLikePool.map((item) => Number(item.comparable.adjustedMonthlyEquivalent || 0)).filter((value) => value > 0)
  );

  const outlierIds = new Set<string>();
  if (clusterMedian != null && likeForLikePool.length >= 4) {
    likeForLikePool.forEach((item) => {
      const adjusted = item.comparable.adjustedMonthlyEquivalent;
      if (adjusted > clusterMedian * 1.35 || adjusted < clusterMedian * 0.75) {
        outlierIds.add(item.comparable.id || `${item.comparable.addressSnippet}|${item.comparable.sortOrder}`);
      }
    });
  }

  const filtered = provisional.map((item) => {
    const id = item.comparable.id || `${item.comparable.addressSnippet}|${item.comparable.sortOrder}`;
    if (item.initialRelevanceBand !== 'outlier' && outlierIds.has(id)) {
      return {
        ...item,
        initialRelevanceBand: 'outlier' as Section13ComparableRelevanceBand,
      };
    }
    return item;
  });

  const getId = (item: ProvisionalAssessment) =>
    item.comparable.id || `${item.comparable.addressSnippet}|${item.comparable.sortOrder}`;
  const forcedUsedIds = new Set(
    filtered
      .filter((item) => getComparableUsageOverride(item.comparable) === 'used')
      .map((item) => getId(item))
  );
  const forcedContextIds = new Set(
    filtered
      .filter((item) => getComparableUsageOverride(item.comparable) === 'context')
      .map((item) => getId(item))
  );
  const forcedExcludedIds = new Set(
    filtered
      .filter((item) => getComparableUsageOverride(item.comparable) === 'excluded')
      .map((item) => getId(item))
  );
  const selection = selectUsedComparableIds(
    filtered.filter(
      (item) => item.initialRelevanceBand !== 'outlier' && !forcedContextIds.has(getId(item)) && !forcedExcludedIds.has(getId(item))
    )
  );
  forcedUsedIds.forEach((id) => selection.usedIds.add(id));
  const assessments: Section13ComparableAssessment[] = [];
  const usedComparables: Section13ComparableAssessment[] = [];
  const contextComparables: Section13ComparableAssessment[] = [];
  const excludedComparables: Section13ComparableAssessment[] = [];

  filtered.forEach((item) => {
    const id = getId(item);
    const inClusterOutlier = outlierIds.has(id);
    let usageGroup: 'used' | 'context' | 'excluded' = 'context';
    if (forcedExcludedIds.has(id)) {
      usageGroup = 'excluded';
    } else if (forcedContextIds.has(id)) {
      usageGroup = 'context';
    } else if (forcedUsedIds.has(id)) {
      usageGroup = 'used';
    } else if (item.initialRelevanceBand === 'outlier') {
      usageGroup = 'excluded';
    } else if (selection.usedIds.has(id)) {
      usageGroup = 'used';
    }
    const assessment = buildAssessment(item, usageGroup, inClusterOutlier);
    assessments.push(assessment);
    if (usageGroup === 'used') usedComparables.push(assessment);
    else if (usageGroup === 'context') contextComparables.push(assessment);
    else excludedComparables.push(assessment);
  });

  const usedAdjusted = usedComparables
    .map((item) => item.rentPcmAdjusted)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);
  const marketLow = percentile(usedAdjusted, 0.25);
  const marketMedian = percentile(usedAdjusted, 0.5);
  const marketHigh = percentile(usedAdjusted, 0.75);
  const sourceBackedUsedCount = usedComparables.filter((item) => item.sourceBacked).length;
  const fresh90UsedCount = usedComparables.filter((item) => item.freshnessBand === 'fresh_90').length;
  const comparableSimilarityCount = usedComparables.filter(
    (item) => item.relevanceBand === 'strong_match'
  ).length;
  const majoritySourceBacked = usedComparables.length > 0 && sourceBackedUsedCount / usedComparables.length >= 0.5;
  const majorityFresh = usedComparables.length > 0 && fresh90UsedCount / usedComparables.length >= 0.5;
  const majorityCloseMatch =
    usedComparables.length > 0 && comparableSimilarityCount / usedComparables.length >= 0.5;
  const evidenceStrength: Section13EvidenceStrengthBand =
    usedComparables.length >= 6 && majoritySourceBacked && majorityFresh && majorityCloseMatch
      ? 'strong'
      : usedComparables.length >= 3
        ? 'moderate'
        : 'weak';
  const adjustmentsApplied = usedComparables.some((item) => item.rentPcmRaw !== item.rentPcmAdjusted);

  const proposedRentMonthly =
    state.preview?.proposedRentMonthly ??
    (state.proposal.proposedRentAmount == null ? null : Number(state.proposal.proposedRentAmount));
  const aboveRange = proposedRentMonthly != null && marketHigh != null && proposedRentMonthly > marketHigh;
  const aboveMedian = proposedRentMonthly != null && marketMedian != null && proposedRentMonthly > marketMedian;
  const dateWarnings = (state.preview?.validationIssues?.length || 0) > 0;

  let challengeReasonSummary =
    'The proposed rent looks broadly aligned with the market calculation currently available.';

  if (dateWarnings) {
    challengeReasonSummary =
      'Challenge risk is raised by date or notice-validity warnings as well as the market evidence.';
  } else if (state.adjustments.expectTenantChallenge) {
    challengeReasonSummary =
      'Challenge risk is raised because you already expect the tenant to object, so the file should be prepared more defensively.';
  } else if (evidenceStrength === 'strong' && aboveRange) {
    challengeReasonSummary =
      'Evidence strength is strong, but the proposed rent is high compared with the market calculation.';
  } else if (evidenceStrength === 'weak') {
    challengeReasonSummary =
      'Challenge risk is being driven mainly by limited or mixed comparable evidence rather than pricing alone.';
  } else if (aboveRange) {
    challengeReasonSummary =
      'The proposed rent sits above the supported market position and is likely to attract challenge.';
  } else if (aboveMedian) {
    challengeReasonSummary =
      'The proposed rent sits toward the upper end of the supported market position, so explanation and service discipline matter.';
  }

  const saferRangeGuidance =
    proposedRentMonthly != null && marketMedian != null && marketLow != null && proposedRentMonthly > marketMedian
      ? proposedRentMonthly > (marketHigh ?? marketMedian)
        ? `A more supportable rent may be closer to ${formatCurrency(marketLow)}-${formatCurrency(marketMedian)} pcm.`
        : `The strongest evidence currently supports a figure around ${formatCurrency(marketMedian)} pcm.`
      : null;

  const explanationText = buildExplanationText({
    usedComparableCount: usedComparables.length,
    sourceBackedUsedCount,
    fresh90UsedCount,
    freshnessWindowUsed: selection.freshnessWindowUsed,
    adjustmentsApplied,
  });

  return {
    usedComparables,
    contextComparables,
    excludedComparables,
    marketLow: marketLow == null ? null : Number(marketLow.toFixed(2)),
    marketMedian: marketMedian == null ? null : Number(marketMedian.toFixed(2)),
    marketHigh: marketHigh == null ? null : Number(marketHigh.toFixed(2)),
    totalComparableCount: assessments.length,
    usedComparableCount: usedComparables.length,
    sourceBackedUsedCount,
    fresh90UsedCount,
    freshnessWindowUsed: selection.freshnessWindowUsed,
    calculationMethod:
      'Adjusted monthly rents from comparable listings marked as used in the market calculation.',
    explanationText,
    medianExplanation: explanationText[0] || 'Median calculated from the used comparable set.',
    adjustmentsApplied,
    saferRangeGuidance,
    challengeReasonSummary,
    evidenceStrength,
  };
}
