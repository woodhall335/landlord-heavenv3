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
      borderColor: rgb(0.45, 0.38, 0.7),
      backgroundColor: rgb(1, 1, 1),
      borderWidth: 0.7,
      textColor: rgb(0.05, 0.05, 0.08),
    });
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
      borderColor: rgb(0.45, 0.38, 0.7),
      backgroundColor: rgb(1, 1, 1),
      borderWidth: 0.7,
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
    { name: 'debtor.full_name', page: 0, x: 50, y: 120, width: 220, height: 22 },
    { name: 'debtor.address', page: 0, x: 50, y: 155, width: 480, height: 48, multiline: true },
    { name: 'debtor.postcode', page: 0, x: 315, y: 120, width: 110, height: 22 },
    { name: 'debtor.phone', page: 0, x: 50, y: 220, width: 180, height: 22 },
    { name: 'debtor.email', page: 0, x: 260, y: 220, width: 220, height: 22 },
    { name: 'response.payment_full_by_date', page: 0, x: 70, y: 315, width: 130, height: 20 },
    { name: 'response.payment_offer_amount', page: 0, x: 240, y: 315, width: 90, height: 20 },
    { name: 'response.payment_offer_frequency', page: 0, x: 355, y: 315, width: 115, height: 20 },
    { name: 'response.dispute_explanation', page: 0, x: 50, y: 380, width: 490, height: 72, multiline: true },
    { name: 'response.requested_documents', page: 0, x: 50, y: 485, width: 490, height: 58, multiline: true },
    { name: 'response.debt_advice_provider', page: 0, x: 50, y: 575, width: 220, height: 22 },
    { name: 'response.vulnerability_or_support_needs', page: 0, x: 50, y: 630, width: 490, height: 58, multiline: true },
    { name: 'signature.debtor_name', page: 0, x: 50, y: 740, width: 220, height: 22 },
    { name: 'signature.date', page: 0, x: 315, y: 740, width: 110, height: 22 },
  ]);

  addCheckboxes(pdf, [
    { name: 'response.i_owe_all_of_the_debt', page: 0, x: 52, y: 272 },
    { name: 'response.i_owe_some_of_the_debt', page: 0, x: 52, y: 292 },
    { name: 'response.i_do_not_owe_the_debt', page: 0, x: 52, y: 332 },
    { name: 'response.i_need_more_documents', page: 0, x: 52, y: 462 },
    { name: 'response.i_am_getting_debt_advice', page: 0, x: 52, y: 552 },
    { name: 'response.financial_statement_enclosed', page: 0, x: 52, y: 705 },
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
    { name: 'debtor.full_name', page: 0, x: 50, y: 120, width: 220, height: 22 },
    { name: 'debtor.address', page: 0, x: 50, y: 155, width: 480, height: 48, multiline: true },
    { name: 'debtor.household_dependants', page: 0, x: 315, y: 120, width: 160, height: 22 },
    { name: 'income.wages', page: 0, x: 380, y: 245, width: 90, height: 20 },
    { name: 'income.benefits', page: 0, x: 380, y: 272, width: 90, height: 20 },
    { name: 'income.other', page: 0, x: 380, y: 299, width: 90, height: 20 },
    { name: 'income.total', page: 0, x: 380, y: 326, width: 90, height: 20 },
    { name: 'outgoings.rent_or_mortgage', page: 0, x: 380, y: 390, width: 90, height: 20 },
    { name: 'outgoings.council_tax', page: 0, x: 380, y: 417, width: 90, height: 20 },
    { name: 'outgoings.utilities', page: 0, x: 380, y: 444, width: 90, height: 20 },
    { name: 'outgoings.food_travel_childcare', page: 0, x: 380, y: 471, width: 90, height: 20 },
    { name: 'outgoings.total', page: 0, x: 380, y: 498, width: 90, height: 20 },
    { name: 'priority_debts.details', page: 0, x: 50, y: 560, width: 490, height: 58, multiline: true },
    { name: 'creditors.details', page: 0, x: 50, y: 645, width: 490, height: 58, multiline: true },
    { name: 'payment_offer.amount', page: 0, x: 120, y: 730, width: 90, height: 20 },
    { name: 'payment_offer.frequency', page: 0, x: 240, y: 730, width: 110, height: 20 },
    { name: 'signature.debtor_name', page: 0, x: 50, y: 780, width: 220, height: 20 },
    { name: 'signature.date', page: 0, x: 315, y: 780, width: 110, height: 20 },
  ]);

  return finalize(pdf, font);
}
