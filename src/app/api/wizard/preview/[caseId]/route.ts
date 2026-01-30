/**
 * Wizard Preview API
 *
 * GET /api/wizard/preview/[caseId]
 *
 * Returns a multi-page preview manifest for document preview.
 * Generates watermarked JPEG images for each page on demand.
 *
 * Query Parameters:
 * - product: 'ast_standard' | 'ast_premium' | etc.
 * - tier: 'standard' | 'premium' (default: 'standard')
 *
 * Response:
 * - status: 'ready' | 'processing' | 'error'
 * - pageCount: number of pages
 * - pages: array of { page, width, height, url }
 *
 * Security:
 * - Signed URLs expire after 15 minutes
 * - Watermarks include case ID and user identifier hash
 * - Images are not publicly accessible without signed URL
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient, tryGetServerUser } from '@/lib/supabase/server';
import {
  generateTenancyPreview,
  getPreviewFromCache,
  type PreviewManifest,
} from '@/lib/documents/preview-generator';

// Force Node.js runtime - Puppeteer cannot run on Edge
export const runtime = 'nodejs';

// Disable static optimization
export const dynamic = 'force-dynamic';

// Environment detection
const isDev = process.env.NODE_ENV === 'development';

/**
 * Structured error response
 */
function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  const logData = { code, message, status, ...details, timestamp: new Date().toISOString() };
  console.error(`[Wizard-Preview-API] ${code}:`, logData);
  return NextResponse.json(
    { error: message, code, status: 'error', ...(isDev ? { details } : {}) },
    { status }
  );
}

/**
 * Map product query param to internal product name
 */
function normalizeProduct(product: string | null): string {
  const productMap: Record<string, string> = {
    ast_standard: 'ast_standard',
    ast_premium: 'ast_premium',
    tenancy_agreement: 'ast_standard',
    tenancy_standard: 'ast_standard',
    tenancy_premium: 'ast_premium',
  };
  return productMap[product || ''] || product || 'ast_standard';
}

/**
 * Determine tier from product name
 */
function getTierFromProduct(product: string): 'standard' | 'premium' {
  if (product.includes('premium') || product.includes('hmo')) {
    return 'premium';
  }
  return 'standard';
}

/**
 * Check if product is a tenancy agreement type
 */
function isTenancyProduct(product: string): boolean {
  const tenancyProducts = [
    'ast_standard',
    'ast_premium',
    'tenancy_agreement',
    'tenancy_standard',
    'tenancy_premium',
    'prt_agreement',
    'prt_premium',
    'soc_standard',
    'soc_premium',
    'private_tenancy',
    'private_tenancy_premium',
  ];
  return tenancyProducts.includes(product);
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

    // Parse query params
    const url = new URL(request.url);
    const productParam = url.searchParams.get('product');
    const tierParam = url.searchParams.get('tier') as 'standard' | 'premium' | null;

    if (!caseId) {
      return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
    }

    // Normalize product name
    const product = normalizeProduct(productParam);
    const tier = tierParam || getTierFromProduct(product);

    // Only support tenancy products for now
    if (!isTenancyProduct(product)) {
      return errorResponse(
        'UNSUPPORTED_PRODUCT',
        'Multi-page preview is only available for tenancy agreements',
        422,
        { product }
      );
    }

    console.log(`[Wizard-Preview-API] Request:`, { caseId, product, tier });

    // Get user info for watermarking
    const user = await tryGetServerUser();
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();

    // Verify case exists and user has access
    let query = supabase.from('cases').select('id, jurisdiction').eq('id', caseId);
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data: caseData, error: fetchError } = await query.single();

    if (fetchError || !caseData) {
      return errorResponse('CASE_NOT_FOUND', 'Case not found or access denied', 404);
    }

    // Check cache first for quick response
    const cachedManifest = getPreviewFromCache(caseId, product, tier);
    if (cachedManifest && cachedManifest.status === 'ready') {
      console.log(`[Wizard-Preview-API] Cache hit for case ${caseId}`);
      return NextResponse.json(cachedManifest, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60',
          'X-Preview-Source': 'cache',
        },
      });
    }

    // Generate preview (this may take a few seconds)
    const manifest = await generateTenancyPreview({
      caseId,
      product,
      tier,
      userId: user?.id,
      userEmail: user?.email,
    });

    const elapsed = Date.now() - startTime;

    if (manifest.status === 'error') {
      return errorResponse('GENERATION_FAILED', manifest.error || 'Preview generation failed', 500, {
        caseId,
        product,
        elapsed: `${elapsed}ms`,
      });
    }

    console.log(`[Wizard-Preview-API] Success:`, {
      caseId,
      product,
      tier,
      pageCount: manifest.pageCount,
      elapsed: `${elapsed}ms`,
    });

    return NextResponse.json(manifest, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60',
        'X-Preview-Source': 'generated',
        'X-Page-Count': String(manifest.pageCount || 0),
        'X-Generation-Time': `${elapsed}ms`,
      },
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    return errorResponse('INTERNAL_ERROR', 'Failed to generate preview', 500, {
      error: error.message,
      stack: isDev ? error.stack : undefined,
      caseId,
      elapsed: `${elapsed}ms`,
    });
  }
}

/**
 * POST endpoint for triggering preview generation in background
 * (optional - can be used for async generation)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const resolvedParams = await params;
  const caseId = resolvedParams.caseId;

  try {
    const body = await request.json();
    const product = normalizeProduct(body.product);
    const tier = body.tier || getTierFromProduct(product);

    if (!caseId) {
      return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
    }

    if (!isTenancyProduct(product)) {
      return errorResponse(
        'UNSUPPORTED_PRODUCT',
        'Multi-page preview is only available for tenancy agreements',
        422
      );
    }

    // Get user info
    const user = await tryGetServerUser();

    // Check cache - if ready, return immediately
    const cachedManifest = getPreviewFromCache(caseId, product, tier);
    if (cachedManifest && cachedManifest.status === 'ready') {
      return NextResponse.json(cachedManifest, { status: 200 });
    }

    // Return processing status immediately
    // In a production system, you'd queue this for background processing
    const processingResponse: PreviewManifest = {
      status: 'processing',
      caseId,
      product,
      jurisdiction: 'unknown',
    };

    // Start generation in background (fire-and-forget)
    // Note: In serverless, this may not complete if the response is sent first
    // For production, use a job queue (e.g., Inngest, QStash, SQS)
    generateTenancyPreview({
      caseId,
      product,
      tier,
      userId: user?.id,
      userEmail: user?.email,
    }).catch((err) => {
      console.error(`[Wizard-Preview-API] Background generation failed:`, err);
    });

    return NextResponse.json(processingResponse, {
      status: 202,
      headers: {
        'X-Retry-After': '5',
      },
    });
  } catch (error: any) {
    return errorResponse('INTERNAL_ERROR', 'Failed to start preview generation', 500, {
      error: error.message,
      caseId,
    });
  }
}
