/**
 * Documents API - Thumbnail Preview
 *
 * GET /api/documents/thumbnail/[id]
 * Generates a watermarked JPEG thumbnail of the first page of a document
 * Supports both HTML documents and PDF documents
 * ALLOWS ANONYMOUS ACCESS - Users can preview their anonymous documents
 *
 * Vercel Compatibility Notes:
 * - Uses @sparticuz/chromium for serverless Puppeteer
 * - Falls back gracefully when admin client unavailable
 * - Avoids Content-Length header issues with streaming
 * - MUST run on Node.js runtime (not Edge) for Puppeteer compatibility
 */

import { getServerUser, tryCreateServerSupabaseClient } from '@/lib/supabase/server';
import { htmlToPreviewThumbnail, pdfToPreviewThumbnail, getBrowserDiagnostics } from '@/lib/documents/generator';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force Node.js runtime - Puppeteer/@sparticuz/chromium cannot run on Edge
export const runtime = 'nodejs';

// Disable static optimization to ensure fresh thumbnail generation
export const dynamic = 'force-dynamic';

// Environment detection
const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isDev = process.env.NODE_ENV === 'development';
const isDebugMode = process.env.THUMBNAIL_DEBUG === '1';
const e2eEnabled = process.env.E2E_MODE === 'true' || process.env.NEXT_PUBLIC_E2E_MODE === 'true';
const PLACEHOLDER_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQEA8QEA8PDw8QDw8PDw8QFREWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGi0fHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAXAAADAQAAAAAAAAAAAAAAAAAAAQID/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB6AA//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQL/xAAVEQEBAAAAAAAAAAAAAAAAAAABAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAEP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAEP/aAAgBAQABPyF//9k=';
const placeholderThumbnail = Buffer.from(PLACEHOLDER_JPEG_BASE64, 'base64');

/**
 * Structured debug log helper
 */
function debugLog(stage: string, data: Record<string, unknown>) {
  console.log(`[Thumbnail API] [${stage}]`, JSON.stringify({
    ...data,
    isVercel,
    timestamp: new Date().toISOString(),
  }));
}

/**
 * Structured error response with code for debugging
 */
function errorResponse(code: string, message: string, status: number, details?: Record<string, unknown>) {
  const logData = { code, message, status, ...details, isVercel, timestamp: new Date().toISOString() };
  console.error(`[Thumbnail API] ${code}:`, logData);
  return NextResponse.json({ error: message, code, ...(isDev ? { details } : {}) }, { status });
}

/**
 * Try to create admin client, return null if env vars missing
 * Does NOT throw - allows graceful fallback for anonymous documents
 */
function tryCreateAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.warn('[Thumbnail API] Admin client unavailable:', {
      hasUrl: !!url,
      hasServiceRoleKey: !!serviceRoleKey,
      isVercel,
    });
    return null;
  }

  try {
    return createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (err: any) {
    console.error('[Thumbnail API] Failed to create admin client:', err.message);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  let documentId: string | null = null;

  try {
    const { id } = await params;
    documentId = id;

    // E2E mode: return placeholder to avoid Supabase dependency during audits.
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

    // Debug mode: return diagnostics instead of thumbnail (safe for production, requires env var)
    if (isDebugMode && id === '_debug') {
      const diagnostics = await getBrowserDiagnostics();
      return NextResponse.json({
        ok: true,
        runtime: 'nodejs',
        isVercel,
        isDev,
        timestamp: new Date().toISOString(),
        chromium: diagnostics,
        env: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
          hasSupabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          nodeVersion: process.version,
        },
      });
    }

    console.log(`[Thumbnail API] Request for document ${id}`, { isVercel, runtime: 'nodejs' });

    // Get current user (may be null for anonymous)
    const user = await getServerUser();
    console.log(`[Thumbnail API] User context:`, { userId: user?.id ?? 'anonymous' });

    // Try admin client first (preferred for bypassing RLS)
    let supabase = tryCreateAdminClient();
    let usingAdminClient = !!supabase;

    // If admin client unavailable, try regular server client for anonymous docs
    if (!supabase) {
      console.log('[Thumbnail API] Falling back to server client (admin unavailable)');
      supabase = await tryCreateServerSupabaseClient();

      if (!supabase) {
        return errorResponse(
          'CONFIG_ERROR',
          'Database connection unavailable',
          503,
          { reason: 'No Supabase client could be created - check SUPABASE_URL and SUPABASE_ANON_KEY env vars' }
        );
      }
    }

    // Fetch document (includes is_preview to ensure preview docs are supported)
    console.log(`[Thumbnail API] Fetching document ${id} (admin=${usingAdminClient})`);
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, user_id, case_id, document_type, html_content, pdf_url, document_title, is_preview')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('[Thumbnail API] DB fetch error:', fetchError);

      // If using regular client and got permission error, might be a non-anonymous doc
      if (!usingAdminClient && fetchError.code === 'PGRST116') {
        return errorResponse(
          'ACCESS_DENIED',
          'Document not found or access denied',
          404,
          { dbError: fetchError.message, hint: 'Document may require authentication' }
        );
      }

      return errorResponse(
        'DB_ERROR',
        'Failed to fetch document',
        500,
        { dbError: fetchError.message, dbCode: fetchError.code }
      );
    }

    if (!document) {
      return errorResponse('NOT_FOUND', 'Document not found', 404);
    }

    // Type assertion
    const docRecord = document as {
      id: string;
      user_id: string | null;
      case_id: string;
      document_type: string;
      html_content: string | null;
      pdf_url: string | null;
      document_title: string | null;
      is_preview: boolean | null;
    };

    console.log(`[Thumbnail API] Document found:`, {
      docId: docRecord.id,
      docType: docRecord.document_type,
      hasHtml: !!docRecord.html_content,
      hasPdf: !!docRecord.pdf_url,
      isAnonymous: docRecord.user_id === null,
      isPreview: docRecord.is_preview ?? false,
      ownerId: docRecord.user_id,
    });

    // Access control: owner OR anonymous document
    const isOwner = user && docRecord.user_id === user.id;
    const isAnonymousDoc = docRecord.user_id === null;

    if (!isOwner && !isAnonymousDoc) {
      return errorResponse(
        'ACCESS_DENIED',
        'Document not found',
        404,
        { reason: 'Not owner and not anonymous', userId: user?.id, docUserId: docRecord.user_id }
      );
    }

    // Generate thumbnail
    let thumbnail: Buffer;
    let generationMethod: string;

    if (docRecord.html_content) {
      // HTML-based thumbnail
      generationMethod = 'html';
      console.log(`[Thumbnail API] Generating HTML thumbnail for ${docRecord.document_type}`);

      try {
        thumbnail = await htmlToPreviewThumbnail(docRecord.html_content, {
          quality: 75,
          watermarkText: 'PREVIEW',
        });
      } catch (htmlErr: any) {
        return errorResponse(
          'THUMBNAIL_HTML_ERROR',
          'Failed to generate thumbnail from HTML',
          500,
          {
            error: htmlErr.message,
            stack: isDev ? htmlErr.stack : undefined,
            docType: docRecord.document_type,
          }
        );
      }
    } else if (docRecord.pdf_url) {
      // PDF-based thumbnail
      generationMethod = 'pdf';

      let pdfAccessUrl = docRecord.pdf_url;
      let usedSignedUrl = false;
      let storagePath: string | null = null;

      // Extract storage path for logging
      const publicMarker = '/storage/v1/object/public/documents/';
      const publicIndex = docRecord.pdf_url.indexOf(publicMarker);
      if (publicIndex !== -1) {
        storagePath = docRecord.pdf_url.substring(publicIndex + publicMarker.length);
      }

      // Debug log: PDF generation start
      debugLog('PDF_START', {
        documentId: docRecord.id,
        docType: docRecord.document_type,
        storagePath,
        originalUrlHostname: new URL(docRecord.pdf_url).hostname,
        usingAdminClient,
      });

      // Try to create signed URL if admin client available
      if (usingAdminClient && supabase && storagePath) {
        try {
          debugLog('SIGNED_URL_ATTEMPT', { storagePath });

          const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('documents')
            .createSignedUrl(storagePath, 120); // 120 seconds expiry for Vercel cold starts

          if (signedUrlError) {
            debugLog('SIGNED_URL_FAILED', { error: signedUrlError.message });
          } else if (signedUrlData?.signedUrl) {
            pdfAccessUrl = signedUrlData.signedUrl;
            usedSignedUrl = true;
            debugLog('SIGNED_URL_SUCCESS', { hostname: new URL(pdfAccessUrl).hostname });
          }
        } catch (urlErr: any) {
          debugLog('SIGNED_URL_ERROR', { error: urlErr.message });
        }
      } else {
        debugLog('USING_PUBLIC_URL', { reason: usingAdminClient ? 'no storage path' : 'admin unavailable' });
      }

      // Generate thumbnail using the new download-first approach
      try {
        const pdfStartTime = Date.now();

        thumbnail = await pdfToPreviewThumbnail(pdfAccessUrl, {
          quality: 75,
          watermarkText: 'PREVIEW',
          documentId: docRecord.id,
        });

        const pdfElapsed = Date.now() - pdfStartTime;
        debugLog('PDF_SUCCESS', {
          documentId: docRecord.id,
          docType: docRecord.document_type,
          usedSignedUrl,
          thumbnailSize: thumbnail.length,
          elapsed: `${pdfElapsed}ms`,
        });
      } catch (pdfErr: any) {
        debugLog('PDF_ERROR', {
          documentId: docRecord.id,
          docType: docRecord.document_type,
          error: pdfErr.message,
          usedSignedUrl,
          urlHostname: new URL(pdfAccessUrl).hostname,
        });

        return errorResponse(
          'THUMBNAIL_PDF_ERROR',
          'Failed to generate thumbnail from PDF',
          500,
          {
            error: pdfErr.message,
            stack: isDev ? pdfErr.stack : undefined,
            docType: docRecord.document_type,
            usedSignedUrl,
          }
        );
      }
    } else {
      return errorResponse(
        'NO_CONTENT',
        'No content available for thumbnail generation',
        404,
        { docType: docRecord.document_type }
      );
    }

    const elapsed = Date.now() - startTime;
    console.log(`[Thumbnail API] Success:`, {
      docId: id,
      method: generationMethod,
      size: thumbnail.length,
      elapsed: `${elapsed}ms`,
    });

    // Return JPEG image with headers that ensure browsers render it correctly
    const headers: Record<string, string> = {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline; filename="preview.jpg"', // Hint to browser: display inline as image
      'X-Content-Type-Options': 'nosniff', // Prevent MIME type sniffing
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour (browser + CDN)
      'X-Thumbnail-Method': generationMethod,
      'X-Thumbnail-Runtime': 'nodejs', // Confirm we're on Node.js runtime
    };

    // Only set Content-Length in non-Vercel environments
    // Vercel's edge network handles this automatically and setting it can cause issues
    if (!isVercel) {
      headers['Content-Length'] = thumbnail.length.toString();
    }

    // Convert Buffer to Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(thumbnail), { status: 200, headers });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    return errorResponse(
      'INTERNAL_ERROR',
      'Internal server error',
      500,
      {
        error: error.message,
        stack: isDev ? error.stack : undefined,
        docId: documentId,
        elapsed: `${elapsed}ms`,
      }
    );
  }
}
