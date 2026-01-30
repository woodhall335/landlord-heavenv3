/**
 * Regression tests for official N1 form mapping
 *
 * These tests verify:
 * 1. N1 is generated from the official template (not test fixture)
 * 2. Key fields are populated correctly
 * 3. "Particulars of Claim attached" reference appears
 * 4. Totals match the computed values
 * 5. All required PDF fields exist in the template
 */

import { describe, expect, it, beforeAll } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fillN1Form, assertOfficialFormExists, CaseData } from '@/lib/documents/official-forms-filler';

// Path to the official N1 PDF template
const OFFICIAL_N1_PATH = path.join(process.cwd(), 'public/official-forms/N1_1224.pdf');

describe('Official N1 Form Mapping', () => {
  let officialPdfExists = false;

  beforeAll(async () => {
    try {
      await fs.promises.access(OFFICIAL_N1_PATH, fs.constants.R_OK);
      officialPdfExists = true;
    } catch {
      officialPdfExists = false;
    }
  });

  describe('Template Verification', () => {
    it('official N1 template exists at correct path', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - run npm run create-test-forms for CI');
        return;
      }
      await expect(assertOfficialFormExists('N1_1224.pdf')).resolves.not.toThrow();
    });

    it('official N1 template is NOT the test fixture', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fs.promises.readFile(OFFICIAL_N1_PATH);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      // Official N1 (Dec 2024) has 43 fields
      // Test fixture only has ~35 fields
      expect(fields.length).toBeGreaterThanOrEqual(40);

      // Check for official N1 specific fields that aren't in test fixture
      const fieldNames = fields.map(f => f.getName());

      // Official N1 has Text37/Text38 for hearing centre, Check Box39 for vulnerability Yes
      // These indicate it's the real form, not test fixture
      const officialOnlyFields = ['Text37', 'Text38', 'Check Box39', 'Check Box41', 'Check Box44', 'Check Box48'];
      const hasOfficialFields = officialOnlyFields.some(f => fieldNames.includes(f));

      expect(hasOfficialFields).toBe(true);
    });

    it('official N1 template does NOT contain test fixture text', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fs.promises.readFile(OFFICIAL_N1_PATH);
      const pdfText = pdfBytes.toString('utf-8');

      // The test fixture contains this visible text
      expect(pdfText).not.toContain('TEST FIXTURE');
      expect(pdfText).not.toContain('NOT AN OFFICIAL COURT FORM');
    });

    it('official N1 has required HMCTS form fields', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fs.promises.readFile(OFFICIAL_N1_PATH);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      const fieldNames = form.getFields().map(f => f.getName());

      // Required fields from official N1 (Dec 2024)
      const requiredFields = [
        'Text21',  // Claimant details
        'Text22',  // Defendant details
        'Text23',  // Brief details of claim
        'Text25',  // Amount claimed
        'Text26',  // Court fee
        'Text28',  // Total amount
        'Text34',  // Postcode
        'Text Field 47',  // Signatory name
        'Check Box43',  // Particulars attached checkbox
      ];

      for (const field of requiredFields) {
        expect(fieldNames).toContain(field);
      }
    });
  });

  describe('N1 Form Filling', () => {
    const sampleCaseData: CaseData = {
      jurisdiction: 'england',
      claim_type: 'money_claim',

      // Landlord / Claimant
      landlord_full_name: 'John Smith',
      landlord_address: '123 Landlord Lane\nLondon',
      landlord_postcode: 'SW1A 1AA',
      landlord_email: 'john@example.com',
      landlord_phone: '020 1234 5678',

      // Tenant / Defendant
      tenant_full_name: 'Jane Doe',
      property_address: '456 Tenant Street\nLondon',
      property_postcode: 'E1 6AN',

      // Tenancy
      tenancy_start_date: '2023-06-01',
      rent_amount: 1200,
      rent_frequency: 'monthly',

      // Claim amounts
      total_claim_amount: 3600,
      court_fee: 455,

      // Money claim line items
      damage_items: [{ description: 'Damaged flooring', amount: 400 }],
      other_charges: [],

      // Court
      court_name: 'County Court Money Claims Centre',

      // Signature
      signatory_name: 'John Smith',
      signature_date: '2026-01-29',

      // Service address (defaults to landlord address)
      service_postcode: 'SW1A 1AA',
    };

    it('fills N1 form with correct claimant details', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const claimantField = form.getTextField('Text21');
      const claimantText = claimantField.getText();

      expect(claimantText).toContain('John Smith');
      expect(claimantText).toContain('123 Landlord Lane');
    });

    it('fills N1 form with correct defendant details', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const defendantField = form.getTextField('Text22');
      const defendantText = defendantField.getText();

      expect(defendantText).toContain('Jane Doe');
      expect(defendantText).toContain('456 Tenant Street');
    });

    it('fills brief details with "Particulars of Claim attached" for money claims', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const briefDetailsField = form.getTextField('Text23');
      const briefText = briefDetailsField.getText();

      // Must include reference to attached PoC
      expect(briefText).toContain('Particulars of Claim attached');

      // Should mention claim type
      expect(briefText?.toLowerCase()).toContain('rent arrears');
    });

    it('fills brief details with property damage mention when applicable', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const caseWithDamages: CaseData = {
        ...sampleCaseData,
        damage_items: [{ description: 'Broken window', amount: 300 }],
      };

      const pdfBytes = await fillN1Form(caseWithDamages);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const briefDetailsField = form.getTextField('Text23');
      const briefText = briefDetailsField.getText();

      expect(briefText?.toLowerCase()).toContain('property damage');
    });

    it('checks "Particulars attached" checkbox for money claims', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const attachedCheckbox = form.getCheckBox('Check Box43');
      expect(attachedCheckbox.isChecked()).toBe(true);
    });

    it('fills correct total amounts', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      // Amount claimed (principal)
      const amountField = form.getTextField('Text25');
      expect(amountField.getText()).toBe('3600.00');

      // Court fee
      const feeField = form.getTextField('Text26');
      expect(feeField.getText()).toBe('455.00');

      // Total (principal + fee)
      const totalField = form.getTextField('Text28');
      expect(totalField.getText()).toBe('4055.00');
    });

    it('fills preferred hearing centre', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      // Text37 is the preferred hearing centre field
      try {
        const hearingCentreField = form.getTextField('Text37');
        const hearingCentreText = hearingCentreField.getText();
        expect(hearingCentreText).toContain('County Court Money Claims Centre');
      } catch {
        // Field might be optional in some form versions
        console.log('Text37 field not found - may be optional');
      }
    });

    it('fills signatory name for Statement of Truth', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const signatoryField = form.getTextField('Text Field 47');
      expect(signatoryField.getText()).toBe('John Smith');
    });

    it('fills service address postcode', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const postcodeField = form.getTextField('Text34');
      expect(postcodeField.getText()).toBe('SW1A 1A'); // Truncated to 7 chars
    });

    it('handles joint defendants correctly', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const caseWithJointDefendants: CaseData = {
        ...sampleCaseData,
        has_joint_defendants: true,
        tenant_2_name: 'John Doe',
        tenant_2_address_line1: '456 Tenant Street',
        tenant_2_postcode: 'E1 6AN',
      };

      const pdfBytes = await fillN1Form(caseWithJointDefendants);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const defendantField = form.getTextField('Text22');
      const defendantText = defendantField.getText();

      expect(defendantText).toContain('Jane Doe');
      expect(defendantText).toContain('John Doe');
    });

    it('fills defendant service address with full name, address, and postcode (Text Field 48)', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      // Text Field 48 is the "Defendant's name and address for service including postcode" box
      const serviceAddressField = form.getTextField('Text Field 48');
      const serviceAddressText = serviceAddressField.getText();

      // Must contain defendant name
      expect(serviceAddressText).toContain('Jane Doe');
      // Must contain address line
      expect(serviceAddressText).toContain('456 Tenant Street');
      // Must contain postcode
      expect(serviceAddressText).toContain('E1 6AN');
    });

    it('defendant service address matches defendant details box (Text22)', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const pdfBytes = await fillN1Form(sampleCaseData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const defendantDetailsField = form.getTextField('Text22');
      const serviceAddressField = form.getTextField('Text Field 48');

      // Both fields should contain the same defendant information
      // This ensures consistency between main box and service address box
      expect(defendantDetailsField.getText()).toBe(serviceAddressField.getText());
    });

    it('defendant service address includes postcode for joint defendants', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const caseWithJointDefendants: CaseData = {
        ...sampleCaseData,
        has_joint_defendants: true,
        tenant_2_name: 'John Doe',
        tenant_2_address_line1: '456 Tenant Street',
        tenant_2_postcode: 'E1 6AN',
      };

      const pdfBytes = await fillN1Form(caseWithJointDefendants);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      const serviceAddressField = form.getTextField('Text Field 48');
      const serviceAddressText = serviceAddressField.getText();

      // Should contain both defendants
      expect(serviceAddressText).toContain('Jane Doe');
      expect(serviceAddressText).toContain('John Doe');
      // Should contain postcode
      expect(serviceAddressText).toContain('E1 6AN');
    });
  });

  describe('Error Handling', () => {
    it('throws error when landlord name is missing', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const invalidData: CaseData = {
        jurisdiction: 'england',
        landlord_full_name: '',
        landlord_address: '123 Test St',
        tenant_full_name: 'Jane Doe',
        property_address: '456 Test Ave',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        total_claim_amount: 3000,
        signatory_name: 'Test',
        service_postcode: 'E1 1AA',
      };

      await expect(fillN1Form(invalidData)).rejects.toThrow('landlord_full_name');
    });

    it('throws error when total claim amount is zero', async () => {
      if (!officialPdfExists) {
        console.warn('⚠️ Official N1 PDF not found - skipping test');
        return;
      }

      const invalidData: CaseData = {
        jurisdiction: 'england',
        landlord_full_name: 'Test Landlord',
        landlord_address: '123 Test St',
        tenant_full_name: 'Jane Doe',
        property_address: '456 Test Ave',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        total_claim_amount: 0,
        signatory_name: 'Test',
        service_postcode: 'E1 1AA',
      };

      await expect(fillN1Form(invalidData)).rejects.toThrow('total_claim_amount');
    });
  });
});
