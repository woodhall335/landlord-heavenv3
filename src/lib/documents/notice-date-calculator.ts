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
  minimum_legal_days?: number; // NEW: For tracking minimum period
  recommended_days?: number; // NEW: For tracking recommended period
  used_days?: number; // NEW: For tracking which period was used
  explanation_minimum?: string; // NEW: Explanation for minimum
  explanation_recommended?: string; // NEW: Explanation for recommended
  policy_flags?: {
    has_discretionary?: boolean;
    has_ground14?: boolean;
    ground14_severity?: 'serious' | 'moderate';
    jurisdiction?: 'england' | 'wales';
  };
}

export interface DateValidationResult {
  valid: boolean;
  errors: string[];
  earliest_valid_date?: string;
  suggested_date?: string;
}

export interface Section8DateParams {
  service_date: string; // ISO date
  grounds: Array<{ code: number | string; mandatory?: boolean }>;
  tenancy_start_date?: string;
  fixed_term?: boolean;
  fixed_term_end_date?: string;
  severity?: 'serious' | 'moderate'; // NEW: For Ground 14
  strategy?: 'minimum' | 'recommended'; // NEW: Which notice period to use
  jurisdiction?: 'england' | 'wales'; // NEW: For Wales warnings
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
  pre_action_completed?: boolean; // NEW: For Scotland pre-action protocol
}

export type NoticePeriodResult = {
  minimum_legal_days: number;
  recommended_days?: number;
  used_days: number;
  earliest_expiry_date: string;
  recommended_expiry_date?: string;
  explanation_minimum: string;
  explanation_recommended?: string;
  legal_basis: string;
  policy_flags: {
    has_discretionary: boolean;
    has_ground14: boolean;
    ground14_severity?: 'serious' | 'moderate';
    jurisdiction?: 'england' | 'wales';
  };
  warnings: string[];
};

// ============================================================================
// SECTION 8 DATE CALCULATION (ENGLAND & WALES)
// ============================================================================

/**
 * Ground-specific notice periods (in days) as per Housing Act 1988, Schedule 2
 *
 * Legal requirements:
 * - 2 weeks (14 days): Grounds 3, 4, 7A, 7B, 8, 10, 11, 12, 13, 14, 14ZA, 15, 17
 * - 2 months (60 days): Grounds 1, 2, 5, 6, 7, 9, 16
 * - Immediate (0 days): Ground 14 (serious ASB), Ground 14A
 */
const SECTION8_GROUND_NOTICE_PERIODS: Record<number | string, number> = {
  1: 60,    // 2 months - landlord previously occupied
  2: 60,    // 2 months - mortgage lender requires possession
  3: 14,    // 2 weeks - holiday let
  4: 14,    // 2 weeks - educational institution let
  5: 60,    // 2 months - minister of religion
  6: 60,    // 2 months - demolition/reconstruction
  7: 60,    // 2 months - death of periodic tenant
  '7A': 14, // 2 weeks - abandonment (fixed term)
  '7B': 14, // 2 weeks - abandonment (periodic)
  8: 14,    // 2 weeks - serious rent arrears (8 weeks/2 months)
  9: 60,    // 2 months - suitable alternative accommodation
  10: 14,   // 2 weeks - some rent arrears
  11: 14,   // 2 weeks - persistent delay in paying rent
  12: 14,   // 2 weeks - breach of tenancy obligation
  13: 14,   // 2 weeks - deterioration of dwelling
  14: 14,   // 2 weeks (default) - nuisance/annoyance (can be immediate for serious ASB)
  '14ZA': 14, // 2 weeks - riot conviction
  '14A': 0,   // Immediate - domestic violence
  15: 14,   // 2 weeks - deterioration of furniture
  16: 60,   // 2 months - former employee
  17: 14,   // 2 weeks - false statement
};

/**
 * Determine the notice period for Section 8 based on grounds
 *
 * GROUND-DEPENDENT LOGIC (Production-Grade):
 * - Uses MAXIMUM notice period across all selected grounds
 * - Ground 14A: Immediate (0 days) for domestic violence
 * - Ground 14 serious ASB: Immediate (0 days)
 * - Ground 14 moderate ASB: 14 days minimum
 * - Grounds 1, 2, 5, 6, 7, 9, 16: 2 months (60 days)
 * - All other grounds: 14 days minimum
 * - Wales: Generates warnings (wrong terminology)
 */
export function calculateSection8NoticePeriod(
  params: {
    grounds: Array<{ code: number | string; mandatory?: boolean }>;
    severity?: 'serious' | 'moderate';
    strategy?: 'minimum' | 'recommended';
    jurisdiction?: 'england' | 'wales';
  }
): NoticePeriodResult {
  const { grounds, severity = 'moderate', strategy = 'minimum', jurisdiction = 'england' } = params;

  if (!grounds || grounds.length === 0) {
    throw new Error('At least one ground is required');
  }

  // WALES WARNING (SOFT BLOCK)
  const warnings: string[] = [];
  if (jurisdiction === 'wales') {
    warnings.push(
      'Section 8 terminology applies to England only. ' +
        'Wales uses Renting Homes (Wales) Act 2016 with different grounds. ' +
        'Generated document may not be valid in Wales. Consult Welsh property solicitor.'
    );
  }

  const hasGround14A = grounds.some((g) => String(g.code) === '14A');
  const hasGround14 = grounds.some((g) => String(g.code) === '14' || g.code === 14);
  const discretionaryGrounds = grounds.filter((g) => !g.mandatory);

  // Calculate the MAXIMUM notice period required across all selected grounds
  let maxNoticePeriod = 0;
  const groundPeriods: Array<{ code: string | number; days: number }> = [];

  for (const ground of grounds) {
    const code = String(ground.code).toUpperCase();
    let period: number;

    // Special handling for Ground 14 with severity
    if ((code === '14' || ground.code === 14) && severity === 'serious') {
      period = 0; // Immediate for serious ASB
    } else {
      // Look up the standard notice period for this ground
      const numericCode = parseInt(code, 10);
      period = SECTION8_GROUND_NOTICE_PERIODS[code] ??
               SECTION8_GROUND_NOTICE_PERIODS[numericCode] ??
               14; // Default to 14 days for unknown grounds
    }

    groundPeriods.push({ code: ground.code, days: period });
    if (period > maxNoticePeriod) {
      maxNoticePeriod = period;
    }
  }

  let minimum_legal_days = maxNoticePeriod;
  let recommended_days: number | undefined;
  let explanation_minimum: string;
  let explanation_recommended: string | undefined;
  let legal_basis: string;

  // Build explanation based on what's driving the notice period
  const twoMonthGrounds = groundPeriods.filter(g => g.days === 60);
  const twoWeekGrounds = groundPeriods.filter(g => g.days === 14);
  const immediateGrounds = groundPeriods.filter(g => g.days === 0);

  if (immediateGrounds.length > 0 && maxNoticePeriod === 0) {
    // Only immediate grounds selected
    if (hasGround14A) {
      explanation_minimum = 'Ground 14A (domestic violence) allows immediate court proceedings (0 days notice).';
      legal_basis = 'Housing Act 1988, Schedule 2, Ground 14A';
    } else if (hasGround14 && severity === 'serious') {
      explanation_minimum =
        'Ground 14 serious ASB allows immediate court proceedings (0 days notice). ' +
        'Serious ASB includes violence, threats, drug dealing, or criminal damage.';
      legal_basis = 'Housing Act 1988, Schedule 2, Ground 14';
    } else {
      explanation_minimum = 'Selected ground(s) allow immediate court proceedings.';
      legal_basis = 'Housing Act 1988, Schedule 2';
    }
  } else if (maxNoticePeriod === 60) {
    // Two-month grounds drive the period
    const twoMonthCodes = twoMonthGrounds.map(g => `Ground ${g.code}`).join(', ');
    explanation_minimum =
      `${twoMonthCodes} require${twoMonthGrounds.length === 1 ? 's' : ''} 2 months (60 days) minimum notice ` +
      'under Schedule 2 of the Housing Act 1988.';
    legal_basis = 'Housing Act 1988, Schedule 2';

    if (twoMonthGrounds.some(g => String(g.code) === '10' || g.code === 10)) {
      explanation_minimum += ' Ground 10 (some rent arrears) specifically requires 2 months notice.';
    }
    if (twoMonthGrounds.some(g => String(g.code) === '11' || g.code === 11)) {
      explanation_minimum += ' Ground 11 (persistent delay in paying rent) specifically requires 2 months notice.';
    }
  } else if (maxNoticePeriod === 14) {
    // All selected grounds are 2-week grounds
    explanation_minimum =
      'Selected ground(s) require 14 days minimum notice under Schedule 2 of the Housing Act 1988.';
    legal_basis = 'Housing Act 1988, Schedule 2';

    // For discretionary 14-day grounds, suggest 60 days as recommended
    if (discretionaryGrounds.length > 0 && !hasGround14A && !(hasGround14 && severity === 'serious')) {
      recommended_days = 60;
      explanation_recommended =
        'While 14 days is legally sufficient for discretionary grounds, ' +
        '60 days demonstrates reasonableness to the court and may improve success probability. ' +
        'This is not legally required. Courts may still grant possession after the minimum period.';
    }
  } else {
    // Fallback
    explanation_minimum = `Selected ground(s) require ${maxNoticePeriod} days minimum notice.`;
    legal_basis = 'Housing Act 1988, Schedule 2';
  }

  const used_days = strategy === 'recommended' && recommended_days ? recommended_days : minimum_legal_days;

  return {
    minimum_legal_days,
    recommended_days,
    used_days,
    earliest_expiry_date: '', // Set in calculateSection8ExpiryDate
    recommended_expiry_date: recommended_days ? '' : undefined,
    explanation_minimum,
    explanation_recommended,
    legal_basis,
    policy_flags: {
      has_discretionary: discretionaryGrounds.length > 0,
      has_ground14: hasGround14,
      ground14_severity: hasGround14 ? severity : undefined,
      jurisdiction,
    },
    warnings,
  };
}

/**
 * Calculate the earliest valid expiry date for Section 8 notice
 */
export function calculateSection8ExpiryDate(params: Section8DateParams): DateCalculationResult {
  const { service_date, grounds, fixed_term, fixed_term_end_date, severity, strategy, jurisdiction } = params;

  const serviceDateObj = parseUTCDate(service_date);

  // Calculate notice period based on grounds using new unified logic
  const periodResult = calculateSection8NoticePeriod({
    grounds,
    severity,
    strategy,
    jurisdiction,
  });

  // Add notice period to service date (UTC-safe)
  let expiryDateObj = addUTCDays(serviceDateObj, periodResult.used_days);

  // NOTE: Section 8 does NOT extend to fixed term end (unlike Section 21)
  // Section 8 can be used during fixed term for mandatory grounds
  const warnings: string[] = [...periodResult.warnings];

  const earliest_valid_date = toISODateString(expiryDateObj);

  const explanation =
    `We calculated this date by adding ${periodResult.used_days} days to your service date (${formatDate(serviceDateObj)}). ` +
    periodResult.explanation_minimum;

  return {
    earliest_valid_date,
    notice_period_days: periodResult.used_days,
    explanation,
    legal_basis: periodResult.legal_basis,
    warnings,
    minimum_legal_days: periodResult.minimum_legal_days,
    recommended_days: periodResult.recommended_days,
    used_days: periodResult.used_days,
    explanation_minimum: periodResult.explanation_minimum,
    explanation_recommended: periodResult.explanation_recommended,
    policy_flags: periodResult.policy_flags,
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
 * Calculate notice period for Scotland Notice to Leave
 *
 * NEW UNIFIED LOGIC (Production-Grade):
 * - Ground 1/12/13/14 with pre-action: 28 days
 * - Ground 1/12 without pre-action: 84 days
 * - All other grounds: 84 days (unless 28-day grounds like 2,3,9,10,11,16,18)
 * - Mixed grounds: Use SHORTEST applicable period (Math.min)
 */
export function calculateScotlandNoticeToLeaveExpiryDate(
  params: NoticeToLeaveDateParams
): DateCalculationResult {
  const { service_date, grounds, pre_action_completed = false } = params;

  if (!grounds || grounds.length === 0) {
    throw new Error('At least one ground is required');
  }

  const serviceDateObj = parseUTCDate(service_date);
  const groundNumbers = grounds.map((g) => g.number);

  // FIXED: Use Math.min for mixed grounds (shortest period applies)
  const periods: number[] = [];
  const explanations: string[] = [];

  // Ground 1 (Rent arrears)
  if (groundNumbers.includes(1)) {
    if (pre_action_completed) {
      periods.push(28);
      explanations.push('Ground 1 with pre-action: 28 days');
    } else {
      periods.push(84);
      explanations.push('Ground 1 without pre-action: 84 days');
    }
  }

  // Ground 12 (Persistent rent arrears)
  if (groundNumbers.includes(12)) {
    if (pre_action_completed) {
      periods.push(28);
      explanations.push('Ground 12 with pre-action: 28 days');
    } else {
      periods.push(84);
      explanations.push('Ground 12 without pre-action: 84 days');
    }
  }

  // Grounds 13, 14 (ASB, criminal)
  if (groundNumbers.includes(13)) {
    periods.push(28);
    explanations.push('Ground 13 (antisocial behaviour): 28 days');
  }

  if (groundNumbers.includes(14)) {
    periods.push(28);
    explanations.push('Ground 14 (criminal conduct): 28 days');
  }

  // Ground 2 (Breach of tenancy)
  if (groundNumbers.includes(2)) {
    periods.push(28);
    explanations.push('Ground 2 (breach of tenancy): 28 days');
  }

  // Ground 3 (Antisocial behaviour - tenant)
  if (groundNumbers.includes(3)) {
    periods.push(28);
    explanations.push('Ground 3 (antisocial behaviour): 28 days');
  }

  // Ground 9 (Overcrowding)
  if (groundNumbers.includes(9)) {
    periods.push(28);
    explanations.push('Ground 9 (overcrowding): 28 days');
  }

  // Ground 10 (Landlord ceasing registration)
  if (groundNumbers.includes(10)) {
    periods.push(28);
    explanations.push('Ground 10 (landlord ceasing registration): 28 days');
  }

  // Ground 11 (Not principal home)
  if (groundNumbers.includes(11)) {
    periods.push(28);
    explanations.push('Ground 11 (not principal home): 28 days');
  }

  // Ground 16 (Temporary accommodation)
  if (groundNumbers.includes(16)) {
    periods.push(28);
    explanations.push('Ground 16 (temporary accommodation): 28 days');
  }

  // Ground 18 (False statement)
  if (groundNumbers.includes(18)) {
    periods.push(28);
    explanations.push('Ground 18 (false statement): 28 days');
  }

  // All other grounds default to 84 days
  const otherGrounds = groundNumbers.filter(
    (n) => ![1, 2, 3, 9, 10, 11, 12, 13, 14, 16, 18].includes(n)
  );
  if (otherGrounds.length > 0) {
    periods.push(84);
    explanations.push(`Ground(s) ${otherGrounds.join(', ')}: 84 days`);
  }

  // If no periods were added, default to 84
  if (periods.length === 0) {
    periods.push(84);
    explanations.push('Selected grounds: 84 days');
  }

  // Use SHORTEST applicable period (Math.min)
  const notice_period_days = Math.min(...periods);

  // Build explanation
  let explanation: string;
  if (periods.length > 1) {
    explanation =
      `Multiple grounds selected. Shortest applicable period: ${notice_period_days} days. ` +
      `(${explanations.join(', ')})`;
  } else {
    explanation = explanations[0];
  }

  const expiryDateObj = addUTCDays(serviceDateObj, notice_period_days);
  const earliest_valid_date = toISODateString(expiryDateObj);

  return {
    earliest_valid_date,
    notice_period_days,
    explanation,
    legal_basis: 'Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3',
    warnings: [],
    minimum_legal_days: notice_period_days,
    used_days: notice_period_days,
  };
}

/**
 * Legacy function for backwards compatibility
 * Now redirects to calculateScotlandNoticeToLeaveExpiryDate
 */
export function calculateNoticeToLeaveDate(params: NoticeToLeaveDateParams): DateCalculationResult {
  return calculateScotlandNoticeToLeaveExpiryDate(params);
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
// WALES DATE CALCULATION (RENTING HOMES ACT 2016)
// ============================================================================

/**
 * Wales Section 173 Date Params
 *
 * CLAUDE CODE FIX #1: Rule data passed in, not loaded
 * Server-side config loader provides rule data
 */
export interface WalesSection173DateParams {
  service_date: string;
  contract_start_date: string;
  // Rule data (loaded server-side, passed in)
  notice_period_months: number;
  notice_period_days: number;
  prohibited_period_months: number;
  legal_reference: string;
  effective_from: string;
}

/**
 * Wales Section 173 Date Calculator
 *
 * CLAUDE CODE FIX #1: Pure function, no fs operations
 * Rule data passed in from server-side config loader
 *
 * Validates prohibited period and calculates expiry date
 */
export function calculateWalesSection173ExpiryDate(
  params: WalesSection173DateParams
): DateCalculationResult {
  const {
    service_date,
    contract_start_date,
    notice_period_months,
    notice_period_days,
    prohibited_period_months,
    legal_reference,
    effective_from,
  } = params;

  const serviceDateObj = parseUTCDate(service_date);
  const contractStartObj = parseUTCDate(contract_start_date);

  // Automatic prohibited period calculation
  const prohibitedUntil = new Date(contractStartObj);
  prohibitedUntil.setUTCMonth(prohibitedUntil.getUTCMonth() + prohibited_period_months);

  if (serviceDateObj < prohibitedUntil) {
    const earliestServiceStr = toISODateString(prohibitedUntil);
    const earliestExpiryObj = new Date(prohibitedUntil);
    earliestExpiryObj.setUTCMonth(earliestExpiryObj.getUTCMonth() + notice_period_months);
    const earliestExpiryStr = toISODateString(earliestExpiryObj);

    throw new Error(
      `WALES_SECTION173_PROHIBITED_PERIOD: ` +
        `Section 173 cannot be served within first ${prohibited_period_months} months. ` +
        `Contract started: ${contract_start_date}. ` +
        `Earliest service: ${earliestServiceStr}. ` +
        `Earliest expiry: ${earliestExpiryStr}.`
    );
  }

  // Calculate expiry (add months, not days)
  const expiryDateObj = new Date(serviceDateObj);
  expiryDateObj.setUTCMonth(expiryDateObj.getUTCMonth() + notice_period_months);
  const earliest_expiry_date = toISODateString(expiryDateObj);

  const explanation =
    `Wales Section 173: ${notice_period_months} months from ${service_date} = ${earliest_expiry_date}. ` +
    `Rule effective from: ${effective_from}.`;

  return {
    earliest_valid_date: earliest_expiry_date,
    notice_period_days: notice_period_days,
    explanation,
    legal_basis: legal_reference,
    warnings: [
      `Wales uses Occupation Contracts (not ASTs)`,
      `Cannot serve within first ${prohibited_period_months} months`,
      `Rule effective from: ${effective_from}`,
    ],
    minimum_legal_days: notice_period_days,
    used_days: notice_period_days,
    policy_flags: {
      has_discretionary: false,
      has_ground14: false,
    },
  };
}

/**
 * Wales Fault-Based Notice Calculator
 *
 * Uses fixed periods from config:
 * - Section 157: 14 days (serious rent arrears)
 * - Section 159: 30 days (some rent arrears)
 * - Section 161: 14 days (antisocial behaviour)
 * - Section 162: 30 days (breach of contract)
 */
export interface WalesFaultBasedDateParams {
  service_date: string;
  section_number: number; // 157, 159, 161, 162
  period_days: number; // From server config
  description: string; // From server config
  legal_reference: string; // From server config
}

export function calculateWalesFaultBasedExpiryDate(
  params: WalesFaultBasedDateParams
): DateCalculationResult {
  const { service_date, section_number, period_days, description, legal_reference } = params;

  const serviceDateObj = parseUTCDate(service_date);
  const expiryDateObj = addUTCDays(serviceDateObj, period_days);
  const earliest_expiry_date = toISODateString(expiryDateObj);

  const explanation =
    `Wales Section ${section_number} (${description}): ${period_days} days from ${service_date} = ${earliest_expiry_date}.`;

  return {
    earliest_valid_date: earliest_expiry_date,
    notice_period_days: period_days,
    explanation,
    legal_basis: legal_reference,
    warnings: [`Wales uses Occupation Contracts (not ASTs)`, `Contract holder = tenant`],
    minimum_legal_days: period_days,
    used_days: period_days,
    policy_flags: {
      has_discretionary: false,
      has_ground14: false,
    },
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
export function toISODateString(date: Date): string {
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
