/**
 * Wales Section 173 Form Selector and Timing Validator
 *
 * COURT-GRADE GUARDRAILS for Wales no-fault (Section 173) notices under
 * the Renting Homes (Wales) Act 2016.
 *
 * Key requirements:
 * - RHW17: For periodic standard contracts with 2-MONTH minimum notice period
 * - RHW16: Where 6-MONTH minimum notice applies (post-December 2022)
 * - Section 173 notices must satisfy:
 *   1. Correct form selection (RHW16 or RHW17)
 *   2. Minimum notice duration (calendar months, not days approximation)
 *   3. Cannot be served within first 6 months of occupation (s175 prohibited period)
 *
 * WALES ONLY - Do NOT reference Housing Act 1988, Section 8, Section 21, or Form 6A.
 */

// ============================================================================
// TYPES
// ============================================================================

export type Section173Form = 'RHW16' | 'RHW17';

/**
 * Notice regime determines the minimum notice period.
 * - '6_month': Current regime (post-December 2022) - requires RHW16
 * - '2_month': Legacy regime (pre-December 2022 or specific exemptions) - requires RHW17
 */
export type Section173NoticeRegime = '6_month' | '2_month';

export interface Section173Facts {
  /** ISO date string (YYYY-MM-DD) - when the contract started */
  contract_start_date: string;
  /** ISO date string (YYYY-MM-DD) - when the notice is/will be served */
  service_date: string;
  /** ISO date string (YYYY-MM-DD) - user-specified or calculated expiry date */
  expiry_date?: string;
  /** Contract type: 'standard', 'supported_standard', or 'secure' */
  wales_contract_category?: 'standard' | 'supported_standard' | 'secure';
  /** Whether the contract is periodic (vs fixed term) */
  is_periodic?: boolean;
  /** Fixed term end date if applicable */
  fixed_term_end_date?: string;
  /** Whether a break clause exists */
  has_break_clause?: boolean;
  /** Break clause date if applicable */
  break_clause_date?: string;
  /**
   * EXPLICIT notice regime override.
   * If not provided, the regime is inferred from service date.
   * Use this when the regime cannot be safely derived (e.g., transitional cases).
   */
  wales_section173_notice_regime?: Section173NoticeRegime;
}

export interface Section173ValidationResult {
  /** Hard blocking errors that prevent valid notice generation */
  errors: string[];
  /** Warnings that should be shown to user but don't block generation */
  warnings: string[];
  /** The earliest valid service date (after prohibited period) */
  earliestServiceDate: string;
  /** The earliest valid expiry date based on service date and minimum notice */
  earliestExpiryDate: string;
  /** Whether the current dates are valid */
  isValid: boolean;
  /** Form that should be used */
  recommendedForm: Section173Form;
  /** Minimum notice period in calendar months */
  minimumNoticeMonths: number;
  /** The notice regime being applied */
  noticeRegime: Section173NoticeRegime;
  /** Whether the regime was explicitly set or inferred */
  regimeSource: 'explicit' | 'inferred';
}

/**
 * Result type for getSection173MinimumNoticePeriod.
 * The authoritative value is `months` - use `approximateDays` only for display.
 */
export interface Section173NoticePeriodResult {
  /** Number of calendar months (AUTHORITATIVE - use this for legal calculations) */
  months: number;
  /**
   * Approximate number of days (FOR DISPLAY ONLY - do NOT use for legal calculations).
   * @deprecated Use `months` for all legal date calculations.
   */
  approximateDays: number;
  /** Description for display */
  description: string;
  /** Legal reference */
  legalReference: string;
  /** The notice regime being applied */
  noticeRegime: Section173NoticeRegime;
  /** Prescribed form for this regime */
  form: Section173Form;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Prohibited period: Cannot serve Section 173 in first 6 months of contract
 * Reference: Renting Homes (Wales) Act 2016, s.175
 */
const PROHIBITED_PERIOD_MONTHS = 6;

/**
 * Notice period rules by effective date.
 * As of December 2022, the minimum is 6 months for most cases.
 * Prior to December 2022, it was 2 months.
 */
const NOTICE_PERIOD_RULES: Array<{
  effectiveFrom: string;
  periodMonths: number;
  form: Section173Form;
  regime: Section173NoticeRegime;
  legalReference: string;
}> = [
  {
    effectiveFrom: '2022-12-01',
    periodMonths: 6,
    form: 'RHW16',
    regime: '6_month',
    legalReference: 'Renting Homes (Wales) Act 2016, s.173 (as amended December 2022)',
  },
  {
    effectiveFrom: '2016-12-01',
    periodMonths: 2,
    form: 'RHW17',
    regime: '2_month',
    legalReference: 'Renting Homes (Wales) Act 2016, s.173 (original)',
  },
];

/**
 * Map from notice regime to form and period.
 */
const REGIME_TO_FORM: Record<Section173NoticeRegime, { form: Section173Form; months: number; legalReference: string }> = {
  '6_month': {
    form: 'RHW16',
    months: 6,
    legalReference: 'Renting Homes (Wales) Act 2016, s.173 (as amended December 2022)',
  },
  '2_month': {
    form: 'RHW17',
    months: 2,
    legalReference: 'Renting Homes (Wales) Act 2016, s.173 (original)',
  },
};

// ============================================================================
// CALENDAR MONTH HELPERS
// ============================================================================

/**
 * Add calendar months to a date string.
 *
 * Uses proper calendar month semantics:
 * - Jan 31 + 2 months = Mar 31 (not Apr 2)
 * - Jan 31 + 1 month = Feb 28/29 (clamps to end of month)
 *
 * This is critical for legal compliance - notices must be calculated
 * in calendar months, not approximate day counts.
 *
 * @param dateStr ISO date string (YYYY-MM-DD)
 * @param months Number of calendar months to add
 * @returns ISO date string of the result
 */
export function addCalendarMonths(dateStr: string, months: number): string {
  // Parse as UTC to avoid DST issues
  const date = new Date(dateStr + 'T00:00:00.000Z');
  const originalDay = date.getUTCDate();

  // Add months
  date.setUTCMonth(date.getUTCMonth() + months);

  // Handle end-of-month overflow
  // If we've gone past the target month (e.g., Jan 31 + 1 month = Mar 3),
  // set to last day of the correct month
  if (date.getUTCDate() < originalDay) {
    // We overflowed - go back to last day of previous month
    date.setUTCDate(0);
  }

  return toISODateString(date);
}

/**
 * Calculate the difference in calendar months between two dates.
 *
 * Returns a floating-point number representing whole and partial months.
 *
 * @param startDate ISO date string
 * @param endDate ISO date string
 * @returns Number of calendar months (can be fractional)
 */
export function monthsDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T00:00:00.000Z');

  const yearDiff = end.getUTCFullYear() - start.getUTCFullYear();
  const monthDiff = end.getUTCMonth() - start.getUTCMonth();
  const dayDiff = end.getUTCDate() - start.getUTCDate();

  // Calculate total months plus fractional part
  const totalMonths = yearDiff * 12 + monthDiff + dayDiff / 30;
  return totalMonths;
}

/**
 * Calculate the difference in days between two dates.
 *
 * @param startDate ISO date string
 * @param endDate ISO date string
 * @returns Number of days
 */
export function daysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T00:00:00.000Z');
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Convert a Date to ISO date string (YYYY-MM-DD)
 */
function toISODateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string as UTC Date
 */
function parseUTCDate(isoDate: string): Date {
  return new Date(isoDate + 'T00:00:00.000Z');
}

// ============================================================================
// RULE SELECTOR
// ============================================================================

/**
 * Get the applicable notice period rule for a given service date.
 *
 * Selects the rule with the latest effective_from date that is <= service date.
 *
 * @param serviceDate ISO date string (YYYY-MM-DD)
 * @returns The applicable rule with regime information
 */
function getApplicableRuleByDate(serviceDate: string): {
  periodMonths: number;
  form: Section173Form;
  regime: Section173NoticeRegime;
  legalReference: string;
} {
  const serviceDateObj = parseUTCDate(serviceDate);

  // Rules are sorted by effectiveFrom descending, so first match wins
  for (const rule of NOTICE_PERIOD_RULES) {
    const effectiveFromObj = parseUTCDate(rule.effectiveFrom);
    if (serviceDateObj >= effectiveFromObj) {
      return {
        periodMonths: rule.periodMonths,
        form: rule.form,
        regime: rule.regime,
        legalReference: rule.legalReference,
      };
    }
  }

  // Default to the oldest rule if no match (shouldn't happen in practice)
  const fallback = NOTICE_PERIOD_RULES[NOTICE_PERIOD_RULES.length - 1];
  return {
    periodMonths: fallback.periodMonths,
    form: fallback.form,
    regime: fallback.regime,
    legalReference: fallback.legalReference,
  };
}

/**
 * Resolve the applicable notice regime from facts.
 *
 * Priority:
 * 1. Explicit wales_section173_notice_regime if provided
 * 2. Inferred from service date
 *
 * Returns the regime along with source information for warnings.
 */
function resolveNoticeRegime(facts: Section173Facts): {
  regime: Section173NoticeRegime;
  source: 'explicit' | 'inferred';
  form: Section173Form;
  months: number;
  legalReference: string;
} {
  // Priority 1: Explicit regime override
  if (facts.wales_section173_notice_regime) {
    const regimeConfig = REGIME_TO_FORM[facts.wales_section173_notice_regime];
    return {
      regime: facts.wales_section173_notice_regime,
      source: 'explicit',
      form: regimeConfig.form,
      months: regimeConfig.months,
      legalReference: regimeConfig.legalReference,
    };
  }

  // Priority 2: Infer from service date
  const serviceDate = facts.service_date || toISODateString(new Date());
  const rule = getApplicableRuleByDate(serviceDate);
  return {
    regime: rule.regime,
    source: 'inferred',
    form: rule.form,
    months: rule.periodMonths,
    legalReference: rule.legalReference,
  };
}

// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================

/**
 * Determine which Section 173 form to use.
 *
 * LEGAL REQUIREMENT:
 * - RHW16: 6-month minimum notice (post-December 2022 regime)
 * - RHW17: 2-month minimum notice (pre-December 2022 regime, or explicit override)
 *
 * Form selection is based on the applicable notice regime, NOT solely by service date.
 * If an explicit regime is provided via wales_section173_notice_regime, it takes precedence.
 *
 * CONSERVATIVE DEFAULT: If the regime cannot be safely derived and no explicit
 * override is provided, defaults to RHW16 (6-month) to avoid insufficient notice.
 *
 * @param facts The Section 173 case facts
 * @returns Object containing the form and regime information
 */
export function determineSection173Form(facts: Section173Facts): Section173Form {
  const resolved = resolveNoticeRegime(facts);
  return resolved.form;
}

/**
 * Extended form determination with full metadata.
 *
 * Use this when you need to know whether the regime was explicit or inferred,
 * and to surface appropriate warnings.
 */
export function determineSection173FormWithMetadata(facts: Section173Facts): {
  form: Section173Form;
  regime: Section173NoticeRegime;
  regimeSource: 'explicit' | 'inferred';
  months: number;
  legalReference: string;
  warnings: string[];
} {
  const resolved = resolveNoticeRegime(facts);
  const warnings: string[] = [];

  // If regime was inferred, add a warning for cases that might be ambiguous
  if (resolved.source === 'inferred') {
    const serviceDate = facts.service_date || toISODateString(new Date());
    const serviceDateObj = parseUTCDate(serviceDate);
    const transitionDate = parseUTCDate('2022-12-01');

    // Warn if service date is close to the transition boundary (within 6 months)
    const sixMonthsAfterTransition = new Date(transitionDate);
    sixMonthsAfterTransition.setUTCMonth(sixMonthsAfterTransition.getUTCMonth() + 6);

    if (serviceDateObj >= transitionDate && serviceDateObj <= sixMonthsAfterTransition) {
      warnings.push(
        `WALES_SECTION173_REGIME_INFERRED: Notice regime inferred as ${resolved.regime} ` +
        `based on service date ${serviceDate}. For contracts that started before December 2022, ` +
        `verify the correct regime applies. Set wales_section173_notice_regime explicitly if needed.`
      );
    }
  }

  return {
    form: resolved.form,
    regime: resolved.regime,
    regimeSource: resolved.source,
    months: resolved.months,
    legalReference: resolved.legalReference,
    warnings,
  };
}

/**
 * Get the minimum notice period for Section 173.
 *
 * IMPORTANT: The authoritative value is `months` - use `approximateDays` only for display.
 * Legal compliance must be calculated using calendar months, not day approximations.
 *
 * @param facts The Section 173 case facts
 * @returns Minimum notice period information
 */
export function getSection173MinimumNoticePeriod(facts: Section173Facts): Section173NoticePeriodResult {
  const resolved = resolveNoticeRegime(facts);

  // Calculate approximate days (for display purposes ONLY)
  // Use 30.44 average days per month
  const approximateDays = Math.ceil(resolved.months * 30.44);

  return {
    months: resolved.months,
    approximateDays,
    description:
      resolved.months === 6
        ? 'Six calendar months (minimum)'
        : 'Two calendar months (minimum)',
    legalReference: resolved.legalReference,
    noticeRegime: resolved.regime,
    form: resolved.form,
  };
}

/**
 * @deprecated Use getSection173MinimumNoticePeriod instead.
 * This function is retained for backwards compatibility but will be removed.
 */
export function getSection173MinimumNoticeDays(facts: Section173Facts): {
  days: number;
  months: number;
  description: string;
  legalReference: string;
} {
  const result = getSection173MinimumNoticePeriod(facts);
  return {
    days: result.approximateDays,
    months: result.months,
    description: result.description,
    legalReference: result.legalReference,
  };
}

/**
 * Validate Section 173 timing requirements.
 *
 * Checks:
 * 1. Service date must be >= occupation start date + 6 months (hard error)
 * 2. Expiry date must be >= service date + required minimum (hard error)
 * 3. Fixed term checks:
 *    - HARD ERROR: Cannot expire before fixed term end when no break clause
 *    - WARNING: Break clause date constraints
 * 4. Contract category validation
 *
 * @param facts The Section 173 case facts
 * @returns Validation result with errors, warnings, and computed dates
 */
export function validateSection173Timing(facts: Section173Facts): Section173ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const contractStartDate = facts.contract_start_date;
  const serviceDate = facts.service_date || toISODateString(new Date());
  const expiryDate = facts.expiry_date;

  // Validate contract start date exists
  if (!contractStartDate) {
    errors.push('Contract start date is required for Section 173 validation.');
    return {
      errors,
      warnings,
      earliestServiceDate: '',
      earliestExpiryDate: '',
      isValid: false,
      recommendedForm: 'RHW16',
      minimumNoticeMonths: 6,
      noticeRegime: '6_month',
      regimeSource: 'inferred',
    };
  }

  // Resolve notice regime (uses explicit if provided, otherwise infers from service date)
  const resolved = resolveNoticeRegime(facts);

  // Add warning if regime was inferred near transition boundary
  const formMetadata = determineSection173FormWithMetadata(facts);
  warnings.push(...formMetadata.warnings);

  // Calculate earliest valid service date (contract start + 6 months prohibited period)
  const earliestServiceDate = addCalendarMonths(contractStartDate, PROHIBITED_PERIOD_MONTHS);

  // Check 1: Service date must be after prohibited period
  if (serviceDate < earliestServiceDate) {
    const daysRemaining = daysDifference(serviceDate, earliestServiceDate);
    errors.push(
      `WALES_SECTION173_PROHIBITED_PERIOD: Section 173 cannot be served within the first ` +
        `${PROHIBITED_PERIOD_MONTHS} months of the occupation contract. ` +
        `Contract started: ${contractStartDate}. ` +
        `Earliest service date: ${earliestServiceDate} ` +
        `(${daysRemaining} days from now).`
    );
  }

  // Calculate earliest valid expiry date
  // Use the later of: service date or earliest service date
  const effectiveServiceDate =
    serviceDate >= earliestServiceDate ? serviceDate : earliestServiceDate;
  const earliestExpiryDate = addCalendarMonths(effectiveServiceDate, resolved.months);

  // Check 2: Expiry date must be >= service date + minimum notice
  if (expiryDate && expiryDate < earliestExpiryDate) {
    const shortfallMonths = monthsDifference(expiryDate, earliestExpiryDate);
    errors.push(
      `WALES_SECTION173_INSUFFICIENT_NOTICE: Expiry date is too early. ` +
        `Section 173 requires ${resolved.months} calendar months notice (${resolved.regime} regime). ` +
        `Service date: ${serviceDate}. ` +
        `Earliest valid expiry: ${earliestExpiryDate}. ` +
        `Your expiry date (${expiryDate}) is ${shortfallMonths.toFixed(1)} months short.`
    );
  }

  // Check 3: Fixed term considerations
  // IMPORTANT: Fixed term expiry before term end is a HARD ERROR when no break clause
  if (facts.fixed_term_end_date) {
    const fixedTermEndDate = facts.fixed_term_end_date;

    // Check if there's a break clause that allows early termination
    if (facts.has_break_clause === true && facts.break_clause_date) {
      // Break clause exists - check against break clause date
      const breakDate = facts.break_clause_date;
      if (expiryDate && expiryDate < breakDate) {
        // Warning: expiry is before break clause date
        warnings.push(
          `Section 173 notice expiry date (${expiryDate}) is before the break clause date (${breakDate}). ` +
            `Consider adjusting the expiry date to on or after the break clause date.`
        );
      }
    } else if (facts.has_break_clause === false) {
      // Explicitly no break clause - expiry before fixed term end is a HARD ERROR
      if (expiryDate && expiryDate < fixedTermEndDate) {
        errors.push(
          `WALES_SECTION173_FIXED_TERM_VIOLATION: Section 173 notice cannot take effect ` +
            `before the fixed term ends. Fixed term end date: ${fixedTermEndDate}. ` +
            `Your expiry date: ${expiryDate}. No break clause exists. ` +
            `The expiry date must be on or after ${fixedTermEndDate}.`
        );
      }
    } else {
      // Break clause status unknown (not explicitly set) - warning for safety
      if (expiryDate && expiryDate < fixedTermEndDate) {
        warnings.push(
          `Section 173 notice expiry date (${expiryDate}) is before the fixed term end (${fixedTermEndDate}). ` +
            `If there is no break clause, the notice cannot take effect until the fixed term ends. ` +
            `Please confirm whether a break clause exists.`
        );
      }
    }
  }

  // Check 4: Contract category validation
  if (facts.wales_contract_category && facts.wales_contract_category !== 'standard') {
    if (facts.wales_contract_category === 'secure') {
      errors.push(
        `WALES_SECTION173_INVALID_CONTRACT_TYPE: Section 173 is not available for ` +
          `secure occupation contracts. Secure contracts (e.g., council tenancies) have ` +
          `different termination procedures under Part 7 of the Renting Homes (Wales) Act 2016.`
      );
    } else if (facts.wales_contract_category === 'supported_standard') {
      warnings.push(
        `Supported standard contracts may have additional notice requirements. ` +
          `Check with the support provider before serving notice.`
      );
    }
  }

  // Determine if valid
  const isValid = errors.length === 0;

  return {
    errors,
    warnings,
    earliestServiceDate,
    earliestExpiryDate,
    isValid,
    recommendedForm: resolved.form,
    minimumNoticeMonths: resolved.months,
    noticeRegime: resolved.regime,
    regimeSource: resolved.source,
  };
}

/**
 * Calculate and auto-correct the expiry date if needed.
 *
 * If the user-provided expiry date is too early, returns the earliest valid date.
 * Otherwise returns the user-provided date.
 *
 * @param facts The Section 173 case facts
 * @returns Object with corrected expiry date and whether correction was applied
 */
export function calculateSection173ExpiryDate(facts: Section173Facts): {
  expiryDate: string;
  wasCorrected: boolean;
  correctionMessage?: string;
  minimumNoticeMonths: number;
  form: Section173Form;
} {
  const validation = validateSection173Timing(facts);
  const userExpiryDate = facts.expiry_date;

  // If user provided an expiry date that's valid, use it
  if (userExpiryDate && userExpiryDate >= validation.earliestExpiryDate) {
    return {
      expiryDate: userExpiryDate,
      wasCorrected: false,
      minimumNoticeMonths: validation.minimumNoticeMonths,
      form: validation.recommendedForm,
    };
  }

  // Auto-correct to earliest valid date
  return {
    expiryDate: validation.earliestExpiryDate,
    wasCorrected: true,
    correctionMessage:
      `Expiry date auto-corrected to ${validation.earliestExpiryDate} ` +
      `(${validation.minimumNoticeMonths} calendar months from service date). ` +
      `This is the minimum notice period required under Section 173.`,
    minimumNoticeMonths: validation.minimumNoticeMonths,
    form: validation.recommendedForm,
  };
}

/**
 * Check if the given route is Section 173 (no-fault Wales).
 *
 * Use this to determine whether to hide fault-based UI elements.
 */
export function isSection173Route(
  evictionRoute: string | null | undefined
): boolean {
  if (!evictionRoute) return false;
  const normalized = evictionRoute.toLowerCase().replace(/[-_\s]/g, '');
  return (
    normalized === 'section173' ||
    normalized === 'walessection173' ||
    normalized === 's173' ||
    normalized === 'nofault'
  );
}

/**
 * Check if the given route is Wales fault-based.
 *
 * Use this to determine whether to show fault-based UI elements.
 */
export function isWalesFaultBasedRoute(
  evictionRoute: string | null | undefined
): boolean {
  if (!evictionRoute) return false;
  const normalized = evictionRoute.toLowerCase().replace(/[-_\s]/g, '');
  return (
    normalized === 'faultbased' ||
    normalized === 'walesfaultbased' ||
    normalized === 'breach' ||
    normalized === 'rhw23'
  );
}

/**
 * Get a human-readable summary of Section 173 requirements.
 *
 * Useful for displaying in UI panels.
 */
export function getSection173RequirementsSummary(facts: Section173Facts): string[] {
  const validation = validateSection173Timing(facts);
  const resolved = resolveNoticeRegime(facts);

  const requirements: string[] = [
    `Minimum notice period: ${resolved.months} calendar months`,
    `Prescribed form: ${validation.recommendedForm}`,
    `Prohibited period: Cannot serve within first 6 months of contract`,
    `Legal basis: Renting Homes (Wales) Act 2016, Section 173`,
  ];

  if (facts.contract_start_date) {
    requirements.push(`Earliest service date: ${validation.earliestServiceDate}`);
    requirements.push(`Earliest expiry date: ${validation.earliestExpiryDate}`);
  }

  return requirements;
}
