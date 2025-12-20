/**
 * Notice Only Preview API
 *
 * GET /api/notice-only/preview/[caseId]
 * Generates a watermarked preview of the complete Notice Only pack
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { wizardFactsToCaseFacts, mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { generateNoticeOnlyPreview, type NoticeOnlyDocument } from '@/lib/documents/notice-only-preview-merger';
import { generateDocument } from '@/lib/documents/generator';
import { validateNoticeOnlyJurisdiction, formatValidationErrors } from '@/lib/jurisdictions/validator';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';
import { validateNoticeOnlyBeforeRender } from '@/lib/documents/noticeOnly';
import type { JurisdictionKey } from '@/lib/jurisdictions/rulesLoader';
import {
  migrateToCanonicalJurisdiction,
  type CanonicalJurisdiction,
  deriveCanonicalJurisdiction,
} from '@/lib/types/jurisdiction';
import { validateForPreview } from '@/lib/validation/previewValidation';

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
    console.log('[NOTICE-PREVIEW-API] Generating preview for case:', caseId);

    const supabase = await createServerSupabaseClient();

    // Try to get the current user (but allow anonymous access)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build query to allow viewing own cases or anonymous cases
    let query = supabase.from('cases').select('*').eq('id', caseId);

    if (user) {
      query = query.or(`user_id.eq.${user.id},user_id.is.null`);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('[NOTICE-PREVIEW-API] Case not found:', fetchError);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const caseRow = data as any;

    // Get wizard facts
    const wizardFacts = caseRow.wizard_facts || caseRow.collected_facts || caseRow.facts || {};
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
    selected_route =
      wizardFacts.selected_notice_route ||
      wizardFacts.route_recommendation?.recommended_route;

    console.log('[NOTICE-PREVIEW-API] Jurisdiction:', jurisdiction);
    console.log('[NOTICE-PREVIEW-API] Selected route:', selected_route);

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

    // ========================================================================
    // LEGACY CONFIG-DRIVEN VALIDATION (keeping for now but should be redundant)
    // ========================================================================
    const validationOutcome = validateNoticeOnlyBeforeRender({
      jurisdiction: validationJurisdiction as JurisdictionKey,
      facts: wizardFacts,
      selectedGroundCodes: groundCodes,
      selectedRoute: selected_route,
      stage: 'preview',
    });

    const blockingIssues = validationOutcome.blocking ?? [];
    const warnings = validationOutcome.warnings ?? [];

    if (blockingIssues.length > 0) {
      const userMessage = 'Cannot generate preview: jurisdiction rules are not satisfied';
      const blockingPayload = {
        code: 'LEGAL_BLOCK',
        error: 'LEGAL_BLOCK',
        user_message: userMessage,
        blocking_issues: blockingIssues,
        warnings,
      };

      console.warn('[NOTICE-PREVIEW-API] Legacy validation blocked preview:', {
        case_id: caseId,
        blocking: blockingIssues.map((b) => b.code),
        payload: blockingPayload,
      });

      return NextResponse.json(blockingPayload, { status: 422 });
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
      return NextResponse.json(
        {
          error: 'NOTICE_NONCOMPLIANT',
          failures: compliance.hardFailures,
          warnings: compliance.warnings,
          computed: compliance.computed ?? null,
          block_next_question: true,
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
        console.log('[NOTICE-PREVIEW-API] Generating Section 21 notice');
        try {
          // Calculate first anniversary date if tenancy start date is available
          let firstAnniversaryDate = null;
          let firstAnniversaryDateFormatted = null;
          if (templateData.tenancy_start_date) {
            try {
              const tenancyStart = new Date(templateData.tenancy_start_date);
              const anniversary = new Date(tenancyStart);
              anniversary.setFullYear(anniversary.getFullYear() + 1);
              firstAnniversaryDate = anniversary.toISOString().split('T')[0];
              firstAnniversaryDateFormatted = formatUKDate(firstAnniversaryDate);
            } catch (e) {
              console.error('[NOTICE-PREVIEW-API] Failed to calculate first anniversary:', e);
            }
          }

          // FIX: Use templateData (enriched with formatted addresses/dates) instead of caseFacts
          const section21Data = {
            ...templateData,
            // Section 21 requires possession_date (2 months from service)
            possession_date: templateData.earliest_possession_date_formatted || templateData.earliest_possession_date,
            // Add first anniversary date
            first_anniversary_date: firstAnniversaryDateFormatted || firstAnniversaryDate,
          };

          const section21Doc = await generateDocument({
            templatePath: 'uk/england/templates/notice_only/form_6a_section21/notice.hbs',
            data: section21Data,
            outputFormat: 'pdf',
            isPreview: true,
          });
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
          // Use the wales-section173-generator which automatically selects RHW16 or RHW17
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
          // Map fault-based section to breach particulars
          const faultBasedSection = wizardFacts.wales_fault_based_section || '';

          // Detect breach type from multiple possible fields
          const breachType = wizardFacts.wales_breach_type || wizardFacts.breach_or_ground || '';
          const isRentArrears =
            breachType === 'rent_arrears' ||
            breachType === 'arrears' ||
            faultBasedSection.includes('Section 157') ||
            faultBasedSection.includes('Section 159');

          let breachParticulars = '';

          // Build breach particulars based on section type or breach type
          if (faultBasedSection.includes('Section 157')) {
            // Serious rent arrears (2+ months) - Section 157
            const arrearsAmount = wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount || 0;
            breachParticulars = `Breach of contract (section 157)\n\nSerious rent arrears (2+ months)\n\nTotal arrears: £${arrearsAmount.toLocaleString('en-GB')}`;
          } else if (faultBasedSection.includes('Section 159')) {
            // Rent arrears (less than 2 months) - Section 159
            const arrearsAmount = wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount || 0;
            breachParticulars = `Breach of contract (section 159)\n\nRent arrears (less than 2 months)\n\nTotal arrears: £${arrearsAmount.toLocaleString('en-GB')}`;
          } else if (faultBasedSection.includes('Section 161')) {
            // Anti-social behaviour - Section 161
            breachParticulars = `Breach of contract (section 161)\n\nAnti-social behaviour\n\n${wizardFacts.asb_description || wizardFacts.breach_description || wizardFacts.breach_details || ''}`;
          } else if (faultBasedSection.includes('Section 162')) {
            // Other breach - Section 162
            breachParticulars = `Breach of contract (section 162)\n\n${wizardFacts.breach_description || wizardFacts.breach_details || ''}`;
          } else if (isRentArrears) {
            // Fallback: Detected rent arrears without specific section
            // Default to Section 157 (serious arrears)
            const arrearsAmount = wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount || 0;
            breachParticulars = `Breach of contract (section 157)\n\nSerious rent arrears (2+ months)\n\nTotal arrears: £${arrearsAmount.toLocaleString('en-GB')}`;
            console.log(`[NOTICE-PREVIEW-API] Wales fault-based: Detected rent arrears (${arrearsAmount}), defaulting to Section 157`);
          } else {
            // Final fallback: Use breach_description or breach_details as-is
            breachParticulars = wizardFacts.breach_description || wizardFacts.breach_details || wizardFacts.asb_description || '';
          }

          // Log the computed breach particulars for debugging
          console.log('[NOTICE-PREVIEW-API] Wales fault-based breach particulars:', {
            faultBasedSection,
            breachType,
            arrearsAmount: wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount,
            breach_particulars_length: breachParticulars.length,
            breach_particulars_preview: breachParticulars.substring(0, 100),
          });

          const faultBasedData = {
            ...templateData,
            breach_particulars: breachParticulars,
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

    const previewPdf = await generateNoticeOnlyPreview(documents, {
      jurisdiction,
      notice_type: selected_route as any,
      includeTableOfContents: true,
      watermarkText: 'PREVIEW - Complete Purchase (£29.99) to Download',
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
    console.error('[NOTICE-PREVIEW-API] Error:', err);

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
