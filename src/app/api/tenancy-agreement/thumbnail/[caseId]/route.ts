/**
 * Tenancy Agreement Thumbnail API
 *
 * GET /api/tenancy-agreement/thumbnail/[caseId]
 *
 * Generates a watermarked JPEG thumbnail from the same generated tenancy PDF
 * source used for the full document preview.
 */

import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient, tryGetServerUser } from '@/lib/supabase/server';
import { htmlToPdf, pdfBytesToPreviewThumbnail } from '@/lib/documents/generator';
import { deriveCanonicalJurisdiction } from '@/lib/types/jurisdiction';
import type { TenancyJurisdiction } from '@/lib/documents/ast-generator';
import {
  isResidentialLettingProductSku,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';
import { resolveTenancyPreviewDocumentHtml } from '@/lib/previews/tenancyPreviewDocuments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isDev = process.env.NODE_ENV === 'development';
const e2eEnabled = process.env.E2E_MODE === 'true' || process.env.NEXT_PUBLIC_E2E_MODE === 'true';

function errorResponse(code: string, message: string, status: number, details?: Record<string, unknown>) {
  const logData = { code, message, status, ...details, isVercel, timestamp: new Date().toISOString() };
  console.error(`[Tenancy-Agreement-Thumbnail] ${code}:`, logData);
  return NextResponse.json({ error: message, code, ...(isDev ? { details } : {}) }, { status });
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
      return errorResponse('E2E_THUMBNAIL_UNAVAILABLE', 'Real tenancy thumbnails are not generated in E2E mode', 503);
    }

    const url = new URL(request.url);
    const tier = (url.searchParams.get('tier') || 'standard') as 'standard' | 'premium';
    const requestedProduct = url.searchParams.get('product');
    const requestedDocumentType = url.searchParams.get('document_type');

    if (!caseId) {
      return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
    }

    console.log('[Tenancy-Agreement-Thumbnail] Request:', { caseId, tier });

    const user = await tryGetServerUser();
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();

    let query = supabase.from('cases').select('*').eq('id', caseId);
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('[Tenancy-Agreement-Thumbnail] Case not found:', fetchError);
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404);
    }

    const caseRow = data as any;
    const facts = caseRow.collected_facts || caseRow.wizard_facts || caseRow.facts || {};
    const jurisdiction = deriveCanonicalJurisdiction(caseRow.jurisdiction, facts) as TenancyJurisdiction;

    if (!jurisdiction) {
      return errorResponse('INVALID_JURISDICTION', 'Invalid or missing jurisdiction', 422);
    }

    const generationFacts = {
      ...facts,
      id: caseId,
      case_id: caseId,
      jurisdiction,
      property_country: facts.property_country || jurisdiction,
      __meta: {
        ...(facts.__meta || {}),
        case_id: caseId,
        jurisdiction,
      },
    };

    const modernEnglandProduct = [
      requestedProduct,
      generationFacts.__meta?.canonical_product,
      generationFacts.__meta?.product,
      generationFacts.product,
      generationFacts.original_product,
    ].find(
      (value): value is ResidentialLettingProductSku => isResidentialLettingProductSku(value)
    );

    console.log('[Tenancy-Agreement-Thumbnail] Document thumbnail path:', {
      caseId,
      product: modernEnglandProduct || requestedProduct || tier,
      requestedDocumentType,
    });

    const previewDocument = await resolveTenancyPreviewDocumentHtml({
      caseId,
      facts: generationFacts,
      jurisdiction,
      tier,
      product: jurisdiction === 'england' && modernEnglandProduct ? modernEnglandProduct : requestedProduct,
      documentType: requestedDocumentType,
    });

    if (!previewDocument?.html) {
      return errorResponse(
        'THUMBNAIL_GENERATION_FAILED',
        'No previewable document generated for this tenancy document',
        500,
        { caseId, product: modernEnglandProduct || requestedProduct, documentType: requestedDocumentType }
      );
    }

    const pdfBytes = await htmlToPdf(previewDocument.html);
    const thumbnail = await pdfBytesToPreviewThumbnail(pdfBytes, {
      quality: 75,
      watermarkText: 'PREVIEW',
      documentId: `${previewDocument.document_type}-${caseId}`,
    });

    const elapsed = Date.now() - startTime;
    console.log('[Tenancy-Agreement-Thumbnail] Success:', {
      caseId,
      jurisdiction,
      tier,
      documentType: previewDocument.document_type,
      size: thumbnail.length,
      elapsed: `${elapsed}ms`,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline; filename="preview.jpg"',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Thumbnail-Runtime': 'nodejs',
      'X-Jurisdiction': jurisdiction,
      'X-Tier': modernEnglandProduct || tier,
      'X-Product': modernEnglandProduct || requestedProduct || tier,
      'X-Document-Type': previewDocument.document_type,
      'X-Thumbnail-Source': 'generated-pdf',
    };

    if (!isVercel) {
      headers['Content-Length'] = thumbnail.length.toString();
    }

    return new NextResponse(new Uint8Array(thumbnail), { status: 200, headers });
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
