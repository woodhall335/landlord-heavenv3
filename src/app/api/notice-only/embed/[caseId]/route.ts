import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient, tryGetServerUser } from '@/lib/supabase/server';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { normalizeSection8Facts } from '@/lib/wizard/normalizeSection8Facts';
import { deriveCanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { fillOfficialForm } from '@/lib/documents/official-forms-filler';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';
import { generateWitnessStatement, extractWitnessStatementContext } from '@/lib/ai/witness-statement-generator';
import { generateEnglandN215PDF, normalizeEnglandProofOfServiceMethod } from '@/lib/documents/england-n215-generator';
import { generateDocument } from '@/lib/documents/generator';
import { getArrearsScheduleData } from '@/lib/documents/arrears-schedule-mapper';
import {
  generateCompleteEvictionPack,
  generateNoticeOnlyPack,
  type EvictionPackDocument,
} from '@/lib/documents/eviction-pack-generator';
import { buildHtmlEmbedShell, buildPdfEmbedHtml } from '@/lib/previews/documentEmbedShell';

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

const ENGLAND_PACK_DOCUMENT_TYPES = new Set([
  'section8_notice',
  'service_instructions',
  'validity_checklist',
  'compliance_declaration',
  'proof_of_service',
  'arrears_schedule',
  'n5_claim',
  'n119_particulars',
  'evidence_checklist',
  'witness_statement',
  'court_bundle_index',
  'hearing_checklist',
  'arrears_engagement_letter',
  'case_summary',
]);

async function getEnglandPackPreviewDocument(
  pack: 'notice_only' | 'complete_pack',
  wizardFacts: Record<string, any>,
  documentType: string
): Promise<EvictionPackDocument | null> {
  const enrichedFacts = {
    ...wizardFacts,
    __meta: {
      ...(wizardFacts.__meta || {}),
      case_id: wizardFacts.id || wizardFacts.case_id || wizardFacts.__meta?.case_id,
    },
  };

  const generatedPack =
    pack === 'complete_pack'
      ? await generateCompleteEvictionPack(enrichedFacts)
      : await generateNoticeOnlyPack(enrichedFacts);

  return generatedPack.documents.find((document) => document.document_type === documentType) || null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const url = new URL(request.url);
  const documentType = (url.searchParams.get('document_type') || '').trim();
  const pack = (url.searchParams.get('pack') || '').trim() as 'notice_only' | 'complete_pack' | '';

  if (!documentType) {
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
    if (jurisdiction !== 'england') {
      return errorResponse('UNSUPPORTED_JURISDICTION', 'Only England eviction previews are supported here', 422, { jurisdiction });
    }

    if (pack && ENGLAND_PACK_DOCUMENT_TYPES.has(documentType)) {
      const previewDocument = await getEnglandPackPreviewDocument(pack, { ...wizardFacts, case_id: caseId, id: caseId }, documentType);

      if (!previewDocument) {
        return errorResponse('DOCUMENT_NOT_FOUND', 'The selected completed preview is not available for this pack', 404, {
          caseId,
          pack,
          documentType,
        });
      }

      const html = previewDocument.pdf
        ? buildPdfEmbedHtml(previewDocument.title, previewDocument.pdf)
        : previewDocument.html
          ? buildHtmlEmbedShell(previewDocument.title, previewDocument.html)
          : null;

      if (!html) {
        return errorResponse('PREVIEW_GENERATION_FAILED', 'Could not render the selected completed preview', 500, {
          caseId,
          pack,
          documentType,
        });
      }

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'private, no-store, max-age=0',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    const { caseData } = wizardFactsToEnglandWalesEviction(caseId, wizardFacts);
    const caseFacts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;

    let title = '';
    let pdfBytes: Uint8Array | null = null;
    let htmlContent: string | null = null;

    if (documentType === 'section8_notice') {
      title = 'Form 3A notice';
      pdfBytes = await fillOfficialForm('form3a', caseData);
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
          wizardFacts.notice_service_date ||
          wizardFacts.notice_served_date ||
          wizardFacts.notice_date,
        signature_date:
          wizardFacts.signature_date ||
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
    } else if (documentType === 'arrears_schedule') {
      title = 'Rent schedule / arrears statement';
      const arrearsItems = wizardFacts.arrears_items || [];
      if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
        return errorResponse('NO_ARREARS_DATA', 'No arrears data available for schedule', 400, { caseId });
      }
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
    } else {
      return errorResponse('UNSUPPORTED_DOCUMENT_TYPE', 'Unsupported preview document type', 400, { documentType });
    }

    const html = pdfBytes
      ? buildPdfEmbedHtml(title, pdfBytes)
      : htmlContent
        ? buildHtmlEmbedShell(title, htmlContent)
        : null;

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
