import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';

import { generateEnglandN215PDF } from '@/lib/documents/england-n215-generator';
import { fillN5Form, fillN119Form, type CaseData } from '@/lib/documents/official-forms-filler';
import {
  N119_FIELD_MATRIX,
  N215_FIELD_MATRIX,
  N5_FIELD_MATRIX,
  buildFieldCoverageMatrix,
  listManualFields,
} from '@/lib/documents/eviction-official-form-matrix';

const BASE_CASE_DATA: CaseData = {
  jurisdiction: 'england',
  landlord_full_name: 'Daniel Mercer',
  landlord_address: '27 Rowan Avenue\nLeeds\nLS8 2PF',
  landlord_postcode: 'LS8 2PF',
  landlord_phone: '07123456789',
  landlord_email: 'alex@example.com',
  tenant_full_name: 'Ivy Carleton',
  property_address: '16 Willow Mews\nYork\nYO24 3HX',
  property_postcode: 'YO24 3HX',
  tenancy_start_date: '2024-01-01',
  tenancy_type: 'Assured Shorthold Tenancy',
  rent_amount: 1200,
  rent_frequency: 'monthly',
  claim_type: 'section_8',
  ground_numbers: 'Ground 8, Ground 10',
  ground_codes: ['8', '10'],
  section_8_notice_date: '2026-04-25',
  notice_served_date: '2026-04-25',
  notice_service_method: 'first_class_post',
  total_arrears: 3600,
  court_fee: 404,
  service_address_line1: '27 Rowan Avenue',
  service_address_line2: 'Leeds',
  service_postcode: 'LS8 2PF',
  court_name: 'York County Court and Family Court',
  signatory_name: 'Daniel Mercer',
  signature_date: '2026-04-25',
};

async function getFieldMap(pdfBytes: Uint8Array) {
  const pdf = await PDFDocument.load(pdfBytes);
  const form = pdf.getForm();
  const result = new Map<string, string | boolean>();

  for (const field of form.getFields()) {
    const type = field.constructor.name;
    if (type === 'PDFTextField') {
      result.set(field.getName(), field.getText() || '');
    } else if (type === 'PDFCheckBox') {
      result.set(field.getName(), field.isChecked());
    }
  }

  return result;
}

async function getFieldNames(pdfBytes: Uint8Array) {
  const pdf = await PDFDocument.load(pdfBytes);
  return pdf.getForm().getFields().map((field) => field.getName());
}

function getBlankFieldNames(fields: Map<string, string | boolean>) {
  return [...fields.entries()]
    .filter(([, value]) => value === '' || value === false)
    .map(([name]) => name);
}

function expectAutoFieldsPopulated(fields: Map<string, string | boolean>, fieldNames: string[], label: string) {
  for (const fieldName of fieldNames) {
    const value = fields.get(fieldName);
    expect(value, `Expected ${label} auto field "${fieldName}" to be populated`).not.toBe('');
    expect(value, `Expected ${label} auto field "${fieldName}" to be populated`).not.toBe(false);
    expect(value, `Expected ${label} auto field "${fieldName}" to be populated`).not.toBeUndefined();
  }
}

describe('England eviction official forms', () => {
  it('classifies every official field on N215, N5, and N119 as auto, conditional, or manual', () => {
    const matrices = [N215_FIELD_MATRIX, N5_FIELD_MATRIX, N119_FIELD_MATRIX];

    for (const matrix of matrices) {
      const coverage = buildFieldCoverageMatrix(matrix);
      const names = coverage.map((entry) => entry.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(matrix.allFields.length);
      expect(names).toEqual(matrix.allFields);
      expect(coverage.length).toBe(matrix.allFields.length);
      expect(listManualFields(matrix).length).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps the field matrix aligned with the live official PDFs', async () => {
    const n215Pdf = await generateEnglandN215PDF({
      court_name: 'York County Court and Family Court',
      claimant_name: 'Daniel Mercer',
      defendant_name: 'Ivy Carleton',
      signatory_name: 'Daniel Mercer',
      document_served: 'Form 3A notice',
      service_date: '2026-04-25',
      signature_date: '2026-04-25',
      service_method: 'first_class_post',
      service_address_line1: '16 Willow Mews',
      service_address_town: 'York',
      service_address_postcode: 'YO24 3HX',
      recipient_name: 'Ivy Carleton',
    });
    const n5Pdf = await fillN5Form(BASE_CASE_DATA);
    const n119Pdf = await fillN119Form(BASE_CASE_DATA);

    expect(await getFieldNames(n215Pdf)).toEqual(N215_FIELD_MATRIX.allFields);
    expect(await getFieldNames(n5Pdf)).toEqual(N5_FIELD_MATRIX.allFields);
    expect(await getFieldNames(n119Pdf)).toEqual(N119_FIELD_MATRIX.allFields);
  });

  it('prefills the core editable N215 fields that the packs rely on', async () => {
    const pdfBytes = await generateEnglandN215PDF({
      court_name: 'York County Court and Family Court',
      claimant_name: 'Daniel Mercer',
      defendant_name: 'Ivy Carleton',
      signatory_name: 'Daniel Mercer',
      document_served: 'Form 3A notice',
      service_date: '2026-04-25',
      signature_date: '2026-04-25',
      service_method: 'first_class_post',
      service_address_line1: '16 Willow Mews',
      service_address_town: 'York',
      service_address_postcode: 'YO24 3HX',
      recipient_name: 'Ivy Carleton',
    });

    const fields = await getFieldMap(pdfBytes);

    expect(fields.get('Text Field 1')).toBe('York County Court and Family Court');
    expect(fields.get('Text Field 3')).toBe('Daniel Mercer');
    expect(fields.get('Text Field 4')).toBe('Ivy Carleton');
    expect(fields.get('Text Field 93')).toBe('25/04/26');
    expect(fields.get('Text Field 94')).toBe('25/04/26');
    expect(fields.get('Text16')).toBe('YO243HX');
    expect(fields.get('Text Field 91')).toBe('Daniel Mercer');
    expect(fields.get('Text Field 87')).toBe('Daniel Mercer');
    expect(fields.get('Text Field 90')).toBe('25');
    expect(fields.get('Text Field 89')).toBe('04');
    expect(fields.get('Text Field 88')).toBe('26');
    expect(fields.get('Check Box3')).toBe(true);
    expect(fields.get('Check Box22')).toBe(true);
    expect(fields.get('Check Box25')).toBe(true);
    expect(fields.get('Check Box40')).toBe(true);

    expectAutoFieldsPopulated(fields, N215_FIELD_MATRIX.autoFields, 'N215');
  });

  it('leaves only explicitly classified non-auto blanks on the generated N215 sample', async () => {
    const pdfBytes = await generateEnglandN215PDF({
      court_name: 'York County Court and Family Court',
      claimant_name: 'Daniel Mercer',
      defendant_name: 'Ivy Carleton',
      signatory_name: 'Daniel Mercer',
      document_served: 'Form 3A notice',
      service_date: '2026-04-25',
      signature_date: '2026-04-25',
      service_method: 'first_class_post',
      service_address_line1: '16 Willow Mews',
      service_address_town: 'York',
      service_address_postcode: 'YO24 3HX',
      recipient_name: 'Ivy Carleton',
    });

    const fields = await getFieldMap(pdfBytes);
    const blanks = new Set(getBlankFieldNames(fields));
    const allowedBlankFields = new Set([...N215_FIELD_MATRIX.conditionalFields, ...listManualFields(N215_FIELD_MATRIX)]);

    expect([...blanks].sort()).toEqual([...allowedBlankFields].filter((name) => blanks.has(name)).sort());
  });

  it('fills the core N5 possession-claim fields and keeps the statement block populated', async () => {
    const pdfBytes = await fillN5Form(BASE_CASE_DATA);
    const fields = await getFieldMap(pdfBytes);

    expect(fields.get('In the court')).toBe('York County Court and Family Court');
    expect(fields.get("claimant's details")).toBe('Daniel Mercer\n27 Rowan Avenue\nLeeds\nLS8 2PF');
    expect(fields.get("defendant's details")).toBe('Ivy Carleton\n16 Willow Mews\nYork\nYO24 3HX');
    expect(fields.get('rent arrears - yes')).toBe(true);
    expect(fields.get('Statement of Truth is signed by the Claimant')).toBe(true);
    expect(fields.get('Full name of the person signing the Statement of Truth')).toBe('Daniel Mercer');
    expect(fields.get('Date the Statement of Truth is signed - DD')).toBe('25');
    expect(fields.get('Date the Statement of Truth is signed - MM')).toBe('04');
    expect(fields.get('Date the Statement of Truth is signed - YYYY')).toBe('2026');
    expect(
      fields.get("Postcode - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent")
    ).toBe('LS8 2PF');

    expectAutoFieldsPopulated(fields, N5_FIELD_MATRIX.autoFields, 'N5');
  });

  it('leaves only explicitly classified non-auto blanks on the generated N5 sample', async () => {
    const pdfBytes = await fillN5Form(BASE_CASE_DATA);
    const fields = await getFieldMap(pdfBytes);
    const blanks = new Set(getBlankFieldNames(fields));
    const allowedBlankFields = new Set([...N5_FIELD_MATRIX.conditionalFields, ...listManualFields(N5_FIELD_MATRIX)]);

    expect([...blanks].sort()).toEqual([...allowedBlankFields].filter((name) => blanks.has(name)).sort());
  });

  it('fills the core N119 particulars fields for an arrears-led Section 8 claim', async () => {
    const pdfBytes = await fillN119Form(BASE_CASE_DATA);
    const fields = await getFieldMap(pdfBytes);

    expect(fields.get('name of court')).toBe('York County Court and Family Court');
    expect(fields.get('name of claimant')).toBe('Daniel Mercer');
    expect(fields.get('name of defendant')).toBe('Ivy Carleton');
    expect(fields.get('3(b) The current rent is')).toBe('£1200.00');
    expect(fields.get('3(b) The current rent is payable each month')).toBe('X');
    expect(fields.get('6. Other type of notice')).toBe('Notice seeking possession (Form 3A)');
    expect(fields.get('6. Day and month notice served')).toBe('25 April');
    expect(fields.get('6. Year notice served')).toBe('26');
    expect(fields.get('Statement of Truth signed by Claimant')).toBe(true);
    expect(fields.get('Full name of person signing the Statement of Truth')).toBe('Daniel Mercer');

    const reasonA = String(fields.get('4. (a) The reason the claimant is asking for possession is:') || '');
    expect(reasonA).toContain('Ground 8');
    expect(reasonA).toContain('£3,600.00');

    expectAutoFieldsPopulated(fields, N119_FIELD_MATRIX.autoFields, 'N119');
  });

  it('leaves only explicitly classified non-auto blanks on the generated N119 sample', async () => {
    const pdfBytes = await fillN119Form(BASE_CASE_DATA);
    const fields = await getFieldMap(pdfBytes);
    const blanks = new Set(getBlankFieldNames(fields));
    const allowedBlankFields = new Set([...N119_FIELD_MATRIX.conditionalFields, ...listManualFields(N119_FIELD_MATRIX)]);

    expect([...blanks].sort()).toEqual([...allowedBlankFields].filter((name) => blanks.has(name)).sort());
  });
});
