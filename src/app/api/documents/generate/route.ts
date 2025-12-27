/**
 * Documents API - Generate
 *
 * POST /api/documents/generate
 * Generates a legal document from a case and stores it in Supabase Storage
 */

import {
  createServerSupabaseClient,
  requireServerAuth,
  createAdminClient,
} from '@/lib/supabase/server';

import { generateDocument } from '@/lib/documents/generator';
import { generateSection8Notice } from '@/lib/documents/section8-generator';
import { generateStandardAST, generatePremiumAST } from '@/lib/documents/ast-generator';

import { generateNoticeToLeave } from '@/lib/documents/scotland/notice-to-leave-generator';
import { generatePRTAgreement } from '@/lib/documents/scotland/prt-generator';
import { mapWizardToNoticeToLeave } from '@/lib/documents/scotland/wizard-mapper';
import { mapWizardToPRTData } from '@/lib/documents/scotland/prt-wizard-mapper';

import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';

import { generatePrivateTenancyAgreement } from '@/lib/documents/northern-ireland/private-tenancy-generator';
import { mapWizardToPrivateTenancyData } from '@/lib/documents/northern-ireland/private-tenancy-wizard-mapper';

import { fillOfficialForm, type CaseData } from '@/lib/documents/official-forms-filler';

import { getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { getArrearsScheduleData } from '@/lib/documents/arrears-schedule-mapper';
import { generateWitnessStatement, extractWitnessStatementContext } from '@/lib/ai/witness-statement-generator';
import { generateComplianceAudit, extractComplianceAuditContext } from '@/lib/ai/compliance-audit-generator';
import { generateRiskAssessment, extractRiskAssessmentContext } from '@/lib/ai/risk-assessment-generator';
import { generateProofOfServicePDF } from '@/lib/documents/proof-of-service-generator';
import { runDecisionEngine } from '@/lib/decision-engine';
import type { DecisionInput } from '@/lib/decision-engine';
import { deriveCanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { validateForGenerate } from '@/lib/validation/previewValidation';

import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const generateDocumentSchema = z.object({
  case_id: z.string().min(1),
  document_type: z.enum([
    'section8_notice',
    'section21_notice',
    'ast_standard',
    'ast_premium',
    'notice_to_leave', // Scotland
    'prt_agreement', // Scotland
    'prt_premium', // Scotland Premium
    'private_tenancy', // Northern Ireland
    'private_tenancy_premium', // Northern Ireland Premium
    // Court forms for complete_pack
    'n5_claim', // England court possession claim
    'n119_particulars', // England particulars of claim
    'n5b_claim', // England accelerated possession (Section 21)
    // Evidence tools
    'arrears_schedule', // Rent arrears schedule
    // AI-generated documents (Ask Heaven)
    'witness_statement', // AI-drafted witness statement
    'compliance_audit', // AI compliance audit report
    'risk_assessment', // AI case risk assessment
    // Guidance documents
    'eviction_roadmap', // Step-by-step eviction roadmap
    'service_instructions', // Notice service instructions
    'service_checklist', // Service validity checklist
    'expert_guidance', // Expert eviction guidance
    'eviction_timeline', // Timeline expectations
    'case_summary', // Case summary document
    'court_filing_guide', // Court filing instructions (England & Wales)
    'tribunal_lodging_guide', // Tribunal lodging guide (Scotland)
    // Evidence tools
    'evidence_checklist', // Evidence collection checklist
    'proof_of_service', // Proof of service template (editable PDF)
  ]),
  is_preview: z.boolean().optional().default(true),
});

function buildAddress(...parts: Array<string | null | undefined>) {
  const cleaned = parts.map((p) => (typeof p === 'string' ? p.trim() : p)).filter(Boolean) as string[];
  return cleaned.join('\n');
}

/**
 * Best-effort extraction of a "property_address" from a few common fact shapes.
 * This is a fallback to stop preview blowing up if one field is missing.
 */
function ensurePropertyAddress(data: Record<string, any>) {
  if (data.property_address && String(data.property_address).trim()) return data;

  const fromProperty =
    buildAddress(
      data.property_address_line1,
      data.property_address_line2,
      data.property_address_town,
      data.property_address_county,
      data.property_address_postcode
    ) || null;

  const fromNestedProperty =
    buildAddress(
      data.property?.address_line1,
      data.property?.address_line2,
      data.property?.city,
      data.property?.postcode
    ) || null;

  const propertyAddress = fromProperty || fromNestedProperty;

  if (propertyAddress) {
    return {
      ...data,
      property_address: propertyAddress,
    };
  }

  return data;
}

function missingFieldsForSection8(caseData: Record<string, any>): string[] {
  const missing: string[] = [];
  if (!caseData.property_address) missing.push('property_address');
  if (!caseData.tenant_full_name) missing.push('tenant_full_name');
  if (!caseData.landlord_full_name) missing.push('landlord_full_name');
  // Check for either grounds (Section8Ground[]) or ground_codes (string[])
  const hasGrounds = Array.isArray(caseData.grounds) && caseData.grounds.length > 0;
  const hasGroundCodes = Array.isArray(caseData.ground_codes) && caseData.ground_codes.length > 0;
  if (!hasGrounds && !hasGroundCodes) missing.push('grounds');
  // Add more here if your generator requires them strictly
  return missing;
}

function missingFieldsForSection21(caseData: Record<string, any>): string[] {
  const missing: string[] = [];
  if (!caseData.property_address) missing.push('property_address');
  if (!caseData.tenant_full_name) missing.push('tenant_full_name');
  if (!caseData.landlord_full_name) missing.push('landlord_full_name');
  if (!caseData.notice_expiry_date && !caseData.notice?.expiry_date) {
    missing.push('notice_expiry_date');
  }
  return missing;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = generateDocumentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { case_id, document_type, is_preview } = validationResult.data;

    // For final docs, require auth
    if (!is_preview) {
      await requireServerAuth();
    }

    const supabase = await createServerSupabaseClient();

    // Fetch case metadata (RLS handles auth / anon)
    const { data, error: caseError } = await supabase
      .from('cases')
      .select('id, jurisdiction, user_id, collected_facts')
      .eq('id', case_id)
      .single();

    if (caseError || !data) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Case not found in documents generate route', {
          caseId: case_id,
          error: caseError?.message ?? caseError,
        });
      }
      return NextResponse.json({ error: 'Case not found', code: 'CASE_NOT_FOUND' }, { status: 404 });
    }

    const caseRow = data as {
      id: string;
      jurisdiction: string;
      user_id: string | null;
      collected_facts?: any;
    };

    // Load WizardFacts (source of truth) + fallback to collected_facts if present
    const wizardFactsFromStore = await getOrCreateWizardFacts(supabase, case_id);
    const wizardFacts = (wizardFactsFromStore && Object.keys(wizardFactsFromStore).length > 0)
      ? wizardFactsFromStore
      : (caseRow.collected_facts ?? {});

    const canonicalJurisdiction =
      deriveCanonicalJurisdiction(caseRow.jurisdiction, wizardFacts) ||
      deriveCanonicalJurisdiction(caseRow.jurisdiction, caseRow.collected_facts);

    if (!canonicalJurisdiction) {
      return NextResponse.json({
        code: 'INVALID_JURISDICTION',
        error: 'Invalid or missing jurisdiction',
        user_message: 'Jurisdiction must be one of england, wales, scotland, or northern-ireland.',
        blocking_issues: [],
        warnings: [],
      }, { status: 422 });
    }

    // Guard: NI only supports tenancy documents
    if (
      canonicalJurisdiction === 'northern-ireland' &&
      !['private_tenancy', 'private_tenancy_premium'].includes(document_type)
    ) {
      return NextResponse.json(
        {
          code: 'NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED',
          error: 'Northern Ireland eviction and money claim documents are not yet supported',
          user_message: 'We currently support tenancy agreements for Northern Ireland. Eviction and money claim support is planned for Q2 2026.',
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 }
      );
    }

    // ============================================================================
    // UNIFIED VALIDATION VIA REQUIREMENTS ENGINE
    // ============================================================================
    // Map document_type to product and route
    let product: string = 'notice_only';
    let route: string = 'section_21';

    if (document_type === 'section8_notice') {
      product = 'notice_only';
      route = 'section_8';
    } else if (document_type === 'section21_notice') {
      product = 'notice_only';
      route = 'section_21';
    } else if (['ast_standard', 'ast_premium'].includes(document_type)) {
      product = 'tenancy_agreement';
      route = 'tenancy_agreement';
    } else if (document_type === 'notice_to_leave') {
      product = 'notice_only';
      route = 'notice_to_leave';
    } else if (['prt_agreement', 'prt_premium'].includes(document_type)) {
      product = 'tenancy_agreement';
      route = 'tenancy_agreement';
    } else if (['private_tenancy', 'private_tenancy_premium'].includes(document_type)) {
      product = 'tenancy_agreement';
      route = 'tenancy_agreement';
    }

    console.log('[GENERATE] Running unified validation via validateForGenerate');
    const validationError = validateForGenerate({
      jurisdiction: canonicalJurisdiction,
      product: product as any,
      route,
      facts: wizardFacts,
      caseId: case_id,
    });

    if (validationError) {
      console.warn('[GENERATE] Unified validation blocked generation:', {
        case_id,
        document_type,
      });
      return validationError; // Already a NextResponse with standardized 422 payload
    }

    let generatedDoc: any;
    let documentTitle = '';

    try {
      switch (document_type) {
        /**
         * England & Wales eviction docs:
         * IMPORTANT: Map wizard facts -> CaseData so Section 8 generator gets property_address, grounds, etc.
         */
        case 'section8_notice': {
          // Extract BOTH caseData and evictionCase - evictionCase contains the full grounds array
          const { caseData, evictionCase } = wizardFactsToEnglandWalesEviction(case_id, wizardFacts);

          // Merge grounds from evictionCase into caseData for Section 8 generator
          const section8Data = {
            ...caseData,
            grounds: evictionCase.grounds, // Add the full grounds array (Section8Ground[])
          };

          const safeCaseData = ensurePropertyAddress(section8Data as any);
          const missing = missingFieldsForSection8(safeCaseData);

          if (missing.length > 0) {
            return NextResponse.json(
              {
                error: 'Missing required fields for Section 8 notice',
                code: 'MISSING_REQUIRED_FIELDS',
                documentType: 'section8_notice',
                missing,
                missingFields: missing, // Include both formats for compatibility
              },
              { status: 422 }
            );
          }

          generatedDoc = await generateSection8Notice(safeCaseData as any);
          documentTitle = 'Section 8 Notice - Notice Seeking Possession';
          break;
        }

        case 'section21_notice': {
          // ✅ ELIGIBILITY CHECK: Verify Section 21 is allowed before generating
          // First check if wizard has auto-selected a different route
          const selectedNoticeRoute = (wizardFacts as any).selected_notice_route;
          const routeOverride = (wizardFacts as any).route_override;

          if (selectedNoticeRoute === 'section_8') {
            // Wizard has auto-selected Section 8 due to S21 being blocked
            return NextResponse.json(
              {
                error: 'Section 21 is not available for this case',
                code: 'SECTION_21_BLOCKED',
                explanation: routeOverride?.reason || 'Section 21 eligibility requirements not met. Your case has been automatically routed to Section 8.',
                blocking_issues: routeOverride?.blocking_issues || [],
                alternative_routes: ['section_8'],
                suggested_action: 'Use Section 8 notice instead or fix the compliance issues listed in blocking_issues',
              },
              { status: 403 } // 403 Forbidden (not just unprocessable - legally forbidden)
            );
          }

          // Run decision engine as additional safety check
          const caseFacts = wizardFactsToCaseFacts(wizardFacts);
          const decisionInput: DecisionInput = {
            jurisdiction: canonicalJurisdiction,
            product: 'notice_only', // This route handles notice generation
            case_type: 'eviction',
            facts: caseFacts,
          };
          const decisionOutput = runDecisionEngine(decisionInput);

          // Block if Section 21 is not in allowed_routes
          if (!decisionOutput.allowed_routes.includes('section_21')) {
            const blockingReasons = decisionOutput.blocking_issues
              .filter(b => b.route === 'section_21')
              .map(b => b.description);

            return NextResponse.json(
              {
                error: 'Section 21 is not available for this case',
                code: 'SECTION_21_BLOCKED',
                explanation: decisionOutput.route_explanations.section_21 || 'Section 21 eligibility requirements not met',
                blocking_issues: blockingReasons,
                alternative_routes: decisionOutput.allowed_routes,
                suggested_action: 'Use Section 8 instead or fix the compliance issues listed in blocking_issues',
              },
              { status: 403 } // 403 Forbidden (not just unprocessable - legally forbidden)
            );
          }

          const { caseData } = wizardFactsToEnglandWalesEviction(case_id, wizardFacts);
          const safeCaseData = ensurePropertyAddress(caseData as any);
          const missing = missingFieldsForSection21(safeCaseData);

          if (missing.length > 0) {
            return NextResponse.json(
              {
                error: 'Missing required fields for Section 21 notice',
                code: 'MISSING_REQUIRED_FIELDS',
                documentType: 'section21_notice',
                missing,
                missingFields: missing, // Include both formats for compatibility
              },
              { status: 422 }
            );
          }

          // Section 21 is England-only (Wales uses Section 173)
          // Use canonical notice_only template path for England
          const templatePath = canonicalJurisdiction === 'wales'
            ? 'uk/wales/templates/eviction/section21_form6a.hbs' // Legacy path for any Wales edge cases
            : 'uk/england/templates/notice_only/form_6a_section21/notice.hbs'; // Canonical England path

          generatedDoc = await generateDocument({
            templatePath,
            data: safeCaseData as any,
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Section 21 Notice - Form 6A';
          break;
        }

        /**
         * AST
         */
        case 'ast_standard': {
          const astData = mapWizardToASTData(wizardFacts);

          const { validateASTSuitability } = await import('@/lib/documents/ast-generator');
          const suitabilityResult = validateASTSuitability(astData);

          if (!suitabilityResult.valid) {
            return NextResponse.json(
              {
                code: 'AST_NOT_SUITABLE',
                error: 'AST suitability checks failed',
                user_message:
                  'This scenario is not appropriate for an AST. ' +
                  suitabilityResult.reasons.join('. ') +
                  '. You may need a lodger or licence agreement instead.',
                blocking_issues: suitabilityResult.reasons,
                warnings: [],
              },
              { status: 422 }
            );
          }

          generatedDoc = await generateStandardAST(astData);
          documentTitle = 'Assured Shorthold Tenancy Agreement - Standard';
          break;
        }

        case 'ast_premium': {
          const astData = mapWizardToASTData(wizardFacts);

          const { validateASTSuitability } = await import('@/lib/documents/ast-generator');
          const suitabilityResult = validateASTSuitability(astData);

          if (!suitabilityResult.valid) {
            return NextResponse.json(
              {
                code: 'AST_NOT_SUITABLE',
                error: 'AST suitability checks failed',
                user_message:
                  'This scenario is not appropriate for an AST. ' +
                  suitabilityResult.reasons.join('. ') +
                  '. You may need a lodger or licence agreement instead.',
                blocking_issues: suitabilityResult.reasons,
                warnings: [],
              },
              { status: 422 }
            );
          }

          generatedDoc = await generatePremiumAST(astData);
          documentTitle = 'Assured Shorthold Tenancy Agreement - Premium';
          break;
        }

        /**
         * Scotland
         */
        case 'notice_to_leave': {
          const noticeToLeaveData = mapWizardToNoticeToLeave(wizardFacts as any);
          generatedDoc = await generateNoticeToLeave(noticeToLeaveData);
          documentTitle = 'Notice to Leave - Scotland';
          break;
        }

        case 'prt_agreement': {
          const prtData = mapWizardToPRTData(wizardFacts as any);
          generatedDoc = await generatePRTAgreement(prtData);
          documentTitle = 'Private Residential Tenancy Agreement - Scotland';
          break;
        }

        case 'prt_premium': {
          const { generatePremiumPRT } = await import('@/lib/documents/scotland/prt-generator');
          const prtPremiumData = mapWizardToPRTData(wizardFacts as any);
          generatedDoc = await generatePremiumPRT(prtPremiumData);
          documentTitle = 'Premium Private Residential Tenancy Agreement - Scotland';
          break;
        }

        /**
         * Northern Ireland
         */
        case 'private_tenancy': {
          const privateTenancyData = mapWizardToPrivateTenancyData(wizardFacts as any);
          generatedDoc = await generatePrivateTenancyAgreement(privateTenancyData);
          documentTitle = 'Private Tenancy Agreement - Northern Ireland';
          break;
        }

        case 'private_tenancy_premium': {
          const { generatePremiumPrivateTenancy } = await import(
            '@/lib/documents/northern-ireland/private-tenancy-generator'
          );
          const privateTenancyPremiumData = mapWizardToPrivateTenancyData(wizardFacts as any);
          generatedDoc = await generatePremiumPrivateTenancy(privateTenancyPremiumData);
          documentTitle = 'Premium Private Tenancy Agreement - Northern Ireland';
          break;
        }

        /**
         * Court Forms (England - Complete Eviction Pack)
         *
         * IMPORTANT: These use the OFFICIAL HMCTS PDF forms from /public/official-forms/
         * filled via pdf-lib. Courts ONLY accept their official forms - we cannot
         * generate custom PDFs that look like court forms.
         */
        case 'n5_claim': {
          const { caseData } = wizardFactsToEnglandWalesEviction(case_id, wizardFacts);
          const safeCaseData = ensurePropertyAddress(caseData as any) as CaseData;

          // Fill official N5 PDF form using pdf-lib
          const pdfBytes = await fillOfficialForm('n5', safeCaseData);

          generatedDoc = {
            pdf: Buffer.from(pdfBytes),
            html: null, // Official PDFs have no HTML representation
          };

          documentTitle = 'Form N5 - Claim for Possession of Property';
          break;
        }

        case 'n119_particulars': {
          const { caseData } = wizardFactsToEnglandWalesEviction(case_id, wizardFacts);
          const safeCaseData = ensurePropertyAddress(caseData as any) as CaseData;

          // Fill official N119 PDF form using pdf-lib
          const pdfBytes = await fillOfficialForm('n119', safeCaseData);

          generatedDoc = {
            pdf: Buffer.from(pdfBytes),
            html: null, // Official PDFs have no HTML representation
          };

          documentTitle = 'Form N119 - Particulars of Claim for Possession';
          break;
        }

        case 'n5b_claim': {
          const { caseData } = wizardFactsToEnglandWalesEviction(case_id, wizardFacts);
          const safeCaseData = ensurePropertyAddress(caseData as any) as CaseData;

          // Fill official N5B PDF form using pdf-lib
          const pdfBytes = await fillOfficialForm('n5b', safeCaseData);

          generatedDoc = {
            pdf: Buffer.from(pdfBytes),
            html: null, // Official PDFs have no HTML representation
          };

          documentTitle = 'Form N5B - Claim for Possession (Accelerated Procedure)';
          break;
        }

        case 'arrears_schedule': {
          // Get arrears data from wizard facts
          const caseFacts = wizardFactsToCaseFacts(wizardFacts);
          const arrearsItems = caseFacts.issues?.rent_arrears?.arrears_items || [];
          const totalArrears = wizardFacts.total_arrears ||
                               wizardFacts.rent_arrears_amount ||
                               caseFacts.issues?.rent_arrears?.total_arrears || 0;
          const rentAmount = wizardFacts.rent_amount ||
                              caseFacts.tenancy?.rent_amount || 0;
          const rentFrequency = wizardFacts.rent_frequency ||
                                 caseFacts.tenancy?.rent_frequency || 'monthly';

          const arrearsData = getArrearsScheduleData({
            arrears_items: arrearsItems,
            total_arrears: totalArrears,
            rent_amount: rentAmount,
            rent_frequency: rentFrequency as any,
            include_schedule: true,
          });

          if (!arrearsData.include_schedule_pdf) {
            return NextResponse.json(
              {
                error: 'No arrears schedule data available',
                code: 'NO_ARREARS_DATA',
                user_message: 'There is no detailed arrears schedule to generate. Please enter arrears data in the wizard first.',
              },
              { status: 422 }
            );
          }

          // Determine jurisdiction key for template path
          const jurisdictionKey = canonicalJurisdiction === 'wales' ? 'wales' : 'england';

          generatedDoc = await generateDocument({
            templatePath: `uk/${jurisdictionKey}/templates/money_claims/schedule_of_arrears.hbs`,
            data: {
              claimant_reference: wizardFacts.claimant_reference || case_id,
              arrears_schedule: arrearsData.arrears_schedule,
              arrears_total: arrearsData.arrears_total,
              rent_amount: rentAmount,
              rent_frequency: rentFrequency,
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Schedule of Arrears';
          break;
        }

        // =================================================================
        // AI-GENERATED DOCUMENTS (Ask Heaven)
        // =================================================================

        case 'witness_statement': {
          const caseFacts = wizardFactsToCaseFacts(wizardFacts);
          const witnessContext = extractWitnessStatementContext(caseFacts);
          const witnessContent = await generateWitnessStatement(caseFacts, witnessContext);

          const jurisdictionKey = canonicalJurisdiction === 'scotland' ? 'scotland' : 'england';

          generatedDoc = await generateDocument({
            templatePath: `uk/${jurisdictionKey}/templates/eviction/witness-statement.hbs`,
            data: {
              landlord_name: witnessContext.landlord_name,
              landlord_address: wizardFacts.landlord_address || '',
              tenant_name: witnessContext.tenant_name,
              property_address: witnessContext.property_address,
              court_name: wizardFacts.court_name || 'County Court',
              witness_statement: witnessContent,
              generated_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'AI-Drafted Witness Statement';
          break;
        }

        case 'compliance_audit': {
          const caseFacts = wizardFactsToCaseFacts(wizardFacts);
          const complianceContext = extractComplianceAuditContext(caseFacts);
          const complianceContent = await generateComplianceAudit(caseFacts, complianceContext);

          const jurisdictionKey = canonicalJurisdiction === 'scotland' ? 'scotland' : 'england';

          generatedDoc = await generateDocument({
            templatePath: `uk/${jurisdictionKey}/templates/eviction/compliance-audit.hbs`,
            data: {
              landlord_name: wizardFacts.landlord_full_name || 'Landlord',
              property_address: wizardFacts.property_address || '',
              compliance_audit: complianceContent,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Compliance Audit Report';
          break;
        }

        case 'risk_assessment': {
          const caseFacts = wizardFactsToCaseFacts(wizardFacts);
          const riskContext = extractRiskAssessmentContext(caseFacts);
          const riskContent = await generateRiskAssessment(caseFacts, riskContext);

          const jurisdictionKey = canonicalJurisdiction === 'scotland' ? 'scotland' : 'england';

          generatedDoc = await generateDocument({
            templatePath: `uk/${jurisdictionKey}/templates/eviction/risk-report.hbs`,
            data: {
              landlord_name: riskContext.landlord_name,
              tenant_name: riskContext.tenant_name,
              property_address: riskContext.property_address,
              case_type: wizardFacts.eviction_route || 'eviction',
              risk_assessment: riskContent,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Case Risk Assessment Report';
          break;
        }

        // =================================================================
        // GUIDANCE DOCUMENTS
        // =================================================================

        case 'eviction_roadmap': {
          const jurisdictionKey = canonicalJurisdiction === 'scotland' ? 'scotland' : 'england';
          const route = wizardFacts.eviction_route || wizardFacts.selected_notice_route || 'section_8';

          generatedDoc = await generateDocument({
            templatePath: `uk/${jurisdictionKey}/templates/eviction/eviction_roadmap.hbs`,
            data: {
              ...wizardFacts,
              jurisdiction: canonicalJurisdiction,
              route,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Step-by-Step Eviction Roadmap';
          break;
        }

        case 'service_instructions': {
          const jurisdictionKey = canonicalJurisdiction === 'scotland' ? 'scotland' : 'england';
          const route = wizardFacts.eviction_route || wizardFacts.selected_notice_route || 'section_8';

          // Select route-specific template if available
          let templatePath = `uk/${jurisdictionKey}/templates/eviction/service_instructions.hbs`;
          if (route === 'section_21' && canonicalJurisdiction === 'england') {
            templatePath = `uk/england/templates/eviction/service_instructions_section_21.hbs`;
          } else if (route === 'section_8' && canonicalJurisdiction === 'england') {
            templatePath = `uk/england/templates/eviction/service_instructions_section_8.hbs`;
          }

          generatedDoc = await generateDocument({
            templatePath,
            data: {
              ...wizardFacts,
              jurisdiction: canonicalJurisdiction,
              route,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Service Instructions';
          break;
        }

        case 'service_checklist': {
          const jurisdictionKey = canonicalJurisdiction === 'scotland' ? 'scotland' : 'england';
          const route = wizardFacts.eviction_route || wizardFacts.selected_notice_route || 'section_8';

          // Select route-specific checklist
          let templatePath = `uk/${jurisdictionKey}/templates/eviction/compliance_checklist.hbs`;
          if (route === 'section_21' && canonicalJurisdiction === 'england') {
            templatePath = `uk/england/templates/eviction/checklist_section_21.hbs`;
          } else if (route === 'section_8' && canonicalJurisdiction === 'england') {
            templatePath = `uk/england/templates/eviction/checklist_section_8.hbs`;
          }

          generatedDoc = await generateDocument({
            templatePath,
            data: {
              ...wizardFacts,
              jurisdiction: canonicalJurisdiction,
              route,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Service & Validity Checklist';
          break;
        }

        case 'expert_guidance': {
          const jurisdictionKey = canonicalJurisdiction === 'scotland' ? 'scotland' : 'england';

          generatedDoc = await generateDocument({
            templatePath: `uk/${jurisdictionKey}/templates/eviction/expert_guidance.hbs`,
            data: {
              ...wizardFacts,
              jurisdiction: canonicalJurisdiction,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Expert Eviction Guidance';
          break;
        }

        case 'eviction_timeline': {
          generatedDoc = await generateDocument({
            templatePath: 'shared/templates/eviction_timeline.hbs',
            data: {
              ...wizardFacts,
              jurisdiction: canonicalJurisdiction,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Eviction Timeline & Expectations';
          break;
        }

        case 'case_summary': {
          const caseFacts = wizardFactsToCaseFacts(wizardFacts);
          const { caseData } = wizardFactsToEnglandWalesEviction(case_id, wizardFacts);

          generatedDoc = await generateDocument({
            templatePath: 'shared/templates/case_summary.hbs',
            data: {
              ...caseData,
              ...wizardFacts,
              caseFacts,
              jurisdiction: canonicalJurisdiction,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Eviction Case Summary';
          break;
        }

        // =================================================================
        // EVIDENCE TOOLS
        // =================================================================

        case 'evidence_checklist': {
          const route = wizardFacts.eviction_route || wizardFacts.selected_notice_route || 'section_8';

          generatedDoc = await generateDocument({
            templatePath: 'shared/templates/evidence_collection_checklist.hbs',
            data: {
              ...wizardFacts,
              jurisdiction: canonicalJurisdiction,
              route,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Evidence Collection Checklist';
          break;
        }

        case 'proof_of_service': {
          // Generate editable PDF form with fillable fields
          const proofPdfBytes = await generateProofOfServicePDF({
            landlord_name: wizardFacts.landlord_full_name,
            tenant_name: wizardFacts.tenant_full_name,
            property_address: wizardFacts.property_address,
            document_served: wizardFacts.eviction_route === 'section_21'
              ? 'Section 21 Notice (Form 6A)'
              : wizardFacts.eviction_route === 'section_8'
              ? 'Section 8 Notice (Form 3)'
              : 'Notice seeking possession',
          });

          generatedDoc = {
            pdf: Buffer.from(proofPdfBytes),
            html: null, // Editable PDFs have no HTML representation
          };

          documentTitle = 'Proof of Service (Editable Form)';
          break;
        }

        case 'court_filing_guide': {
          // England & Wales only
          if (canonicalJurisdiction === 'scotland') {
            return NextResponse.json(
              { error: 'Court Filing Guide is for England & Wales. Use Tribunal Lodging Guide for Scotland.' },
              { status: 400 }
            );
          }

          generatedDoc = await generateDocument({
            templatePath: 'uk/england/templates/eviction/court_filing_guide.hbs',
            data: {
              ...wizardFacts,
              jurisdiction: canonicalJurisdiction,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Court Filing Guide';
          break;
        }

        case 'tribunal_lodging_guide': {
          // Scotland only
          if (canonicalJurisdiction !== 'scotland') {
            return NextResponse.json(
              { error: 'Tribunal Lodging Guide is for Scotland. Use Court Filing Guide for England & Wales.' },
              { status: 400 }
            );
          }

          generatedDoc = await generateDocument({
            templatePath: 'uk/scotland/templates/eviction/tribunal_lodging_guide.hbs',
            data: {
              ...wizardFacts,
              jurisdiction: canonicalJurisdiction,
              current_date: new Date().toLocaleDateString('en-GB'),
            },
            isPreview: is_preview,
            outputFormat: 'both',
          });

          documentTitle = 'Tribunal Lodging Guide';
          break;
        }

        default:
          return NextResponse.json({ error: 'Unsupported document type' }, { status: 400 });
      }
    } catch (genError: any) {
      console.error('Document generation failed:', genError);
      return NextResponse.json(
        {
          error: `Document generation failed: ${genError?.message || 'Unknown error'}`,
          code: 'DOCUMENT_GENERATION_FAILED',
        },
        { status: 500 }
      );
    }

    // Upload PDF (if available)
    let pdfUrl: string | null = null;

    if (generatedDoc?.pdf) {
      const adminClient = createAdminClient();
      const userFolder = caseRow.user_id || 'anonymous';
      const fileName = `${userFolder}/${case_id}/${document_type}_${Date.now()}.pdf`;

      const { error: uploadError } = await adminClient.storage
        .from('documents')
        .upload(fileName, generatedDoc.pdf, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        console.error('Failed to upload PDF:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload document to storage', code: 'UPLOAD_FAILED' },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = adminClient.storage.from('documents').getPublicUrl(fileName);
      pdfUrl = publicUrlData.publicUrl;
    }

    // Save document record
    const { data: documentRecord, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: caseRow.user_id,
        case_id,
        document_type,
        document_title: documentTitle,
        jurisdiction: canonicalJurisdiction,
        html_content: generatedDoc?.html || null,
        pdf_url: pdfUrl,
        is_preview,
        qa_passed: false,
        qa_score: null,
        qa_issues: [],
      } as any)
      .select()
      .single();

    if (dbError) {
      console.error('Failed to save document record:', dbError);
      return NextResponse.json(
        { error: 'Failed to save document', code: 'DB_SAVE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        document: documentRecord,
        message: 'Document generated successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Generate document error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
