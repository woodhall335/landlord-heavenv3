/**
 * Proof of Service PDF Generator
 *
 * Creates an editable PDF form for recording proof of service.
 * The form has fillable fields that users can complete and print.
 */

import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';

export interface ProofOfServiceData {
  // Pre-filled data (optional)
  landlord_name?: string;
  tenant_name?: string;
  property_address?: string;
  document_served?: string;
  service_date?: string;
  service_method?: string;
  service_address?: string;
  server_name?: string;
}

/**
 * Generate an editable Proof of Service PDF form
 *
 * Creates a professional certificate of service with fillable fields
 * for recording how legal documents were served.
 */
export async function generateProofOfServicePDF(data: ProofOfServiceData = {}): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add a page (A4 size)
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  // Colors
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.9, 0.9, 0.9);

  // Layout constants
  const margin = 50;
  const lineHeight = 20;
  let y = height - margin;

  // Helper functions
  const drawText = (text: string, x: number, yPos: number, font: PDFFont, size: number, color = black) => {
    page.drawText(text, { x, y: yPos, font, size, color });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 1) => {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: black });
  };

  const drawRect = (x: number, yPos: number, w: number, h: number, fill = false) => {
    if (fill) {
      page.drawRectangle({ x, y: yPos, width: w, height: h, color: lightGray });
    }
    page.drawRectangle({ x, y: yPos, width: w, height: h, borderColor: black, borderWidth: 1 });
  };

  // === HEADER ===
  drawText('CERTIFICATE OF SERVICE', margin, y, helveticaBold, 18);
  y -= 10;
  drawText('(Proof of Service)', margin, y, helvetica, 12, gray);
  y -= 30;

  // Header line
  drawLine(margin, y, width - margin, y, 2);
  y -= 30;

  // === SECTION 1: PARTIES ===
  drawText('1. PARTIES', margin, y, helveticaBold, 12);
  y -= 25;

  // Create form for interactive fields
  const form = pdfDoc.getForm();

  // Landlord/Claimant field
  drawText('Landlord/Claimant:', margin, y, helvetica, 10);
  const landlordField = form.createTextField('landlord_name');
  landlordField.addToPage(page, { x: margin + 120, y: y - 5, width: width - margin * 2 - 120, height: 20 });
  if (data.landlord_name) landlordField.setText(data.landlord_name);
  y -= 30;

  // Tenant/Defendant field
  drawText('Tenant/Defendant:', margin, y, helvetica, 10);
  const tenantField = form.createTextField('tenant_name');
  tenantField.addToPage(page, { x: margin + 120, y: y - 5, width: width - margin * 2 - 120, height: 20 });
  if (data.tenant_name) tenantField.setText(data.tenant_name);
  y -= 30;

  // Property address field
  drawText('Property Address:', margin, y, helvetica, 10);
  const propertyField = form.createTextField('property_address');
  propertyField.addToPage(page, { x: margin + 120, y: y - 5, width: width - margin * 2 - 120, height: 20 });
  if (data.property_address) propertyField.setText(data.property_address);
  y -= 40;

  // === SECTION 2: DOCUMENT SERVED ===
  drawText('2. DOCUMENT SERVED', margin, y, helveticaBold, 12);
  y -= 25;

  drawText('I served the following document(s):', margin, y, helvetica, 10);
  y -= 20;

  const documentField = form.createTextField('document_served');
  documentField.addToPage(page, { x: margin, y: y - 5, width: width - margin * 2, height: 40 });
  documentField.enableMultiline();
  if (data.document_served) documentField.setText(data.document_served);
  y -= 55;

  // === SECTION 3: SERVICE DETAILS ===
  drawText('3. SERVICE DETAILS', margin, y, helveticaBold, 12);
  y -= 25;

  // Date of service
  drawText('Date of Service:', margin, y, helvetica, 10);
  const dateField = form.createTextField('service_date');
  dateField.addToPage(page, { x: margin + 120, y: y - 5, width: 150, height: 20 });
  if (data.service_date) dateField.setText(data.service_date);
  y -= 30;

  // Method of service
  drawText('Method of Service:', margin, y, helveticaBold, 10);
  y -= 20;

  // Checkboxes for service methods
  const methods = [
    { id: 'method_hand', label: 'Personal delivery (handed directly to tenant)' },
    { id: 'method_letterbox', label: 'Through the letterbox at the property' },
    { id: 'method_post', label: 'By first class post' },
    { id: 'method_recorded', label: 'By recorded/signed for delivery' },
    { id: 'method_email', label: 'By email (if permitted by tenancy agreement)' },
    { id: 'method_other', label: 'Other method (specify below)' },
  ];

  for (const method of methods) {
    const checkbox = form.createCheckBox(method.id);
    checkbox.addToPage(page, { x: margin + 10, y: y - 3, width: 12, height: 12 });
    drawText(method.label, margin + 30, y, helvetica, 10);
    y -= 18;
  }

  y -= 10;

  // Service address
  drawText('Service Address:', margin, y, helvetica, 10);
  drawText('(if different from property)', margin + 100, y, helvetica, 8, gray);
  y -= 20;

  const serviceAddressField = form.createTextField('service_address');
  serviceAddressField.addToPage(page, { x: margin, y: y - 5, width: width - margin * 2, height: 40 });
  serviceAddressField.enableMultiline();
  if (data.service_address) serviceAddressField.setText(data.service_address);
  y -= 55;

  // === SECTION 4: DECLARATION ===
  drawText('4. DECLARATION', margin, y, helveticaBold, 12);
  y -= 25;

  // Declaration text
  const declarationText = [
    'I declare that the information given in this certificate is true to the best of my',
    'knowledge and belief. I understand that if I make a false statement I may be',
    'liable for prosecution.',
  ];

  for (const line of declarationText) {
    drawText(line, margin, y, helvetica, 10);
    y -= 15;
  }

  y -= 20;

  // Signature section
  drawText('Name of person who served:', margin, y, helvetica, 10);
  const serverNameField = form.createTextField('server_name');
  serverNameField.addToPage(page, { x: margin + 160, y: y - 5, width: width - margin * 2 - 160, height: 20 });
  if (data.server_name) serverNameField.setText(data.server_name);
  y -= 30;

  // Signature line
  drawText('Signature:', margin, y, helvetica, 10);
  drawLine(margin + 70, y - 5, margin + 300, y - 5);
  y -= 30;

  // Date signed line
  drawText('Date signed:', margin, y, helvetica, 10);
  const dateSignedField = form.createTextField('date_signed');
  dateSignedField.addToPage(page, { x: margin + 80, y: y - 5, width: 120, height: 20 });
  y -= 40;

  // === SECTION 5: NOTES ===
  drawRect(margin, y - 80, width - margin * 2, 85, true);
  y -= 5;

  drawText('IMPORTANT NOTES', margin + 10, y, helveticaBold, 10);
  y -= 15;

  const notes = [
    '• Keep a copy of this certificate for your records',
    '• If serving by post, keep proof of posting (e.g., Post Office receipt)',
    '• For court proceedings, you may need to provide this as evidence',
    '• Ensure the service method complies with the tenancy agreement and law',
  ];

  for (const note of notes) {
    drawText(note, margin + 10, y, helvetica, 9, gray);
    y -= 13;
  }

  // === FOOTER ===
  y = margin + 20;
  drawLine(margin, y, width - margin, y, 1);
  y -= 15;
  drawText('Generated by Landlord Heaven', margin, y, helvetica, 8, gray);
  drawText('This form may be used as evidence of service in court proceedings', width - margin - 280, y, helvetica, 8, gray);

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}
