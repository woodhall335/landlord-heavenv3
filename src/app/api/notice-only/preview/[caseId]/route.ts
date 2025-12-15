/**
 * Notice Only Preview API
 *
 * GET /api/notice-only/preview/[caseId]
 * Generates a watermarked preview of the complete Notice Only pack
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { wizardFactsToCaseFacts, mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { generateNoticeOnlyPreview, type NoticeOnlyDocument } from '@/lib/documents/notice-only-preview-merger';
import { generateDocument } from '@/lib/documents/generator';

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

      // Use mapNoticeOnlyFacts() to build template data with proper address concatenation,
      // ground normalization, deposit logic, and date handling
      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // DATE FORMATTING HELPER - UK legal format
      const formatUKDate = (dateString: string): string => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          const day = date.getDate();
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const month = months[date.getMonth()];
          const year = date.getFullYear();
          return `${day} ${month} ${year}`;
        } catch (error) {
          console.error('[PDF] Date formatting error:', error);
          return dateString;
        }
      };

      // Add formatted date versions for display
      templateData.service_date_formatted = formatUKDate(templateData.service_date || '');
      templateData.notice_date_formatted = formatUKDate(templateData.notice_date || '');
      templateData.earliest_possession_date_formatted = formatUKDate(templateData.earliest_possession_date || '');
      templateData.generated_date = formatUKDate(new Date().toISOString().split('T')[0]);

      // Calculate dates if needed using the date calculator
      if (templateData.service_date && templateData.grounds.length > 0) {
        try {
          const { calculateSection8ExpiryDate } = await import('@/lib/documents/notice-date-calculator');

          const groundsForCalc = templateData.grounds.map((g: any) => ({
            code: typeof g.code === 'number' ? g.code : parseInt(g.code),
            mandatory: g.mandatory === true,
          }));

          const calculatedDate = calculateSection8ExpiryDate({
            service_date: templateData.service_date,
            grounds: groundsForCalc,
            tenancy_start_date: templateData.tenancy_start_date,
            fixed_term: templateData.fixed_term === true,
            fixed_term_end_date: templateData.fixed_term_end_date || undefined,
          });

          if (calculatedDate) {
            templateData.earliest_possession_date = calculatedDate.earliest_valid_date;
            templateData.earliest_possession_date_formatted = formatUKDate(calculatedDate.earliest_valid_date);
            templateData.notice_period_days = calculatedDate.notice_period_days;
            templateData.notice_period_explanation = calculatedDate.explanation;
            console.log('[PDF] Calculated expiry date:', calculatedDate.earliest_valid_date);
          }
        } catch (error) {
          console.error('[PDF] Date calculation error:', error);
        }
      }

      // Add convenience flags
      templateData.is_section_8 = selected_route === 'section_8';
      templateData.is_section_21 = selected_route === 'section_21';
      templateData.grounds_count = templateData.grounds.length;
      templateData.has_mandatory_ground = templateData.grounds.some((g: any) => g.mandatory === true);
      templateData.ground_numbers = templateData.grounds.map((g: any) => g.code).join(', ');

      // Pass through full facts for templates that need them
      templateData.caseFacts = caseFacts;
      templateData.wizardFacts = wizardFacts;

      // Build nested objects for templates that expect them (service_instructions, compliance_checklist, next_steps)
      templateData.property = {
        address_line1: templateData.property_address_line1,
        address_line2: templateData.property_address_line2,
        address_town: templateData.property_city,
        city: templateData.property_city,
        postcode: templateData.property_postcode,
      };

      templateData.tenant = {
        full_name: templateData.tenant_full_name,
        name_2: templateData.tenant_2_name,
      };

      templateData.tenancy = {
        start_date: templateData.tenancy_start_date,
      };

      templateData.deposit = {
        protected: templateData.deposit_protected,
        amount: templateData.deposit_amount,
        scheme_name: templateData.deposit_scheme,
        protection_date: templateData.deposit_protection_date,
        prescribed_info_given: templateData.prescribed_info_given,
      };

      templateData.compliance = {
        gas_cert_provided: templateData.gas_cert_provided,
        gas_cert_expiry: templateData.gas_cert_expiry,
        epc_provided: templateData.epc_provided,
        epc_rating: templateData.epc_rating,
        how_to_rent_given: templateData.how_to_rent_given,
        hmo_license_required: templateData.hmo_license_required,
        hmo_license_valid: templateData.hmo_license_valid,
      };

      // Ensure flat date fields are also available
      templateData.notice_service_date = templateData.service_date || templateData.notice_date;
      templateData.notice_expiry_date = templateData.expiry_date || templateData.earliest_possession_date;

      console.log('[PDF] Template data ready:', {
        landlord: templateData.landlord_full_name,
        landlord_address: templateData.landlord_address ? 'SET' : 'MISSING',
        tenant: templateData.tenant_full_name,
        property_address: templateData.property_address ? 'SET' : 'MISSING',
        grounds: templateData.grounds_count,
        service_date: templateData.service_date,
        possession_date: templateData.earliest_possession_date,
        deposit_amount: templateData.deposit_amount,
        deposit_protected: templateData.deposit_protected,
        deposit_scheme: templateData.deposit_scheme,
      });

      // 1. Generate notice (Section 8 or Section 21)
      if (selected_route === 'section_8') {
        console.log('[NOTICE-PREVIEW-API] Generating Section 8 notice');
        try {
          const section8Doc = await generateDocument({
            templatePath: 'uk/england-wales/templates/eviction/section8_notice.hbs',
            data: templateData,
            outputFormat: 'pdf',
            isPreview: true,
          });
          if (section8Doc.pdf) {
            documents.push({
              title: 'Section 8 Notice (Form 3)',
              category: 'notice',
              pdf: section8Doc.pdf,
            });
          }
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Section 8 generation failed:', err);
        }
      } else if (selected_route === 'section_21') {
        console.log('[NOTICE-PREVIEW-API] Generating Section 21 notice');
        try {
          const section21Doc = await generateDocument({
            templatePath: 'uk/england-wales/templates/eviction/section21_form6a.hbs',
            data: caseFacts,
            outputFormat: 'pdf',
            isPreview: true,
          });
          if (section21Doc.pdf) {
            documents.push({
              title: 'Section 21 Notice (Form 6A)',
              category: 'notice',
              pdf: section21Doc.pdf,
            });
          }
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
            ...templateData,
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
          data: templateData,
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
            ...templateData,
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

    // Return PDF (convert Buffer to Uint8Array for Response API)
    return new Response(new Uint8Array(previewPdf), {
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
