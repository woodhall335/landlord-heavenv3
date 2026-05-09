import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient, tryGetServerUser } from '@/lib/supabase/server';
import { mapNoticeOnlyFacts, wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { normalizeSection8Facts } from '@/lib/wizard/normalizeSection8Facts';
import { deriveCanonicalJurisdiction, type CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { fillOfficialForm, type CaseData } from '@/lib/documents/official-forms-filler';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';
import { generateWitnessStatement, extractWitnessStatementContext } from '@/lib/ai/witness-statement-generator';
import { generateEnglandN215PDF, normalizeEnglandProofOfServiceMethod } from '@/lib/documents/england-n215-generator';
import { generateDocument, htmlToPdf } from '@/lib/documents/generator';
import { getArrearsScheduleData } from '@/lib/documents/arrears-schedule-mapper';
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
import { buildPdfEmbedHtml } from '@/lib/previews/documentEmbedShell';
import {
  applyEnglandSection8CourtPackCalculation,
  buildEnglandSection8CourtPackCalculation,
} from '@/lib/documents/england-section8-court-pack';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function errorResponse(code: string, message: string, status: number, details?: Record<string, unknown>) {
  console.error(`[Notice-Only-Embed] ${code}:`, { message, status, ...details });
  return NextResponse.json({ error: message, code }, { status });
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

function getEnglandSupportDocumentTemplate(documentType: string): string | null {
  switch (documentType) {
    case 'service_instructions':
      return 'uk/england/templates/eviction/service_instructions_section_8.hbs';
    case 'validity_checklist':
      return 'uk/england/templates/eviction/checklist_section_8.hbs';
    case 'compliance_declaration':
      return 'uk/england/templates/eviction/compliance_checklist.hbs';
    case 'what_happens_next':
      return 'uk/england/templates/eviction/what_happens_next_section_8.hbs';
    case 'court_filing_guide':
      return 'uk/england/templates/eviction/court_filing_guide.hbs';
    default:
      return null;
  }
}

function getEnglandPreviewTitle(documentType: string): string {
  switch (documentType) {
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
      return 'Rent schedule / arrears statement';
    case 'case_summary':
      return 'Case Summary - Stage 1 Notice & Service';
    case 'what_happens_next':
      return 'What Happens Next';
    case 'court_filing_guide':
      return 'Court Filing Guide';
    default:
      return 'Document preview';
  }
}

function buildFallbackCaseSummaryHtml(params: {
  title: string;
  wizardFacts: Record<string, any>;
}): string {
  const { title, wizardFacts } = params;
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

  return `<section style="font-family: Arial, sans-serif; color: #141124; padding: 28px;">
    <p style="color:#6d28d9;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">Notice pack preview</p>
    <h1 style="font-size:28px;margin:10px 0 18px;">${escapeHtml(title)}</h1>
    <div style="border:1px solid #d8c9ff;border-radius:14px;padding:16px;margin:12px 0;"><strong>Landlord</strong><br />${escapeHtml(landlord)}</div>
    <div style="border:1px solid #d8c9ff;border-radius:14px;padding:16px;margin:12px 0;"><strong>Tenant</strong><br />${escapeHtml(tenant)}</div>
    <div style="border:1px solid #d8c9ff;border-radius:14px;padding:16px;margin:12px 0;"><strong>Property</strong><br />${escapeHtml(property)}</div>
    <div style="border:1px solid #d8c9ff;border-radius:14px;padding:16px;margin:12px 0;"><strong>Notice dates</strong><br />Service: ${escapeHtml(serviceDate || 'To confirm')}<br />Expiry: ${escapeHtml(expiryDate || 'Calculated from the notice period')}</div>
  </section>`;
}

async function buildFallbackSection8NoticeHtml(
  wizardFacts: Record<string, any>,
  caseData: CaseData,
): Promise<string> {
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

  return `<section style="font-family: Arial, sans-serif; color: #111827; padding: 28px;">
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;font-weight:700;">England official notice preview</p>
    <h1 style="font-size:28px;margin:8px 0 18px;">Form 3A notice</h1>
    <div style="border:2px solid #111827;padding:18px;margin-bottom:16px;">
      <h2 style="font-size:16px;margin:0 0 10px;">Tenant and property</h2>
      <div><strong>Tenant:</strong> ${escapeHtml(caseData.tenant_full_name || wizardFacts.tenant_full_name)}</div>
      <div><strong>Property:</strong> ${escapeHtml(caseData.property_address || wizardFacts.property_address)}</div>
    </div>
    <div style="border:2px solid #111827;padding:18px;margin-bottom:16px;">
      <h2 style="font-size:16px;margin:0 0 10px;">Ground wording</h2>
      <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:13px;line-height:1.45;">${escapeHtml(groundsText)}</pre>
    </div>
  </section>`;
}

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

function resolvePackDocumentType(documentType: string): string {
  const aliases: Record<string, string> = {
    'case-summary-stage-1': 'case_summary',
    'case-summary-stage-2': 'case_summary',
    'notice-form-3a': 'section8_notice',
    'form-3a': 'section8_notice',
    'notice-section-21': 'section21_notice',
    'notice-section-173': 'section173_notice',
    'notice-fault-based': 'fault_based_notice',
    'notice-to-leave': 'notice_to_leave',
    'service-instructions-form-3a': 'service_instructions',
    'service-instructions-s8': 'service_instructions',
    'service-instructions-s21': 'service_instructions',
    'service-instructions-s173': 'service_instructions',
    'service-instructions-fault': 'service_instructions',
    'service-instructions-ntl': 'service_instructions',
    'validity-checklist-s8': 'validity_checklist',
    'validity-checklist-s21': 'validity_checklist',
    'validity-checklist-s173': 'validity_checklist',
    'validity-checklist-fault': 'validity_checklist',
    'validity-checklist-ntl': 'validity_checklist',
    'validity-checklist-form-3a': 'validity_checklist',
    service_checklist: 'validity_checklist',
    'compliance-checklist-form-3a': 'compliance_declaration',
    compliance_checklist: 'compliance_declaration',
    pre_service_compliance: 'compliance_declaration',
    'pre-service-checklist-fault': 'pre_service_compliance_checklist',
    'proof-of-service-form-3a': 'proof_of_service',
    form_n215: 'proof_of_service',
    n215: 'proof_of_service',
    form_n5: 'n5_claim',
    form_n119: 'n119_particulars',
    'form-e': 'form_e_tribunal',
    form_e: 'form_e_tribunal',
    tribunal_application: 'form_e_tribunal',
    'arrears-schedule': 'arrears_schedule',
    'arrears-schedule-complete': 'arrears_schedule',
    'hearing-checklist': 'hearing_checklist',
    'what-happens-next-stage-1': 'what_happens_next',
    'what-happens-next-stage-2': 'what_happens_next',
    'court-filing-guide': 'court_filing_guide',
    'court-readiness-status': 'court_readiness_status',
    'evidence-checklist': 'evidence_checklist',
  };

  return aliases[documentType] || documentType;
}

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
  caseData: CaseData,
): Promise<CaseData> {
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
  applyEnglandSection8CourtPackCalculation(caseData as any, calculation);
  applyEnglandSection8CourtPackCalculation(evictionCase as any, calculation);

  return caseData;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const url = new URL(request.url);
  const requestedDocumentType = (url.searchParams.get('document_type') || '').trim();
  const documentType = resolvePackDocumentType(requestedDocumentType);
  const pack = (url.searchParams.get('pack') || '').trim() as 'notice_only' | 'complete_pack' | '';

  if (!requestedDocumentType) {
    return errorResponse('MISSING_DOCUMENT_TYPE', 'document_type is required', 400);
  }

  try {
    const user = await tryGetServerUser();
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();

    let query = supabase.from('cases').select('*').eq('id', caseId);
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.single();
    if (error || !data) {
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404, { caseId });
    }

    const caseRow = data as any;
    const wizardFacts = caseRow.wizard_facts || caseRow.collected_facts || caseRow.facts || {};
    normalizeSection8Facts(wizardFacts);

    const jurisdiction = deriveCanonicalJurisdiction(caseRow.jurisdiction, wizardFacts);

    if (!jurisdiction) {
      return errorResponse('INVALID_JURISDICTION', 'Invalid or missing jurisdiction', 422, { caseId });
    }

    const selectedRoute =
      wizardFacts.selected_notice_route ||
      wizardFacts.eviction_route ||
      wizardFacts.eviction_route_intent ||
      caseRow.recommended_route ||
      wizardFacts.route_recommendation?.recommended_route ||
      null;

    if (pack && PACK_PREVIEW_DOCUMENT_TYPES.has(documentType)) {
      let previewDocument: EvictionPackDocument | null = null;

      try {
        previewDocument = await getPackPreviewDocument(
          pack,
          wizardFacts,
          documentType,
          { caseId, jurisdiction, selectedRoute },
        );
      } catch (err) {
        console.error('[Notice-Only-Embed] Pack PDF generation failed:', {
          caseId,
          pack,
          documentType,
          error: err instanceof Error ? err.message : String(err),
        });
        return errorResponse(
          'PACK_PDF_GENERATION_FAILED',
          'Could not generate the real pack PDF for this preview',
          500,
          { caseId, pack, documentType, error: err instanceof Error ? err.message : String(err) }
        );
      }

      if (!previewDocument) {
        return errorResponse(
          'PACK_DOCUMENT_NOT_FOUND',
          'The generated pack did not include this document',
          404,
          { caseId, pack, documentType }
        );
      }

      if (!previewDocument.pdf) {
        return errorResponse(
          'PACK_DOCUMENT_PDF_MISSING',
          'The generated pack document does not have a PDF body',
          500,
          { caseId, pack, documentType }
        );
      }

      const html = buildPdfEmbedHtml(previewDocument.title, previewDocument.pdf);

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'private, no-store, max-age=0',
          'X-Content-Type-Options': 'nosniff',
          'X-Preview-Source': 'generated-pack-pdf',
        },
      });
    }

    if (jurisdiction !== 'england') {
      return errorResponse('UNSUPPORTED_JURISDICTION', 'Only pack-backed previews are supported for this jurisdiction', 422, { jurisdiction });
    }

    const { caseData } = wizardFactsToEnglandWalesEviction(caseId, wizardFacts);
    await enrichEnglandSection8CaseDataForCourtPack(caseId, wizardFacts, caseData);
    const caseFacts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;

    let title = '';
    let pdfBytes: Uint8Array | null = null;
    let htmlContent: string | null = null;

    try {
    if (documentType === 'section8_notice') {
      title = 'Form 3A notice';
      try {
        pdfBytes = await fillOfficialForm('form3a', caseData);
      } catch (err) {
        console.warn('[Notice-Only-Embed] Form 3A PDF preview failed; using HTML fallback:', {
          caseId,
          error: err instanceof Error ? err.message : String(err),
        });
        htmlContent = await buildFallbackSection8NoticeHtml(wizardFacts, caseData);
      }
    } else if (documentType === 'proof_of_service') {
      title = 'Certificate of Service (Form N215)';
      pdfBytes = await generateEnglandN215PDF({
        court_name: wizardFacts.court_name,
        claim_number: wizardFacts.claim_number,
        claimant_name: wizardFacts.landlord_full_name,
        defendant_name: wizardFacts.tenant_full_name,
        signatory_name: wizardFacts.signatory_name || wizardFacts.landlord_full_name,
        signatory_capacity: wizardFacts.solicitor_firm ? 'claimant_legal_representative' : 'claimant',
        signatory_firm: wizardFacts.solicitor_firm,
        signatory_position: (wizardFacts as any).signatory_position,
        recipient_name: wizardFacts.tenant_full_name,
        recipient_capacity: ((wizardFacts as any).notice_service_recipient_capacity as any) || 'defendant',
        service_location: ((wizardFacts as any).notice_service_location as any) || 'usual_residence',
        service_location_other: (wizardFacts as any).notice_service_location_other,
        service_address:
          wizardFacts.property_address ||
          buildAddress(
            wizardFacts.property_address_line1,
            wizardFacts.property_address_line2,
            wizardFacts.property_address_town || wizardFacts.property_city,
            wizardFacts.property_address_county,
            wizardFacts.property_address_postcode,
          ),
        service_address_line1: wizardFacts.property_address_line1,
        service_address_line2: wizardFacts.property_address_line2,
        service_address_town: wizardFacts.property_address_town || wizardFacts.property_city,
        service_address_county: wizardFacts.property_address_county,
        service_address_postcode: wizardFacts.property_address_postcode || wizardFacts.property_postcode,
        service_date:
          (caseData as any).notice_service_date ||
          (caseData as any).notice_served_date ||
          wizardFacts.notice_service_date ||
          wizardFacts.notice_served_date ||
          wizardFacts.notice_date,
        deemed_service_date: (caseData as any).deemed_service_date,
        signature_date:
          wizardFacts.signature_date ||
          (caseData as any).notice_service_date ||
          (caseData as any).notice_served_date ||
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
        document_served: 'Form 3A notice',
      });
    } else if (documentType === 'n5_claim') {
      title = 'Claim for possession (Form N5)';
      pdfBytes = await fillOfficialForm('n5', caseData);
    } else if (documentType === 'n119_particulars') {
      title = 'Particulars of claim (Form N119)';
      pdfBytes = await fillOfficialForm('n119', caseData);
    } else if (documentType === 'witness_statement') {
      title = 'Witness statement';
      const witnessContext = extractWitnessStatementContext(caseFacts);
      const witnessContent = await generateWitnessStatement(wizardFacts, witnessContext);
      const witnessDoc = await generateDocument({
        templatePath: 'uk/england/templates/eviction/witness-statement.hbs',
        data: {
          landlord_name: witnessContext.landlord_name,
          landlord_address: wizardFacts.landlord_address || caseData.landlord_address || '',
          tenant_name: witnessContext.tenant_name,
          property_address: witnessContext.property_address,
          court_name: wizardFacts.court_name || caseData.court_name || 'County Court',
          witness_statement: witnessContent,
          generated_date: new Date().toLocaleDateString('en-GB'),
        },
        isPreview: true,
        outputFormat: 'both',
      });
      pdfBytes = witnessDoc.pdf || null;
      htmlContent = witnessDoc.html;
    } else if (documentType === 'case_summary') {
      title = getEnglandPreviewTitle(documentType);
      htmlContent = buildFallbackCaseSummaryHtml({ title, wizardFacts });
    } else if (getEnglandSupportDocumentTemplate(documentType)) {
      title = getEnglandPreviewTitle(documentType);
      const templateData = await enrichEnglandSection8TemplateGrounds(mapNoticeOnlyFacts(wizardFacts));
      const supportDoc = await generateDocument({
        templatePath: getEnglandSupportDocumentTemplate(documentType)!,
        data: {
          ...templateData,
          pack_stage: 'stage1',
          pack_stage_label: 'Stage 1',
          pack_title: 'Stage 1: Section 8 Notice & Service Pack',
        },
        isPreview: true,
        outputFormat: 'both',
      });
      pdfBytes = supportDoc.pdf || null;
      htmlContent = supportDoc.html;
    } else if (documentType === 'arrears_schedule') {
      title = 'Rent schedule / arrears statement';
      const arrearsItems = wizardFacts.arrears_items || [];
      if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
        htmlContent = buildFallbackCaseSummaryHtml({ title, wizardFacts });
      } else {
        const arrearsScheduleData = getArrearsScheduleData({
          arrears_items: arrearsItems,
          total_arrears: wizardFacts.total_arrears || null,
          rent_amount: caseData.rent_amount || wizardFacts.rent_amount || 0,
          rent_frequency: caseData.rent_frequency || wizardFacts.rent_frequency || 'monthly',
          include_schedule: true,
        });
        const arrearsDoc = await generateDocument({
          templatePath: 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
          data: {
            claimant_reference: caseId,
            arrears_schedule: arrearsScheduleData.arrears_schedule,
            arrears_total: arrearsScheduleData.arrears_total,
          },
          isPreview: true,
          outputFormat: 'both',
        });
        pdfBytes = arrearsDoc.pdf || null;
        htmlContent = arrearsDoc.html;
      }
    } else {
      return errorResponse('UNSUPPORTED_DOCUMENT_TYPE', 'Unsupported preview document type', 400, { documentType });
    }
    } catch (err) {
      if (err instanceof EnglandForm3ALegalWordingError || documentType === 'section8_notice') {
        return errorResponse(
          (err as any)?.code || 'FORM3A_PREVIEW_GENERATION_FAILED',
          err instanceof Error ? err.message : 'Could not generate the real Form 3A preview',
          (err as any)?.statusCode || 500,
          { caseId, documentType },
        );
      }

      title = title || getEnglandPreviewTitle(documentType);
      pdfBytes = null;
      htmlContent = buildFallbackCaseSummaryHtml({ title, wizardFacts });
      console.warn('[Notice-Only-Embed] Document preview generation failed; using fallback embed:', {
        caseId,
        documentType,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    const previewPdfBytes = pdfBytes || (htmlContent ? await htmlToPdf(htmlContent) : null);
    const html = previewPdfBytes ? buildPdfEmbedHtml(title, previewPdfBytes) : null;

    if (!html) {
      return errorResponse('PREVIEW_GENERATION_FAILED', 'Could not generate completed preview', 500, { caseId, documentType });
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    return errorResponse('INTERNAL_ERROR', error?.message || 'Failed to generate completed preview', 500, {
      caseId,
      documentType,
    });
  }
}
