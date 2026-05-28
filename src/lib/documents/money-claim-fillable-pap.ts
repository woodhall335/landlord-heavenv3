import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';

type PdfInput = Buffer | Uint8Array | ArrayBuffer;

const A4: [number, number] = [595.28, 841.89];
const MARGIN_X = 42;
const CONTENT_WIDTH = 511;
const INK = rgb(0.1, 0.1, 0.1);
const RULE = rgb(0.35, 0.35, 0.35);
const LIGHT_RULE = rgb(0.72, 0.72, 0.72);
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

interface KnownValueOptions {
  multiline?: boolean;
  fieldName?: string;
}

function y(page: PDFPage, top: number): number {
  return page.getHeight() - top;
}

function fieldY(page: PDFPage, top: number, height: number): number {
  return page.getHeight() - top - height;
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = textValue(value);
    if (text) return text;
  }
  return '';
}

function tenantAddress(data: Record<string, any>): string {
  return firstText(
    data.tenant_address,
    data.defendant_address,
    data.service_address,
    [data.property_address, data.property_postcode].filter(Boolean).join('\n')
  );
}

function tenantName(data: Record<string, any>): string {
  return firstText(data.tenant_full_name, data.defendant_name, data.debtor_name);
}

function tenantPostcode(data: Record<string, any>): string {
  return firstText(data.tenant_postcode, data.defendant_postcode, data.property_postcode);
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  top: number,
  font: PDFFont,
  size = 10
) {
  if (!text) return;
  page.drawText(text, { x, y: y(page, top), size, font, color: INK });
}

function drawRule(page: PDFPage, x: number, top: number, width: number, color = RULE) {
  page.drawLine({
    start: { x, y: y(page, top) },
    end: { x: x + width, y: y(page, top) },
    thickness: 0.7,
    color,
  });
}

function drawVerticalRule(page: PDFPage, x: number, top: number, height: number, color = LIGHT_RULE) {
  page.drawLine({
    start: { x, y: y(page, top) },
    end: { x, y: y(page, top + height) },
    thickness: 0.7,
    color,
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

function drawWrapped(
  page: PDFPage,
  text: string,
  x: number,
  top: number,
  maxWidth: number,
  font: PDFFont,
  size = 9.5,
  lineGap = 12
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);

  lines.forEach((line, index) => drawText(page, line, x, top + index * lineGap, font, size));
  return top + Math.max(lines.length, 1) * lineGap;
}

function drawTitle(page: PDFPage, title: string, subtitle: string, fonts: Fonts) {
  const titleWidth = fonts.bold.widthOfTextAtSize(title, 16);
  drawText(page, title, (page.getWidth() - titleWidth) / 2, 42, fonts.bold, 16);
  const subtitleWidth = fonts.regular.widthOfTextAtSize(subtitle, 10);
  drawText(page, subtitle, (page.getWidth() - subtitleWidth) / 2, 64, fonts.regular, 10);
  drawRule(page, MARGIN_X, 84, CONTENT_WIDTH);
}

function drawHeading(page: PDFPage, title: string, top: number, fonts: Fonts) {
  drawText(page, title.toUpperCase(), MARGIN_X, top, fonts.bold, 12);
  drawRule(page, MARGIN_X, top + 8, CONTENT_WIDTH);
}

function drawTableFrame(
  page: PDFPage,
  x: number,
  top: number,
  width: number,
  height: number,
  shadedLabelWidth?: number
) {
  drawBox(page, x, top, width, height);
  if (shadedLabelWidth) {
    page.drawRectangle({
      x,
      y: fieldY(page, top, height),
      width: shadedLabelWidth,
      height,
      color: SHADE,
    });
    drawBox(page, x, top, width, height);
    drawVerticalRule(page, x + shadedLabelWidth, top, height);
  }
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
    drawRule(page, x, top + height - 3, width, LIGHT_RULE);
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
  field.setFontSize(options.fontSize ?? 9.5);
}

function drawKnownOrField(
  pdf: PDFDocument,
  page: PDFPage,
  value: string,
  x: number,
  top: number,
  width: number,
  height: number,
  fonts: Fonts,
  options: KnownValueOptions = {}
) {
  if (value) {
    if (options.multiline) {
      drawWrapped(page, value.replace(/\n/g, ' '), x, top + 11, width - 8, fonts.regular, 9.5);
    } else {
      drawText(page, value, x, top + 12, fonts.regular, 9.5);
    }
    return;
  }

  if (options.fieldName) {
    addTextField(pdf, page, options.fieldName, x, top + 2, width, height - 4, {
      line: !options.multiline,
      multiline: options.multiline,
      fontSize: 9.5,
    });
  }
}

function drawInfoRow(
  pdf: PDFDocument,
  page: PDFPage,
  label: string,
  value: string,
  fieldName: string | undefined,
  top: number,
  fonts: Fonts,
  options: { height?: number; multiline?: boolean } = {}
) {
  const height = options.height ?? 31;
  drawTableFrame(page, MARGIN_X, top, CONTENT_WIDTH, height, 180);
  drawText(page, label, MARGIN_X + 10, top + 19, fonts.bold, 9.5);
  drawKnownOrField(pdf, page, value, MARGIN_X + 196, top + 2, 285, height - 4, fonts, {
    fieldName,
    multiline: options.multiline,
  });
  return top + height;
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
  drawWrapped(page, label, x + size + 8, top + 1, 440, fonts.regular, 9.5, 11);
}

function drawAmountField(
  pdf: PDFDocument,
  page: PDFPage,
  label: string,
  name: string,
  top: number,
  fonts: Fonts,
  descriptionField?: string
) {
  drawText(page, label, 58, top + 13, fonts.regular, 9.3);
  if (descriptionField) {
    addTextField(pdf, page, descriptionField, 205, top + 1, 118, 18, { line: true, fontSize: 9 });
  }
  drawText(page, '\u00a3', 390, top + 13, fonts.regular, 9.3);
  addTextField(pdf, page, name, 407, top + 1, 95, 18, { line: true, fontSize: 9 });
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
  return firstText(
    templateData.claimant_reference,
    templateData.case_reference,
    templateData.case_id,
    templateData.document_id
  );
}

function responseDeadline(templateData: Record<string, any>): string {
  return firstText(templateData.response_deadline, templateData.lba_response_deadline);
}

function drawReturnDetails(page: PDFPage, templateData: Record<string, any>, fonts: Fonts, top: number) {
  drawHeading(page, 'Where to send this form', top, fonts);
  let cursor = top + 28;
  cursor = drawInfoRow(
    {} as PDFDocument,
    page,
    'Return to',
    firstText(templateData.landlord_full_name, templateData.solicitor_firm),
    undefined,
    cursor,
    fonts
  );
  cursor = drawInfoRow(
    {} as PDFDocument,
    page,
    'Address',
    firstText(templateData.solicitor_address, templateData.landlord_address),
    undefined,
    cursor,
    fonts,
    { height: 48, multiline: true }
  );
  cursor = drawInfoRow(
    {} as PDFDocument,
    page,
    'Postcode / email',
    [templateData.landlord_postcode, templateData.landlord_email].filter(Boolean).join(' / '),
    undefined,
    cursor,
    fonts
  );
  drawWrapped(
    page,
    'Return the completed form within 30 days of the Letter Before Claim, unless a different date is shown above.',
    MARGIN_X,
    cursor + 18,
    CONTENT_WIDTH,
    fonts.regular,
    9.5
  );
}

export async function makeReplyFormFillable(
  pdfInput: PdfInput,
  templateData: Record<string, any>
): Promise<Buffer> {
  void pdfInput;
  const { pdf, fonts } = await createPdf();

  const page1 = pdf.addPage(A4);
  drawTitle(page1, 'Reply Form', 'Pre-Action Protocol for Debt Claims', fonts);
  drawWrapped(
    page1,
    'This form is for the tenant or debtor to reply to the Letter Before Claim. The case details already provided by the landlord are shown below.',
    MARGIN_X,
    108,
    CONTENT_WIDTH,
    fonts.regular,
    9.8
  );

  drawHeading(page1, 'Case details', 150, fonts);
  let top = 178;
  top = drawInfoRow(pdf, page1, 'Tenant / debtor', tenantName(templateData), 'debtor.full_name', top, fonts);
  top = drawInfoRow(pdf, page1, 'Address', tenantAddress(templateData), 'debtor.address', top, fonts, {
    height: 48,
    multiline: true,
  });
  top = drawInfoRow(pdf, page1, 'Postcode', tenantPostcode(templateData), 'debtor.postcode', top, fonts);
  top = drawInfoRow(
    pdf,
    page1,
    'Telephone',
    firstText(templateData.tenant_phone, templateData.defendant_phone),
    'debtor.phone',
    top,
    fonts
  );
  top = drawInfoRow(
    pdf,
    page1,
    'Email',
    firstText(templateData.tenant_email, templateData.defendant_email),
    'debtor.email',
    top,
    fonts
  );

  drawHeading(page1, "Claimant's details", top + 22, fonts);
  top += 50;
  top = drawInfoRow(pdf, page1, "Claimant's name", firstText(templateData.landlord_full_name), undefined, top, fonts);
  top = drawInfoRow(pdf, page1, 'Amount claimed', money(templateData.total_claim_amount), undefined, top, fonts);
  top = drawInfoRow(pdf, page1, 'Letter date', firstText(templateData.generation_date), undefined, top, fonts);
  top = drawInfoRow(pdf, page1, 'Reply deadline', responseDeadline(templateData), undefined, top, fonts);
  top = drawInfoRow(pdf, page1, 'Reference', reference(templateData), undefined, top, fonts);

  drawHeading(page1, 'Your response', top + 24, fonts);
  top += 54;
  drawText(page1, 'Tick the option that applies.', MARGIN_X, top, fonts.bold, 10);
  addCheckbox(pdf, page1, 'response.i_owe_all_of_the_debt', 52, top + 28, 'Option 1: I agree I owe the full amount and will pay in full.', fonts, 11);
  drawText(page1, 'I will pay in full by:', 80, top + 59, fonts.regular, 9.5);
  addTextField(pdf, page1, 'response.payment_full_by_date', 210, top + 45, 145, 18, { line: true });

  addCheckbox(pdf, page1, 'response.i_need_payment_plan', 52, top + 90, 'Option 2: I agree I owe the money but need a payment plan.', fonts, 11);
  drawText(page1, 'I can afford to pay:', 80, top + 122, fonts.regular, 9.5);
  drawText(page1, '\u00a3', 210, top + 122, fonts.regular, 9.5);
  addTextField(pdf, page1, 'response.payment_weekly_amount', 226, top + 108, 70, 18, { line: true });
  addCheckbox(pdf, page1, 'response.payment_weekly_selected', 320, top + 113, 'per week', fonts, 10);
  drawText(page1, '\u00a3', 210, top + 150, fonts.regular, 9.5);
  addTextField(pdf, page1, 'response.payment_monthly_amount', 226, top + 136, 70, 18, { line: true });
  addCheckbox(pdf, page1, 'response.payment_monthly_selected', 320, top + 141, 'per month', fonts, 10);
  drawText(page1, 'Other:', 80, top + 178, fonts.regular, 9.5);
  drawText(page1, '\u00a3', 130, top + 178, fonts.regular, 9.5);
  addTextField(pdf, page1, 'response.payment_offer_amount', 146, top + 164, 70, 18, { line: true });
  drawText(page1, 'per', 230, top + 178, fonts.regular, 9.5);
  addTextField(pdf, page1, 'response.payment_offer_frequency', 260, top + 164, 95, 18, { line: true });
  addCheckbox(pdf, page1, 'response.payment_other_selected', 378, top + 169, '', fonts, 10);
  addCheckbox(pdf, page1, 'response.financial_statement_enclosed', 80, top + 206, 'I have enclosed a Financial Statement Form.', fonts, 10);

  const page2 = pdf.addPage(A4);
  drawTitle(page2, 'Reply Form', 'Dispute, documents and support needs', fonts);
  drawHeading(page2, 'If you dispute the debt', 108, fonts);
  addCheckbox(pdf, page2, 'response.i_dispute_the_debt', 52, 138, 'Option 3: I dispute the debt or the amount claimed.', fonts, 11);
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
  top = 174;
  for (const [name, label] of reasons) {
    addCheckbox(pdf, page2, name, 62, top, label, fonts, 9);
    top += 20;
  }
  drawText(page2, 'Full explanation:', MARGIN_X, top + 13, fonts.bold, 10);
  addTextField(pdf, page2, 'response.dispute_explanation', MARGIN_X, top + 30, CONTENT_WIDTH, 86, {
    multiline: true,
  });

  drawHeading(page2, 'Evidence enclosed', top + 142, fonts);
  top += 172;
  const evidence = [
    ['response.evidence_bank_statements', 'Bank statements'],
    ['response.evidence_receipts', 'Receipts'],
    ['response.evidence_tenancy_agreement', 'Tenancy agreement'],
    ['response.evidence_inventory', 'Check-in report / inventory'],
    ['response.evidence_photographs', 'Photographs'],
    ['response.evidence_correspondence', 'Emails or letters'],
  ] as const;
  for (const [name, label] of evidence) {
    addCheckbox(pdf, page2, name, 62, top, label, fonts, 9);
    top += 19;
  }
  drawText(page2, 'Other:', 62, top + 2, fonts.regular, 9.5);
  addTextField(pdf, page2, 'response.evidence_other', 106, top - 12, 260, 18, { line: true });

  drawHeading(page2, 'More information or support', top + 36, fonts);
  top += 66;
  addCheckbox(pdf, page2, 'response.i_need_more_documents', 52, top, 'Option 4: I need more information or documents before I can respond.', fonts, 11);
  addTextField(pdf, page2, 'response.requested_documents', MARGIN_X, top + 30, CONTENT_WIDTH, 56, {
    multiline: true,
  });
  addCheckbox(pdf, page2, 'response.i_am_vulnerable', 52, top + 112, 'Option 5: I need extra time or support because of my circumstances.', fonts, 11);
  addTextField(pdf, page2, 'response.vulnerability_or_support_needs', MARGIN_X, top + 142, CONTENT_WIDTH, 56, {
    multiline: true,
  });
  drawText(page2, 'I am seeking advice from:', MARGIN_X, top + 230, fonts.regular, 9.5);
  addTextField(pdf, page2, 'response.debt_advice_provider', 190, top + 216, 300, 18, { line: true });

  const page3 = pdf.addPage(A4);
  drawTitle(page3, 'Reply Form', 'Declaration and return details', fonts);
  drawHeading(page3, 'Declaration', 108, fonts);
  drawWrapped(
    page3,
    'I confirm that the information I have given on this form is true and complete to the best of my knowledge.',
    MARGIN_X,
    140,
    CONTENT_WIDTH,
    fonts.regular,
    10
  );
  drawText(page3, 'Signature:', MARGIN_X, 196, fonts.bold, 10);
  addTextField(pdf, page3, 'signature.debtor_signature', 150, 181, 300, 20, { line: true });
  drawText(page3, 'Name:', MARGIN_X, 230, fonts.bold, 10);
  drawKnownOrField(pdf, page3, tenantName(templateData), 150, 216, 300, 20, fonts, {
    fieldName: 'signature.debtor_name',
  });
  drawText(page3, 'Date:', MARGIN_X, 264, fonts.bold, 10);
  addTextField(pdf, page3, 'signature.date', 150, 249, 145, 20, { line: true });
  drawReturnDetails(page3, templateData, fonts, 320);

  return finalize(pdf, fonts.regular);
}

export async function makeFinancialStatementFillable(
  pdfInput: PdfInput,
  templateData: Record<string, any>
): Promise<Buffer> {
  void pdfInput;
  const { pdf, fonts } = await createPdf();

  const cover = pdf.addPage(A4);
  drawTitle(cover, 'Financial Statement Form', 'Pre-Action Protocol for Debt Claims', fonts);
  drawWrapped(
    cover,
    'Use this form to show income and outgoings if you want to propose a payment plan. The claim details already provided by the landlord are shown below.',
    74,
    150,
    450,
    fonts.regular,
    11,
    15
  );
  let top = 244;
  top = drawInfoRow({} as PDFDocument, cover, 'Tenant / debtor', tenantName(templateData), undefined, top, fonts);
  top = drawInfoRow({} as PDFDocument, cover, 'Property / address', tenantAddress(templateData), undefined, top, fonts, {
    height: 48,
    multiline: true,
  });
  top = drawInfoRow({} as PDFDocument, cover, 'Claimant', firstText(templateData.landlord_full_name), undefined, top, fonts);
  top = drawInfoRow({} as PDFDocument, cover, 'Amount claimed', money(templateData.total_claim_amount), undefined, top, fonts);
  top = drawInfoRow({} as PDFDocument, cover, 'Reference', reference(templateData), undefined, top, fonts);
  drawWrapped(
    cover,
    'Complete the sections that apply to your circumstances and return this form with the Reply Form within 30 days. This is focused on whether a payment plan is realistic.',
    74,
    top + 34,
    450,
    fonts.regular,
    10
  );

  const page1 = pdf.addPage(A4);
  drawTitle(page1, 'Financial Statement Form', 'Your details and monthly income', fonts);
  drawHeading(page1, 'Your details', 108, fonts);
  top = 136;
  top = drawInfoRow(pdf, page1, 'Full name', tenantName(templateData), 'debtor.full_name', top, fonts);
  top = drawInfoRow(pdf, page1, 'Address', tenantAddress(templateData), 'debtor.address', top, fonts, {
    height: 48,
    multiline: true,
  });
  top = drawInfoRow(pdf, page1, 'Postcode', tenantPostcode(templateData), 'debtor.postcode', top, fonts);
  top = drawInfoRow(pdf, page1, 'Date of birth', '', 'debtor.date_of_birth', top, fonts);
  top = drawInfoRow(pdf, page1, 'Number of dependants', '', 'debtor.household_dependants', top, fonts);

  drawHeading(page1, 'Section 1: monthly income', top + 22, fonts);
  top += 54;
  drawWrapped(page1, 'List regular income after tax and deductions.', MARGIN_X, top, CONTENT_WIDTH, fonts.regular, 9.5);
  top += 26;
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
    drawAmountField(pdf, page1, row[0], row[1], top, fonts, row[2]);
    top += 25;
  }
  page1.drawRectangle({ x: 48, y: fieldY(page1, top + 2, 30), width: 480, height: 30, color: SHADE });
  drawText(page1, 'Total monthly income:', 58, top + 22, fonts.bold, 10);
  drawText(page1, '\u00a3', 390, top + 22, fonts.bold, 10);
  addTextField(pdf, page1, 'income.total', 407, top + 8, 95, 18, { line: true });

  const page2 = pdf.addPage(A4);
  drawTitle(page2, 'Financial Statement Form', 'Monthly outgoings', fonts);
  drawHeading(page2, 'Section 2: monthly outgoings', 108, fonts);
  top = 142;
  drawText(page2, 'Housing costs', MARGIN_X, top, fonts.bold, 11);
  top += 25;
  [
    ['Current rent or housing payment', 'outgoings.rent_or_mortgage'],
    ['Council Tax', 'outgoings.council_tax'],
    ['Gas', 'outgoings.gas'],
    ['Electricity', 'outgoings.electricity'],
    ['Water', 'outgoings.water'],
    ['Buildings / contents insurance', 'outgoings.insurance'],
  ].forEach(([label, name]) => {
    drawAmountField(pdf, page2, label, name, top, fonts);
    top += 24;
  });
  top += 12;
  drawText(page2, 'Household costs', MARGIN_X, top, fonts.bold, 11);
  top += 25;
  [
    ['Food and groceries', 'outgoings.food_groceries'],
    ['Toiletries and household products', 'outgoings.toiletries_household'],
    ['Telephone / mobile phone', 'outgoings.phone'],
    ['Internet / TV licence', 'outgoings.internet_tv'],
    ['Clothing and footwear', 'outgoings.clothing'],
  ].forEach(([label, name]) => {
    drawAmountField(pdf, page2, label, name, top, fonts);
    top += 24;
  });
  top += 12;
  drawText(page2, 'Travel and transport', MARGIN_X, top, fonts.bold, 11);
  top += 25;
  [
    ['Car insurance / tax / MOT', 'outgoings.car_insurance_tax_mot'],
    ['Petrol / diesel', 'outgoings.fuel'],
    ['Public transport', 'outgoings.public_transport'],
    ['Car repairs / servicing', 'outgoings.car_repairs'],
  ].forEach(([label, name]) => {
    drawAmountField(pdf, page2, label, name, top, fonts);
    top += 24;
  });

  const page3 = pdf.addPage(A4);
  drawTitle(page3, 'Financial Statement Form', 'More outgoings and available income', fonts);
  top = 112;
  drawText(page3, 'Childcare and education', MARGIN_X, top, fonts.bold, 11);
  top += 25;
  [
    ['Childcare costs', 'outgoings.childcare'],
    ['School meals / uniforms', 'outgoings.school_meals_uniforms'],
    ['Child maintenance payments', 'outgoings.child_maintenance'],
  ].forEach(([label, name]) => {
    drawAmountField(pdf, page3, label, name, top, fonts);
    top += 24;
  });
  top += 12;
  drawText(page3, 'Health and other regular payments', MARGIN_X, top, fonts.bold, 11);
  top += 25;
  [
    ['Prescription charges', 'outgoings.prescriptions'],
    ['Dental / optical costs', 'outgoings.dental_optical'],
    ['Other medical costs', 'outgoings.other_medical'],
    ['Credit card minimum payments', 'outgoings.credit_cards'],
    ['Loan repayments', 'outgoings.loan_repayments'],
    ['Other debts:', 'outgoings.other_debts', 'outgoings.other_debts_description'],
    ['Other essential costs:', 'outgoings.other_essential', 'outgoings.other_essential_description'],
  ].forEach((row) => {
    drawAmountField(pdf, page3, row[0], row[1], top, fonts, row[2]);
    top += 24;
  });
  page3.drawRectangle({ x: 48, y: fieldY(page3, top + 6, 30), width: 480, height: 30, color: SHADE });
  drawText(page3, 'Total monthly outgoings:', 58, top + 26, fonts.bold, 10);
  drawText(page3, '\u00a3', 390, top + 26, fonts.bold, 10);
  addTextField(pdf, page3, 'outgoings.total', 407, top + 12, 95, 18, { line: true });

  drawHeading(page3, 'Section 3: available income', top + 58, fonts);
  top += 90;
  drawAmountField(pdf, page3, 'Total monthly income', 'available_income.total_income', top, fonts);
  drawAmountField(pdf, page3, 'Total monthly outgoings', 'available_income.total_outgoings', top + 26, fonts);
  drawAmountField(pdf, page3, 'Available income', 'available_income.net_available', top + 52, fonts);

  drawHeading(page3, 'Priority debts and creditors', top + 98, fonts);
  drawText(page3, 'Priority debts:', MARGIN_X, top + 130, fonts.bold, 10);
  addTextField(pdf, page3, 'priority_debts.details', MARGIN_X, top + 148, 245, 58, { multiline: true });
  drawText(page3, 'Other creditors:', 310, top + 130, fonts.bold, 10);
  addTextField(pdf, page3, 'creditors.details', 310, top + 148, 245, 58, { multiline: true });

  const page4 = pdf.addPage(A4);
  drawTitle(page4, 'Financial Statement Form', 'Savings, offer and declaration', fonts);
  drawHeading(page4, 'Section 4: savings and vehicles', 108, fonts);
  top = 142;
  drawWrapped(
    page4,
    'Only include money or items that could realistically affect a payment proposal. Do not list ordinary household items.',
    MARGIN_X,
    top,
    CONTENT_WIDTH,
    fonts.regular,
    9.5
  );
  drawAmountField(pdf, page4, 'Savings', 'assets.savings_value', top + 36, fonts);
  drawAmountField(pdf, page4, 'Vehicles', 'assets.vehicle_value', top + 62, fonts);
  drawAmountField(pdf, page4, 'Other relevant assets:', 'assets.other_value', top + 88, fonts, 'assets.other_description');

  drawHeading(page4, 'Section 5: payment offer', top + 138, fonts);
  top += 172;
  drawText(page4, 'I can afford to pay:', 58, top, fonts.regular, 10);
  drawText(page4, '\u00a3', 194, top, fonts.regular, 10);
  addTextField(pdf, page4, 'payment_offer.amount', 210, top - 14, 80, 18, { line: true });
  drawText(page4, 'per', 305, top, fonts.regular, 10);
  addTextField(pdf, page4, 'payment_offer.frequency', 332, top - 14, 95, 18, { line: true });
  drawText(page4, 'Starting from:', 58, top + 32, fonts.regular, 10);
  addTextField(pdf, page4, 'payment_offer.start_date', 210, top + 18, 150, 18, { line: true });
  addCheckbox(pdf, page4, 'payment_offer.current_rent_yes', 58, top + 66, 'I will continue to pay current rent or housing costs in full: Yes', fonts, 10);
  addCheckbox(pdf, page4, 'payment_offer.current_rent_no', 330, top + 66, 'No', fonts, 10);

  drawHeading(page4, 'Section 6: additional information', top + 110, fonts);
  addTextField(pdf, page4, 'additional_information', MARGIN_X, top + 142, CONTENT_WIDTH, 72, { multiline: true });
  drawHeading(page4, 'Declaration', top + 240, fonts);
  drawWrapped(
    page4,
    'I confirm that the information I have given on this form is true and complete to the best of my knowledge.',
    MARGIN_X,
    top + 272,
    CONTENT_WIDTH,
    fonts.regular,
    10
  );
  drawText(page4, 'Signature:', MARGIN_X, top + 326, fonts.bold, 10);
  addTextField(pdf, page4, 'signature.debtor_signature', 150, top + 311, 300, 20, { line: true });
  drawText(page4, 'Name:', MARGIN_X, top + 360, fonts.bold, 10);
  drawKnownOrField(pdf, page4, tenantName(templateData), 150, top + 346, 300, 20, fonts, {
    fieldName: 'signature.debtor_name',
  });
  drawText(page4, 'Date:', MARGIN_X, top + 394, fonts.bold, 10);
  addTextField(pdf, page4, 'signature.date', 150, top + 379, 145, 20, { line: true });

  return finalize(pdf, fonts.regular);
}
