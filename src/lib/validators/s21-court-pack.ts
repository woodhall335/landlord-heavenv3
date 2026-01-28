/**
 * Section 21 Court Pack Inline Validators
 *
 * CRITICAL: These validators catch issues that can cause court rejections
 * or invalid Section 21 claims. They are designed to fire onChange to
 * give immediate feedback to users.
 *
 * Three main validation categories:
 * 1. Prescribed Information Date - Must be on/after deposit protection date
 * 2. Gas Safety Certificate Dates - Issue date required for N5B, timing checks
 * 3. Filing Window - Warns about tight deadlines before notice expires
 *
 * @module validators/s21-court-pack
 */

import type {
  ValidationResult,
  FilingWindowResult,
  GasCertificateValidationResult,
  PrescribedInfoValidationResult,
} from './types';

// =============================================================================
// DATE HELPERS
// =============================================================================

/**
 * Format a date for display in validation messages.
 * Uses UK date format (DD/MM/YYYY).
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid date';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Calculate the difference in days between two dates.
 * Returns positive if date2 > date1.
 */
export function differenceInDays(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
}

/**
 * Calculate the difference in months between two dates.
 * Returns positive if date2 > date1.
 */
export function differenceInMonths(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const months =
    (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  const dayDiff = d2.getDate() - d1.getDate();

  // Adjust for partial months
  return dayDiff < 0 ? months - 1 : months;
}

/**
 * Add months to a date.
 */
export function addMonths(date: Date | string, months: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Parse a date string or Date to a Date object.
 * Returns null if invalid.
 */
export function parseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? null : d;
}

// =============================================================================
// TASK 1: PRESCRIBED INFORMATION DATE VALIDATION
// =============================================================================

/**
 * Validate that prescribed information date is valid relative to deposit protection date.
 *
 * CRITICAL RULES:
 * 1. Prescribed info cannot be served BEFORE deposit was protected (impossible)
 * 2. Prescribed info should be served within 30 days of deposit protection (legal requirement)
 *
 * @param prescribedInfoDate - Date prescribed information was given to tenant
 * @param depositProtectionDate - Date deposit was protected in scheme
 * @returns ValidationResult indicating validity and any issues
 */
export function validatePrescribedInfoDate(
  prescribedInfoDate: Date | string | null | undefined,
  depositProtectionDate: Date | string | null | undefined
): PrescribedInfoValidationResult {
  const prescribedDate = parseDate(prescribedInfoDate);
  const protectionDate = parseDate(depositProtectionDate);

  // If either date is missing, we can't validate
  if (!prescribedDate || !protectionDate) {
    return {
      valid: true,
      severity: 'info',
      field: 'prescribed_info_date',
      message: '',
      blocking: false,
    };
  }

  // Check 1: Prescribed info cannot be BEFORE deposit protection
  if (prescribedDate < protectionDate) {
    return {
      valid: false,
      severity: 'error',
      field: 'prescribed_info_date',
      message: `Prescribed information cannot be served before the deposit was protected. Your deposit was protected on ${formatDate(protectionDate)}, so prescribed info must be on or after this date.`,
      helpText:
        'The law requires you to protect the deposit FIRST, then serve prescribed information within 30 days. If you served prescribed info on the same day as protection, enter that date.',
      blocking: true,
      daysDifference: differenceInDays(protectionDate, prescribedDate),
    };
  }

  // Check 2: Prescribed info should be within 30 days of protection
  const daysDiff = differenceInDays(protectionDate, prescribedDate);
  if (daysDiff > 30) {
    return {
      valid: false,
      severity: 'warning',
      field: 'prescribed_info_date',
      message: `Prescribed information was served ${daysDiff} days after deposit protection. The legal requirement is within 30 days.`,
      helpText:
        'If prescribed info was served more than 30 days after protection, your Section 21 notice may be invalid. Consider seeking legal advice before proceeding.',
      blocking: false,
      daysDifference: daysDiff,
    };
  }

  return {
    valid: true,
    severity: 'info',
    field: 'prescribed_info_date',
    message: '',
    blocking: false,
    daysDifference: daysDiff,
  };
}

// =============================================================================
// TASK 2: GAS SAFETY CERTIFICATE DATE VALIDATION
// =============================================================================

/**
 * Validate gas safety certificate dates for N5B form compliance.
 *
 * CRITICAL RULES:
 * 1. Issue date is REQUIRED for N5B Q17b (courts reject incomplete forms)
 * 2. Issue date must be on/before served date (can't serve before issued)
 * 3. Certificate must be valid (within 12 months) at tenancy start
 * 4. Certificate should be served before occupation (Section 21 requirement)
 *
 * @param hasGasFittings - Whether the property has gas appliances
 * @param gasCertIssueDate - Date certificate was issued by engineer
 * @param gasCertServedDate - Date certificate was given to tenant
 * @param tenancyStartDate - Date tenancy started
 * @returns Array of ValidationResults for any issues found
 */
export function validateGasCertificateDates(
  hasGasFittings: boolean | null | undefined,
  gasCertIssueDate: Date | string | null | undefined,
  gasCertServedDate: Date | string | null | undefined,
  tenancyStartDate: Date | string | null | undefined
): GasCertificateValidationResult {
  const errors: ValidationResult[] = [];

  // If no gas fittings, no validation needed
  if (hasGasFittings !== true) {
    return { errors, isValid: true };
  }

  const issueDate = parseDate(gasCertIssueDate);
  const servedDate = parseDate(gasCertServedDate);
  const startDate = parseDate(tenancyStartDate);

  // Check 1: Issue date is required for N5B
  if (!issueDate) {
    errors.push({
      valid: false,
      severity: 'error',
      field: 'gas_cert_issue_date',
      message: 'Gas safety certificate issue date is required for the N5B form.',
      helpText:
        'Check your CP12 certificate - the issue date is when the Gas Safe engineer completed the inspection.',
      blocking: true,
    });
  }

  // Check 2: Issue date must be on/before served date
  if (issueDate && servedDate && issueDate > servedDate) {
    errors.push({
      valid: false,
      severity: 'error',
      field: 'gas_cert_issue_date',
      message: 'Certificate issue date cannot be after the date you served it to the tenant.',
      helpText:
        'The certificate must be issued before it can be served. Please check both dates.',
      blocking: true,
    });
  }

  // Check 3: Certificate must be valid (within 12 months) at tenancy start
  if (issueDate && startDate) {
    const monthsSinceIssue = differenceInMonths(issueDate, startDate);
    if (monthsSinceIssue > 12) {
      errors.push({
        valid: false,
        severity: 'error',
        field: 'gas_cert_issue_date',
        message: `Gas certificate was ${monthsSinceIssue} months old at tenancy start. Certificates are only valid for 12 months.`,
        helpText:
          'You must have provided a valid (less than 12 months old) gas safety certificate before the tenant moved in.',
        blocking: true,
      });
    }
  }

  // Check 4: Certificate should be served before occupation
  if (servedDate && startDate && servedDate > startDate) {
    errors.push({
      valid: false,
      severity: 'warning',
      field: 'gas_cert_served_date',
      message: 'Gas certificate should be provided BEFORE the tenant moves in.',
      helpText:
        'The law requires landlords to provide the gas safety record before occupation. If you provided it after, your Section 21 may be challenged.',
      blocking: false,
    });
  }

  return {
    errors,
    isValid: errors.filter((e) => e.blocking).length === 0,
  };
}

// =============================================================================
// TASK 3: FILING WINDOW CALCULATION
// =============================================================================

/**
 * Calculate the filing window for a Section 21 claim.
 *
 * Section 21 notices are only valid for 6 months from service date.
 * The court application cannot be made until after the possession date.
 * Therefore: Filing window = (Service date + 6 months) - Possession date
 *
 * @param noticeServiceDate - Date the Section 21 notice was served
 * @param possessionDate - Earliest date possession can be sought (notice expiry)
 * @returns FilingWindowResult with window days and any warnings
 */
export function calculateFilingWindow(
  noticeServiceDate: Date | string | null | undefined,
  possessionDate: Date | string | null | undefined
): FilingWindowResult {
  const serviceDate = parseDate(noticeServiceDate);
  const posDate = parseDate(possessionDate);

  // Default result if dates are missing
  if (!serviceDate || !posDate) {
    return {
      windowDays: 0,
      expiryDate: new Date(),
      warning: null,
    };
  }

  // Notice expires 6 months after service
  const noticeExpiryDate = addMonths(serviceDate, 6);
  const windowDays = differenceInDays(posDate, noticeExpiryDate);

  let warning: ValidationResult | null = null;

  // Check 1: Notice expires BEFORE possession date (fatal)
  if (windowDays <= 0) {
    warning = {
      valid: false,
      severity: 'error',
      field: 'filing_window',
      message: `Your notice will expire BEFORE you can apply to court. The notice expires on ${formatDate(noticeExpiryDate)} but you cannot apply until after ${formatDate(posDate)}.`,
      helpText:
        'You need to serve a new notice with an earlier possession date, or serve it later so the 6-month validity period extends past the possession date.',
      blocking: true,
    };
  }
  // Check 2: Very tight window (14 days or less)
  else if (windowDays <= 14) {
    warning = {
      valid: true, // Allow but warn strongly
      severity: 'error',
      field: 'filing_window',
      message: `CRITICAL: You only have ${windowDays} days to file at court after ${formatDate(posDate)}. Your notice expires on ${formatDate(noticeExpiryDate)}.`,
      helpText:
        'This is an extremely tight window. Courts can take several days to process applications. We strongly recommend serving your notice later to give yourself more time, or being ready to file immediately on the possession date.',
      blocking: false,
    };
  }
  // Check 3: Tight window (30 days or less)
  else if (windowDays <= 30) {
    warning = {
      valid: true,
      severity: 'warning',
      field: 'filing_window',
      message: `You have ${windowDays} days to file at court between ${formatDate(posDate)} and ${formatDate(noticeExpiryDate)}.`,
      helpText:
        'Set a calendar reminder to file your N5B as soon as the possession date passes. If you miss this window, your notice becomes invalid.',
      blocking: false,
    };
  }

  return {
    windowDays,
    expiryDate: noticeExpiryDate,
    warning,
  };
}

// =============================================================================
// COMBINED STEP VALIDATION
// =============================================================================

/**
 * Validate the deposit compliance step.
 *
 * @param facts - Current wizard facts
 * @returns Array of ValidationResults for the deposit compliance step
 */
export function validateDepositComplianceStep(facts: {
  deposit_protected?: boolean;
  deposit_protection_date?: string;
  prescribed_info_served?: boolean;
  prescribed_info_date?: string;
}): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Only validate if deposit is protected and prescribed info was served
  if (
    facts.deposit_protected === true &&
    facts.prescribed_info_served === true &&
    facts.deposit_protection_date &&
    facts.prescribed_info_date
  ) {
    const prescribedResult = validatePrescribedInfoDate(
      facts.prescribed_info_date,
      facts.deposit_protection_date
    );

    if (!prescribedResult.valid) {
      results.push(prescribedResult);
    }
  }

  return results;
}

/**
 * Validate the gas safety step.
 *
 * @param facts - Current wizard facts
 * @returns Array of ValidationResults for the gas safety step
 */
export function validateGasSafetyStep(facts: {
  has_gas_appliances?: boolean;
  gas_cert_issue_date?: string;
  gas_safety_served_date?: string;
  tenancy_start_date?: string;
}): ValidationResult[] {
  const { errors } = validateGasCertificateDates(
    facts.has_gas_appliances,
    facts.gas_cert_issue_date,
    facts.gas_safety_served_date,
    facts.tenancy_start_date
  );

  return errors;
}

/**
 * Validate the review step (filing window check).
 *
 * @param facts - Current wizard facts
 * @returns Array of ValidationResults for the review step
 */
export function validateReviewStep(facts: {
  notice_service_date?: string;
  possession_date?: string;
}): ValidationResult[] {
  const results: ValidationResult[] = [];

  const { warning } = calculateFilingWindow(
    facts.notice_service_date,
    facts.possession_date
  );

  if (warning) {
    results.push(warning);
  }

  return results;
}
