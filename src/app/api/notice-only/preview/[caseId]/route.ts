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

/**
 * Helper: Get Scotland eviction ground legal basis
 */
function getScotlandGroundLegalBasis(groundNumber: number): string {
  const grounds: Record<number, string> = {
    1: 'Rent arrears for 3 consecutive months or more (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 1)',
    2: 'Persistent rent arrears (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 2)',
    3: 'Criminal behaviour (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 3)',
    4: 'Anti-social behaviour (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 4)',
    5: 'Landlord intends to sell (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 5)',
    6: 'Landlord intends to refurbish (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 6)',
    7: 'Landlord intends to live in property (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 7)',
    8: 'Landlord needs property for family member (Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground 8)',
  };
  return grounds[groundNumber] || `Private Housing (Tenancies) (Scotland) Act 2016, Schedule 3, Ground ${groundNumber}`;
}

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
    let jurisdiction = caseRow.jurisdiction as 'england' | 'wales' | 'scotland' | 'england-wales';

    // Determine selected route with jurisdiction-aware fallback
    let selected_route =
      wizardFacts.selected_notice_route ||
      wizardFacts.route_recommendation?.recommended_route;

    // Apply jurisdiction-aware default if no route specified
    if (!selected_route) {
      if (jurisdiction === 'scotland') {
        selected_route = 'notice_to_leave';
      } else if (jurisdiction === 'wales') {
        selected_route = 'wales_section_173';
      } else {
        selected_route = 'section_8';
      }
      console.log(`[NOTICE-PREVIEW-API] No route specified, using jurisdiction default: ${selected_route}`);
    }

    // DEFENSIVE FALLBACK: Fix jurisdiction based on selected_route
    // (In case E2E test or wizard created case with wrong jurisdiction)
    if (selected_route?.startsWith('wales_')) {
      if (jurisdiction !== 'wales') {
        console.warn(`[NOTICE-PREVIEW-API] Jurisdiction mismatch: selected_route is ${selected_route} but jurisdiction is ${jurisdiction}. Overriding to 'wales'.`);
        jurisdiction = 'wales';
      }
    } else if (selected_route === 'notice_to_leave') {
      if (jurisdiction !== 'scotland') {
        console.warn(`[NOTICE-PREVIEW-API] Jurisdiction mismatch: selected_route is ${selected_route} but jurisdiction is ${jurisdiction}. Overriding to 'scotland'.`);
        jurisdiction = 'scotland';
      }
    }

    const documents: NoticeOnlyDocument[] = [];

    // ===========================================================================
    // ENGLAND & WALES NOTICE ONLY PACK
    // ===========================================================================
    if (jurisdiction === 'england-wales') {
      console.log('[NOTICE-PREVIEW-API] Generating England & Wales pack');

      // Use mapNoticeOnlyFacts() to build template data with proper address concatenation,
      // ground normalization, deposit logic, and date handling
      const templateData = mapNoticeOnlyFacts(wizardFacts);

      // JURISDICTION VALIDATION: Block Section 8/21 for Wales
      // Section 8 and Section 21 only exist in England (Housing Act 1988)
      // Wales uses Renting Homes (Wales) Act 2016 with different sections
      const actualJurisdiction = templateData.jurisdiction?.toLowerCase();
      if (actualJurisdiction === 'wales' || actualJurisdiction === 'cym') {
        if (selected_route === 'section_8') {
          return NextResponse.json(
            {
              error: 'Section 8 notices do not exist in Wales',
              details: 'Wales uses the Renting Homes (Wales) Act 2016. Please use Section 173 (no-fault) or fault-based sections (157, 159, 161, 162) instead.',
            },
            { status: 400 }
          );
        }
        if (selected_route === 'section_21') {
          return NextResponse.json(
            {
              error: 'Section 21 notices do not exist in Wales',
              details: 'Wales uses the Renting Homes (Wales) Act 2016, Section 173 for no-fault evictions.',
            },
            { status: 400 }
          );
        }
      }

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

      // Note: mapNoticeOnlyFacts() already creates nested objects (property, tenant, tenancy, deposit, compliance, metadata)
      // No need to duplicate that work here

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
          // FIX: Use templateData (enriched with formatted addresses/dates) instead of caseFacts
          const section21Data = {
            ...templateData,
            // Section 21 requires possession_date (2 months from service)
            possession_date: templateData.earliest_possession_date_formatted || templateData.earliest_possession_date,
          };

          const section21Doc = await generateDocument({
            templatePath: 'uk/england-wales/templates/eviction/section21_form6a.hbs',
            data: section21Data,
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
    // WALES NOTICE ONLY PACK
    // ===========================================================================
    else if (jurisdiction === 'wales') {
      console.log('[NOTICE-PREVIEW-API] Generating Wales pack');

      // Use mapNoticeOnlyFacts() to build template data
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

      // Add convenience flags
      templateData.is_wales_section_173 = selected_route === 'wales_section_173';
      templateData.is_wales_fault_based = selected_route === 'wales_fault_based';
      templateData.contract_holder_full_name = wizardFacts.contract_holder_full_name || templateData.tenant_full_name;
      templateData.landlord_full_name = wizardFacts.landlord_full_name || templateData.landlord_full_name;

      // Pass through full facts for templates that need them
      templateData.caseFacts = caseFacts;
      templateData.wizardFacts = wizardFacts;

      console.log('[PDF] Wales template data ready:', {
        landlord: templateData.landlord_full_name,
        contract_holder: templateData.contract_holder_full_name,
        property_address: templateData.property_address ? 'SET' : 'MISSING',
        selected_route,
        service_date: templateData.service_date,
        deposit_protected: templateData.deposit_protected,
      });

      // 1. Generate notice (Section 173 or fault-based)
      if (selected_route === 'wales_section_173') {
        console.log('[NOTICE-PREVIEW-API] Generating Section 173 notice');
        try {
          const section173Data = {
            ...templateData,
            is_wales_section_173: true,
            // Calculate prohibited period (first 6 months)
            prohibited_period_violation: false, // TODO: Calculate based on dates
          };

          const section173Doc = await generateDocument({
            templatePath: 'uk/wales/templates/eviction/section173_landlords_notice.hbs',
            data: section173Data,
            outputFormat: 'pdf',
            isPreview: true,
          });
          if (section173Doc.pdf) {
            documents.push({
              title: 'Section 173 Landlord\'s Notice (Wales)',
              category: 'notice',
              pdf: section173Doc.pdf,
            });
          }
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Section 173 generation failed:', err);
        }
      } else if (selected_route === 'wales_fault_based') {
        console.log('[NOTICE-PREVIEW-API] Generating Wales fault-based notice');
        try {
          // Determine if the breach is rent arrears
          const breachType = wizardFacts.wales_breach_type || 'breach_of_contract';
          const isRentArrears = breachType === 'rent_arrears' || breachType.toLowerCase().includes('arrears');

          const faultBasedData = {
            ...templateData,
            is_wales_fault_based: true,
            wales_breach_type: breachType,
            wales_breach_type_rent_arrears: isRentArrears,
            rent_arrears_amount: wizardFacts.rent_arrears_amount,
            breach_details: wizardFacts.breach_details || templateData.ground_particulars,
          };

          const faultDoc = await generateDocument({
            templatePath: 'uk/wales/templates/eviction/fault_based_notice.hbs',
            data: faultBasedData,
            outputFormat: 'pdf',
            isPreview: true,
          });

          if (faultDoc.pdf) {
            documents.push({
              title: 'Fault-Based Breach Notice (Wales)',
              category: 'notice',
              pdf: faultDoc.pdf,
            });
          }
        } catch (err) {
          console.error('[NOTICE-PREVIEW-API] Wales fault-based generation failed:', err);
        }
      }

      // 2. Generate service instructions (Wales-specific)
      console.log('[NOTICE-PREVIEW-API] Generating Wales service instructions');
      try {
        const serviceData = {
          ...templateData,
          notice_type: selected_route === 'wales_section_173' ? 'Section 173' : 'Fault-Based Breach Notice',
          is_wales_section_173: selected_route === 'wales_section_173',
          is_wales_fault_based: selected_route === 'wales_fault_based',
        };

        const serviceDoc = await generateDocument({
          templatePath: 'uk/wales/templates/eviction/service_instructions.hbs',
          data: serviceData,
          outputFormat: 'pdf',
        });

        if (serviceDoc.pdf) {
          documents.push({
            title: 'Service Instructions (Wales)',
            category: 'guidance',
            pdf: serviceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Service instructions generation failed:', err);
      }

      // 3. Generate compliance checklist (use England/Wales with Wales flag)
      console.log('[NOTICE-PREVIEW-API] Generating compliance checklist');
      try {
        const complianceDoc = await generateDocument({
          templatePath: 'uk/england-wales/templates/eviction/compliance_checklist.hbs',
          data: {
            ...templateData,
            jurisdiction: 'Wales',
            is_wales: true,
          },
          outputFormat: 'pdf',
        });

        if (complianceDoc.pdf) {
          documents.push({
            title: 'Compliance Checklist (Wales)',
            category: 'checklist',
            pdf: complianceDoc.pdf,
          });
        }
      } catch (err) {
        console.error('[NOTICE-PREVIEW-API] Compliance checklist generation failed:', err);
      }

      // 4. Generate next steps guide (use England/Wales with Wales flag)
      console.log('[NOTICE-PREVIEW-API] Generating next steps guide');
      try {
        const nextStepsDoc = await generateDocument({
          templatePath: 'uk/england-wales/templates/eviction/next_steps_guide.hbs',
          data: {
            ...templateData,
            notice_route: selected_route,
            jurisdiction: 'Wales',
            is_wales: true,
          },
          outputFormat: 'pdf',
        });

        if (nextStepsDoc.pdf) {
          documents.push({
            title: 'Next Steps Guide (Wales)',
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

      // Use mapNoticeOnlyFacts() to build template data
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

      // Calculate Scotland-specific dates
      // For Notice to Leave, minimum notice period is 28 days for PRT (84 days for rent arrears - Ground 1)
      const noticeDate = templateData.notice_date || templateData.service_date || new Date().toISOString().split('T')[0];
      templateData.notice_date = noticeDate;

      // Determine notice period based on grounds
      const evictionGrounds = wizardFacts.eviction_grounds || [];
      const hasGround1 = evictionGrounds.some((g: any) =>
        String(g).includes('Ground 1') || String(g).includes('rent arrears')
      );

      const noticePeriodDays = hasGround1 ? 84 : 28; // 84 days for rent arrears, 28 for others

      // Calculate earliest leaving date (notice_date + notice_period)
      if (noticeDate) {
        const noticeDateObj = new Date(noticeDate);
        const earliestLeavingDateObj = new Date(noticeDateObj);
        earliestLeavingDateObj.setDate(earliestLeavingDateObj.getDate() + noticePeriodDays);
        const earliestLeavingDate = earliestLeavingDateObj.toISOString().split('T')[0];

        templateData.earliest_leaving_date = earliestLeavingDate;
        templateData.earliest_leaving_date_formatted = formatUKDate(earliestLeavingDate);

        // Earliest tribunal date is same as leaving date
        templateData.earliest_tribunal_date = earliestLeavingDate;
        templateData.earliest_tribunal_date_formatted = formatUKDate(earliestLeavingDate);

        templateData.notice_period_days = noticePeriodDays;
      }

      // Format dates for display
      templateData.notice_date_formatted = formatUKDate(noticeDate);
      templateData.generated_date = formatUKDate(new Date().toISOString().split('T')[0]);

      // Process grounds for Scotland
      const processedGrounds = evictionGrounds.map((ground: any, index: number) => {
        const groundStr = String(ground);
        let number = index + 1;
        let title = groundStr;

        // Extract ground number if present
        const match = groundStr.match(/Ground (\d+)/i);
        if (match) {
          number = parseInt(match[1]);
          title = groundStr.replace(/Ground \d+\s*-?\s*/i, '');
        }

        return {
          number,
          title,
          particulars: templateData.ground_particulars || wizardFacts.ground_particulars || '',
          legal_basis: getScotlandGroundLegalBasis(number),
        };
      });

      templateData.grounds = processedGrounds;
      templateData.ground_1_claimed = hasGround1;

      // Pass through full facts for templates that need them
      templateData.caseFacts = caseFacts;
      templateData.wizardFacts = wizardFacts;

      console.log('[PDF] Scotland template data ready:', {
        landlord: templateData.landlord_full_name,
        landlord_address: templateData.landlord_address ? 'SET' : 'MISSING',
        tenant: templateData.tenant_full_name,
        property_address: templateData.property_address ? 'SET' : 'MISSING',
        notice_date: templateData.notice_date,
        earliest_leaving_date: templateData.earliest_leaving_date,
        notice_period_days: templateData.notice_period_days,
      });

      // 1. Generate Notice to Leave
      console.log('[NOTICE-PREVIEW-API] Generating Notice to Leave');
      try {
        const noticeDoc = await generateDocument({
          templatePath: 'uk/scotland/templates/eviction/notice_to_leave.hbs',
          data: templateData,
          outputFormat: 'pdf',
          isPreview: true,
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
          data: templateData,
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
      if (hasGround1) {
        console.log('[NOTICE-PREVIEW-API] Generating pre-action checklist (Ground 1)');
        try {
          const preActionDoc = await generateDocument({
            templatePath: 'uk/scotland/templates/eviction/pre_action_checklist.hbs',
            data: templateData,
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
          data: templateData,
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
