/**
 * Money Claim Thumbnail API
 *
 * GET /api/money-claim/thumbnail/[caseId]?document_type=...
 *
 * Generates a watermarked JPEG thumbnail of the first page of a money claim document
 * WITHOUT creating persistent database records. This allows preview thumbnails for
 * money claim flows where documents are only generated post-payment.
 *
 * Supports:
 * - England/Wales: form_n1, particulars_of_claim, schedule_of_arrears, interest_calculation,
 *   letter_before_claim, information_sheet, reply_form, financial_statement,
 *   filing_guide, enforcement_guide
 * - Scotland: form_3a, simple_procedure_particulars, schedule_of_arrears, interest_calculation,
 *   pre_action_letter, filing_guide, enforcement_guide
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
import { htmlToPreviewThumbnail, compileTemplate, loadTemplate } from '@/lib/documents/generator';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { deriveCanonicalJurisdiction, type CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { mapCaseFactsToMoneyClaimCase, mapCaseFactsToScotlandMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';
import { getArrearsScheduleData } from '@/lib/documents/arrears-schedule-mapper';

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
  console.error(`[Money-Claim-Thumbnail] ${code}:`, logData);
  return NextResponse.json({ error: message, code, ...(isDev ? { details } : {}) }, { status });
}

/**
 * Map config document ID to template document type
 */
function resolveDocumentType(configId: string): string | null {
  // Form N1 (England/Wales money claim form)
  if (configId === 'form-n1' || configId === 'form_n1' || configId === 'n1_claim') {
    return 'form_n1';
  }
  // Form 3A (Scotland simple procedure claim)
  if (configId === 'form-3a' || configId === 'form_3a' || configId === 'simple_procedure_claim') {
    return 'form_3a';
  }
  // Particulars of Claim
  if (configId === 'particulars-of-claim' || configId === 'particulars_of_claim') {
    return 'particulars_of_claim';
  }
  // Schedule of Arrears
  if (configId === 'schedule-of-arrears' || configId === 'schedule_of_arrears') {
    return 'schedule_of_arrears';
  }
  // Interest Calculation
  if (configId === 'interest-calculation' || configId === 'interest_calculation' || configId === 'interest_workings') {
    return 'interest_calculation';
  }
  // Letter Before Claim (England/Wales)
  if (configId === 'letter-before-claim' || configId === 'letter_before_claim') {
    return 'letter_before_claim';
  }
  // Pre-Action Letter (Scotland)
  if (configId === 'pre-action-letter' || configId === 'pre_action_letter') {
    return 'pre_action_letter';
  }
  // Defendant Information Sheet
  if (configId === 'information-sheet' || configId === 'information_sheet' || configId === 'information_sheet_for_defendants') {
    return 'information_sheet';
  }
  // Reply Form
  if (configId === 'reply-form' || configId === 'reply_form') {
    return 'reply_form';
  }
  // Financial Statement
  if (configId === 'financial-statement' || configId === 'financial_statement' || configId === 'financial_statement_form') {
    return 'financial_statement';
  }
  // Filing Guide
  if (configId === 'filing-guide' || configId === 'filing_guide') {
    return 'filing_guide';
  }
  // Enforcement Guide
  if (configId === 'enforcement-guide' || configId === 'enforcement_guide') {
    return 'enforcement_guide';
  }

  return null;
}

/**
 * Get template path for a document type
 */
function getTemplatePath(
  docType: string,
  jurisdiction: CanonicalJurisdiction
): string | null {
  // England templates
  if (jurisdiction === 'england') {
    const templates: Record<string, string> = {
      'form_n1': 'uk/england/templates/money_claims/n1_claim.hbs',
      'particulars_of_claim': 'uk/england/templates/money_claims/particulars_of_claim.hbs',
      'schedule_of_arrears': 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
      'interest_calculation': 'uk/england/templates/money_claims/interest_workings.hbs',
      'letter_before_claim': 'uk/england/templates/money_claims/letter_before_claim.hbs',
      'information_sheet': 'uk/england/templates/money_claims/information_sheet_for_defendants.hbs',
      'reply_form': 'uk/england/templates/money_claims/reply_form.hbs',
      'financial_statement': 'uk/england/templates/money_claims/financial_statement_form.hbs',
      'filing_guide': 'uk/england/templates/money_claims/filing_guide.hbs',
      'enforcement_guide': 'uk/england/templates/money_claims/enforcement_guide.hbs',
    };
    return templates[docType] || null;
  }

  // Wales templates (same structure as England)
  if (jurisdiction === 'wales') {
    const templates: Record<string, string> = {
      'form_n1': 'uk/wales/templates/money_claims/n1_claim.hbs',
      'particulars_of_claim': 'uk/wales/templates/money_claims/particulars_of_claim.hbs',
      'schedule_of_arrears': 'uk/wales/templates/money_claims/schedule_of_arrears.hbs',
      'interest_calculation': 'uk/wales/templates/money_claims/interest_workings.hbs',
      'letter_before_claim': 'uk/wales/templates/money_claims/letter_before_claim.hbs',
      'information_sheet': 'uk/wales/templates/money_claims/information_sheet_for_defendants.hbs',
      'reply_form': 'uk/wales/templates/money_claims/reply_form.hbs',
      'financial_statement': 'uk/wales/templates/money_claims/financial_statement_form.hbs',
      'filing_guide': 'uk/wales/templates/money_claims/filing_guide.hbs',
      'enforcement_guide': 'uk/wales/templates/money_claims/enforcement_guide.hbs',
    };
    return templates[docType] || null;
  }

  // Scotland templates
  if (jurisdiction === 'scotland') {
    const templates: Record<string, string> = {
      'form_3a': 'uk/scotland/templates/money_claims/simple_procedure_particulars.hbs',
      'particulars_of_claim': 'uk/scotland/templates/money_claims/simple_procedure_particulars.hbs',
      'schedule_of_arrears': 'uk/scotland/templates/money_claims/schedule_of_arrears.hbs',
      'interest_calculation': 'uk/scotland/templates/money_claims/interest_calculation.hbs',
      'pre_action_letter': 'uk/scotland/templates/money_claims/pre_action_letter.hbs',
      'letter_before_claim': 'uk/scotland/templates/money_claims/pre_action_letter.hbs', // Alias
      'filing_guide': 'uk/scotland/templates/money_claims/filing_guide_scotland.hbs',
      'enforcement_guide': 'uk/scotland/templates/money_claims/enforcement_guide_scotland.hbs',
    };
    return templates[docType] || null;
  }

  return null;
}

/**
 * Format date in UK legal format
 */
function formatUKDate(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
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

/**
 * Format currency in UK format
 */
function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '£0.00';
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

    console.log(`[Money-Claim-Thumbnail] Request:`, { caseId, documentType });

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
      console.error('[Money-Claim-Thumbnail] Case not found:', fetchError);
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404);
    }

    const caseRow = data as any;
    const wizardFacts = caseRow.wizard_facts || caseRow.collected_facts || caseRow.facts || {};

    // Determine jurisdiction
    const jurisdiction = deriveCanonicalJurisdiction(caseRow.jurisdiction, wizardFacts) as CanonicalJurisdiction;

    if (!jurisdiction) {
      return errorResponse('INVALID_JURISDICTION', 'Invalid or missing jurisdiction', 422);
    }

    if (jurisdiction === 'northern-ireland') {
      return errorResponse('NI_NOT_SUPPORTED', 'Northern Ireland not supported for money claims', 422);
    }

    // Resolve the document type from config ID
    const resolvedDocType = resolveDocumentType(documentType);
    if (!resolvedDocType) {
      return errorResponse('INVALID_DOCUMENT_TYPE', `Unknown document type: ${documentType}`, 400);
    }

    // Get template path
    const templatePath = getTemplatePath(resolvedDocType, jurisdiction);
    if (!templatePath) {
      return errorResponse('NO_TEMPLATE', `No template found for ${resolvedDocType} in ${jurisdiction}`, 400);
    }

    console.log(`[Money-Claim-Thumbnail] Generating:`, {
      docType: resolvedDocType,
      templatePath,
      jurisdiction,
    });

    // Convert wizard facts to case facts and then to money claim case
    const caseFacts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;
    const moneyClaimCase = jurisdiction === 'scotland'
      ? mapCaseFactsToScotlandMoneyClaimCase(caseFacts)
      : mapCaseFactsToMoneyClaimCase(caseFacts);

    // Build template data from money claim case
    const templateData: Record<string, any> = {
      ...moneyClaimCase,
      // Formatted dates
      tenancy_start_date_formatted: formatUKDate(moneyClaimCase.tenancy_start_date),
      tenancy_end_date_formatted: formatUKDate(moneyClaimCase.tenancy_end_date),
      signature_date_formatted: formatUKDate(moneyClaimCase.signature_date),
      interest_start_date_formatted: formatUKDate(moneyClaimCase.interest_start_date),
      generated_date: formatUKDate(new Date().toISOString().split('T')[0]),
      // Formatted currency
      rent_amount_formatted: formatCurrency(moneyClaimCase.rent_amount),
      arrears_total_formatted: formatCurrency(moneyClaimCase.arrears_total),
      court_fee_formatted: formatCurrency(moneyClaimCase.court_fee),
      solicitor_costs_formatted: formatCurrency(moneyClaimCase.solicitor_costs),
      // Convenience flags
      is_england: jurisdiction === 'england',
      is_wales: jurisdiction === 'wales',
      is_scotland: jurisdiction === 'scotland',
      has_interest: moneyClaimCase.claim_interest === true,
      has_arrears: (moneyClaimCase.arrears_total || 0) > 0,
      has_damages: (moneyClaimCase.damage_items || []).length > 0,
      has_other_charges: (moneyClaimCase.other_charges || []).length > 0,
      // Case reference
      case_reference: caseId,
      claimant_reference: moneyClaimCase.claimant_reference || caseId.slice(0, 8).toUpperCase(),
    };

    // Special handling for schedule of arrears
    if (resolvedDocType === 'schedule_of_arrears') {
      const arrearsItems = wizardFacts.arrears_items ||
        wizardFacts.issues?.rent_arrears?.arrears_items ||
        caseFacts.issues?.rent_arrears?.arrears_items || [];

      if (arrearsItems.length > 0) {
        const arrearsScheduleData = getArrearsScheduleData({
          arrears_items: arrearsItems,
          total_arrears: moneyClaimCase.arrears_total || null,
          rent_amount: moneyClaimCase.rent_amount || 0,
          rent_frequency: moneyClaimCase.rent_frequency || 'monthly',
          include_schedule: true,
        });
        templateData.arrears_schedule = arrearsScheduleData.arrears_schedule;
        templateData.arrears_total = arrearsScheduleData.arrears_total;
      }
    }

    // Special handling for interest calculation
    if (resolvedDocType === 'interest_calculation') {
      // Calculate interest if applicable
      if (moneyClaimCase.claim_interest && moneyClaimCase.arrears_total) {
        const rate = moneyClaimCase.interest_rate || 8; // Default statutory rate
        const dailyRate = rate / 365;
        const startDate = moneyClaimCase.interest_start_date
          ? new Date(moneyClaimCase.interest_start_date)
          : new Date();
        const today = new Date();
        const daysDiff = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const interestAmount = (moneyClaimCase.arrears_total * dailyRate * daysDiff) / 100;

        templateData.interest_rate = rate;
        templateData.daily_rate = dailyRate.toFixed(4);
        templateData.days_elapsed = daysDiff;
        templateData.interest_amount = interestAmount.toFixed(2);
        templateData.interest_amount_formatted = formatCurrency(interestAmount);
        templateData.total_with_interest = moneyClaimCase.arrears_total + interestAmount;
        templateData.total_with_interest_formatted = formatCurrency(moneyClaimCase.arrears_total + interestAmount);
      }
    }

    // Generate HTML content
    let html: string;
    try {
      const content = loadTemplate(templatePath);
      html = compileTemplate(content, templateData);
    } catch (templateError: any) {
      console.error('[Money-Claim-Thumbnail] Template error:', templateError);
      return errorResponse('TEMPLATE_ERROR', `Failed to compile template: ${templateError.message}`, 500);
    }

    // Generate thumbnail
    const thumbnail = await htmlToPreviewThumbnail(html, {
      quality: 75,
      watermarkText: 'PREVIEW',
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Money-Claim-Thumbnail] Success:`, {
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
