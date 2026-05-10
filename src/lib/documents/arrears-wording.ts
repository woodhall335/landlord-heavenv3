const WHOLE_NUMBER_EPSILON = 0.000001;
const GROUND_8_NARROW_MARGIN_RATIO = 3.2 / 3;

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function isWholeRentPeriodEquivalent(value: unknown): boolean {
  const numeric = toFiniteNumber(value);
  if (numeric <= 0) return false;
  return Math.abs(numeric - Math.round(numeric)) < WHOLE_NUMBER_EPSILON;
}

export function formatOneDecimalMaximum(value: unknown): string {
  const numeric = toFiniteNumber(value);
  const rounded = Math.round((numeric + Number.EPSILON) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatArrearsPeriodEquivalent(
  value: unknown,
  options: { wholeAsCompletePeriods?: boolean } = {}
): string {
  const numeric = toFiniteNumber(value);
  if (numeric <= 0) return '';

  if (isWholeRentPeriodEquivalent(numeric)) {
    const whole = Math.round(numeric);
    if (options.wholeAsCompletePeriods) {
      return `${whole} complete rental period${whole === 1 ? '' : 's'}`;
    }
    return whole === 1 ? "1 month's rent" : `${whole} months' rent`;
  }

  return `approximately ${formatOneDecimalMaximum(numeric)} months' rent`;
}

export type Ground8ThresholdComparison = 'meets' | 'exceeds' | 'below' | 'unknown';

export function describeGround8ThresholdComparison(
  totalArrears: unknown,
  thresholdAmount: unknown
): Ground8ThresholdComparison {
  const total = toFiniteNumber(totalArrears);
  const threshold = toFiniteNumber(thresholdAmount);

  if (total <= 0 || threshold <= 0) return 'unknown';
  if (total + 0.005 < threshold) return 'below';
  if (Math.abs(total - threshold) <= 0.005) return 'meets';
  if (total <= threshold * GROUND_8_NARROW_MARGIN_RATIO) return 'meets';
  return 'exceeds';
}
