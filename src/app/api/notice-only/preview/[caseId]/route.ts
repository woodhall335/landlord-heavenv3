/**
 * Notice Only Pack Generation API (POST-PAYMENT ENDPOINT)
 *
 * GET /api/notice-only/preview/[caseId]
 *
 * ⚠️ SECURITY NOTE: Despite the "preview" name (historical), this is a PAID endpoint.
 * - Requires `assertPaidEntitlement()` before returning any documents
 * - Returns complete, final PDFs suitable for court use
 * - No watermarks (removed as part of simplified UX post-payment)
 *
 * This endpoint generates the complete Notice Only pack after payment has been verified.
 * The "preview" route name is legacy; consider renaming to /api/notice-only/pack/[caseId]
 * in a future refactor for clarity.
 */

import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient, tryGetServerUser } from '@/lib/supabase/server';
import { wizardFactsToCaseFacts, mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { generateNoticeOnlyPreview, type NoticeOnlyDocument } from '@/lib/documents/notice-only-preview-merger';
import { generateDocument } from '@/lib/documents/generator';
import {
  generateSection21Notice,
  mapWizardToSection21Data,
} from '@/lib/documents/section21-generator';
import { validateNoticeOnlyJurisdiction, formatValidationErrors } from '@/lib/jurisdictions/validator';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';
import { validateNoticeOnlyBeforeRender } from '@/lib/documents/noticeOnly';
import type { JurisdictionKey } from '@/lib/jurisdictions/rulesLoader';
import {
  type CanonicalJurisdiction,
  deriveCanonicalJurisdiction,
} from '@/lib/types/jurisdiction';
import { validateForPreview } from '@/lib/validation/previewValidation';
import { assertPaidEntitlement } from '@/lib/payments/entitlement';
import {
  validateNoticeOnlyCase,
  computeIncludedGrounds,
} from '@/lib/validation/notice-only-case-validator';
import { normalizeSection8Facts } from '@/lib/wizard/normalizeSection8Facts';
import { mapWalesFaultGroundsToGroundCodes, hasWalesArrearsGroundSelected, buildWalesPartDFromWizardFacts } from '@/lib/wales';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Helper: Get Scotland eviction ground legal basis
 */
function getScotlandGroundLegalBasis(groundNumber: number): string {
  const grounds: Record<number, string> = {
    1: 'Rent arrears for 3 consecutive months or more (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 1)',
    2: 'Persistent rent arrears (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 2)',
    3: 'Criminal behaviour (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 3)',
    4: 'Anti-social behaviour (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 4)',
    5: 'Landlord intends to sell (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 5)',
    6: 'Landlord intends to refurbish (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 6)',
    7: 'Landlord intends to live in property (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 7)',
    8: 'Landlord needs property for family member (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 8)',
  };
  return grounds[groundNumber] || `Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground ${groundNumber}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  let caseId = '';
  let jurisdiction: CanonicalJurisdiction | undefined;
  let validationJurisdiction: JurisdictionKey | undefined;
  let selected_route: string | undefined;

  const extractGroundCodes = (section8Grounds: any[]): number[] => {
    if (!Array.isArray(section8Grounds)) return [];
    return section8Grounds
      .map((g) => {
        if (typeof g === 'number') return g;
        if (typeof g !== 'string') return null;
        const match = g.match(/Ground\s+(\d+)/i) || g.match(/ground[_\s](\d+)/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((code): code is number => code !== null && !Number.isNaN(code));
  };

  try {
    const resolvedParams = await params;
    caseId = resolvedParams.caseId;
    console.log('[NOTICE-PREVIEW-API] Generating pack for case:', caseId);

    // CRITICAL: Payment verification MUST happen before returning any documents.
    // This prevents free access to final PDFs. Do NOT remove or bypass this check.
    await assertPaidEntitlement({ caseId, product: 'notice_only' });

    const user = await tryGetServerUser();
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();

    let query = supabase.from('cases').select('*').eq('id', caseId);

    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('[NOTICE-PREVIEW-API] Case not found:', fetchError);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const caseRow = data as any;

    // Get wizard facts
    const wizardFacts = caseRow.wizard_facts || caseRow.collected_facts || caseRow.facts || {};

    // ========================================================================
    // NORMALIZE SECTION 8 FACTS BEFORE VALIDATION
    // This backfills missing canonical fields from legacy/alternative locations:
    // - arrears_total from issues.rent_arrears.total_arrears
    // - ground_particulars.ground_8.summary from section8_details
    // ========================================================================
    normalizeSection8Facts(wizardFacts);

    const caseFacts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;

    // Determine jurisdiction and notice type (assign to outer scope for error handling)
    const derivedJurisdiction = deriveCanonicalJurisdiction(
      caseRow.jurisdiction,
      wizardFacts,
    );
    jurisdiction = derivedJurisdiction ?? undefined;

    if (!jurisdiction) {
      return NextResponse.json(
        {
          code: 'INVALID_JURISDICTION',
          error: 'Invalid or missing jurisdiction',
          user_message: 'A supported jurisdiction is required to generate a preview.',
          details: 'A supported jurisdiction is required to generate a preview.',
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    if (jurisdiction === 'northern-ireland') {
      return NextResponse.json(
        {
          code: 'NI_NOTICE_PREVIEW_UNSUPPORTED',
          error: 'NI_NOTICE_PREVIEW_UNSUPPORTED',
          user_message:
            'Eviction notices are not supported in Northern Ireland. Tenancy agreements remain available.',
          details: 'Eviction notices are not supported in Northern Ireland. Tenancy agreements remain available.',
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    validationJurisdiction = jurisdiction as JurisdictionKey;

    // Determine selected route with jurisdiction-aware fallback (assign to outer scope for error handling)
    // Check multiple fields as wizard may store route in different locations depending on flow
    selected_route =
      wizardFacts.selected_notice_route ||
      wizardFacts.eviction_route ||
      wizardFacts.eviction_route_intent ||
      wizardFacts.route_recommendation?.recommended_route;

    console.log('[NOTICE-PREVIEW-API] Jurisdiction:', jurisdiction);
    console.log('[NOTICE-PREVIEW-API] Selected route (raw):', selected_route);

    // NORMALIZE WALES ROUTES: Add 'wales_' prefix if missing
    // The wizard may store routes as 'section_173' or 'fault_based' but
    // the capability matrix expects 'wales_section_173' or 'wales_fault_based'
    if (jurisdiction === 'wales' && selected_route) {
      if (selected_route === 'section_173' || selected_route === 'fault_based') {
        const normalizedRoute = `wales_${selected_route}`;
        console.log(`[NOTICE-PREVIEW-API] Normalizing Wales route: ${selected_route} -> ${normalizedRoute}`);
        selected_route = normalizedRoute;
      }
    }

    // ========================================================================
    // WALES ROUTE SALVAGE: Prevent England routes from leaking into Wales cases
    // If route_recommendation leaks 'section_21' or 'section_8' for a Wales case,
    // derive the correct Wales route from facts instead of blocking.
    // ========================================================================
    if (jurisdiction === 'wales') {
      const rawRoute = selected_route;
      const isEnglandRoute = selected_route === 'section_21' || selected_route === 'section_8';
      const isUnknownRoute = !selected_route || (
        selected_route !== 'wales_section_173' &&
        selected_route !== 'wales_fault_based'
      );

      if (isEnglandRoute || isUnknownRoute) {
        // Determine Wales route by inspecting facts
        // If wales_fault_grounds exists with entries, use fault-based route
        const hasFaultGrounds = Array.isArray(wizardFacts.wales_fault_grounds) &&
          wizardFacts.wales_fault_grounds.length > 0;

        const resolvedRoute = hasFaultGrounds ? 'wales_fault_based' : 'wales_section_173';

        console.log('[NOTICE-PREVIEW-API] Wales route salvage:', {
          raw: rawRoute,
          resolved: resolvedRoute,
          reason: isEnglandRoute ? 'England route leaked into Wales case' : 'Unknown or missing route',
          hasFaultGrounds,
        });

        selected_route = resolvedRoute;
      }
    }

    // Apply jurisdiction-aware default if no route specified
    if (!selected_route) {
      if (jurisdiction === 'scotland') {
        selected_route = 'notice_to_leave';
      } else if (jurisdiction === 'wales') {
        selected_route = 'wales_section_173';
      } else {
        selected_route = 'section_8';
      }
      console.log(`[NOTICE-PREVIEW-API] No route specified, using jurisdiction default: ${selected_route}`);
    }

    console.log('[NOTICE-PREVIEW-API] Selected route (normalized):', selected_route);

    // DEFENSIVE FALLBACK: Fix jurisdiction based on selected_route
    // (In case E2E test or wizard created case with wrong jurisdiction)
    if (selected_route?.startsWith('wales_')) {
      if (jurisdiction !== 'wales') {
        console.warn(`[NOTICE-PREVIEW-API] Jurisdiction mismatch: selected_route is ${selected_route} but jurisdiction is ${jurisdiction}. Overriding to 'wales'.`);
        jurisdiction = 'wales';
        validationJurisdiction = 'wales';
      }
    } else if (selected_route === 'notice_to_leave') {
      if (jurisdiction !== 'scotland') {
        console.warn(`[NOTICE-PREVIEW-API] Jurisdiction mismatch: selected_route is ${selected_route} but jurisdiction is ${jurisdiction}. Overriding to 'scotland'.`);
        jurisdiction = 'scotland';
        validationJurisdiction = 'scotland';
      }
    }

    validationJurisdiction = validationJurisdiction || (jurisdiction as JurisdictionKey | undefined);

    // ============================================================================
    // VALIDATE JURISDICTION CONFIGURATION
    // ============================================================================
    console.log('[NOTICE-PREVIEW-API] Validating jurisdiction configuration:', jurisdiction);
    const validationResult = validateNoticeOnlyJurisdiction(jurisdiction);

    if (!validationResult.valid) {
      const errorMessage = formatValidationErrors(validationResult);
      console.error('[NOTICE-PREVIEW-API] Jurisdiction validation failed:\n', errorMessage);
      return NextResponse.json(
        {
          error: 'Jurisdiction configuration error',
          details: errorMessage,
          jurisdiction,
          missingPaths: validationResult.errors.flatMap(e => e.missingPaths),
        },
        { status: 500 }
      );
    }

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      console.warn('[NOTICE-PREVIEW-API] Jurisdiction warnings:\n', formatValidationErrors(validationResult));
    }

    const groundCodes = extractGroundCodes(wizardFacts.section8_grounds || []);

    // ========================================================================
    // DERIVE ground_codes FOR WALES FAULT-BASED ROUTE
    // Wales UI collects wales_fault_grounds (e.g., ['rent_arrears_serious']),
    // but validator requires ground_codes (e.g., ['section_157']).
    // Derive from same definitions that power the UI (single source of truth).
    // ========================================================================
    if (jurisdiction === 'wales' && selected_route === 'wales_fault_based') {
      const existingGroundCodes = wizardFacts.ground_codes;
      const hasGroundCodes = Array.isArray(existingGroundCodes) && existingGroundCodes.length > 0;
      const walesFaultGrounds = wizardFacts.wales_fault_grounds;
      const hasFaultGrounds = Array.isArray(walesFaultGrounds) && walesFaultGrounds.length > 0;

      if (!hasGroundCodes && hasFaultGrounds) {
        const derivedGroundCodes = mapWalesFaultGroundsToGroundCodes(walesFaultGrounds);
        wizardFacts.ground_codes = derivedGroundCodes;
        console.log('[NOTICE-PREVIEW-API] Derived ground_codes from wales_fault_grounds:', {
          wales_fault_grounds: walesFaultGrounds,
          derived_ground_codes: derivedGroundCodes,
        });
      }
    }

    // ============================================================================
    // UNIFIED VALIDATION VIA REQUIREMENTS ENGINE
    // ============================================================================
    console.log('[NOTICE-PREVIEW-API] Running unified validation via validateForPreview');
    const validationError = validateForPreview({
      jurisdiction,
      product: 'notice_only',
      route: selected_route,
      facts: wizardFacts,
      caseId,
    });

    if (validationError) {
      console.warn('[NOTICE-PREVIEW-API] Unified validation blocked preview:', {
        case_id: caseId,
      });
      return validationError; // Already a NextResponse with standardized 422 payload
    }

    // ============================================================================
    // NOTICE-ONLY SPECIFIC VALIDATION (Arrears Schedule Enforcement)
    // ============================================================================
    // For Section 8 route, enforce rent schedule data when arrears grounds are included
    // This is critical for post-payment document generation to prevent blank documents
    if (selected_route === 'section_8') {
      const noticeValidation = validateNoticeOnlyCase(wizardFacts);

      if (!noticeValidation.valid) {
        const primaryError = noticeValidation.errors[0];
        console.error('[NOTICE-PREVIEW-API] Notice-only validation failed (POST-PAYMENT):', {
          case_id: caseId,
          error_code: primaryError?.code,
          included_grounds: noticeValidation.includedGrounds,
          arrears_schedule_complete: noticeValidation.arrearsScheduleComplete,
          notice: 'This should not happen post-payment - checkout should have blocked',
        });

        return NextResponse.json(
          {
            code: primaryError?.code || 'NOTICE_ONLY_VALIDATION_FAILED',
            error: primaryError?.message || 'Notice-only case validation failed',
            user_message: 'Unable to generate your documents. Some required data is missing. Please contact support if this issue persists.',
            blocking_issues: noticeValidation.errors.map(e => ({
              code: e.code,
              description: e.message,
            })),
            warnings: noticeValidation.warnings.map(w => ({
              code: w.code,
              description: w.message,
            })),
            included_grounds: noticeValidation.includedGrounds,
            arrears_schedule_complete: noticeValidation.arrearsScheduleComplete,
            notice_period_days: noticeValidation.noticePeriodDays,
            // Include helpful metadata for debugging
            _debug: {
              stage: 'post-payment-pack-generation',
              jurisdiction,
              route: selected_route,
            },
          },
          { status: 422 }
        );
      }
    }

    // ========================================================================
    // LEGACY CONFIG-DRIVEN VALIDATION
    //
    // IMPORTANT: Since unified validation (validateForPreview) already ran and
    // passed, legacy validation must NOT block. This prevents drift where legacy
    // validators require fields the MQS doesn't collect.
    //
    // Legacy validation is kept for logging purposes only - any blocking issues
    // are logged as warnings but do NOT block the preview.
    // ========================================================================
    const validationOutcome = validateNoticeOnlyBeforeRender({
      jurisdiction: validationJurisdiction as JurisdictionKey,
      facts: wizardFacts,
      selectedGroundCodes: groundCodes,
      selectedRoute: selected_route,
      stage: 'preview',
    });

    const legacyBlockingIssues = validationOutcome.blocking ?? [];
    const legacyWarnings = validationOutcome.warnings ?? [];

    // Log legacy blocking issues for monitoring but do NOT block
    // This prevents legacy validator drift from blocking compliant cases
    // Gated behind NOTICE_ONLY_DEBUG to reduce log noise when unified validation passes
    if (legacyBlockingIssues.length > 0 && process.env.NOTICE_ONLY_DEBUG === '1') {
      console.warn('[NOTICE-PREVIEW-API] Legacy validation would have blocked (suppressed):', {
        case_id: caseId,
        issues: legacyBlockingIssues.map((b) => b.code),
        note: 'Unified validation passed - legacy blocking suppressed to prevent drift',
      });
    }

    // Legacy warnings are now gated behind NOTICE_ONLY_DEBUG flag
    // since unified validation passed, these are noise
    if (legacyWarnings.length > 0 && process.env.NOTICE_ONLY_DEBUG === '1') {
      console.log('[NOTICE-PREVIEW-API] Legacy validation warnings:', {
        case_id: caseId,
        warnings: legacyWarnings.map((w) => w.code),
      });
    }

    // ========================================================================
    // FINAL COMPLIANCE CHECK BEFORE GENERATION
    // ========================================================================
    const compliance = evaluateNoticeCompliance({
      jurisdiction,
      product: 'notice_only',
      selected_route,
      wizardFacts,
      stage: 'preview',
    });

    if (compliance.hardFailures.length > 0) {
      // Return structured validation data for the preview page to render a "Fix Issues" UI
      // NOTE: We do NOT return block_next_question for notice_only flows - navigation is never blocked.
      // The preview page should render a fixable compliance panel instead of throwing an error.
      console.info('[NOTICE-PREVIEW-API] Compliance check found blocking issues:', {
        case_id: caseId,
        jurisdiction,
        route: selected_route,
        failure_count: compliance.hardFailures.length,
        warning_count: compliance.warnings.length,
      });

      return NextResponse.json(
        {
          code: 'NOTICE_NONCOMPLIANT',
          error: 'NOTICE_NONCOMPLIANT',
          ok: false,
          // Structured blocking issues with canonical format
          blocking_issues: compliance.hardFailures.map(f => ({
            code: f.code,
            affected_question_id: f.affected_question_id,
            legal_reason: f.legal_reason,
            user_fix_hint: f.user_fix_hint,
            severity: 'blocking' as const,
          })),
          // Warnings for informational purposes
          warnings: compliance.warnings.map(w => ({
            code: w.code,
            affected_question_id: w.affected_question_id,
            legal_reason: w.legal_reason,
            user_fix_hint: w.user_fix_hint,
            severity: 'warning' as const,
          })),
          // Computed dates for display even when noncompliant
          computed: compliance.computed ?? null,
          // Issue counts for quick UI checks
          issue_counts: {
            blocking: compliance.hardFailures.length,
            warnings: compliance.warnings.length,
          },
          // Metadata for debugging/display
          jurisdiction,
          route: selected_route,
          case_id: caseId,
        },
        { status: 422 },
      );
    }

    const documents: NoticeOnlyDocument[] = [];

    // ===========================================================================
    // ENGLAND NOTICE ONLY PACK
    // ===========================================================================
    if (jurisdiction === 'england') {
      console.log('[NOTICE-PREVIEW-API] Generating England pack');

      // Use mapNoticeOnlyFacts() to build template data with proper address concatenation,
      // ground normalization, deposit logic, and date handling
      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // Debug: Log all critical fields to verify correct data flow
      // This helps diagnose blank dates and false compliance in Notice Only pack PDFs
      if (process.env.NOTICE_ONLY_DEBUG === '1' || process.env.NODE_ENV === 'development') {
        console.log('[NOTICE-PREVIEW-API] === SECTION 21 TEMPLATE DATA DEBUG ===');
        console.log('[NOTICE-PREVIEW-API] Key Dates:');
        console.log('  - tenancy_start_date:', templateData.tenancy_start_date);
        console.log('  - service_date:', templateData.service_date);
        console.log('  - notice_date:', templateData.notice_date);
        console.log('  - notice_expiry_date:', templateData.notice_expiry_date);
        console.log('  - earliest_possession_date:', templateData.earliest_possession_date);
        console.log('  - display_possession_date:', templateData.display_possession_date);
        console.log('[NOTICE-PREVIEW-API] Compliance Fields:');
        console.log('  - prescribed_info_given:', templateData.prescribed_info_given);
        console.log('  - gas_certificate_provided:', templateData.gas_certificate_provided);
        console.log('  - epc_provided:', templateData.epc_provided);
        console.log('  - how_to_rent_provided:', templateData.how_to_rent_provided);
        console.log('  - hmo_license_required:', templateData.hmo_license_required);
        console.log('  - hmo_license_valid:', templateData.hmo_license_valid);
        console.log('[NOTICE-PREVIEW-API] Licensing/Retaliatory Fields (BUG AUDIT):');
        console.log('  - licensing_required:', templateData.licensing_required, '(template)');
        console.log('  - wizardFacts.licensing_required:', wizardFacts.licensing_required, '(raw)');
        console.log('  - retaliatory_eviction_clear:', templateData.retaliatory_eviction_clear, '(template)');
        console.log('  - no_repair_complaint:', templateData.no_repair_complaint, '(template)');
        console.log('  - wizardFacts.no_retaliatory_notice:', wizardFacts.no_retaliatory_notice, '(raw)');
        console.log('  - wizardFacts.retaliatory_eviction_clear:', wizardFacts.retaliatory_eviction_clear, '(raw)');
        console.log('  - wizardFacts.repair_complaint_within_6_months:', wizardFacts.repair_complaint_within_6_months, '(raw)');
        console.log('[NOTICE-PREVIEW-API] Deposit Fields:');
        console.log('  - deposit_taken:', templateData.deposit_taken);
        console.log('  - deposit_protected:', templateData.deposit_protected);
        console.log('  - deposit_scheme:', templateData.deposit_scheme);
        console.log('[NOTICE-PREVIEW-API] Raw wizardFacts sample (nested check):');
        console.log('  - wizardFacts.section21:', JSON.stringify(wizardFacts.section21 || null));
        console.log('  - wizardFacts.notice_service:', JSON.stringify(wizardFacts.notice_service || null));
        console.log('  - wizardFacts.tenancy:', JSON.stringify(wizardFacts.tenancy || null));
        console.log('  - wizardFacts.compliance:', JSON.stringify(wizardFacts.compliance || null));
        console.log('[NOTICE-PREVIEW-API] === END DEBUG ===');
      }

      // JURISDICTION VALIDATION: Block Section 8/21 for Wales
      // Section 8 and Section 21 only exist in England (Housing Act 1988)
      // Wales uses Renting Homes (Wales) Act 2016 with different sections
      const actualJurisdiction = templateData.jurisdiction?.toLowerCase();
      if (actualJurisdiction === 'wales' || actualJurisdiction === 'cym') {
        if (selected_route === 'section_8') {
          return NextResponse.json(
            {
              error: 'Section 8 notices do not exist in Wales',
              details: 'Wales uses the Renting Homes (Wales) Act 2016. Please use Section 173 (no-fault) or fault-based sections (157, 159, 161, 162) instead.',
            },
            { status: 400 }
          );
        }
        if (selected_route === 'section_21') {
          return NextResponse.json(
            {
              error: 'Section 21 notices do not exist in Wales',
              details: 'Wales uses the Renting Homes (Wales) Act 2016, Section 173 for no-fault evictions.',
            },
            { status: 400 }
          );
        }
      }

      // DATE FORMATTING HELPER - UK legal format
      const formatUKDate = (dateString: string): string => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          const day = date.getDate();
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const month = months[date.getMonth()];
          const year = date.getFullYear();
          return `${day} ${month} ${year}`;
        } catch (error) {
          console.error('[PDF] Date formatting error:', error);
          return dateString;
        }
      };

      // Add formatted date versions for display
      templateData.service_date_formatted = formatUKDate(templateData.service_date || '');
      templateData.notice_date_formatted = formatUKDate(templateData.notice_date || '');
      templateData.earliest_possession_date_formatted = formatUKDate(templateData.earliest_possession_date || '');
      templateData.tenancy_start_date_formatted = formatUKDate(templateData.tenancy_start_date || '');
      templateData.generated_date = formatUKDate(new Date().toISOString().split('T')[0]);

      // Calculate dates if needed using the date calculator
      if (templateData.service_date && templateData.grounds.length > 0) {
        try {
          const { calculateSection8ExpiryDate } = await import('@/lib/documents/notice-date-calculator');

          const groundsForCalc = templateData.grounds.map((g: any) => ({
            code: typeof g.code === 'number' ? g.code : parseInt(g.code),
            mandatory: g.mandatory === true,
          }));

          const calculatedDate = calculateSection8ExpiryDate({
            service_date: templateData.service_date,
            grounds: groundsForCalc,
            tenancy_start_date: templateData.tenancy_start_date,
            fixed_term: templateData.fixed_term === true,
            fixed_term_end_date: templateData.fixed_term_end_date || undefined,
          });

          if (calculatedDate) {
            templateData.earliest_possession_date = calculatedDate.earliest_valid_date;
            templateData.earliest_possession_date_formatted = formatUKDate(calculatedDate.earliest_valid_date);
            templateData.notice_period_days = calculatedDate.notice_period_days;
            templateData.notice_period_explanation = calculatedDate.explanation;
            console.log('[PDF] Calculated expiry date:', calculatedDate.earliest_valid_date);
          }
        } catch (error) {
          console.error('[PDF] Date calculation error:', error);
        }
      }

      // Add convenience flags
      templateData.is_section_8 = selected_route === 'section_8';
      templateData.is_section_21 = selected_route === 'section_21';
      templateData.grounds_count = templateData.grounds.length;
      templateData.has_mandatory_ground = templateData.grounds.some((g: any) => g.mandatory === true);
      templateData.ground_numbers = templateData.grounds.map((g: any) => g.code).join(', ');
      // Ground descriptions for checklist (e.g., "Ground 8 – Serious rent arrears, Ground 11 – Persistent delay in paying rent")
      templateData.ground_descriptions = templateData.grounds.map((g: any) => `Ground ${g.code} – ${g.title}`).join(', ');

      // ========================================================================
      // SECTION 21 DATE CALCULATION (FIX: Use proper Section 21 rules, not Section 8)
      // Section 21 requires: max(service_date + 2 calendar months, fixed_term_end_date)
      // ========================================================================
      if (selected_route === 'section_21' && templateData.service_date) {
        try {
          const { calculateSection21ExpiryDate } = await import('@/lib/documents/notice-date-calculator');

          const section21Result = calculateSection21ExpiryDate({
            service_date: templateData.service_date,
            tenancy_start_date: templateData.tenancy_start_date || templateData.service_date,
            fixed_term: templateData.fixed_term === true || templateData.is_fixed_term === true,
            fixed_term_end_date: templateData.fixed_term_end_date || undefined,
            rent_period: templateData.rent_frequency || 'monthly',
          });

          if (section21Result) {
            // Store the Section 21 specific expiry date
            templateData.section21_expiry_date = section21Result.earliest_valid_date;
            templateData.section21_expiry_date_formatted = formatUKDate(section21Result.earliest_valid_date);
            templateData.section21_notice_period_days = section21Result.notice_period_days;
            templateData.section21_explanation = section21Result.explanation;

            // Also update notice_expiry_date for Form 6A
            templateData.notice_expiry_date = section21Result.earliest_valid_date;
            templateData.notice_expiry_date_formatted = formatUKDate(section21Result.earliest_valid_date);

            console.log('[PDF] Section 21 calculated expiry date:', section21Result.earliest_valid_date);
            console.log('[PDF] Section 21 explanation:', section21Result.explanation);
          }
        } catch (error) {
          console.error('[PDF] Section 21 date calculation error:', error);
        }
      }

      // ========================================================================
      // DISPLAY_POSSESSION_DATE: Single source of truth for templates
      // - Section 21: Uses notice_expiry_date (respects 2-month + fixed-term rules)
      // - Section 8: Uses earliest_possession_date (ground-based)
      // ========================================================================
      if (selected_route === 'section_21') {
        // Section 21: Use the properly calculated Section 21 expiry date
        templateData.display_possession_date = templateData.section21_expiry_date || templateData.notice_expiry_date || templateData.earliest_possession_date;
        templateData.display_possession_date_formatted = templateData.section21_expiry_date_formatted || templateData.notice_expiry_date_formatted || templateData.earliest_possession_date_formatted;
      } else {
        // Section 8 (and others): Use ground-based earliest possession date
        templateData.display_possession_date = templateData.earliest_possession_date;
        templateData.display_possession_date_formatted = templateData.earliest_possession_date_formatted;
      }

      console.log('[NOTICE-PREVIEW-API] Section 8 ground payload:',
        templateData.grounds.map((g: any) => ({
          code: g.code,
          title: g.title,
          type: g.type || g.type_label,
          statutory_text: g.statutory_text?.slice(0, 120) || '',
          particulars: g.particulars,
          evidence: g.evidence,
        }))
      );

      // Pass through full facts for templates that need them
      templateData.caseFacts = caseFacts;
      templateData.wizardFacts = wizardFacts;

      // Note: mapNoticeOnlyFacts() already creates nested objects (property, tenant, tenancy, deposit, compliance, metadata)
      // No need to duplicate that work here

      console.log('[PDF] Template data ready:', {
        landlord: templateData.landlord_full_name,
        landlord_address: templateData.landlord_address ? 'SET' : 'MISSING',
        tenant: templateData.tenant_full_name,
        property_address: templateData.property_address ? 'SET' : 'MISSING',
        grounds: templateData.grounds_count,
        service_date: templateData.service_date,
        possession_date: templateData.earliest_possession_date,
        deposit_amount: templateData.deposit_amount,
        deposit_protected: templateData.deposit_protected,
        deposit_scheme: templateData.deposit_scheme,
      });

      // 1. Generate notice (Section 8 or Section 21)
      if (selected_route === 'section_8') {
        console.log('[NOTICE-PREVIEW-API] Generating Section 8 notice');
        try {
          const section8Doc = await generateDocument({
            templatePath: 'uk/england/templates/notice_only/form_3_section8/notice.hbs',
            data: templateData,
            outputFormat: 'pdf',
            isPreview: true,
          });
          if (section8Doc.pdf) {
            documents.push({
              title: 'Section 8 Notice (Form 3)',
              category: 'notice',
              pdf: section8Doc.pdf,
            });
          }
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Section 8 generation failed:', err);
        }
      } else if (selected_route === 'section_21') {
        console.log('[NOTICE-PREVIEW-API] Generating Section 21 notice via canonical generator');
        try {
          // Use canonical mapper and generator for Form 6A compliance
          // This ensures ALL Section 21 generation paths produce identical output
          const section21NoticeData = mapWizardToSection21Data(wizardFacts, {
            serviceDate: templateData.service_date || templateData.notice_date,
          });

          const section21Doc = await generateSection21Notice(section21NoticeData, true);
          if (section21Doc.pdf) {
            documents.push({
              title: 'Section 21 Notice (Form 6A)',
              category: 'notice',
              pdf: section21Doc.pdf,
            });
          }
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Section 21 generation failed:', err);
        }
      }

      // 2. Generate route-specific service instructions (England)
      const serviceInstructionsRoute = selected_route === 'section_8' ? 'section_8' : 'section_21';
      console.log(`[NOTICE-PREVIEW-API] Generating ${serviceInstructionsRoute} service instructions`);
      try {
        const serviceDoc = await generateDocument({
          templatePath: `uk/england/templates/eviction/service_instructions_${serviceInstructionsRoute}.hbs`,
          data: templateData,
          outputFormat: 'pdf',
        });

        if (serviceDoc.pdf) {
          documents.push({
            title: 'Service Instructions',
            category: 'guidance',
            pdf: serviceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Service instructions generation failed:', err);
      }

      // 3. Generate route-specific checklist (Section 8 or Section 21)
      const checklistRoute = selected_route === 'section_8' ? 'section_8' : 'section_21';
      console.log(`[NOTICE-PREVIEW-API] Generating ${checklistRoute} checklist`);
      try {
        const checklistDoc = await generateDocument({
          templatePath: `uk/england/templates/eviction/checklist_${checklistRoute}.hbs`,
          data: templateData,
          outputFormat: 'pdf',
        });

        if (checklistDoc.pdf) {
          documents.push({
            title: `Service and Validity Checklist`,
            category: 'checklist',
            pdf: checklistDoc.pdf,
          });
        }
      } catch (err) {
        console.error(`[NOTICE-PREVIEW-API] ${checklistRoute} checklist generation failed:`, err);
      }

      // 4. Generate compliance checklist (pre-service verification)
      // Use dedicated Section 21 compliance checklist for Section 21 notices
      // to ensure correct mapping of wizard answers and proper labeling
      const complianceTemplatePath = selected_route === 'section_21'
        ? 'uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
        : 'uk/england/templates/eviction/compliance_checklist.hbs';

      console.log(`[NOTICE-PREVIEW-API] Generating ${selected_route === 'section_21' ? 'Section 21' : 'Section 8'} compliance checklist`);
      try {
        const complianceDoc = await generateDocument({
          templatePath: complianceTemplatePath,
          data: templateData,
          outputFormat: 'pdf',
        });

        if (complianceDoc.pdf) {
          documents.push({
            title: selected_route === 'section_21'
              ? 'Section 21 Pre-Service Compliance Checklist'
              : 'Pre-Service Compliance Checklist',
            category: 'checklist',
            pdf: complianceDoc.pdf,
          });
        }
      } catch (err) {
        console.error(`[NOTICE-PREVIEW-API] ${selected_route === 'section_21' ? 'Section 21' : 'England'} compliance checklist generation failed:`, err);
      }

      // 5. Generate Rent Schedule / Arrears Breakdown (if Section 8 with arrears grounds and data)
      if (selected_route === 'section_8') {
        const noticeValidation = validateNoticeOnlyCase(wizardFacts);
        const arrearsItems = wizardFacts.arrears_items || [];

        if (noticeValidation.includesArrearsGrounds && arrearsItems.length > 0) {
          console.log('[NOTICE-PREVIEW-API] Generating Rent Schedule (arrears grounds detected)');
          try {
            const { getArrearsScheduleData } = await import('@/lib/documents/arrears-schedule-mapper');

            const arrearsScheduleData = getArrearsScheduleData({
              arrears_items: arrearsItems,
              total_arrears: wizardFacts.total_arrears || null,
              rent_amount: templateData.rent_amount || wizardFacts.rent_amount || 0,
              rent_frequency: templateData.rent_frequency || wizardFacts.rent_frequency || 'monthly',
              include_schedule: true,
            });

            if (arrearsScheduleData.arrears_schedule.length > 0) {
              const scheduleDoc = await generateDocument({
                templatePath: 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
                data: {
                  claimant_reference: caseId,
                  arrears_schedule: arrearsScheduleData.arrears_schedule,
                  arrears_total: arrearsScheduleData.arrears_total,
                },
                outputFormat: 'pdf',
              });

              if (scheduleDoc.pdf) {
                documents.push({
                  title: 'Rent Schedule / Arrears Statement',
                  category: 'schedule',
                  pdf: scheduleDoc.pdf,
                });
                console.log('[NOTICE-PREVIEW-API] Rent Schedule generated successfully');
              }
            }
          } catch (err) {
            console.error('[NOTICE-PREVIEW-API] Rent Schedule generation failed:', err);
          }
        }
      }
    }

    // ===========================================================================
    // WALES NOTICE ONLY PACK
    // ===========================================================================
    else if (jurisdiction === 'wales') {
      console.log('[NOTICE-PREVIEW-API] Generating Wales pack');

      // Use mapNoticeOnlyFacts() to build template data
      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // DATE FORMATTING HELPER - UK legal format
      const formatUKDate = (dateString: string): string => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          const day = date.getDate();
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const month = months[date.getMonth()];
          const year = date.getFullYear();
          return `${day} ${month} ${year}`;
        } catch (error) {
          console.error('[PDF] Date formatting error:', error);
          return dateString;
        }
      };

      // Add formatted date versions for display
      templateData.service_date_formatted = formatUKDate(templateData.service_date || '');
      templateData.notice_date_formatted = formatUKDate(templateData.notice_date || '');
      templateData.earliest_possession_date_formatted = formatUKDate(templateData.earliest_possession_date || '');
      templateData.generated_date = formatUKDate(new Date().toISOString().split('T')[0]);

      // Add contract start date (Wales-specific)
      const contractStartDate = wizardFacts.contract_start_date || templateData.tenancy_start_date || templateData.tenancy?.start_date;
      templateData.contract_start_date_formatted = formatUKDate(contractStartDate || '');

      // Add convenience flags
      templateData.is_wales_section_173 = selected_route === 'wales_section_173';
      templateData.is_wales_fault_based = selected_route === 'wales_fault_based';
      templateData.contract_holder_full_name = wizardFacts.contract_holder_full_name || templateData.tenant_full_name;
      templateData.landlord_full_name = wizardFacts.landlord_full_name || templateData.landlord_full_name;

      // Pass through full facts for templates that need them
      templateData.caseFacts = caseFacts;
      templateData.wizardFacts = wizardFacts;

      console.log('[PDF] Wales template data ready:', {
        landlord: templateData.landlord_full_name,
        contract_holder: templateData.contract_holder_full_name,
        property_address: templateData.property_address ? 'SET' : 'MISSING',
        selected_route,
        service_date: templateData.service_date,
        deposit_protected: templateData.deposit_protected,
      });

      // 1. Generate notice (Section 173 or fault-based)
      if (selected_route === 'wales_section_173') {
        console.log('[NOTICE-PREVIEW-API] Generating Section 173 notice');
        try {
          // Use the wales-section173-generator (HARD-LOCKED to RHW16, 6-month notice)
          const { generateWalesSection173Notice } = await import('@/lib/documents/wales-section173-generator');

          // Prepare data for generator (it handles date calculations and template selection)
          const section173Data = {
            landlord_full_name: templateData.landlord_full_name,
            landlord_address: templateData.landlord_address,
            contract_holder_full_name: templateData.contract_holder_full_name || templateData.tenant_full_name,
            property_address: templateData.property_address,
            contract_start_date: contractStartDate || templateData.tenancy_start_date,
            rent_amount: templateData.rent_amount || 0,
            rent_frequency: (templateData.rent_frequency || 'monthly') as 'weekly' | 'fortnightly' | 'monthly' | 'quarterly',
            service_date: templateData.service_date || templateData.notice_date,
            notice_service_date: templateData.notice_date || templateData.service_date,
            expiry_date: templateData.earliest_possession_date,
            notice_expiry_date: templateData.earliest_possession_date,
            wales_contract_category: wizardFacts.wales_contract_category || 'standard',
            rent_smart_wales_registered: wizardFacts.rent_smart_wales_registered,
            deposit_taken: wizardFacts.deposit_taken || templateData.deposit_taken,
            deposit_protected: wizardFacts.deposit_protected || templateData.deposit_protected,
          };

          const section173Doc = await generateWalesSection173Notice(section173Data, true);
          if (section173Doc.pdf) {
            documents.push({
              title: 'Section 173 Landlord\'s Notice (Wales)',
              category: 'notice',
              pdf: section173Doc.pdf,
            });
          }
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Section 173 generation failed:', err);
        }
      } else if (selected_route === 'wales_fault_based') {
        console.log('[NOTICE-PREVIEW-API] Generating Wales fault-based notice (RHW23)');
        try {
          // ========================================================================
          // WALES FAULT-BASED: Use Part D builder (SINGLE SOURCE OF TRUTH)
          //
          // CRITICAL: Uses buildWalesPartDFromWizardFacts() to generate Part D text
          // from the Wales ground definitions. This ensures Part D NEVER contains
          // England-specific references (Housing Act 1988, Section 8, Ground 8).
          // ========================================================================
          const partDResult = buildWalesPartDFromWizardFacts(wizardFacts);

          if (partDResult.warnings.length > 0) {
            console.warn('[NOTICE-PREVIEW-API] Wales Part D builder warnings:', partDResult.warnings);
          }

          if (!partDResult.success) {
            console.error('[NOTICE-PREVIEW-API] Wales Part D builder failed:', partDResult.warnings);
            // Continue with empty text if Part D builder fails - template may have fallback
          }

          console.log('[NOTICE-PREVIEW-API] Wales Part D generated:', {
            groundsIncluded: partDResult.groundsIncluded.map(g => `${g.label} (section ${g.section})`),
            textLength: partDResult.text.length,
          });

          const faultBasedData = {
            ...templateData,
            // Use the Part D builder output as breach_particulars
            // (The RHW23 template renders this in Part D)
            breach_particulars: partDResult.text,
            // Also provide as rhw23_part_d_text for templates that use this field
            rhw23_part_d_text: partDResult.text,
            // Include metadata about grounds for template conditionals
            wales_grounds_included: partDResult.groundsIncluded,
          };

          const faultDoc = await generateDocument({
            templatePath: 'uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs',
            data: faultBasedData,
            outputFormat: 'pdf',
            isPreview: true,
          });

          if (faultDoc.pdf) {
            documents.push({
              title: 'Notice Before Making a Possession Claim (RHW23)',
              category: 'notice',
              pdf: faultDoc.pdf,
            });
          }
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Wales fault-based generation failed:', err);
        }
      }

      // 2. Generate route-specific service instructions (Wales)
      const walesServiceRoute = selected_route === 'wales_section_173' ? 'section_173' : 'fault_based';
      console.log(`[NOTICE-PREVIEW-API] Generating Wales ${walesServiceRoute} service instructions`);
      try {
        const serviceDoc = await generateDocument({
          templatePath: `uk/wales/templates/eviction/service_instructions_${walesServiceRoute}.hbs`,
          data: templateData,
          outputFormat: 'pdf',
        });

        if (serviceDoc.pdf) {
          documents.push({
            title: 'Service Instructions (Wales)',
            category: 'guidance',
            pdf: serviceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Service instructions generation failed:', err);
      }

      // 3. Generate route-specific checklist (Section 173 or Fault-Based)
      const checklistRoute = selected_route === 'wales_section_173' ? 'section_173' : 'fault_based';
      console.log(`[NOTICE-PREVIEW-API] Generating Wales ${checklistRoute} checklist`);
      try {
        const checklistDoc = await generateDocument({
          templatePath: `uk/wales/templates/eviction/checklist_${checklistRoute}.hbs`,
          data: templateData,
          outputFormat: 'pdf',
        });

        if (checklistDoc.pdf) {
          documents.push({
            title: 'Service and Validity Checklist (Wales)',
            category: 'checklist',
            pdf: checklistDoc.pdf,
          });
        }
      } catch (err) {
        console.error(`[NOTICE-PREVIEW-API] Wales ${checklistRoute} checklist generation failed:`, err);
      }

      // 4. Generate compliance checklist (pre-service verification)
      console.log('[NOTICE-PREVIEW-API] Generating Wales compliance checklist');
      try {
        const complianceDoc = await generateDocument({
          templatePath: 'uk/wales/templates/eviction/compliance_checklist.hbs',
          data: templateData,
          outputFormat: 'pdf',
        });

        if (complianceDoc.pdf) {
          documents.push({
            title: 'Pre-Service Compliance Checklist (Wales)',
            category: 'checklist',
            pdf: complianceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Wales compliance checklist generation failed:', err);
      }

      // 5. Generate Rent Schedule for Wales fault-based rent arrears (Section 157/159)
      // Uses SINGLE SOURCE OF TRUTH from grounds definitions to detect arrears grounds
      if (selected_route === 'wales_fault_based') {
        const walesFaultGrounds = wizardFacts.wales_fault_grounds;
        const isRentArrearsCase = hasWalesArrearsGroundSelected(walesFaultGrounds);

        // Fallback: Also check legacy fields for backwards compatibility
        const faultBasedSection = wizardFacts.wales_fault_based_section || '';
        const breachType = wizardFacts.wales_breach_type || wizardFacts.breach_or_ground || '';
        const legacyArrearsDetected =
          breachType === 'rent_arrears' ||
          breachType === 'arrears' ||
          faultBasedSection.includes('Section 157') ||
          faultBasedSection.includes('Section 159');

        // Check both flat and nested locations for arrears_items
        const arrearsItems = wizardFacts.arrears_items ||
                             wizardFacts.issues?.rent_arrears?.arrears_items ||
                             [];

        if ((isRentArrearsCase || legacyArrearsDetected) && arrearsItems.length > 0) {
          console.log('[NOTICE-PREVIEW-API] Generating Rent Schedule for Wales fault-based rent arrears');
          try {
            const { getArrearsScheduleData } = await import('@/lib/documents/arrears-schedule-mapper');

            // Check both flat and nested locations for total_arrears
            const totalArrears = wizardFacts.total_arrears ||
                                 wizardFacts.issues?.rent_arrears?.total_arrears ||
                                 wizardFacts.rent_arrears_amount ||
                                 null;
            const arrearsScheduleData = getArrearsScheduleData({
              arrears_items: arrearsItems,
              total_arrears: totalArrears,
              rent_amount: templateData.rent_amount || wizardFacts.rent_amount || 0,
              rent_frequency: templateData.rent_frequency || wizardFacts.rent_frequency || 'monthly',
              include_schedule: true,
            });

            if (arrearsScheduleData.arrears_schedule.length > 0) {
              const scheduleDoc = await generateDocument({
                templatePath: 'uk/wales/templates/money_claims/schedule_of_arrears.hbs',
                data: {
                  claimant_reference: caseId,
                  arrears_schedule: arrearsScheduleData.arrears_schedule,
                  arrears_total: arrearsScheduleData.arrears_total,
                },
                outputFormat: 'pdf',
              });

              if (scheduleDoc.pdf) {
                documents.push({
                  title: 'Rent Schedule / Arrears Statement (Wales)',
                  category: 'schedule',
                  pdf: scheduleDoc.pdf,
                });
                console.log('[NOTICE-PREVIEW-API] Wales Rent Schedule generated successfully');
              }
            }
          } catch (err) {
            console.error('[NOTICE-PREVIEW-API] Wales Rent Schedule generation failed:', err);
          }
        }
      }
    }

    // ===========================================================================
    // SCOTLAND NOTICE ONLY PACK
    // ===========================================================================
    else if (jurisdiction === 'scotland') {
      console.log('[NOTICE-PREVIEW-API] Generating Scotland pack');

      // Use mapNoticeOnlyFacts() to build template data
      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // DATE FORMATTING HELPER - UK legal format
      const formatUKDate = (dateString: string): string => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          const day = date.getDate();
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const month = months[date.getMonth()];
          const year = date.getFullYear();
          return `${day} ${month} ${year}`;
        } catch (error) {
          console.error('[PDF] Date formatting error:', error);
          return dateString;
        }
      };

      // Calculate Scotland-specific dates
      // For Notice to Leave, minimum notice period is 28 days for PRT (84 days for rent arrears - Ground 1)
      const noticeDate = templateData.notice_date || templateData.service_date || new Date().toISOString().split('T')[0];
      templateData.notice_date = noticeDate;

      // Determine notice period based on grounds
      const evictionGrounds = wizardFacts.eviction_grounds || [];
      const hasGround1 = evictionGrounds.some((g: any) =>
        String(g).includes('Ground 1') || String(g).includes('rent arrears')
      );

      const noticePeriodDays = hasGround1 ? 84 : 28; // 84 days for rent arrears, 28 for others

      // Calculate earliest leaving date (notice_date + notice_period)
      if (noticeDate) {
        const noticeDateObj = new Date(noticeDate);
        const earliestLeavingDateObj = new Date(noticeDateObj);
        earliestLeavingDateObj.setDate(earliestLeavingDateObj.getDate() + noticePeriodDays);
        const earliestLeavingDate = earliestLeavingDateObj.toISOString().split('T')[0];

        templateData.earliest_leaving_date = earliestLeavingDate;
        templateData.earliest_leaving_date_formatted = formatUKDate(earliestLeavingDate);

        // Earliest tribunal date is same as leaving date
        templateData.earliest_tribunal_date = earliestLeavingDate;
        templateData.earliest_tribunal_date_formatted = formatUKDate(earliestLeavingDate);

        templateData.notice_period_days = noticePeriodDays;
      }

      // Format dates for display
      templateData.notice_date_formatted = formatUKDate(noticeDate);
      templateData.tenancy_start_date_formatted = formatUKDate(templateData.tenancy_start_date || '');
      templateData.generated_date = formatUKDate(new Date().toISOString().split('T')[0]);

      // Process grounds for Scotland
      const processedGrounds = evictionGrounds.map((ground: any, index: number) => {
        const groundStr = String(ground);
        let number = index + 1;
        let title = groundStr;

        // Extract ground number if present
        const match = groundStr.match(/Ground (\d+)/i);
        if (match) {
          number = parseInt(match[1]);
          title = groundStr.replace(/Ground \d+\s*-?\s*/i, '');
        }

        return {
          number,
          title,
          particulars: templateData.ground_particulars || wizardFacts.ground_particulars || '',
          legal_basis: getScotlandGroundLegalBasis(number),
        };
      });

      templateData.grounds = processedGrounds;
      templateData.ground_1_claimed = hasGround1;

      // Add arrears details for Ground 1
      if (hasGround1) {
        templateData.total_arrears = wizardFacts.arrears_amount || 0;
        templateData.arrears_date = formatUKDate(noticeDate);
        // Calculate arrears duration (assume 3+ months for Ground 1)
        const arrearsAmount = wizardFacts.arrears_amount || 0;
        const monthlyRent = templateData.rent_amount || 1000;
        const arrearsMonths = Math.floor(arrearsAmount / monthlyRent);
        const arrearsDays = Math.floor((arrearsAmount / monthlyRent) * 30);
        templateData.arrears_duration_months = arrearsMonths;
        templateData.arrears_duration_days = arrearsDays;
      }

      // Pass through full facts for templates that need them
      templateData.caseFacts = caseFacts;
      templateData.wizardFacts = wizardFacts;

      console.log('[PDF] Scotland template data ready:', {
        landlord: templateData.landlord_full_name,
        landlord_address: templateData.landlord_address ? 'SET' : 'MISSING',
        tenant: templateData.tenant_full_name,
        property_address: templateData.property_address ? 'SET' : 'MISSING',
        notice_date: templateData.notice_date,
        earliest_leaving_date: templateData.earliest_leaving_date,
        notice_period_days: templateData.notice_period_days,
      });

      // 1. Generate Notice to Leave
      console.log('[NOTICE-PREVIEW-API] Generating Notice to Leave');
      try {
        const noticeDoc = await generateDocument({
          templatePath: 'uk/scotland/templates/notice_only/notice_to_leave_prt_2017/notice.hbs',
          data: templateData,
          outputFormat: 'pdf',
          isPreview: true,
        });

        if (noticeDoc.pdf) {
          documents.push({
            title: 'Notice to Leave (PRT)',
            category: 'notice',
            pdf: noticeDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Notice to Leave generation failed:', err);
      }

      // 2. Generate route-specific service instructions (Scotland - Notice to Leave)
      console.log('[NOTICE-PREVIEW-API] Generating Scotland notice_to_leave service instructions');
      try {
        const serviceDoc = await generateDocument({
          templatePath: 'uk/scotland/templates/eviction/service_instructions_notice_to_leave.hbs',
          data: templateData,
          outputFormat: 'pdf',
        });

        if (serviceDoc.pdf) {
          documents.push({
            title: 'Service Instructions',
            category: 'guidance',
            pdf: serviceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Service instructions generation failed:', err);
      }

      // 3. Generate Notice to Leave checklist
      console.log('[NOTICE-PREVIEW-API] Generating Notice to Leave checklist');
      try {
        const checklistDoc = await generateDocument({
          templatePath: 'uk/scotland/templates/eviction/checklist_notice_to_leave.hbs',
          data: templateData,
          outputFormat: 'pdf',
        });

        if (checklistDoc.pdf) {
          documents.push({
            title: 'Service and Validity Checklist',
            category: 'checklist',
            pdf: checklistDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Notice to Leave checklist generation failed:', err);
      }

      // 4. Generate compliance checklist (pre-service verification)
      console.log('[NOTICE-PREVIEW-API] Generating Scotland compliance checklist');
      try {
        const complianceDoc = await generateDocument({
          templatePath: 'uk/scotland/templates/eviction/compliance_checklist.hbs',
          data: templateData,
          outputFormat: 'pdf',
        });

        if (complianceDoc.pdf) {
          documents.push({
            title: 'Pre-Service Compliance Checklist (Scotland)',
            category: 'checklist',
            pdf: complianceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Scotland compliance checklist generation failed:', err);
      }

      // 5. Generate Rent Schedule for Scotland Ground 1 (rent arrears)
      // Note: hasGround1 is already computed above in Scotland date calculation section
      const scotlandArrearsItems = wizardFacts.arrears_items || [];

      if (hasGround1 && scotlandArrearsItems.length > 0) {
        console.log('[NOTICE-PREVIEW-API] Generating Rent Schedule for Scotland Ground 1 (rent arrears)');
        try {
          const { getArrearsScheduleData } = await import('@/lib/documents/arrears-schedule-mapper');

          const scotlandArrearsData = getArrearsScheduleData({
            arrears_items: scotlandArrearsItems,
            total_arrears: wizardFacts.total_arrears || wizardFacts.arrears_amount || null,
            rent_amount: templateData.rent_amount || wizardFacts.rent_amount || 0,
            rent_frequency: templateData.rent_frequency || wizardFacts.rent_frequency || 'monthly',
            include_schedule: true,
          });

          if (scotlandArrearsData.arrears_schedule.length > 0) {
            const scheduleDoc = await generateDocument({
              templatePath: 'uk/scotland/templates/money_claims/schedule_of_arrears.hbs',
              data: {
                claimant_reference: caseId,
                arrears_schedule: scotlandArrearsData.arrears_schedule,
                arrears_total: scotlandArrearsData.arrears_total,
              },
              outputFormat: 'pdf',
            });

            if (scheduleDoc.pdf) {
              documents.push({
                title: 'Rent Schedule / Arrears Statement (Scotland)',
                category: 'schedule',
                pdf: scheduleDoc.pdf,
              });
              console.log('[NOTICE-PREVIEW-API] Scotland Rent Schedule generated successfully');
            }
          }
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Scotland Rent Schedule generation failed:', err);
        }
      }
    }

    // ===========================================================================
    // MERGE INTO SINGLE PREVIEW PDF
    // ===========================================================================
    if (documents.length === 0) {
      console.error('[NOTICE-PREVIEW-API] No documents generated');
      return NextResponse.json(
        { error: 'Failed to generate any documents' },
        { status: 500 }
      );
    }

    console.log('[NOTICE-PREVIEW-API] Merging', documents.length, 'documents into preview');

    // Generate preview PDF (watermarks removed as part of simplified UX)
    const previewPdf = await generateNoticeOnlyPreview(documents, {
      jurisdiction,
      notice_type: selected_route as any,
      includeTableOfContents: true,
      // watermarkText removed - see docs/pdf-watermark-audit.md
    });

    console.log('[NOTICE-PREVIEW-API] Preview generated successfully');

    // Return PDF (convert Buffer to Uint8Array for Response API)
    return new Response(new Uint8Array(previewPdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="notice-only-preview.pdf"',
        'Content-Length': previewPdf.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    if (err instanceof Response) {
      return err;
    }

    console.error('[NOTICE-PREVIEW-API] Error:', err);

    // Check if this is a WinAnsi encoding error (e.g., Unicode characters in PDF text)
    const errorMessage = err?.message || '';
    const isEncodingError =
      errorMessage.includes('WinAnsi') ||
      errorMessage.includes('encodeTextAsGlyphs') ||
      errorMessage.includes('encodeUnicodeCodePoint') ||
      err?.code === 'PDF_TEXT_ENCODING_ERROR';

    if (isEncodingError) {
      // Return 422 for encoding errors - these are client-fixable issues
      return NextResponse.json(
        {
          code: 'PDF_TEXT_ENCODING_ERROR',
          error: 'PDF generation failed due to unsupported characters',
          user_message:
            'The document contains characters that cannot be rendered in PDF format. ' +
            'Please remove special symbols, emojis, or unusual punctuation from your input.',
          hint: 'Common issues: warning symbols, emojis, smart quotes, or special Unicode characters.',
          caseId: caseId || 'unknown',
          jurisdiction,
          route: selected_route,
          blocking_issues: [
            {
              code: 'PDF_TEXT_ENCODING_ERROR',
              fields: [],
              user_fix_hint: 'Remove special characters from your input data and try again.',
            },
          ],
          warnings: [],
        },
        { status: 422 }
      );
    }

    // Build structured JSON error response
    const errorResponse: Record<string, any> = {
      error: true,
      message: err?.message || 'Failed to generate preview',
      caseId: caseId || 'unknown',
    };

    // Add jurisdiction and route if available
    if (jurisdiction) {
      errorResponse.jurisdiction = jurisdiction;
    }
    if (selected_route) {
      errorResponse.route = selected_route;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development' && err?.stack) {
      errorResponse.stack = err.stack;
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
