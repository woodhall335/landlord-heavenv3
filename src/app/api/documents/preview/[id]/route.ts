/**
 * Documents API - Preview
 *
 * GET /api/documents/preview/[id]
 * Generates a preview of a document (watermarks removed as part of simplified UX)
 */

import { createServerSupabaseClient, getServerUser, createAdminClient } from '@/lib/supabase/server';
import { htmlToPdf, preparePreviewHtml } from '@/lib/documents/generator';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Fetch document - support both authenticated and anonymous users
    const query = supabase
      .from('documents')
      .select('*')
      .eq('id', id);

    // Filter by user_id if authenticated, or allow anonymous documents if not
    if (user) {
      query.eq('user_id', user.id);
    } else {
      query.is('user_id', null);
    }

    const { data: document, error } = await query.single();

    if (error || !document) {
      console.error('Document not found:', error);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // If document is already a preview (watermarked), return existing URL
    if ((document as any).is_preview && (document as any).pdf_url) {
      const adminClient = createAdminClient();
      const urlParts = (document as any).pdf_url.split('/documents/');

      if (urlParts.length === 2) {
        const filePath = urlParts[1];

        // Generate signed URL (valid for 1 hour)
        const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
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
    if (!(document as any).html_content) {
      return NextResponse.json(
        { error: 'No HTML content available for preview generation' },
        { status: 404 }
      );
    }

    try {
      // Prepare HTML for preview (limit to 2 pages, add headers/footers)
      const previewHtml = preparePreviewHtml((document as any).html_content, 2);

      // Generate PDF (watermarks removed as part of simplified UX)
      const previewPdf = await htmlToPdf(previewHtml, {});

      // Upload preview PDF to storage
      const adminClient = createAdminClient();
      const userFolder = user?.id || 'anonymous';
      const fileName = `${userFolder}/${(document as any).case_id}/preview_${(document as any).document_type}_${Date.now()}.pdf`;

      const { error: uploadError } = await adminClient.storage
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
      const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
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
