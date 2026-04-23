import type {
  Section13ChallengeLikelihoodBand,
  Section13Comparable,
  Section13EvidenceStrengthBand,
  Section13PlanRecommendation,
  Section13PreviewMetrics,
  Section13RentFrequency,
  Section13State,
} from './types';
import { SECTION13_RULES_VERSION } from './types';

export const SECTION13_CHALLENGE_EXPLAINER =
  'Based on where your proposed rent sits within the adjusted comparable rent range.';
export const SECTION13_EVIDENCE_EXPLAINER =
  'Based on how many comparables you have, how recent they are, and how many are source-backed rather than manual or heavily overridden.';
export const SECTION13_MINIMUM_NOTICE_MONTHS = 2 as const;
export const SECTION13_MINIMUM_INTERVAL_WEEKS = 52 as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

export function addDays(dateString: string, days: number): string {
  const date = toUtcDate(dateString);
  if (!date) return dateString;
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date) || dateString;
}

export function addCalendarMonths(dateString: string, months: number): string {
  const date = toUtcDate(dateString);
  if (!date) return dateString;
  const currentDay = date.getUTCDate();
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(currentDay, lastDay));
  return formatDate(result) || dateString;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

function compareDateStrings(a: string | null | undefined, b: string | null | undefined): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return a.localeCompare(b);
}

function maxDate(values: Array<string | null | undefined>): string | null {
  return values.filter(Boolean).sort((a, b) => compareDateStrings(a, b)).pop() || null;
}

function formatCurrencyValue(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) {
    return 'nil';
  }

  return `£${Number(value).toFixed(2)}`;
}

function describeRentFrequency(frequency: Section13RentFrequency): string {
  switch (frequency) {
    case 'weekly':
      return 'per week';
    case 'fortnightly':
      return 'per fortnight';
    case '4-weekly':
      return 'per four weeks';
    case 'monthly':
    default:
      return 'per month';
  }
}

function endOfMonthDay(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function alignToMonthlyPeriod(minDate: Date, tenancyStart: Date): Date {
  const startDay = tenancyStart.getUTCDate();
  let year = minDate.getUTCFullYear();
  let month = minDate.getUTCMonth();

  for (let i = 0; i < 24; i += 1) {
    const lastDay = endOfMonthDay(year, month);
    const candidate = new Date(Date.UTC(year, month, Math.min(startDay, lastDay)));
    if (candidate.getTime() >= minDate.getTime()) return candidate;
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return minDate;
}

function alignToPeriodCadence(minDate: Date, tenancyStart: Date, cadenceDays: number): Date {
  const diff = daysBetween(tenancyStart, minDate);
  const remainder = ((diff % cadenceDays) + cadenceDays) % cadenceDays;
  if (remainder === 0) return minDate;
  return new Date(minDate.getTime() + (cadenceDays - remainder) * DAY_MS);
}

function getCadenceDays(frequency: Section13RentFrequency): number {
  switch (frequency) {
    case 'weekly':
      return 7;
    case 'fortnightly':
      return 14;
    case '4-weekly':
      return 28;
    case 'monthly':
    default:
      return 0;
  }
}

function getCalendarAnniversary(anchorDate: Date, year: number): Date {
  const month = anchorDate.getUTCMonth();
  const day = Math.min(anchorDate.getUTCDate(), endOfMonthDay(year, month));
  return new Date(Date.UTC(year, month, day));
}

function calculateAntiDriftMinimumWeeks(
  lastIncreaseDate: string,
  firstIncreaseAfter2003Date?: string | null
): 52 | 53 {
  const lastIncrease = toUtcDate(lastIncreaseDate);
  const driftAnchor = toUtcDate(firstIncreaseAfter2003Date || lastIncreaseDate);
  const fiftyTwoWeekDate = toUtcDate(addDays(lastIncreaseDate, 364));

  if (!lastIncrease || !driftAnchor || !fiftyTwoWeekDate) return 52;

  const anniversary = getCalendarAnniversary(driftAnchor, fiftyTwoWeekDate.getUTCFullYear());
  return daysBetween(fiftyTwoWeekDate, anniversary) > 6 ? 53 : 52;
}

export function getMonthlyEquivalent(amount: number | null | undefined, frequency: Section13RentFrequency | 'pcm' | 'ppw'): number {
  const numeric = Number(amount || 0);
  switch (frequency) {
    case 'weekly':
    case 'ppw':
      return (numeric * 52) / 12;
    case 'fortnightly':
      return (numeric * 26) / 12;
    case '4-weekly':
      return (numeric * 13) / 12;
    case 'monthly':
    case 'pcm':
    default:
      return numeric;
  }
}

export function getWeeklyEquivalent(amount: number | null | undefined, frequency: Section13RentFrequency | 'pcm' | 'ppw'): number {
  return (getMonthlyEquivalent(amount, frequency) * 12) / 52;
}

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

export function getSourceBackedComparableCount(comparables: Section13Comparable[]): number {
  return comparables.filter((item) =>
    item.source === 'scraped' || item.source === 'csv_import' || item.source === 'manual_linked'
  ).length;
}

export function isFreshComparable(comparable: Section13Comparable, now = new Date()): boolean {
  if (comparable.sourceDateKind !== 'published' && comparable.sourceDateKind !== 'first_listed') {
    return false;
  }

  const sourceDate = toUtcDate(comparable.sourceDateValue || null);
  if (!sourceDate) return false;
  const ninetyDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 90));
  return sourceDate.getTime() >= ninetyDaysAgo.getTime();
}

export function getEvidenceStrengthBand(comparables: Section13Comparable[], now = new Date()): Section13EvidenceStrengthBand {
  const comparableCount = comparables.length;
  const sourceBackedCount = getSourceBackedComparableCount(comparables);
  const freshCount = comparables.filter((item) => isFreshComparable(item, now)).length;
  const overrideCount = comparables.filter((item) =>
    item.adjustments.some((adjustment) => adjustment.isOverride)
  ).length;

  const sourceBackedRatio = comparableCount > 0 ? sourceBackedCount / comparableCount : 0;
  const freshRatio = comparableCount > 0 ? freshCount / comparableCount : 0;
  const overrideRatio = comparableCount > 0 ? overrideCount / comparableCount : 1;

  if (comparableCount >= 8 && sourceBackedRatio >= 0.7 && freshRatio >= 0.7 && overrideRatio <= 0.3) {
    return 'strong';
  }

  if (comparableCount >= 5 && sourceBackedRatio >= 0.5 && freshRatio >= 0.5 && overrideRatio <= 0.5) {
    return 'moderate';
  }

  return 'weak';
}

export function getChallengeLikelihoodBand(
  proposedRentMonthly: number | null,
  lowerQuartile: number | null,
  median: number | null,
  upperQuartile: number | null
): Section13ChallengeLikelihoodBand {
  if (proposedRentMonthly === null || lowerQuartile === null || median === null || upperQuartile === null) {
    return 'higher_likelihood';
  }
  if (proposedRentMonthly <= lowerQuartile) return 'lower_likelihood';
  if (proposedRentMonthly <= median) return 'moderate_likelihood';
  if (proposedRentMonthly <= upperQuartile) return 'elevated_likelihood';
  return 'higher_likelihood';
}

export function getChallengeBandLabel(band: Section13ChallengeLikelihoodBand): string {
  switch (band) {
    case 'lower_likelihood':
      return 'Lower likelihood of challenge';
    case 'moderate_likelihood':
      return 'Moderate likelihood of challenge';
    case 'elevated_likelihood':
      return 'Elevated likelihood of challenge';
    case 'higher_likelihood':
    default:
      return 'Higher likelihood of challenge';
  }
}

export function getEvidenceBandLabel(band: Section13EvidenceStrengthBand): string {
  switch (band) {
    case 'strong':
      return 'Strong evidence strength';
    case 'moderate':
      return 'Moderate evidence strength';
    case 'weak':
    default:
      return 'Weak evidence strength';
  }
}

export function getSection13PlanRecommendation(
  preview: Pick<
    Section13PreviewMetrics,
    | 'challengeBand'
    | 'challengeBandLabel'
    | 'evidenceBand'
    | 'evidenceBandLabel'
    | 'proposedPositionLabel'
    | 'comparableCount'
  > | null | undefined,
  options?: {
    expectTenantChallenge?: boolean;
    selectedPlan?: 'section13_standard' | 'section13_defensive';
  }
): Section13PlanRecommendation {
  const expectTenantChallenge = Boolean(options?.expectTenantChallenge);

  if (!preview) {
    return {
      recommendedPlan: options?.selectedPlan === 'section13_defensive' ? 'section13_defensive' : 'section13_standard',
      headline: 'Standard is the recommended starting pack',
      reason:
        'Start with the Standard pack unless you already expect a challenge. It covers Form 4A, the justification report, and the service record.',
      upsellMessage:
        'Move up to the Defence Pack if you expect pushback and want the extra challenge-response and tribunal-facing material from the start.',
    };
  }

  if (preview.comparableCount === 0) {
    return {
      recommendedPlan: options?.selectedPlan === 'section13_defensive' ? 'section13_defensive' : 'section13_standard',
      headline: 'Standard is the recommended starting pack',
      reason:
        'Run the local listings check next so we can judge the supportable range properly. Until then, Standard remains the best starting point for Form 4A, the justification report, and the service record.',
      upsellMessage:
        'Move up to the Defence Pack later if the market evidence or the tenant response makes stronger challenge protection worthwhile.',
    };
  }

  const shouldRecommendDefence =
    expectTenantChallenge ||
    preview.challengeBand === 'elevated_likelihood' ||
    preview.challengeBand === 'higher_likelihood' ||
    (preview.evidenceBand === 'weak' && preview.challengeBand !== 'lower_likelihood');

  if (shouldRecommendDefence) {
    return {
      recommendedPlan: 'section13_defensive',
      headline: 'Defence Pack is recommended for this case',
      reason: expectTenantChallenge
        ? 'You expect pushback on the increase, so the Defence Pack adds the response and tribunal-facing material that is most useful when challenge risk is already in view.'
        : preview.evidenceBand === 'weak'
          ? `The proposed rent currently looks ${preview.proposedPositionLabel.toLowerCase()} and your evidence strength is still weak, so the Defence Pack gives you stronger challenge-response and tribunal support.`
          : `${preview.challengeBandLabel} means it is worth preparing the extra challenge-response and tribunal-facing material from the start.`,
      upsellMessage: 'You can still continue with Standard, but Defence is the safer recommendation when challenge risk is higher.',
    };
  }

  return {
    recommendedPlan: 'section13_standard',
    headline: 'Standard is the recommended pack for this case',
    reason:
      'The current position looks supportable enough to start with Form 4A, the justification report, and the service record without paying for the fuller tribunal-facing bundle.',
    upsellMessage:
      'If you still expect pushback, you can upgrade to the Defence Pack for the extra challenge-response and tribunal-facing material.',
  };
}

export function buildSection13DefensibilitySummarySentence(
  state: Pick<Section13State, 'proposal' | 'tenancy'>,
  preview: Pick<
    Section13PreviewMetrics,
    'proposedRentMonthly' | 'median' | 'evidenceBandLabel' | 'sourceBackedCount' | 'freshComparableCount' | 'proposedPositionLabel'
  > | null | undefined
): string {
  if (!preview || preview.proposedRentMonthly == null || preview.median == null) {
    return 'Add a proposed rent and enough recent source-backed comparables to generate a defensibility summary.';
  }

  const relativePosition =
    preview.proposedRentMonthly < preview.median
      ? 'below'
      : preview.proposedRentMonthly > preview.median
        ? 'above'
        : 'aligned with';

  return `Your proposed rent (${formatCurrencyValue(state.proposal.proposedRentAmount)}) sits ${relativePosition} the median comparable rent (${formatCurrencyValue(preview.median)} pcm), with ${preview.evidenceBandLabel.toLowerCase()} based on ${preview.freshComparableCount} recent source-backed comparable${preview.freshComparableCount === 1 ? '' : 's'}.`;
}

export function buildSection13JustificationSummaryText(
  state: Pick<Section13State, 'proposal' | 'tenancy'>,
  preview: Pick<
    Section13PreviewMetrics,
    'proposedRentMonthly' | 'median' | 'challengeBandLabel' | 'evidenceBandLabel'
  > | null | undefined
): string {
  if (!preview || preview.proposedRentMonthly == null || preview.median == null) {
    return 'Comparable data is not yet strong enough to position the proposed rent automatically. Review the comparable evidence and add a manual justification if required.';
  }

  const position =
    preview.proposedRentMonthly < preview.median
      ? 'below'
      : preview.proposedRentMonthly > preview.median
        ? 'above'
        : 'equal to';

  return `The proposed rent of ${formatCurrencyValue(state.proposal.proposedRentAmount)} ${describeRentFrequency(state.tenancy.currentRentFrequency)} is ${position} the adjusted median market rent of ${formatCurrencyValue(preview.median)} per month. Based on the comparables analysed under section 13(4) of the Housing Act 1988 (as amended), the proposed increase is presented as reasonable with a ${preview.challengeBandLabel.toLowerCase()} and ${preview.evidenceBandLabel.toLowerCase()}.`;
}

export function validateSection13StartDate(input: {
  tenancyStartDate?: string | null;
  currentRentFrequency: Section13RentFrequency;
  proposedStartDate?: string | null;
  serviceDate?: string | null;
  lastRentIncreaseDate?: string | null;
  firstIncreaseAfter2003Date?: string | null;
}): {
  earliestValidStartDate: string | null;
  isValid: boolean;
  issues: string[];
} {
  const tenancyStart = toUtcDate(input.tenancyStartDate || null);
  const serviceDate = toUtcDate(input.serviceDate || null);
  const proposedStart = toUtcDate(input.proposedStartDate || null);
  const lastIncreaseDate = toUtcDate(input.lastRentIncreaseDate || null);
  const firstIncreaseAfter2003Date = toUtcDate(input.firstIncreaseAfter2003Date || null);
  const issues: string[] = [];

  if (!tenancyStart) {
    issues.push('Enter the tenancy start date to validate the rent increase date.');
    return { earliestValidStartDate: null, isValid: false, issues };
  }

  if (lastIncreaseDate && lastIncreaseDate.getTime() < tenancyStart.getTime()) {
    issues.push('The last rent increase date cannot be earlier than the tenancy start date.');
  }

  if (
    firstIncreaseAfter2003Date &&
    lastIncreaseDate &&
    firstIncreaseAfter2003Date.getTime() > lastIncreaseDate.getTime()
  ) {
    issues.push('The first rent increase after 11 February 2003 cannot be later than the most recent rent increase date.');
  }

  const serviceFloor = serviceDate
    ? toUtcDate(
        addCalendarMonths(formatDate(serviceDate) || '', SECTION13_MINIMUM_NOTICE_MONTHS)
      )
    : null;
  const cadenceFloor = input.lastRentIncreaseDate
    ? toUtcDate(
        addDays(
          input.lastRentIncreaseDate,
          calculateAntiDriftMinimumWeeks(
            input.lastRentIncreaseDate,
            input.firstIncreaseAfter2003Date
          ) * 7
        )
      )
    : input.firstIncreaseAfter2003Date
      ? toUtcDate(
          addDays(
            input.firstIncreaseAfter2003Date,
            calculateAntiDriftMinimumWeeks(
              input.firstIncreaseAfter2003Date,
              input.firstIncreaseAfter2003Date
            ) * 7
          )
        )
      : toUtcDate(addDays(formatDate(tenancyStart) || '', SECTION13_MINIMUM_INTERVAL_WEEKS * 7));
  const increaseAnchor = input.lastRentIncreaseDate || input.firstIncreaseAfter2003Date || null;

  const statutoryFloor = [serviceFloor, cadenceFloor]
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => a.getTime() - b.getTime())
    .pop() || tenancyStart;

  const cadenceDays = getCadenceDays(input.currentRentFrequency);
  const alignedDate =
    input.currentRentFrequency === 'monthly'
      ? alignToMonthlyPeriod(statutoryFloor, tenancyStart)
      : alignToPeriodCadence(statutoryFloor, tenancyStart, cadenceDays);

  const earliestValidStartDate = formatDate(alignedDate);

  if (!input.serviceDate) {
    issues.push(
      `Enter the date served to apply the minimum ${SECTION13_MINIMUM_NOTICE_MONTHS}-month notice rule.`
    );
  }

  if (proposedStart) {
    if (serviceDate && proposedStart.getTime() <= serviceDate.getTime()) {
      issues.push('The proposed start date must be after the notice is served.');
    }
    if (serviceFloor && proposedStart.getTime() < serviceFloor.getTime()) {
      issues.push(
        `The proposed start date must be at least ${SECTION13_MINIMUM_NOTICE_MONTHS} months after the notice is served.`
      );
    }
    if (cadenceFloor && proposedStart.getTime() < cadenceFloor.getTime()) {
      issues.push(increaseAnchor
        ? 'The proposed start date is too early based on the previous increase and the 52/53-week anti-drift rule.'
        : `The proposed start date must be at least ${SECTION13_MINIMUM_INTERVAL_WEEKS} weeks after the tenancy start date.`);
    }
    if (earliestValidStartDate && formatDate(proposedStart) !== earliestValidStartDate) {
      issues.push('The proposed start date must fall on the first day of a tenancy period.');
    }
  } else {
    issues.push('Enter a proposed start date.');
  }

  return {
    earliestValidStartDate,
    isValid: Boolean(proposedStart && earliestValidStartDate && formatDate(proposedStart) === earliestValidStartDate),
    issues,
  };
}

export function computeSection13Preview(state: Section13State, comparables: Section13Comparable[], now = new Date()): Section13PreviewMetrics {
  const adjustedValues = comparables
    .map((item) => Number(item.adjustedMonthlyEquivalent || 0))
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  const lowerQuartile = percentile(adjustedValues, 0.25);
  const median = percentile(adjustedValues, 0.5);
  const upperQuartile = percentile(adjustedValues, 0.75);
  const proposedRentMonthly = state.proposal.proposedRentAmount == null
    ? null
    : getMonthlyEquivalent(state.proposal.proposedRentAmount, state.tenancy.currentRentFrequency);
  const challengeBand = getChallengeLikelihoodBand(proposedRentMonthly, lowerQuartile, median, upperQuartile);
  const evidenceBand = getEvidenceStrengthBand(comparables, now);
  const sourceBackedCount = getSourceBackedComparableCount(comparables);
  const freshComparableCount = comparables.filter((item) => isFreshComparable(item, now)).length;
  const userOverrideCount = comparables.filter((item) => item.adjustments.some((adjustment) => adjustment.isOverride)).length;
  const dateValidation = validateSection13StartDate({
    tenancyStartDate: state.tenancy.tenancyStartDate,
    currentRentFrequency: state.tenancy.currentRentFrequency,
    proposedStartDate: state.proposal.proposedStartDate,
    serviceDate: state.proposal.serviceDate,
    lastRentIncreaseDate: state.tenancy.lastRentIncreaseDate,
    firstIncreaseAfter2003Date: state.tenancy.firstIncreaseAfter2003Date,
  });

  const canAutoGenerateJustification = comparables.length >= 3 && sourceBackedCount >= 1;
  const warnings: string[] = [];
  const validationIssues = [...dateValidation.issues];
  if (sourceBackedCount === 0) {
    warnings.push('No valid source-backed comparables are available yet. Retry the scrape, upload CSV results, or add linked manual listings.');
  }
  if (!canAutoGenerateJustification) {
    warnings.push('Automatic justification wording is locked until you have at least 3 comparables in total and at least 1 source-backed comparable.');
  }
  if (state.proposal.proposedRentAmount == null || Number.isNaN(Number(state.proposal.proposedRentAmount))) {
    validationIssues.push('Enter the proposed rent amount to assess the increase.');
  } else if (Number(state.proposal.proposedRentAmount) <= 0) {
    validationIssues.push('The proposed rent amount must be greater than zero.');
  } else if (
    state.tenancy.currentRentAmount != null &&
    Number(state.proposal.proposedRentAmount) <= Number(state.tenancy.currentRentAmount)
  ) {
    validationIssues.push('The proposed rent must be higher than the current rent. This wizard is for rent increases only.');
  }

  const previewSummary = comparables.length > 0 && state.comparablesMeta.bedrooms
    ? `${comparables.length} comparable ${state.comparablesMeta.bedrooms}-bed homes within 0.5 miles`
    : comparables.length > 0
      ? `${comparables.length} comparable homes within 0.5 miles`
      : 'No comparables added yet';

  const proposedPositionLabel =
    proposedRentMonthly == null || median == null
      ? 'Add a proposed rent and valid comparables to position the increase.'
      : proposedRentMonthly < median
        ? 'Below the adjusted median market rent'
        : proposedRentMonthly > median
          ? 'Above the adjusted median market rent'
          : 'Aligned with the adjusted median market rent';

  return {
    rulesVersion: state.rulesVersion || SECTION13_RULES_VERSION,
    comparableCount: comparables.length,
    sourceBackedCount,
    freshComparableCount,
    userOverrideCount,
    lowerQuartile: lowerQuartile == null ? null : Number(lowerQuartile.toFixed(2)),
    median: median == null ? null : Number(median.toFixed(2)),
    upperQuartile: upperQuartile == null ? null : Number(upperQuartile.toFixed(2)),
    proposedRentMonthly: proposedRentMonthly == null ? null : Number(proposedRentMonthly.toFixed(2)),
    proposedPositionLabel,
    challengeBand,
    challengeBandLabel: getChallengeBandLabel(challengeBand),
    challengeBandExplainer: SECTION13_CHALLENGE_EXPLAINER,
    evidenceBand,
    evidenceBandLabel: getEvidenceBandLabel(evidenceBand),
    evidenceBandExplainer: SECTION13_EVIDENCE_EXPLAINER,
    previewSummary,
    defensibilitySummarySentence: buildSection13DefensibilitySummarySentence(
      state,
      {
        proposedRentMonthly: proposedRentMonthly == null ? null : Number(proposedRentMonthly.toFixed(2)),
        median: median == null ? null : Number(median.toFixed(2)),
        evidenceBandLabel: getEvidenceBandLabel(evidenceBand),
        sourceBackedCount,
        freshComparableCount,
        proposedPositionLabel,
      }
    ),
    canAutoGenerateJustification,
    earliestValidStartDate: dateValidation.earliestValidStartDate,
    enteredStartDateValid: dateValidation.isValid,
    validationIssues,
    warnings,
  };
}
