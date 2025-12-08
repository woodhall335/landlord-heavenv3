/**
 * Documents API - Get Document
 *
 * GET /api/documents/[id]
 * Retrieves a specific document by ID with signed download URL
 */

import { createServerSupabaseClient, requireServerAuth, createAdminClient } from '@/lib/supabase/server';
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Fetch document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !document) {
      console.error('Document not found:', error);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Generate signed URL for PDF if available
    let signedUrl: string | null = null;

    const storagePath = resolveStoragePath((document as any).pdf_url);
    if (storagePath) {
      const adminClient = createAdminClient();

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
    const supabase = await createServerSupabaseClient();

    // Fetch document first to get file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !document) {
      console.error('Document not found:', fetchError);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const storagePath = resolveStoragePath((document as any).pdf_url);

    // Delete file from storage if exists
    if (storagePath) {
      const adminClient = createAdminClient();

      const { error: deleteStorageError } = await adminClient.storage
        .from('documents')
        .remove([storagePath]);

      if (deleteStorageError) {
        console.error('Failed to delete file from storage:', deleteStorageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete document record from database
    const { error: deleteError } = await supabase
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
