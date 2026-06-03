/**
 * Documents API - Get Document
 *
 * GET /api/documents/[id]
 * Retrieves a specific document by ID with signed download URL
 */

import { requireServerAuth, createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

function resolveStoragePath(pdfUrl?: string | null): string | null {
  if (!pdfUrl) return null;

  if (pdfUrl.includes('/documents/')) {
    const [, path] = pdfUrl.split('/documents/');
    return path || null;
  }

  const cleaned = pdfUrl.replace(/^\/+/, '');
  return cleaned.length > 0 ? cleaned : null;
}

async function canAccessDocument(params: {
  adminClient: ReturnType<typeof createAdminClient>;
  document: Record<string, any>;
  userId: string;
  userIsAdmin: boolean;
}): Promise<boolean> {
  if (params.userIsAdmin) return true;
  if (params.document.user_id === params.userId) return true;

  const caseId = params.document.case_id;
  if (!caseId) return false;

  const { data: linkedCase, error } = await params.adminClient
    .from('cases')
    .select('id')
    .eq('id', caseId)
    .eq('user_id', params.userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to verify document case ownership:', error);
    return false;
  }

  return Boolean(linkedCase);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const { id } = await params;
    const userIsAdmin = isAdmin(user.id);
    const adminClient = createAdminClient();

    // Fetch document with the admin client, then enforce access in code.
    // Admin support users need to open generated documents for customer cases,
    // and some legacy rows have null/mismatched user_id but a valid case_id.
    const { data: document, error } = await adminClient
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !document) {
      console.error('Document not found:', error);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const allowed = await canAccessDocument({
      adminClient,
      document: document as Record<string, any>,
      userId: user.id,
      userIsAdmin,
    });

    if (!allowed) {
      console.warn('Document access denied:', { documentId: id, userId: user.id });
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Generate signed URL for PDF if available
    let signedUrl: string | null = null;

    const storagePath = resolveStoragePath((document as any).pdf_url);
    if (storagePath) {
      const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
        .from('documents')
        .createSignedUrl(storagePath, 3600);

      if (signedUrlError) {
        console.error('Failed to generate signed URL:', signedUrlError);
      } else {
        signedUrl = signedUrlData.signedUrl;
      }
    }

    return NextResponse.json(
      {
        success: true,
        document: {
          ...document,
          download_url: signedUrl,
        },
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

    console.error('Get document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Deletes a document and its associated file from storage
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const { id } = await params;
    const userIsAdmin = isAdmin(user.id);
    const adminClient = createAdminClient();

    // Fetch document first to get file path
    const { data: document, error: fetchError } = await adminClient
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !document) {
      console.error('Document not found:', fetchError);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const allowed = await canAccessDocument({
      adminClient,
      document: document as Record<string, any>,
      userId: user.id,
      userIsAdmin,
    });

    if (!allowed) {
      console.warn('Document delete denied:', { documentId: id, userId: user.id });
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const storagePath = resolveStoragePath((document as any).pdf_url);

    // Delete file from storage if exists
    if (storagePath) {
      const { error: deleteStorageError } = await adminClient.storage
        .from('documents')
        .remove([storagePath]);

      if (deleteStorageError) {
        console.error('Failed to delete file from storage:', deleteStorageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete document record from database
    const { error: deleteError } = await adminClient
      .from('documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete document:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Document deleted successfully',
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

    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
