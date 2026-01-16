/**
 * Section 21 Notice Validity Calculator
 *
 * Single source of truth for Section 21 notice validity calculations.
 * Used by both the wizard (for user feedback) and document generation.
 *
 * Implements legal requirements from:
 * - Housing Act 1988, Section 21 (as amended by Deregulation Act 2015)
 * - Assured Shorthold Tenancy rules
 *
 * Rules implemented:
 * 1. First 4 months restriction: Cannot SERVE notice in first 4 months of tenancy
 * 2. Minimum 2 calendar months notice period
 * 3. Fixed term constraint: Expiry must be on/after fixed term end (unless break clause)
 * 4. Break clause: If break clause, expiry can be on/after break clause date
 * 5. 6-month usability window: Notice lapses if court not applied to within 6 months
 */

import {
  calculateSection21ExpiryDate,
  type Section21DateParams,
} from './notice-date-calculator';

// =============================================================================
// TYPES
// =============================================================================

export interface Section21ValidationParams {
  // Dates (ISO format YYYY-MM-DD)
  tenancy_start_date: string;
  service_date: string;
  proposed_expiry_date?: string;

  // Tenancy type
  is_fixed_term: boolean;
  fixed_term_end_date?: string;

  // Break clause (only relevant for fixed term)
  has_break_clause?: boolean;
  break_clause_date?: string;
  break_clause_uncertain?: boolean; // User selected "Not sure"

  // Rent period (for periodic alignment)
  rent_period?: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface Section21ValidationResult {
  // Is the notice valid/usable?
  isValid: boolean;

  // Computed dates
  computedExpiryDate: string; // ISO date
  computedExpiryDateFormatted: string; // "15 March 2026"
  earliestServiceDate: string; // ISO date
  earliestServiceDateFormatted: string;
  noticeUsableUntil: string; // ISO date - 6 months from service
  noticeUsableUntilFormatted: string;

  // Errors (blocking issues - notice cannot be served)
  errors: ValidationIssue[];

  // Warnings (non-blocking but should be addressed)
  warnings: ValidationIssue[];

  // Reasoning for logs/debugging
  reasoning: string[];

  // Notice period in days
  noticePeriodDays: number;
}

export interface ValidationIssue {
  code: string;
  message: string;
  legalBasis?: string;
}

// =============================================================================
// DATE UTILITIES
// =============================================================================

function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  // Handle end-of-month edge cases
  const originalDay = date.getUTCDate();
  if (result.getUTCDate() < originalDay) {
    // Went past end of month, set to last day of previous month
    result.setUTCDate(0);
  }
  return result;
}

function formatUkLegalDate(dateStr: string): string {
  const date = parseISODate(dateStr);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function daysBetween(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Comprehensive Section 21 notice validity checker.
 *
 * This is the SINGLE SOURCE OF TRUTH for S21 validity.
 * Both wizard and document generation should use this function.
 *
 * @param params - Tenancy and notice parameters
 * @returns Validation result with computed dates, errors, warnings, and reasoning
 */
export function validateSection21Notice(
  params: Section21ValidationParams
): Section21ValidationResult {
  const {
    tenancy_start_date,
    service_date,
    proposed_expiry_date,
    is_fixed_term,
    fixed_term_end_date,
    has_break_clause,
    break_clause_date,
    break_clause_uncertain,
    rent_period = 'monthly',
  } = params;

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const reasoning: string[] = [];

  const tenancyStart = parseISODate(tenancy_start_date);
  const serviceDate = parseISODate(service_date);

  // =========================================================================
  // RULE 1: First 4 months restriction (SERVICE DATE check)
  // =========================================================================
  // Section 21 cannot be SERVED in the first 4 months of the tenancy
  // (Deregulation Act 2015, Section 36)
  const fourMonthsFromStart = addMonths(tenancyStart, 4);
  const earliestServiceDate = toISODate(fourMonthsFromStart);

  if (serviceDate < fourMonthsFromStart) {
    errors.push({
      code: 'S21_FIRST_4_MONTHS_BLOCK',
      message: `Section 21 notice cannot be served until 4 months after the tenancy start date. ` +
        `Tenancy started ${formatUkLegalDate(tenancy_start_date)}, ` +
        `so the earliest service date is ${formatUkLegalDate(earliestServiceDate)}.`,
      legalBasis: 'Housing Act 1988, Section 21(4B) as amended by Deregulation Act 2015',
    });
    reasoning.push(`BLOCKED: Service date ${service_date} is within first 4 months of tenancy (started ${tenancy_start_date})`);
  } else {
    reasoning.push(`OK: Service date ${service_date} is at least 4 months after tenancy start ${tenancy_start_date}`);
  }

  // =========================================================================
  // RULE 2: Minimum 2 calendar months notice
  // =========================================================================
  const twoMonthsFromService = addMonths(serviceDate, 2);
  let computedExpiry = twoMonthsFromService;
  reasoning.push(`Base expiry: 2 months from service = ${toISODate(twoMonthsFromService)}`);

  // =========================================================================
  // RULE 3: Fixed term constraint
  // =========================================================================
  if (is_fixed_term && fixed_term_end_date) {
    const fixedTermEnd = parseISODate(fixed_term_end_date);

    // Check if break clause allows earlier exit
    if (has_break_clause && break_clause_date) {
      const breakDate = parseISODate(break_clause_date);

      // Break clause allows notice to expire on/after break date
      if (computedExpiry < breakDate) {
        computedExpiry = breakDate;
        reasoning.push(`Fixed term with break clause: Extended expiry to break clause date ${break_clause_date}`);
      }

      // Validate break clause date is before fixed term end
      if (breakDate > fixedTermEnd) {
        warnings.push({
          code: 'S21_BREAK_AFTER_FIXED_TERM',
          message: 'Break clause date is after fixed term end. The break clause may not be useful.',
        });
      }
    } else if (break_clause_uncertain) {
      // User said "Not sure" about break clause - treat conservatively as NO break clause
      // This means notice cannot expire until fixed term ends
      if (computedExpiry < fixedTermEnd) {
        computedExpiry = fixedTermEnd;
        reasoning.push(`Fixed term (break clause uncertain - treating as no break): Extended expiry to fixed term end ${fixed_term_end_date}`);
      }

      warnings.push({
        code: 'S21_BREAK_CLAUSE_UNCERTAIN',
        message: 'You indicated uncertainty about the break clause. We have calculated the expiry date ' +
          'assuming no break clause exists. If your tenancy agreement does include a break clause, ' +
          'the expiry date could be earlier. Please check your tenancy agreement.',
        legalBasis: 'Housing Act 1988, Section 21(1)',
      });
    } else {
      // No break clause - notice cannot expire until fixed term ends
      if (computedExpiry < fixedTermEnd) {
        computedExpiry = fixedTermEnd;
        reasoning.push(`Fixed term (no break clause): Extended expiry to fixed term end ${fixed_term_end_date}`);
      }
    }
  }

  // =========================================================================
  // RULE 4: Periodic tenancy alignment (not mandatory but good practice)
  // =========================================================================
  // Note: This is handled by calculateSection21ExpiryDate if needed
  // We'll use the more detailed calculator for final alignment

  // =========================================================================
  // RULE 5: 6-month usability window (lapse policy)
  // =========================================================================
  const sixMonthsFromService = addMonths(serviceDate, 6);
  const noticeUsableUntil = toISODate(sixMonthsFromService);

  // Check if computed expiry is usable (court application within 6 months)
  if (computedExpiry > sixMonthsFromService) {
    errors.push({
      code: 'S21_NOTICE_WILL_LAPSE',
      message: `The computed expiry date (${formatUkLegalDate(toISODate(computedExpiry))}) is after the 6-month deadline ` +
        `for court application (${formatUkLegalDate(noticeUsableUntil)}). ` +
        `This means the notice would lapse before you can apply to court.`,
      legalBasis: 'Housing Act 1988, Section 21(4D)',
    });
    reasoning.push(`BLOCKED: Expiry ${toISODate(computedExpiry)} is after 6-month lapse date ${noticeUsableUntil}`);
  } else {
    reasoning.push(`OK: Expiry ${toISODate(computedExpiry)} is before 6-month lapse date ${noticeUsableUntil}`);
  }

  // =========================================================================
  // VALIDATE PROPOSED EXPIRY DATE (if provided)
  // =========================================================================
  if (proposed_expiry_date) {
    const proposedExpiry = parseISODate(proposed_expiry_date);

    if (proposedExpiry < computedExpiry) {
      errors.push({
        code: 'S21_EXPIRY_TOO_EARLY',
        message: `The proposed expiry date (${formatUkLegalDate(proposed_expiry_date)}) is earlier than ` +
          `the minimum valid date (${formatUkLegalDate(toISODate(computedExpiry))}). ` +
          `The notice would be invalid.`,
        legalBasis: 'Housing Act 1988, Section 21(4)',
      });
      reasoning.push(`INVALID: Proposed expiry ${proposed_expiry_date} is before computed minimum ${toISODate(computedExpiry)}`);
    }

    // Use proposed date if it's valid and later than computed minimum
    if (proposedExpiry >= computedExpiry) {
      computedExpiry = proposedExpiry;
      reasoning.push(`Using proposed expiry date ${proposed_expiry_date}`);
    }
  }

  // =========================================================================
  // CALCULATE NOTICE PERIOD
  // =========================================================================
  const noticePeriodDays = daysBetween(serviceDate, computedExpiry);

  // =========================================================================
  // RETURN RESULT
  // =========================================================================
  const computedExpiryStr = toISODate(computedExpiry);

  return {
    isValid: errors.length === 0,
    computedExpiryDate: computedExpiryStr,
    computedExpiryDateFormatted: formatUkLegalDate(computedExpiryStr),
    earliestServiceDate,
    earliestServiceDateFormatted: formatUkLegalDate(earliestServiceDate),
    noticeUsableUntil,
    noticeUsableUntilFormatted: formatUkLegalDate(noticeUsableUntil),
    errors,
    warnings,
    reasoning,
    noticePeriodDays,
  };
}

// =============================================================================
// HELPER: Check if S21 can be served now
// =============================================================================

/**
 * Quick check if Section 21 can be served today.
 *
 * @param tenancy_start_date - ISO date of tenancy start
 * @returns Object with canServe boolean and reason
 */
export function canServeSection21Now(tenancy_start_date: string): {
  canServe: boolean;
  reason: string;
  earliestServiceDate: string;
  earliestServiceDateFormatted: string;
} {
  const tenancyStart = parseISODate(tenancy_start_date);
  const today = new Date();
  const fourMonthsFromStart = addMonths(tenancyStart, 4);
  const earliestServiceDate = toISODate(fourMonthsFromStart);

  if (today < fourMonthsFromStart) {
    const daysUntil = daysBetween(today, fourMonthsFromStart);
    return {
      canServe: false,
      reason: `Cannot serve Section 21 until ${formatUkLegalDate(earliestServiceDate)} (${daysUntil} days from now). ` +
        `This is because Section 21 cannot be served in the first 4 months of the tenancy.`,
      earliestServiceDate,
      earliestServiceDateFormatted: formatUkLegalDate(earliestServiceDate),
    };
  }

  return {
    canServe: true,
    reason: 'Section 21 can be served now (4-month restriction has passed).',
    earliestServiceDate,
    earliestServiceDateFormatted: formatUkLegalDate(earliestServiceDate),
  };
}

// =============================================================================
// HELPER: Calculate S21 expiry date (wrapper for compatibility)
// =============================================================================

/**
 * Calculate the expiry date for a Section 21 notice.
 *
 * This is a wrapper around validateSection21Notice that provides
 * just the computed expiry date for use in templates.
 *
 * @param params - Section 21 validation parameters
 * @returns Computed expiry date and formatted version
 */
export function calculateSection21ExpiryDateSimple(
  params: Section21ValidationParams
): { expiryDate: string; expiryDateFormatted: string; noticePeriodDays: number } {
  const result = validateSection21Notice(params);
  return {
    expiryDate: result.computedExpiryDate,
    expiryDateFormatted: result.computedExpiryDateFormatted,
    noticePeriodDays: result.noticePeriodDays,
  };
}
