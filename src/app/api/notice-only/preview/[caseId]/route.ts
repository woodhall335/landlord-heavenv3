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

      // GROUND DETAILS MAPPING - Full legal information
      const groundDetails: Record<string, any> = {
        'ground 8 - serious rent arrears': {
          number: '8',
          type: 'MANDATORY',
          code: 'ground_8',
          title: 'Serious Rent Arrears',
          description: 'At least 8 weeks rent unpaid (or 2 months if rent paid monthly)',
          particulars: `The tenant currently owes £${wizardFacts.arrears_summary?.total_arrears || wizardFacts.arrears_summary?.arrears_amount || 0} in rent arrears, representing ${wizardFacts.arrears_summary?.arrears_duration_months || wizardFacts.arrears_summary?.arrears_months || 0} months of unpaid rent. This meets the threshold for Ground 8 under Schedule 2 of the Housing Act 1988 (as amended). Ground 8 is a mandatory ground - if proven at the hearing, the court MUST grant possession.`,
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
        },
        'ground 10 - some rent arrears': {
          number: '10',
          type: 'DISCRETIONARY',
          code: 'ground_10',
          title: 'Some Rent Arrears',
          description: 'Some rent unpaid at date of notice and at date of hearing',
          particulars: `The tenant owes £${wizardFacts.arrears_summary?.total_arrears || 0} in rent arrears at the date of this notice. The arrears must still be present at the court hearing date. Ground 10 is discretionary - the court will consider all circumstances.`,
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 10',
        },
        'ground 11 - persistent late payment': {
          number: '11',
          type: 'DISCRETIONARY',
          code: 'ground_11',
          title: 'Persistent Delay in Paying Rent',
          description: 'Persistent delay in paying rent lawfully due',
          particulars: `The tenant has persistently delayed paying rent over the course of the tenancy. Evidence of payment history will be provided to the court.`,
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 11',
        },
        'ground 12 - breach of tenancy agreement': {
          number: '12',
          type: 'DISCRETIONARY',
          code: 'ground_12',
          title: 'Breach of Tenancy Agreement',
          description: 'Any obligation of the tenancy (other than rent) has been broken',
          particulars: wizardFacts.section8_other_grounds_narrative || wizardFacts.section8_grounds_narrative || 'The tenant has breached one or more terms of the tenancy agreement. Full details will be provided to the court.',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 12',
        },
        'ground 13 - deterioration of property': {
          number: '13',
          type: 'DISCRETIONARY',
          code: 'ground_13',
          title: 'Deterioration of Property',
          description: 'Condition of dwelling-house has deteriorated due to acts of waste or neglect',
          particulars: wizardFacts.section8_other_grounds_narrative || wizardFacts.section8_grounds_narrative || 'The condition of the property has deteriorated due to acts of waste, neglect or default by the tenant. Evidence will be provided to the court.',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 13',
        },
        'ground 14 - nuisance / anti-social behaviour': {
          number: '14',
          type: 'MANDATORY',
          code: 'ground_14',
          title: 'Nuisance or Annoyance / Anti-Social Behaviour',
          description: 'Tenant or anyone residing in the property has caused nuisance or annoyance',
          particulars: wizardFacts.section8_other_grounds_narrative || wizardFacts.section8_grounds_narrative || 'The tenant or persons residing with the tenant have caused or permitted nuisance or annoyance to neighbors or other occupiers. Evidence will be provided to the court.',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 14 (as amended by Anti-social Behaviour Act 2003)',
        },
        'ground 15 - damage to furniture': {
          number: '15',
          type: 'DISCRETIONARY',
          code: 'ground_15',
          title: 'Damage to Furniture',
          description: 'Condition of furniture has deteriorated due to ill-treatment',
          particulars: wizardFacts.section8_other_grounds_narrative || wizardFacts.section8_grounds_narrative || 'The condition of furniture provided under the tenancy has deteriorated due to ill-treatment by the tenant.',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 15',
        },
        'ground 17 - false statement': {
          number: '17',
          type: 'DISCRETIONARY',
          code: 'ground_17',
          title: 'False Statement',
          description: 'Tenant induced landlord to grant tenancy by making a false statement',
          particulars: wizardFacts.section8_other_grounds_narrative || wizardFacts.section8_grounds_narrative || 'The tenancy was granted on the basis of a false statement knowingly or recklessly made by the tenant.',
          legal_basis: 'Housing Act 1988, Schedule 2, Ground 17',
        },
      };

      // MAP SELECTED GROUNDS to full details
      const selectedGrounds = wizardFacts.section8_grounds || [];
      const mappedGrounds = selectedGrounds.map((groundStr: string) => {
        const groundKey = groundStr.toLowerCase();
        const ground = groundDetails[groundKey];
        if (!ground) {
          console.warn(`[PDF] Unknown ground: ${groundStr}`);
          return null;
        }
        return ground;
      }).filter(Boolean);

      console.log('[PDF] Mapped grounds:', mappedGrounds.length);

      // CALCULATE DATES using the date calculator
      let calculatedDate;
      try {
        const { calculateSection8ExpiryDate } = await import('@/lib/documents/notice-date-calculator');

        if (wizardFacts.notice_service?.notice_service_date && mappedGrounds.length > 0) {
          const groundsForCalc = mappedGrounds.map((g: any) => ({
            code: parseInt(g.number),
            mandatory: g.type === 'MANDATORY',
          }));

          calculatedDate = calculateSection8ExpiryDate({
            service_date: wizardFacts.notice_service.notice_service_date,
            grounds: groundsForCalc,
            tenancy_start_date: wizardFacts.tenancy_details?.tenancy_start_date,
            fixed_term: !!wizardFacts.tenancy_details?.fixed_term_end_date,
            fixed_term_end_date: wizardFacts.tenancy_details?.fixed_term_end_date,
          });

          console.log('[PDF] Calculated expiry date:', calculatedDate?.earliest_valid_date);
        }
      } catch (error) {
        console.error('[PDF] Date calculation error:', error);
      }

      // BUILD COMPLETE TEMPLATE DATA (fully flattened)
      const templateData = {
        // LANDLORD DETAILS
        landlord_full_name: wizardFacts.landlord_details?.landlord_full_name || caseFacts.parties?.landlord?.name || '',
        landlord_address: wizardFacts.landlord_details?.landlord_address || caseFacts.parties?.landlord?.address || '',
        landlord_email: wizardFacts.landlord_details?.landlord_email || caseFacts.parties?.landlord?.email || '',
        landlord_phone: wizardFacts.landlord_details?.landlord_phone || caseFacts.parties?.landlord?.phone || '',

        // TENANT DETAILS
        tenant_full_name: wizardFacts.tenant_details?.tenant_full_name || caseFacts.parties?.tenants?.[0]?.name || '',
        tenant_2_name: wizardFacts.tenant_details?.tenant_2_name || caseFacts.parties?.tenants?.[1]?.name || '',
        tenant_email: wizardFacts.tenant_details?.tenant_email || caseFacts.parties?.tenants?.[0]?.email || '',

        // PROPERTY DETAILS (properly formatted address - NO [object Object]!)
        property_address: [
          wizardFacts.property_details?.property_address_line1,
          wizardFacts.property_details?.property_address_line2,
          wizardFacts.property_details?.property_address_town,
        ].filter(Boolean).join(', ') || caseFacts.property?.address_line1 || '',

        property_postcode: wizardFacts.property_details?.property_postcode || caseFacts.property?.postcode || '',

        property_full_address: [
          wizardFacts.property_details?.property_address_line1,
          wizardFacts.property_details?.property_address_line2,
          wizardFacts.property_details?.property_address_town,
          wizardFacts.property_details?.property_postcode,
        ].filter(Boolean).join(', '),

        // TENANCY DETAILS (with formatted dates!)
        tenancy_type: wizardFacts.tenancy_details?.tenancy_type || 'assured_shorthold',
        tenancy_start_date: formatUKDate(wizardFacts.tenancy_details?.tenancy_start_date || ''),
        tenancy_start_date_raw: wizardFacts.tenancy_details?.tenancy_start_date || '',
        fixed_term_end_date: formatUKDate(wizardFacts.tenancy_details?.fixed_term_end_date || ''),
        fixed_term_end_date_raw: wizardFacts.tenancy_details?.fixed_term_end_date || '',
        is_fixed_term: !!wizardFacts.tenancy_details?.fixed_term_end_date,
        rent_period_start_day: wizardFacts.tenancy_details?.rent_period_start_day || wizardFacts.rent_details?.payment_date || 1,

        // RENT DETAILS
        rent_amount: wizardFacts.rent_details?.rent_amount || caseFacts.tenancy?.rent_amount || 0,
        rent_frequency: wizardFacts.rent_details?.rent_frequency || caseFacts.tenancy?.rent_frequency || 'monthly',
        payment_date: wizardFacts.rent_details?.payment_date || 1,

        // ARREARS DETAILS
        total_arrears: wizardFacts.arrears_summary?.total_arrears || wizardFacts.arrears_summary?.arrears_amount || 0,
        arrears_at_notice_date: wizardFacts.arrears_summary?.arrears_at_notice_date || wizardFacts.arrears_summary?.total_arrears || 0,
        arrears_duration_months: wizardFacts.arrears_summary?.arrears_duration_months || wizardFacts.arrears_summary?.arrears_months || 0,

        // DEPOSIT DETAILS
        deposit_amount: wizardFacts.deposit_and_compliance?.deposit_amount || 0,
        deposit_protected: wizardFacts.deposit_and_compliance?.deposit_protected || 'no',
        deposit_scheme: wizardFacts.deposit_and_compliance?.deposit_scheme || wizardFacts.deposit_and_compliance?.deposit_scheme_name || 'Not protected',
        deposit_protection_date: formatUKDate(wizardFacts.deposit_and_compliance?.deposit_protection_date || ''),

        // COMPLIANCE
        gas_safety_cert_provided: wizardFacts.deposit_and_compliance?.gas_safety_cert_provided || 'no',
        epc_provided: wizardFacts.deposit_and_compliance?.epc_provided || 'no',
        how_to_rent_given: wizardFacts.deposit_and_compliance?.how_to_rent_given || 'no',
        prescribed_info_given: wizardFacts.deposit_and_compliance?.prescribed_info_given || 'no',

        // NOTICE ROUTE
        selected_route: wizardFacts.selected_notice_route || 'section_8',
        is_section_8: wizardFacts.selected_notice_route === 'section_8',
        is_section_21: wizardFacts.selected_notice_route === 'section_21',

        // GROUNDS (with full legal details!)
        grounds: mappedGrounds,
        grounds_count: mappedGrounds.length,
        has_mandatory_ground: mappedGrounds.some((g: any) => g.type === 'MANDATORY'),
        ground_numbers: mappedGrounds.map((g: any) => g.number).join(', '),

        // SERVICE DETAILS (with formatted dates!)
        service_date: formatUKDate(wizardFacts.notice_service?.notice_service_date || ''),
        service_date_raw: wizardFacts.notice_service?.notice_service_date || '',
        service_method: wizardFacts.notice_service?.notice_service_method || '',
        notice_served_by: wizardFacts.notice_service?.notice_served_by || wizardFacts.landlord_details?.landlord_full_name || '',

        // CALCULATED DATES (formatted!)
        earliest_possession_date: formatUKDate(calculatedDate?.earliest_valid_date || ''),
        earliest_possession_date_raw: calculatedDate?.earliest_valid_date || '',
        notice_period_days: calculatedDate?.notice_period_days || 14,
        notice_period_explanation: calculatedDate?.explanation || '',
        notice_legal_basis: calculatedDate?.legal_basis || 'Housing Act 1988, Section 8',

        // GENERATION METADATA
        generated_date: formatUKDate(new Date().toISOString().split('T')[0]),
        generation_timestamp: new Date().toISOString(),

        // PASS THROUGH nested objects for flexibility
        caseFacts,
        wizardFacts,
      };

      console.log('[PDF] Template data ready:', {
        landlord: !!templateData.landlord_full_name,
        landlord_address: templateData.landlord_address?.substring(0, 30) + '...',
        tenant: !!templateData.tenant_full_name,
        property: templateData.property_full_address?.substring(0, 30) + '...',
        grounds: templateData.grounds_count,
        service_date: templateData.service_date,
        possession_date: templateData.earliest_possession_date,
        deposit: templateData.deposit_amount,
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
