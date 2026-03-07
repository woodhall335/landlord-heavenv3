import type { JurisdictionKey } from '@/lib/jurisdictions/rulesLoader';
import { evaluateWizardGate, type WizardGateResult } from '@/lib/wizard/gating';
import {
  validateGround8Eligibility,
  hasAuthoritativeArrearsData,
} from '@/lib/arrears-engine';
import type { ArrearsItem, TenancyFacts } from '@/lib/case-facts/schema';

export interface NoticeValidationFailure {
  code: string;
  user_message: string;
  internal_reason?: string;
  fields?: string[];
  affected_question_id?: string;
  user_fix_hint?: string;
}

export interface NoticeValidationOutcome {
  blocking: NoticeValidationFailure[];
  warnings: NoticeValidationFailure[];
}

/**
 * Product type for validation context
 */
export type EvictionPackProduct = 'notice_only' | 'complete_pack';

export function validateNoticeOnlyBeforeRender(params: {
  jurisdiction: JurisdictionKey;
  facts: Record<string, any>;
  selectedGroundCodes: number[];
  selectedRoute?: string;
  stage?: 'wizard' | 'preview' | 'generate';
}): NoticeValidationOutcome {
  const { jurisdiction, facts, selectedGroundCodes, stage = 'wizard' } = params;
  const hasGroundsArray = Array.isArray(facts.section8_grounds) && facts.section8_grounds.length > 0;
  const inferredGrounds = selectedGroundCodes.length > 0
    ? selectedGroundCodes.map((code) => `ground_${code}`)
    : undefined;
  const factsWithGrounds = hasGroundsArray || !inferredGrounds
    ? facts
    : { ...facts, section8_grounds: inferredGrounds };

  const wizardGate: WizardGateResult = evaluateWizardGate({
    case_type: 'eviction',
    product: 'notice_only',
    jurisdiction,
    facts: factsWithGrounds,
    stage,
  });

  return {
    blocking: wizardGate.blocking.map((b) => ({
      code: b.code,
      user_message: b.user_message ?? b.message,
      internal_reason: b.internal_reason,
      fields: b.fields,
      affected_question_id: (b as any).affected_question_id,
      user_fix_hint: b.user_fix_hint,
    })),
    warnings: wizardGate.warnings.map((w) => ({
      code: w.code,
      user_message: w.message,
      fields: w.fields,
      affected_question_id: (w as any).affected_question_id,
      user_fix_hint: (w as any).user_fix_hint,
    })),
  };
}

export function assertNoticeOnlyValid(params: {
  jurisdiction: JurisdictionKey;
  facts: Record<string, any>;
  selectedGroundCodes: number[];
}): void {
  const outcome = validateNoticeOnlyBeforeRender(params);
  if (outcome.blocking.length > 0) {
    const message = outcome.blocking.map((b) => `${b.code}: ${b.user_message}`).join('; ');
    const error = new Error(`NOTICE_ONLY_VALIDATION_FAILED: ${message}`);
    throw error;
  }
}

// ============================================================================
// COMPLETE PACK VALIDATION
// ============================================================================

/**
 * Additional validation requirements for complete eviction packs (court forms).
 *
 * For Section 21 (no-fault) cases in England, the N5B form requires:
 * - notice_service_method (how the notice was served)
 * - section_21_notice_date (when the notice was served)
 * - tenancy_start_date (when the tenancy began)
 * - court_name (the court where the claim will be filed)
 *
 * For Section 8 cases with Ground 8, the arrears threshold MUST be met
 * as a hard blocker (not just a warning).
 *
 * NOTE: This validation is targeted specifically for complete pack court form requirements.
 * It does NOT call the full wizard gating validation (which includes eligibility rules
 * that may use natural language expressions that cannot be evaluated). Complete pack
 * generation validates the minimum required fields for court form filling.
 */
export function validateCompletePackBeforeGeneration(params: {
  jurisdiction: JurisdictionKey;
  facts: Record<string, any>;
  selectedGroundCodes: number[];
  caseType: 'no_fault' | 'rent_arrears' | 'antisocial' | 'breach' | 'landlord_needs' | 'other';
}): NoticeValidationOutcome {
  const { jurisdiction, facts, selectedGroundCodes, caseType } = params;

  // NOTE: We do NOT call validateNoticeOnlyBeforeRender here because it includes
  // eligibility rules from decision_rules.yaml that use natural language expressions
  // (e.g., "arrears >= 2 months rent equivalent") which cannot be evaluated as JavaScript.
  // Complete pack validation focuses specifically on the fields required for court form filling.
  const blocking: NoticeValidationFailure[] = [];
  const warnings: NoticeValidationFailure[] = [];

  // ============================================================================
  // S21 (no-fault) complete pack validation
  // N5B court form requires specific fields
  // ============================================================================
  if (caseType === 'no_fault' && (jurisdiction === 'england' || jurisdiction === 'wales')) {
    // Check notice_service_method - required for N5B field 10a
    const noticeServiceMethod = facts.notice_service_method ||
                                 facts.service_method ||
                                 facts.notice_service?.service_method ||
                                 facts['notice_service.service_method'];

    if (!noticeServiceMethod || (typeof noticeServiceMethod === 'string' && noticeServiceMethod.trim() === '')) {
      blocking.push({
        code: 'COMPLETE_PACK_MISSING_NOTICE_SERVICE_METHOD',
        user_message: 'Notice service method is required for N5B court form (field 10a: "How was the notice served")',
        fields: ['notice_service_method'],
        user_fix_hint: 'Specify how the Section 21 notice was served (e.g., "First class post", "Hand-delivered", "By hand").',
      });
    }

    // Check section_21_notice_date - required for N5B
    const section21NoticeDate = facts.section_21_notice_date ||
                                 facts.notice_date ||
                                 facts.notice_served_date;

    if (!section21NoticeDate) {
      blocking.push({
        code: 'COMPLETE_PACK_MISSING_SECTION_21_NOTICE_DATE',
        user_message: 'Section 21 notice date is required for N5B court form',
        fields: ['section_21_notice_date', 'notice_date'],
        user_fix_hint: 'Specify the date when the Section 21 notice was served.',
      });
    }

    // Check tenancy_start_date - required for N5B
    const tenancyStartDate = facts.tenancy_start_date;

    if (!tenancyStartDate) {
      blocking.push({
        code: 'COMPLETE_PACK_MISSING_TENANCY_START_DATE',
        user_message: 'Tenancy start date is required for N5B court form',
        fields: ['tenancy_start_date'],
        user_fix_hint: 'Specify when the tenancy began.',
      });
    }

    // Check court_name - required for all court forms
    const courtName = facts.court_name;

    if (!courtName || (typeof courtName === 'string' && courtName.trim() === '')) {
      blocking.push({
        code: 'COMPLETE_PACK_MISSING_COURT_NAME',
        user_message: 'Court name is required for court forms (N5, N5B, N119)',
        fields: ['court_name'],
        user_fix_hint: 'Use the HMCTS Court Finder to find your local County Court.',
      });
    }
  }

  // ============================================================================
  // PROCEDURAL DATE RULE: Signature date must be after notice expiry (Section 8)
  // Court claim forms cannot be validly signed/issued before the notice period expires.
  // ============================================================================
  if (caseType !== 'no_fault' && selectedGroundCodes.length > 0) {
    const noticeExpiryDate = facts.notice_expiry_date ||
                              facts.expiry_date ||
                              facts.notice?.expiry_date;
    const signatureDate = facts.signature_date ||
                           facts.signing?.signature_date;

    if (noticeExpiryDate && signatureDate) {
      // Parse dates and compare
      const expiryDateObj = new Date(noticeExpiryDate + 'T00:00:00Z');
      const sigDateObj = new Date(signatureDate + 'T00:00:00Z');

      if (!isNaN(expiryDateObj.getTime()) && !isNaN(sigDateObj.getTime())) {
        if (sigDateObj < expiryDateObj) {
          // Signature date is before notice expiry - this is a procedural error
          blocking.push({
            code: 'COMPLETE_PACK_SIGNATURE_BEFORE_NOTICE_EXPIRY',
            user_message: `Court claim forms cannot be signed before the notice period expires. ` +
                         `Notice expires ${noticeExpiryDate}, but signature date is ${signatureDate}.`,
            fields: ['signature_date', 'notice_expiry_date'],
            user_fix_hint: `Set the signature date to ${noticeExpiryDate} or later (earliest permissible date is the notice expiry date).`,
          });
        }
      }
    }
  }

  // ============================================================================
  // Ground 8 threshold enforcement for complete pack
  // Must be a hard blocker (not just warning) for court submission
  // Uses canonical arrears engine for validation
  // ============================================================================
  if (selectedGroundCodes.includes(8)) {
    // Check if Ground 8 threshold is met using canonical arrears engine
    const rentAmount = parseFloat(facts.rent_amount) || 0;
    const rentFrequency = (facts.rent_frequency || 'monthly') as TenancyFacts['rent_frequency'];

    // Get arrears_items from canonical locations
    const arrearsItems: ArrearsItem[] = facts.arrears_items ||
                                         facts['issues.rent_arrears.arrears_items'] || [];

    // Legacy flat total for backwards compatibility
    const legacyArrearsTotal = parseFloat(facts.arrears_amount) ||
                               parseFloat(facts.arrears_total) ||
                               parseFloat(facts.total_arrears) ||
                               parseFloat(facts.rent_arrears_amount) || 0;

    if (rentAmount > 0 && (arrearsItems.length > 0 || legacyArrearsTotal > 0)) {
      const ground8Result = validateGround8Eligibility({
        arrears_items: arrearsItems,
        rent_amount: rentAmount,
        rent_frequency: rentFrequency,
        jurisdiction: jurisdiction as 'england' | 'wales' | 'scotland' | 'northern-ireland',
        legacy_total_arrears: legacyArrearsTotal,
      });

      if (!ground8Result.is_eligible) {
        // Ensure Ground 8 threshold failure is a BLOCKER for complete pack
        const existingBlocker = blocking.find(b => b.code === 'GROUND_8_THRESHOLD_NOT_MET');
        if (!existingBlocker) {
          blocking.push({
            code: 'GROUND_8_THRESHOLD_NOT_MET',
            user_message: ground8Result.explanation,
            fields: ['arrears_items', 'section8_grounds'],
            user_fix_hint: 'Remove Ground 8 from your selection, or use discretionary grounds (Ground 10, 11) instead.',
          });
        }
      }

      // Warn if using legacy data without schedule
      if (!ground8Result.is_authoritative && ground8Result.legacy_warning) {
        warnings.push({
          code: 'GROUND_8_LEGACY_DATA_WARNING',
          user_message: ground8Result.legacy_warning,
          fields: ['arrears_items'],
          user_fix_hint: 'Complete the arrears schedule for stronger court evidence.',
        });
      }
    }
  }

  return { blocking, warnings };
}

/**
 * Assert that complete pack requirements are met before generation.
 * Throws EVICTION_PACK_VALIDATION_FAILED if blocking issues exist.
 */
export function assertCompletePackValid(params: {
  jurisdiction: JurisdictionKey;
  facts: Record<string, any>;
  selectedGroundCodes: number[];
  caseType: 'no_fault' | 'rent_arrears' | 'antisocial' | 'breach' | 'landlord_needs' | 'other';
}): void {
  const outcome = validateCompletePackBeforeGeneration(params);
  if (outcome.blocking.length > 0) {
    const message = outcome.blocking.map((b) => `${b.code}: ${b.user_message}`).join('; ');
    throw new Error(`EVICTION_PACK_VALIDATION_FAILED: ${message}`);
  }
}
