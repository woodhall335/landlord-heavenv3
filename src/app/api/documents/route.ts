/**
 * Documents API - List
 *
 * GET /api/documents
 * Lists all documents for the authenticated user with optional filtering
 *
 * Query Parameters:
 * - case_id: Filter by case ID
 * - document_type: Filter by document type
 * - jurisdiction: Filter by jurisdiction
 * - is_preview: Filter by preview status (default: false for final docs only)
 *               Pass 'all' to include both preview and final docs
 * - latest_per_type: Deduplicate by document_type, keeping only newest (default: true)
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface DocumentRow {
  id: string;
  document_type: string;
  is_preview: boolean;
  created_at: string;
  [key: string]: any;
}

/**
 * Deduplicate documents by type, keeping only the latest per document_type
 */
function deduplicateByType(documents: DocumentRow[]): DocumentRow[] {
  const latestByType = new Map<string, DocumentRow>();

  for (const doc of documents) {
    const existing = latestByType.get(doc.document_type);
    if (!existing || new Date(doc.created_at) > new Date(existing.created_at)) {
      latestByType.set(doc.document_type, doc);
    }
  }

  // Return in original order (sorted by created_at desc from query)
  return documents.filter(doc => latestByType.get(doc.document_type)?.id === doc.id);
}

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();

    // Optional filters
    const caseId = searchParams.get('case_id');
    const documentType = searchParams.get('document_type');
    const jurisdiction = searchParams.get('jurisdiction');
    const isPreviewParam = searchParams.get('is_preview');
    const latestPerTypeParam = searchParams.get('latest_per_type');

    // Collect case ownership context so documents remain visible even when
    // legacy/generated rows have null/mismatched user_id.
    const { data: ownedCases } = await supabase
      .from('cases')
      .select('id')
      .eq('user_id', user.id);

    const ownedCaseIds = (ownedCases || []).map((c) => c.id);

    // Build query
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (caseId) {
      // Strong access control for case-scoped reads
      if (!ownedCaseIds.includes(caseId)) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }

      query = query.eq('case_id', caseId);
    } else if (ownedCaseIds.length > 0) {
      // Dashboard: include documents directly owned by user OR attached to owned cases.
      query = query.or(`user_id.eq.${user.id},case_id.in.(${ownedCaseIds.join(',')})`);
    } else {
      // User has no cases: keep direct ownership filter only.
      query = query.eq('user_id', user.id);
    }

    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    if (jurisdiction) {
      query = query.eq('jurisdiction', jurisdiction);
    }

    // Handle is_preview filter
    // Default: false (final docs only)
    // Pass 'all' to include both preview and final docs
    // Pass 'true' to get only previews
    if (isPreviewParam === 'all') {
      // No filter - include all documents
    } else if (isPreviewParam === 'true') {
      query = query.eq('is_preview', true);
    } else {
      // Default to final docs only (is_preview = false)
      query = query.eq('is_preview', false);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('Failed to fetch documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Handle deduplication
    // Default: true (deduplicate by document_type, latest wins)
    // Pass 'false' to get all documents without deduplication
    let result: DocumentRow[] = (documents || []) as unknown as DocumentRow[];
    const shouldDedupe = latestPerTypeParam !== 'false';
    if (shouldDedupe && result.length > 0) {
      result = deduplicateByType(result);
    }

    return NextResponse.json(
      {
        success: true,
        documents: result,
        count: result.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('List documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
