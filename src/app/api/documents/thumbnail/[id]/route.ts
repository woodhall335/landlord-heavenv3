/**
 * Documents API - Thumbnail Preview
 *
 * GET /api/documents/thumbnail/[id]
 * Generates a watermarked JPEG thumbnail of the first page of a document
 * ALLOWS ANONYMOUS ACCESS - Users can preview their anonymous documents
 */

import { getServerUser, createAdminClient } from '@/lib/supabase/server';
import { htmlToPreviewThumbnail } from '@/lib/documents/generator';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    const { id } = await params;

    // Use admin client to bypass RLS - we do our own access control below
    const adminSupabase = createAdminClient();

    // Fetch document using admin client (bypasses RLS)
    const { data: document, error } = await adminSupabase
      .from('documents')
      .select('id, user_id, case_id, document_type, html_content, document_title')
      .eq('id', id)
      .single();

    if (error || !document) {
      console.error('Document not found for thumbnail:', error);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Type assertion for the document record properties we need
    const docRecord = document as {
      id: string;
      user_id: string | null;
      case_id: string;
      document_type: string;
      html_content: string | null;
      document_title: string | null;
    };

    // Manual access control: user can access if:
    // 1. They own the document (user_id matches)
    // 2. The document is anonymous (user_id is null) - anyone can access
    const isOwner = user && docRecord.user_id === user.id;
    const isAnonymousDoc = docRecord.user_id === null;

    if (!isOwner && !isAnonymousDoc) {
      console.error('Access denied to document thumbnail:', { id, userId: user?.id, docUserId: docRecord.user_id });
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if we have HTML content to generate thumbnail from
    if (!docRecord.html_content) {
      return NextResponse.json(
        { error: 'No HTML content available for thumbnail generation' },
        { status: 404 }
      );
    }

    try {
      // Generate watermarked JPEG thumbnail
      const thumbnail = await htmlToPreviewThumbnail(docRecord.html_content, {
        quality: 75,
        watermarkText: 'PREVIEW',
      });

      // Convert Buffer to Uint8Array for NextResponse
      const uint8Array = new Uint8Array(thumbnail);

      // Return the JPEG image directly
      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': thumbnail.length.toString(),
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (thumbnailError: any) {
      console.error('Thumbnail generation failed:', thumbnailError);
      return NextResponse.json(
        { error: `Thumbnail generation failed: ${thumbnailError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Thumbnail document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
