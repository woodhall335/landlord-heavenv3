if (typeof window === 'undefined' && typeof require !== 'undefined') {
  try {
    require('server-only');
  } catch {
    // Allow script/test environments to import this module outside Next server runtime.
  }
}

import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, PDFForm, StandardFonts, type PDFCheckBox, type PDFTextField } from 'pdf-lib';

export type EnglandProofOfServiceMethod =
  | 'hand_delivery'
  | 'letterbox'
  | 'first_class_post'
  | 'recorded_delivery'
  | 'email'
  | 'other';

export interface EnglandN215Data {
  court_name?: string;
  claim_number?: string;
  claimant_name?: string;
  defendant_name?: string;
  signatory_name?: string;
  signatory_capacity?:
    | 'claimant'
    | 'defendant'
    | 'litigation_friend'
    | 'claimant_legal_representative'
    | 'defendant_legal_representative';
  signatory_firm?: string;
  signatory_position?: string;
  signature_date?: string;
  document_served?: string;
  service_date?: string;
  service_method?: EnglandProofOfServiceMethod;
  service_time?: string;
  service_address?: string;
  service_address_line1?: string;
  service_address_line2?: string;
  service_address_town?: string;
  service_address_county?: string;
  service_address_postcode?: string;
  recipient_name?: string;
  recipient_capacity?: 'claimant' | 'defendant' | 'solicitor' | 'litigation_friend';
  service_location?:
    | 'usual_residence'
    | 'last_known_residence'
    | 'place_of_business'
    | 'principal_place_of_business'
    | 'last_known_place_of_business'
    | 'last_known_principal_place_of_business'
    | 'principal_office_of_partnership'
    | 'principal_office_of_corporation'
    | 'principal_office_of_company'
    | 'place_of_business_of_partnership_company_corporation'
    | 'within_jurisdiction_connection'
    | 'other';
  service_location_other?: string;
  dx_number?: string;
  fax_number?: string;
  recipient_email?: string;
  other_electronic_identification?: string;
}

export function normalizeEnglandProofOfServiceMethod(value: unknown): EnglandProofOfServiceMethod | undefined {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  switch (normalized) {
    case 'hand':
    case 'by_hand':
    case 'hand_delivery':
    case 'personal_delivery':
      return 'hand_delivery';
    case 'letterbox':
    case 'left_at_property':
    case 'leaving_at_property':
      return 'letterbox';
    case 'first_class':
    case 'first_class_post':
    case 'post':
    case 'firstclasspost':
      return 'first_class_post';
    case 'recorded':
    case 'recorded_delivery':
    case 'signed_for':
    case 'signed_for_delivery':
      return 'recorded_delivery';
    case 'email':
    case 'electronic':
      return 'email';
    case 'other':
      return 'other';
    default:
      return undefined;
  }
}

function sanitizeFormText(value: unknown): string {
  return String(value || '')
    .replace(/[^\x20-\x7E\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDateForN215(value: unknown): string {
  if (!value) return '';

  try {
    const raw = String(value);
    const date = new Date(raw.includes('T') ? raw : `${raw}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return sanitizeFormText(raw);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return sanitizeFormText(value);
  }
}

function formatPostcodeForN215(value: unknown): string {
  return sanitizeFormText(value).replace(/\s+/g, '').toUpperCase();
}

function splitAddress(data: EnglandN215Data): {
  line1: string;
  line2: string;
  town: string;
  county: string;
  postcode: string;
} {
  if (data.service_address_line1 || data.service_address_line2 || data.service_address_town || data.service_address_county || data.service_address_postcode) {
    return {
      line1: sanitizeFormText(data.service_address_line1),
      line2: sanitizeFormText(data.service_address_line2),
      town: sanitizeFormText(data.service_address_town),
      county: sanitizeFormText(data.service_address_county),
      postcode: formatPostcodeForN215(data.service_address_postcode),
    };
  }

  const lines = String(data.service_address || '')
    .split(/\r?\n|,/)
    .map((line) => sanitizeFormText(line))
    .filter(Boolean);

  const postcodePattern = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;
  let postcode = '';

  if (lines.length > 0) {
    const lastLine = lines[lines.length - 1];
    const postcodeMatch = lastLine.match(postcodePattern);
    if (postcodeMatch) {
      postcode = formatPostcodeForN215(postcodeMatch[0]);
      const cleanedLastLine = sanitizeFormText(lastLine.replace(postcodePattern, '').replace(/[,\s]+$/g, ''));
      if (cleanedLastLine) {
        lines[lines.length - 1] = cleanedLastLine;
      } else {
        lines.pop();
      }
    }
  }

  return {
    line1: lines[0] || '',
    line2: lines[1] || '',
    town: lines[2] || '',
    county: lines[3] || '',
    postcode: postcode || lines[4] || '',
  };
}

function setTextField(form: PDFForm, fieldName: string, value: unknown): void {
  const text = sanitizeFormText(value);
  if (!text) return;

  try {
    const field = form.getTextField(fieldName) as PDFTextField;
    field.setText(text);
  } catch {
    // Ignore optional / missing field mappings so generation stays resilient.
  }
}

function checkBox(form: PDFForm, fieldName: string): void {
  try {
    const field = form.getCheckBox(fieldName) as PDFCheckBox;
    field.check();
  } catch {
    // Ignore optional / missing field mappings so generation stays resilient.
  }
}

function normalizeServiceTime(value: unknown): string {
  return sanitizeFormText(value);
}

function mapServiceMethodToN215(form: PDFForm, method: EnglandProofOfServiceMethod | undefined, data: EnglandN215Data): void {
  if (!method) return;

  switch (method) {
    case 'first_class_post':
    case 'recorded_delivery':
      checkBox(form, 'Check Box3');
      break;
    case 'letterbox':
      checkBox(form, 'Check Box4');
      break;
    case 'hand_delivery':
      checkBox(form, 'Check Box5');
      setTextField(form, 'Text6', data.recipient_name || data.defendant_name);
      setTextField(form, 'Text7', normalizeServiceTime(data.service_time));
      break;
    case 'email':
      checkBox(form, 'Check Box13');
      setTextField(form, 'Text14', 'Email');
      setTextField(form, 'Text19', data.recipient_email);
      setTextField(form, 'Text15', normalizeServiceTime(data.service_time));
      break;
    case 'other':
      checkBox(form, 'Check Box8');
      setTextField(form, 'Text9', 'Other permitted service method');
      break;
    default:
      break;
  }
}

function fillRecipientCapacity(form: PDFForm, capacity: EnglandN215Data['recipient_capacity']): void {
  switch (capacity) {
    case 'claimant':
      checkBox(form, 'Check Box21');
      break;
    case 'defendant':
      checkBox(form, 'Check Box22');
      break;
    case 'solicitor':
      checkBox(form, 'Check Box23');
      break;
    case 'litigation_friend':
      checkBox(form, 'Check Box24');
      break;
    default:
      break;
  }
}

function fillServiceLocation(form: PDFForm, location: EnglandN215Data['service_location'], otherText?: string): void {
  switch (location) {
    case 'usual_residence':
      checkBox(form, 'Check Box25');
      break;
    case 'last_known_residence':
      checkBox(form, 'Check Box26');
      break;
    case 'place_of_business':
      checkBox(form, 'Check Box27');
      break;
    case 'principal_place_of_business':
      checkBox(form, 'Check Box28');
      break;
    case 'last_known_place_of_business':
      checkBox(form, 'Check Box29');
      break;
    case 'last_known_principal_place_of_business':
      checkBox(form, 'Check Box30');
      break;
    case 'principal_office_of_partnership':
      checkBox(form, 'Check Box31');
      break;
    case 'principal_office_of_corporation':
      checkBox(form, 'Check Box32');
      break;
    case 'principal_office_of_company':
      checkBox(form, 'Check Box33');
      break;
    case 'place_of_business_of_partnership_company_corporation':
      checkBox(form, 'Check Box34');
      break;
    case 'within_jurisdiction_connection':
      checkBox(form, 'Check Box35');
      break;
    case 'other':
      setTextField(form, 'Text36', otherText);
      break;
    default:
      break;
  }
}

function fillSignatoryCapacity(form: PDFForm, capacity: EnglandN215Data['signatory_capacity']): void {
  switch (capacity) {
    case 'claimant':
      checkBox(form, 'Check Box40');
      break;
    case 'defendant':
      checkBox(form, 'Check Box41');
      break;
    case 'litigation_friend':
      checkBox(form, 'Check Box42');
      break;
    case 'claimant_legal_representative':
      checkBox(form, 'Check Box43');
      break;
    case 'defendant_legal_representative':
      checkBox(form, 'Check Box44');
      break;
    default:
      break;
  }
}

function fillSignatureBlock(form: PDFForm, data: EnglandN215Data): void {
  const signatoryName = sanitizeFormText(data.signatory_name || data.claimant_name);
  const signatureDate = formatDateForN215(data.signature_date || data.service_date);

  setTextField(form, 'Text Field 91', signatoryName);
  setTextField(form, 'Text Field 87', signatoryName);
  setTextField(form, 'Text Field 86', data.signatory_firm);
  setTextField(form, 'Text Field 85', data.signatory_position);
  fillSignatoryCapacity(form, data.signatory_capacity || 'claimant');

  if (signatureDate) {
    const [day = '', month = '', year = ''] = signatureDate.split('/');
    setTextField(form, 'Text Field 90', day);
    setTextField(form, 'Text Field 89', month);
    setTextField(form, 'Text Field 88', year);
  }
}

export async function generateEnglandN215PDF(data: EnglandN215Data = {}): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), 'public', 'official-forms', 'N215.pdf');
  const templateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const address = splitAddress(data);
  const servedDate = formatDateForN215(data.service_date);
  const recipientName = sanitizeFormText(data.recipient_name || data.defendant_name);

  setTextField(form, 'Text Field 1', data.court_name);
  setTextField(form, 'Text Field 2', data.claim_number);
  setTextField(form, 'Text Field 3', data.claimant_name);
  setTextField(form, 'Text Field 4', data.defendant_name);
  setTextField(form, 'Text Field 93', servedDate);
  setTextField(form, 'Text Field 94', servedDate);
  setTextField(form, 'Text1', data.document_served || 'Form 3A notice');
  setTextField(form, 'Text2', recipientName);

  mapServiceMethodToN215(form, normalizeEnglandProofOfServiceMethod(data.service_method), data);
  fillRecipientCapacity(form, data.recipient_capacity || 'defendant');
  fillServiceLocation(form, data.service_location || 'usual_residence', data.service_location_other);

  setTextField(form, 'Text Field 102', address.line1);
  setTextField(form, 'Text Field 101', address.line2);
  setTextField(form, 'Text Field 100', address.town);
  setTextField(form, 'Text Field 99', address.county);
  setTextField(form, 'Text16', formatPostcodeForN215(address.postcode));
  setTextField(form, 'Text17', data.dx_number);
  setTextField(form, 'Text18', data.fax_number);
  setTextField(form, 'Text19', data.recipient_email);
  setTextField(form, 'Text20', data.other_electronic_identification);
  fillSignatureBlock(form, data);

  form.updateFieldAppearances(helvetica);

  // Keep the PDF editable for landlord completion and signing.
  return pdfDoc.save();
}
