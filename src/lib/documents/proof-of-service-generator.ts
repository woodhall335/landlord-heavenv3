/**
 * Proof of Service PDF Generator
 *
 * Creates an editable PDF form for recording proof of service.
 * The form has fillable fields that users can complete and print.
 *
 * IMPORTANT: This form only pre-fills SAFE fields from case data:
 * - Names (landlord, tenant)
 * - Addresses (property, service address)
 * - Notice type
 * - Served date and expiry date (if known from wizard)
 *
 * The following fields are generally left for the landlord to confirm:
 * - Service method can be pre-ticked only when recorded by the calling workflow
 * - Time of service - landlord MUST enter
 * - Deemed service date - landlord MUST calculate
 * - Tracking number - landlord MUST enter
 *
 * This ensures we do not fabricate evidence about how service was performed.
 */

import fs from 'fs/promises';
import path from 'path';

import { PDFDocument, PDFFont, rgb, StandardFonts } from 'pdf-lib';
import { toWinAnsiSafeText } from './pdf-safe-text';

export interface ProofOfServiceData {
  // SAFE to pre-fill (from case data)
  landlord_name?: string;
  tenant_name?: string;
  property_address?: string;
  document_served?: string;
  served_date?: string;       // Date the notice was served (if known)
  expiry_date?: string;       // Notice expiry date (if known)
  service_address?: string;   // Only if different from property

  // FIX 3 (Jan 2026): Service method can be pre-ticked if known from wizard
  // This helps with consistency across court pack documents
  service_method?: 'hand_delivery' | 'letterbox' | 'first_class_post' | 'recorded_delivery' | 'email' | 'other';

  // Optional footer branding override for product-specific packs
  footer_branding?: string;
  record_context?: 'court' | 'section13';

  // NOT pre-filled (landlord must complete)
  // time_of_service - text field, left empty
  // tracking_number - text field, left empty
  // server_name - text field, left empty (may be different from landlord)
}

const BRAND_LOGO_PATH = path.join(process.cwd(), 'public', 'images', 'logo.png');
let cachedBrandLogoBytes: Uint8Array | null | undefined;

async function getBrandLogoBytes(): Promise<Uint8Array | null> {
  if (cachedBrandLogoBytes !== undefined) {
    return cachedBrandLogoBytes;
  }

  try {
    cachedBrandLogoBytes = await fs.readFile(BRAND_LOGO_PATH);
  } catch {
    cachedBrandLogoBytes = null;
  }

  return cachedBrandLogoBytes;
}

/**
 * Format a date to UK format (DD/MM/YYYY) for form display
 */
function formatUKShortDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Generate an editable Proof of Service PDF form
 *
 * Creates a professional certificate of service with fillable fields
 * for recording how legal documents were served.
 *
 * CRITICAL: Only pre-fills safe fields. Time and tracking number are never
 * pre-filled. Service method is only pre-ticked when supplied by the workflow.
 */
export async function generateProofOfServicePDF(data: ProofOfServiceData = {}): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = await getBrandLogoBytes();
  const logoImage = logoBytes ? await pdfDoc.embedPng(logoBytes) : null;

  // Add a page (A4 size)
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  // Colors
  const black = rgb(0.141, 0.09, 0.247);
  const gray = rgb(0.424, 0.365, 0.561);
  const warningYellow = rgb(0.965, 0.945, 1);
  const warningBorder = rgb(0.776, 0.714, 0.937);

  // Layout constants
  const margin = 50;
  let y = height - margin;
  const isSection13Record = data.record_context === 'section13';

  // Helper functions
  // Use toWinAnsiSafeText to sanitize Unicode characters for WinAnsi encoding
  const drawText = (text: string, x: number, yPos: number, font: PDFFont, size: number, color = black) => {
    page.drawText(toWinAnsiSafeText(text), { x, y: yPos, font, size, color });
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 1) => {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: black });
  };

  const setFieldTextSize = (field: { setFontSize: (size: number) => void }, size = 9.5) => {
    field.setFontSize(size);
  };
  const sectionHeadingSize = 11;

  // === HEADER ===
  if (logoImage) {
    const scaled = logoImage.scaleToFit(168, 34);
    page.drawImage(logoImage, {
      x: margin,
      y: y - scaled.height + 2,
      width: scaled.width,
      height: scaled.height,
    });
    y -= scaled.height + 28;
  }
  drawText(isSection13Record ? 'SECTION 13 SERVICE RECORD' : 'CERTIFICATE OF SERVICE', margin, y, helveticaBold, 18);
  y -= 10;
  drawText(
    isSection13Record
      ? '(Service evidence support record for the Form 4A notice)'
      : '(Proof of Service - support record only, not a prescribed court form)',
    margin,
    y,
    helvetica,
    12,
    gray
  );
  y -= 30;

  // Header line
  drawLine(margin, y, width - margin, y, 2);
  y -= 25;

  // === WARNING BOX ===
  const warningBoxHeight = 50;
  const warningTop = y;
  page.drawRectangle({ x: margin, y: warningTop - warningBoxHeight, width: width - margin * 2, height: warningBoxHeight, color: warningYellow, borderColor: warningBorder, borderWidth: 1.5 });
  y -= 10;
  drawText(
    isSection13Record
      ? 'IMPORTANT: This is a support record, not an official prescribed tribunal form'
      : 'IMPORTANT: This is a support record, not an official prescribed form',
    margin + 10,
    y,
    helveticaBold,
    10
  );
  y -= 16;
  drawText(
    isSection13Record
      ? 'Review the recorded method and date, then complete the time, signature, and confirmation after service.'
      : 'Complete the service method, actual service time, signature, and date after service.',
    margin + 10,
    y,
    helvetica,
    9
  );
  y = warningTop - warningBoxHeight - 18;

  // === SECTION 1: PARTIES ===
  drawText('1. PARTIES', margin, y, helveticaBold, sectionHeadingSize);
  y -= 22;

  // Create form for interactive fields
  const form = pdfDoc.getForm();

  // Landlord field (SAFE TO PRE-FILL)
  drawText(isSection13Record ? 'Landlord:' : 'Landlord/Claimant:', margin, y, helvetica, 10);
  const landlordField = form.createTextField('landlord_name');
  landlordField.addToPage(page, { x: margin + 115, y: y - 4, width: width - margin * 2 - 115, height: 18 });
  setFieldTextSize(landlordField);
  if (data.landlord_name) landlordField.setText(data.landlord_name);
  y -= 26;

  // Tenant field (SAFE TO PRE-FILL)
  drawText(isSection13Record ? 'Tenant(s):' : 'Tenant/Defendant:', margin, y, helvetica, 10);
  const tenantField = form.createTextField('tenant_name');
  tenantField.addToPage(page, { x: margin + 115, y: y - 4, width: width - margin * 2 - 115, height: 18 });
  setFieldTextSize(tenantField);
  if (data.tenant_name) tenantField.setText(data.tenant_name);
  y -= 26;

  // Property address field (SAFE TO PRE-FILL)
  drawText('Property Address:', margin, y, helvetica, 10);
  const propertyField = form.createTextField('property_address');
  propertyField.addToPage(page, { x: margin + 115, y: y - 4, width: width - margin * 2 - 115, height: 18 });
  setFieldTextSize(propertyField, 9);
  if (data.property_address) propertyField.setText(data.property_address);
  y -= 32;

  // === SECTION 2: DOCUMENT SERVED ===
  drawText('2. DOCUMENT SERVED', margin, y, helveticaBold, sectionHeadingSize);
  y -= 34;

  // Document served (SAFE TO PRE-FILL - this is the notice type)
  const documentField = form.createTextField('document_served');
  documentField.addToPage(page, { x: margin, y: y - 4, width: width - margin * 2, height: 28 });
  documentField.enableMultiline();
  setFieldTextSize(documentField, 9);
  if (data.document_served) documentField.setText(data.document_served);
  y -= 40;

  // Notice expiry date (SAFE TO PRE-FILL - calculated from wizard)
  if (data.expiry_date) {
    drawText('Notice Expiry Date:', margin, y, helvetica, 10);
    drawText(formatUKShortDate(data.expiry_date), margin + 115, y, helveticaBold, 10);
    y -= 20;
  }

  // === SECTION 3: SERVICE DETAILS (MUST BE COMPLETED BY LANDLORD) ===
  y -= 5;
  drawText('3. SERVICE DETAILS', margin, y, helveticaBold, sectionHeadingSize);
  drawText(
    isSection13Record ? '(Check the recorded details before relying on them)' : '(You must complete this section)',
    margin + 130,
    y,
    helvetica,
    9,
    gray
  );
  y -= 22;

  // Date of service (SAFE TO PRE-FILL if known)
  drawText('Date of Service:', margin, y, helvetica, 10);
  const dateField = form.createTextField('service_date');
  dateField.addToPage(page, { x: margin + 115, y: y - 4, width: 100, height: 18 });
  setFieldTextSize(dateField);
  if (data.served_date) dateField.setText(formatUKShortDate(data.served_date));
  y -= 26;

  // Time of service (NEVER PRE-FILL - landlord must enter)
  drawText('Time of Service:', margin, y, helvetica, 10);
  const timeField = form.createTextField('service_time');
  timeField.addToPage(page, { x: margin + 115, y: y - 4, width: 100, height: 18 });
  setFieldTextSize(timeField);
  drawText('(e.g., 10:30 AM)', margin + 225, y, helvetica, 8, gray);
  y -= 26;

  // Method of service
  drawText('Method of Service:', margin, y, helveticaBold, 10);
  drawText(
    isSection13Record ? '(recorded from the wizard; amend if needed)' : '(Tick ONE box only)',
    margin + 115,
    y,
    helvetica,
    9,
    gray
  );
  y -= 18;

  // Checkboxes for service methods
  // FIX 3 (Jan 2026): Pre-tick if service_method is provided for consistency with Form 6A
  const methods = [
    { id: 'method_hand', key: 'hand_delivery', label: 'Personal delivery (handed directly to tenant)', note: '' },
    { id: 'method_letterbox', key: 'letterbox', label: 'Through the letterbox at the property', note: '' },
    { id: 'method_post', key: 'first_class_post', label: 'By first class post', note: '(add 2 working days for deemed service)' },
    { id: 'method_recorded', key: 'recorded_delivery', label: 'By recorded/signed for delivery', note: '(keep tracking receipt)' },
    { id: 'method_email', key: 'email', label: 'By email', note: '(only if permitted by tenancy agreement)' },
    { id: 'method_other', key: 'other', label: 'Other method (specify below)', note: '' },
  ];

  for (const method of methods) {
    const checkbox = form.createCheckBox(method.id);
    checkbox.addToPage(page, { x: margin + 10, y: y - 2, width: 11, height: 11 });
    // FIX 3: Pre-tick if service method matches (for cross-document consistency)
    if (data.service_method && data.service_method === method.key) {
      checkbox.check();
    }
    drawText(method.label, margin + 28, y, helvetica, 9);
    if (method.note) {
      drawText(method.note, margin + 250, y, helvetica, 8, gray);
    }
    y -= 13;
  }

  y -= 8;

  // Tracking number (NEVER PRE-FILL)
  drawText('Tracking Number:', margin, y, helvetica, 10);
  drawText('(if sent by recorded delivery)', margin + 250, y, helvetica, 8, gray);
  const trackingField = form.createTextField('tracking_number');
  trackingField.addToPage(page, { x: margin + 115, y: y - 4, width: 130, height: 18 });
  setFieldTextSize(trackingField);
  y -= 26;

  // Service address (SAFE TO PRE-FILL only if different from property)
  const serviceAddress = data.service_address?.trim();
  const propertyAddress = data.property_address?.trim();
  const serviceAddressField = form.createTextField('service_address');
  serviceAddressField.enableMultiline();
  if (serviceAddress && serviceAddress !== propertyAddress) {
    drawText('Service Address:', margin, y, helvetica, 10);
    drawText('(if different from property)', margin + 95, y, helvetica, 8, gray);
    y -= 18;

    serviceAddressField.addToPage(page, { x: margin, y: y - 4, width: width - margin * 2, height: 28 });
    setFieldTextSize(serviceAddressField, 9);
    y -= 38;
  } else {
    serviceAddressField.addToPage(page, { x: -1000, y: -1000, width: 1, height: 1 });
    setFieldTextSize(serviceAddressField, 1);
  }
  if (serviceAddress) serviceAddressField.setText(serviceAddress);

  // === SECTION 4: DECLARATION ===
  drawText('4. DECLARATION', margin, y, helveticaBold, sectionHeadingSize);
  y -= 20;

  // Declaration text
  const declarationText = isSection13Record
    ? [
        'I confirm that this record reflects how the Form 4A notice was served, to the best of my',
        'knowledge and belief. I understand that unclear or inaccurate service evidence may weaken',
        'the landlord position if the tenant refers the proposed rent to the tribunal.',
      ]
    : [
        'I declare that the information given in this certificate is true to the best of my',
        'knowledge and belief. I understand that if I make a false statement I may be',
        'liable for prosecution and that this certificate may be rejected by the court.',
      ];

  for (const line of declarationText) {
    drawText(line, margin, y, helvetica, 9);
    y -= 12;
  }

  y -= 15;

  // Signature section
  drawText('Name of person who served:', margin, y, helvetica, 10);
  const serverNameField = form.createTextField('server_name');
  serverNameField.addToPage(page, { x: margin + 160, y: y - 4, width: width - margin * 2 - 160, height: 18 });
  setFieldTextSize(serverNameField);
  // NEVER pre-fill server name - may be different from landlord
  y -= 26;

  // Signature line
  drawText('Signature:', margin, y, helvetica, 10);
  drawLine(margin + 70, y - 5, margin + 280, y - 5);
  y -= 26;

  // Date signed line
  drawText('Date signed:', margin, y, helvetica, 10);
  const dateSignedField = form.createTextField('date_signed');
  dateSignedField.addToPage(page, { x: margin + 80, y: y - 4, width: 100, height: 18 });
  setFieldTextSize(dateSignedField);
  y -= 28;

  // === FOOTER ===
  y = 24;
  drawText(data.footer_branding || 'Generated by Landlord Heaven Court Pack', margin, y, helvetica, 8, gray);

  form.updateFieldAppearances(helvetica);

  // Serialize the PDF (NOT flattened - must remain editable for user to complete)
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}
