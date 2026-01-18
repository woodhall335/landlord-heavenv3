/**
 * Notice Only Thumbnail API
 *
 * GET /api/notice-only/thumbnail/[caseId]?document_type=...
 *
 * Generates a watermarked JPEG thumbnail of the first page of a notice-only document
 * WITHOUT creating persistent database records. This allows preview thumbnails for
 * notice-only flows where documents are only generated post-payment.
 *
 * Supports:
 * - England: section21_notice, section8_notice, service_instructions, service_checklist
 * - Wales: section173_notice, fault_based_notice, service_instructions, service_checklist
 * - Scotland: notice_to_leave, service_instructions, service_checklist
 * - All: arrears_schedule (when applicable)
 *
 * Returns:
 * - 200 OK with image/jpeg content type
 * - 400 if document_type is missing or invalid
 * - 404 if case not found
 * - 422 if validation fails
 * - 500 on generation error
 */

import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient, tryGetServerUser } from '@/lib/supabase/server';
import { htmlToPreviewThumbnail, generateDocument, compileTemplate, loadTemplate } from '@/lib/documents/generator';
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';
import { deriveCanonicalJurisdiction, type CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { normalizeSection8Facts } from '@/lib/wizard/normalizeSection8Facts';
import { mapWalesFaultGroundsToGroundCodes } from '@/lib/wales';
import { generateSection21Notice, mapWizardToSection21Data } from '@/lib/documents/section21-generator';

// Force Node.js runtime - Puppeteer/@sparticuz/chromium cannot run on Edge
export const runtime = 'nodejs';

// Disable static optimization
export const dynamic = 'force-dynamic';

// Environment detection
const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isDev = process.env.NODE_ENV === 'development';

/**
 * Structured error response
 */
function errorResponse(code: string, message: string, status: number, details?: Record<string, unknown>) {
  const logData = { code, message, status, ...details, isVercel, timestamp: new Date().toISOString() };
  console.error(`[Notice-Only-Thumbnail] ${code}:`, logData);
  return NextResponse.json({ error: message, code, ...(isDev ? { details } : {}) }, { status });
}

/**
 * Map config document ID to template document type
 */
function resolveDocumentType(configId: string, jurisdiction: string, route: string): string | null {
  // Notice documents
  if (configId === 'notice-section-21' || configId === 'section21_notice') {
    return 'section21_notice';
  }
  if (configId === 'notice-section-8' || configId === 'section8_notice') {
    return 'section8_notice';
  }
  if (configId === 'notice-section-173' || configId === 'section173_notice') {
    return 'section173_notice';
  }
  if (configId === 'notice-fault-based' || configId === 'fault_based_notice') {
    return 'fault_based_notice';
  }
  if (configId === 'notice-to-leave' || configId === 'notice_to_leave') {
    return 'notice_to_leave';
  }

  // Service instructions - same for all routes within jurisdiction
  if (configId.startsWith('service-instructions') || configId === 'service_instructions') {
    return 'service_instructions';
  }

  // Checklists
  if (configId.startsWith('validity-checklist') || configId === 'service_checklist') {
    return 'service_checklist';
  }

  // Arrears schedule
  if (configId === 'arrears-schedule' || configId === 'arrears_schedule') {
    return 'arrears_schedule';
  }

  return null;
}

/**
 * Get template path for a document type
 */
function getTemplatePath(
  docType: string,
  jurisdiction: CanonicalJurisdiction,
  route: string
): string | null {
  // England templates
  if (jurisdiction === 'england') {
    if (docType === 'section8_notice') {
      return 'uk/england/templates/notice_only/form_3_section8/notice.hbs';
    }
    if (docType === 'section21_notice') {
      // Section 21 uses a dedicated generator - handle differently
      return 'SECTION21_SPECIAL';
    }
    if (docType === 'service_instructions') {
      const instructionRoute = route === 'section_21' || route === 'accelerated_possession' ? 'section_21' : 'section_8';
      return `uk/england/templates/eviction/service_instructions_${instructionRoute}.hbs`;
    }
    if (docType === 'service_checklist') {
      const checklistRoute = route === 'section_21' || route === 'accelerated_possession' ? 'section_21' : 'section_8';
      return `uk/england/templates/eviction/checklist_${checklistRoute}.hbs`;
    }
    if (docType === 'arrears_schedule') {
      return 'uk/england/templates/money_claims/schedule_of_arrears.hbs';
    }
  }

  // Wales templates
  if (jurisdiction === 'wales') {
    if (docType === 'section173_notice') {
      // Section 173 uses a dedicated generator
      return 'SECTION173_SPECIAL';
    }
    if (docType === 'fault_based_notice') {
      return 'uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs';
    }
    if (docType === 'service_instructions') {
      const walesRoute = route === 'wales_section_173' || route === 'section_173' ? 'section_173' : 'fault_based';
      return `uk/wales/templates/eviction/service_instructions_${walesRoute}.hbs`;
    }
    if (docType === 'service_checklist') {
      const checklistRoute = route === 'wales_section_173' || route === 'section_173' ? 'section_173' : 'fault_based';
      return `uk/wales/templates/eviction/checklist_${checklistRoute}.hbs`;
    }
    if (docType === 'arrears_schedule') {
      return 'uk/wales/templates/money_claims/schedule_of_arrears.hbs';
    }
  }

  // Scotland templates
  if (jurisdiction === 'scotland') {
    if (docType === 'notice_to_leave') {
      return 'uk/scotland/templates/notice_only/notice_to_leave_prt_2017/notice.hbs';
    }
    if (docType === 'service_instructions') {
      return 'uk/scotland/templates/eviction/service_instructions_notice_to_leave.hbs';
    }
    if (docType === 'service_checklist') {
      return 'uk/scotland/templates/eviction/checklist_notice_to_leave.hbs';
    }
    if (docType === 'arrears_schedule') {
      return 'uk/scotland/templates/money_claims/schedule_of_arrears.hbs';
    }
  }

  return null;
}

/**
 * Format date in UK legal format
 */
function formatUKDate(dateString: string): string {
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
  } catch {
    return dateString;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const startTime = Date.now();
  let caseId: string | null = null;

  try {
    const resolvedParams = await params;
    caseId = resolvedParams.caseId;

    // Parse query params
    const url = new URL(request.url);
    const documentType = url.searchParams.get('document_type');

    if (!caseId) {
      return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
    }

    if (!documentType) {
      return errorResponse('MISSING_DOCUMENT_TYPE', 'document_type query parameter is required', 400);
    }

    console.log(`[Notice-Only-Thumbnail] Request:`, { caseId, documentType });

    // Get user and create client
    const user = await tryGetServerUser();
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();

    // Fetch case
    let query = supabase.from('cases').select('*').eq('id', caseId);
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error: fetchError } = await query.single();

    if (fetchError || !data) {
      console.error('[Notice-Only-Thumbnail] Case not found:', fetchError);
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404);
    }

    const caseRow = data as any;
    const wizardFacts = caseRow.wizard_facts || caseRow.collected_facts || caseRow.facts || {};

    // Normalize Section 8 facts
    normalizeSection8Facts(wizardFacts);

    // Determine jurisdiction
    const jurisdiction = deriveCanonicalJurisdiction(caseRow.jurisdiction, wizardFacts) as CanonicalJurisdiction;

    if (!jurisdiction) {
      return errorResponse('INVALID_JURISDICTION', 'Invalid or missing jurisdiction', 422);
    }

    if (jurisdiction === 'northern-ireland') {
      return errorResponse('NI_NOT_SUPPORTED', 'Northern Ireland not supported', 422);
    }

    // Determine selected route
    let selectedRoute =
      wizardFacts.selected_notice_route ||
      wizardFacts.eviction_route ||
      wizardFacts.eviction_route_intent ||
      wizardFacts.route_recommendation?.recommended_route;

    // Normalize Wales routes
    if (jurisdiction === 'wales' && selectedRoute) {
      if (selectedRoute === 'section_173' || selectedRoute === 'fault_based') {
        selectedRoute = `wales_${selectedRoute}`;
      }
    }

    // Wales route salvage
    if (jurisdiction === 'wales') {
      const isEnglandRoute = selectedRoute === 'section_21' || selectedRoute === 'section_8';
      const isUnknownRoute = !selectedRoute || (
        selectedRoute !== 'wales_section_173' &&
        selectedRoute !== 'wales_fault_based'
      );

      if (isEnglandRoute || isUnknownRoute) {
        const hasFaultGrounds = Array.isArray(wizardFacts.wales_fault_grounds) &&
          wizardFacts.wales_fault_grounds.length > 0;
        selectedRoute = hasFaultGrounds ? 'wales_fault_based' : 'wales_section_173';
      }
    }

    // Default route if none specified
    if (!selectedRoute) {
      if (jurisdiction === 'scotland') {
        selectedRoute = 'notice_to_leave';
      } else if (jurisdiction === 'wales') {
        selectedRoute = 'wales_section_173';
      } else {
        selectedRoute = 'section_8';
      }
    }

    // Derive ground_codes for Wales fault-based
    if (jurisdiction === 'wales' && selectedRoute === 'wales_fault_based') {
      const existingGroundCodes = wizardFacts.ground_codes;
      const hasGroundCodes = Array.isArray(existingGroundCodes) && existingGroundCodes.length > 0;
      const walesFaultGrounds = wizardFacts.wales_fault_grounds;
      const hasFaultGrounds = Array.isArray(walesFaultGrounds) && walesFaultGrounds.length > 0;

      if (!hasGroundCodes && hasFaultGrounds) {
        wizardFacts.ground_codes = mapWalesFaultGroundsToGroundCodes(walesFaultGrounds);
      }
    }

    // Resolve the document type from config ID
    const resolvedDocType = resolveDocumentType(documentType, jurisdiction, selectedRoute);
    if (!resolvedDocType) {
      return errorResponse('INVALID_DOCUMENT_TYPE', `Unknown document type: ${documentType}`, 400);
    }

    // Get template path
    const templatePath = getTemplatePath(resolvedDocType, jurisdiction, selectedRoute);
    if (!templatePath) {
      return errorResponse('NO_TEMPLATE', `No template found for ${resolvedDocType} in ${jurisdiction}`, 400);
    }

    console.log(`[Notice-Only-Thumbnail] Generating:`, {
      docType: resolvedDocType,
      templatePath,
      jurisdiction,
      route: selectedRoute
    });

    // Build template data
    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Add formatted dates
    templateData.service_date_formatted = formatUKDate(templateData.service_date || '');
    templateData.notice_date_formatted = formatUKDate(templateData.notice_date || '');
    templateData.earliest_possession_date_formatted = formatUKDate(templateData.earliest_possession_date || '');
    templateData.tenancy_start_date_formatted = formatUKDate(templateData.tenancy_start_date || '');
    templateData.generated_date = formatUKDate(new Date().toISOString().split('T')[0]);

    // Add convenience flags
    templateData.is_section_8 = selectedRoute === 'section_8';
    templateData.is_section_21 = selectedRoute === 'section_21' || selectedRoute === 'accelerated_possession';
    templateData.is_wales_section_173 = selectedRoute === 'wales_section_173';
    templateData.is_wales_fault_based = selectedRoute === 'wales_fault_based';

    // Wales-specific fields
    if (jurisdiction === 'wales') {
      const contractStartDate = wizardFacts.contract_start_date || templateData.tenancy_start_date;
      templateData.contract_start_date_formatted = formatUKDate(contractStartDate || '');
      templateData.contract_holder_full_name = wizardFacts.contract_holder_full_name || templateData.tenant_full_name;
    }

    // Generate HTML content
    let html: string;

    if (templatePath === 'SECTION21_SPECIAL') {
      // Use dedicated Section 21 generator
      const section21NoticeData = mapWizardToSection21Data(wizardFacts, {
        serviceDate: templateData.service_date || templateData.notice_date,
      });
      const section21Doc = await generateSection21Notice(section21NoticeData, true);
      // We need HTML, but this generator returns PDF
      // Fall back to generating from template directly
      const fallbackTemplate = 'uk/england/templates/notice_only/form_6a_section21/notice.hbs';
      const content = loadTemplate(fallbackTemplate);
      html = compileTemplate(content, templateData);
    } else if (templatePath === 'SECTION173_SPECIAL') {
      // Use dedicated Section 173 generator template
      // HARD-LOCKED to RHW16 (6-month notice) for standard occupation contracts
      const { generateWalesSection173Notice } = await import('@/lib/documents/wales-section173-generator');
      const contractStartDate = wizardFacts.contract_start_date || templateData.tenancy_start_date;
      const section173Data = {
        landlord_full_name: templateData.landlord_full_name,
        landlord_address: templateData.landlord_address,
        contract_holder_full_name: templateData.contract_holder_full_name || templateData.tenant_full_name,
        property_address: templateData.property_address,
        contract_start_date: contractStartDate,
        rent_amount: templateData.rent_amount || 0,
        rent_frequency: (templateData.rent_frequency || 'monthly') as 'weekly' | 'fortnightly' | 'monthly' | 'quarterly',
        service_date: templateData.service_date || templateData.notice_date,
        notice_service_date: templateData.notice_date || templateData.service_date,
        expiry_date: templateData.earliest_possession_date,
        notice_expiry_date: templateData.earliest_possession_date,
        wales_contract_category: wizardFacts.wales_contract_category || 'standard',
        rent_smart_wales_registered: wizardFacts.rent_smart_wales_registered,
        deposit_taken: wizardFacts.deposit_taken || templateData.deposit_taken,
        deposit_protected: wizardFacts.deposit_protected || templateData.deposit_protected,
      };
      // Get HTML output
      const result = await generateWalesSection173Notice(section173Data, true);
      // The generator returns PDF, but we need HTML - generate from base template
      const isConverted = wizardFacts.wales_contract_category === 'converted' ||
                          wizardFacts.is_converted_contract === true;
      const walesTemplate = isConverted
        ? 'uk/wales/templates/notice_only/rhw17_section173_converted/notice.hbs'
        : 'uk/wales/templates/notice_only/rhw16_section173_standard/notice.hbs';
      const content = loadTemplate(walesTemplate);
      html = compileTemplate(content, { ...templateData, ...section173Data });
    } else if (resolvedDocType === 'arrears_schedule') {
      // Special handling for arrears schedule
      const arrearsItems = wizardFacts.arrears_items || [];
      if (arrearsItems.length === 0) {
        return errorResponse('NO_ARREARS_DATA', 'No arrears data available for schedule', 400);
      }
      const { getArrearsScheduleData } = await import('@/lib/documents/arrears-schedule-mapper');
      const arrearsScheduleData = getArrearsScheduleData({
        arrears_items: arrearsItems,
        total_arrears: wizardFacts.total_arrears || null,
        rent_amount: templateData.rent_amount || wizardFacts.rent_amount || 0,
        rent_frequency: templateData.rent_frequency || wizardFacts.rent_frequency || 'monthly',
        include_schedule: true,
      });
      const content = loadTemplate(templatePath);
      html = compileTemplate(content, {
        claimant_reference: caseId,
        arrears_schedule: arrearsScheduleData.arrears_schedule,
        arrears_total: arrearsScheduleData.arrears_total,
      });
    } else if (resolvedDocType === 'fault_based_notice') {
      // Special handling for Wales fault-based notice
      const faultBasedSection = wizardFacts.wales_fault_based_section || '';
      const breachType = wizardFacts.wales_breach_type || wizardFacts.breach_or_ground || '';
      const isRentArrears =
        breachType === 'rent_arrears' ||
        breachType === 'arrears' ||
        faultBasedSection.includes('Section 157') ||
        faultBasedSection.includes('Section 159');

      let breachParticulars = '';

      if (faultBasedSection.includes('Section 157')) {
        const arrearsAmount = wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount || 0;
        breachParticulars = `Breach of contract (section 157)\n\nSerious rent arrears (2+ months)\n\nTotal arrears: £${arrearsAmount.toLocaleString('en-GB')}`;
      } else if (faultBasedSection.includes('Section 159')) {
        const arrearsAmount = wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount || 0;
        breachParticulars = `Breach of contract (section 159)\n\nRent arrears (less than 2 months)\n\nTotal arrears: £${arrearsAmount.toLocaleString('en-GB')}`;
      } else if (faultBasedSection.includes('Section 161')) {
        breachParticulars = `Breach of contract (section 161)\n\nAnti-social behaviour\n\n${wizardFacts.asb_description || wizardFacts.breach_description || wizardFacts.breach_details || ''}`;
      } else if (faultBasedSection.includes('Section 162')) {
        breachParticulars = `Breach of contract (section 162)\n\n${wizardFacts.breach_description || wizardFacts.breach_details || ''}`;
      } else if (isRentArrears) {
        const arrearsAmount = wizardFacts.rent_arrears_amount || wizardFacts.arrears_amount || 0;
        breachParticulars = `Breach of contract (section 157)\n\nSerious rent arrears (2+ months)\n\nTotal arrears: £${arrearsAmount.toLocaleString('en-GB')}`;
      } else {
        breachParticulars = wizardFacts.breach_description || wizardFacts.breach_details || wizardFacts.asb_description || '';
      }

      const faultBasedData = {
        ...templateData,
        breach_particulars: breachParticulars,
      };

      const content = loadTemplate(templatePath);
      html = compileTemplate(content, faultBasedData);
    } else {
      // Standard template generation
      const content = loadTemplate(templatePath);
      html = compileTemplate(content, templateData);
    }

    // Generate thumbnail
    const thumbnail = await htmlToPreviewThumbnail(html, {
      quality: 75,
      watermarkText: 'PREVIEW',
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Notice-Only-Thumbnail] Success:`, {
      caseId,
      docType: resolvedDocType,
      size: thumbnail.length,
      elapsed: `${elapsed}ms`,
    });

    // Return JPEG image
    const headers: Record<string, string> = {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline; filename="preview.jpg"',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      'X-Thumbnail-Runtime': 'nodejs',
      'X-Document-Type': resolvedDocType,
    };

    // Only set Content-Length in non-Vercel environments
    if (!isVercel) {
      headers['Content-Length'] = thumbnail.length.toString();
    }

    return new NextResponse(new Uint8Array(thumbnail), { status: 200, headers });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to generate thumbnail',
      500,
      {
        error: error.message,
        stack: isDev ? error.stack : undefined,
        caseId,
        elapsed: `${elapsed}ms`,
      }
    );
  }
}
