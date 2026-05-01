import { PDFCheckBox, PDFDocument, PDFForm, PDFTextField, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

import {
  calculateEnglandPossessionNoticePeriod,
  getEnglandCommonReasonCheckboxes,
  getEnglandGroundDefinition,
} from '@/lib/england-possession/ground-catalog';
import { buildEnglandForm3AExplanation, isThinEnglandNarrative } from '@/lib/england-possession/pack-drafting';

const OFFICIAL_FORMS_ROOT = path.join(process.cwd(), 'public', 'official-forms');

type OfficialFormData = Record<string, any>;

export interface EnglandOfficialFormOptions {
  flatten?: boolean;
}

export const FORM3A_OFFICIAL_FIELD_NAMES = {
  text: {
    tenantNames: 'Text Field 132',
    propertyLine1: 'Text Field 116',
    propertyLine2: 'Text Field 115',
    propertyCity: 'Text Field 114',
    propertyCounty: 'Text Field 113',
    propertyPostcode: 'Text Field 112',
    earliestDate: 'Text Field 117',
    groundsText: 'Text Field 133',
    explanationText: 'Text Field 134',
    signature: 'Text Field 119',
    signatureDate: 'Text Field 130',
    signatoryName: 'Text Field 135',
    signatoryLine1: 'Text Field 103',
    signatoryLine2: 'Text Field 102',
    signatoryCity: 'Text Field 101',
    signatoryCounty: 'Text Field 100',
    signatoryPostcode: 'Text Field 99',
    signatoryPhone: 'Text Field 120',
    signatoryEmail: 'Text Field 104',
    jointSignatory1: 'Text Field 1024',
    jointSignatory2: 'Text Field 128',
    jointSignatory3: 'Text Field 127',
    extraSheetText: 'Text Field 136',
    extraSheetSignature: 'Text Field 137',
    extraSheetDate: 'Text Field 129',
  },
  checkboxes: {
    rentArrearsSerious: 'Check Box 69',
    rentArrearsOther: 'Check Box 70',
    useOrSale: 'Check Box 71',
    studentsOrWorkers: 'Check Box 72',
    redevelopment: 'Check Box 73',
    asbOrLegalBreach: 'Check Box 74',
    tenancyBreach: 'Check Box 75',
    deterioration: 'Check Box 76',
    noRightToRent: 'Check Box 77',
    other: 'Check Box 78',
    capacityLandlord: 'Check Box 42',
    capacityAgent: 'Check Box 41',
    capacityLicensor: 'Check Box 43',
  },
} as const;

type OverlayFieldDefinition =
  | {
      name: string;
      kind: 'text';
      pageIndex: number;
      x: number;
      y: number;
      width: number;
      height: number;
      multiline?: boolean;
      fontSize?: number;
    }
  | {
      name: string;
      kind: 'checkbox';
      pageIndex: number;
      x: number;
      y: number;
      width: number;
      height: number;
    };

export const FORM3A_OVERLAY_FIELDS: OverlayFieldDefinition[] = [
  { name: 'form3a_tenant_names', kind: 'text', pageIndex: 1, x: 56, y: 694, width: 338, height: 54, multiline: true },
  { name: 'form3a_property_line1', kind: 'text', pageIndex: 1, x: 56, y: 615, width: 338, height: 22 },
  { name: 'form3a_property_line2', kind: 'text', pageIndex: 1, x: 56, y: 574, width: 338, height: 22 },
  { name: 'form3a_property_city', kind: 'text', pageIndex: 1, x: 56, y: 533, width: 220, height: 22 },
  { name: 'form3a_property_county', kind: 'text', pageIndex: 1, x: 56, y: 492, width: 220, height: 22 },
  { name: 'form3a_property_postcode', kind: 'text', pageIndex: 1, x: 56, y: 451, width: 140, height: 22 },
  { name: 'form3a_earliest_day', kind: 'text', pageIndex: 1, x: 56, y: 282, width: 28, height: 20 },
  { name: 'form3a_earliest_month', kind: 'text', pageIndex: 1, x: 102, y: 282, width: 32, height: 20 },
  { name: 'form3a_earliest_year', kind: 'text', pageIndex: 1, x: 147, y: 282, width: 44, height: 20 },

  { name: 'form3a_reason_rent_arrears_serious', kind: 'checkbox', pageIndex: 2, x: 56, y: 468, width: 12, height: 12 },
  { name: 'form3a_reason_rent_arrears_other', kind: 'checkbox', pageIndex: 2, x: 56, y: 416, width: 12, height: 12 },
  { name: 'form3a_reason_use_or_sale', kind: 'checkbox', pageIndex: 2, x: 56, y: 379, width: 12, height: 12 },
  { name: 'form3a_reason_students_or_workers', kind: 'checkbox', pageIndex: 2, x: 56, y: 342, width: 12, height: 12 },
  { name: 'form3a_reason_redevelopment', kind: 'checkbox', pageIndex: 2, x: 56, y: 320, width: 12, height: 12 },
  { name: 'form3a_reason_asb_or_legal_breach', kind: 'checkbox', pageIndex: 2, x: 56, y: 283, width: 12, height: 12 },
  { name: 'form3a_reason_tenancy_breach', kind: 'checkbox', pageIndex: 2, x: 56, y: 246, width: 12, height: 12 },
  { name: 'form3a_reason_deterioration', kind: 'checkbox', pageIndex: 2, x: 56, y: 210, width: 12, height: 12 },
  { name: 'form3a_reason_no_right_to_rent', kind: 'checkbox', pageIndex: 2, x: 56, y: 188, width: 12, height: 12 },
  { name: 'form3a_reason_other', kind: 'checkbox', pageIndex: 2, x: 56, y: 165, width: 12, height: 12 },

  { name: 'form3a_grounds_text', kind: 'text', pageIndex: 3, x: 56, y: 72, width: 346, height: 648, multiline: true, fontSize: 10 },
  { name: 'form3a_explanation_text', kind: 'text', pageIndex: 4, x: 56, y: 70, width: 346, height: 660, multiline: true, fontSize: 10 },

  { name: 'form3a_signature', kind: 'text', pageIndex: 5, x: 56, y: 689, width: 338, height: 26 },
  { name: 'form3a_capacity_landlord', kind: 'checkbox', pageIndex: 5, x: 56, y: 627, width: 12, height: 12 },
  { name: 'form3a_capacity_agent', kind: 'checkbox', pageIndex: 5, x: 56, y: 606, width: 12, height: 12 },
  { name: 'form3a_capacity_licensor', kind: 'checkbox', pageIndex: 5, x: 56, y: 585, width: 12, height: 12 },
  { name: 'form3a_signature_day', kind: 'text', pageIndex: 5, x: 56, y: 505, width: 28, height: 20 },
  { name: 'form3a_signature_month', kind: 'text', pageIndex: 5, x: 102, y: 505, width: 32, height: 20 },
  { name: 'form3a_signature_year', kind: 'text', pageIndex: 5, x: 147, y: 505, width: 44, height: 20 },
  { name: 'form3a_signatory_name', kind: 'text', pageIndex: 5, x: 56, y: 424, width: 338, height: 22 },
  { name: 'form3a_signatory_line1', kind: 'text', pageIndex: 5, x: 56, y: 338, width: 338, height: 22 },
  { name: 'form3a_signatory_line2', kind: 'text', pageIndex: 5, x: 56, y: 297, width: 338, height: 22 },
  { name: 'form3a_signatory_city', kind: 'text', pageIndex: 5, x: 56, y: 256, width: 220, height: 22 },
  { name: 'form3a_signatory_county', kind: 'text', pageIndex: 5, x: 56, y: 215, width: 220, height: 22 },
  { name: 'form3a_signatory_postcode', kind: 'text', pageIndex: 5, x: 56, y: 174, width: 140, height: 22 },
  { name: 'form3a_signatory_phone', kind: 'text', pageIndex: 5, x: 56, y: 109, width: 220, height: 22 },
  { name: 'form3a_signatory_email', kind: 'text', pageIndex: 5, x: 56, y: 58, width: 260, height: 22 },

  { name: 'form3a_joint_signatory_1', kind: 'text', pageIndex: 6, x: 56, y: 618, width: 346, height: 104, multiline: true, fontSize: 10 },
  { name: 'form3a_joint_signatory_2', kind: 'text', pageIndex: 6, x: 56, y: 462, width: 346, height: 104, multiline: true, fontSize: 10 },
  { name: 'form3a_joint_signatory_3', kind: 'text', pageIndex: 6, x: 56, y: 307, width: 346, height: 104, multiline: true, fontSize: 10 },

  { name: 'form3a_extra_sheet_signature', kind: 'text', pageIndex: 9, x: 28, y: 118, width: 340, height: 28 },
  { name: 'form3a_extra_sheet_day', kind: 'text', pageIndex: 9, x: 28, y: 56, width: 28, height: 20 },
  { name: 'form3a_extra_sheet_month', kind: 'text', pageIndex: 9, x: 74, y: 56, width: 32, height: 20 },
  { name: 'form3a_extra_sheet_year', kind: 'text', pageIndex: 9, x: 119, y: 56, width: 44, height: 20 },
];

async function loadOfficialForm(formName: string): Promise<PDFDocument> {
  const formPath = path.join(OFFICIAL_FORMS_ROOT, formName);
  const bytes = await fs.readFile(formPath);
  return PDFDocument.load(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes as any));
}

function addCalendarMonths(dateString: string, months: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const targetYear = year + Math.floor(month / 12);
  const targetMonth = ((month % 12) + 12) % 12;
  const lastDayOfMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const adjustedDay = Math.min(day, lastDayOfMonth);
  const next = new Date(Date.UTC(targetYear, targetMonth, adjustedDay));
  return next.toISOString().split('T')[0];
}

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

function splitDate(dateString?: string | null): { day: string; month: string; year: string } {
  if (!dateString) return { day: '', month: '', year: '' };
  const [year = '', month = '', day = ''] = dateString.split('T')[0].split('-');
  return { day, month, year };
}

function formatCombDateValue(dateString?: string | null): string {
  const { day, month, year } = splitDate(dateString);
  return `${day}${month}${year}`;
}

function normalizeList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitAddress(address?: string | null): string[] {
  if (!address) return [];
  return String(address)
    .split(/\r?\n|,\s*/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const UK_POSTCODE_REGEX = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b/i;

function normalizePostcode(postcode?: string | null): string {
  if (!postcode) return '';
  const compact = String(postcode).toUpperCase().replace(/\s+/g, '');
  if (compact.length < 5) {
    return compact;
  }
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

function formatOfficialPostcodeFieldValue(postcode?: string | null): string {
  return normalizePostcode(postcode).replace(/\s+/g, '');
}

function extractPostcodeFromLines(lines: string[]): string {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const match = lines[index]?.match(UK_POSTCODE_REGEX);
    if (match?.[1]) {
      return normalizePostcode(match[1]);
    }
  }
  return '';
}

function stripPostcodeFromLine(line: string, postcode: string): string {
  if (!line || !postcode) return line;
  return line.replace(UK_POSTCODE_REGEX, '').replace(/\s{2,}/g, ' ').trim().replace(/,$/, '').trim();
}

function getAddressParts(data: OfficialFormData, prefix: 'property' | 'landlord'): {
  line1: string;
  line2: string;
  city: string;
  county: string;
  postcode: string;
} {
  const explicit = {
    line1: data[`${prefix}_address_line1`] || '',
    line2: data[`${prefix}_address_line2`] || '',
    city: data[`${prefix}_city`] || data[`${prefix}_address_town`] || '',
    county: data[`${prefix}_county`] || data[`${prefix}_address_county`] || '',
    postcode: data[`${prefix}_postcode`] || data[`${prefix}_address_postcode`] || '',
  };

  if (explicit.line1 || explicit.line2 || explicit.city || explicit.county || explicit.postcode) {
    return explicit;
  }

  const fallbackAddress =
    prefix === 'property'
      ? data.property_address
      : data.landlord_address || data.service_address || '';
  const rawLines = splitAddress(fallbackAddress);
  const explicitPostcode = normalizePostcode(data[`${prefix}_postcode`] || data[`${prefix}_address_postcode`]);
  const detectedPostcode = explicitPostcode || extractPostcodeFromLines(rawLines);
  const lines = rawLines
    .map((line, index) => (
      index === rawLines.length - 1 || line.match(UK_POSTCODE_REGEX)
        ? stripPostcodeFromLine(line, detectedPostcode)
        : line
    ))
    .filter(Boolean);

  return {
    line1: lines[0] || '',
    line2: lines[1] || '',
    city: lines[2] || '',
    county: lines[3] || '',
    postcode: detectedPostcode || lines[4] || '',
  };
}

function setTextValue(form: PDFForm, fieldName: string, value: string | undefined | null) {
  if (value === undefined || value === null) return;
  const field = form.getField(fieldName);
  if (field instanceof PDFTextField) {
    field.setText(String(value));
  }
}

function setCheckboxValue(form: PDFForm, fieldName: string, checked: boolean) {
  const field = form.getField(fieldName);
  if (field instanceof PDFCheckBox) {
    if (checked) {
      field.check();
    } else {
      field.uncheck();
    }
  }
}

function setExistingTextField(form: PDFForm, fieldName: string, value: string | undefined | null) {
  if (value === undefined || value === null || value === '') return;
  const field = form.getFields().find((candidate) => candidate.getName() === fieldName);
  if (field instanceof PDFTextField) {
    field.setText(String(value));
  }
}

function formatCurrency(value?: number | string | null): string {
  if (value === undefined || value === null || value === '') return '';
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[£,]/g, ''));
  if (Number.isNaN(numeric)) return String(value);
  return `£${numeric.toFixed(2)}`;
}

function calculateEarliestCourtDate(data: OfficialFormData): string {
  const explicitDate =
    data.notice_expiry_date ||
    data.earliest_proceedings_date ||
    data.earliest_possession_date;

  if (explicitDate) {
    return String(explicitDate);
  }

  const serviceDate =
    data.notice_served_date ||
    data.section_8_notice_date ||
    data.notice_date ||
    data.signature_date ||
    new Date().toISOString().split('T')[0];
  const grounds = normalizeList(data.ground_codes || data.selected_grounds || data.ground_numbers);

  if (grounds.length === 0) {
    return addDays(serviceDate, 14);
  }

  const result = calculateEnglandPossessionNoticePeriod(grounds);
  const monthPeriods = result.drivingGrounds
    .map((groundCode) => getEnglandGroundDefinition(groundCode)?.noticePeriodMonths)
    .filter((value): value is number => typeof value === 'number' && value > 0);

  if (monthPeriods.length > 0) {
    return addCalendarMonths(serviceDate, Math.max(...monthPeriods));
  }

  return addDays(serviceDate, result.noticePeriodDays);
}

function buildJointSignatoryLines(data: OfficialFormData): string[] {
  const explicit = Array.isArray(data.form3a_joint_signatories) ? data.form3a_joint_signatories : [];
  if (explicit.length > 0) {
    return explicit.slice(0, 3).map((entry: Record<string, any>) =>
      [entry.signature || entry.name, entry.address, entry.capacity].filter(Boolean).join('\n'),
    );
  }

  const fallback: string[] = [];
  if (data.landlord_2_name) {
    fallback.push([data.landlord_2_name, data.landlord_address, data.signatory_capacity || 'landlord'].filter(Boolean).join('\n'));
  }
  if (data.landlord_3_name) {
    fallback.push([data.landlord_3_name, data.landlord_address, data.signatory_capacity || 'landlord'].filter(Boolean).join('\n'));
  }
  if (data.landlord_4_name) {
    fallback.push([data.landlord_4_name, data.landlord_address, data.signatory_capacity || 'landlord'].filter(Boolean).join('\n'));
  }
  return fallback.slice(0, 3);
}

function createForm3AOverlay(form: PDFForm, pdfDoc: PDFDocument) {
  const pages = pdfDoc.getPages();

  for (const fieldDef of FORM3A_OVERLAY_FIELDS) {
    const page = pages[fieldDef.pageIndex];
    if (fieldDef.kind === 'text') {
      const field = form.createTextField(fieldDef.name);
      field.addToPage(page, {
        x: fieldDef.x,
        y: fieldDef.y,
        width: fieldDef.width,
        height: fieldDef.height,
        borderWidth: 0.5,
      });
      if (fieldDef.multiline) {
        field.enableMultiline();
      }
      if (fieldDef.fontSize) {
        field.setFontSize(fieldDef.fontSize);
      }
    } else {
      const field = form.createCheckBox(fieldDef.name);
      field.addToPage(page, {
        x: fieldDef.x,
        y: fieldDef.y,
        width: fieldDef.width,
        height: fieldDef.height,
        borderWidth: 1,
      });
    }
  }
}

export async function fillForm3AForm(
  data: OfficialFormData,
  options: EnglandOfficialFormOptions = {},
): Promise<Uint8Array> {
  if (options.flatten) {
    console.warn('⚠️ [Form3A] Flattening official notice PDFs is disabled. Preserving editable AcroForm fields.');
  }

  const pdfDoc = await loadOfficialForm('Form_3A.pdf');
  const form = pdfDoc.getForm();

  const property = getAddressParts(data, 'property');
  const landlord = getAddressParts(data, 'landlord');
  const earliestCourtDate = calculateEarliestCourtDate(data);
  const signatureDate = data.signature_date || new Date().toISOString().split('T')[0];
  const extraSheetDate = data.extra_sheet_signature_date || data.signature_date || '';
  const tenantNames = [
    data.tenant_full_name,
    data.tenant_2_name,
    data.tenant_3_name,
    data.tenant_4_name,
  ]
    .filter(Boolean)
    .join('\n');
  const checkboxValues = getEnglandCommonReasonCheckboxes(
    normalizeList(data.ground_codes || data.selected_grounds || data.ground_numbers),
  );
  const jointSignatories = buildJointSignatoryLines(data);
  const signatoryCapacity = String(data.signatory_capacity || 'landlord').toLowerCase();
  const draftedExplanation = buildEnglandForm3AExplanation(data);
  const rawExplanation = String(data.form3a_explanation || '').trim();
  const signatoryName = data.signatory_name || data.landlord_full_name || '';
  const form3AExplanation =
    rawExplanation && !isThinEnglandNarrative(rawExplanation)
      ? rawExplanation
      : draftedExplanation || rawExplanation || data.particulars_of_claim || '';

  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.tenantNames, tenantNames);
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.propertyLine1, property.line1);
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.propertyLine2, property.line2);
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.propertyCity, property.city);
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.propertyCounty, property.county);
  setTextValue(
    form,
    FORM3A_OFFICIAL_FIELD_NAMES.text.propertyPostcode,
    formatOfficialPostcodeFieldValue(property.postcode),
  );
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.earliestDate, formatCombDateValue(earliestCourtDate));

  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.rentArrearsSerious, checkboxValues.rent_arrears_serious);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.rentArrearsOther, checkboxValues.rent_arrears_other);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.useOrSale, checkboxValues.use_or_sale);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.studentsOrWorkers, checkboxValues.students_or_workers);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.redevelopment, checkboxValues.redevelopment);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.asbOrLegalBreach, checkboxValues.asb_or_legal_breach);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.tenancyBreach, checkboxValues.tenancy_breach);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.deterioration, checkboxValues.deterioration);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.noRightToRent, checkboxValues.no_right_to_rent);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.other, checkboxValues.other);

  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.groundsText, data.form3a_grounds_text || data.ground_particulars || '');
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.explanationText, form3AExplanation);

  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.signature, signatoryName);
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.capacityLandlord, signatoryCapacity === 'landlord');
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.capacityAgent, signatoryCapacity === 'agent' || signatoryCapacity === 'solicitor');
  setCheckboxValue(form, FORM3A_OFFICIAL_FIELD_NAMES.checkboxes.capacityLicensor, signatoryCapacity === 'licensor');
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.signatureDate, formatCombDateValue(signatureDate));
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryName, signatoryName);
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryLine1, landlord.line1);
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryLine2, landlord.line2);
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryCity, landlord.city);
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryCounty, landlord.county);
  setTextValue(
    form,
    FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryPostcode,
    formatOfficialPostcodeFieldValue(landlord.postcode),
  );
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryPhone, data.landlord_phone || data.service_phone || '');
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryEmail, data.landlord_email || data.service_email || '');

  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.jointSignatory1, jointSignatories[0] || '');
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.jointSignatory2, jointSignatories[1] || '');
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.jointSignatory3, jointSignatories[2] || '');
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.extraSheetText, data.form3a_extra_sheet_text || data.extra_sheet_text || '');
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.extraSheetSignature, data.extra_sheet_signature || '');
  setTextValue(form, FORM3A_OFFICIAL_FIELD_NAMES.text.extraSheetDate, formatCombDateValue(extraSheetDate));

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  form.updateFieldAppearances(helvetica);

  return pdfDoc.save();
}

export async function fillN325Form(
  data: OfficialFormData,
  _options: EnglandOfficialFormOptions = {},
): Promise<Uint8Array> {
  const pdfDoc = await loadOfficialForm('n325-eng.pdf');
  const form = pdfDoc.getForm();
  const claimantAddress = [data.landlord_full_name, data.landlord_address].filter(Boolean).join('\n');
  const defendantAddress = [data.tenant_full_name, data.property_address].filter(Boolean).join('\n');

  setExistingTextField(form, 'In the - court', data.court_name);
  setExistingTextField(form, 'Claim number', data.claim_number || data.claim_reference);
  setExistingTextField(form, 'Fee Account number', data.claimant_reference);
  setExistingTextField(form, "Claimant's name and address", claimantAddress);
  setExistingTextField(
    form,
    "Claimant's name, address, ref and phone",
    [claimantAddress, data.claimant_reference, data.landlord_phone].filter(Boolean).join('\n'),
  );
  setExistingTextField(form, "Defendant's name and address", defendantAddress);
  setExistingTextField(form, 'Balance due at the date of this request', formatCurrency(data.total_arrears || data.total_claim_amount));
  setExistingTextField(form, 'Amount for which warrant to issue', formatCurrency(data.total_claim_amount || data.total_arrears));
  setExistingTextField(form, 'Issue fee', formatCurrency(data.court_fee));
  setExistingTextField(form, "Legal representative's costs", formatCurrency(data.solicitor_costs));
  setExistingTextField(form, 'Land Registry Fee', formatCurrency(data.land_registry_fee));
  setExistingTextField(form, 'Total', formatCurrency(data.total_claim_amount || data.total_arrears));
  setExistingTextField(form, 'Sum due after the warrant is paid', formatCurrency(data.sum_due_after_warrant || data.total_arrears));
  setExistingTextField(form, 'Date of judgement/order', data.judgment_date || data.possession_order_date);
  setExistingTextField(form, 'Date of possession', data.possession_date || data.possession_order_date);
  setExistingTextField(form, 'Describe the land', data.property_address);
  setExistingTextField(form, 'Date of signature', data.signature_date);
  setExistingTextField(form, 'Defendants proceeded against', data.tenant_full_name);
  setExistingTextField(form, 'daytime phone number', data.landlord_phone);
  setExistingTextField(form, 'evening phone number', data.landlord_evening_phone);
  setExistingTextField(form, 'contact name', data.signatory_name || data.landlord_full_name);
  setExistingTextField(form, 'Defendant’s phone number', data.defendant_phone || data.tenant_phone);
  setExistingTextField(form, 'Any other information which may help the bailiff', data.bailiff_information);

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  form.updateFieldAppearances(helvetica);

  return pdfDoc.save();
}

export async function fillN325AForm(
  data: OfficialFormData,
  _options: EnglandOfficialFormOptions = {},
): Promise<Uint8Array> {
  const pdfDoc = await loadOfficialForm('N325A.pdf');
  const form = pdfDoc.getForm();
  const claimantAddress = [data.landlord_full_name, data.landlord_address].filter(Boolean).join('\n');
  const serviceAddress = [data.service_address || data.landlord_address].filter(Boolean).join('\n');
  const defendantAddress = [data.tenant_full_name, data.property_address].filter(Boolean).join('\n');

  setExistingTextField(form, '1 Claimant’s name and address', claimantAddress);
  setExistingTextField(form, '2 Name and address for service and payment (if different from above)', serviceAddress);
  setExistingTextField(form, 'Ref/Tel No', [data.claimant_reference, data.landlord_phone].filter(Boolean).join(' / '));
  setExistingTextField(form, '3 Defendant’s name and address', defendantAddress);
  setExistingTextField(form, 'Name of the court', data.court_name);
  setExistingTextField(form, 'Claim Number', data.claim_number || data.claim_reference);
  setExistingTextField(form, 'Fee account number', data.claimant_reference);
  setExistingTextField(form, '(A) Balance due at the date of this request', formatCurrency(data.total_arrears || data.total_claim_amount));
  setExistingTextField(form, '(B) Amount for which warrant to issue', formatCurrency(data.total_claim_amount || data.total_arrears));
  setExistingTextField(form, 'Issue fee', formatCurrency(data.court_fee));
  setExistingTextField(form, 'Legal representative’s costs', formatCurrency(data.solicitor_costs));
  setExistingTextField(form, 'Land Registry fee', formatCurrency(data.land_registry_fee));
  setExistingTextField(form, 'TOTAL', formatCurrency(data.total_claim_amount || data.total_arrears));
  setExistingTextField(form, 'sum due  after the warrant is paid will be', formatCurrency(data.sum_due_after_warrant || data.total_arrears));
  setExistingTextField(form, 'Date of judgment/order', data.judgment_date || data.possession_order_date);
  setExistingTextField(form, 'Date of possession', data.possession_date || data.possession_order_date);
  setExistingTextField(form, 'Describe the land (as set out in the particulars of claim)', data.property_address);
  setExistingTextField(form, 'Dated', data.signature_date);
  setExistingTextField(form, 'name(s) of the defendant(s) you wish to proceed against', data.tenant_full_name);
  setExistingTextField(form, 'Daytime phone number', data.landlord_phone);
  setExistingTextField(form, 'Evening phone number (if possible)', data.landlord_evening_phone);
  setExistingTextField(form, 'Contact name (where appropriate)', data.signatory_name || data.landlord_full_name);
  setExistingTextField(form, 'Defendant’s phone number (if known)', data.defendant_phone || data.tenant_phone);
  setExistingTextField(form, 'Information for bailiff', data.bailiff_information);

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  form.updateFieldAppearances(helvetica);

  return pdfDoc.save();
}
