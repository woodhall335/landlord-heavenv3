/**
 * Notice Only Preview API
 *
 * GET /api/notice-only/preview/[caseId]
 * Generates a watermarked preview of the complete Notice Only pack
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { generateNoticeOnlyPreview, type NoticeOnlyDocument } from '@/lib/documents/notice-only-preview-merger';
import { generateDocument } from '@/lib/documents/generator';
import { fillSection8Form } from '@/lib/documents/official-forms-filler';
import { fillSection21Form } from '@/lib/documents/official-forms-filler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    console.log('[NOTICE-PREVIEW-API] Generating preview for case:', caseId);

    const supabase = await createServerSupabaseClient();

    // Try to get the current user (but allow anonymous access)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build query to allow viewing own cases or anonymous cases
    let query = supabase.from('cases').select('*').eq('id', caseId);

    if (user) {
      query = query.or(`user_id.eq.${user.id},user_id.is.null`);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('[NOTICE-PREVIEW-API] Case not found:', fetchError);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const caseRow = data as any;

    // Get wizard facts
    const wizardFacts = caseRow.wizard_facts || caseRow.collected_facts || caseRow.facts || {};
    const caseFacts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;

    console.log('[NOTICE-PREVIEW-API] Jurisdiction:', caseRow.jurisdiction);
    console.log('[NOTICE-PREVIEW-API] Selected route:', wizardFacts.selected_notice_route);

    // Determine jurisdiction and notice type
    const jurisdiction = caseRow.jurisdiction as 'england-wales' | 'scotland';
    const selected_route =
      wizardFacts.selected_notice_route ||
      wizardFacts.route_recommendation?.recommended_route ||
      'section_8';

    const documents: NoticeOnlyDocument[] = [];

    // ===========================================================================
    // ENGLAND & WALES NOTICE ONLY PACK
    // ===========================================================================
    if (jurisdiction === 'england-wales') {
      console.log('[NOTICE-PREVIEW-API] Generating England & Wales pack');

      // 1. Generate notice (Section 8 or Section 21)
      if (selected_route === 'section_8') {
        console.log('[NOTICE-PREVIEW-API] Generating Section 8 notice');
        try {
          const section8Pdf = await fillSection8Form(caseFacts);
          documents.push({
            title: 'Section 8 Notice (Form 3)',
            category: 'notice',
            pdf: section8Pdf,
          });
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Section 8 generation failed:', err);
        }
      } else if (selected_route === 'section_21') {
        console.log('[NOTICE-PREVIEW-API] Generating Section 21 notice');
        try {
          const section21Pdf = await fillSection21Form(caseFacts);
          documents.push({
            title: 'Section 21 Notice (Form 6A)',
            category: 'notice',
            pdf: section21Pdf,
          });
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Section 21 generation failed:', err);
        }
      }

      // 2. Generate service instructions
      console.log('[NOTICE-PREVIEW-API] Generating service instructions');
      try {
        const serviceDoc = await generateDocument({
          templatePath: 'uk/england-wales/templates/eviction/service_instructions.hbs',
          data: {
            ...caseFacts,
            notice_type: selected_route === 'section_8' ? 'Section 8' : 'Section 21',
          },
          outputFormat: 'pdf',
        });

        if (serviceDoc.pdf) {
          documents.push({
            title: 'Service Instructions',
            category: 'guidance',
            pdf: serviceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Service instructions generation failed:', err);
      }

      // 3. Generate compliance checklist
      console.log('[NOTICE-PREVIEW-API] Generating compliance checklist');
      try {
        const complianceDoc = await generateDocument({
          templatePath: 'uk/england-wales/templates/eviction/compliance_checklist.hbs',
          data: caseFacts,
          outputFormat: 'pdf',
        });

        if (complianceDoc.pdf) {
          documents.push({
            title: 'Compliance Checklist',
            category: 'checklist',
            pdf: complianceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Compliance checklist generation failed:', err);
      }

      // 4. Generate next steps guide
      console.log('[NOTICE-PREVIEW-API] Generating next steps guide');
      try {
        const nextStepsDoc = await generateDocument({
          templatePath: 'uk/england-wales/templates/eviction/next_steps_guide.hbs',
          data: {
            ...caseFacts,
            notice_route: selected_route,
          },
          outputFormat: 'pdf',
        });

        if (nextStepsDoc.pdf) {
          documents.push({
            title: 'Next Steps Guide',
            category: 'guidance',
            pdf: nextStepsDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Next steps guide generation failed:', err);
      }
    }

    // ===========================================================================
    // SCOTLAND NOTICE ONLY PACK
    // ===========================================================================
    else if (jurisdiction === 'scotland') {
      console.log('[NOTICE-PREVIEW-API] Generating Scotland pack');

      // 1. Generate Notice to Leave
      console.log('[NOTICE-PREVIEW-API] Generating Notice to Leave');
      try {
        const noticeDoc = await generateDocument({
          templatePath: 'uk/scotland/templates/eviction/notice_to_leave.hbs',
          data: caseFacts,
          outputFormat: 'pdf',
        });

        if (noticeDoc.pdf) {
          documents.push({
            title: 'Notice to Leave (PRT)',
            category: 'notice',
            pdf: noticeDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Notice to Leave generation failed:', err);
      }

      // 2. Generate service instructions
      console.log('[NOTICE-PREVIEW-API] Generating service instructions');
      try {
        const serviceDoc = await generateDocument({
          templatePath: 'uk/scotland/templates/eviction/service_instructions.hbs',
          data: caseFacts,
          outputFormat: 'pdf',
        });

        if (serviceDoc.pdf) {
          documents.push({
            title: 'Service Instructions',
            category: 'guidance',
            pdf: serviceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Service instructions generation failed:', err);
      }

      // 3. Generate pre-action checklist (if Ground 1 - rent arrears)
      const grounds = wizardFacts.eviction_grounds || [];
      if (grounds.includes('Ground 1') || grounds.includes('1')) {
        console.log('[NOTICE-PREVIEW-API] Generating pre-action checklist (Ground 1)');
        try {
          const preActionDoc = await generateDocument({
            templatePath: 'uk/scotland/templates/eviction/pre_action_checklist.hbs',
            data: caseFacts,
            outputFormat: 'pdf',
          });

          if (preActionDoc.pdf) {
            documents.push({
              title: 'Pre-Action Requirements Checklist',
              category: 'checklist',
              pdf: preActionDoc.pdf,
            });
          }
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Pre-action checklist generation failed:', err);
        }
      }

      // 4. Generate tribunal guide
      console.log('[NOTICE-PREVIEW-API] Generating tribunal guide');
      try {
        const tribunalDoc = await generateDocument({
          templatePath: 'uk/scotland/templates/eviction/tribunal_guide.hbs',
          data: caseFacts,
          outputFormat: 'pdf',
        });

        if (tribunalDoc.pdf) {
          documents.push({
            title: 'Tribunal Process Guide',
            category: 'guidance',
            pdf: tribunalDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Tribunal guide generation failed:', err);
      }
    }

    // ===========================================================================
    // MERGE INTO SINGLE PREVIEW PDF
    // ===========================================================================
    if (documents.length === 0) {
      console.error('[NOTICE-PREVIEW-API] No documents generated');
      return NextResponse.json(
        { error: 'Failed to generate any documents' },
        { status: 500 }
      );
    }

    console.log('[NOTICE-PREVIEW-API] Merging', documents.length, 'documents into preview');

    const previewPdf = await generateNoticeOnlyPreview(documents, {
      jurisdiction,
      notice_type: selected_route as any,
      includeTableOfContents: true,
      watermarkText: 'PREVIEW - Complete Purchase (£29.99) to Download',
    });

    console.log('[NOTICE-PREVIEW-API] Preview generated successfully');

    // Return PDF
    return new Response(previewPdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="notice-only-preview.pdf"',
        'Content-Length': previewPdf.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('[NOTICE-PREVIEW-API] Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate preview', details: err.message },
      { status: 500 }
    );
  }
}
