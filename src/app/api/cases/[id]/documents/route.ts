/**
 * Cases API - Documents List
 *
 * GET /api/cases/[id]/documents
 * Lists all documents generated for a case
 * ALLOWS ANONYMOUS ACCESS - Users can view their anonymous case documents
 */

import { createAdminClient, getServerUser } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;

    // Use admin client to bypass RLS - we do our own access control below
    const adminSupabase = createAdminClient();

    // Try to get a user, but don't fail if unauthenticated
    const user = await getServerUser();

    // First, fetch the case to verify access
    const { data: caseData, error: caseError } = await adminSupabase
      .from('cases')
      .select('id, user_id')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      console.error('Case not found:', caseError);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Type assertion for the case record
    const caseRecord = caseData as {
      id: string;
      user_id: string | null;
    };

    // Manual access control
    const isOwner = user && caseRecord.user_id === user.id;
    const isAnonymousCase = caseRecord.user_id === null;

    if (!isOwner && !isAnonymousCase) {
      console.error('Access denied to case documents:', { caseId, userId: user?.id });
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Fetch all documents for this case
    const { data: documents, error: docsError } = await adminSupabase
      .from('documents')
      .select('id, document_type, title, created_at, status')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('Failed to fetch documents:', docsError);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        documents: documents || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get case documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
