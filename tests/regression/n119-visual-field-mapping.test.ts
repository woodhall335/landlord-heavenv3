/**
 * N119 Visual Field Mapping Regression Test
 *
 * This test verifies that the N119 PDF form fields are correctly filled
 * and that the visual output matches expectations for Q2, Q3(b), and Q6.
 *
 * Test case: 549f8bbf-82c3-47f5-96fc-fb522b64867b (golden fixture)
 *
 * Requirements:
 * - Q2 contains "Sonia Shezadi" (tenant name, clean - no parentheticals)
 * - Q3(b) frequency is unambiguous (only "month" has X, others empty)
 * - Q6 contains "Notice seeking possession (Form 3)"
 * - PDF does NOT contain broken fragment: ") was served on the defendant on 20 ."
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { fillN119Form, CaseData } from '@/lib/documents/official-forms-filler';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';

// Load the golden fixture (case_id: 549f8bbf-82c3-47f5-96fc-fb522b64867b)
const fixturePath = path.join(
  process.cwd(),
  'tests/fixtures/complete-pack/england.section8.ground8.case.json'
);
const goldenFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

// Verify this is the correct fixture
if (goldenFixture.case_id !== '549f8bbf-82c3-47f5-96fc-fb522b64867b') {
  throw new Error(`Expected case_id 549f8bbf-82c3-47f5-96fc-fb522b64867b but got ${goldenFixture.case_id}`);
}

describe('N119 Visual Field Mapping Regression', () => {
  let caseData: CaseData;
  let unflattenedBytes: Uint8Array;
  let flattenedBytes: Uint8Array;
  let fieldValues: Map<string, string>;

  beforeAll(async () => {
    // Convert fixture to case data
    const result = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
    caseData = result.caseData;

    // Generate unflattened PDF for field value extraction
    unflattenedBytes = await fillN119Form(caseData, { flatten: false });

    // Extract field values from unflattened PDF
    const pdfDoc = await PDFDocument.load(unflattenedBytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    fieldValues = new Map();

    form.getFields().forEach((field) => {
      const name = field.getName();
      try {
        const textField = form.getTextField(name);
        const value = textField.getText() || '';
        if (value) {
          fieldValues.set(name, value);
        }
      } catch {
        try {
          const checkbox = form.getCheckBox(name);
          if (checkbox.isChecked()) {
            fieldValues.set(name, 'CHECKED');
          }
        } catch {
          // Skip
        }
      }
    });

    // Generate flattened PDF for final output verification
    flattenedBytes = await fillN119Form(caseData, { flatten: true });
  });

  describe('Q2 - Persons in Possession', () => {
    // Field name with curly apostrophe (U+2019)
    const Q2_FIELD_NAME = "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:";

    it('should have Q2 field filled with tenant name', () => {
      const q2Value = fieldValues.get(Q2_FIELD_NAME);
      expect(q2Value).toBeDefined();
      expect(q2Value).not.toBe('');
    });

    it('should contain exactly "Sonia Shezadi" (clean name, no parentheticals)', () => {
      const q2Value = fieldValues.get(Q2_FIELD_NAME) || '';

      // Must contain the tenant name
      expect(q2Value).toContain('Sonia Shezadi');

      // Must NOT contain parentheticals like "(the defendant)"
      expect(q2Value).not.toContain('(the defendant)');
      expect(q2Value).not.toContain('(defendant)');
      expect(q2Value).not.toContain('(Tenant)');
      expect(q2Value).not.toContain('(tenant)');

      // Should be exactly the tenant name for this fixture
      expect(q2Value).toBe('Sonia Shezadi');
    });

    it('should be in the correct field (F06 - physical position verification)', () => {
      // Verify the field name matches the physical field F06 from the overlay
      // This ensures we're writing to the field that's actually under Q2 visually
      const fieldNames = Array.from(fieldValues.keys());
      expect(fieldNames).toContain(Q2_FIELD_NAME);
    });
  });

  describe('Q3(b) - Rent Frequency', () => {
    const WEEK_FIELD = '3(b) The current rent is payable each week';
    const FORTNIGHT_FIELD = '3(b) The current rent is payable each fortnight';
    const MONTH_FIELD = '3(b) The current rent is payable each month';
    const OTHER_PERIOD_FIELD = '3(b) The current rent is payable each - specify the period';

    it('should have exactly ONE frequency marked (no ambiguity)', () => {
      const weekValue = fieldValues.get(WEEK_FIELD) || '';
      const fortnightValue = fieldValues.get(FORTNIGHT_FIELD) || '';
      const monthValue = fieldValues.get(MONTH_FIELD) || '';
      const otherValue = fieldValues.get(OTHER_PERIOD_FIELD) || '';

      // Count how many are marked
      const markedCount = [weekValue, fortnightValue, monthValue].filter(v => v === 'X').length;

      // Exactly one should be marked for unambiguous selection
      expect(markedCount).toBe(1);

      // Other period should not have an X
      expect(otherValue).not.toBe('X');
    });

    it('should mark "month" specifically (for this monthly tenancy fixture)', () => {
      const monthValue = fieldValues.get(MONTH_FIELD) || '';
      expect(monthValue).toBe('X');
    });

    it('should NOT mark week or fortnight', () => {
      const weekValue = fieldValues.get(WEEK_FIELD) || '';
      const fortnightValue = fieldValues.get(FORTNIGHT_FIELD) || '';

      expect(weekValue).toBe('');
      expect(fortnightValue).toBe('');
    });
  });

  describe('Q6 - Notice Served', () => {
    const NOTICE_TYPE_FIELD = '6. Other type of notice';
    const NOTICE_DAY_MONTH_FIELD = '6. Day and month notice served';
    const NOTICE_YEAR_FIELD = '6. Year notice served';

    it('should contain "Notice seeking possession (Form 3)"', () => {
      const noticeType = fieldValues.get(NOTICE_TYPE_FIELD) || '';
      expect(noticeType).toBe('Notice seeking possession (Form 3)');
    });

    it('should have readable date format (DD Month)', () => {
      const dayMonth = fieldValues.get(NOTICE_DAY_MONTH_FIELD) || '';

      // Should be "DD Month" format, e.g., "19 January"
      expect(dayMonth).toMatch(/^\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December)$/);
    });

    it('should have 2-digit year', () => {
      const year = fieldValues.get(NOTICE_YEAR_FIELD) || '';

      // Should be 2-digit year, e.g., "26"
      expect(year).toMatch(/^\d{2}$/);
    });

    it('should have correct date values for fixture (2026-01-19)', () => {
      const dayMonth = fieldValues.get(NOTICE_DAY_MONTH_FIELD) || '';
      const year = fieldValues.get(NOTICE_YEAR_FIELD) || '';

      expect(dayMonth).toBe('19 January');
      expect(year).toBe('26');
    });
  });

  describe('No Broken Sentence Fragments', () => {
    it('should NOT contain ") was served on the defendant on 20 ." fragment', () => {
      const allValues = Array.from(fieldValues.values()).join(' ');

      // The exact broken fragment
      expect(allValues).not.toContain(') was served on the defendant on 20 .');
      expect(allValues).not.toContain(') was served on the defendant on 20.');
    });

    it('should NOT have incomplete date fragments', () => {
      const allValues = Array.from(fieldValues.values()).join(' ');

      // Should not have orphaned date parts
      expect(allValues).not.toMatch(/\bon 20\s*\./); // "on 20." or "on 20 ."
      expect(allValues).not.toMatch(/\bon\s+\./); // "on ."
    });

    it('should NOT have orphaned parentheses', () => {
      const allValues = Array.from(fieldValues.values()).join(' ');

      // Should not start with close paren followed by text
      expect(allValues).not.toMatch(/^\)\s*was served/);
    });
  });

  describe('Flattened PDF Output', () => {
    it('should produce a flattened PDF', () => {
      expect(flattenedBytes).toBeDefined();
      expect(flattenedBytes.length).toBeGreaterThan(0);
    });

    it('should be larger than a minimum expected size', () => {
      // A properly filled N119 should be at least 50KB
      expect(flattenedBytes.length).toBeGreaterThan(50000);
    });

    it('should have valid PDF header', () => {
      // Check PDF magic bytes
      const header = String.fromCharCode(...flattenedBytes.slice(0, 5));
      expect(header).toBe('%PDF-');
    });
  });

  describe('Complete Pipeline Verification', () => {
    it('should fill all required fields', () => {
      // Required fields that must be filled
      const requiredFields = [
        'name of court',
        'name of claimant',
        'name of defendant',
        'The claimant has a right to possession of:',
        "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:",
        '3(a) Type of tenancy',
        '3(b) The current rent is',
        '3(b) The current rent is payable each month',
        '4. (a) The reason the claimant is asking for possession is:',
        '6. Other type of notice',
        '6. Day and month notice served',
        '6. Year notice served',
      ];

      for (const fieldName of requiredFields) {
        const value = fieldValues.get(fieldName);
        expect(value, `Field "${fieldName}" should be filled`).toBeDefined();
        expect(value, `Field "${fieldName}" should not be empty`).not.toBe('');
      }
    });

    it('should have correct defendant and claimant names', () => {
      expect(fieldValues.get('name of defendant')).toBe('Sonia Shezadi');
      expect(fieldValues.get('name of claimant')).toBe('Tariq Mohammed');
    });

    it('should have property address filled', () => {
      const propertyAddress = fieldValues.get('The claimant has a right to possession of:') || '';
      expect(propertyAddress).toContain('16 Waterloo Road');
      expect(propertyAddress).toContain('Pudsey');
      expect(propertyAddress).toContain('LS28 7PW');
    });

    it('should have rent amount with £ symbol (no duplicates)', () => {
      const rentValue = fieldValues.get('3(b) The current rent is') || '';

      // Should have exactly one £ symbol
      const poundCount = (rentValue.match(/£/g) || []).length;
      expect(poundCount).toBe(1);

      // Should match currency format
      expect(rentValue).toMatch(/^£[\d,]+\.\d{2}$/);
    });

    it('should have tenancy date in UK legal format', () => {
      const tenancyDate = fieldValues.get('3(a) Date of tenancy') || '';

      // Should be "DD Month YYYY" format
      expect(tenancyDate).toMatch(/^\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/);
    });
  });
});
