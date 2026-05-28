import { NextResponse } from 'next/server';

import { buildPdfEmbedHtml } from '@/lib/previews/documentEmbedShell';
import { applyPreviewLockToPdfBytes } from '@/lib/previews/preview-lock-rendering';
import {
  SECTION13_CORE_DOCUMENT_TYPES,
  generateSection13PreviewableDocument,
  isSection13PreviewableDocumentType,
} from '@/lib/documents/section13-generator';
import { computeSection13Preview } from '@/lib/section13/rules';
import { getDefaultSection13StateForCase, getSection13Comparables } from '@/lib/section13/server';
import type { Section13ProductSku } from '@/lib/section13/types';
import { createAdminClient, tryGetServerUser } from '@/lib/supabase/server';
import { getPreviewCaseAccessDenial } from '@/lib/previews/case-preview-access';
import { assertPreviewAllowed } from '@/lib/payments/entitlement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  console.error(`[Section13-Embed] ${code}:`, {
    message,
    status,
    ...details,
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json({ error: message, code }, { status });
}

function resolveSection13ProductType(
  documentType: string,
  facts: Record<string, any>,
  requestedProduct: string | null
): Section13ProductSku {
  if (
    !SECTION13_CORE_DOCUMENT_TYPES.includes(
      documentType as (typeof SECTION13_CORE_DOCUMENT_TYPES)[number]
    )
  ) {
    return 'section13_defensive';
  }

  if (
    requestedProduct === 'section13_standard' ||
    requestedProduct === 'section13_defensive'
  ) {
    return requestedProduct;
  }

  const selectedPlan =
    facts.section13?.selectedPlan ||
    facts.section13?.selected_plan ||
    facts.section13?.product;

  return selectedPlan === 'section13_defensive'
    ? 'section13_defensive'
    : 'section13_standard';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const resolvedParams = await params;
  const caseId = resolvedParams.caseId;
  const url = new URL(request.url);
  const documentType = url.searchParams.get('document_type');
  const requestedProduct = url.searchParams.get('product');

  if (!caseId) {
    return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
  }

  if (!documentType) {
    return errorResponse(
      'MISSING_DOCUMENT_TYPE',
      'document_type query parameter is required',
      400
    );
  }

  if (!isSection13PreviewableDocumentType(documentType)) {
    return errorResponse(
      'INVALID_DOCUMENT_TYPE',
      `Unsupported Section 13 preview document type: ${documentType}`,
      400
    );
  }

  try {
    const user = await tryGetServerUser();
    const supabase = createAdminClient();

    const { data, error } = await supabase.from('cases').select('*').eq('id', caseId).single();
    if (error || !data) {
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404, { caseId });
    }

    const caseRow = data as any;
    const accessDenied = getPreviewCaseAccessDenial(user, caseRow);
    if (accessDenied) {
      console.warn('[Section13-Embed] UNAUTHORIZED_CASE_ACCESS:', {
        code: 'UNAUTHORIZED_CASE_ACCESS',
        caseId,
        reason: accessDenied,
        userId: user?.id || null,
        caseOwnerId: caseRow.user_id || null,
      });
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404, {
        caseId,
        reason: 'UNAUTHORIZED_CASE_ACCESS',
        accessDenied,
      });
    }
    const facts = (caseRow.collected_facts || caseRow.wizard_facts || caseRow.facts || {}) as Record<
      string,
      any
    >;
    const productType = resolveSection13ProductType(
      documentType,
      facts,
      requestedProduct
    );
    const previewAccess = await assertPreviewAllowed({
      caseId,
      product: productType,
      userId: user?.id,
    });
    const state = getDefaultSection13StateForCase(facts, productType);
    const comparables = await getSection13Comparables(supabase as any, caseId);
    state.preview = computeSection13Preview(state, comparables);

    const document = await generateSection13PreviewableDocument({
      caseId,
      documentType,
      productType,
      state,
      comparables,
    });

    const lockedPreview = await applyPreviewLockToPdfBytes(document.pdf, {
      isPaid: previewAccess.isPaid,
    });
    const html = buildPdfEmbedHtml(document.title, lockedPreview.pdfBytes);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'X-Document-Type': documentType,
        'X-Product': productType,
        'X-Preview-Is-Paid': String(previewAccess.isPaid),
        'X-Preview-Lock': 'smart-hybrid',
      },
    });
  } catch (error: any) {
    return errorResponse(
      'PREVIEW_GENERATION_FAILED',
      error?.message || 'Failed to generate preview',
      500,
      { caseId, documentType }
    );
  }
}
