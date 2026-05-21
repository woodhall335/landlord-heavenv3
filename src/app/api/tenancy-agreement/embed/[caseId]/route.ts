/**
 * Tenancy Agreement Embedded Preview API
 *
 * GET /api/tenancy-agreement/embed/[caseId]
 *
 * Returns a watermarked HTML preview for one tenancy-pack document. Clean PDF
 * downloads remain locked until Stripe payment.
 */

import { NextResponse } from 'next/server';
import { createAdminClient, tryGetServerUser } from '@/lib/supabase/server';
import { htmlToPdf } from '@/lib/documents/generator';
import { buildPdfEmbedHtml } from '@/lib/previews/documentEmbedShell';
import { deriveCanonicalJurisdiction } from '@/lib/types/jurisdiction';
import type { TenancyJurisdiction } from '@/lib/documents/ast-generator';
import {
  isResidentialLettingProductSku,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';
import { resolveTenancyPreviewDocumentHtml } from '@/lib/previews/tenancyPreviewDocuments';
import { getPreviewCaseAccessDenial } from '@/lib/previews/case-preview-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV === 'development';
const e2eEnabled = process.env.E2E_MODE === 'true' || process.env.NEXT_PUBLIC_E2E_MODE === 'true';

function errorResponse(code: string, message: string, status: number, details?: Record<string, unknown>) {
  console.error('[Tenancy-Agreement-Embed]', {
    code,
    message,
    status,
    ...details,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    { error: message, code, ...(isDev ? { details } : {}) },
    { status }
  );
}

function htmlResponse(html: string, headers: Record<string, string> = {}) {
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Cache-Control': 'private, no-store',
      ...headers,
    },
  });
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

    if (!caseId) {
      return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
    }

    if (e2eEnabled) {
      return errorResponse('E2E_PREVIEW_UNAVAILABLE', 'Real tenancy PDF previews are not generated in E2E mode', 503);
    }

    const url = new URL(request.url);
    const tier = (url.searchParams.get('tier') || 'standard') as 'standard' | 'premium';
    const requestedProduct = url.searchParams.get('product');
    const requestedDocumentType = url.searchParams.get('document_type');

    const user = await tryGetServerUser();
    const supabase = createAdminClient();

    const { data, error: fetchError } = await supabase.from('cases').select('*').eq('id', caseId).single();

    if (fetchError || !data) {
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404, {
        caseId,
        dbError: fetchError?.message,
      });
    }

    const caseRow = data as any;
    const accessDenied = getPreviewCaseAccessDenial(user, caseRow);
    if (accessDenied) {
      console.warn('[Tenancy-Agreement-Embed] UNAUTHORIZED_CASE_ACCESS:', {
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

    const facts = caseRow.collected_facts || caseRow.wizard_facts || caseRow.facts || {};
    const modernEnglandProduct = [
      requestedProduct,
      facts.__meta?.canonical_product,
      facts.__meta?.product,
      facts.product,
      facts.original_product,
    ].find(
      (value): value is ResidentialLettingProductSku => isResidentialLettingProductSku(value)
    );

    const jurisdiction = deriveCanonicalJurisdiction(caseRow.jurisdiction, facts) as TenancyJurisdiction;
    if (!jurisdiction) {
      return errorResponse('INVALID_JURISDICTION', 'Invalid or missing jurisdiction', 422, {
        caseId,
      });
    }

    const previewDocument = await resolveTenancyPreviewDocumentHtml({
      caseId,
      facts,
      jurisdiction,
      tier,
      product: jurisdiction === 'england' && modernEnglandProduct ? modernEnglandProduct : requestedProduct,
      documentType: requestedDocumentType,
    });

    if (!previewDocument?.html) {
      return errorResponse('PREVIEW_DOCUMENT_NOT_FOUND', 'Preview temporarily unavailable', 404, {
        caseId,
        requestedProduct,
        requestedDocumentType,
      });
    }

    const pdfBytes = await htmlToPdf(previewDocument.html);
    const html = buildPdfEmbedHtml(previewDocument.title, pdfBytes);

    return htmlResponse(html, {
      'X-Jurisdiction': jurisdiction,
      'X-Tier': tier,
      'X-Document-Type': previewDocument.document_type,
      'X-Preview-Source': 'generated-pdf',
      'X-Generation-Time': `${Date.now() - startTime}ms`,
    });
  } catch (error: any) {
    return errorResponse('INTERNAL_ERROR', 'Failed to generate preview', 500, {
      error: error.message,
      stack: isDev ? error.stack : undefined,
      caseId,
      elapsed: `${Date.now() - startTime}ms`,
    });
  }
}
