/**
 * Official Form Fixtures Integration Tests
 *
 * These tests verify that the validators correctly handle the official GOV.UK forms:
 * - Form 3 (Section 8 Notice) - completed_section_8_form_3.pdf
 * - Form 6A (Section 21 Notice) - completed_section_21_form_6a.pdf
 *
 * Test scenarios:
 * 1. Section 8 PDF should be correctly classified and validated in section_8 mode
 * 2. Section 21 PDF should be correctly classified and validated in section_21 mode
 * 3. Cross-validation: S8 PDF in S21 validator should return wrong_doc_type
 * 4. Cross-validation: S21 PDF in S8 validator should return wrong_doc_type
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { extractS8FieldsWithRegex, extractS21FieldsWithRegex } from '../analyze-evidence';
import { validateSection8Notice, validateSection21Notice } from '@/lib/validators/legal-validators';

// Path to the fixtures
const FIXTURES_DIR = path.join(__dirname, '../../../../attached_assets/completed_notices');

// Expected sample data from the fixtures
const EXPECTED_DATA = {
  tenant_name: 'Sonia Shezadi',
  property_address: '35 Woodhall Park Avenue, Pudsey, LS28 7HF',
  landlord_name: 'Tariq Mohammed',
  // Section 8 specific
  s8_grounds: [8, 10, 11],
  s8_arrears: '3,000',
  s8_date_served: '01/01/2026',
  s8_earliest_proceedings: '15/01/2026',
  // Section 21 specific
  s21_expiry_date: '14/07/2026',
  s21_service_date: '22/12/2025',
};

describe('Official Form Fixtures Integration Tests', () => {
  let section8PdfText: string;
  let section21PdfText: string;

  beforeAll(async () => {
    // For regex tests, we use the expected text content
    // (PDF text extraction would require the full pipeline)
    section8PdfText = `
      FORM NO. 3
      Housing Act 1988 section 8 (as amended)
      NOTICE OF INTENTION TO BEGIN PROCEEDINGS FOR POSSESSION
      OF A PROPERTY IN ENGLAND
      let on an Assured Tenancy or an Assured Agricultural Occupancy

      1. To: Sonia Shezadi

      2. Your landlord/licensor intends to apply to the court for an order requiring you to give up possession of:
      35 Woodhall Park Avenue, Pudsey, LS28 7HF

      3. Your landlord/licensor intends to seek possession on ground(s):
      Grounds 8, 10 and 11
      in Schedule 2 to the Housing Act 1988 (as amended)

      Ground 8 - At both the date of the service of the notice and at the date of the hearing:
      (a) if rent is payable weekly or fortnightly, at least eight weeks rent is unpaid;
      (b) if rent is payable monthly, at least two months rent is unpaid.

      Ground 10 - Some rent lawfully due from the tenant is unpaid

      Ground 11 - tenant has persistently delayed paying rent

      4. Full explanation:
      rent arrears total GBP 3,000.00 (representing 2 months unpaid rent at GBP 1,500.00 per month)

      5. The court proceedings will not begin earlier than: 15/01/2026

      7. Name and address of landlord:
      Signed: [Signed]
      Name: Tariq Mohammed
      Address: 1 Example Street, Leeds, LS1 1AA
      Telephone: 07123 456789

      Capacity: [X] landlord/licensor
      Date: 01/01/2026
    `;

    section21PdfText = `
      FORM NO. 6A
      Housing Act 1988 section 21(1) and (4) (as amended)
      NOTICE REQUIRING POSSESSION
      OF A PROPERTY IN ENGLAND
      let on an Assured Shorthold Tenancy

      1. To: Sonia Shezadi

      2. You are required to leave the below address after: 14/07/2026

      If you do not leave, your landlord may apply to the court for an order under
      Section 21(1) or (4) of the Housing Act 1988 requiring you to give up possession of:

      35 Woodhall Park Avenue, Pudsey, LS28 7HF

      3. Name and address of landlord:
      Signed: [Signed]
      Name: Tariq Mohammed
      Address: 1 Example Street, Leeds, LS1 1AA
      Telephone: 07123 456789

      Capacity: [X] landlord
      Date: 22/12/2025
    `;
  });

  describe('Section 8 Form 3 Extraction', () => {
    it('should detect Form 3 and Section 8 markers', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      expect(result.section_8_detected).toBe(true);
      expect(result.form_3_detected).toBe(true);
    });

    it('should extract all grounds (8, 10, 11) from Section 8 notice', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      expect(result.grounds_cited).toContain(8);
      expect(result.grounds_cited).toContain(10);
      expect(result.grounds_cited).toContain(11);
      expect(result.grounds_cited.length).toBe(3);
    });

    it('should detect Housing Act 1988 reference', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      expect(result.housing_act_1988_mentioned).toBe(true);
    });
  });

  describe('Section 8 Form 3 Validation', () => {
    it('should NOT return wrong_doc_type when validating S8 in S8 mode', () => {
      const validation = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          section_8_detected: true,
          form_3_detected: true,
          grounds_cited: [8, 10, 11],
          tenant_names: ['Sonia Shezadi'],
          property_address: '35 Woodhall Park Avenue, Pudsey, LS28 7HF',
          landlord_name: 'Tariq Mohammed',
          signature_present: true,
          date_served: '01/01/2026',
          rent_arrears_stated: 3000,
        },
        answers: {
          rent_frequency: 'monthly',
          rent_amount: 1500,
          current_arrears: 3000,
        },
      });

      // Should not have wrong_doc_type blocker
      const wrongDocTypeBlocker = validation.blockers.find(
        b => b.code === 'S8-WRONG-DOC-TYPE'
      );
      expect(wrongDocTypeBlocker).toBeUndefined();
    });
  });

  describe('Section 21 Form 6A Extraction', () => {
    it('should detect Form 6A and Section 21 markers', () => {
      const result = extractS21FieldsWithRegex(section21PdfText);

      expect(result.section_21_detected).toBe(true);
      expect(result.form_6a_detected).toBe(true);
    });

    it('should detect signature presence in Section 21 notice', () => {
      const result = extractS21FieldsWithRegex(section21PdfText);

      expect(result.signature_present).toBe(true);
    });

    it('should detect Housing Act 1988 reference', () => {
      const result = extractS21FieldsWithRegex(section21PdfText);

      expect(result.housing_act_1988_mentioned).toBe(true);
    });
  });

  describe('Section 21 Form 6A Validation', () => {
    it('should NOT return wrong_doc_type when validating S21 in S21 mode', () => {
      const validation = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Form 6A',
          section_21_detected: true,
          form_6a_detected: true,
          form_6a_used: true,
          tenant_names: ['Sonia Shezadi'],
          property_address: '35 Woodhall Park Avenue, Pudsey, LS28 7HF',
          landlord_name: 'Tariq Mohammed',
          signature_present: true,
          expiry_date: '14/07/2026',
          date_served: '22/12/2025',
        },
        answers: {},
      });

      // Should not have wrong_doc_type blocker
      const wrongDocTypeBlocker = validation.blockers.find(
        b => b.code === 'S21-WRONG-DOC-TYPE'
      );
      expect(wrongDocTypeBlocker).toBeUndefined();
    });
  });

  describe('Cross-Validation (Wrong Document Type Detection)', () => {
    it('should return wrong_doc_type when S8 Form 3 is uploaded to S21 validator', () => {
      // Simulate S8 document being validated as S21
      const validation = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          section_8_detected: true,
          section_21_detected: false,
          form_3_detected: true,
          form_6a_detected: false,
          form_6a_used: false,
          grounds_cited: [8, 10, 11],
          tenant_names: ['Sonia Shezadi'],
          property_address: '35 Woodhall Park Avenue, Pudsey, LS28 7HF',
        },
        answers: {},
      });

      // Should have wrong_doc_type terminal blocker
      const wrongDocTypeBlocker = validation.blockers.find(
        b => b.code === 'S21-WRONG-DOC-TYPE'
      );
      expect(wrongDocTypeBlocker).toBeDefined();
      expect(validation.terminal_blocker).toBe(true);
    });

    it('should return wrong_doc_type when S21 Form 6A is uploaded to S8 validator', () => {
      // Simulate S21 document being validated as S8
      const validation = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Notice',
          section_8_detected: false,
          section_21_detected: true,
          form_3_detected: false,
          form_6a_detected: true,
          form_6a_used: true,
          tenant_names: ['Sonia Shezadi'],
          property_address: '35 Woodhall Park Avenue, Pudsey, LS28 7HF',
        },
        answers: {},
      });

      // Should have wrong_doc_type terminal blocker
      const wrongDocTypeBlocker = validation.blockers.find(
        b => b.code === 'S8-WRONG-DOC-TYPE'
      );
      expect(wrongDocTypeBlocker).toBeDefined();
      expect(validation.terminal_blocker).toBe(true);
    });

    it('should extract S8 markers from Section 8 text', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      expect(result.section_8_detected).toBe(true);
      expect(result.form_3_detected).toBe(true);
    });

    it('should extract S21 markers from Section 21 text', () => {
      const result = extractS21FieldsWithRegex(section21PdfText);

      expect(result.section_21_detected).toBe(true);
      expect(result.form_6a_detected).toBe(true);
    });
  });

  describe('Fixture Files Integrity', () => {
    it('should have Section 8 PDF fixture', () => {
      const filePath = path.join(FIXTURES_DIR, 'completed_section_8_form_3.pdf');
      expect(fs.existsSync(filePath)).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(10000); // At least 10KB
    });

    it('should have Section 21 PDF fixture', () => {
      const filePath = path.join(FIXTURES_DIR, 'completed_section_21_form_6a.pdf');
      expect(fs.existsSync(filePath)).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(10000); // At least 10KB
    });

    it('should have Section 8 ODT fixture', () => {
      const filePath = path.join(FIXTURES_DIR, 'completed_section_8_form_3.odt');
      expect(fs.existsSync(filePath)).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(5000); // At least 5KB
    });

    it('should have Section 21 ODT fixture', () => {
      const filePath = path.join(FIXTURES_DIR, 'completed_section_21_form_6a.odt');
      expect(fs.existsSync(filePath)).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(5000); // At least 5KB
    });
  });

  describe('Deterministic Tests (No OpenAI Dependency)', () => {
    it('regex extraction should work without API keys', () => {
      // These tests verify that regex extraction works independently
      // of any LLM/API calls
      const s8Result = extractS8FieldsWithRegex(section8PdfText);
      const s21Result = extractS21FieldsWithRegex(section21PdfText);

      // S8 should have key fields
      expect(s8Result.section_8_detected).toBe(true);
      expect(s8Result.form_3_detected).toBe(true);
      expect(s8Result.grounds_cited.length).toBeGreaterThan(0);

      // S21 should have key fields
      expect(s21Result.section_21_detected).toBe(true);
      expect(s21Result.form_6a_detected).toBe(true);
    });

    it('validation should work without API keys', () => {
      // Validation rules are deterministic
      const s8Validation = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          section_8_detected: true,
          form_3_detected: true,
          grounds_cited: [8, 10, 11],
          tenant_names: ['Sonia Shezadi'],
          property_address: '35 Woodhall Park Avenue, Pudsey, LS28 7HF',
          landlord_name: 'Tariq Mohammed',
          signature_present: true,
          date_served: '01/01/2026',
          rent_arrears_stated: 3000,
        },
        answers: {
          rent_frequency: 'monthly',
          rent_amount: 1500,
          current_arrears: 3000,
        },
      });

      const s21Validation = validateSection21Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 21 Form 6A',
          section_21_detected: true,
          form_6a_detected: true,
          form_6a_used: true,
          tenant_names: ['Sonia Shezadi'],
          property_address: '35 Woodhall Park Avenue, Pudsey, LS28 7HF',
        },
        answers: {},
      });

      // Should return validation results without errors
      expect(s8Validation).toBeTruthy();
      expect(s21Validation).toBeTruthy();
      expect(s8Validation.status).toBeDefined();
      expect(s21Validation.status).toBeDefined();
    });
  });
});

/**
 * Manual Testing Instructions
 *
 * The completed form fixtures can be used for manual testing:
 *
 * 1. Navigate to /tools/validators/section-8
 *    - Upload completed_section_8_form_3.pdf
 *    - Verify: Document type detected as Section 8 / Form 3
 *    - Verify: Extracted fields show tenant (Sonia Shezadi), property address, grounds (8, 10, 11)
 *    - Verify: Level A questions appear for confirmation
 *
 * 2. Navigate to /tools/validators/section-21
 *    - Upload completed_section_21_form_6a.pdf
 *    - Verify: Document type detected as Section 21 / Form 6A
 *    - Verify: Extracted fields show tenant (Sonia Shezadi), property address, expiry date
 *    - Verify: Level A questions appear for confirmation
 *
 * 3. Cross-validation tests:
 *    - Upload S8 PDF to S21 validator -> Should show "wrong document type" error
 *    - Upload S21 PDF to S8 validator -> Should show "wrong document type" error
 *
 * Fixture files location: attached_assets/completed_notices/
 */
