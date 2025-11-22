/**
 * Documents API - List
 *
 * GET /api/documents
 * Lists all documents for the authenticated user with optional filtering
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();

    // Optional filters
    const caseId = searchParams.get('case_id');
    const documentType = searchParams.get('document_type');
    const jurisdiction = searchParams.get('jurisdiction');
    const isPreview = searchParams.get('is_preview');

    // Build query
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (caseId) {
      query = query.eq('case_id', caseId);
    }

    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    if (jurisdiction) {
      query = query.eq('jurisdiction', jurisdiction);
    }

    if (isPreview !== null) {
      const previewBool = isPreview === 'true';
      query = query.eq('is_preview', previewBool);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('Failed to fetch documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        documents: documents || [],
        count: documents?.length || 0,
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
