import { NextResponse } from 'next/server';

import {
  generateDocument,
} from '@/lib/documents/generator';
import { buildMoneyClaimGenerationInput } from '@/lib/documents/money-claim-generation-facts';
import {
  assertMoneyClaimFinancialsReady,
  buildMoneyClaimFinancialTemplateData,
  calculateMoneyClaimFinancials,
} from '@/lib/documents/money-claim-financials';
import {
  makeFinancialStatementFillable,
  makeReplyFormFillable,
} from '@/lib/documents/money-claim-fillable-pap';
import { fillN1Form, type CaseData } from '@/lib/documents/official-forms-filler';
import { buildPdfEmbedHtml } from '@/lib/previews/documentEmbedShell';
import { applyPreviewLockToPdfBytes } from '@/lib/previews/preview-lock-rendering';
import { getPreviewCaseAccessDenial } from '@/lib/previews/case-preview-access';
import { assertPreviewAllowed } from '@/lib/payments/entitlement';
import { createAdminClient, tryGetServerUser } from '@/lib/supabase/server';
import { deriveCanonicalJurisdiction, type CanonicalJurisdiction } from '@/lib/types/jurisdiction';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  console.error(`[Money-Claim-Embed] ${code}:`, {
    code,
    message,
    status,
    ...details,
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json({ error: message, code }, { status });
}

function resolveDocumentType(configId: string): string | null {
  if (configId === 'form-n1' || configId === 'form_n1' || configId === 'n1_claim') {
    return 'form_n1';
  }
  if (configId === 'particulars-of-claim' || configId === 'particulars_of_claim') {
    return 'particulars_of_claim';
  }
  if (configId === 'schedule-of-arrears' || configId === 'schedule_of_arrears') {
    return 'schedule_of_arrears';
  }
  if (
    configId === 'interest-calculation' ||
    configId === 'interest_calculation' ||
    configId === 'interest_workings'
  ) {
    return 'interest_calculation';
  }
  if (configId === 'letter-before-claim' || configId === 'letter_before_claim') {
    return 'letter_before_claim';
  }
  if (
    configId === 'information-sheet' ||
    configId === 'information_sheet' ||
    configId === 'information_sheet_for_defendants'
  ) {
    return 'information_sheet';
  }
  if (configId === 'reply-form' || configId === 'reply_form') {
    return 'reply_form';
  }
  if (
    configId === 'financial-statement' ||
    configId === 'financial_statement' ||
    configId === 'financial_statement_form'
  ) {
    return 'financial_statement';
  }
  if (configId === 'filing-guide' || configId === 'filing_guide') {
    return 'filing_guide';
  }
  if (configId === 'enforcement-guide' || configId === 'enforcement_guide') {
    return 'enforcement_guide';
  }

  return null;
}

function getTemplatePath(docType: string): string | null {
  const templates: Record<string, string> = {
    particulars_of_claim: 'uk/england/templates/money_claims/particulars_of_claim.hbs',
    schedule_of_arrears: 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
    interest_calculation: 'uk/england/templates/money_claims/interest_workings.hbs',
    letter_before_claim: 'uk/england/templates/money_claims/letter_before_claim.hbs',
    information_sheet:
      'uk/england/templates/money_claims/information_sheet_for_defendants.hbs',
    reply_form: 'uk/england/templates/money_claims/reply_form.hbs',
    financial_statement:
      'uk/england/templates/money_claims/financial_statement_form.hbs',
    filing_guide: 'uk/england/templates/money_claims/filing_guide.hbs',
    enforcement_guide: 'uk/england/templates/money_claims/enforcement_guide.hbs',
  };
  return templates[docType] || null;
}

function getDocumentTitle(docType: string): string {
  const titles: Record<string, string> = {
    form_n1: 'Form N1 - Money Claim Form',
    particulars_of_claim: 'Particulars of claim',
    schedule_of_arrears: 'Schedule of arrears',
    interest_calculation: 'Interest calculation',
    letter_before_claim: 'Letter before claim',
    information_sheet: 'Information sheet for defendants',
    reply_form: 'Reply form',
    financial_statement: 'Financial statement',
    filing_guide: 'Court filing guide',
    enforcement_guide: 'Enforcement guide',
  };

  return titles[docType] || docType.replace(/_/g, ' ');
}

function formatUKDate(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate();
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '£0.00';
  return `£${amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const resolvedParams = await params;
  const caseId = resolvedParams.caseId;
  const url = new URL(request.url);
  const documentType = url.searchParams.get('document_type');

  if (!caseId) {
    return errorResponse('MISSING_CASE_ID', 'Case ID is required', 400);
  }

  if (!documentType) {
    return errorResponse(
      'MISSING_DOCUMENT_TYPE',
      'document_type query parameter is required',
      400
    );
  }

  try {
    const user = await tryGetServerUser();
    const supabase = createAdminClient();

    const { data, error: fetchError } = await supabase.from('cases').select('*').eq('id', caseId).single();
    if (fetchError || !data) {
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404, { caseId });
    }

    const caseRow = data as any;
    const accessDenied = getPreviewCaseAccessDenial(user, caseRow);
    if (accessDenied) {
      console.warn('[Money-Claim-Embed] UNAUTHORIZED_CASE_ACCESS:', {
        code: 'UNAUTHORIZED_CASE_ACCESS',
        caseId,
        reason: accessDenied,
        userId: user?.id || null,
        caseOwnerId: caseRow.user_id || null,
      });
      return errorResponse('CASE_NOT_FOUND', 'Case not found', 404, {
        caseId,
        reason: 'UNAUTHORIZED_CASE_ACCESS',
        accessDenied,
      });
    }

    const previewAccess = await assertPreviewAllowed({
      caseId,
      product: 'money_claim',
      userId: user?.id,
    });

    const wizardFacts = caseRow.wizard_facts || caseRow.collected_facts || caseRow.facts || {};
    const jurisdiction = deriveCanonicalJurisdiction(
      caseRow.jurisdiction,
      wizardFacts
    ) as CanonicalJurisdiction;

    if (!jurisdiction) {
      return errorResponse('INVALID_JURISDICTION', 'Invalid or missing jurisdiction', 422);
    }

    if (jurisdiction !== 'england') {
      return errorResponse(
        'JURISDICTION_NOT_SUPPORTED',
        `Money Claim full preview is only available for England. Received: "${jurisdiction}".`,
        422
      );
    }

    const resolvedDocType = resolveDocumentType(documentType);
    if (!resolvedDocType) {
      return errorResponse(
        'INVALID_DOCUMENT_TYPE',
        `Unknown document type: ${documentType}`,
        400
      );
    }

    const { moneyClaimCase } = buildMoneyClaimGenerationInput({
      facts: wizardFacts,
      caseId,
      jurisdiction,
    });
    const financials = calculateMoneyClaimFinancials(moneyClaimCase);
    assertMoneyClaimFinancialsReady(financials, 'money claim preview');

    let title = '';
    let html: string | null = null;

    if (resolvedDocType === 'form_n1') {
      const n1Data: CaseData = {
        jurisdiction: 'england',
        claim_type: 'money_claim',
        landlord_full_name: moneyClaimCase.landlord_full_name || '',
        landlord_2_name: moneyClaimCase.landlord_2_name,
        landlord_address: moneyClaimCase.landlord_address || '',
        landlord_postcode: moneyClaimCase.landlord_postcode,
        landlord_email: moneyClaimCase.landlord_email,
        landlord_phone: moneyClaimCase.landlord_phone,
        tenant_full_name: moneyClaimCase.tenant_full_name || '',
        tenant_2_name: moneyClaimCase.tenant_2_name,
        property_address: moneyClaimCase.property_address || '',
        property_postcode: moneyClaimCase.property_postcode,
        has_joint_defendants: moneyClaimCase.has_joint_defendants,
        tenant_2_address_line1: moneyClaimCase.tenant_2_address_line1,
        tenant_2_address_line2: moneyClaimCase.tenant_2_address_line2,
        tenant_2_postcode: moneyClaimCase.tenant_2_postcode,
        tenancy_start_date: moneyClaimCase.tenancy_start_date || '',
        rent_amount: moneyClaimCase.rent_amount || 0,
        rent_frequency: moneyClaimCase.rent_frequency || 'monthly',
        total_claim_amount: financials.total_claim_amount,
        court_fee: financials.court_fee,
        solicitor_costs: financials.solicitor_costs,
        court_name: moneyClaimCase.court_name,
        signatory_name:
          moneyClaimCase.signatory_name || moneyClaimCase.landlord_full_name || '',
        signature_date:
          moneyClaimCase.signature_date || new Date().toISOString().split('T')[0],
        service_postcode:
          moneyClaimCase.landlord_postcode || moneyClaimCase.property_postcode || '',
        damage_items: moneyClaimCase.damage_items,
        other_charges: moneyClaimCase.other_charges,
        claimant_reference: moneyClaimCase.claimant_reference,
        solicitor_firm: moneyClaimCase.solicitor_firm,
      };

      const pdfBytes = await fillN1Form(n1Data);
      const lockedPreview = await applyPreviewLockToPdfBytes(pdfBytes, {
        isPaid: previewAccess.isPaid,
      });
      title = 'Form N1 - Money Claim Form';
      html = buildPdfEmbedHtml(title, lockedPreview.pdfBytes);
    } else {
      const templatePath = getTemplatePath(resolvedDocType);
      if (!templatePath) {
        return errorResponse('NO_TEMPLATE', `No template found for ${resolvedDocType}`, 400);
      }

      const templateData: Record<string, any> = {
        ...moneyClaimCase,
        ...buildMoneyClaimFinancialTemplateData(moneyClaimCase, financials),
        tenancy_start_date_formatted: formatUKDate(moneyClaimCase.tenancy_start_date),
        tenancy_end_date_formatted: formatUKDate(moneyClaimCase.tenancy_end_date),
        signature_date_formatted: formatUKDate(moneyClaimCase.signature_date),
        interest_start_date_formatted: formatUKDate(moneyClaimCase.interest_start_date),
        generation_date: formatUKDate(new Date().toISOString().split('T')[0]),
        generated_date: formatUKDate(new Date().toISOString().split('T')[0]),
        rent_amount_formatted: formatCurrency(moneyClaimCase.rent_amount),
        arrears_total_formatted: formatCurrency(financials.arrears_total),
        damages_total_formatted: formatCurrency(financials.damages_total),
        other_total_formatted: formatCurrency(financials.other_total),
        total_claim_amount_formatted: formatCurrency(financials.total_claim_amount),
        court_fee_formatted: formatCurrency(financials.court_fee),
        solicitor_costs_formatted: formatCurrency(financials.solicitor_costs),
        is_england: true,
        has_interest: financials.claim_interest,
        has_arrears: financials.arrears_total > 0,
        has_damages: financials.damages_total > 0,
        has_other_charges: financials.other_total > 0,
        case_reference: caseId,
        claimant_reference:
          moneyClaimCase.claimant_reference || caseId.slice(0, 8).toUpperCase(),
      };

      const rendered = await generateDocument({
        templatePath,
        data: templateData,
        isPreview: true,
        outputFormat: 'both',
      });

      title = getDocumentTitle(resolvedDocType);
      if (!rendered.pdf) {
        return errorResponse(
          'PREVIEW_PDF_MISSING',
          'Could not generate the real PDF for this preview',
          500,
          { caseId, documentType: resolvedDocType }
        );
      }

      const previewPdf =
        resolvedDocType === 'reply_form'
          ? await makeReplyFormFillable(rendered.pdf, templateData)
          : resolvedDocType === 'financial_statement'
            ? await makeFinancialStatementFillable(rendered.pdf, templateData)
            : rendered.pdf;
      const lockedPreview = await applyPreviewLockToPdfBytes(previewPdf, {
        isPaid: previewAccess.isPaid,
      });

      html = buildPdfEmbedHtml(title, lockedPreview.pdfBytes);
    }

    if (!html) {
      return errorResponse(
        'PREVIEW_GENERATION_FAILED',
        'Could not generate completed preview',
        500,
        { caseId, documentType: resolvedDocType }
      );
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'X-Document-Type': resolvedDocType,
        'X-Preview-Is-Paid': String(previewAccess.isPaid),
        'X-Preview-Lock': 'smart-hybrid',
      },
    });
  } catch (error: any) {
    return errorResponse(
      'INTERNAL_ERROR',
      error?.message || 'Failed to generate completed preview',
      500,
      { caseId, documentType }
    );
  }
}
