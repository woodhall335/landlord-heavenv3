/**
 * Notice-Only Case Validator
 *
 * Provides server-side validation for Notice Only cases.
 * Ensures rent schedule data is present when arrears grounds are included.
 * Computes included grounds based on persisted toggle state.
 *
 * Use this validator in:
 * - Checkout session creation (to block checkout if data missing)
 * - Preview generation (to block preview if data missing)
 * - Document generation (to ensure no blank documents)
 */

import {
  hasArrearsGround,
  normalizeGroundCode,
  calculateCombinedNoticePeriod,
} from '@/lib/grounds/notice-period-utils';
import { isArrearsEvidenceComplete } from '@/lib/grounds/evidence-suggestions';

/**
 * Validation error thrown when notice-only case validation fails
 */
export class NoticeOnlyCaseValidationError extends Error {
  code: string;
  details?: Record<string, any>;

  constructor(code: string, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'NoticeOnlyCaseValidationError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Validation result interface
 */
export interface NoticeOnlyValidationResult {
  valid: boolean;
  includedGrounds: string[];
  noticePeriodDays: number;
  includesArrearsGrounds: boolean;
  arrearsScheduleComplete: boolean;
  errors: Array<{ code: string; message: string }>;
  warnings: Array<{ code: string; message: string }>;
}

/**
 * Extract and normalize case facts for validation
 */
function extractCaseFacts(facts: Record<string, any>): {
  selectedGrounds: string[];
  recommendedGrounds: string[];
  includeRecommendedGrounds: boolean;
  arrearsItems: Array<{ period_start: string; rent_due: number; amount_owed: number }>;
  jurisdiction: string;
  noticeRoute: string;
} {
  // Selected grounds from wizard
  const selectedGroundsRaw: string[] = facts?.section8_grounds || [];
  const selectedGrounds = selectedGroundsRaw.map((g) => normalizeGroundCode(g));

  // Recommended grounds from decision engine (stored in facts after analysis)
  const recommendedGroundsRaw: any[] = facts?.recommended_grounds || [];
  const recommendedGrounds = recommendedGroundsRaw
    .map((g: any) => (typeof g === 'string' ? g : g.code))
    .filter(Boolean)
    .map((g: string) => normalizeGroundCode(g));

  // Toggle state (persisted from review page)
  const includeRecommendedGrounds = facts?.include_recommended_grounds === true;

  // Arrears items
  const arrearsItems = facts?.arrears_items || [];

  // Jurisdiction and route
  const jurisdiction = facts?.jurisdiction || facts?.__meta?.jurisdiction || 'england';
  const noticeRoute = facts?.selected_notice_route || facts?.eviction_route || 'section_8';

  return {
    selectedGrounds,
    recommendedGrounds,
    includeRecommendedGrounds,
    arrearsItems,
    jurisdiction,
    noticeRoute,
  };
}

/**
 * Compute included grounds based on toggle state
 * Returns deduplicated array of ground codes
 */
export function computeIncludedGrounds(facts: Record<string, any>): string[] {
  const { selectedGrounds, recommendedGrounds, includeRecommendedGrounds } =
    extractCaseFacts(facts);

  if (includeRecommendedGrounds) {
    // Include both selected and recommended, deduplicated
    const combined = new Set([...selectedGrounds, ...recommendedGrounds]);
    return Array.from(combined);
  }

  // Only selected grounds
  return selectedGrounds;
}

/**
 * Validate a notice-only case for completeness
 *
 * @param facts - The case facts (collected_facts or wizard_facts)
 * @returns Validation result with included grounds, notice period, and any errors
 */
export function validateNoticeOnlyCase(facts: Record<string, any>): NoticeOnlyValidationResult {
  const errors: Array<{ code: string; message: string }> = [];
  const warnings: Array<{ code: string; message: string }> = [];

  const { selectedGrounds, recommendedGrounds, includeRecommendedGrounds, arrearsItems, noticeRoute } =
    extractCaseFacts(facts);

  // Compute included grounds
  const includedGrounds = computeIncludedGrounds(facts);

  // Check if Section 8 route with grounds
  const isSection8 = noticeRoute === 'section_8';

  if (isSection8 && includedGrounds.length === 0) {
    errors.push({
      code: 'NO_GROUNDS_SELECTED',
      message: 'Please select at least one ground for your Section 8 notice.',
    });
  }

  // Calculate notice period
  const noticePeriodResult = calculateCombinedNoticePeriod(includedGrounds);
  const noticePeriodDays = noticePeriodResult.noticePeriodDays;

  // Check for arrears grounds
  const includesArrearsGrounds = hasArrearsGround(includedGrounds);

  // Validate arrears schedule if arrears grounds are included
  const arrearsStatus = isArrearsEvidenceComplete(includedGrounds, arrearsItems);
  const arrearsScheduleComplete = arrearsStatus.complete;

  if (includesArrearsGrounds && !arrearsScheduleComplete) {
    errors.push({
      code: 'ARREARS_SCHEDULE_INCOMPLETE',
      message: arrearsStatus.message,
    });
  }

  // Add warning if including recommended grounds changes notice period
  if (includeRecommendedGrounds && recommendedGrounds.length > 0) {
    const selectedOnlyPeriod = calculateCombinedNoticePeriod(selectedGrounds);
    if (noticePeriodDays > selectedOnlyPeriod.noticePeriodDays) {
      warnings.push({
        code: 'NOTICE_PERIOD_INCREASED',
        message: `Including recommended grounds has increased your notice period from ${selectedOnlyPeriod.noticePeriodDays} days to ${noticePeriodDays} days.`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    includedGrounds,
    noticePeriodDays,
    includesArrearsGrounds,
    arrearsScheduleComplete,
    errors,
    warnings,
  };
}

/**
 * Validate notice-only case and throw if invalid
 *
 * Use this in API routes to enforce validation:
 * - Returns validation result if valid
 * - Throws NoticeOnlyCaseValidationError if invalid
 *
 * @param facts - The case facts
 * @throws NoticeOnlyCaseValidationError if validation fails
 */
export function validateNoticeOnlyCaseOrThrow(
  facts: Record<string, any>
): NoticeOnlyValidationResult {
  const result = validateNoticeOnlyCase(facts);

  if (!result.valid) {
    const primaryError = result.errors[0];
    throw new NoticeOnlyCaseValidationError(primaryError.code, primaryError.message, {
      errors: result.errors,
      warnings: result.warnings,
      includedGrounds: result.includedGrounds,
      noticePeriodDays: result.noticePeriodDays,
    });
  }

  return result;
}

/**
 * Check if a case requires rent schedule document
 * (i.e., has arrears grounds in included grounds)
 */
export function requiresRentSchedule(facts: Record<string, any>): boolean {
  const includedGrounds = computeIncludedGrounds(facts);
  return hasArrearsGround(includedGrounds);
}

/**
 * Check if a case is ready for checkout
 * Returns { ready: boolean, blockers: string[] }
 */
export function isReadyForCheckout(facts: Record<string, any>): {
  ready: boolean;
  blockers: string[];
} {
  const validation = validateNoticeOnlyCase(facts);
  const blockers = validation.errors.map((e) => e.message);

  return {
    ready: validation.valid,
    blockers,
  };
}

/**
 * Get computed notice period for a case
 * Uses persisted toggle state to determine included grounds
 */
export function getComputedNoticePeriod(facts: Record<string, any>): {
  noticePeriodDays: number;
  drivingGrounds: string[];
  explanation: string;
} {
  const includedGrounds = computeIncludedGrounds(facts);
  return calculateCombinedNoticePeriod(includedGrounds);
}
