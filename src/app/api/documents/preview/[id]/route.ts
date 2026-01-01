/**
 * Documents API - Preview
 *
 * GET /api/documents/preview/[id]
 * Generates a preview of a document (watermarks removed as part of simplified UX)
 * ALLOWS ANONYMOUS ACCESS - Users can preview their anonymous documents
 */

import { getServerUser, createAdminClient } from '@/lib/supabase/server';
import { htmlToPdf, preparePreviewHtml } from '@/lib/documents/generator';
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

    // Type assertion for the document record properties we need
    const docRecord = document as {
      id: string;
      user_id: string | null;
      case_id: string;
      document_type: string;
      html_content: string | null;
      is_preview: boolean;
      pdf_url: string | null;
      [key: string]: unknown;
    };

    // Manual access control: user can access if:
    // 1. They own the document (user_id matches)
    // 2. The document is anonymous (user_id is null) - anyone can access
    const isOwner = user && docRecord.user_id === user.id;
    const isAnonymousDoc = docRecord.user_id === null;

    if (!isOwner && !isAnonymousDoc) {
      console.error('Access denied to document:', { id, userId: user?.id, docUserId: docRecord.user_id });
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // If document is already a preview (watermarked), return existing URL
    if (docRecord.is_preview && docRecord.pdf_url) {
      const urlParts = docRecord.pdf_url.split('/documents/');

      if (urlParts.length === 2) {
        const filePath = urlParts[1];

        // Generate signed URL (valid for 1 hour)
        const { data: signedUrlData, error: signedUrlError } = await adminSupabase.storage
          .from('documents')
          .createSignedUrl(filePath, 3600);

        if (!signedUrlError) {
          return NextResponse.json(
            {
              success: true,
              preview_url: signedUrlData.signedUrl,
              is_preview: true,
            },
            { status: 200 }
          );
        }
      }
    }

    // If document is NOT a preview, generate a watermarked version
    if (!docRecord.html_content) {
      return NextResponse.json(
        { error: 'No HTML content available for preview generation' },
        { status: 404 }
      );
    }

    try {
      // Prepare HTML for preview (limit to 2 pages, add headers/footers)
      const previewHtml = preparePreviewHtml(docRecord.html_content, 2);

      // Generate PDF (watermarks removed as part of simplified UX)
      const previewPdf = await htmlToPdf(previewHtml, {});

      // Upload preview PDF to storage
      const userFolder = user?.id || 'anonymous';
      const fileName = `${userFolder}/${docRecord.case_id}/preview_${docRecord.document_type}_${Date.now()}.pdf`;

      const { error: uploadError } = await adminSupabase.storage
        .from('documents')
        .upload(fileName, previewPdf, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        console.error('Failed to upload preview PDF:', uploadError);
        return NextResponse.json(
          { error: 'Failed to generate preview' },
          { status: 500 }
        );
      }

      // Generate signed URL for preview
      const { data: signedUrlData, error: signedUrlError } = await adminSupabase.storage
        .from('documents')
        .createSignedUrl(fileName, 3600);

      if (signedUrlError) {
        console.error('Failed to generate signed URL:', signedUrlError);
        return NextResponse.json(
          { error: 'Failed to generate preview URL' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          preview_url: signedUrlData.signedUrl,
          is_preview: true,
          message: 'Preview generated successfully',
        },
        { status: 200 }
      );
    } catch (pdfError: any) {
      console.error('PDF generation failed:', pdfError);
      return NextResponse.json(
        { error: `Preview generation failed: ${pdfError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Preview document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
