/**
 * Wales Section 157 "Serious Rent Arrears" Threshold Calculator
 *
 * Under the Renting Homes (Wales) Act 2016, Section 157, Schedule 8, Ground 8:
 * "Serious rent arrears" means at least 2 months' rent is unpaid (for monthly
 * or longer periods) or at least 8 weeks' rent is unpaid (for weekly periods).
 *
 * This calculator determines whether the statutory threshold is met for a
 * Section 157 serious rent arrears notice.
 *
 * IMPORTANT: This is Wales-specific. Do NOT use England Ground 8 / Housing Act
 * 1988 terminology or logic here.
 */

import type { TenancyFacts } from '@/lib/case-facts/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface WalesThresholdResult {
  /** Whether the statutory threshold is met */
  met: boolean;
  /** The threshold amount in pounds */
  thresholdAmount: number;
  /** Human-readable threshold label (e.g., "2 months' rent" or "8 weeks' rent") */
  thresholdLabel: string;
  /** Explanation of the threshold check result */
  explanation: string;
  /** Whether this is an authoritative assessment */
  isAuthoritative: boolean;
  /** Warning message if assessment could not be made */
  warning?: string;
}

export interface WalesThresholdParams {
  /** The rent frequency */
  rentFrequency: TenancyFacts['rent_frequency'];
  /** The rent amount per period */
  rentAmount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Statutory threshold for Section 157 serious rent arrears.
 *
 * Under Renting Homes (Wales) Act 2016, Schedule 8, Ground 8:
 * - Weekly/fortnightly: 8 weeks' rent
 * - Monthly or longer: 2 months' rent
 */
const SECTION_157_WEEKS_THRESHOLD = 8; // 8 weeks for weekly/fortnightly
const SECTION_157_MONTHS_THRESHOLD = 2; // 2 months for monthly or longer

/**
 * Supported rent frequencies for threshold calculation.
 * Frequencies not in this list cannot be accurately assessed.
 */
const SUPPORTED_FREQUENCIES = ['weekly', 'fortnightly', 'monthly', 'quarterly', 'yearly'];

/**
 * Multipliers to convert rent amount to monthly equivalent.
 */
const FREQUENCY_TO_MONTHLY_MULTIPLIER: Record<string, number> = {
  weekly: 4.33, // ~52 weeks / 12 months
  fortnightly: 2.165, // ~26 fortnights / 12 months
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};

/**
 * Multipliers to convert rent amount to weekly equivalent.
 */
const FREQUENCY_TO_WEEKLY_MULTIPLIER: Record<string, number> = {
  weekly: 1,
  fortnightly: 0.5, // 1 fortnight = 2 weeks
  monthly: 12 / 52, // ~0.231 weeks per month
  quarterly: 4 / 52, // ~0.077 weeks per quarter
  yearly: 1 / 52, // ~0.019 weeks per year
};

// ============================================================================
// THRESHOLD COMPUTATION
// ============================================================================

/**
 * Compute the Wales Section 157 serious arrears threshold.
 *
 * Returns the threshold amount and label based on rent frequency:
 * - Weekly/fortnightly: 8 weeks' rent
 * - Monthly or longer: 2 months' rent
 *
 * @param rentFrequency - The rent payment frequency
 * @param rentAmount - The rent amount per period
 * @returns Threshold amount and human-readable label
 */
export function computeWalesSection157Threshold(
  rentFrequency: TenancyFacts['rent_frequency'],
  rentAmount: number
): { thresholdAmount: number; thresholdLabel: string } {
  const frequency = rentFrequency || 'monthly';

  // For weekly/fortnightly, use 8 weeks threshold
  if (frequency === 'weekly' || frequency === 'fortnightly') {
    const weeklyRent = rentAmount * (FREQUENCY_TO_WEEKLY_MULTIPLIER[frequency] || 1);
    const thresholdAmount = weeklyRent * SECTION_157_WEEKS_THRESHOLD;
    return {
      thresholdAmount,
      thresholdLabel: "8 weeks' rent",
    };
  }

  // For monthly or longer periods, use 2 months threshold
  const monthlyRent = rentAmount * (FREQUENCY_TO_MONTHLY_MULTIPLIER[frequency] || 1);
  const thresholdAmount = monthlyRent * SECTION_157_MONTHS_THRESHOLD;
  return {
    thresholdAmount,
    thresholdLabel: "2 months' rent",
  };
}

/**
 * Check if the Wales Section 157 serious arrears threshold is met.
 *
 * Under the Renting Homes (Wales) Act 2016, Section 157 (serious rent arrears)
 * requires that:
 * - For weekly/fortnightly rent: at least 8 weeks' rent is unpaid
 * - For monthly or longer: at least 2 months' rent is unpaid
 *
 * @param totalArrears - The total arrears amount in pounds
 * @param rentFrequency - The rent payment frequency
 * @param rentAmount - The rent amount per period
 * @returns Assessment result including whether threshold is met
 */
export function isWalesSection157ThresholdMet(
  totalArrears: number,
  rentFrequency: TenancyFacts['rent_frequency'],
  rentAmount: number
): WalesThresholdResult {
  const frequency = rentFrequency || 'monthly';

  // Check for unsupported frequencies
  if (!SUPPORTED_FREQUENCIES.includes(frequency)) {
    return {
      met: false,
      thresholdAmount: 0,
      thresholdLabel: 'unknown',
      explanation:
        `Cannot assess threshold for rent frequency "${frequency}". ` +
        'Please manually verify that arrears meet the statutory threshold.',
      isAuthoritative: false,
      warning:
        `Rent frequency "${frequency}" is not supported for automatic threshold calculation. ` +
        'Please consult the Renting Homes (Wales) Act 2016, Section 157 for guidance.',
    };
  }

  // Check for invalid inputs
  if (rentAmount <= 0) {
    return {
      met: false,
      thresholdAmount: 0,
      thresholdLabel: 'unknown',
      explanation: 'Rent amount must be greater than zero to calculate threshold.',
      isAuthoritative: false,
      warning: 'Invalid rent amount provided.',
    };
  }

  if (totalArrears < 0) {
    return {
      met: false,
      thresholdAmount: 0,
      thresholdLabel: 'unknown',
      explanation: 'Total arrears cannot be negative.',
      isAuthoritative: false,
      warning: 'Invalid arrears amount provided.',
    };
  }

  // Compute threshold
  const { thresholdAmount, thresholdLabel } = computeWalesSection157Threshold(
    rentFrequency,
    rentAmount
  );

  const met = totalArrears >= thresholdAmount;

  // Build explanation
  let explanation: string;
  if (met) {
    explanation =
      `Section 157 threshold MET: £${totalArrears.toFixed(2)} arrears ` +
      `meets the statutory threshold of ${thresholdLabel} (£${thresholdAmount.toFixed(2)}). ` +
      'The level of arrears qualifies as "serious rent arrears" under the Renting Homes (Wales) Act 2016.';
  } else {
    const shortfall = thresholdAmount - totalArrears;
    explanation =
      `Section 157 threshold NOT MET: £${totalArrears.toFixed(2)} arrears ` +
      `is below the statutory threshold of ${thresholdLabel} (£${thresholdAmount.toFixed(2)}). ` +
      `Additional £${shortfall.toFixed(2)} required to meet serious arrears threshold.`;
  }

  return {
    met,
    thresholdAmount,
    thresholdLabel,
    explanation,
    isAuthoritative: true,
  };
}

/**
 * Calculate arrears amount expressed in months (for Wales).
 *
 * This is used to express arrears as a multiple of monthly rent,
 * similar to England's Ground 8 calculation but for Wales Section 157.
 *
 * @param arrearsAmount - Total arrears in pounds
 * @param rentAmount - Rent amount per period
 * @param rentFrequency - Rent payment frequency
 * @returns Arrears expressed in months of rent
 */
export function calculateWalesArrearsInMonths(
  arrearsAmount: number,
  rentAmount: number,
  rentFrequency: TenancyFacts['rent_frequency']
): number {
  if (rentAmount <= 0 || arrearsAmount <= 0) {
    return 0;
  }

  const frequency = rentFrequency || 'monthly';
  const multiplier = FREQUENCY_TO_MONTHLY_MULTIPLIER[frequency] || 1;
  const monthlyRent = rentAmount * multiplier;

  return arrearsAmount / monthlyRent;
}

/**
 * Calculate arrears amount expressed in weeks (for Wales weekly/fortnightly).
 *
 * Used for displaying arrears in the appropriate unit for weekly rent payers.
 *
 * @param arrearsAmount - Total arrears in pounds
 * @param rentAmount - Rent amount per period
 * @param rentFrequency - Rent payment frequency
 * @returns Arrears expressed in weeks of rent
 */
export function calculateWalesArrearsInWeeks(
  arrearsAmount: number,
  rentAmount: number,
  rentFrequency: TenancyFacts['rent_frequency']
): number {
  if (rentAmount <= 0 || arrearsAmount <= 0) {
    return 0;
  }

  const frequency = rentFrequency || 'weekly';
  const multiplier = FREQUENCY_TO_WEEKLY_MULTIPLIER[frequency] || 1;
  const weeklyRent = rentAmount * multiplier;

  return arrearsAmount / weeklyRent;
}
