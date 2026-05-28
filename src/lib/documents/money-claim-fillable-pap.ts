import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';

type PdfInput = Buffer | Uint8Array | ArrayBuffer;

const A4: [number, number] = [595.28, 841.89];
const INK = rgb(0.08, 0.08, 0.09);
const RULE = rgb(0.35, 0.35, 0.35);
const SHADE = rgb(0.94, 0.94, 0.94);

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
}

interface TextFieldOptions {
  multiline?: boolean;
  fontSize?: number;
  line?: boolean;
  border?: boolean;
}

function y(page: PDFPage, top: number): number {
  return page.getHeight() - top;
}

function fieldY(page: PDFPage, top: number, height: number): number {
  return page.getHeight() - top - height;
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  top: number,
  font: PDFFont,
  size = 10
) {
  page.drawText(text, { x, y: y(page, top), size, font, color: INK });
}

function drawRule(page: PDFPage, x: number, top: number, width: number) {
  page.drawLine({
    start: { x, y: y(page, top) },
    end: { x: x + width, y: y(page, top) },
    thickness: 0.7,
    color: RULE,
  });
}

function drawBox(page: PDFPage, x: number, top: number, width: number, height: number) {
  page.drawRectangle({
    x,
    y: fieldY(page, top, height),
    width,
    height,
    borderColor: RULE,
    borderWidth: 0.7,
  });
}

function drawSection(page: PDFPage, title: string, top: number, fonts: Fonts) {
  drawText(page, title, 42, top, fonts.bold, 13);
  drawRule(page, 42, top + 8, 512);
}

function drawWrapped(
  page: PDFPage,
  text: string,
  x: number,
  top: number,
  maxChars: number,
  font: PDFFont,
  size = 9,
  lineGap = 12
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);

  lines.forEach((line, index) => drawText(page, line, x, top + index * lineGap, font, size));
  return top + lines.length * lineGap;
}

function addTextField(
  pdf: PDFDocument,
  page: PDFPage,
  name: string,
  x: number,
  top: number,
  width: number,
  height: number,
  options: TextFieldOptions = {}
) {
  if (options.line) {
    drawRule(page, x, top + height - 2, width);
  } else if (options.border || options.multiline) {
    drawBox(page, x, top, width, height);
  }

  const field = pdf.getForm().createTextField(name);
  if (options.multiline) field.enableMultiline();
  field.addToPage(page, {
    x,
    y: fieldY(page, top, height),
    width,
    height,
    borderWidth: 0,
    textColor: INK,
  });
  field.setFontSize(options.fontSize ?? 10);
}

function addCheckbox(
  pdf: PDFDocument,
  page: PDFPage,
  name: string,
  x: number,
  top: number,
  label: string,
  fonts: Fonts,
  size = 10
) {
  const checkbox = pdf.getForm().createCheckBox(name);
  checkbox.addToPage(page, {
    x,
    y: fieldY(page, top, size),
    width: size,
    height: size,
    borderColor: INK,
    borderWidth: 0.8,
  });
  drawText(page, label, x + size + 7, top + 1, fonts.regular, 9.5);
}

function drawHeader(page: PDFPage, title: string, subtitle: string, fonts: Fonts) {
  const titleWidth = fonts.bold.widthOfTextAtSize(title, 16);
  drawText(page, title, (page.getWidth() - titleWidth) / 2, 42, fonts.bold, 16);
  const subtitleWidth = fonts.regular.widthOfTextAtSize(subtitle, 10);
  drawText(page, subtitle, (page.getWidth() - subtitleWidth) / 2, 62, fonts.regular, 10);
  drawRule(page, 42, 82, 512);
}

async function createPdf() {
  const pdf = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };
  return { pdf, fonts };
}

async function finalize(pdf: PDFDocument, font: PDFFont) {
  pdf.getForm().updateFieldAppearances(font);
  return Buffer.from(await pdf.save());
}

function money(value: unknown): string {
  const amount = Number(value || 0);
  return `\u00a3${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
}

function reference(templateData: Record<string, any>): string {
  return templateData.claimant_reference || templateData.case_id || '';
}

function drawReturnDetails(page: PDFPage, templateData: Record<string, any>, fonts: Fonts, top: number) {
  drawText(page, 'Return this form to:', 42, top, fonts.bold, 10);
  drawText(page, templateData.landlord_full_name || '', 42, top + 18, fonts.regular, 9.5);
  drawWrapped(page, templateData.landlord_address || '', 42, top + 33, 70, fonts.regular, 9.5);
  drawText(page, templateData.landlord_postcode || '', 42, top + 62, fonts.regular, 9.5);
  if (templateData.landlord_email) {
    drawText(page, `Email: ${templateData.landlord_email}`, 42, top + 78, fonts.regular, 9.5);
  }
}

export async function makeReplyFormFillable(
  pdfInput: PdfInput,
  templateData: Record<string, any>
): Promise<Buffer> {
  void pdfInput;
  const { pdf, fonts } = await createPdf();

  const page1 = pdf.addPage(A4);
  drawHeader(page1, 'Reply Form', 'Use this form to respond to the Letter Before Claim', fonts);

  drawSection(page1, 'Your Details', 106, fonts);
  const detailRows = [
    ['Your full name:', 'debtor.full_name'],
    ['Your address:', 'debtor.address'],
    ['Your postcode:', 'debtor.postcode'],
    ['Your telephone:', 'debtor.phone'],
    ['Your email:', 'debtor.email'],
  ] as const;
  let top = 136;
  for (const [label, name] of detailRows) {
    drawText(page1, label, 54, top + 11, fonts.bold, 10);
    const height = name === 'debtor.address' ? 44 : 18;
    addTextField(pdf, page1, name, 230, top, 292, height, {
      multiline: name === 'debtor.address',
      line: name !== 'debtor.address',
    });
    top += height + 16;
  }

  drawSection(page1, "Claimant's Details", top + 6, fonts);
  top += 36;
  drawText(page1, "Claimant's name:", 54, top, fonts.bold, 10);
  drawText(page1, templateData.landlord_full_name || '', 230, top, fonts.regular, 10);
  drawText(page1, 'Amount claimed:', 54, top + 22, fonts.bold, 10);
  drawText(page1, money(templateData.total_claim_amount), 230, top + 22, fonts.regular, 10);
  drawText(page1, 'Reference:', 54, top + 44, fonts.bold, 10);
  drawText(page1, reference(templateData), 230, top + 44, fonts.regular, 10);

  drawSection(page1, 'Your Response', top + 76, fonts);
  top += 105;
  drawText(page1, 'Please tick the option that applies.', 42, top, fonts.regular, 10);
  addCheckbox(pdf, page1, 'response.i_owe_all_of_the_debt', 48, top + 28, 'Option 1: I will pay the debt in full', fonts, 11);
  drawText(page1, 'I will pay in full by:', 76, top + 55, fonts.regular, 10);
  addTextField(pdf, page1, 'response.payment_full_by_date', 210, top + 41, 145, 18, { line: true });

  addCheckbox(pdf, page1, 'response.i_need_payment_plan', 48, top + 88, 'Option 2: I want to arrange a payment plan', fonts, 11);
  drawText(page1, 'I can afford to pay:', 76, top + 116, fonts.regular, 10);
  drawText(page1, '\u00a3', 212, top + 116, fonts.regular, 10);
  addTextField(pdf, page1, 'response.payment_weekly_amount', 226, top + 102, 72, 18, { line: true });
  addCheckbox(pdf, page1, 'response.payment_weekly_selected', 320, top + 107, 'per week', fonts, 10);
  drawText(page1, '\u00a3', 212, top + 144, fonts.regular, 10);
  addTextField(pdf, page1, 'response.payment_monthly_amount', 226, top + 130, 72, 18, { line: true });
  addCheckbox(pdf, page1, 'response.payment_monthly_selected', 320, top + 135, 'per month', fonts, 10);
  drawText(page1, 'Other:', 76, top + 172, fonts.regular, 10);
  drawText(page1, '\u00a3', 126, top + 172, fonts.regular, 10);
  addTextField(pdf, page1, 'response.payment_offer_amount', 140, top + 158, 65, 18, { line: true });
  drawText(page1, 'per', 218, top + 172, fonts.regular, 10);
  addTextField(pdf, page1, 'response.payment_offer_frequency', 244, top + 158, 92, 18, { line: true });
  addCheckbox(pdf, page1, 'response.payment_other_selected', 354, top + 163, '', fonts, 10);
  addCheckbox(pdf, page1, 'response.financial_statement_enclosed', 76, top + 202, 'Financial Statement Form enclosed', fonts, 10);

  const page2 = pdf.addPage(A4);
  drawHeader(page2, 'Reply Form', 'Dispute, documents and support needs', fonts);
  drawSection(page2, 'Dispute The Debt', 106, fonts);
  addCheckbox(pdf, page2, 'response.i_dispute_the_debt', 48, 136, 'Option 3: I dispute the debt', fonts, 11);
  const reasons = [
    ['response.dispute_paid_in_full', 'I have already paid this debt in full'],
    ['response.dispute_never_lived_there', 'I have never lived at this property'],
    ['response.dispute_amount_wrong', 'The amount claimed is incorrect'],
    ['response.dispute_rent_lower', 'The rent was lower than stated'],
    ['response.dispute_more_payments', 'I made more payments than the claimant has credited'],
    ['response.dispute_damage_not_me', 'The damage was not caused by me'],
    ['response.dispute_poor_condition', 'The property was in poor condition when I moved in'],
    ['response.dispute_statute_barred', 'The debt is too old'],
  ] as const;
  top = 170;
  for (const [name, label] of reasons) {
    addCheckbox(pdf, page2, name, 58, top, label, fonts, 9);
    top += 20;
  }
  drawText(page2, 'Full explanation:', 42, top + 12, fonts.bold, 10);
  addTextField(pdf, page2, 'response.dispute_explanation', 42, top + 28, 512, 86, {
    multiline: true,
  });

  drawSection(page2, 'Evidence Enclosed', top + 138, fonts);
  top += 168;
  const evidence = [
    ['response.evidence_bank_statements', 'Bank statements'],
    ['response.evidence_receipts', 'Receipts'],
    ['response.evidence_tenancy_agreement', 'Tenancy agreement'],
    ['response.evidence_inventory', 'Check-in report / inventory'],
    ['response.evidence_photographs', 'Photographs'],
    ['response.evidence_correspondence', 'Emails or letters'],
  ] as const;
  for (const [name, label] of evidence) {
    addCheckbox(pdf, page2, name, 58, top, label, fonts, 9);
    top += 19;
  }
  drawText(page2, 'Other:', 58, top + 2, fonts.regular, 9.5);
  addTextField(pdf, page2, 'response.evidence_other', 104, top - 12, 250, 18, { line: true });

  drawSection(page2, 'More Information Or Support', top + 36, fonts);
  top += 66;
  addCheckbox(pdf, page2, 'response.i_need_more_documents', 48, top, 'Option 4: I need more information or documents', fonts, 11);
  addTextField(pdf, page2, 'response.requested_documents', 42, top + 28, 512, 58, {
    multiline: true,
  });
  addCheckbox(pdf, page2, 'response.i_am_vulnerable', 48, top + 112, 'Option 5: I am in vulnerable circumstances', fonts, 11);
  addTextField(pdf, page2, 'response.vulnerability_or_support_needs', 42, top + 140, 512, 58, {
    multiline: true,
  });
  drawText(page2, 'I am seeking advice from:', 42, top + 228, fonts.regular, 10);
  addTextField(pdf, page2, 'response.debt_advice_provider', 190, top + 214, 300, 18, { line: true });

  const page3 = pdf.addPage(A4);
  drawHeader(page3, 'Reply Form', 'Declaration and return details', fonts);
  drawSection(page3, 'Declaration', 106, fonts);
  drawWrapped(
    page3,
    'I confirm that the information I have given on this form is true and complete to the best of my knowledge.',
    42,
    138,
    85,
    fonts.regular,
    10
  );
  drawText(page3, 'Your signature:', 42, 190, fonts.bold, 10);
  addTextField(pdf, page3, 'signature.debtor_name', 160, 176, 280, 18, { line: true });
  drawText(page3, 'Date:', 42, 222, fonts.bold, 10);
  addTextField(pdf, page3, 'signature.date', 160, 208, 145, 18, { line: true });
  drawReturnDetails(page3, templateData, fonts, 280);

  return finalize(pdf, fonts.regular);
}

function drawAmountRow(
  pdf: PDFDocument,
  page: PDFPage,
  label: string,
  name: string,
  top: number,
  fonts: Fonts,
  descriptionField?: string
) {
  drawText(page, label, 58, top, fonts.regular, 9.5);
  if (descriptionField) {
    addTextField(pdf, page, descriptionField, 205, top - 14, 118, 17, { line: true, fontSize: 9 });
  }
  drawText(page, '\u00a3', 388, top, fonts.regular, 9.5);
  addTextField(pdf, page, name, 405, top - 14, 95, 17, { line: true, fontSize: 9 });
}

export async function makeFinancialStatementFillable(
  pdfInput: PdfInput,
  templateData: Record<string, any>
): Promise<Buffer> {
  void pdfInput;
  const { pdf, fonts } = await createPdf();

  const cover = pdf.addPage(A4);
  drawHeader(cover, 'Financial Statement Form', 'Pre-Action Protocol for Debt Claims', fonts);
  drawWrapped(
    cover,
    'Use this form to show your income and outgoings if you want to propose a payment plan. Complete all sections honestly and return it with the Reply Form within 30 days.',
    84,
    150,
    68,
    fonts.regular,
    11,
    16
  );
  drawText(cover, `Claimant: ${templateData.landlord_full_name || ''}`, 84, 250, fonts.bold, 10);
  drawText(cover, `Amount claimed: ${money(templateData.total_claim_amount)}`, 84, 272, fonts.bold, 10);
  drawText(cover, `Reference: ${reference(templateData)}`, 84, 294, fonts.bold, 10);

  const page1 = pdf.addPage(A4);
  drawHeader(page1, 'Financial Statement Form', 'Your details and monthly income', fonts);
  drawSection(page1, 'Your Details', 106, fonts);
  const detailRows = [
    ['Your full name:', 'debtor.full_name'],
    ['Your address:', 'debtor.address'],
    ['Your postcode:', 'debtor.postcode'],
    ['Your date of birth:', 'debtor.date_of_birth'],
    ['Number of dependants:', 'debtor.household_dependants'],
  ] as const;
  let top = 136;
  for (const [label, name] of detailRows) {
    drawText(page1, label, 54, top + 11, fonts.bold, 10);
    const height = name === 'debtor.address' ? 36 : 18;
    addTextField(pdf, page1, name, 230, top, 292, height, {
      multiline: name === 'debtor.address',
      line: name !== 'debtor.address',
    });
    top += height + 14;
  }

  drawSection(page1, 'Section 1: Your Monthly Income', top + 8, fonts);
  top += 40;
  const incomeRows = [
    ['Wages / salary after tax', 'income.wages'],
    ['Self-employment income', 'income.self_employment'],
    ['Universal Credit', 'income.universal_credit'],
    ['Child Benefit / Child Tax Credit', 'income.child_benefit'],
    ['Housing Benefit / LHA', 'income.housing_benefit'],
    ['Pension', 'income.pension'],
    ['DLA / PIP', 'income.disability_benefit'],
    ["Carer's Allowance", 'income.carers_allowance'],
    ["Partner's income", 'income.partner_income'],
    ['Other income:', 'income.other', 'income.other_description'],
  ] as const;
  for (const row of incomeRows) {
    drawAmountRow(pdf, page1, row[0], row[1], top, fonts, row[2]);
    top += 26;
  }
  drawText(page1, 'Total monthly income:', 58, top + 8, fonts.bold, 10);
  page1.drawRectangle({ x: 48, y: fieldY(page1, top - 12, 30), width: 480, height: 30, color: SHADE });
  drawText(page1, '\u00a3', 388, top + 8, fonts.bold, 10);
  addTextField(pdf, page1, 'income.total', 405, top - 6, 95, 18, { line: true });

  const page2 = pdf.addPage(A4);
  drawHeader(page2, 'Financial Statement Form', 'Monthly outgoings', fonts);
  drawSection(page2, 'Section 2: Your Monthly Outgoings', 106, fonts);
  top = 142;
  drawText(page2, 'Housing costs', 42, top, fonts.bold, 11);
  top += 26;
  [
    ['Rent (current property)', 'outgoings.rent_or_mortgage'],
    ['Mortgage', 'outgoings.mortgage'],
    ['Council Tax', 'outgoings.council_tax'],
    ['Gas', 'outgoings.gas'],
    ['Electricity', 'outgoings.electricity'],
    ['Water', 'outgoings.water'],
    ['Buildings / contents insurance', 'outgoings.insurance'],
  ].forEach(([label, name]) => {
    drawAmountRow(pdf, page2, label, name, top, fonts);
    top += 24;
  });
  top += 12;
  drawText(page2, 'Household costs', 42, top, fonts.bold, 11);
  top += 26;
  [
    ['Food and groceries', 'outgoings.food_groceries'],
    ['Toiletries and household products', 'outgoings.toiletries_household'],
    ['Telephone / mobile phone', 'outgoings.phone'],
    ['Internet / TV licence', 'outgoings.internet_tv'],
    ['Clothing and footwear', 'outgoings.clothing'],
  ].forEach(([label, name]) => {
    drawAmountRow(pdf, page2, label, name, top, fonts);
    top += 24;
  });
  top += 12;
  drawText(page2, 'Travel and transport', 42, top, fonts.bold, 11);
  top += 26;
  [
    ['Car insurance / tax / MOT', 'outgoings.car_insurance_tax_mot'],
    ['Petrol / diesel', 'outgoings.fuel'],
    ['Public transport', 'outgoings.public_transport'],
    ['Car repairs / servicing', 'outgoings.car_repairs'],
  ].forEach(([label, name]) => {
    drawAmountRow(pdf, page2, label, name, top, fonts);
    top += 24;
  });

  const page3 = pdf.addPage(A4);
  drawHeader(page3, 'Financial Statement Form', 'More outgoings and assets', fonts);
  top = 112;
  drawText(page3, 'Childcare and education', 42, top, fonts.bold, 11);
  top += 26;
  [
    ['Childcare costs', 'outgoings.childcare'],
    ['School meals / uniforms', 'outgoings.school_meals_uniforms'],
    ['Child maintenance payments', 'outgoings.child_maintenance'],
  ].forEach(([label, name]) => {
    drawAmountRow(pdf, page3, label, name, top, fonts);
    top += 24;
  });
  top += 12;
  drawText(page3, 'Health and other regular payments', 42, top, fonts.bold, 11);
  top += 26;
  [
    ['Prescription charges', 'outgoings.prescriptions'],
    ['Dental / optical costs', 'outgoings.dental_optical'],
    ['Other medical costs', 'outgoings.other_medical'],
    ['Credit card minimum payments', 'outgoings.credit_cards'],
    ['Loan repayments', 'outgoings.loan_repayments'],
    ['Other debts:', 'outgoings.other_debts', 'outgoings.other_debts_description'],
    ['Other essential costs:', 'outgoings.other_essential', 'outgoings.other_essential_description'],
  ].forEach((row) => {
    drawAmountRow(pdf, page3, row[0], row[1], top, fonts, row[2]);
    top += 24;
  });
  drawText(page3, 'Total monthly outgoings:', 58, top + 12, fonts.bold, 10);
  drawText(page3, '\u00a3', 388, top + 12, fonts.bold, 10);
  addTextField(pdf, page3, 'outgoings.total', 405, top - 2, 95, 18, { line: true });

  drawSection(page3, 'Section 3: Available Income', top + 48, fonts);
  top += 82;
  drawAmountRow(pdf, page3, 'Total monthly income', 'available_income.total_income', top, fonts);
  drawAmountRow(pdf, page3, 'Total monthly outgoings', 'available_income.total_outgoings', top + 26, fonts);
  drawAmountRow(pdf, page3, 'Available income', 'available_income.net_available', top + 52, fonts);

  drawSection(page3, 'Priority Debts And Creditors', top + 96, fonts);
  drawText(page3, 'Priority debts:', 42, top + 126, fonts.bold, 10);
  addTextField(pdf, page3, 'priority_debts.details', 42, top + 142, 245, 58, { multiline: true });
  drawText(page3, 'Other creditors:', 310, top + 126, fonts.bold, 10);
  addTextField(pdf, page3, 'creditors.details', 310, top + 142, 245, 58, { multiline: true });

  const page4 = pdf.addPage(A4);
  drawHeader(page4, 'Financial Statement Form', 'Assets, offer and declaration', fonts);
  drawSection(page4, 'Section 4: Your Assets', 106, fonts);
  top = 142;
  addCheckbox(pdf, page4, 'assets.property_owned_outright', 58, top, 'Property owned outright', fonts, 10);
  addCheckbox(pdf, page4, 'assets.property_mortgaged', 230, top, 'Property mortgaged', fonts, 10);
  drawAmountRow(pdf, page4, 'Less mortgage outstanding', 'assets.property_mortgage_outstanding', top + 34, fonts);
  drawAmountRow(pdf, page4, 'Property estimated value', 'assets.property_value', top + 60, fonts);
  drawAmountRow(pdf, page4, 'Savings', 'assets.savings_value', top + 86, fonts);
  drawAmountRow(pdf, page4, 'Vehicles', 'assets.vehicle_value', top + 112, fonts);
  drawAmountRow(pdf, page4, 'Other assets:', 'assets.other_value', top + 138, fonts, 'assets.other_description');

  drawSection(page4, 'Section 5: Your Payment Offer', top + 184, fonts);
  top += 220;
  drawText(page4, 'I can afford to pay:', 58, top, fonts.regular, 10);
  drawText(page4, '\u00a3', 194, top, fonts.regular, 10);
  addTextField(pdf, page4, 'payment_offer.amount', 210, top - 14, 80, 18, { line: true });
  drawText(page4, 'per', 305, top, fonts.regular, 10);
  addTextField(pdf, page4, 'payment_offer.frequency', 332, top - 14, 95, 18, { line: true });
  drawText(page4, 'Starting from:', 58, top + 32, fonts.regular, 10);
  addTextField(pdf, page4, 'payment_offer.start_date', 210, top + 18, 150, 18, { line: true });
  addCheckbox(pdf, page4, 'payment_offer.current_rent_yes', 58, top + 66, 'I will continue to pay current rent in full: Yes', fonts, 10);
  addCheckbox(pdf, page4, 'payment_offer.current_rent_no', 330, top + 66, 'No', fonts, 10);

  drawSection(page4, 'Section 6: Additional Information', top + 108, fonts);
  addTextField(pdf, page4, 'additional_information', 42, top + 140, 512, 72, { multiline: true });
  drawSection(page4, 'Declaration', top + 238, fonts);
  drawWrapped(
    page4,
    'I confirm that the information I have given on this form is true and complete to the best of my knowledge.',
    42,
    top + 270,
    85,
    fonts.regular,
    10
  );
  drawText(page4, 'Your signature:', 42, top + 322, fonts.bold, 10);
  addTextField(pdf, page4, 'signature.debtor_name', 160, top + 308, 280, 18, { line: true });
  drawText(page4, 'Date:', 42, top + 354, fonts.bold, 10);
  addTextField(pdf, page4, 'signature.date', 160, top + 340, 145, 18, { line: true });

  return finalize(pdf, fonts.regular);
}
