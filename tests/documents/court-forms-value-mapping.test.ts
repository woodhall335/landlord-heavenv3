/**
 * Court Forms Value Mapping Tests
 *
 * These tests verify that court form PDFs are filled correctly with the expected values.
 * They fill the form, load the result using pdf-lib, and assert actual field content.
 *
 * Forms tested:
 * - N5: Standard possession claim (Section 8)
 * - N5B: Accelerated possession (Section 21)
 * - N119: Particulars of claim
 */

import { describe, test, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import {
  fillN5Form,
  fillN5BForm,
  fillN119Form,
  type CaseData,
} from '@/lib/documents/official-forms-filler';

/**
 * Helper to read a text field value from a filled PDF
 */
async function getTextFieldValue(
  pdfBytes: Uint8Array,
  fieldName: string
): Promise<string | undefined> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  try {
    const field = form.getTextField(fieldName);
    return field.getText() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Create test case data with all required fields for N5/N5B/N119
 */
function createTestCaseData(overrides: Partial<CaseData> = {}): CaseData {
  return {
    landlord_full_name: 'Test Landlord',
    landlord_address: '123 Landlord Street\nLondon\nSW1A 1AA',
    landlord_postcode: 'SW1A 1AA',
    landlord_phone: '0207 123 4567',
    landlord_email: 'landlord@test.com',
    tenant_full_name: 'Test Tenant',
    tenant_2_name: undefined,
    property_address: '456 Property Road\nManchester\nM1 1AA',
    property_postcode: 'M1 1AA',
    tenancy_start_date: '2023-01-01',
    fixed_term: true,
    fixed_term_end_date: '2024-01-01',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    claim_type: 'section_8',
    ground_numbers: '8, 10, 11',
    ground_codes: ['8', '10', '11'],
    section_8_notice_date: '2024-06-01',
    section_21_notice_date: '2024-06-01',  // Required for N5B
    notice_served_date: '2024-06-01',
    notice_service_method: 'First class post',  // Required for N5B
    particulars_of_claim: 'The tenant owes rent arrears.',
    total_arrears: 3600,
    arrears_at_notice_date: 3600,
    court_fee: 355,
    solicitor_costs: 100,
    deposit_amount: 1200,
    deposit_scheme: 'DPS',
    deposit_protection_date: '2023-01-15',
    deposit_reference: 'DPS123456',
    signatory_name: 'Test Landlord',
    signature_date: '2024-07-01',
    // Court details - critical for these tests
    court_name: 'Manchester County Court',
    court_address: '1 Bridge Street West, Manchester, M60 9DJ',
    ...overrides,
  };
}

describe('Court Forms Value Mapping', () => {
  describe('N5 Form', () => {
    test('populates court name field correctly', async () => {
      const data = createTestCaseData({
        court_name: 'Birmingham Civil Justice Centre',
      });

      const pdfBytes = await fillN5Form(data, { flatten: false });
      const courtName = await getTextFieldValue(pdfBytes, 'In the court');

      expect(courtName).toBe('Birmingham Civil Justice Centre');
    });

    test('populates claimant details correctly', async () => {
      const data = createTestCaseData({
        landlord_full_name: 'John Smith',
        landlord_address: '10 High Street\nLondon\nW1A 1AA',
      });

      const pdfBytes = await fillN5Form(data, { flatten: false });
      // N5 PDF uses straight apostrophe (') in field name
      const claimantDetails = await getTextFieldValue(pdfBytes, "claimant's details");

      expect(claimantDetails).toBeDefined();
      expect(claimantDetails).toContain('John Smith');
      expect(claimantDetails).toContain('10 High Street');
    });

    test('populates defendant details correctly', async () => {
      const data = createTestCaseData({
        tenant_full_name: 'Jane Doe',
        property_address: '20 Oak Avenue\nBirmingham\nB1 1AA',
      });

      const pdfBytes = await fillN5Form(data, { flatten: false });
      // N5 PDF uses curly apostrophe (') in field name
      const defendantDetails = await getTextFieldValue(pdfBytes, "defendant's details");

      expect(defendantDetails).toBeDefined();
      expect(defendantDetails).toContain('Jane Doe');
      expect(defendantDetails).toContain('20 Oak Avenue');
    });

    test('populates property address in possession field', async () => {
      const data = createTestCaseData({
        property_address: '99 Test Lane\nLeeds\nLS1 1AA',
      });

      const pdfBytes = await fillN5Form(data, { flatten: false });
      const possessionOf = await getTextFieldValue(pdfBytes, 'possession of');

      expect(possessionOf).toBe('99 Test Lane\nLeeds\nLS1 1AA');
    });

    test('throws error when court_name is missing', async () => {
      const data = createTestCaseData({
        court_name: undefined,
      });

      await expect(fillN5Form(data)).rejects.toThrow('court_name is required');
    });

    test('throws error when court_name is empty string', async () => {
      const data = createTestCaseData({
        court_name: '',
      });

      await expect(fillN5Form(data)).rejects.toThrow('court_name is required');
    });

    test('throws error when landlord_full_name is missing', async () => {
      const data = createTestCaseData({
        landlord_full_name: '',
      });

      await expect(fillN5Form(data)).rejects.toThrow('landlord_full_name is required');
    });

    test('throws error when tenant_full_name is missing', async () => {
      const data = createTestCaseData({
        tenant_full_name: '',
      });

      await expect(fillN5Form(data)).rejects.toThrow('tenant_full_name is required');
    });

    test('throws error when property_address is missing', async () => {
      const data = createTestCaseData({
        property_address: '',
      });

      await expect(fillN5Form(data)).rejects.toThrow('property_address is required');
    });
  });

  describe('N5B Form', () => {
    test('populates court name and address correctly', async () => {
      const data = createTestCaseData({
        court_name: 'Central London County Court',
        court_address: 'Thomas More Building, Royal Courts of Justice, Strand, London WC2A 2LL',
        claim_type: 'section_21',
      });

      const pdfBytes = await fillN5BForm(data, { flatten: false });
      const courtField = await getTextFieldValue(pdfBytes, 'Name and address of the court');

      // N5B has a single field for both name and address
      expect(courtField).toContain('Central London County Court');
      expect(courtField).toContain('Thomas More Building');
      expect(courtField).toContain('WC2A 2LL');
    });

    test('populates claimant names correctly', async () => {
      const data = createTestCaseData({
        landlord_full_name: 'Robert Johnson',
        landlord_2_name: 'Mary Johnson',
        claim_type: 'section_21',
      });

      const pdfBytes = await fillN5BForm(data, { flatten: false });
      const claimantNames = await getTextFieldValue(
        pdfBytes,
        'Enter the full names of the Claimants'
      );

      expect(claimantNames).toContain('Robert Johnson');
      expect(claimantNames).toContain('Mary Johnson');
    });

    test('populates defendant names correctly', async () => {
      const data = createTestCaseData({
        tenant_full_name: 'Alice Brown',
        tenant_2_name: 'Bob Brown',
        claim_type: 'section_21',
      });

      const pdfBytes = await fillN5BForm(data, { flatten: false });
      const defendantNames = await getTextFieldValue(
        pdfBytes,
        'Enter the full names of the Defendants'
      );

      expect(defendantNames).toContain('Alice Brown');
      expect(defendantNames).toContain('Bob Brown');
    });

    test('populates property address in possession claim field', async () => {
      const data = createTestCaseData({
        property_address: '42 Maple Drive\nBristol\nBS1 1AA',
        claim_type: 'section_21',
      });

      const pdfBytes = await fillN5BForm(data, { flatten: false });
      const possessionAddress = await getTextFieldValue(
        pdfBytes,
        'The Claimant is claiming possession of'
      );

      expect(possessionAddress).toBe('42 Maple Drive\nBristol\nBS1 1AA');
    });

    test('populates notice service method correctly', async () => {
      const data = createTestCaseData({
        notice_service_method: 'By hand',
        claim_type: 'section_21',
      });

      const pdfBytes = await fillN5BForm(data, { flatten: false });
      const serviceMethod = await getTextFieldValue(pdfBytes, '10a How was the notice served');

      expect(serviceMethod).toBe('By hand');
    });

    test('handles court name only (no address)', async () => {
      const data = createTestCaseData({
        court_name: 'Liverpool Civil and Family Court',
        court_address: undefined,
        claim_type: 'section_21',
      });

      const pdfBytes = await fillN5BForm(data, { flatten: false });
      const courtField = await getTextFieldValue(pdfBytes, 'Name and address of the court');

      expect(courtField).toBe('Liverpool Civil and Family Court');
    });

    test('throws error when court_name is missing', async () => {
      const data = createTestCaseData({
        court_name: undefined,
        claim_type: 'section_21',
      });

      await expect(fillN5BForm(data)).rejects.toThrow('court_name is required');
    });

    test('throws error when notice_service_method is missing', async () => {
      const data = createTestCaseData({
        notice_service_method: undefined,
        claim_type: 'section_21',
      });

      await expect(fillN5BForm(data)).rejects.toThrow(
        'notice_service_method is required for N5B'
      );
    });

    test('throws error when section_21_notice_date is missing', async () => {
      const data = createTestCaseData({
        section_21_notice_date: undefined,
        claim_type: 'section_21',
      });

      await expect(fillN5BForm(data)).rejects.toThrow('section_21_notice_date is required');
    });

    test('throws error when tenancy_start_date is missing', async () => {
      const data = createTestCaseData({
        tenancy_start_date: '',
        claim_type: 'section_21',
      });

      await expect(fillN5BForm(data)).rejects.toThrow('tenancy_start_date is required');
    });
  });

  describe('N119 Form', () => {
    test('populates court name field correctly', async () => {
      const data = createTestCaseData({
        court_name: 'Leeds Combined Court Centre',
      });

      const pdfBytes = await fillN119Form(data, { flatten: false });
      const courtName = await getTextFieldValue(pdfBytes, 'name of court');

      expect(courtName).toBe('Leeds Combined Court Centre');
    });

    test('populates claimant name correctly', async () => {
      const data = createTestCaseData({
        landlord_full_name: 'Property Holdings Ltd',
      });

      const pdfBytes = await fillN119Form(data, { flatten: false });
      const claimantName = await getTextFieldValue(pdfBytes, 'name of claimant');

      expect(claimantName).toBe('Property Holdings Ltd');
    });

    test('populates defendant name correctly', async () => {
      const data = createTestCaseData({
        tenant_full_name: 'Thomas Wilson',
      });

      const pdfBytes = await fillN119Form(data, { flatten: false });
      const defendantName = await getTextFieldValue(pdfBytes, 'name of defendant');

      expect(defendantName).toBe('Thomas Wilson');
    });

    test('populates property address in possession field', async () => {
      const data = createTestCaseData({
        property_address: '77 Garden Way\nSheffield\nS1 1AA',
      });

      const pdfBytes = await fillN119Form(data, { flatten: false });
      const possessionAddress = await getTextFieldValue(
        pdfBytes,
        'The claimant has a right to possession of:'
      );

      expect(possessionAddress).toBe('77 Garden Way\nSheffield\nS1 1AA');
    });

    test('populates tenancy type correctly', async () => {
      const data = createTestCaseData({
        tenancy_type: 'Periodic Tenancy',
      });

      const pdfBytes = await fillN119Form(data, { flatten: false });
      const tenancyType = await getTextFieldValue(pdfBytes, '3(a) Type of tenancy');

      expect(tenancyType).toBe('Periodic Tenancy');
    });

    test('uses default tenancy type when not specified', async () => {
      const data = createTestCaseData({
        tenancy_type: undefined,
      });

      const pdfBytes = await fillN119Form(data, { flatten: false });
      const tenancyType = await getTextFieldValue(pdfBytes, '3(a) Type of tenancy');

      expect(tenancyType).toBe('Assured Shorthold Tenancy');
    });

    test('throws error when court_name is missing', async () => {
      const data = createTestCaseData({
        court_name: undefined,
      });

      await expect(fillN119Form(data)).rejects.toThrow('court_name is required');
    });

    test('throws error when tenancy_start_date is missing', async () => {
      const data = createTestCaseData({
        tenancy_start_date: '',
      });

      await expect(fillN119Form(data)).rejects.toThrow('tenancy_start_date is required');
    });
  });

  describe('Court Details Integration', () => {
    test('same court details used across all forms', async () => {
      const courtName = 'Newcastle upon Tyne Combined Court Centre';
      const courtAddress = 'The Law Courts, Quayside, Newcastle upon Tyne, NE1 3LA';

      const data = createTestCaseData({
        court_name: courtName,
        court_address: courtAddress,
      });

      // Fill all forms
      const n5Bytes = await fillN5Form(data, { flatten: false });
      const n5bBytes = await fillN5BForm(data, { flatten: false });
      const n119Bytes = await fillN119Form(data, { flatten: false });

      // Check N5
      const n5CourtName = await getTextFieldValue(n5Bytes, 'In the court');
      expect(n5CourtName).toBe(courtName);

      // Check N5B (combined field)
      const n5bCourtField = await getTextFieldValue(n5bBytes, 'Name and address of the court');
      expect(n5bCourtField).toContain(courtName);
      expect(n5bCourtField).toContain(courtAddress);

      // Check N119
      const n119CourtName = await getTextFieldValue(n119Bytes, 'name of court');
      expect(n119CourtName).toBe(courtName);
    });
  });

  describe('Strict Field Validation', () => {
    test('N5 validates all required fields before filling', async () => {
      // Missing multiple required fields
      const data = {
        landlord_full_name: '',
        landlord_address: '',
        tenant_full_name: '',
        property_address: '',
        signatory_name: '',
        signature_date: '',
        rent_amount: 0,
        rent_frequency: 'monthly' as const,
        tenancy_start_date: '',
        court_name: '',
      };

      await expect(fillN5Form(data as CaseData)).rejects.toThrow('is required');
    });

    test('N5B validates notice service method specifically', async () => {
      const data = createTestCaseData({
        notice_service_method: '', // Empty string should fail
      });

      await expect(fillN5BForm(data)).rejects.toThrow('notice_service_method is required');
    });

    test('N119 validates required fields', async () => {
      const data = {
        landlord_full_name: '',
        landlord_address: '',
        tenant_full_name: '',
        property_address: '',
        signatory_name: '',
        signature_date: '',
        rent_amount: 0,
        rent_frequency: 'monthly' as const,
        tenancy_start_date: '',
        court_name: '',
      };

      await expect(fillN119Form(data as CaseData)).rejects.toThrow('is required');
    });
  });
});
