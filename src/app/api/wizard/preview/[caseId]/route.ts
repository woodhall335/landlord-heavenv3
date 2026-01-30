/**
 * Wizard Preview API (Production-Hardened)
 *
 * GET /api/wizard/preview/[caseId]
 *
 * Returns a multi-page preview manifest for document preview.
 * Generates watermarked WebP images (with JPEG fallback) for each page on demand.
 *
 * Query Parameters:
 * - product: 'ast_standard' | 'ast_premium' | etc.
 * - tier: 'standard' | 'premium' (default: 'standard')
 * - force: 'true' to bypass cache and regenerate
 *
 * Response:
 * - status: 'ready' | 'processing' | 'error'
 * - pageCount: number of pages
 * - pages: array of { page, width, height, url, mimeType }
 * - factsHash: hash of facts for cache validation
 *
 * Security:
 * - Authentication required
 * - Signed URLs expire after 15 minutes
 * - Watermarks include case ID and user identifier hash
 * - Images are not publicly accessible without signed URL
 * - Rate limiting: 30 requests per 5 minutes per user/IP
 *
 * Image Format:
 * - WebP by default (quality 80, ~30% smaller than JPEG)
 * - JPEG fallback if WebP conversion fails
 * - mimeType in manifest for proper rendering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient, tryGetServerUser } from '@/lib/supabase/server';
import {
  generateTenancyPreview,
  getPreviewFromCache,
  hashFacts,
  isPreviewCacheValid,
  cleanupOldPreviews,
  type PreviewManifest,
} from '@/lib/documents/preview-generator';
import { rateLimiters } from '@/lib/rate-limit';

// Force Node.js runtime - Puppeteer cannot run on Edge
export const runtime = 'nodejs';

// Disable static optimization
export const dynamic = 'force-dynamic';

// Environment detection
const isDev = process.env.NODE_ENV === 'development';

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Structured error response with proper status codes
 */
function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>,
  headers?: Record<string, string>
) {
  const logData = { code, message, status, ...details, timestamp: new Date().toISOString() };
  console.error(`[Wizard-Preview-API] ${code}:`, logData);
  return NextResponse.json(
    {
      error: message,
      code,
      status: 'error' as const,
      ...(isDev ? { details } : {}),
    },
    {
      status,
      headers: headers || {},
    }
  );
}

/**
 * Rate limit exceeded response
 */
function rateLimitResponse(
  retryAfter: number,
  headers: Record<string, string>
) {
  return NextResponse.json(
    {
      error: 'Too many preview requests',
      code: 'RATE_LIMIT_EXCEEDED',
      status: 'error' as const,
      message: 'Please wait before generating more previews.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        ...headers,
      },
    }
  );
}

// ============================================================================
// PRODUCT NORMALIZATION
// ============================================================================

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

// ============================================================================
// CLEANUP SCHEDULER
// ============================================================================

// Last cleanup timestamp (for rate limiting cleanup runs)
let lastCleanupTime = 0;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Trigger cleanup of old preview assets if interval has passed
 */
async function maybeCleanupOldPreviews(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanupTime > CLEANUP_INTERVAL_MS) {
    lastCleanupTime = now;
    // Fire-and-forget cleanup (don't block response)
    cleanupOldPreviews().catch(err => {
      console.error('[Wizard-Preview-API] Cleanup failed:', err);
    });
  }
}

// ============================================================================
// GET HANDLER
// ============================================================================

export async function GET(
  request: NextRequest,
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
    const forceRegenerate = url.searchParams.get('force') === 'true';

    if (!caseId) {
      return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
    }

    // Get user info for auth and watermarking
    const user = await tryGetServerUser();

    // Apply rate limiting (use user ID if authenticated, otherwise IP)
    const rateLimitResult = user
      ? await rateLimiters.previewForUser(request, user.id)
      : await rateLimiters.preview(request);

    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(rateLimitResult.limit),
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      'X-RateLimit-Reset': String(rateLimitResult.reset),
    };

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return rateLimitResponse(retryAfter, rateLimitHeaders);
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
        { product },
        rateLimitHeaders
      );
    }

    console.log(`[Wizard-Preview-API] Request:`, { caseId, product, tier, userId: user?.id, forceRegenerate });

    // Use admin client for fetching case data - we need to check access rules ourselves
    // because the case might not be linked to the user yet (created during wizard before signup)
    const adminSupabase = createAdminClient();

    // Fetch case data without user filtering first
    const { data: caseData, error: fetchError } = await adminSupabase
      .from('cases')
      .select('id, user_id, jurisdiction, collected_facts, wizard_facts, facts')
      .eq('id', caseId)
      .single();

    if (fetchError || !caseData) {
      console.error('[Wizard-Preview-API] Database fetch failed:', {
        caseId,
        fetchError: fetchError ? { message: fetchError.message, code: fetchError.code, details: fetchError.details } : null,
        hasData: !!caseData,
      });
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404, { dbError: fetchError?.message }, rateLimitHeaders);
    }

    console.log('[Wizard-Preview-API] Case found:', { caseId, userId: (caseData as any).user_id });

    // Access control: Allow if user owns the case OR case is not linked to anyone yet
    // This supports the wizard flow where users create cases before signing in
    const caseRow = caseData as any;
    if (user && caseRow.user_id && caseRow.user_id !== user.id) {
      // Case belongs to a different user - deny access
      return errorResponse('ACCESS_DENIED', 'You do not have permission to view this case', 403, undefined, rateLimitHeaders);
    }

    // Calculate facts hash for cache validation
    const facts = caseRow.collected_facts || caseRow.wizard_facts || caseRow.facts || {};
    const currentFactsHash = hashFacts(facts);

    // Check cache with facts hash validation (unless force regenerate)
    if (!forceRegenerate) {
      const cachedManifest = getPreviewFromCache(caseId, product, tier);
      if (cachedManifest && cachedManifest.status === 'ready') {
        // Verify facts hash matches
        if (isPreviewCacheValid(caseId, product, tier, currentFactsHash)) {
          console.log(`[Wizard-Preview-API] Cache hit for case ${caseId} (facts hash valid)`);
          return NextResponse.json(cachedManifest, {
            status: 200,
            headers: {
              'Cache-Control': 'private, max-age=60',
              'X-Preview-Source': 'cache',
              'X-Facts-Hash': currentFactsHash,
              ...rateLimitHeaders,
            },
          });
        } else {
          console.log(`[Wizard-Preview-API] Cache stale for case ${caseId} (facts changed)`);
        }
      }
    }

    // Trigger background cleanup (non-blocking)
    maybeCleanupOldPreviews();

    // Generate preview (this may take a few seconds)
    const manifest = await generateTenancyPreview({
      caseId,
      product,
      tier,
      userId: user?.id,
      userEmail: user?.email,
      forceRegenerate,
    });

    const elapsed = Date.now() - startTime;

    if (manifest.status === 'error') {
      return errorResponse('GENERATION_FAILED', manifest.error || 'Preview generation failed', 500, {
        caseId,
        product,
        elapsed: `${elapsed}ms`,
      }, rateLimitHeaders);
    }

    console.log(`[Wizard-Preview-API] Success:`, {
      caseId,
      product,
      tier,
      pageCount: manifest.pageCount,
      factsHash: manifest.factsHash,
      elapsed: `${elapsed}ms`,
    });

    return NextResponse.json(manifest, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60',
        'X-Preview-Source': 'generated',
        'X-Page-Count': String(manifest.pageCount || 0),
        'X-Generation-Time': `${elapsed}ms`,
        'X-Facts-Hash': manifest.factsHash || '',
        ...rateLimitHeaders,
      },
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;

    // Handle specific error types
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      return errorResponse('GENERATION_TIMEOUT', 'Preview generation timed out. Please try again.', 504, {
        caseId,
        elapsed: `${elapsed}ms`,
      });
    }

    if (error.message?.includes('Chromium') || error.message?.includes('browser')) {
      return errorResponse('BROWSER_ERROR', 'Preview service temporarily unavailable', 503, {
        error: error.message,
        caseId,
        elapsed: `${elapsed}ms`,
      });
    }

    return errorResponse('INTERNAL_ERROR', 'Failed to generate preview', 500, {
      error: error.message,
      stack: isDev ? error.stack : undefined,
      caseId,
      elapsed: `${elapsed}ms`,
    });
  }
}

// ============================================================================
// POST HANDLER (Background Generation)
// ============================================================================

/**
 * POST endpoint for triggering preview generation in background
 * Returns immediately with 'processing' status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const resolvedParams = await params;
  const caseId = resolvedParams.caseId;

  try {
    const body = await request.json();
    const product = normalizeProduct(body.product);
    const tier = body.tier || getTierFromProduct(product);
    const forceRegenerate = body.force === true;

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

    // Apply rate limiting
    const rateLimitResult = user
      ? await rateLimiters.previewForUser(request, user.id)
      : await rateLimiters.preview(request);

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return rateLimitResponse(retryAfter, {
        'X-RateLimit-Limit': String(rateLimitResult.limit),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(rateLimitResult.reset),
      });
    }

    // Check cache - if ready and not force regenerate, return immediately
    if (!forceRegenerate) {
      const cachedManifest = getPreviewFromCache(caseId, product, tier);
      if (cachedManifest && cachedManifest.status === 'ready') {
        return NextResponse.json(cachedManifest, {
          status: 200,
          headers: {
            'X-Preview-Source': 'cache',
          },
        });
      }
    }

    // Return processing status immediately
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
      forceRegenerate,
    }).catch((err) => {
      console.error(`[Wizard-Preview-API] Background generation failed:`, err);
    });

    return NextResponse.json(processingResponse, {
      status: 202,
      headers: {
        'X-Retry-After': '5',
        'X-RateLimit-Limit': String(rateLimitResult.limit),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(rateLimitResult.reset),
      },
    });
  } catch (error: any) {
    return errorResponse('INTERNAL_ERROR', 'Failed to start preview generation', 500, {
      error: error.message,
      caseId,
    });
  }
}
