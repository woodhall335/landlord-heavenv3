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
import { getLevelAQuestions, getKnownFactKeysFromExtraction } from '@/lib/validators/facts/factKeys';

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
    // For regex tests, we use text content matching actual PDF extraction
    // This matches the structure of completed_section_8_form_3.pdf
    section8PdfText = `
FORM NO. 3
Housing Act 1988 section 8 (as amended)
NOTICE OF INTENTION TO BEGIN PROCEEDINGS FOR POSSESSION
OF A PROPERTY IN ENGLAND
let on an Assured Tenancy or an Assured Agricultural Occupancy

1. To:
Sonia Shezadi

2. Your landlord/licensor intends to apply to the court for an order requiring you to give up possession of:
35 Woodhall Park Avenue, Pudsey, LS28 7HF

3. Your landlord/licensor intends to seek possession on ground(s):
Grounds 8, 10 and 11
in Schedule 2 to the Housing Act 1988 (as amended), which read(s):

Ground 8 - At both the date of the service of the notice and at the date of the hearing:
(a) if rent is payable weekly or fortnightly, at least eight weeks rent is unpaid;
(b) if rent is payable monthly, at least two months rent is unpaid.

Ground 10 - Some rent lawfully due from the tenant is unpaid on the date on which the proceedings
for possession are begun.

Ground 11 - Whether or not any rent is in arrears on the date on which proceedings for possession
are begun, the tenant has persistently delayed paying rent which has become lawfully due.

4. Full explanation of why each ground is being relied on:
The tenant has failed to pay rent since October 2025. As of the date of this notice, rent arrears
total GBP 3,000.00 (representing 2 months unpaid rent at GBP 1,500.00 per month).

The tenant has been in persistent arrears for the past 6 months despite multiple requests for
payment.

Current rent arrears: GBP 3,000.00
Monthly rent amount: GBP 1,500.00

5. The court proceedings will not begin earlier than:
15/01/2026

6. The latest date for court proceedings to begin is 12 months from the date of service of this notice.

7. Name and address of landlord, licensor or landlords agent:
Signed: [Signed]
Name: Tariq Mohammed
Address: 1 Example Street, Leeds, LS1 1AA
Telephone: 07123 456789

Capacity: [X] landlord/licensor

Date: 01/01/2026

This notice was served on: 01/01/2026
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

    /**
     * COMPREHENSIVE FIELD EXTRACTION TESTS
     * These tests verify all fields are correctly extracted from completed_section_8_form_3.pdf
     */
    it('should extract tenant name from Form 3 Section 1', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      expect(result.tenant_names).toContain('Sonia Shezadi');
      expect(result.fields_found).toContain('tenant_names');
    });

    it('should extract property address from Form 3 Section 2', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      expect(result.property_address).toMatch(/35 Woodhall Park Avenue/i);
      expect(result.property_address).toMatch(/LS28 7HF/i);
      expect(result.fields_found).toContain('property_address');
    });

    it('should extract service date from Form 3 signature block', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      expect(result.date_served).toBe('01/01/2026');
      expect(result.fields_found).toContain('date_served');
    });

    it('should extract landlord name from Form 3 Section 7', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      expect(result.landlord_name).toBe('Tariq Mohammed');
      expect(result.fields_found).toContain('landlord_name');
    });

    it('should extract all required fields for Level A skip logic', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      // These are the key fields that should prevent Level A questions
      expect(result.rent_amount).toBeDefined();
      expect(parseFloat(result.rent_amount!)).toBe(1500);

      expect(result.rent_frequency).toBe('monthly');

      expect(result.rent_arrears_stated).toBeDefined();
      expect(parseFloat(result.rent_arrears_stated!)).toBe(3000);

      expect(result.earliest_proceedings_date).toBe('15/01/2026');
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

  describe('Regression Tests - Issue Fixes', () => {
    /**
     * REGRESSION: Issue 1 - Incorrect "Tenant details not found" warning
     * The S8 validator was checking tenant_details instead of tenant_names.
     * Official Form 3 only provides tenant names, not a "tenant details" paragraph.
     * Fix: Check tenant_names array in addition to tenant_details.
     */
    it('should NOT produce tenant details warning when tenant_names is provided (Issue 1)', () => {
      const validation = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          section_8_detected: true,
          form_3_detected: true,
          grounds_cited: [8, 10, 11],
          // tenant_names is populated from regex extraction
          tenant_names: ['Sonia Shezadi'],
          // tenant_details is NOT populated (as official Form 3 doesn't have this format)
          tenant_details: undefined,
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

      // Should NOT have tenant details missing warning
      const tenantWarning = validation.warnings.find(
        w => w.code === 'S8-TENANT-DETAILS-MISSING'
      );
      expect(tenantWarning).toBeUndefined();
    });

    it('should produce tenant details warning when NEITHER tenant_names nor tenant_details is provided', () => {
      const validation = validateSection8Notice({
        jurisdiction: 'england',
        extracted: {
          notice_type: 'Section 8 Notice',
          section_8_detected: true,
          form_3_detected: true,
          grounds_cited: [8, 10, 11],
          // Neither tenant field is populated
          tenant_names: [],
          tenant_details: undefined,
          property_address: '35 Woodhall Park Avenue, Pudsey, LS28 7HF',
        },
        answers: {},
      });

      // SHOULD have tenant details missing warning
      const tenantWarning = validation.warnings.find(
        w => w.code === 'S8-TENANT-DETAILS-MISSING'
      );
      expect(tenantWarning).toBeDefined();
    });

    /**
     * REGRESSION: Issue 2 - Date extraction patterns and UI label mapping
     * Form 3 Section 5 = earliest proceedings date
     * Service date + 12 months = latest proceedings date (computed in UI)
     *
     * Note: Date extraction uses specific patterns (e.g., "served on DD/MM/YYYY").
     * The UI correctly labels S8 dates as "Earliest/Latest Proceedings Date"
     * instead of "Expiry Date" - this is validated via manual testing.
     */
    it('should extract date when using served on format (Issue 2)', () => {
      // Test with explicit "served on" format that matches extraction patterns
      const textWithServedFormat = `
        Form 3 Section 8 Notice
        Housing Act 1988
        served on 01/01/2026
        proceedings after 15/01/2026
      `;
      const result = extractS8FieldsWithRegex(textWithServedFormat);
      expect(result.date_served).toBe('01/01/2026');
      expect(result.expiry_date).toBe('15/01/2026');
    });

    it('should extract date when using on or after format (Issue 2)', () => {
      // Test with "on or after" format
      const textWithOnOrAfter = `
        Form 3 Section 8 Notice
        Housing Act 1988
        on or after 20/02/2026
      `;
      const result = extractS8FieldsWithRegex(textWithOnOrAfter);
      expect(result.expiry_date).toBe('20/02/2026');
    });

    /**
     * REGRESSION: Issue 3 - Earliest Proceedings Date extraction
     * Form 3 Section 5 uses "The court proceedings will not begin earlier than"
     * This should be extracted as earliest_proceedings_date, NOT expiry_date
     */
    it('should extract earliest_proceedings_date from Form 3 Section 5 (Issue 3)', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      // The fixture text contains: "proceedings will not begin earlier than: 15/01/2026"
      expect(result.earliest_proceedings_date).toBe('15/01/2026');
      // expiry_date should also be set for backwards compatibility
      expect(result.expiry_date).toBe('15/01/2026');
      expect(result.fields_found).toContain('earliest_proceedings_date');
    });

    it('should extract rent_amount from Form 3 text (Issue 3)', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      // The fixture text contains: "GBP 1,500.00 per month"
      expect(result.rent_amount).toBe('1500.00');
      expect(result.fields_found).toContain('rent_amount');
    });

    it('should extract rent_frequency from Form 3 text (Issue 3)', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      // The fixture text contains: "per month" which implies monthly frequency
      expect(result.rent_frequency).toBe('monthly');
      expect(result.fields_found).toContain('rent_frequency');
    });

    it('should extract rent_arrears_stated from Form 3 text (Issue 3)', () => {
      const result = extractS8FieldsWithRegex(section8PdfText);

      // The fixture text contains: "arrears total GBP 3,000.00"
      expect(result.rent_arrears_stated).toBe('3000.00');
      expect(result.fields_found).toContain('rent_arrears_stated');
    });
  });

  describe('Level A Question Skipping (Issue 4)', () => {
    /**
     * REGRESSION: Issue 4 - Level A questions should skip already-extracted values
     * When Form 3 is uploaded and rent_amount, rent_frequency, current_arrears are extracted,
     * the corresponding Level A questions should NOT be asked again.
     * Only arrears_above_threshold_today and arrears_likely_at_hearing should remain.
     */
    it('should skip rent_amount_confirmed question when rent_amount is extracted', () => {
      const extracted = {
        rent_amount: 1500,
        rent_frequency: 'monthly',
        rent_arrears_stated: 3000,
      };

      // Get the Level A keys that should be considered "answered" based on extracted fields
      const knownKeys = getKnownFactKeysFromExtraction(extracted);

      // Should include the Level A versions of the extracted fields
      expect(knownKeys).toContain('rent_amount_confirmed');
      expect(knownKeys).toContain('rent_frequency_confirmed');
      expect(knownKeys).toContain('current_arrears_amount');
    });

    it('should only ask threshold/hearing questions when rent values are already extracted', () => {
      const extracted = {
        rent_amount: 1500,
        rent_frequency: 'monthly',
        rent_arrears_stated: 3000,
        current_arrears: 3000,
      };

      // Get the Level A keys that should be considered "answered" based on extracted fields
      const knownKeys = getKnownFactKeysFromExtraction(extracted);

      // Get remaining Level A questions for Section 8
      const remainingQuestions = getLevelAQuestions('section_8', knownKeys);

      // Should only have the 2 threshold/hearing questions remaining
      const remainingFactKeys = remainingQuestions.map(q => q.factKey);
      expect(remainingFactKeys).toContain('arrears_above_threshold_today');
      expect(remainingFactKeys).toContain('arrears_likely_at_hearing');

      // Should NOT include the rent-related questions (they were extracted)
      expect(remainingFactKeys).not.toContain('rent_amount_confirmed');
      expect(remainingFactKeys).not.toContain('rent_frequency_confirmed');
      expect(remainingFactKeys).not.toContain('current_arrears_amount');

      // Should have exactly 2 remaining questions
      expect(remainingQuestions.length).toBe(2);
    });

    it('should ask all Level A questions when nothing is extracted', () => {
      // No extraction data
      const extracted = {};

      // Get the Level A keys that should be considered "answered"
      const knownKeys = getKnownFactKeysFromExtraction(extracted);

      // Get remaining Level A questions for Section 8
      const remainingQuestions = getLevelAQuestions('section_8', knownKeys);

      // Should have all 5 Section 8 Level A questions
      const remainingFactKeys = remainingQuestions.map(q => q.factKey);
      expect(remainingFactKeys).toContain('arrears_above_threshold_today');
      expect(remainingFactKeys).toContain('arrears_likely_at_hearing');
      expect(remainingFactKeys).toContain('rent_amount_confirmed');
      expect(remainingFactKeys).toContain('rent_frequency_confirmed');
      expect(remainingFactKeys).toContain('current_arrears_amount');

      expect(remainingQuestions.length).toBe(5);
    });

    it('should work with real S8 regex extraction result', () => {
      // Use the actual fixture text extraction
      const regexResult = extractS8FieldsWithRegex(section8PdfText);

      // Build extracted fields object as it would be in the validator
      const extracted: Record<string, any> = {
        rent_amount: regexResult.rent_amount ? parseFloat(regexResult.rent_amount) : undefined,
        rent_frequency: regexResult.rent_frequency,
        rent_arrears_stated: regexResult.rent_arrears_stated ? parseFloat(regexResult.rent_arrears_stated) : undefined,
      };

      // Get the Level A keys that should be considered "answered"
      const knownKeys = getKnownFactKeysFromExtraction(extracted);

      // Get remaining Level A questions for Section 8
      const remainingQuestions = getLevelAQuestions('section_8', knownKeys);
      const remainingFactKeys = remainingQuestions.map(q => q.factKey);

      // Since the fixture text has rent info, only threshold questions should remain
      expect(remainingFactKeys).toContain('arrears_above_threshold_today');
      expect(remainingFactKeys).toContain('arrears_likely_at_hearing');
      expect(remainingFactKeys).not.toContain('rent_amount_confirmed');
      expect(remainingFactKeys).not.toContain('rent_frequency_confirmed');
      expect(remainingFactKeys).not.toContain('current_arrears_amount');
    });
  });
});

describe('Variant Fixtures - Robustness Tests', () => {
  /**
   * ORIGINAL: The standard fixture text (matching section8PdfText in main describe)
   * Needed for cross-fixture comparison
   */
  const originalFixtureText = `
FORM NO. 3
Housing Act 1988 section 8 (as amended)
NOTICE OF INTENTION TO BEGIN PROCEEDINGS FOR POSSESSION
OF A PROPERTY IN ENGLAND
let on an Assured Tenancy or an Assured Agricultural Occupancy

1. To:
Sonia Shezadi

2. Your landlord/licensor intends to apply to the court for an order requiring you to give up possession of:
35 Woodhall Park Avenue, Pudsey, LS28 7HF

3. Your landlord/licensor intends to seek possession on ground(s):
Grounds 8, 10 and 11
in Schedule 2 to the Housing Act 1988 (as amended), which read(s):

Ground 8 - At both the date of the service of the notice and at the date of the hearing:
(a) if rent is payable weekly or fortnightly, at least eight weeks rent is unpaid;
(b) if rent is payable monthly, at least two months rent is unpaid.

Ground 10 - Some rent lawfully due from the tenant is unpaid on the date on which the proceedings
for possession are begun.

Ground 11 - Whether or not any rent is in arrears on the date on which proceedings for possession
are begun, the tenant has persistently delayed paying rent which has become lawfully due.

4. Full explanation of why each ground is being relied on:
The tenant has failed to pay rent since October 2025. As of the date of this notice, rent arrears
total GBP 3,000.00 (representing 2 months unpaid rent at GBP 1,500.00 per month).

The tenant has been in persistent arrears for the past 6 months despite multiple requests for
payment.

Current rent arrears: GBP 3,000.00
Monthly rent amount: GBP 1,500.00

5. The court proceedings will not begin earlier than:
15/01/2026

6. The latest date for court proceedings to begin is 12 months from the date of service of this notice.

7. Name and address of landlord, licensor or landlords agent:
Signed: [Signed]
Name: Tariq Mohammed
Address: 1 Example Street, Leeds, LS1 1AA
Telephone: 07123 456789

Capacity: [X] landlord/licensor

Date: 01/01/2026

This notice was served on: 01/01/2026
  `;

  /**
   * VARIANT A: Same data, different formatting
   * Tests robustness against:
   * - Different whitespace patterns
   * - Abbreviated section headers
   * - Extra line breaks and indentation
   * - Lowercase ground references
   * - Different date separators (. vs /)
   * - Currency symbol variations (£ vs GBP)
   */
  const variantAFormattingText = `
FORM NO. 3
Housing Act 1988    section 8    (as amended)

NOTICE OF INTENTION TO BEGIN PROCEEDINGS FOR POSSESSION
OF A PROPERTY IN ENGLAND
let on an Assured Tenancy or an Assured Agricultural Occupancy


1. To:

   Sonia Shezadi


2. Your landlord/licensor intends to apply to the court for an order requiring you to
   give up possession of:

   35 Woodhall Park Avenue,
   Pudsey,
   LS28 7HF


3. Your landlord/licensor intends to seek possession on ground(s):
   grounds 8, 10, and 11
   in Schedule 2 to the Housing Act 1988 (as amended)

4. Full explanation of why each ground is being relied on:

   The tenant has failed to pay rent.

   Current arrears: £3,000.00
   Monthly rent: £1,500.00 per month


5. Court proceedings will not begin earlier than:
   15.01.2026


7. Name and address of landlord, licensor or landlord's agent:

Signed: [Signed]
Name:   Tariq Mohammed
Address: 1 Example Street, Leeds, LS1 1AA

Date: 01.01.2026

This notice was served on 01.01.2026
  `;

  /**
   * VARIANT B: Different data values
   * Tests robustness against different:
   * - Tenant names (multiple tenants)
   * - Property addresses (different format)
   * - Rent amounts (weekly frequency)
   * - Arrears amounts
   * - Dates
   * - Landlord names
   * - Ground combinations
   */
  const variantBDataText = `
FORM NO. 3
Housing Act 1988 section 8 (as amended)
NOTICE OF INTENTION TO BEGIN PROCEEDINGS FOR POSSESSION
OF A PROPERTY IN ENGLAND
let on an Assured Tenancy or an Assured Agricultural Occupancy

1. To:
Alex Smith and Jamie Smith

2. Your landlord/licensor intends to apply to the court for an order requiring you to give up possession of:
10 Example Road, Leeds, LS1 2AB

3. Your landlord/licensor intends to seek possession on ground(s):
Grounds 8 and 11
in Schedule 2 to the Housing Act 1988 (as amended), which read(s):

Ground 8 - At both the date of the service of the notice and at the date of the hearing:
(a) if rent is payable weekly or fortnightly, at least eight weeks rent is unpaid;

Ground 11 - Whether or not any rent is in arrears on the date on which proceedings for possession
are begun, the tenant has persistently delayed paying rent which has become lawfully due.

4. Full explanation of why each ground is being relied on:
The tenant has failed to pay rent since September 2025. As of the date of this notice, the rent arrears
total GBP 7,600.00 (representing 8 weeks unpaid rent at GBP 950.00 per week).

Current rent arrears: GBP 7,600.00
Weekly rent amount: GBP 950.00

5. The court proceedings will not begin earlier than:
19/02/2026

6. The latest date for court proceedings to begin is 12 months from the date of service of this notice.

7. Name and address of landlord, licensor or landlords agent:
Signed: [Signed]
Name: Sarah Johnson
Address: 15 High Street, Leeds, LS2 1AA
Telephone: 07999 123456

Capacity: [X] landlord/licensor

Date: 05/02/2026

This notice was served on: 05/02/2026
  `;

  /**
   * VARIANT C: Edge cases and alternate phrasing
   * Tests robustness against:
   * - Single ground (Ground 8 only)
   * - Minimal whitespace
   * - Fortnightly rent frequency
   * - Unusual landlord agent format
   * - Different proceedings date phrasing
   */
  const variantCEdgeCasesText = `
FORM NO. 3
Housing Act 1988 section 8 (as amended)
NOTICE OF INTENTION TO BEGIN PROCEEDINGS FOR POSSESSION OF A PROPERTY IN ENGLAND
let on an Assured Tenancy or an Assured Agricultural Occupancy
1. To: Michael Chen
2. Your landlord/licensor intends to apply to the court for an order requiring you to give up possession of: Flat 5, Tower House, 100 Main Street, Manchester, M1 1AA
3. Your landlord/licensor intends to seek possession on Ground 8 in Schedule 2 to the Housing Act 1988.
Ground 8 - At least two months rent is unpaid.
4. Full explanation of why each ground is being relied on:
Rent arrears of £2,400.00 representing 4 fortnights of unpaid rent at £600.00 per fortnight.
Current arrears: £2,400.00
Fortnightly rent: £600.00
5. Proceedings will not begin earlier than 01/03/2026
7. Name and address of landlord, licensor or landlord's agent:
Signed:[Signed]
Name:Premier Property Management Ltd
Address:Unit 10, Business Park, Manchester, M2 2BB
Date:15/02/2026
This notice was served on:15/02/2026
  `;

  describe('Variant A - Formatting Differences (Same Data)', () => {
    it('should detect Form 3 and Section 8 markers', () => {
      const result = extractS8FieldsWithRegex(variantAFormattingText);
      expect(result.section_8_detected).toBe(true);
      expect(result.form_3_detected).toBe(true);
    });

    it('should extract tenant name despite extra whitespace', () => {
      const result = extractS8FieldsWithRegex(variantAFormattingText);
      expect(result.tenant_names).toContain('Sonia Shezadi');
    });

    it('should extract property address with line breaks', () => {
      const result = extractS8FieldsWithRegex(variantAFormattingText);
      expect(result.property_address).toMatch(/35 Woodhall Park Avenue/i);
    });

    it('should extract grounds from lowercase format', () => {
      const result = extractS8FieldsWithRegex(variantAFormattingText);
      expect(result.grounds_cited).toContain(8);
      expect(result.grounds_cited).toContain(10);
      expect(result.grounds_cited).toContain(11);
    });

    it('should extract dates with dot separators', () => {
      const result = extractS8FieldsWithRegex(variantAFormattingText);
      // Should normalize to consistent format
      expect(result.date_served).toMatch(/01[\/\.\-]01[\/\.\-]2026/);
      expect(result.earliest_proceedings_date).toMatch(/15[\/\.\-]01[\/\.\-]2026/);
    });

    it('should extract rent with £ symbol', () => {
      const result = extractS8FieldsWithRegex(variantAFormattingText);
      expect(result.rent_amount).toBeDefined();
      expect(parseFloat(result.rent_amount!)).toBe(1500);
      expect(result.rent_arrears_stated).toBeDefined();
      expect(parseFloat(result.rent_arrears_stated!)).toBe(3000);
    });

    it('should extract landlord name', () => {
      const result = extractS8FieldsWithRegex(variantAFormattingText);
      expect(result.landlord_name).toBe('Tariq Mohammed');
    });
  });

  describe('Variant B - Different Data Values', () => {
    it('should detect Form 3 and Section 8 markers', () => {
      const result = extractS8FieldsWithRegex(variantBDataText);
      expect(result.section_8_detected).toBe(true);
      expect(result.form_3_detected).toBe(true);
    });

    it('should extract multiple tenant names', () => {
      const result = extractS8FieldsWithRegex(variantBDataText);
      expect(result.tenant_names).toBeDefined();
      // Should contain at least one of the names
      const tenantStr = Array.isArray(result.tenant_names)
        ? result.tenant_names.join(' ')
        : result.tenant_names;
      expect(tenantStr).toMatch(/Alex Smith|Jamie Smith/i);
    });

    it('should extract different property address', () => {
      const result = extractS8FieldsWithRegex(variantBDataText);
      expect(result.property_address).toMatch(/10 Example Road/i);
      expect(result.property_address).toMatch(/LS1 2AB/i);
    });

    it('should extract different ground combination (8 and 11)', () => {
      const result = extractS8FieldsWithRegex(variantBDataText);
      expect(result.grounds_cited).toContain(8);
      expect(result.grounds_cited).toContain(11);
      // Should NOT contain ground 10
      expect(result.grounds_cited).not.toContain(10);
    });

    it('should extract weekly rent amount', () => {
      const result = extractS8FieldsWithRegex(variantBDataText);
      expect(result.rent_amount).toBeDefined();
      expect(parseFloat(result.rent_amount!)).toBe(950);
      expect(result.rent_frequency).toBe('weekly');
    });

    it('should extract higher arrears amount', () => {
      const result = extractS8FieldsWithRegex(variantBDataText);
      expect(result.rent_arrears_stated).toBeDefined();
      expect(parseFloat(result.rent_arrears_stated!)).toBe(7600);
    });

    it('should extract different landlord name', () => {
      const result = extractS8FieldsWithRegex(variantBDataText);
      expect(result.landlord_name).toBe('Sarah Johnson');
    });

    it('should extract different dates', () => {
      const result = extractS8FieldsWithRegex(variantBDataText);
      expect(result.date_served).toBe('05/02/2026');
      expect(result.earliest_proceedings_date).toBe('19/02/2026');
    });
  });

  describe('Variant C - Edge Cases', () => {
    it('should detect Form 3 and Section 8 markers with minimal whitespace', () => {
      const result = extractS8FieldsWithRegex(variantCEdgeCasesText);
      expect(result.section_8_detected).toBe(true);
      expect(result.form_3_detected).toBe(true);
    });

    it('should extract tenant name from condensed format', () => {
      const result = extractS8FieldsWithRegex(variantCEdgeCasesText);
      expect(result.tenant_names).toContain('Michael Chen');
    });

    it('should extract flat address format', () => {
      const result = extractS8FieldsWithRegex(variantCEdgeCasesText);
      expect(result.property_address).toMatch(/Flat 5|Tower House|Manchester/i);
    });

    it('should extract single ground (8 only)', () => {
      const result = extractS8FieldsWithRegex(variantCEdgeCasesText);
      expect(result.grounds_cited).toContain(8);
      expect(result.grounds_cited.length).toBe(1);
    });

    it('should extract fortnightly rent', () => {
      const result = extractS8FieldsWithRegex(variantCEdgeCasesText);
      expect(result.rent_amount).toBeDefined();
      expect(parseFloat(result.rent_amount!)).toBe(600);
      expect(result.rent_frequency).toBe('fortnightly');
    });

    it('should extract company as landlord name', () => {
      const result = extractS8FieldsWithRegex(variantCEdgeCasesText);
      expect(result.landlord_name).toMatch(/Premier Property Management/i);
    });

    it('should extract dates without colon separator', () => {
      const result = extractS8FieldsWithRegex(variantCEdgeCasesText);
      expect(result.date_served).toBe('15/02/2026');
      expect(result.earliest_proceedings_date).toBe('01/03/2026');
    });
  });

  describe('Cross-Fixture Behavioral Consistency', () => {
    const allFixtures = [
      { name: 'Original', text: originalFixtureText },
      { name: 'Variant A (Formatting)', text: variantAFormattingText },
      { name: 'Variant B (Data)', text: variantBDataText },
      { name: 'Variant C (Edge Cases)', text: variantCEdgeCasesText },
    ];

    it('should detect Section 8 and Form 3 in ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.section_8_detected).toBe(true);
        expect(result.form_3_detected).toBe(true);
      }
    });

    it('should extract Housing Act 1988 reference from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.housing_act_1988_mentioned).toBe(true);
      }
    });

    it('should extract tenant_names from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.tenant_names).toBeDefined();
        expect(result.tenant_names!.length).toBeGreaterThan(0);
        expect(result.fields_found).toContain('tenant_names');
      }
    });

    it('should extract property_address from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.property_address).toBeDefined();
        expect(result.property_address!.length).toBeGreaterThan(5);
        expect(result.fields_found).toContain('property_address');
      }
    });

    it('should extract date_served from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.date_served).toBeDefined();
        expect(result.date_served).toMatch(/\d{2}[\/\.\-]\d{2}[\/\.\-]\d{4}/);
        expect(result.fields_found).toContain('date_served');
      }
    });

    it('should extract earliest_proceedings_date from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.earliest_proceedings_date).toBeDefined();
        expect(result.earliest_proceedings_date).toMatch(/\d{2}[\/\.\-]\d{2}[\/\.\-]\d{4}/);
        expect(result.fields_found).toContain('earliest_proceedings_date');
      }
    });

    it('should extract rent_amount from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.rent_amount).toBeDefined();
        expect(parseFloat(result.rent_amount!)).toBeGreaterThan(0);
        expect(result.fields_found).toContain('rent_amount');
      }
    });

    it('should extract rent_frequency from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.rent_frequency).toBeDefined();
        expect(['weekly', 'fortnightly', 'monthly']).toContain(result.rent_frequency);
        expect(result.fields_found).toContain('rent_frequency');
      }
    });

    it('should extract rent_arrears_stated from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.rent_arrears_stated).toBeDefined();
        expect(parseFloat(result.rent_arrears_stated!)).toBeGreaterThan(0);
        expect(result.fields_found).toContain('rent_arrears_stated');
      }
    });

    it('should extract at least one ground from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.grounds_cited.length).toBeGreaterThan(0);
        expect(result.grounds_cited[0]).toBeGreaterThanOrEqual(1);
        expect(result.grounds_cited[0]).toBeLessThanOrEqual(17);
      }
    });

    it('should extract landlord_name from ALL fixtures', () => {
      for (const fixture of allFixtures) {
        const result = extractS8FieldsWithRegex(fixture.text);
        expect(result.landlord_name).toBeDefined();
        expect(result.landlord_name!.length).toBeGreaterThan(3);
        expect(result.fields_found).toContain('landlord_name');
      }
    });
  });
});

describe('Perturbation Tests (Seeded Randomness)', () => {
  /**
   * These tests apply controlled perturbations to the fixture text
   * to verify extraction robustness against real-world variations.
   *
   * Uses seeded randomness for reproducibility.
   */

  // Simple seeded random number generator (Mulberry32)
  function seededRandom(seed: number) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Perturbation functions
  function addRandomWhitespace(text: string, rng: () => number): string {
    return text.split('\n').map(line => {
      const spaces = Math.floor(rng() * 5);
      return ' '.repeat(spaces) + line + ' '.repeat(Math.floor(rng() * 3));
    }).join('\n');
  }

  function replaceRandomDateSeparators(text: string, rng: () => number): string {
    return text.replace(/(\d{2})\/(\d{2})\/(\d{4})/g, (match, d, m, y) => {
      const separators = ['/', '.', '-'];
      const sep = separators[Math.floor(rng() * separators.length)];
      return `${d}${sep}${m}${sep}${y}`;
    });
  }

  function randomCaseVariation(text: string, rng: () => number): string {
    // Only apply to specific keywords, not to names/addresses
    const keywords = ['Form', 'Ground', 'Housing Act', 'Section', 'Notice'];
    let result = text;
    for (const keyword of keywords) {
      if (rng() > 0.5) {
        result = result.replace(new RegExp(keyword, 'gi'),
          rng() > 0.5 ? keyword.toLowerCase() : keyword.toUpperCase()
        );
      }
    }
    return result;
  }

  function addRandomLineBreaks(text: string, rng: () => number): string {
    return text.replace(/ {2,}/g, () => {
      if (rng() > 0.7) return '\n';
      return '  ';
    });
  }

  const baseFixture = `
FORM NO. 3
Housing Act 1988 section 8 (as amended)
NOTICE OF INTENTION TO BEGIN PROCEEDINGS FOR POSSESSION
OF A PROPERTY IN ENGLAND
let on an Assured Tenancy or an Assured Agricultural Occupancy

1. To:
Sonia Shezadi

2. Your landlord/licensor intends to apply to the court for an order requiring you to give up possession of:
35 Woodhall Park Avenue, Pudsey, LS28 7HF

3. Your landlord/licensor intends to seek possession on ground(s):
Grounds 8, 10 and 11
in Schedule 2 to the Housing Act 1988 (as amended)

4. Full explanation of why each ground is being relied on:
Current rent arrears: GBP 3,000.00
Monthly rent amount: GBP 1,500.00

5. The court proceedings will not begin earlier than:
15/01/2026

7. Name and address of landlord, licensor or landlords agent:
Signed: [Signed]
Name: Tariq Mohammed
Date: 01/01/2026

This notice was served on: 01/01/2026
  `;

  // Test with 10 different seeds
  const seeds = [12345, 23456, 34567, 45678, 56789, 67890, 78901, 89012, 90123, 101234];

  describe('Whitespace Perturbations', () => {
    for (const seed of seeds) {
      it(`should extract key fields with random whitespace (seed: ${seed})`, () => {
        const rng = seededRandom(seed);
        const perturbed = addRandomWhitespace(baseFixture, rng);
        const result = extractS8FieldsWithRegex(perturbed);

        // Core detection should still work
        expect(result.section_8_detected).toBe(true);
        expect(result.form_3_detected).toBe(true);
        expect(result.housing_act_1988_mentioned).toBe(true);

        // Key extractions should still work
        expect(result.grounds_cited).toContain(8);
      });
    }
  });

  describe('Date Separator Perturbations', () => {
    for (const seed of seeds.slice(0, 5)) {
      it(`should extract dates with random separators (seed: ${seed})`, () => {
        const rng = seededRandom(seed);
        const perturbed = replaceRandomDateSeparators(baseFixture, rng);
        const result = extractS8FieldsWithRegex(perturbed);

        // Should still extract dates
        expect(result.date_served).toBeDefined();
        expect(result.date_served).toMatch(/01[\/\.\-]01[\/\.\-]2026/);
        expect(result.earliest_proceedings_date).toBeDefined();
        expect(result.earliest_proceedings_date).toMatch(/15[\/\.\-]01[\/\.\-]2026/);
      });
    }
  });

  describe('Case Variation Perturbations', () => {
    for (const seed of seeds.slice(0, 5)) {
      it(`should detect markers with random case variations (seed: ${seed})`, () => {
        const rng = seededRandom(seed);
        const perturbed = randomCaseVariation(baseFixture, rng);
        const result = extractS8FieldsWithRegex(perturbed);

        // Detection should be case-insensitive
        expect(result.section_8_detected).toBe(true);
        expect(result.form_3_detected).toBe(true);
      });
    }
  });

  describe('Combined Perturbations', () => {
    for (const seed of seeds.slice(0, 3)) {
      it(`should handle multiple perturbations combined (seed: ${seed})`, () => {
        const rng = seededRandom(seed);
        let perturbed = baseFixture;
        perturbed = addRandomWhitespace(perturbed, rng);
        perturbed = replaceRandomDateSeparators(perturbed, rng);
        perturbed = randomCaseVariation(perturbed, rng);

        const result = extractS8FieldsWithRegex(perturbed);

        // Core detection should survive combined perturbations
        expect(result.section_8_detected).toBe(true);
        expect(result.form_3_detected).toBe(true);
        expect(result.housing_act_1988_mentioned).toBe(true);

        // At least grounds should be extracted
        expect(result.grounds_cited.length).toBeGreaterThan(0);
      });
    }
  });

  describe('Stress Tests - Extreme Perturbations', () => {
    it('should handle excessive whitespace', () => {
      const excessive = baseFixture.replace(/\n/g, '\n\n\n').replace(/ /g, '   ');
      const result = extractS8FieldsWithRegex(excessive);

      expect(result.section_8_detected).toBe(true);
      expect(result.form_3_detected).toBe(true);
    });

    it('should handle mixed line endings', () => {
      const mixedEndings = baseFixture
        .replace(/\n/g, '\r\n')  // Windows-style
        .replace(/\r\n([A-Z])/g, '\n$1');  // Back to Unix for some
      const result = extractS8FieldsWithRegex(mixedEndings);

      expect(result.section_8_detected).toBe(true);
      expect(result.form_3_detected).toBe(true);
    });

    it('should handle unicode whitespace', () => {
      const unicodeSpaces = baseFixture
        .replace(/ /g, '\u00A0')  // Non-breaking space
        .replace(/\u00A0{3}/g, ' ');  // Replace some back
      const result = extractS8FieldsWithRegex(unicodeSpaces);

      expect(result.section_8_detected).toBe(true);
      expect(result.form_3_detected).toBe(true);
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
 *    - Verify: Extracted fields show:
 *      - Tenant: Sonia Shezadi
 *      - Property address: 35 Woodhall Park Avenue, Pudsey, LS28 7HF
 *      - Grounds: 8, 10, 11
 *      - Rent Arrears: £3000
 *      - Rent Amount: £1500
 *      - Rent Frequency: Monthly
 *    - Verify: NO "Tenant details not found" warning appears
 *    - Verify: Dates display in UK format (DD/MM/YYYY)
 *    - Verify: Earliest Proceedings Date = 15/01/2026 (Form 3 Section 5)
 *    - Verify: Latest Proceedings Date = 01/01/2027 (Service Date + 12 months)
 *    - Verify: Level A questions ONLY include:
 *      - "Is the rent arrears currently above the Ground 8 threshold?"
 *      - "Is the arrears likely to still be above the threshold at the court hearing?"
 *    - Verify: Level A questions do NOT include rent_amount, rent_frequency, or current_arrears
 *      (since these were already extracted from the document)
 *
 * 2. Navigate to /tools/validators/section-21
 *    - Upload completed_section_21_form_6a.pdf
 *    - Verify: Document type detected as Section 21 / Form 6A
 *    - Verify: Extracted fields show tenant (Sonia Shezadi), property address
 *    - Verify: Dates display in UK format (DD/MM/YYYY): 22/12/2025, 14/07/2026
 *    - Verify: Labels show "Service Date" and "Expiry Date" (standard S21 labels)
 *    - Verify: Level A questions appear for confirmation
 *
 * 3. Cross-validation tests:
 *    - Upload S8 PDF to S21 validator -> Should show "wrong document type" error
 *    - Upload S21 PDF to S8 validator -> Should show "wrong document type" error
 *
 * Fixture files location: attached_assets/completed_notices/
 */
