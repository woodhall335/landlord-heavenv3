import type {
  Section13ConditionScenario,
  Section13EvidenceStrengthBand,
  Section13JustificationBand,
} from './types';

export type Section13JustificationFactorId =
  | 'excellent_condition'
  | 'good_condition'
  | 'recent_refurbishment'
  | 'new_kitchen_or_bathroom'
  | 'strong_transport_links'
  | 'desirable_schools_or_amenities'
  | 'parking_or_garage'
  | 'garden_or_outdoor_space'
  | 'good_furnishing'
  | 'energy_efficiency_improvements'
  | 'bills_included'
  | 'five_strong_comparables'
  | 'proposed_within_market_range'
  | 'proposed_above_market_high'
  | 'below_average_condition'
  | 'weak_comparable_evidence';

export interface Section13ConditionScenarioDefinition {
  value: Section13ConditionScenario;
  label: string;
  factor: number;
  copy: string;
}

export interface Section13JustificationFactor {
  id: Section13JustificationFactorId;
  label: string;
  weight: number;
  kind: 'selected' | 'market_check';
}

export interface Section13JustificationAdjustmentFactor {
  id: Section13JustificationFactorId;
  label: string;
  percent: number;
}

export interface Section13RentJustificationInput {
  selectedFactors: string[];
  currentRent: number | null | undefined;
  proposedRent: number | null | undefined;
  marketLow: number | null | undefined;
  marketHigh: number | null | undefined;
  comparableCount: number;
  evidenceStrength: Section13EvidenceStrengthBand | 'Strong' | 'Moderate' | 'Weak' | null | undefined;
  conditionScenario: Section13ConditionScenario;
}

export interface Section13RentJustificationResult {
  selectedFactors: Section13JustificationFactorId[];
  appliedFactors: Section13JustificationFactor[];
  adjustmentFactors: Section13JustificationAdjustmentFactor[];
  score: number;
  band: Section13JustificationBand;
  justificationAdjustmentPercent: number;
  justificationAdjustmentCapped: boolean;
  adjustedMarketLow: number | null;
  adjustedMarketHigh: number | null;
  marketHeadroom: number | null;
  proposedIncrease: number | null;
  evidenceCappedJustifiedIncrease: number | null;
  unexplainedIncrease: number | null;
  summary: string;
}

export const SECTION13_CONDITION_SCENARIOS: Section13ConditionScenarioDefinition[] = [
  {
    value: 'below_average',
    label: 'Below average',
    factor: 0.95,
    copy: 'A tired or poorly presented property usually needs a more cautious rent figure.',
  },
  {
    value: 'average',
    label: 'Average',
    factor: 1,
    copy: 'An average condition property is measured close to the local comparable baseline.',
  },
  {
    value: 'good',
    label: 'Good',
    factor: 1.03,
    copy: 'Good condition can support a modest uplift if the comparables are similar.',
  },
  {
    value: 'excellent',
    label: 'Excellent',
    factor: 1.06,
    copy: 'Excellent condition can justify the top end only where the evidence also supports it.',
  },
];

export const SECTION13_SELECTABLE_JUSTIFICATION_FACTORS: Section13JustificationFactor[] = [
  { id: 'excellent_condition', label: 'Excellent condition', weight: 15, kind: 'selected' },
  { id: 'good_condition', label: 'Good condition', weight: 10, kind: 'selected' },
  { id: 'recent_refurbishment', label: 'Recent refurbishment', weight: 15, kind: 'selected' },
  { id: 'new_kitchen_or_bathroom', label: 'New kitchen or bathroom', weight: 10, kind: 'selected' },
  { id: 'strong_transport_links', label: 'Strong transport links', weight: 8, kind: 'selected' },
  { id: 'desirable_schools_or_amenities', label: 'Desirable school / local amenities', weight: 8, kind: 'selected' },
  { id: 'parking_or_garage', label: 'Parking or garage', weight: 8, kind: 'selected' },
  { id: 'garden_or_outdoor_space', label: 'Garden / outdoor space', weight: 6, kind: 'selected' },
  { id: 'good_furnishing', label: 'Furnished to a good standard', weight: 6, kind: 'selected' },
  { id: 'energy_efficiency_improvements', label: 'Energy efficiency improvements', weight: 6, kind: 'selected' },
  { id: 'bills_included', label: 'Bills included', weight: 5, kind: 'selected' },
];

export const SECTION13_JUSTIFICATION_ADJUSTMENT_CAP_PERCENT = 30;

export const SECTION13_JUSTIFICATION_FACTOR_ADJUSTMENTS: Record<
  Section13JustificationFactorId,
  number
> = {
  excellent_condition: 12,
  good_condition: 7,
  recent_refurbishment: 8,
  new_kitchen_or_bathroom: 6,
  strong_transport_links: 5,
  desirable_schools_or_amenities: 5,
  parking_or_garage: 5,
  garden_or_outdoor_space: 4,
  good_furnishing: 4,
  energy_efficiency_improvements: 4,
  bills_included: 3,
  five_strong_comparables: 0,
  proposed_within_market_range: 0,
  proposed_above_market_high: 0,
  below_average_condition: 0,
  weak_comparable_evidence: 0,
};

export const SECTION13_MARKET_CHECK_FACTORS: Section13JustificationFactor[] = [
  { id: 'five_strong_comparables', label: 'At least 5 strong comparables', weight: 15, kind: 'market_check' },
  { id: 'proposed_within_market_range', label: 'Proposed rent within market range', weight: 15, kind: 'market_check' },
  { id: 'proposed_above_market_high', label: 'Proposed rent above market high', weight: -20, kind: 'market_check' },
  { id: 'below_average_condition', label: 'Below average condition', weight: -15, kind: 'market_check' },
  { id: 'weak_comparable_evidence', label: 'Weak comparable evidence', weight: -20, kind: 'market_check' },
];

const ALL_FACTORS = [...SECTION13_SELECTABLE_JUSTIFICATION_FACTORS, ...SECTION13_MARKET_CHECK_FACTORS];

export function getConditionScenario(value: Section13ConditionScenario | null | undefined) {
  return SECTION13_CONDITION_SCENARIOS.find((item) => item.value === value) || SECTION13_CONDITION_SCENARIOS[1];
}

export function getJustificationBand(score: number): Section13JustificationBand {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 35) return 'Moderate';
  return 'Weak';
}

function normalizeEvidenceStrength(
  value: Section13RentJustificationInput['evidenceStrength']
): Section13EvidenceStrengthBand {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'strong') return 'strong';
  if (normalized === 'moderate') return 'moderate';
  return 'weak';
}

function roundMoney(value: number | null): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return Number(value.toFixed(2));
}

function formatMoney(value: number | null): string {
  if (value == null || Number.isNaN(value)) return 'unavailable';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

function getFactor(id: Section13JustificationFactorId): Section13JustificationFactor {
  return ALL_FACTORS.find((item) => item.id === id)!;
}

export function normalizeSection13JustificationFactors(
  factors: string[] | null | undefined
): Section13JustificationFactorId[] {
  const selected = factors?.filter((factor): factor is Section13JustificationFactorId =>
    SECTION13_SELECTABLE_JUSTIFICATION_FACTORS.some((item) => item.id === factor)
  ) || [];
  const unique = [...new Set(selected)];
  if (unique.includes('excellent_condition') && unique.includes('good_condition')) {
    return unique.filter((factor) => factor !== 'good_condition');
  }
  return unique;
}

export function calculateSection13JustificationAdjustment(
  factors: string[] | null | undefined
): {
  selectedFactors: Section13JustificationFactorId[];
  adjustmentFactors: Section13JustificationAdjustmentFactor[];
  percent: number;
  capped: boolean;
} {
  const selectedFactors = normalizeSection13JustificationFactors(factors);
  const adjustmentFactors = selectedFactors
    .map((id) => ({
      id,
      label: getFactor(id).label,
      percent: SECTION13_JUSTIFICATION_FACTOR_ADJUSTMENTS[id] || 0,
    }))
    .filter((factor) => factor.percent > 0);
  const rawPercent = adjustmentFactors.reduce((sum, factor) => sum + factor.percent, 0);
  const percent = Math.min(SECTION13_JUSTIFICATION_ADJUSTMENT_CAP_PERCENT, rawPercent);
  return {
    selectedFactors,
    adjustmentFactors,
    percent,
    capped: rawPercent > percent,
  };
}

function getMarketCheckFactors(input: Section13RentJustificationInput): Section13JustificationFactorId[] {
  const factors: Section13JustificationFactorId[] = [];
  const evidenceStrength = normalizeEvidenceStrength(input.evidenceStrength);
  const proposedRent = input.proposedRent == null ? null : Number(input.proposedRent);
  const marketLow = input.marketLow == null ? null : Number(input.marketLow);
  const marketHigh = input.marketHigh == null ? null : Number(input.marketHigh);

  if (input.comparableCount >= 5 && evidenceStrength === 'strong') {
    factors.push('five_strong_comparables');
  }

  if (
    proposedRent != null &&
    marketLow != null &&
    marketHigh != null &&
    proposedRent >= marketLow &&
    proposedRent <= marketHigh
  ) {
    factors.push('proposed_within_market_range');
  }

  if (proposedRent != null && marketHigh != null && proposedRent > marketHigh) {
    factors.push('proposed_above_market_high');
  }

  if (input.conditionScenario === 'below_average') {
    factors.push('below_average_condition');
  }

  if (evidenceStrength === 'weak') {
    factors.push('weak_comparable_evidence');
  }

  return factors;
}

export function calculateSection13RentJustification(
  input: Section13RentJustificationInput
): Section13RentJustificationResult {
  const selectedFactors = normalizeSection13JustificationFactors(input.selectedFactors);
  const justificationAdjustment = calculateSection13JustificationAdjustment(selectedFactors);
  const appliedFactorIds = [...new Set([...selectedFactors, ...getMarketCheckFactors(input)])];
  const rawScore = appliedFactorIds.reduce((sum, id) => sum + getFactor(id).weight, 0);
  const score = Math.min(100, Math.max(0, rawScore));
  const band = getJustificationBand(score);
  const currentRent = input.currentRent == null ? null : Number(input.currentRent);
  const proposedRent = input.proposedRent == null ? null : Number(input.proposedRent);
  const marketLow = input.marketLow == null ? null : Number(input.marketLow);
  const marketHigh = input.marketHigh == null ? null : Number(input.marketHigh);
  const adjustmentMultiplier = 1 + justificationAdjustment.percent / 100;
  const adjustedMarketLow = marketLow == null ? null : roundMoney(marketLow * adjustmentMultiplier);
  const adjustedMarketHigh = marketHigh == null ? null : roundMoney(marketHigh * adjustmentMultiplier);
  const marketHeadroom =
    currentRent == null || adjustedMarketHigh == null ? null : roundMoney(adjustedMarketHigh - currentRent);
  const proposedIncrease =
    currentRent == null || proposedRent == null ? null : roundMoney(proposedRent - currentRent);
  const evidenceCappedJustifiedIncrease =
    marketHeadroom == null || marketHeadroom <= 0
      ? marketHeadroom == null
        ? null
        : 0
      : roundMoney(marketHeadroom * (score / 100));
  const unexplainedIncrease =
    proposedIncrease == null || evidenceCappedJustifiedIncrease == null
      ? null
      : roundMoney(proposedIncrease - evidenceCappedJustifiedIncrease);
  const proposedAboveMarketHigh =
    proposedRent != null && adjustedMarketHigh != null && proposedRent > adjustedMarketHigh;

  let summary = `Justification score is ${score}/100 (${band}).`;
  if (justificationAdjustment.percent > 0) {
    summary += ` Selected factors adjust the supportable market range by ${justificationAdjustment.percent}%${justificationAdjustment.capped ? ' after the 30% cap' : ''}.`;
  }
  if (marketHeadroom != null && marketHeadroom <= 0) {
    summary += ' The current evidence does not support an uplift above the current rent.';
  } else if (proposedIncrease != null && proposedIncrease <= 0) {
    summary += ' No uplift justification is needed because the proposed rent is not above the current rent.';
  } else if (
    proposedIncrease != null &&
    evidenceCappedJustifiedIncrease != null &&
    proposedIncrease <= evidenceCappedJustifiedIncrease
  ) {
    summary += ' The proposed uplift is fully explained by the selected factors within the current market evidence.';
  } else if (proposedIncrease != null && evidenceCappedJustifiedIncrease != null) {
    summary += ' Some of the proposed uplift remains outside the supported market position.';
  }

  if (proposedAboveMarketHigh) {
    summary += ' The justification score strengthens the explanation, but the market evidence still shows pricing risk.';
  }

  if (evidenceCappedJustifiedIncrease != null && proposedIncrease != null && proposedIncrease > 0) {
    summary += ` Evidence-capped justified uplift: ${formatMoney(evidenceCappedJustifiedIncrease)} of ${formatMoney(proposedIncrease)}.`;
  }

  return {
    selectedFactors,
    appliedFactors: appliedFactorIds.map(getFactor),
    adjustmentFactors: justificationAdjustment.adjustmentFactors,
    score,
    band,
    justificationAdjustmentPercent: justificationAdjustment.percent,
    justificationAdjustmentCapped: justificationAdjustment.capped,
    adjustedMarketLow,
    adjustedMarketHigh,
    marketHeadroom,
    proposedIncrease,
    evidenceCappedJustifiedIncrease,
    unexplainedIncrease,
    summary,
  };
}
