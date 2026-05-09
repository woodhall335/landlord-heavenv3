/**
 * Notice Only Thumbnail API
 *
 * GET /api/notice-only/thumbnail/[caseId]?document_type=...
 *
 * Generates a watermarked JPEG thumbnail of the first page of an eviction document
 * WITHOUT creating persistent database records. This allows preview thumbnails for
 * notice-only and complete-pack flows where documents are only generated post-payment.
 *
 * Supports:
 * - England: Form 3A notice thumbnails, N215, N5, N119, witness statement,
 *   service instructions, service checklist
 * - Wales: section173_notice, fault_based_notice, service_instructions, service_checklist
 * - Scotland: notice_to_leave, service_instructions, service_checklist
 * - All: arrears_schedule (when applicable)
 *
 * Returns:
 * - 200 OK with image/jpeg content type
 * - 400 if document_type is missing or invalid
 * - 404 if case not found
 * - 422 if validation fails
 * - 500 on generation error
 */

import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient, tryGetServerUser } from '@/lib/supabase/server';
import {
  pdfBytesToPreviewThumbnail,
  htmlToPdf,
  generateDocument,
  compileTemplate,
  loadTemplate,
} from '@/lib/documents/generator';
import { mapNoticeOnlyFacts, wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { deriveCanonicalJurisdiction, type CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { normalizeSection8Facts } from '@/lib/wizard/normalizeSection8Facts';
import { mapWalesFaultGroundsToGroundCodes } from '@/lib/wales';
import { generateSection21Notice, mapWizardToSection21Data } from '@/lib/documents/section21-generator';
import { fillOfficialForm } from '@/lib/documents/official-forms-filler';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';
import { generateWitnessStatement, extractWitnessStatementContext } from '@/lib/ai/witness-statement-generator';
import { generateEnglandN215PDF, normalizeEnglandProofOfServiceMethod } from '@/lib/documents/england-n215-generator';
import {
  buildEnglandForm3AGroundsText,
  EnglandForm3ALegalWordingError,
} from '@/lib/england-possession/legal-wording';
import { enrichEnglandSection8TemplateGrounds } from '@/lib/case-facts/enrich-england-section8-template-grounds';
import {
  generateCompleteEvictionPack,
  generateNoticeOnlyPack,
  type EvictionPackDocument,
} from '@/lib/documents/eviction-pack-generator';
import { buildEvictionPackGenerationFacts } from '@/lib/documents/eviction-pack-facts';
import {
  applyEnglandSection8CourtPackCalculation,
  buildEnglandSection8CourtPackCalculation,
} from '@/lib/documents/england-section8-court-pack';

// Force Node.js runtime - Puppeteer/@sparticuz/chromium cannot run on Edge
export const runtime = 'nodejs';

// Disable static optimization
export const dynamic = 'force-dynamic';

// Environment detection
const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isDev = process.env.NODE_ENV === 'development';
const e2eEnabled = process.env.E2E_MODE === 'true' || process.env.NEXT_PUBLIC_E2E_MODE === 'true';

const PACK_PREVIEW_DOCUMENT_TYPES = new Set([
  'section8_notice',
  'section21_notice',
  'section173_notice',
  'fault_based_notice',
  'notice_to_leave',
  'service_instructions',
  'validity_checklist',
  'compliance_declaration',
  'pre_service_compliance_checklist',
  'proof_of_service',
  'arrears_schedule',
  'n5_claim',
  'n119_particulars',
  'n5b_claim',
  'form_e_tribunal',
  'evidence_checklist',
  'witness_statement',
  'court_readiness_status',
  'court_bundle_index',
  'hearing_checklist',
  'arrears_engagement_letter',
  'case_summary',
  'court_filing_guide',
  'what_happens_next',
]);

async function getPackPreviewDocument(
  pack: 'notice_only' | 'complete_pack',
  wizardFacts: Record<string, any>,
  documentType: string,
  context: {
    caseId: string;
    jurisdiction: CanonicalJurisdiction;
    selectedRoute?: string | null;
  },
): Promise<EvictionPackDocument | null> {
  const enrichedFacts = buildEvictionPackGenerationFacts({
    facts: wizardFacts,
    caseId: context.caseId,
    jurisdiction: context.jurisdiction,
    product: pack,
    selectedRoute: context.selectedRoute,
  });

  const generatedPack =
    pack === 'complete_pack'
      ? await generateCompleteEvictionPack(enrichedFacts)
      : await generateNoticeOnlyPack(enrichedFacts);

  return generatedPack.documents.find((document) => document.document_type === documentType) || null;
}

async function enrichEnglandSection8CaseDataForCourtPack(
  caseId: string,
  wizardFacts: Record<string, any>,
  caseData: Record<string, any>,
): Promise<Record<string, any>> {
  const { evictionCase } = wizardFactsToEnglandWalesEviction(caseId, wizardFacts);
  const isEnglandSection8 =
    caseData.jurisdiction === 'england' &&
    caseData.claim_type === 'section_8' &&
    Array.isArray(evictionCase.grounds) &&
    evictionCase.grounds.length > 0;

  if (!isEnglandSection8) {
    return caseData;
  }

  const calculation = await buildEnglandSection8CourtPackCalculation({
    wizardFacts,
    caseData,
    evictionCase,
  });

  applyEnglandSection8CourtPackCalculation(wizardFacts, calculation);
  applyEnglandSection8CourtPackCalculation(caseData, calculation);
  applyEnglandSection8CourtPackCalculation(evictionCase as any, calculation);

  return caseData;
}

/**
 * Structured error response
 */
function errorResponse(code: string, message: string, status: number, details?: Record<string, unknown>) {
  const logData = { code, message, status, ...details, isVercel, timestamp: new Date().toISOString() };
  console.error(`[Notice-Only-Thumbnail] ${code}:`, logData);
  return NextResponse.json({ error: message, code, ...(isDev ? { details } : {}) }, { status });
}

/**
 * Map config document ID to template document type
 */
function resolveDocumentType(configId: string, jurisdiction: string): string | null {
  // Notice documents
  if (configId === 'notice-form-3a' || configId === 'form-3a') {
    return 'section8_notice';
  }
  if (configId === 'notice-section-21' || configId === 'section21_notice') {
    return jurisdiction === 'england' ? 'section8_notice' : 'section21_notice';
  }
  if (configId === 'notice-section-8' || configId === 'section8_notice') {
    return 'section8_notice';
  }
  if (configId === 'notice-section-173' || configId === 'section173_notice') {
    return 'section173_notice';
  }
  if (configId === 'notice-fault-based' || configId === 'fault_based_notice') {
    return 'fault_based_notice';
  }
  if (configId === 'notice-to-leave' || configId === 'notice_to_leave') {
    return 'notice_to_leave';
  }

  // Service instructions - same for all routes within jurisdiction
  if (configId.startsWith('service-instructions') || configId === 'service_instructions') {
    return 'service_instructions';
  }

  // Checklists
  if (configId.startsWith('validity-checklist') || configId === 'validity_checklist' || configId === 'service_checklist') {
    return 'validity_checklist';
  }

  if (configId === 'pre-service-checklist-fault' || configId === 'pre_service_compliance_checklist') {
    return 'pre_service_compliance_checklist';
  }

  // Arrears schedule
  if (configId === 'arrears-schedule' || configId === 'arrears-schedule-complete' || configId === 'arrears_schedule') {
    return 'arrears_schedule';
  }

  if (
    configId === 'proof_of_service' ||
    configId === 'proof-of-service-form-3a' ||
    configId === 'form_n215' ||
    configId === 'n215'
  ) {
    return 'proof_of_service';
  }

  if (configId === 'n5_claim' || configId === 'form_n5') {
    return 'n5_claim';
  }

  if (configId === 'n119_particulars' || configId === 'form_n119') {
    return 'n119_particulars';
  }

  if (configId === 'form_e_tribunal' || configId === 'form_e' || configId === 'form-e' || configId === 'tribunal_application') {
    return 'form_e_tribunal';
  }

  if (configId === 'witness_statement') {
    return 'witness_statement';
  }

  // Pre-Service Compliance Declaration
  if (configId.startsWith('pre-service-compliance') ||
      configId === 'compliance-checklist-form-3a' ||
      configId === 'compliance_checklist' ||
      configId === 'compliance_checklist_section21' ||
      configId === 'pre_service_compliance' ||
      configId === 'compliance_declaration') {
    return 'compliance_declaration';
  }

  if (configId === 'evidence_checklist') {
    return 'evidence_checklist';
  }

  if (configId === 'court_readiness_status' || configId === 'court-readiness-status') {
    return 'court_readiness_status';
  }

  if (configId === 'court_bundle_index') {
    return 'court_bundle_index';
  }

  if (configId === 'hearing_checklist' || configId === 'hearing-checklist') {
    return 'hearing_checklist';
  }

  if (configId === 'arrears_engagement_letter') {
    return 'arrears_engagement_letter';
  }

  if (configId === 'court_filing_guide' || configId === 'court-filing-guide') {
    return 'court_filing_guide';
  }

  if (configId === 'case_summary' || configId === 'case-summary-stage-1' || configId === 'case-summary-stage-2') {
    return 'case_summary';
  }

  if (configId === 'what_happens_next' || configId === 'what-happens-next-stage-1' || configId === 'what-happens-next-stage-2') {
    return 'what_happens_next';
  }

  return null;
}

/**
 * Get template path for a document type
 */
function getTemplatePath(
  docType: string,
  jurisdiction: CanonicalJurisdiction,
  route: string
): string | null {
  // England templates
  if (jurisdiction === 'england') {
    if (docType === 'section8_notice') {
      return 'FORM3A_SPECIAL';
    }
    if (docType === 'proof_of_service') {
      return 'N215_SPECIAL';
    }
    if (docType === 'n5_claim') {
      return 'N5_SPECIAL';
    }
    if (docType === 'n119_particulars') {
      return 'N119_SPECIAL';
    }
    if (docType === 'witness_statement') {
      return 'WITNESS_STATEMENT_SPECIAL';
    }
    if (docType === 'section21_notice') {
      // Section 21 uses a dedicated generator - handle differently
      return 'SECTION21_SPECIAL';
    }
    if (docType === 'service_instructions') {
      const instructionRoute = route === 'section_21' || route === 'accelerated_possession' ? 'section_21' : 'section_8';
      return `uk/england/templates/eviction/service_instructions_${instructionRoute}.hbs`;
    }
    if (docType === 'validity_checklist') {
      const checklistRoute = route === 'section_21' || route === 'accelerated_possession' ? 'section_21' : 'section_8';
      return `uk/england/templates/eviction/checklist_${checklistRoute}.hbs`;
    }
    if (docType === 'arrears_schedule') {
      return 'uk/england/templates/money_claims/schedule_of_arrears.hbs';
    }
    if (docType === 'compliance_declaration') {
      // Use route-specific compliance checklist
      const isSection21 = route === 'section_21' || route === 'accelerated_possession';
      return isSection21
        ? 'uk/england/templates/notice_only/form_6a_section21/compliance_checklist_section21.hbs'
        : 'uk/england/templates/eviction/compliance_checklist.hbs';
    }
    if (docType === 'what_happens_next') {
      return 'uk/england/templates/eviction/what_happens_next_section_8.hbs';
    }
    if (docType === 'court_filing_guide') {
      return 'uk/england/templates/eviction/court_filing_guide.hbs';
    }
    if (docType === 'case_summary') {
      return 'CASE_SUMMARY_SPECIAL';
    }
  }

  // Wales templates
  if (jurisdiction === 'wales') {
    if (docType === 'section173_notice') {
      // Section 173 uses a dedicated generator
      return 'SECTION173_SPECIAL';
    }
    if (docType === 'fault_based_notice') {
      return 'uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs';
    }
    if (docType === 'service_instructions') {
      const walesRoute = route === 'wales_section_173' || route === 'section_173' ? 'section_173' : 'fault_based';
      return `uk/wales/templates/eviction/service_instructions_${walesRoute}.hbs`;
    }
    if (docType === 'validity_checklist') {
      const checklistRoute = route === 'wales_section_173' || route === 'section_173' ? 'section_173' : 'fault_based';
      return `uk/wales/templates/eviction/checklist_${checklistRoute}.hbs`;
    }
    if (docType === 'arrears_schedule') {
      return 'uk/wales/templates/money_claims/schedule_of_arrears.hbs';
    }
    if (docType === 'compliance_declaration') {
      return 'uk/wales/templates/eviction/compliance_checklist.hbs';
    }
  }

  // Scotland templates
  if (jurisdiction === 'scotland') {
    if (docType === 'notice_to_leave') {
      return 'uk/scotland/templates/notice_only/notice_to_leave_prt_2017/notice.hbs';
    }
    if (docType === 'service_instructions') {
      return 'uk/scotland/templates/eviction/service_instructions_notice_to_leave.hbs';
    }
    if (docType === 'validity_checklist') {
      return 'uk/scotland/templates/eviction/checklist_notice_to_leave.hbs';
    }
    if (docType === 'arrears_schedule') {
      return 'uk/scotland/templates/money_claims/schedule_of_arrears.hbs';
    }
    if (docType === 'compliance_declaration') {
      return 'uk/scotland/templates/eviction/compliance_checklist.hbs';
    }
  }

  return null;
}

/**
 * Format date in UK legal format
 */
function formatUKDate(dateString: string): string {
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
  } catch {
    return dateString;
  }
}

function buildAddress(...parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => (typeof part === 'string' ? part.trim() : part))
    .filter(Boolean)
    .join('\n');
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildFallbackCaseSummaryHtml(params: {
  title: string;
  wizardFacts: Record<string, any>;
  selectedRoute: string;
  jurisdiction: CanonicalJurisdiction;
}): string {
  const { title, wizardFacts, selectedRoute, jurisdiction } = params;
  const landlord = wizardFacts.landlord_full_name || wizardFacts.landlord_name || 'Landlord';
  const tenant = wizardFacts.tenant_full_name || wizardFacts.tenant_name || 'Tenant';
  const property =
    wizardFacts.property_address ||
    buildAddress(
      wizardFacts.property_address_line1,
      wizardFacts.property_address_line2,
      wizardFacts.property_address_town || wizardFacts.property_city,
      wizardFacts.property_address_county,
      wizardFacts.property_address_postcode,
    );
  const serviceDate = wizardFacts.notice_service_date || wizardFacts.notice_date || wizardFacts.notice_served_date;
  const expiryDate = wizardFacts.notice_expiry_date || wizardFacts.earliest_possession_date;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #141124; padding: 32px; }
    .eyebrow { color: #6d28d9; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
    h1 { font-size: 28px; margin: 10px 0 18px; }
    .card { border: 1px solid #d8c9ff; border-radius: 14px; padding: 16px; margin: 12px 0; }
    .label { color: #5b536f; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .value { margin-top: 5px; font-size: 15px; line-height: 1.45; }
  </style>
</head>
<body>
  <div class="eyebrow">Notice pack preview</div>
  <h1>${escapeHtml(title)}</h1>
  <div class="card"><div class="label">Landlord</div><div class="value">${escapeHtml(landlord)}</div></div>
  <div class="card"><div class="label">Tenant</div><div class="value">${escapeHtml(tenant)}</div></div>
  <div class="card"><div class="label">Property</div><div class="value">${escapeHtml(property)}</div></div>
  <div class="card"><div class="label">Route</div><div class="value">${escapeHtml(jurisdiction)} / ${escapeHtml(selectedRoute)}</div></div>
  <div class="card"><div class="label">Notice dates</div><div class="value">Service: ${escapeHtml(serviceDate || 'To confirm')}<br />Expiry: ${escapeHtml(expiryDate || 'Calculated from the notice period')}</div></div>
</body>
</html>`;
}

function getFallbackDocumentTitle(docType: string): string {
  switch (docType) {
    case 'section8_notice':
      return 'Form 3A notice';
    case 'service_instructions':
      return 'Service Instructions';
    case 'validity_checklist':
      return 'Service & Validity Checklist';
    case 'compliance_declaration':
      return 'Pre-Service Compliance Declaration';
    case 'proof_of_service':
      return 'Certificate of Service (Form N215)';
    case 'arrears_schedule':
      return 'Rent Schedule / Arrears Statement';
    case 'case_summary':
      return 'Case Summary - Stage 1 Notice & Service';
    case 'what_happens_next':
      return 'What Happens Next';
    case 'n5_claim':
      return 'Claim for possession (Form N5)';
    case 'n119_particulars':
      return 'Particulars of claim (Form N119)';
    case 'witness_statement':
      return 'Witness statement';
    default:
      return 'Document preview';
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const startTime = Date.now();
  let caseId: string | null = null;

  try {
    const resolvedParams = await params;
    caseId = resolvedParams.caseId;

    if (e2eEnabled) {
      return errorResponse('E2E_THUMBNAIL_UNAVAILABLE', 'Real PDF thumbnails are not generated in E2E mode', 503);
    }

    // Parse query params
    const url = new URL(request.url);
    const documentType = url.searchParams.get('document_type');
    const pack = (url.searchParams.get('pack') || '').trim() as 'notice_only' | 'complete_pack' | '';

    if (!caseId) {
      return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
    }

    if (!documentType) {
      return errorResponse('MISSING_DOCUMENT_TYPE', 'document_type query parameter is required', 400);
    }

    console.log(`[Notice-Only-Thumbnail] Request:`, { caseId, documentType });

    // Get user and create client
    const user = await tryGetServerUser();
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();

    // Fetch case
    let query = supabase.from('cases').select('*').eq('id', caseId);
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('[Notice-Only-Thumbnail] Case not found:', fetchError);
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404);
    }

    const caseRow = data as any;
    const wizardFacts = caseRow.wizard_facts || caseRow.collected_facts || caseRow.facts || {};

    // Normalize Section 8 facts
    normalizeSection8Facts(wizardFacts);

    // Determine jurisdiction
    const jurisdiction = deriveCanonicalJurisdiction(caseRow.jurisdiction, wizardFacts) as CanonicalJurisdiction;

    if (!jurisdiction) {
      return errorResponse('INVALID_JURISDICTION', 'Invalid or missing jurisdiction', 422);
    }

    if (jurisdiction === 'northern-ireland') {
      return errorResponse('NI_NOT_SUPPORTED', 'Northern Ireland not supported', 422);
    }

    // Determine selected route
    let selectedRoute =
      wizardFacts.selected_notice_route ||
      wizardFacts.eviction_route ||
      wizardFacts.eviction_route_intent ||
      caseRow.recommended_route ||
      wizardFacts.route_recommendation?.recommended_route;

    // Normalize Wales routes
    if (jurisdiction === 'wales' && selectedRoute) {
      if (selectedRoute === 'section_173' || selectedRoute === 'fault_based') {
        selectedRoute = `wales_${selectedRoute}`;
      }
    }

    // Wales route salvage
    if (jurisdiction === 'wales') {
      const isEnglandRoute = selectedRoute === 'section_21' || selectedRoute === 'section_8';
      const isUnknownRoute = !selectedRoute || (
        selectedRoute !== 'wales_section_173' &&
        selectedRoute !== 'wales_fault_based'
      );

      if (isEnglandRoute || isUnknownRoute) {
        const hasFaultGrounds = Array.isArray(wizardFacts.wales_fault_grounds) &&
          wizardFacts.wales_fault_grounds.length > 0;
        selectedRoute = hasFaultGrounds ? 'wales_fault_based' : 'wales_section_173';
      }
    }

    // Default route if none specified
    if (!selectedRoute) {
      if (jurisdiction === 'scotland') {
        selectedRoute = 'notice_to_leave';
      } else if (jurisdiction === 'wales') {
        selectedRoute = 'wales_section_173';
      } else {
        selectedRoute = 'section_8';
      }
    }

    if (jurisdiction === 'england') {
      selectedRoute = 'section_8';
    }

    // Derive ground_codes for Wales fault-based
    if (jurisdiction === 'wales' && selectedRoute === 'wales_fault_based') {
      const existingGroundCodes = wizardFacts.ground_codes;
      const hasGroundCodes = Array.isArray(existingGroundCodes) && existingGroundCodes.length > 0;
      const walesFaultGrounds = wizardFacts.wales_fault_grounds;
      const hasFaultGrounds = Array.isArray(walesFaultGrounds) && walesFaultGrounds.length > 0;

      if (!hasGroundCodes && hasFaultGrounds) {
        wizardFacts.ground_codes = mapWalesFaultGroundsToGroundCodes(walesFaultGrounds);
      }
    }

    // Resolve the document type from config ID
    const resolvedDocType = resolveDocumentType(documentType, jurisdiction);
    if (!resolvedDocType) {
      return errorResponse('INVALID_DOCUMENT_TYPE', `Unknown document type: ${documentType}`, 400);
    }

    if (pack && PACK_PREVIEW_DOCUMENT_TYPES.has(resolvedDocType)) {
      let previewDocument: EvictionPackDocument | null = null;

      try {
        previewDocument = await getPackPreviewDocument(
          pack,
          wizardFacts,
          resolvedDocType,
          { caseId, jurisdiction, selectedRoute },
        );
      } catch (err) {
        console.error('[Notice-Only-Thumbnail] Pack PDF generation failed:', {
          caseId,
          pack,
          resolvedDocType,
          error: err instanceof Error ? err.message : String(err),
        });
        return errorResponse(
          'PACK_PDF_GENERATION_FAILED',
          'Could not generate the real pack PDF for this thumbnail',
          500,
          { caseId, pack, resolvedDocType, error: err instanceof Error ? err.message : String(err) }
        );
      }

      if (!previewDocument) {
        return errorResponse(
          'PACK_DOCUMENT_NOT_FOUND',
          'The generated pack did not include this document',
          404,
          { caseId, pack, resolvedDocType }
        );
      }

      if (!previewDocument.pdf) {
        return errorResponse(
          'PACK_DOCUMENT_PDF_MISSING',
          'The generated pack document does not have a PDF body',
          500,
          { caseId, pack, resolvedDocType }
        );
      }

      try {
        const thumbnail = await pdfBytesToPreviewThumbnail(previewDocument.pdf, {
          watermarkText: 'PREVIEW',
          documentId: `${caseId}-${resolvedDocType}`,
        });

        const headers: Record<string, string> = {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': 'inline; filename="preview.jpg"',
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'X-Thumbnail-Runtime': 'nodejs',
          'X-Document-Type': resolvedDocType,
          'X-Thumbnail-Source': 'generated-pack-pdf',
        };

        if (!isVercel) {
          headers['Content-Length'] = thumbnail.length.toString();
        }

        return new NextResponse(new Uint8Array(thumbnail), { status: 200, headers });
      } catch (err) {
        console.error('[Notice-Only-Thumbnail] Pack PDF thumbnail rendering failed:', {
          caseId,
          pack,
          resolvedDocType,
          error: err instanceof Error ? err.message : String(err),
        });
        return errorResponse(
          'PACK_PDF_THUMBNAIL_RENDER_FAILED',
          'Could not render a thumbnail from the real generated PDF',
          500,
          { caseId, pack, resolvedDocType, error: err instanceof Error ? err.message : String(err) }
        );
      }
    }

    // Get template path
    const templatePath = getTemplatePath(resolvedDocType, jurisdiction, selectedRoute);
    if (!templatePath) {
      return errorResponse('NO_TEMPLATE', `No template found for ${resolvedDocType} in ${jurisdiction}`, 400);
    }

    console.log(`[Notice-Only-Thumbnail] Generating:`, {
      docType: resolvedDocType,
      templatePath,
      jurisdiction,
      route: selectedRoute
    });

    // Build template data
    let templateData = mapNoticeOnlyFacts(wizardFacts);

    if (jurisdiction === 'england' && selectedRoute === 'section_8') {
      templateData = await enrichEnglandSection8TemplateGrounds(templateData);
    }

    // Add formatted dates
    templateData.service_date_formatted = formatUKDate(templateData.service_date || '');
    templateData.notice_date_formatted = formatUKDate(templateData.notice_date || '');
    templateData.earliest_possession_date_formatted = formatUKDate(templateData.earliest_possession_date || '');
    templateData.tenancy_start_date_formatted = formatUKDate(templateData.tenancy_start_date || '');
    templateData.generated_date = formatUKDate(new Date().toISOString().split('T')[0]);

    // Add convenience flags
    templateData.is_section_8 = selectedRoute === 'section_8';
    templateData.is_section_21 = selectedRoute === 'section_21' || selectedRoute === 'accelerated_possession';
    templateData.is_wales_section_173 = selectedRoute === 'wales_section_173';
    templateData.is_wales_fault_based = selectedRoute === 'wales_fault_based';

    const { caseData } =
      jurisdiction === 'england' || jurisdiction === 'wales'
        ? wizardFactsToEnglandWalesEviction(caseId, wizardFacts)
        : { caseData: null as any };

    if (jurisdiction === 'england' && caseData) {
      await enrichEnglandSection8CaseDataForCourtPack(caseId, wizardFacts, caseData);
    }

    // Wales-specific fields
    if (jurisdiction === 'wales') {
      const contractStartDate = wizardFacts.contract_start_date || templateData.tenancy_start_date;
      templateData.contract_start_date_formatted = formatUKDate(contractStartDate || '');
      templateData.contract_holder_full_name = wizardFacts.contract_holder_full_name || templateData.tenant_full_name;
    }

    // Generate HTML or official-PDF thumbnail content
    let html: string | null = null;
    let pdfThumbnail: Buffer | null = null;

    try {
    if (templatePath === 'FORM3A_SPECIAL') {
      const selectedGrounds = [
        ...(Array.isArray(wizardFacts.selected_grounds) ? wizardFacts.selected_grounds : []),
        ...(Array.isArray(wizardFacts.section8_grounds) ? wizardFacts.section8_grounds : []),
        ...(Array.isArray(wizardFacts.section8_grounds_selection) ? wizardFacts.section8_grounds_selection : []),
      ]
        .map((ground) =>
          String((ground && typeof ground === 'object' ? ground.code || ground.value || ground.label : ground) || '').trim()
        )
        .filter(Boolean);
      const groundsText = await buildEnglandForm3AGroundsText(selectedGrounds);

      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Form 3A notice</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 28px; color: #111827; }
    .eyebrow { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280; }
    h1 { font-size: 26px; margin: 8px 0 18px; }
    .meta { font-size: 14px; margin-bottom: 18px; color: #374151; }
    .card { border: 2px solid #111827; padding: 18px; margin-bottom: 16px; }
    .card h2 { font-size: 16px; margin: 0 0 10px; }
    .label { font-weight: 700; }
    pre { white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.45; margin: 0; }
  </style>
</head>
<body>
  <div class="eyebrow">England official notice</div>
    <h1>Form 3A notice</h1>
  <div class="meta">Post-1 May 2026 private rented sector route</div>
  <div class="card">
    <h2>Tenant and property</h2>
    <div><span class="label">Tenant:</span> ${templateData.tenant_full_name || ''}</div>
    <div><span class="label">Property:</span> ${templateData.property_address || ''}</div>
  </div>
  <div class="card">
    <h2>Ground wording</h2>
    <pre>${groundsText}</pre>
  </div>
</body>
</html>`;
    } else if (templatePath === 'N215_SPECIAL') {
      const proofPropertyAddress =
        wizardFacts.property_address ||
        buildAddress(
          wizardFacts.property_address_line1,
          wizardFacts.property_address_line2,
          wizardFacts.property_address_town || wizardFacts.property_city,
          wizardFacts.property_address_county,
          wizardFacts.property_address_postcode,
        );

      const n215Bytes = await generateEnglandN215PDF({
        court_name: wizardFacts.court_name,
        claim_number: wizardFacts.claim_number,
        claimant_name: wizardFacts.landlord_full_name,
        defendant_name: wizardFacts.tenant_full_name,
        signatory_name: wizardFacts.signatory_name || wizardFacts.landlord_full_name,
        signatory_capacity: wizardFacts.solicitor_firm ? 'claimant_legal_representative' : 'claimant',
        signatory_firm: wizardFacts.solicitor_firm,
        signatory_position: (wizardFacts as any).signatory_position,
        recipient_name: wizardFacts.tenant_full_name,
        recipient_capacity:
          ((wizardFacts as any).notice_service_recipient_capacity as
            | 'claimant'
            | 'defendant'
            | 'solicitor'
            | 'litigation_friend'
            | undefined) || 'defendant',
        service_location:
          ((wizardFacts as any).notice_service_location as
            | 'usual_residence'
            | 'last_known_residence'
            | 'place_of_business'
            | 'principal_place_of_business'
            | 'last_known_place_of_business'
            | 'last_known_principal_place_of_business'
            | 'principal_office_of_partnership'
            | 'principal_office_of_corporation'
            | 'principal_office_of_company'
            | 'place_of_business_of_partnership_company_corporation'
            | 'within_jurisdiction_connection'
            | 'other'
            | undefined) || 'usual_residence',
        service_location_other: (wizardFacts as any).notice_service_location_other,
        service_address: proofPropertyAddress,
        service_address_line1: wizardFacts.property_address_line1,
        service_address_line2: wizardFacts.property_address_line2,
        service_address_town: wizardFacts.property_address_town || wizardFacts.property_city,
        service_address_county: wizardFacts.property_address_county,
        service_address_postcode: wizardFacts.property_address_postcode || wizardFacts.property_postcode,
        service_date:
          (caseData as any)?.notice_service_date ||
          (caseData as any)?.notice_served_date ||
          wizardFacts.notice_service_date ||
          wizardFacts.notice_served_date ||
          wizardFacts.notice_date,
        deemed_service_date:
          (caseData as any)?.deemed_service_date,
        signature_date:
          wizardFacts.signature_date ||
          (caseData as any)?.notice_service_date ||
          (caseData as any)?.notice_served_date ||
          wizardFacts.notice_service_date ||
          wizardFacts.notice_served_date ||
          wizardFacts.notice_date,
        service_time: (wizardFacts as any).service_time || (wizardFacts as any).notice_service_time,
        service_method: normalizeEnglandProofOfServiceMethod(wizardFacts.notice_service_method),
        dx_number: wizardFacts.dx_number,
        fax_number: (wizardFacts as any).fax_number,
        recipient_email:
          (wizardFacts as any).notice_service_recipient_email || wizardFacts.tenant_email,
        other_electronic_identification: (wizardFacts as any).other_electronic_identification,
        document_served: selectedRoute === 'section_21' ? 'Section 21 notice (Form 6A)' : 'Form 3A notice',
      });

      pdfThumbnail = await pdfBytesToPreviewThumbnail(n215Bytes, {
        watermarkText: 'PREVIEW',
        documentId: `${caseId}-n215`,
      });
    } else if (templatePath === 'N5_SPECIAL') {
      const n5Bytes = await fillOfficialForm('n5', caseData);
      pdfThumbnail = await pdfBytesToPreviewThumbnail(n5Bytes, {
        watermarkText: 'PREVIEW',
        documentId: `${caseId}-n5`,
      });
    } else if (templatePath === 'N119_SPECIAL') {
      const n119Bytes = await fillOfficialForm('n119', caseData);
      pdfThumbnail = await pdfBytesToPreviewThumbnail(n119Bytes, {
        watermarkText: 'PREVIEW',
        documentId: `${caseId}-n119`,
      });
    } else if (templatePath === 'WITNESS_STATEMENT_SPECIAL') {
      const witnessFacts = wizardFactsToCaseFacts(wizardFacts);
      const witnessContext = extractWitnessStatementContext(witnessFacts);
      const witnessContent = await generateWitnessStatement(witnessFacts, witnessContext);

      const witnessDoc = await generateDocument({
        templatePath: `uk/england/templates/eviction/witness-statement.hbs`,
        data: {
          landlord_name: witnessContext.landlord_name,
          landlord_address: wizardFacts.landlord_address || caseData?.landlord_address || '',
          tenant_name: witnessContext.tenant_name,
          property_address: witnessContext.property_address,
          court_name: wizardFacts.court_name || caseData?.court_name || 'County Court',
          witness_statement: witnessContent,
          generated_date: new Date().toLocaleDateString('en-GB'),
        },
        isPreview: true,
        outputFormat: 'both',
      });

      html = witnessDoc.html;
    } else if (templatePath === 'SECTION21_SPECIAL') {
      // Use dedicated Section 21 generator
      const section21NoticeData = mapWizardToSection21Data(wizardFacts, {
        serviceDate: templateData.service_date || templateData.notice_date,
      });
      await generateSection21Notice(section21NoticeData, true);
      // We need HTML, but this generator returns PDF
      // Fall back to generating from template directly
      const fallbackTemplate = 'uk/england/templates/notice_only/form_6a_section21/notice.hbs';
      const content = loadTemplate(fallbackTemplate);
      html = compileTemplate(content, templateData);
    } else if (templatePath === 'SECTION173_SPECIAL') {
      // Use dedicated Section 173 generator template
      // HARD-LOCKED to RHW16 (6-month notice) for standard occupation contracts
      const { generateWalesSection173Notice } = await import('@/lib/documents/wales-section173-generator');
      const contractStartDate = wizardFacts.contract_start_date || templateData.tenancy_start_date;
      const section173Data = {
        landlord_full_name: templateData.landlord_full_name,
        landlord_address: templateData.landlord_address,
        contract_holder_full_name: templateData.contract_holder_full_name || templateData.tenant_full_name,
        property_address: templateData.property_address,
        contract_start_date: contractStartDate,
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
      // Get HTML output
      await generateWalesSection173Notice(section173Data, true);
      // The generator returns PDF, but we need HTML - generate from base template
      const isConverted = wizardFacts.wales_contract_category === 'converted' ||
                          wizardFacts.is_converted_contract === true;
      const walesTemplate = isConverted
        ? 'uk/wales/templates/notice_only/rhw17_section173_converted/notice.hbs'
        : 'uk/wales/templates/notice_only/rhw16_section173_standard/notice.hbs';
      const content = loadTemplate(walesTemplate);
      html = compileTemplate(content, { ...templateData, ...section173Data });
    } else if (resolvedDocType === 'case_summary') {
      html = buildFallbackCaseSummaryHtml({
        title: 'Case Summary - Stage 1 Notice & Service',
        wizardFacts,
        selectedRoute,
        jurisdiction,
      });
    } else if (resolvedDocType === 'arrears_schedule') {
      // Special handling for arrears schedule
      const arrearsItems = wizardFacts.arrears_items || [];
      if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
        html = buildFallbackCaseSummaryHtml({
          title: 'Rent Schedule / Arrears Statement',
          wizardFacts,
          selectedRoute,
          jurisdiction,
        });
      } else {
        const { getArrearsScheduleData } = await import('@/lib/documents/arrears-schedule-mapper');
        const arrearsScheduleData = getArrearsScheduleData({
          arrears_items: arrearsItems,
          total_arrears: wizardFacts.total_arrears || null,
          rent_amount: templateData.rent_amount || wizardFacts.rent_amount || 0,
          rent_frequency: templateData.rent_frequency || wizardFacts.rent_frequency || 'monthly',
          include_schedule: true,
        });
        const content = loadTemplate(templatePath);
        html = compileTemplate(content, {
          claimant_reference: caseId,
          arrears_schedule: arrearsScheduleData.arrears_schedule,
          arrears_total: arrearsScheduleData.arrears_total,
        });
      }
    } else if (resolvedDocType === 'fault_based_notice') {
      // Special handling for Wales fault-based notice
      const faultBasedSection = wizardFacts.wales_fault_based_section || '';
      const breachType = wizardFacts.wales_breach_type || wizardFacts.breach_or_ground || '';
      const isRentArrears =
        breachType === 'rent_arrears' ||
        breachType === 'arrears' ||
        faultBasedSection.includes('Section 157') ||
        faultBasedSection.includes('Section 159');

      let breachParticulars = '';

      if (faultBasedSection.includes('Section 157')) {
        const arrearsAmount = wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount || 0;
        breachParticulars = `Breach of contract (section 157)\n\nSerious rent arrears (2+ months)\n\nTotal arrears: £${arrearsAmount.toLocaleString('en-GB')}`;
      } else if (faultBasedSection.includes('Section 159')) {
        const arrearsAmount = wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount || 0;
        breachParticulars = `Breach of contract (section 159)\n\nRent arrears (less than 2 months)\n\nTotal arrears: £${arrearsAmount.toLocaleString('en-GB')}`;
      } else if (faultBasedSection.includes('Section 161')) {
        breachParticulars = `Breach of contract (section 161)\n\nAnti-social behaviour\n\n${wizardFacts.asb_description || wizardFacts.breach_description || wizardFacts.breach_details || ''}`;
      } else if (faultBasedSection.includes('Section 162')) {
        breachParticulars = `Breach of contract (section 162)\n\n${wizardFacts.breach_description || wizardFacts.breach_details || ''}`;
      } else if (isRentArrears) {
        const arrearsAmount = wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount || 0;
        breachParticulars = `Breach of contract (section 157)\n\nSerious rent arrears (2+ months)\n\nTotal arrears: £${arrearsAmount.toLocaleString('en-GB')}`;
      } else {
        breachParticulars = wizardFacts.breach_description || wizardFacts.breach_details || wizardFacts.asb_description || '';
      }

      const faultBasedData = {
        ...templateData,
        breach_particulars: breachParticulars,
      };

      const content = loadTemplate(templatePath);
      html = compileTemplate(content, faultBasedData);
    } else {
      // Standard template generation
      const content = loadTemplate(templatePath);
      html = compileTemplate(content, templateData);
    }
    } catch (err) {
      if (err instanceof EnglandForm3ALegalWordingError || resolvedDocType === 'section8_notice') {
        return errorResponse(
          (err as any)?.code || 'FORM3A_THUMBNAIL_GENERATION_FAILED',
          err instanceof Error ? err.message : 'Could not generate the real Form 3A thumbnail',
          (err as any)?.statusCode || 500,
          { caseId, resolvedDocType },
        );
      }

      pdfThumbnail = null;
      html = buildFallbackCaseSummaryHtml({
        title: getFallbackDocumentTitle(resolvedDocType),
        wizardFacts,
        selectedRoute,
        jurisdiction,
      });
      console.warn('[Notice-Only-Thumbnail] Document preview generation failed; using fallback thumbnail source:', {
        caseId,
        resolvedDocType,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // Legacy non-pack path: still render a real PDF first, then thumbnail the PDF.
    // Checkout cards pass pack=notice_only/complete_pack and use the generated pack PDFs above.
    let thumbnailSourcePdf: Buffer | Uint8Array | null = pdfThumbnail;

    try {
      if (!thumbnailSourcePdf && html) {
        thumbnailSourcePdf = await htmlToPdf(html);
      }

      if (!thumbnailSourcePdf) {
        return errorResponse(
          'PDF_SOURCE_MISSING',
          'No real PDF was generated for this thumbnail',
          500,
          { caseId, resolvedDocType }
        );
      }

      const thumbnail = await pdfBytesToPreviewThumbnail(thumbnailSourcePdf, {
        quality: 75,
        watermarkText: 'PREVIEW',
        documentId: `${caseId}-${resolvedDocType}`,
      });

      const elapsed = Date.now() - startTime;
      console.log(`[Notice-Only-Thumbnail] Success:`, {
        caseId,
        docType: resolvedDocType,
        size: thumbnail.length,
        elapsed: `${elapsed}ms`,
      });

      // Return JPEG image
      const headers: Record<string, string> = {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'inline; filename="preview.jpg"',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        'X-Thumbnail-Runtime': 'nodejs',
        'X-Document-Type': resolvedDocType,
        'X-Thumbnail-Source': 'generated-pdf',
      };

      // Only set Content-Length in non-Vercel environments
      if (!isVercel) {
        headers['Content-Length'] = thumbnail.length.toString();
      }

      return new NextResponse(new Uint8Array(thumbnail), { status: 200, headers });
    } catch (err) {
      return errorResponse(
        'PDF_THUMBNAIL_RENDER_FAILED',
        'Could not render a thumbnail from the real generated PDF',
        500,
        { caseId, resolvedDocType, error: err instanceof Error ? err.message : String(err) }
      );
    }

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to generate thumbnail',
      500,
      {
        error: error.message,
        stack: isDev ? error.stack : undefined,
        caseId,
        elapsed: `${elapsed}ms`,
      }
    );
  }
}
