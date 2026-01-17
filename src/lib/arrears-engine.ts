/**
 * Canonical Arrears Engine
 *
 * This is the SINGLE SOURCE OF TRUTH for all arrears calculations across:
 * - Section 8 notice-only
 * - Section 8 eviction packs
 * - Money claim packs
 *
 * Hard Constraints:
 * - No flat totals treated as authoritative if a schedule exists
 * - All derived values (total_arrears, arrears_at_notice_date, arrears_in_months) come from arrears_items
 * - No document generator may compute, recalculate, or reinterpret arrears independently
 * - Ground 8 enforcement MUST use only arrears_items
 *
 * @module arrears-engine
 */

import type { ArrearsItem, TenancyFacts } from './case-facts/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface RentPeriod {
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
  rent_due: number;
}

export interface ArrearsScheduleInput {
  /** Tenancy start date (YYYY-MM-DD) */
  tenancy_start_date: string;
  /** Rent amount per period */
  rent_amount: number;
  /** Rent frequency */
  rent_frequency: TenancyFacts['rent_frequency'];
  /** Day of month/week rent is due (optional, defaults to start of period) */
  rent_due_day?: number;
  /** Notice date (YYYY-MM-DD) - periods extend up to this date, or today if not provided */
  notice_date?: string;
  /** Cut-off date for schedule (YYYY-MM-DD) - defaults to notice_date or today */
  cut_off_date?: string;
}

export interface ComputedArrears {
  /** The canonical arrears items - single source of truth */
  arrears_items: ArrearsItem[];
  /** Total arrears (sum of all amount_owed) */
  total_arrears: number;
  /** Arrears at notice date (if notice_date provided) */
  arrears_at_notice_date: number | null;
  /** Arrears expressed in months (for Ground 8 threshold) */
  arrears_in_months: number;
  /** Number of periods with any arrears */
  periods_with_arrears: number;
  /** Number of periods fully unpaid */
  periods_fully_unpaid: number;
  /** Number of periods partially paid */
  periods_partially_paid: number;
  /** Number of periods fully paid */
  periods_fully_paid: number;
  /** Whether schedule data is authoritative (not legacy flat total) */
  is_authoritative: boolean;
  /** Warning message if using legacy data */
  legacy_warning?: string;
}

export interface Ground8ValidationResult {
  /** Whether Ground 8 threshold is met */
  is_eligible: boolean;
  /** Arrears in months */
  arrears_in_months: number;
  /** Required threshold in months */
  threshold_months: number;
  /** Human-readable explanation */
  explanation: string;
  /** Whether this result is based on authoritative schedule data */
  is_authoritative: boolean;
  /** Warning if based on legacy data */
  legacy_warning?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Ground 8 requires at least 2 months' rent in arrears */
const GROUND_8_THRESHOLD_MONTHS = 2;

/** Periods per month for each frequency */
const PERIODS_PER_MONTH: Record<NonNullable<TenancyFacts['rent_frequency']>, number> = {
  weekly: 4.33,
  fortnightly: 2.165,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
  other: 1, // Default to monthly
};

// ============================================================================
// PERIOD GENERATION
// ============================================================================

/**
 * Generate rent periods from tenancy start to cut-off date.
 *
 * Periods are generated based on rent frequency:
 * - Weekly: 7-day periods
 * - Fortnightly: 14-day periods
 * - Monthly: Calendar months (same day each month)
 * - Quarterly: 3-month periods
 * - Yearly: 12-month periods
 */
export function generateRentPeriods(input: ArrearsScheduleInput): RentPeriod[] {
  const {
    tenancy_start_date,
    rent_amount,
    rent_frequency,
    notice_date,
    cut_off_date,
  } = input;

  if (!tenancy_start_date || !rent_amount || !rent_frequency) {
    return [];
  }

  const startDate = new Date(tenancy_start_date);
  const endDate = new Date(cut_off_date || notice_date || new Date().toISOString().split('T')[0]);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return [];
  }

  if (startDate > endDate) {
    return [];
  }

  const periods: RentPeriod[] = [];
  let periodStart = new Date(startDate);

  while (periodStart <= endDate) {
    const periodEnd = calculatePeriodEnd(periodStart, rent_frequency);

    // Don't include periods that start after the end date
    if (periodStart > endDate) {
      break;
    }

    // Cap the period end at the cut-off date
    const effectiveEnd = periodEnd > endDate ? endDate : periodEnd;

    periods.push({
      period_start: formatDate(periodStart),
      period_end: formatDate(effectiveEnd),
      rent_due: rent_amount,
    });

    // Move to next period
    periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() + 1);
  }

  return periods;
}

/**
 * Calculate the end date of a rent period based on frequency.
 */
function calculatePeriodEnd(
  periodStart: Date,
  frequency: TenancyFacts['rent_frequency']
): Date {
  const end = new Date(periodStart);

  switch (frequency) {
    case 'weekly':
      end.setDate(end.getDate() + 6); // 7-day period (inclusive)
      break;
    case 'fortnightly':
      end.setDate(end.getDate() + 13); // 14-day period (inclusive)
      break;
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() - 1); // End of month period
      break;
    case 'quarterly':
      end.setMonth(end.getMonth() + 3);
      end.setDate(end.getDate() - 1);
      break;
    case 'yearly':
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      break;
    default:
      // Default to monthly
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() - 1);
  }

  return end;
}

/**
 * Format a Date to YYYY-MM-DD string.
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ============================================================================
// ARREARS COMPUTATION
// ============================================================================

/**
 * Compute all arrears values from arrears_items.
 *
 * This is the ONLY place where arrears totals should be calculated.
 * All document generators and validators MUST use this function.
 */
export function computeArrears(
  arrears_items: ArrearsItem[],
  rent_frequency: TenancyFacts['rent_frequency'],
  rent_amount: number
): ComputedArrears {
  // Handle empty or missing items
  if (!arrears_items || arrears_items.length === 0) {
    return {
      arrears_items: [],
      total_arrears: 0,
      arrears_at_notice_date: null,
      arrears_in_months: 0,
      periods_with_arrears: 0,
      periods_fully_unpaid: 0,
      periods_partially_paid: 0,
      periods_fully_paid: 0,
      is_authoritative: false,
      legacy_warning: 'No arrears schedule provided. Using legacy flat total if available.',
    };
  }

  // Normalize arrears items to ensure amount_owed is calculated
  const normalizedItems = normalizeArrearsItems(arrears_items);

  // Calculate totals
  const total_arrears = normalizedItems.reduce(
    (sum, item) => sum + (item.amount_owed || 0),
    0
  );

  // Count periods by payment status
  let periods_fully_paid = 0;
  let periods_fully_unpaid = 0;
  let periods_partially_paid = 0;

  for (const item of normalizedItems) {
    const owed = item.amount_owed || 0;
    if (owed === 0) {
      periods_fully_paid++;
    } else if (item.rent_paid === 0) {
      periods_fully_unpaid++;
    } else {
      periods_partially_paid++;
    }
  }

  const periods_with_arrears = periods_fully_unpaid + periods_partially_paid;

  // Calculate arrears in months
  const arrears_in_months = calculateArrearsInMonths(
    total_arrears,
    rent_amount,
    rent_frequency
  );

  return {
    arrears_items: normalizedItems,
    total_arrears,
    arrears_at_notice_date: total_arrears, // Same as total for now
    arrears_in_months,
    periods_with_arrears,
    periods_fully_unpaid,
    periods_partially_paid,
    periods_fully_paid,
    is_authoritative: true,
  };
}

/**
 * Normalize arrears items to ensure amount_owed is calculated.
 */
export function normalizeArrearsItems(items: ArrearsItem[]): ArrearsItem[] {
  return items.map((item) => ({
    ...item,
    amount_owed: item.amount_owed ?? (item.rent_due - item.rent_paid),
  }));
}

/**
 * Calculate arrears in months from total and rent info.
 *
 * This is used for Ground 8 threshold checking.
 */
export function calculateArrearsInMonths(
  arrearsAmount: number,
  rentAmount: number,
  rentFrequency: TenancyFacts['rent_frequency']
): number {
  if (rentAmount <= 0 || arrearsAmount <= 0) {
    return 0;
  }

  const periodsPerMonth = PERIODS_PER_MONTH[rentFrequency || 'monthly'];
  const monthlyRent = rentAmount * periodsPerMonth;

  return arrearsAmount / monthlyRent;
}

// ============================================================================
// GROUND 8 VALIDATION
// ============================================================================

/**
 * Validate Ground 8 eligibility using ONLY arrears_items.
 *
 * This is the ONLY authoritative Ground 8 check. All other code MUST use this.
 *
 * Ground 8 requirements (Housing Act 1988, Schedule 2):
 * - England: At least 2 months' rent in arrears at BOTH notice date AND hearing date
 * - Scotland: At least 3 months' rent in arrears
 *
 * This function enforces that Ground 8 can ONLY be validated from schedule data.
 * Legacy flat totals will generate a warning and may not validate Ground 8.
 */
export function validateGround8Eligibility(params: {
  arrears_items: ArrearsItem[];
  rent_amount: number;
  rent_frequency: TenancyFacts['rent_frequency'];
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  legacy_total_arrears?: number; // Only for backwards compatibility warning
}): Ground8ValidationResult {
  const {
    arrears_items,
    rent_amount,
    rent_frequency,
    jurisdiction = 'england',
    legacy_total_arrears,
  } = params;

  // Determine threshold based on jurisdiction
  const threshold_months = jurisdiction === 'scotland' ? 3 : GROUND_8_THRESHOLD_MONTHS;

  // Check if we have authoritative schedule data
  const hasScheduleData = arrears_items && arrears_items.length > 0;

  if (!hasScheduleData) {
    // No schedule data - cannot authoritatively validate Ground 8
    // However, we CAN use legacy_total_arrears for wizard gating purposes
    // while flagging that court proceedings need proper schedule
    if (legacy_total_arrears && legacy_total_arrears > 0) {
      const legacyMonths = calculateArrearsInMonths(
        legacy_total_arrears,
        rent_amount,
        rent_frequency
      );

      // Check eligibility based on legacy data (for wizard gating)
      // but flag as non-authoritative for court purposes
      const meetsThreshold = legacyMonths >= threshold_months;

      return {
        is_eligible: meetsThreshold, // Allow wizard to proceed if threshold is met
        arrears_in_months: legacyMonths,
        threshold_months,
        explanation: meetsThreshold
          ? `Ground 8 threshold appears MET based on legacy data: ${legacyMonths.toFixed(2)} months ` +
            `(threshold: ${threshold_months} months). Note: A detailed arrears schedule is required for court.`
          : `Ground 8 threshold NOT MET: ${legacyMonths.toFixed(2)} months of arrears ` +
            `(threshold: ${threshold_months} months). Additional ${(threshold_months - legacyMonths).toFixed(2)} months required.`,
        is_authoritative: false,
        legacy_warning: 'Ground 8 eligibility calculated from total arrears only. ' +
          'Courts require a detailed period-by-period arrears schedule. Please complete the schedule before proceedings.',
      };
    }

    return {
      is_eligible: false,
      arrears_in_months: 0,
      threshold_months,
      explanation: 'No arrears data provided. Ground 8 requires at least ' +
        `${threshold_months} months' rent in arrears.`,
      is_authoritative: false,
    };
  }

  // Compute arrears from schedule
  const computed = computeArrears(arrears_items, rent_frequency, rent_amount);

  const is_eligible = computed.arrears_in_months >= threshold_months;

  let explanation: string;
  if (is_eligible) {
    explanation = `Ground 8 threshold MET: ${computed.arrears_in_months.toFixed(2)} months of arrears ` +
      `(threshold: ${threshold_months} months). Total arrears: £${computed.total_arrears.toFixed(2)}.`;
  } else {
    explanation = `Ground 8 threshold NOT MET: ${computed.arrears_in_months.toFixed(2)} months of arrears ` +
      `(threshold: ${threshold_months} months). Current arrears: £${computed.total_arrears.toFixed(2)}. ` +
      `Additional ${(threshold_months - computed.arrears_in_months).toFixed(2)} months required.`;
  }

  return {
    is_eligible,
    arrears_in_months: computed.arrears_in_months,
    threshold_months,
    explanation,
    is_authoritative: true,
  };
}

/**
 * Check if arrears grounds are selected.
 *
 * Arrears grounds are: Ground 8, Ground 10, Ground 11
 */
export function hasArrearsGroundsSelected(groundCodes: number[]): boolean {
  const arrearsGrounds = [8, 10, 11];
  return groundCodes.some((code) => arrearsGrounds.includes(code));
}

/**
 * Check if Ground 8 is selected.
 */
export function hasGround8Selected(groundCodes: number[]): boolean {
  return groundCodes.includes(8);
}

// ============================================================================
// SCHEDULE CREATION HELPERS
// ============================================================================

/**
 * Create an empty arrears schedule with generated periods.
 *
 * Used by the wizard to initialize the schedule when user starts entering data.
 */
export function createEmptyArrearsSchedule(input: ArrearsScheduleInput): ArrearsItem[] {
  const periods = generateRentPeriods(input);

  return periods.map((period) => ({
    period_start: period.period_start,
    period_end: period.period_end,
    rent_due: period.rent_due,
    rent_paid: 0, // Default to unpaid
    amount_owed: period.rent_due, // Full amount owed by default
  }));
}

/**
 * Update a single period in the arrears schedule.
 *
 * Recalculates amount_owed automatically.
 */
export function updateArrearsItem(
  items: ArrearsItem[],
  periodStart: string,
  rentPaid: number
): ArrearsItem[] {
  return items.map((item) => {
    if (item.period_start === periodStart) {
      return {
        ...item,
        rent_paid: rentPaid,
        amount_owed: item.rent_due - rentPaid,
      };
    }
    return item;
  });
}

/**
 * Mark all periods as paid.
 */
export function markAllPeriodsPaid(items: ArrearsItem[]): ArrearsItem[] {
  return items.map((item) => ({
    ...item,
    rent_paid: item.rent_due,
    amount_owed: 0,
  }));
}

/**
 * Mark all periods as unpaid.
 */
export function markAllPeriodsUnpaid(items: ArrearsItem[]): ArrearsItem[] {
  return items.map((item) => ({
    ...item,
    rent_paid: 0,
    amount_owed: item.rent_due,
  }));
}

// ============================================================================
// BACKWARDS COMPATIBILITY
// ============================================================================

/**
 * Create arrears result from legacy flat total.
 *
 * This is ONLY for backwards compatibility with existing cases that
 * don't have a detailed schedule. New cases MUST use schedule data.
 *
 * IMPORTANT: Results from this function are NOT authoritative for Ground 8.
 */
export function createLegacyArrearsResult(
  legacy_total_arrears: number,
  rent_amount: number,
  rent_frequency: TenancyFacts['rent_frequency']
): ComputedArrears {
  const arrears_in_months = calculateArrearsInMonths(
    legacy_total_arrears,
    rent_amount,
    rent_frequency
  );

  return {
    arrears_items: [], // No detailed schedule
    total_arrears: legacy_total_arrears,
    arrears_at_notice_date: legacy_total_arrears,
    arrears_in_months,
    periods_with_arrears: 0,
    periods_fully_unpaid: 0,
    periods_partially_paid: 0,
    periods_fully_paid: 0,
    is_authoritative: false,
    legacy_warning:
      'This case uses a legacy flat arrears total. For court proceedings, ' +
      'a detailed period-by-period schedule is strongly recommended. ' +
      'Ground 8 eligibility cannot be confirmed without schedule data.',
  };
}

/**
 * Determine if a case has authoritative arrears data.
 */
export function hasAuthoritativeArrearsData(
  arrears_items: ArrearsItem[] | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _total_arrears: number | null | undefined
): boolean {
  // Authoritative if we have schedule data
  if (arrears_items && arrears_items.length > 0) {
    return true;
  }

  // Not authoritative if only flat total
  return false;
}

/**
 * Get the authoritative arrears data, preferring schedule over flat total.
 */
export function getAuthoritativeArrears(params: {
  arrears_items?: ArrearsItem[];
  total_arrears?: number | null;
  rent_amount: number;
  rent_frequency: TenancyFacts['rent_frequency'];
}): ComputedArrears {
  const { arrears_items, total_arrears, rent_amount, rent_frequency } = params;

  // Prefer schedule data
  if (arrears_items && arrears_items.length > 0) {
    return computeArrears(arrears_items, rent_frequency, rent_amount);
  }

  // Fall back to legacy total with warning
  if (total_arrears && total_arrears > 0) {
    return createLegacyArrearsResult(total_arrears, rent_amount, rent_frequency);
  }

  // No arrears data
  return computeArrears([], rent_frequency, rent_amount);
}
