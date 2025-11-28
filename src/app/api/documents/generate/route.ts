/**
 * Documents API - Generate
 *
 * POST /api/documents/generate
 * Generates a legal document from a case and stores it in Supabase Storage
 */

import { createServerSupabaseClient, requireServerAuth, createAdminClient } from '@/lib/supabase/server';
import { generateDocument } from '@/lib/documents/generator';
import { generateSection8Notice } from '@/lib/documents/section8-generator';
import { generateStandardAST, generatePremiumAST } from '@/lib/documents/ast-generator';
import { generateNoticeToLeave } from '@/lib/documents/scotland/notice-to-leave-generator';
import { generatePRTAgreement } from '@/lib/documents/scotland/prt-generator';
import { mapWizardToNoticeToLeave } from '@/lib/documents/scotland/wizard-mapper';
import { mapWizardToPRTData } from '@/lib/documents/scotland/prt-wizard-mapper';
import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';
import { generatePrivateTenancyAgreement } from '@/lib/documents/northern-ireland/private-tenancy-generator';
import { mapWizardToPrivateTenancyData } from '@/lib/documents/northern-ireland/private-tenancy-wizard-mapper';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const generateDocumentSchema = z.object({
  case_id: z.string().min(1),
  document_type: z.enum([
    'section8_notice',
    'section21_notice',
    'ast_standard',
    'ast_premium',
    'notice_to_leave', // Scotland
    'prt_agreement',   // Scotland
    'prt_premium',     // Scotland Premium
    'private_tenancy', // Northern Ireland
    'private_tenancy_premium', // Northern Ireland Premium
  ]),
  is_preview: z.boolean().optional().default(true),
});


export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = generateDocumentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { case_id, document_type, is_preview } = validationResult.data;

    // For final documents (not preview), require authentication
    if (!is_preview) {
      const user = await requireServerAuth();
    }

    const supabase = await createServerSupabaseClient();

    // Fetch case metadata (RLS will handle authorization)
    const { data, error: caseError } = await supabase
      .from('cases')
      .select('id, jurisdiction, user_id, anonymous_user_id')
      .eq('id', case_id)
      .single();

    if (caseError || !data) {
      console.error('Case not found:', caseError);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Type assertion: we know data exists after the null check
    const caseData = data as { id: string; jurisdiction: string; user_id: string | null; anonymous_user_id: string | null };

    // Load WizardFacts from case_facts.facts (source of truth)
    const facts = await getOrCreateWizardFacts(supabase, case_id);
    const jurisdiction = caseData.jurisdiction;

    // Map document type to generator function and template
    let generatedDoc: any;
    let documentTitle = '';

    if (
      jurisdiction === 'northern-ireland' &&
      !['private_tenancy', 'private_tenancy_premium'].includes(document_type)
    ) {
      return NextResponse.json(
        {
          error: 'Northern Ireland only supports tenancy agreement documents',
        },
        { status: 400 }
      );
    }

    try {
      switch (document_type) {
        case 'section8_notice':
          generatedDoc = await generateSection8Notice(facts as any);
          documentTitle = 'Section 8 Notice - Notice Seeking Possession';
          break;

        case 'section21_notice':
          // Use generic generator with Section 21 template
          generatedDoc = await generateDocument({
            templatePath: `${jurisdiction}/eviction/section21_form6a.hbs`,
            data: facts as any,
            isPreview: is_preview,
            outputFormat: 'both',
          });
          documentTitle = 'Section 21 Notice - Form 6A';
          break;

        case 'ast_standard':
          generatedDoc = await generateStandardAST(mapWizardToASTData(facts));
          documentTitle = 'Assured Shorthold Tenancy Agreement - Standard';
          break;

        case 'ast_premium':
          generatedDoc = await generatePremiumAST(mapWizardToASTData(facts));
          documentTitle = 'Assured Shorthold Tenancy Agreement - Premium';
          break;

        case 'notice_to_leave':
          // Map wizard facts to NoticeToLeaveData format
          const noticeToLeaveData = mapWizardToNoticeToLeave(facts as any);
          generatedDoc = await generateNoticeToLeave(noticeToLeaveData);
          documentTitle = 'Notice to Leave - Scotland';
          break;

        case 'prt_agreement':
          // Map wizard facts to PRTData format
          const prtData = mapWizardToPRTData(facts as any);
          generatedDoc = await generatePRTAgreement(prtData);
          documentTitle = 'Private Residential Tenancy Agreement - Scotland';
          break;

        case 'prt_premium':
          const { generatePremiumPRT } = await import('@/lib/documents/scotland/prt-generator');
          // Map wizard facts to PRTData format
          const prtPremiumData = mapWizardToPRTData(facts as any);
          generatedDoc = await generatePremiumPRT(prtPremiumData);
          documentTitle = 'Premium Private Residential Tenancy Agreement - Scotland';
          break;

        case 'private_tenancy':
          // Map wizard facts to PrivateTenancyData format
          const privateTenancyData = mapWizardToPrivateTenancyData(facts as any);
          generatedDoc = await generatePrivateTenancyAgreement(privateTenancyData);
          documentTitle = 'Private Tenancy Agreement - Northern Ireland';
          break;

        case 'private_tenancy_premium':
          const { generatePremiumPrivateTenancy } = await import('@/lib/documents/northern-ireland/private-tenancy-generator');
          // Map wizard facts to PrivateTenancyData format
          const privateTenancyPremiumData = mapWizardToPrivateTenancyData(facts as any);
          generatedDoc = await generatePremiumPrivateTenancy(privateTenancyPremiumData);
          documentTitle = 'Premium Private Tenancy Agreement - Northern Ireland';
          break;

        default:
          return NextResponse.json(
            { error: 'Unsupported document type' },
            { status: 400 }
          );
      }
    } catch (genError: any) {
      console.error('Document generation failed:', genError);
      return NextResponse.json(
        { error: `Document generation failed: ${genError.message}` },
        { status: 500 }
      );
    }

    // Upload PDF to Supabase Storage if generated
    let pdfUrl: string | null = null;

    if (generatedDoc.pdf) {
      const adminClient = createAdminClient();
      // Use user_id if available, otherwise use anonymous_user_id or 'anonymous' as fallback
      const userFolder = caseData.user_id || caseData.anonymous_user_id || 'anonymous';
      const fileName = `${userFolder}/${case_id}/${document_type}_${Date.now()}.pdf`;

      const { data: uploadData, error: uploadError } = await adminClient.storage
        .from('documents')
        .upload(fileName, generatedDoc.pdf, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        console.error('Failed to upload PDF:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload document to storage' },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = adminClient.storage
        .from('documents')
        .getPublicUrl(fileName);

      pdfUrl = publicUrlData.publicUrl;
    }

    // Save document record to database
    const { data: documentRecord, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: caseData.user_id,
        case_id,
        document_type,
        document_title: documentTitle,
        jurisdiction: caseData.jurisdiction,
        html_content: generatedDoc.html,
        pdf_url: pdfUrl,
        is_preview,
        qa_passed: false, // Will be validated by AI pipeline later
        qa_score: null,
        qa_issues: [],
      } as any)
      .select()
      .single();

    if (dbError) {
      console.error('Failed to save document record:', dbError);
      return NextResponse.json(
        { error: 'Failed to save document' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        document: documentRecord,
        message: 'Document generated successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Generate document error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
