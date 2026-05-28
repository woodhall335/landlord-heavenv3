import { PDFDocument, rgb, StandardFonts, type PDFPage, type PDFFont } from 'pdf-lib';

type PdfInput = Buffer | Uint8Array | ArrayBuffer;

interface FieldSpec {
  name: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  multiline?: boolean;
  fontSize?: number;
}

interface CheckboxSpec {
  name: string;
  page: number;
  x: number;
  y: number;
  size?: number;
}

function inputToBytes(input: PdfInput): Uint8Array {
  if (input instanceof Uint8Array) return input;
  return new Uint8Array(input);
}

async function loadOrCreatePdf(input: PdfInput, templateData: Record<string, any>) {
  try {
    return await PDFDocument.load(inputToBytes(input));
  } catch {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    page.drawText('Landlord Heaven PAP-DEBT response form', { x: 40, y: 790, size: 14, font });
    page.drawText(`Claimant: ${templateData.landlord_full_name || ''}`, { x: 40, y: 765, size: 10, font });
    page.drawText(`Reference: ${templateData.claimant_reference || templateData.case_id || ''}`, { x: 40, y: 750, size: 10, font });
    page.drawText(`Amount claimed: £${Number(templateData.total_claim_amount || 0).toFixed(2)}`, {
      x: 40,
      y: 735,
      size: 10,
      font,
    });
    return pdf;
  }
}

function pageAt(pdf: PDFDocument, index: number): PDFPage {
  const pages = pdf.getPages();
  return pages[Math.min(index, pages.length - 1)] || pdf.addPage([595.28, 841.89]);
}

function yFromTop(page: PDFPage, top: number): number {
  return page.getHeight() - top;
}

function addTextFields(pdf: PDFDocument, fields: FieldSpec[]) {
  const form = pdf.getForm();
  for (const field of fields) {
    const page = pageAt(pdf, field.page);
    const textField = form.createTextField(field.name);
    if (field.multiline) textField.enableMultiline();
    textField.addToPage(page, {
      x: field.x,
      y: yFromTop(page, field.y),
      width: field.width,
      height: field.height,
      borderColor: rgb(1, 1, 1),
      borderWidth: 0,
      textColor: rgb(0.05, 0.05, 0.08),
    });
    textField.setFontSize(field.fontSize ?? 10);
  }
}

function addCheckboxes(pdf: PDFDocument, fields: CheckboxSpec[]) {
  const form = pdf.getForm();
  for (const field of fields) {
    const page = pageAt(pdf, field.page);
    const checkbox = form.createCheckBox(field.name);
    const size = field.size ?? 12;
    checkbox.addToPage(page, {
      x: field.x,
      y: yFromTop(page, field.y),
      width: size,
      height: size,
      borderColor: rgb(0.05, 0.05, 0.08),
      borderWidth: 0.6,
    });
  }
}

async function finalize(pdf: PDFDocument, font: PDFFont) {
  pdf.getForm().updateFieldAppearances(font);
  return Buffer.from(await pdf.save());
}

export async function makeReplyFormFillable(
  pdfInput: PdfInput,
  templateData: Record<string, any>
): Promise<Buffer> {
  const pdf = await loadOrCreatePdf(pdfInput, templateData);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  addTextFields(pdf, [
    { name: 'debtor.full_name', page: 0, x: 282, y: 139, width: 245, height: 16 },
    { name: 'debtor.address', page: 0, x: 282, y: 174, width: 245, height: 50, multiline: true },
    { name: 'debtor.postcode', page: 0, x: 282, y: 244, width: 245, height: 16 },
    { name: 'debtor.phone', page: 0, x: 282, y: 279, width: 245, height: 16 },
    { name: 'debtor.email', page: 0, x: 282, y: 313, width: 245, height: 16 },
    { name: 'response.payment_full_by_date', page: 0, x: 337, y: 480, width: 105, height: 14 },
    { name: 'response.payment_weekly_amount', page: 0, x: 98, y: 592, width: 78, height: 14 },
    { name: 'response.payment_monthly_amount', page: 0, x: 98, y: 620, width: 78, height: 14 },
    { name: 'response.payment_offer_amount', page: 0, x: 126, y: 648, width: 70, height: 14 },
    { name: 'response.payment_offer_frequency', page: 0, x: 232, y: 648, width: 95, height: 14 },
  ]);

  addCheckboxes(pdf, [
    { name: 'response.i_owe_all_of_the_debt', page: 0, x: 50, y: 458, size: 10 },
    { name: 'response.i_need_payment_plan', page: 0, x: 50, y: 536, size: 10 },
    { name: 'response.payment_weekly_selected', page: 0, x: 198, y: 592, size: 10 },
    { name: 'response.payment_monthly_selected', page: 0, x: 198, y: 620, size: 10 },
    { name: 'response.payment_other_selected', page: 0, x: 345, y: 648, size: 10 },
    { name: 'response.financial_statement_enclosed', page: 0, x: 441, y: 683, size: 10 },
  ]);

  addTextFields(pdf, [
    { name: 'response.dispute_explanation', page: 1, x: 44, y: 250, width: 505, height: 84, multiline: true },
    { name: 'response.evidence_other', page: 1, x: 113, y: 467, width: 250, height: 14 },
    { name: 'response.requested_documents', page: 1, x: 44, y: 571, width: 505, height: 46, multiline: true },
    { name: 'response.vulnerability_or_support_needs', page: 1, x: 44, y: 724, width: 505, height: 46, multiline: true },
    { name: 'response.debt_advice_provider', page: 1, x: 222, y: 802, width: 260, height: 14 },
  ]);

  addCheckboxes(pdf, [
    { name: 'response.i_dispute_the_debt', page: 1, x: 50, y: 62, size: 10 },
    { name: 'response.dispute_paid_in_full', page: 1, x: 54, y: 155, size: 9 },
    { name: 'response.dispute_never_lived_there', page: 1, x: 54, y: 174, size: 9 },
    { name: 'response.dispute_amount_wrong', page: 1, x: 54, y: 192, size: 9 },
    { name: 'response.dispute_rent_lower', page: 1, x: 54, y: 211, size: 9 },
    { name: 'response.dispute_more_payments', page: 1, x: 54, y: 230, size: 9 },
    { name: 'response.evidence_bank_statements', page: 1, x: 54, y: 375, size: 9 },
    { name: 'response.evidence_receipts', page: 1, x: 54, y: 394, size: 9 },
    { name: 'response.evidence_tenancy_agreement', page: 1, x: 54, y: 413, size: 9 },
    { name: 'response.i_need_more_documents', page: 1, x: 50, y: 522, size: 10 },
    { name: 'response.i_am_vulnerable', page: 1, x: 50, y: 675, size: 10 },
  ]);

  addTextFields(pdf, [
    { name: 'signature.debtor_name', page: 2, x: 206, y: 123, width: 250, height: 16 },
    { name: 'signature.date', page: 2, x: 206, y: 162, width: 150, height: 16 },
  ]);

  return finalize(pdf, font);
}

export async function makeFinancialStatementFillable(
  pdfInput: PdfInput,
  templateData: Record<string, any>
): Promise<Buffer> {
  const pdf = await loadOrCreatePdf(pdfInput, templateData);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  addTextFields(pdf, [
    { name: 'debtor.full_name', page: 1, x: 282, y: 151, width: 245, height: 16 },
    { name: 'debtor.address', page: 1, x: 282, y: 186, width: 245, height: 34, multiline: true },
    { name: 'debtor.postcode', page: 1, x: 282, y: 238, width: 245, height: 16 },
    { name: 'debtor.date_of_birth', page: 1, x: 282, y: 272, width: 245, height: 16 },
    { name: 'debtor.household_dependants', page: 1, x: 282, y: 306, width: 245, height: 16 },
    { name: 'income.wages', page: 1, x: 391, y: 426, width: 115, height: 14 },
    { name: 'income.self_employment', page: 1, x: 391, y: 457, width: 115, height: 14 },
    { name: 'income.universal_credit', page: 1, x: 391, y: 488, width: 115, height: 14 },
    { name: 'income.child_benefit', page: 1, x: 391, y: 519, width: 115, height: 14 },
    { name: 'income.housing_benefit', page: 1, x: 391, y: 550, width: 115, height: 14 },
    { name: 'income.pension', page: 1, x: 391, y: 581, width: 115, height: 14 },
    { name: 'income.disability_benefit', page: 1, x: 391, y: 612, width: 115, height: 14 },
    { name: 'income.carers_allowance', page: 1, x: 391, y: 643, width: 115, height: 14 },
    { name: 'income.partner_income', page: 1, x: 391, y: 674, width: 115, height: 14 },
    { name: 'income.other_description', page: 1, x: 177, y: 705, width: 145, height: 14 },
    { name: 'income.other', page: 1, x: 391, y: 705, width: 115, height: 14 },
    { name: 'income.total', page: 1, x: 391, y: 736, width: 115, height: 14 },
  ]);

  addTextFields(pdf, [
    { name: 'outgoings.rent_or_mortgage', page: 2, x: 391, y: 114, width: 115, height: 14 },
    { name: 'outgoings.mortgage', page: 2, x: 391, y: 145, width: 115, height: 14 },
    { name: 'outgoings.council_tax', page: 2, x: 391, y: 176, width: 115, height: 14 },
    { name: 'outgoings.gas', page: 2, x: 391, y: 207, width: 115, height: 14 },
    { name: 'outgoings.electricity', page: 2, x: 391, y: 238, width: 115, height: 14 },
    { name: 'outgoings.water', page: 2, x: 391, y: 269, width: 115, height: 14 },
    { name: 'outgoings.insurance', page: 2, x: 391, y: 300, width: 115, height: 14 },
    { name: 'outgoings.food_groceries', page: 2, x: 391, y: 371, width: 115, height: 14 },
    { name: 'outgoings.toiletries_household', page: 2, x: 391, y: 402, width: 115, height: 14 },
    { name: 'outgoings.phone', page: 2, x: 391, y: 433, width: 115, height: 14 },
    { name: 'outgoings.internet_tv', page: 2, x: 391, y: 464, width: 115, height: 14 },
    { name: 'outgoings.clothing', page: 2, x: 391, y: 495, width: 115, height: 14 },
    { name: 'outgoings.car_insurance_tax_mot', page: 2, x: 391, y: 566, width: 115, height: 14 },
    { name: 'outgoings.fuel', page: 2, x: 391, y: 597, width: 115, height: 14 },
    { name: 'outgoings.public_transport', page: 2, x: 391, y: 628, width: 115, height: 14 },
    { name: 'outgoings.car_repairs', page: 2, x: 391, y: 659, width: 115, height: 14 },
    { name: 'outgoings.childcare', page: 2, x: 391, y: 730, width: 115, height: 14 },
    { name: 'outgoings.school_meals_uniforms', page: 2, x: 391, y: 761, width: 115, height: 14 },
    { name: 'outgoings.child_maintenance', page: 2, x: 391, y: 792, width: 115, height: 14 },
  ]);

  addTextFields(pdf, [
    { name: 'outgoings.prescriptions', page: 3, x: 391, y: 85, width: 115, height: 14 },
    { name: 'outgoings.dental_optical', page: 3, x: 391, y: 116, width: 115, height: 14 },
    { name: 'outgoings.other_medical', page: 3, x: 391, y: 147, width: 115, height: 14 },
    { name: 'outgoings.credit_cards', page: 3, x: 391, y: 218, width: 115, height: 14 },
    { name: 'outgoings.loan_repayments', page: 3, x: 391, y: 249, width: 115, height: 14 },
    { name: 'outgoings.other_debts_description', page: 3, x: 177, y: 280, width: 145, height: 14 },
    { name: 'outgoings.other_debts', page: 3, x: 391, y: 280, width: 115, height: 14 },
    { name: 'outgoings.other_essential_description', page: 3, x: 198, y: 311, width: 124, height: 14 },
    { name: 'outgoings.other_essential', page: 3, x: 391, y: 311, width: 115, height: 14 },
    { name: 'priority_debts.details', page: 3, x: 44, y: 335, width: 278, height: 34, multiline: true },
    { name: 'creditors.details', page: 3, x: 330, y: 335, width: 218, height: 34, multiline: true },
    { name: 'outgoings.total', page: 3, x: 391, y: 380, width: 115, height: 14 },
    { name: 'available_income.total_income', page: 3, x: 391, y: 488, width: 115, height: 14 },
    { name: 'available_income.total_outgoings', page: 3, x: 391, y: 519, width: 115, height: 14 },
    { name: 'available_income.net_available', page: 3, x: 391, y: 550, width: 115, height: 14 },
    { name: 'assets.property_mortgage_outstanding', page: 3, x: 212, y: 696, width: 80, height: 14 },
    { name: 'assets.property_value', page: 3, x: 391, y: 696, width: 115, height: 14 },
    { name: 'assets.savings_value', page: 3, x: 391, y: 727, width: 115, height: 14 },
    { name: 'assets.vehicle_value', page: 3, x: 391, y: 758, width: 115, height: 14 },
    { name: 'assets.other_description', page: 3, x: 177, y: 789, width: 145, height: 14 },
    { name: 'assets.other_value', page: 3, x: 391, y: 789, width: 115, height: 14 },
  ]);

  addCheckboxes(pdf, [
    { name: 'assets.property_owned_outright', page: 3, x: 151, y: 681, size: 9 },
    { name: 'assets.property_mortgaged', page: 3, x: 205, y: 681, size: 9 },
  ]);

  addTextFields(pdf, [
    { name: 'payment_offer.amount', page: 4, x: 381, y: 91, width: 70, height: 14 },
    { name: 'payment_offer.frequency', page: 4, x: 476, y: 91, width: 55, height: 14 },
    { name: 'payment_offer.start_date', page: 4, x: 381, y: 122, width: 140, height: 14 },
    { name: 'additional_information', page: 4, x: 44, y: 299, width: 505, height: 62, multiline: true },
    { name: 'signature.debtor_name', page: 4, x: 206, y: 480, width: 250, height: 16 },
    { name: 'signature.date', page: 4, x: 206, y: 518, width: 150, height: 16 },
  ]);

  addCheckboxes(pdf, [
    { name: 'payment_offer.current_rent_yes', page: 4, x: 381, y: 153, size: 10 },
    { name: 'payment_offer.current_rent_no', page: 4, x: 436, y: 153, size: 10 },
  ]);

  return finalize(pdf, font);
}
