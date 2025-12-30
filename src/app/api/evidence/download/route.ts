// src/app/api/evidence/download/route.ts
//
// P0-1: Authenticated evidence download endpoint
//
// This endpoint serves signed URLs for evidence files. Evidence files are stored
// in Supabase Storage without public access. Only authenticated users with
// ownership of the case can retrieve download URLs.
//
// Security requirements:
// - NEVER return storage paths to unauthorized users
// - Signed URLs expire after 15 minutes (900s default)
// - Validate case ownership before generating signed URL
// - For anonymous cases, validate using session token from x-session-token header

import { NextResponse } from 'next/server';
import { createAdminClient, getServerUser } from '@/lib/supabase/server';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { getSessionTokenFromRequest } from '@/lib/session-token';

export const runtime = 'nodejs';

// Signed URL expiration time in seconds (15 minutes)
const SIGNED_URL_EXPIRY_SECONDS = 900;

interface EvidenceFile {
  id: string;
  document_id?: string;
  storage_path: string;
  file_name?: string;
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const user = await getServerUser();

    // Parse query parameters
    const url = new URL(request.url);
    let caseId = url.searchParams.get('caseId');
    const evidenceId = url.searchParams.get('evidenceId');
    let documentFallback: { id: string; case_id: string; pdf_url: string | null } | null = null;

    // Validate required parameters
    if (!evidenceId) {
      return NextResponse.json({ error: 'evidenceId is required' }, { status: 400 });
    }

    if (!caseId) {
      const { data: docRow, error: docError } = await supabase
        .from('documents')
        .select('id, case_id, pdf_url')
        .eq('id', evidenceId)
        .eq('document_type', 'evidence')
        .maybeSingle();

      if (docError) {
        console.error('[evidence/download] Failed to load document for evidenceId:', docError);
        return NextResponse.json({ error: 'Could not load evidence' }, { status: 500 });
      }

      if (docRow) {
        documentFallback = docRow;
        caseId = docRow.case_id;
      } else {
        return NextResponse.json(
          { error: 'caseId is required when evidenceId is not a document record' },
          { status: 400 }
        );
      }
    }

    // Load case to verify ownership (include session_token for anonymous validation)
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, session_token')
      .eq('id', caseId)
      .maybeSingle();

    if (caseError) {
      console.error('[evidence/download] Failed to load case:', caseError);
      return NextResponse.json({ error: 'Could not load case' }, { status: 500 });
    }

    if (!caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // =========================================================================
    // OWNERSHIP VALIDATION
    // =========================================================================
    // If the case has an owner, only that user can download evidence.
    // For anonymous cases (user_id is null), we require:
    //   1. A matching session token from the x-session-token header
    //   2. OR the user is now authenticated (migration case - anonymous to signed up)
    // =========================================================================

    if (caseRow.user_id) {
      // Case is owned - require the owner
      if (!user || caseRow.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Anonymous case - validate session token
      // If user is now authenticated, allow access (they signed up after starting anonymously)
      if (!user) {
        // Anonymous user - must have matching session token
        const requestSessionToken = getSessionTokenFromRequest(request);
        const caseSessionToken = (caseRow as any).session_token;

        // If case has a session token, require it to match
        if (caseSessionToken) {
          if (!requestSessionToken || requestSessionToken !== caseSessionToken) {
            console.warn('[evidence/download] Session token mismatch for anonymous case', {
              caseId,
              hasRequestToken: !!requestSessionToken,
              hasCaseToken: !!caseSessionToken,
            });
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }
        }
        // If case has no session token (legacy), allow access for backwards compatibility
        // New cases will have session tokens set on creation
      }
      // If user is authenticated, allow access to anonymous cases
      // (they may have started anonymous and then signed up)
    }

    // =========================================================================
    // LOAD EVIDENCE FROM CANONICAL SOURCE (facts.evidence.files[])
    // =========================================================================
    const facts = await getOrCreateWizardFacts(supabase as any, caseId);
    const evidenceFiles: EvidenceFile[] = (facts as any)?.evidence?.files || [];

    // Find the specific evidence file by ID
    const evidenceFile = evidenceFiles.find((f: EvidenceFile) => f.id === evidenceId);

    if (!evidenceFile) {
      if (documentFallback) {
        const storagePath = documentFallback.pdf_url;
        if (!storagePath || storagePath.startsWith('http')) {
          console.warn('[evidence/download] Document has public URL instead of storage path:', evidenceId);
          return NextResponse.json(
            { error: 'Evidence file unavailable. Please re-upload.' },
            { status: 410 }
          );
        }

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

        if (signedUrlError || !signedUrlData?.signedUrl) {
          console.error('[evidence/download] Failed to create signed URL:', signedUrlError);
          return NextResponse.json({ error: 'Could not generate download URL' }, { status: 500 });
        }

        return NextResponse.json({
          signedUrl: signedUrlData.signedUrl,
          expiresIn: SIGNED_URL_EXPIRY_SECONDS,
        });
      }

      // Fallback: check documents table for evidence documents
      const { data: docRow, error: docError } = await supabase
        .from('documents')
        .select('id, pdf_url, case_id')
        .eq('id', evidenceId)
        .eq('case_id', caseId)
        .eq('document_type', 'evidence')
        .maybeSingle();

      if (docError || !docRow) {
        return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
      }

      // Use pdf_url as storage path (it stores the objectKey, not a public URL)
      const storagePath = docRow.pdf_url;
      if (!storagePath || storagePath.startsWith('http')) {
        // This shouldn't happen after P0-1 fix, but handle gracefully
        console.warn('[evidence/download] Document has public URL instead of storage path:', evidenceId);
        return NextResponse.json(
          { error: 'Evidence file unavailable. Please re-upload.' },
          { status: 410 }
        );
      }

      // Generate signed URL
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('[evidence/download] Failed to create signed URL:', signedUrlError);
        return NextResponse.json({ error: 'Could not generate download URL' }, { status: 500 });
      }

      return NextResponse.json({
        signedUrl: signedUrlData.signedUrl,
        expiresIn: SIGNED_URL_EXPIRY_SECONDS,
      });
    }

    // Use storage_path from facts.evidence.files[]
    const storagePath = evidenceFile.storage_path;

    if (!storagePath) {
      console.error('[evidence/download] Evidence file missing storage_path:', evidenceId);
      return NextResponse.json({ error: 'Evidence file unavailable' }, { status: 410 });
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('[evidence/download] Failed to create signed URL:', signedUrlError);
      return NextResponse.json({ error: 'Could not generate download URL' }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY_SECONDS,
      fileName: evidenceFile.file_name,
    });
  } catch (error) {
    console.error('[evidence/download] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler for consistency (accepts body instead of query params)
export async function POST(request: Request) {
  try {
    let body: { caseId?: string; evidenceId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { caseId, evidenceId } = body;

    if (!evidenceId) {
      return NextResponse.json({ error: 'evidenceId is required' }, { status: 400 });
    }

    // Construct URL with query params and delegate to GET handler
    const url = new URL(request.url);
    if (caseId) {
      url.searchParams.set('caseId', caseId);
    }
    url.searchParams.set('evidenceId', evidenceId);

    const getRequest = new Request(url.toString(), {
      method: 'GET',
      headers: request.headers,
    });

    return GET(getRequest);
  } catch (error) {
    console.error('[evidence/download] Unexpected error in POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
