import { NextResponse } from 'next/server';

import { pdfBytesToPreviewThumbnail } from '@/lib/documents/generator';
import {
  SECTION13_CORE_DOCUMENT_TYPES,
  generateSection13PreviewableDocument,
  isSection13PreviewableDocumentType,
} from '@/lib/documents/section13-generator';
import { computeSection13Preview } from '@/lib/section13/rules';
import { getDefaultSection13StateForCase, getSection13Comparables } from '@/lib/section13/server';
import type { Section13ProductSku } from '@/lib/section13/types';
import {
  createAdminClient,
  createServerSupabaseClient,
  tryGetServerUser,
} from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isDev = process.env.NODE_ENV === 'development';
const e2eEnabled =
  process.env.E2E_MODE === 'true' || process.env.NEXT_PUBLIC_E2E_MODE === 'true';
const PLACEHOLDER_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQEA8QEA8PDw8QDw8PDw8QFREWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGi0fHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAXAAADAQAAAAAAAAAAAAAAAAAAAQID/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB6AA//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQL/xAAVEQEBAAAAAAAAAAAAAAAAAAABAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAEP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAEP/aAAgBAQABPyF//9k=';
const placeholderThumbnail = Buffer.from(PLACEHOLDER_JPEG_BASE64, 'base64');

function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  const logData = {
    code,
    message,
    status,
    ...details,
    isVercel,
    timestamp: new Date().toISOString(),
  };
  console.error(`[Section13-Thumbnail] ${code}:`, logData);
  return NextResponse.json(
    { error: message, code, ...(isDev ? { details } : {}) },
    { status }
  );
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
  const startTime = Date.now();
  let caseId: string | null = null;

  try {
    const resolvedParams = await params;
    caseId = resolvedParams.caseId;

    if (e2eEnabled) {
      return new NextResponse(new Uint8Array(placeholderThumbnail), {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'no-store',
          'X-E2E-Mode': '1',
        },
      });
    }

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

    const user = await tryGetServerUser();
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();

    let query = supabase.from('cases').select('*').eq('id', caseId);
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('[Section13-Thumbnail] Case not found:', fetchError);
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404);
    }

    const caseRow = data as any;
    const facts = (caseRow.collected_facts || caseRow.wizard_facts || caseRow.facts || {}) as Record<
      string,
      any
    >;
    const productType = resolveSection13ProductType(
      documentType,
      facts,
      requestedProduct
    );
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
    const thumbnail = await pdfBytesToPreviewThumbnail(document.pdf, {
      quality: 75,
      watermarkText: 'PREVIEW',
      documentId: `${document.document_type}-${caseId}`,
    });

    const elapsed = Date.now() - startTime;
    console.log('[Section13-Thumbnail] Generated preview:', {
      caseId,
      documentType,
      productType,
      elapsed: `${elapsed}ms`,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline; filename="preview.jpg"',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Thumbnail-Runtime': 'nodejs',
      'X-Document-Type': documentType,
      'X-Product': productType,
    };

    if (!isVercel) {
      headers['Content-Length'] = thumbnail.length.toString();
    }

    return new NextResponse(new Uint8Array(thumbnail), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('[Section13-Thumbnail] Generation failed:', error);
    return errorResponse(
      'THUMBNAIL_GENERATION_FAILED',
      error?.message || 'Failed to generate thumbnail',
      500
    );
  }
}
