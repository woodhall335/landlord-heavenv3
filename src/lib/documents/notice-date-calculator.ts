/**
 * Notice Date Calculator
 *
 * Comprehensive date calculation and validation for eviction notices
 * across England & Wales and Scotland jurisdictions.
 *
 * Implements legal requirements for:
 * - Section 8 notices (E&W): Ground-specific notice periods
 * - Section 21 notices (E&W): Tenancy-specific rules
 * - Notice to Leave (Scotland): Ground-specific notice periods
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DateCalculationResult {
  earliest_valid_date: string; // ISO date
  notice_period_days: number;
  explanation: string; // Plain English explanation
  legal_basis: string; // Legal reference
  warnings: string[];
}

export interface DateValidationResult {
  valid: boolean;
  errors: string[];
  earliest_valid_date?: string;
  suggested_date?: string;
}

export interface Section8DateParams {
  service_date: string; // ISO date
  grounds: Array<{ code: number; mandatory?: boolean }>;
  tenancy_start_date?: string;
  fixed_term?: boolean;
  fixed_term_end_date?: string;
}

export interface Section21DateParams {
  service_date: string; // ISO date
  tenancy_start_date: string;
  fixed_term?: boolean;
  fixed_term_end_date?: string;
  rent_period: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  periodic_tenancy_start?: string; // When it became periodic (if converted)
}

export interface NoticeToLeaveDateParams {
  service_date: string; // ISO date
  grounds: Array<{ number: number }>;
}

// ============================================================================
// SECTION 8 DATE CALCULATION (ENGLAND & WALES)
// ============================================================================

/**
 * Determine the notice period for Section 8 based on grounds
 *
 * Legal basis:
 * - Mandatory grounds (1-8) + Ground 14/14A: Minimum 2 weeks (14 days)
 * - Discretionary grounds (10-17): Minimum 2 months (60 days) recommended
 * - Mixed grounds: Use the longest period to ensure validity
 */
export function calculateSection8NoticePeriod(
  grounds: Array<{ code: number; mandatory?: boolean }>
): {
  notice_period_days: number;
  explanation: string;
  legal_basis: string;
} {
  if (!grounds || grounds.length === 0) {
    throw new Error('At least one ground is required');
  }

  const groundCodes = grounds.map((g) => g.code);

  // Ground 14 or 14A allows accelerated notice (2 weeks)
  const hasGround14 = groundCodes.includes(14);

  // Identify mandatory vs discretionary
  const mandatoryGrounds = grounds.filter((g) => g.mandatory);
  const discretionaryGrounds = grounds.filter((g) => !g.mandatory);

  let notice_period_days: number;
  let explanation: string;
  let legal_basis: string;

  // If ANY ground is discretionary, use 2 months for safety
  if (discretionaryGrounds.length > 0) {
    notice_period_days = 60;
    explanation =
      'You have selected discretionary grounds, which require a minimum of 2 months notice (60 days). ' +
      'This gives the court flexibility and demonstrates reasonableness.';
    legal_basis = 'Housing Act 1988, Section 8(4)(b) - Discretionary grounds require reasonable notice';
  }
  // Only mandatory grounds
  else if (mandatoryGrounds.length > 0 || hasGround14) {
    notice_period_days = 14;
    explanation =
      'You have selected only mandatory grounds. The minimum legal notice period is 2 weeks (14 days).';
    legal_basis = 'Housing Act 1988, Section 8(4)(a) - Mandatory grounds minimum 2 weeks';
  } else {
    // Fallback to 60 days for safety
    notice_period_days = 60;
    explanation = 'To ensure validity, we recommend a 2 month notice period (60 days).';
    legal_basis = 'Housing Act 1988, Section 8';
  }

  return {
    notice_period_days,
    explanation,
    legal_basis,
  };
}

/**
 * Calculate the earliest valid expiry date for Section 8 notice
 */
export function calculateSection8ExpiryDate(params: Section8DateParams): DateCalculationResult {
  const { service_date, grounds, fixed_term, fixed_term_end_date } = params;

  const serviceDateObj = parseUTCDate(service_date);

  // Calculate notice period based on grounds
  const { notice_period_days, explanation: periodExplanation, legal_basis } = calculateSection8NoticePeriod(grounds);

  // Add notice period to service date (UTC-safe)
  let expiryDateObj = addUTCDays(serviceDateObj, notice_period_days);

  // If fixed term, expiry date cannot be before fixed term ends
  const warnings: string[] = [];
  if (fixed_term && fixed_term_end_date) {
    const fixedTermEndObj = parseUTCDate(fixed_term_end_date);
    if (expiryDateObj < fixedTermEndObj) {
      expiryDateObj = new Date(fixedTermEndObj);
      warnings.push(
        'The notice period has been extended to align with the end of the fixed term. ' +
          'You cannot evict during a fixed term using Section 8 unless specific mandatory grounds apply.'
      );
    }
  }

  const earliest_valid_date = toISODateString(expiryDateObj);

  const explanation =
    `We calculated this date by adding ${notice_period_days} days to your service date (${formatDate(serviceDateObj)}). ` +
    periodExplanation;

  return {
    earliest_valid_date,
    notice_period_days,
    explanation,
    legal_basis,
    warnings,
  };
}

/**
 * Validate a proposed Section 8 expiry date
 */
export function validateSection8ExpiryDate(
  proposed_date: string,
  params: Section8DateParams
): DateValidationResult {
  const errors: string[] = [];
  const calculatedResult = calculateSection8ExpiryDate(params);

  const proposedDateObj = parseUTCDate(proposed_date);
  const earliestDateObj = parseUTCDate(calculatedResult.earliest_valid_date);

  if (proposedDateObj < earliestDateObj) {
    errors.push(
      `The proposed expiry date is too early. The earliest legally valid date is ${formatDate(earliestDateObj)} ` +
        `(${calculatedResult.notice_period_days} days from service date). ` +
        `Legal basis: ${calculatedResult.legal_basis}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    earliest_valid_date: calculatedResult.earliest_valid_date,
    suggested_date: calculatedResult.earliest_valid_date,
  };
}

// ============================================================================
// SECTION 21 DATE CALCULATION (ENGLAND & WALES)
// ============================================================================

/**
 * Calculate the earliest valid expiry date for Section 21 notice
 *
 * Rules:
 * 1. Minimum 2 CALENDAR months notice (NOT 60 days - critical for legal validity)
 * 2. Cannot expire before 4 months after tenancy start
 * 3. For periodic tenancies, must align with end of rent period
 * 4. For fixed term: can be served during fixed term but expiry must be on or after last day of fixed term
 */
export function calculateSection21ExpiryDate(params: Section21DateParams): DateCalculationResult {
  const { service_date, tenancy_start_date, fixed_term, fixed_term_end_date, rent_period, periodic_tenancy_start } =
    params;

  const serviceDateObj = parseUTCDate(service_date);
  const tenancyStartObj = parseUTCDate(tenancy_start_date);

  const warnings: string[] = [];

  // Add 2 calendar months to service date (UTC-safe, handles end-of-month correctly)
  // CRITICAL: This is calendar months, NOT 60 days
  // Jan 31 + 2 months = Mar 31, NOT Apr 1
  let expiryDateObj = addUTCMonths(serviceDateObj, 2);

  let explanation = `Section 21 requires a minimum of 2 calendar months notice. We added 2 months to your service date (${formatDate(serviceDateObj)}). `;

  // Check 4-month rule (for tenancies started after October 2015)
  const fourMonthsAfterStart = addUTCMonths(tenancyStartObj, 4);

  if (expiryDateObj < fourMonthsAfterStart) {
    expiryDateObj = new Date(fourMonthsAfterStart);
    explanation += `However, Section 21 cannot expire before 4 months after the tenancy start date. `;
    warnings.push(
      `Your notice cannot expire until at least 4 months after the tenancy started (${formatDate(fourMonthsAfterStart)}).`
    );
  }

  // If fixed term, expiry must be on or after last day of fixed term
  if (fixed_term && fixed_term_end_date) {
    const fixedTermEndObj = parseUTCDate(fixed_term_end_date);
    if (expiryDateObj < fixedTermEndObj) {
      expiryDateObj = new Date(fixedTermEndObj);
      explanation += `The expiry date has been set to the last day of the fixed term. `;
    }
  }

  // If periodic tenancy, align with end of period
  if (!fixed_term || periodic_tenancy_start) {
    const periodStart = periodic_tenancy_start ? parseUTCDate(periodic_tenancy_start) : tenancyStartObj;
    const alignedDate = alignWithRentPeriod(expiryDateObj, periodStart, rent_period);

    if (alignedDate.getTime() !== expiryDateObj.getTime()) {
      expiryDateObj = alignedDate;
      explanation += `For periodic tenancies, the expiry date must align with the end of a rent period. We've adjusted to the next rent period end date. `;
      warnings.push('The expiry date has been aligned with the end of a rent period as required by law.');
    }
  }

  const earliest_valid_date = toISODateString(expiryDateObj);

  return {
    earliest_valid_date,
    notice_period_days: Math.ceil((expiryDateObj.getTime() - serviceDateObj.getTime()) / (1000 * 60 * 60 * 24)),
    explanation,
    legal_basis: 'Housing Act 1988, Section 21(4) - Minimum 2 calendar months notice',
    warnings,
  };
}

/**
 * Validate a proposed Section 21 expiry date
 */
export function validateSection21ExpiryDate(
  proposed_date: string,
  params: Section21DateParams
): DateValidationResult {
  const errors: string[] = [];
  const calculatedResult = calculateSection21ExpiryDate(params);

  const proposedDateObj = parseUTCDate(proposed_date);
  const earliestDateObj = parseUTCDate(calculatedResult.earliest_valid_date);

  if (proposedDateObj < earliestDateObj) {
    errors.push(
      `The proposed expiry date is too early. The earliest legally valid date is ${formatDate(earliestDateObj)}. ` +
        `Legal basis: ${calculatedResult.legal_basis}. ` +
        `Calculation: ${calculatedResult.explanation}`
    );
  }

  // Check 4-month rule explicitly
  const tenancyStartObj = parseUTCDate(params.tenancy_start_date);
  const fourMonthsAfterStart = addUTCMonths(tenancyStartObj, 4);

  if (proposedDateObj < fourMonthsAfterStart) {
    errors.push(
      `Section 21 cannot expire before 4 months after the tenancy start date (${formatDate(tenancyStartObj)}). ` +
        `The earliest valid date is ${formatDate(fourMonthsAfterStart)}.`
    );
  }

  // Check 2-month notice (must be 2 calendar months, not 60 days)
  const serviceDateObj = parseUTCDate(params.service_date);
  const twoMonthsFromService = addUTCMonths(serviceDateObj, 2);

  if (proposedDateObj < twoMonthsFromService) {
    errors.push(
      `Section 21 requires a minimum of 2 calendar months notice. ` +
        `The earliest valid date is ${formatDate(twoMonthsFromService)}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    earliest_valid_date: calculatedResult.earliest_valid_date,
    suggested_date: calculatedResult.earliest_valid_date,
  };
}

// ============================================================================
// NOTICE TO LEAVE DATE CALCULATION (SCOTLAND)
// ============================================================================

/**
 * Ground-specific notice periods for Scotland Notice to Leave
 */
const SCOTLAND_NOTICE_PERIODS: Record<number, 28 | 84> = {
  1: 28, // Rent arrears
  2: 28, // Breach of tenancy
  3: 28, // Antisocial behaviour
  4: 84, // Landlord intends to occupy
  5: 84, // Landlord intends to sell
  6: 84, // Refurbishment
  7: 84, // HMO licensing
  8: 84, // Non-residential use
  9: 28, // Overcrowding
  10: 28, // Landlord ceasing registration
  11: 28, // Not principal home
  12: 28, // Criminal conviction
  13: 28, // Mortgage lender
  14: 84, // Religious purpose
  15: 84, // Employee
  16: 28, // Temporary accommodation
  17: 84, // Former home due to work
  18: 28, // False statement
};

/**
 * Calculate notice period for Scotland Notice to Leave
 */
export function calculateNoticeToLeaveNoticePeriod(
  grounds: Array<{ number: number }>
): {
  notice_period_days: 28 | 84;
  explanation: string;
  legal_basis: string;
} {
  if (!grounds || grounds.length === 0) {
    throw new Error('At least one ground is required');
  }

  // If multiple grounds, use the LONGEST notice period
  let maxNoticePeriod: 28 | 84 = 28;

  for (const ground of grounds) {
    const periodForGround = SCOTLAND_NOTICE_PERIODS[ground.number];
    if (!periodForGround) {
      throw new Error(`Invalid Scotland ground number: ${ground.number}. Must be 1-18.`);
    }
    if (periodForGround > maxNoticePeriod) {
      maxNoticePeriod = periodForGround;
    }
  }

  const explanation =
    maxNoticePeriod === 84
      ? 'One or more of your selected grounds require 84 days notice (approximately 12 weeks). ' +
        'This is typically required for grounds related to landlord intention (occupancy, sale, refurbishment).'
      : 'Your selected grounds require 28 days notice (4 weeks). ' +
        'This is the standard notice period for conduct-based grounds (arrears, breach, antisocial behaviour).';

  const legal_basis = 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3';

  return {
    notice_period_days: maxNoticePeriod,
    explanation,
    legal_basis,
  };
}

/**
 * Calculate the earliest valid leaving date for Scotland Notice to Leave
 */
export function calculateNoticeToLeaveDate(params: NoticeToLeaveDateParams): DateCalculationResult {
  const { service_date, grounds } = params;

  const serviceDateObj = parseUTCDate(service_date);

  const { notice_period_days, explanation: periodExplanation, legal_basis } =
    calculateNoticeToLeaveNoticePeriod(grounds);

  // Add notice period to service date (UTC-safe, no DST drift)
  const leavingDateObj = addUTCDays(serviceDateObj, notice_period_days);

  const earliest_valid_date = toISODateString(leavingDateObj);

  const explanation =
    `We calculated this date by adding ${notice_period_days} days to your service date (${formatDate(serviceDateObj)}). ` +
    periodExplanation;

  return {
    earliest_valid_date,
    notice_period_days,
    explanation,
    legal_basis,
    warnings: [],
  };
}

/**
 * Validate a proposed Notice to Leave leaving date
 */
export function validateNoticeToLeaveDate(
  proposed_date: string,
  params: NoticeToLeaveDateParams
): DateValidationResult {
  const errors: string[] = [];
  const calculatedResult = calculateNoticeToLeaveDate(params);

  const proposedDateObj = parseUTCDate(proposed_date);
  const earliestDateObj = parseUTCDate(calculatedResult.earliest_valid_date);

  if (proposedDateObj < earliestDateObj) {
    errors.push(
      `The proposed leaving date is too early. The earliest legally valid date is ${formatDate(earliestDateObj)} ` +
        `(${calculatedResult.notice_period_days} days from service date). ` +
        `Legal basis: ${calculatedResult.legal_basis}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    earliest_valid_date: calculatedResult.earliest_valid_date,
    suggested_date: calculatedResult.earliest_valid_date,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse ISO date string as UTC date-only (no time component, no DST issues)
 * CRITICAL: All date calculations must use UTC to avoid DST drift
 */
function parseUTCDate(isoDate: string): Date {
  const date = new Date(isoDate + 'T00:00:00.000Z');
  return date;
}

/**
 * Convert Date to ISO date string (YYYY-MM-DD) using UTC
 */
function toISODateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add calendar months using UTC (DST-safe)
 * Handles end-of-month correctly: Jan 31 + 2 months = Mar 31
 */
function addUTCMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getUTCDate();

  result.setUTCMonth(result.getUTCMonth() + months);

  // Handle end-of-month overflow (e.g., Jan 31 + 1 month should be Feb 28/29, not Mar 2/3)
  // If we overflow into next month, set to last day of target month
  if (result.getUTCDate() < originalDay) {
    // Went into next month, so set to last day of previous month
    result.setUTCDate(0);
  }

  return result;
}

/**
 * Add days using UTC (DST-safe)
 */
function addUTCDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Align a date with the end of a rent period (UTC-safe)
 */
function alignWithRentPeriod(
  targetDate: Date,
  periodStart: Date,
  rentPeriod: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly'
): Date {
  const aligned = new Date(targetDate);

  switch (rentPeriod) {
    case 'weekly': {
      // Align to same day of week as period start (UTC)
      const dayOfWeek = periodStart.getUTCDay();
      const targetDayOfWeek = aligned.getUTCDay();
      const daysToAdd = (dayOfWeek - targetDayOfWeek + 7) % 7;
      if (daysToAdd > 0) {
        aligned.setUTCDate(aligned.getUTCDate() + daysToAdd);
      }
      break;
    }
    case 'fortnightly': {
      // Calculate weeks since period start, round up to even number
      const daysDiff = Math.floor((aligned.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.ceil(daysDiff / 14);
      aligned.setTime(periodStart.getTime() + weeks * 14 * 24 * 60 * 60 * 1000);
      break;
    }
    case 'monthly': {
      // Align to same day of month as period start (UTC)
      const dayOfMonth = periodStart.getUTCDate();
      aligned.setUTCDate(dayOfMonth);
      if (aligned < targetDate) {
        aligned.setUTCMonth(aligned.getUTCMonth() + 1);
      }
      break;
    }
    case 'quarterly': {
      // Align to same day, 3 months ahead (UTC)
      const dayOfMonth = periodStart.getUTCDate();
      aligned.setUTCDate(dayOfMonth);
      while (aligned < targetDate) {
        aligned.setUTCMonth(aligned.getUTCMonth() + 3);
      }
      break;
    }
    case 'yearly': {
      // Align to same day/month, next year (UTC)
      aligned.setUTCMonth(periodStart.getUTCMonth());
      aligned.setUTCDate(periodStart.getUTCDate());
      while (aligned < targetDate) {
        aligned.setUTCFullYear(aligned.getUTCFullYear() + 1);
      }
      break;
    }
  }

  return aligned;
}

/**
 * Format a date for human-readable output (UK format: "DD Month YYYY")
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Format date as DD/MM/YYYY (UK format for templates and PDFs)
 */
export function formatDateUK(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseUTCDate(date) : date;
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Add business days (skip weekends)
 * Not currently used but useful for future enhancements
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not Sunday or Saturday
      addedDays++;
    }
  }

  return result;
}
