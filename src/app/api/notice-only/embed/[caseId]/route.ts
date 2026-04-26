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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function errorResponse(code: string, message: string, status: number, details?: Record<string, unknown>) {
  console.error(`[Notice-Only-Embed] ${code}:`, { message, status, ...details });
  return NextResponse.json({ error: message, code }, { status });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPdfEmbedHtml(title: string, pdfBytes: Uint8Array): string {
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f4ff;
        --surface: #ffffff;
        --line: #e6ddff;
        --text: #24163e;
        --muted: #6b5b93;
      }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        min-height: 100%;
        background:
          radial-gradient(circle at top, rgba(151,118,255,0.12), transparent 36%),
          var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body::before {
        content: "LANDLORD HEAVEN PREVIEW";
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: clamp(26px, 5vw, 58px);
        font-weight: 700;
        letter-spacing: 0.24em;
        color: rgba(103, 82, 177, 0.06);
        pointer-events: none;
        transform: rotate(-20deg);
        z-index: 2;
        white-space: nowrap;
      }
      .shell { position: relative; z-index: 1; padding: 18px; }
      .toolbar {
        position: sticky;
        top: 0;
        z-index: 3;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
        padding: 14px 16px;
        border: 1px solid rgba(111,84,200,0.16);
        border-radius: 18px;
        background: rgba(255,255,255,0.92);
        backdrop-filter: blur(18px);
        box-shadow: 0 14px 40px rgba(31,20,59,0.08);
      }
      .toolbar strong { display: block; font-size: 14px; }
      .toolbar span { display: block; margin-top: 2px; font-size: 12px; color: var(--muted); }
      .toolbar-actions { display: inline-flex; gap: 8px; }
      .toolbar button {
        border: 1px solid rgba(111,84,200,0.18);
        background: white;
        color: var(--text);
        border-radius: 999px;
        padding: 10px 14px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .toolbar button:hover { border-color: rgba(111,84,200,0.38); color: #6f54c8; }
      .pages { display: grid; gap: 18px; }
      .page {
        position: relative;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--surface);
        box-shadow: 0 18px 44px rgba(28,19,54,0.08);
      }
      .page-label {
        padding: 12px 16px 0;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
      }
      .page canvas {
        display: block;
        width: 100%;
        height: auto;
        background: white;
      }
      .loading, .error {
        display: grid;
        place-items: center;
        min-height: 320px;
        border: 1px dashed rgba(111,84,200,0.22);
        border-radius: 18px;
        background: rgba(255,255,255,0.78);
        color: var(--muted);
        text-align: center;
        padding: 24px;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="toolbar">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>Full completed preview rendered in-page.</span>
        </div>
        <div class="toolbar-actions">
          <button type="button" id="zoom-out">Zoom out</button>
          <button type="button" id="zoom-reset">Reset</button>
          <button type="button" id="zoom-in">Zoom in</button>
        </div>
      </div>
      <p id="status">Loading completed preview...</p>
      <div class="pages" id="pages">
        <div class="loading">Preparing the completed preview...</div>
      </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
      const pdfBase64 = ${JSON.stringify(pdfBase64)};
      const statusEl = document.getElementById('status');
      const pagesEl = document.getElementById('pages');
      const zoomOutBtn = document.getElementById('zoom-out');
      const zoomResetBtn = document.getElementById('zoom-reset');
      const zoomInBtn = document.getElementById('zoom-in');
      let zoomScale = 1;

      function updateZoomButtons() {
        zoomOutBtn.disabled = zoomScale <= 0.7;
        zoomInBtn.disabled = zoomScale >= 1.9;
      }

      function applyZoom() {
        pagesEl.style.transform = 'scale(' + zoomScale + ')';
        pagesEl.style.transformOrigin = 'top center';
        statusEl.textContent = 'Showing the full completed preview at ' + Math.round(zoomScale * 100) + '% zoom.';
        updateZoomButtons();
      }

      zoomOutBtn.addEventListener('click', () => {
        zoomScale = Math.max(0.7, Number((zoomScale - 0.1).toFixed(2)));
        applyZoom();
      });
      zoomResetBtn.addEventListener('click', () => { zoomScale = 1; applyZoom(); });
      zoomInBtn.addEventListener('click', () => {
        zoomScale = Math.min(1.9, Number((zoomScale + 0.1).toFixed(2)));
        applyZoom();
      });

      async function renderPdf() {
        try {
          const binary = Uint8Array.from(atob(pdfBase64), (char) => char.charCodeAt(0));
          const pdf = await window['pdfjsLib'].getDocument({ data: binary }).promise;
          pagesEl.innerHTML = '';
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1.35 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const shell = document.createElement('div');
            shell.className = 'page';
            const label = document.createElement('div');
            label.className = 'page-label';
            label.textContent = 'Page ' + pageNumber;
            shell.appendChild(label);
            shell.appendChild(canvas);
            pagesEl.appendChild(shell);
            await page.render({ canvasContext: context, viewport }).promise;
          }
          applyZoom();
        } catch (error) {
          console.error('[Notice-Only-Embed] Failed to render PDF preview', error);
          pagesEl.innerHTML = '<div class="error">The completed preview could not be rendered right now.</div>';
          statusEl.textContent = 'The completed preview could not be loaded.';
        }
      }

      renderPdf();
    </script>
  </body>
</html>`;
}

function buildHtmlEmbedShell(title: string, documentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      html, body { margin: 0; min-height: 100%; background: #f7f4ff; }
      body {
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #24163e;
      }
      body::before {
        content: "LANDLORD HEAVEN PREVIEW";
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: clamp(26px, 5vw, 58px);
        font-weight: 700;
        letter-spacing: 0.24em;
        color: rgba(103, 82, 177, 0.06);
        pointer-events: none;
        transform: rotate(-20deg);
        z-index: 2;
        white-space: nowrap;
      }
      .toolbar {
        position: sticky;
        top: 0;
        z-index: 3;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(111,84,200,0.16);
        background: rgba(255,255,255,0.92);
        backdrop-filter: blur(18px);
        box-shadow: 0 14px 40px rgba(31,20,59,0.08);
      }
      .toolbar strong { display: block; font-size: 14px; }
      .toolbar span { display: block; margin-top: 2px; font-size: 12px; color: #6b5b93; }
      .document-shell {
        position: relative;
        z-index: 1;
        max-width: 960px;
        margin: 18px auto;
        padding: 0 18px 36px;
      }
      .document-card {
        overflow: hidden;
        border: 1px solid #e6ddff;
        border-radius: 20px;
        background: white;
        box-shadow: 0 18px 44px rgba(28,19,54,0.08);
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <strong>${escapeHtml(title)}</strong>
      <span>Full completed preview rendered from your current answers.</span>
    </div>
    <div class="document-shell">
      <div class="document-card">${documentHtml}</div>
    </div>
  </body>
</html>`;
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
