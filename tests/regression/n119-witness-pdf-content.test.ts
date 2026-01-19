/**
 * N119 + Witness Statement PDF Content Regression Test
 *
 * This test actually generates PDFs and verifies the rendered content
 * to ensure fixes for Q2, Q6, frequency, and witness statement are working.
 *
 * Uses case_id: 549f8bbf-82c3-47f5-96fc-fb522b64867b (golden fixture)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { fillN119Form, CaseData } from '@/lib/documents/official-forms-filler';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';
import { generateDocument } from '@/lib/documents/generator';
import {
  buildWitnessStatementSections,
  extractWitnessStatementSectionsInput,
} from '@/lib/documents/witness-statement-sections';

// Load the golden fixture
const fixturePath = path.join(
  process.cwd(),
  'tests/fixtures/complete-pack/england.section8.ground8.case.json'
);
const goldenFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

/**
 * Extract text values from filled PDF form fields
 */
async function extractFilledFieldValues(pdfBytes: Uint8Array): Promise<Map<string, string>> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const fieldValues = new Map<string, string>();

  form.getFields().forEach((field) => {
    const name = field.getName();
    try {
      // Try to get text value
      const textField = form.getTextField(name);
      const value = textField.getText() || '';
      if (value) {
        fieldValues.set(name, value);
      }
    } catch {
      // Not a text field, might be checkbox
      try {
        const checkbox = form.getCheckBox(name);
        if (checkbox.isChecked()) {
          fieldValues.set(name, 'CHECKED');
        }
      } catch {
        // Skip non-text, non-checkbox fields
      }
    }
  });

  return fieldValues;
}

describe('N119 + Witness Statement PDF Content Regression', () => {
  describe('N119 PDF Generation', () => {
    let caseData: CaseData;
    let n119PdfBytes: Uint8Array;
    let fieldValues: Map<string, string>;

    beforeAll(async () => {
      // Generate case data from fixture
      const result = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
      caseData = result.caseData;

      // Generate N119 PDF without flattening so we can read field values
      n119PdfBytes = await fillN119Form(caseData, { flatten: false });
      fieldValues = await extractFilledFieldValues(n119PdfBytes);

      console.log('\n=== N119 FILLED FIELD VALUES ===');
      console.log(`Total filled fields: ${fieldValues.size}\n`);
      fieldValues.forEach((value, key) => {
        if (value.length > 50) {
          console.log(`${key}: "${value.substring(0, 50)}..."`);
        } else {
          console.log(`${key}: "${value}"`);
        }
      });
      console.log('');
    });

    it('Q2: should have tenant name in persons in possession field', () => {
      // Field name with curly apostrophe
      const occupantsFieldName = "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:";
      const occupantsValue = fieldValues.get(occupantsFieldName) || '';

      console.log('Q2 OCCUPANTS field value:', occupantsValue);

      expect(occupantsValue).toContain('Sonia Shezadi');
      expect(occupantsValue).not.toBe('');
    });

    it('Q6: should have notice type filled', () => {
      const noticeTypeFieldName = '6. Other type of notice';
      const noticeTypeValue = fieldValues.get(noticeTypeFieldName) || '';

      console.log('Q6 NOTICE_OTHER_TYPE field value:', noticeTypeValue);

      expect(noticeTypeValue).toContain('Notice seeking possession');
      expect(noticeTypeValue).not.toBe('');
    });

    it('Q6: should have notice served date filled', () => {
      const noticeDayMonthFieldName = '6. Day and month notice served';
      const noticeYearFieldName = '6. Year notice served';

      const dayMonth = fieldValues.get(noticeDayMonthFieldName) || '';
      const year = fieldValues.get(noticeYearFieldName) || '';

      console.log('Q6 NOTICE_DATE_DAY_MONTH:', dayMonth);
      console.log('Q6 NOTICE_DATE_YEAR:', year);

      // Day/month should be DD/MM format
      expect(dayMonth).toMatch(/^\d{1,2}\/\d{1,2}$/);
      // Year should be 2-digit
      expect(year).toMatch(/^\d{2}$/);
    });

    it('Frequency: should have monthly rent frequency marked', () => {
      const monthlyFieldName = '3(b) The current rent is payable each month';
      const monthlyValue = fieldValues.get(monthlyFieldName) || '';

      console.log('RENT_MONTHLY field value:', monthlyValue);

      // Should have 'X' marked for monthly
      expect(monthlyValue).toBe('X');

      // Should NOT have weekly or fortnightly marked
      const weeklyFieldName = '3(b) The current rent is payable each week';
      const fortnightlyFieldName = '3(b) The current rent is payable each fortnight';

      expect(fieldValues.get(weeklyFieldName)).toBeFalsy();
      expect(fieldValues.get(fortnightlyFieldName)).toBeFalsy();
    });

    it('should have defendant name filled', () => {
      const defendantFieldName = 'name of defendant';
      const defendantValue = fieldValues.get(defendantFieldName) || '';

      console.log('DEFENDANT field value:', defendantValue);

      expect(defendantValue).toBe('Sonia Shezadi');
    });

    it('should have claimant name filled', () => {
      const claimantFieldName = 'name of claimant';
      const claimantValue = fieldValues.get(claimantFieldName) || '';

      console.log('CLAIMANT field value:', claimantValue);

      expect(claimantValue).toBe('Tariq Mohammed');
    });

    it('should have rent amount filled with £ symbol', () => {
      const rentFieldName = '3(b) The current rent is';
      const rentValue = fieldValues.get(rentFieldName) || '';

      console.log('RENT field value:', rentValue);

      expect(rentValue).toMatch(/^£[\d,]+\.\d{2}$/);
      expect(rentValue).toContain('1000');
    });

    it('should NOT have malformed Q6 sentence fragments', () => {
      // The malformed fragment was ") was served on the defendant on 20 ."
      // This should NOT appear in any field
      const allValues = Array.from(fieldValues.values()).join(' ');

      expect(allValues).not.toContain(') was served on the defendant on 20 .');
      expect(allValues).not.toContain(') was served on the defendant on 20.');
    });
  });

  describe('Witness Statement Generation', () => {
    let witnessContent: ReturnType<typeof buildWitnessStatementSections>;

    beforeAll(() => {
      const sectionsInput = extractWitnessStatementSectionsInput(goldenFixture);
      witnessContent = buildWitnessStatementSections(sectionsInput);

      console.log('\n=== WITNESS STATEMENT SECTIONS ===');
      console.log('Introduction:', witnessContent.introduction?.substring(0, 100) + '...');
      console.log('Tenancy History:', witnessContent.tenancy_history?.substring(0, 100) + '...');
      console.log('Grounds Summary:', witnessContent.grounds_summary?.substring(0, 100) + '...');
      console.log('');
    });

    it('introduction should contain property address', () => {
      expect(witnessContent.introduction).toContain('16 Waterloo Road');
    });

    it('introduction should contain Housing Act reference', () => {
      expect(witnessContent.introduction).toContain('Housing Act 1988');
    });

    it('tenancy_history should contain start date in UK format', () => {
      expect(witnessContent.tenancy_history).toContain('14 July 2025');
    });

    it('tenancy_history should contain rent amount', () => {
      expect(witnessContent.tenancy_history).toContain('£1,000.01');
    });

    it('tenancy_history should contain monthly frequency', () => {
      expect(witnessContent.tenancy_history.toLowerCase()).toContain('monthly');
    });

    it('grounds_summary should contain Ground 8', () => {
      expect(witnessContent.grounds_summary).toContain('Ground 8');
    });

    it('grounds_summary should contain arrears amount', () => {
      expect(witnessContent.grounds_summary).toContain('7,000.07');
    });

    it('timeline should have chronological events', () => {
      expect(witnessContent.timeline).toContain('Tenancy commenced');
      expect(witnessContent.timeline).toContain('Section 8 Notice served');
    });

    it('evidence_references should list pack documents', () => {
      expect(witnessContent.evidence_references).toContain('Form N5');
      expect(witnessContent.evidence_references).toContain('Form N119');
      expect(witnessContent.evidence_references).toContain('Schedule of Arrears');
    });

    it('all sections should have substantial content (not just headings)', () => {
      // Each section should have at least 50 characters of content
      expect(witnessContent.introduction?.length).toBeGreaterThan(50);
      expect(witnessContent.tenancy_history?.length).toBeGreaterThan(50);
      expect(witnessContent.grounds_summary?.length).toBeGreaterThan(100);
      expect(witnessContent.timeline?.length).toBeGreaterThan(50);
      expect(witnessContent.evidence_references?.length).toBeGreaterThan(100);
      expect(witnessContent.conclusion?.length).toBeGreaterThan(50);
    });
  });

  describe('Witness Statement Template Rendering', () => {
    it('should render witness statement HTML with all sections', async () => {
      const { evictionCase } = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
      const sectionsInput = extractWitnessStatementSectionsInput({
        ...goldenFixture,
        ...evictionCase,
      });
      const witnessContent = buildWitnessStatementSections(sectionsInput);

      // Generate the HTML document
      const doc = await generateDocument({
        templatePath: 'uk/england/templates/eviction/witness-statement.hbs',
        data: {
          ...evictionCase,
          witness_statement: witnessContent,
          landlord_name: evictionCase.landlord_full_name,
          tenant_name: evictionCase.tenant_full_name,
          landlord_address: evictionCase.landlord_address,
          court_name: 'County Court',
          generated_date: '19 January 2026',
        },
        isPreview: false,
        outputFormat: 'html',
      });

      const html = doc.html || '';

      console.log('\n=== WITNESS STATEMENT HTML EXCERPT ===');
      console.log('HTML length:', html.length);
      console.log('Contains introduction section:', html.includes('Introduction'));
      console.log('Contains tenancy history section:', html.includes('Tenancy History'));
      console.log('Contains property address:', html.includes('16 Waterloo Road'));
      console.log('Contains Waterloo:', html.includes('Waterloo'));
      console.log('Contains Pudsey:', html.includes('Pudsey'));

      // Extract the introduction section content
      const introMatch = html.match(/Introduction<\/h2>\s*<div class="statement-content">([\s\S]*?)<\/div>/);
      if (introMatch) {
        console.log('Introduction section content:', introMatch[1].trim().substring(0, 200));
      } else {
        console.log('Could not find introduction section');
      }
      console.log('');

      // Verify sections are rendered
      expect(html).toContain('Introduction');
      expect(html).toContain('Tenancy History');
      expect(html).toContain('Grounds for Possession');
      expect(html).toContain('Timeline of Events');
      expect(html).toContain('Supporting Evidence');

      // Verify content is present (not just headings)
      expect(html).toContain('16 Waterloo Road'); // Property address
      expect(html).toContain('I am the landlord'); // Introduction content
      expect(html).toContain('14 July 2025'); // Tenancy start date
      expect(html).toContain('Ground 8'); // Ground reference
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should produce N119 with all required fields from fixture', async () => {
      const { caseData } = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);

      // Verify all critical data is present before N119 generation
      expect(caseData.tenant_full_name).toBe('Sonia Shezadi');
      expect(caseData.landlord_full_name).toBe('Tariq Mohammed');
      expect(caseData.rent_frequency).toBe('monthly');
      expect(caseData.claim_type).toBe('section_8');

      // Generate N119 - should not throw
      const n119Bytes = await fillN119Form(caseData, { flatten: false });
      expect(n119Bytes.length).toBeGreaterThan(50000); // PDF should have content

      // Verify field values
      const fieldValues = await extractFilledFieldValues(n119Bytes);

      // Q2 - Persons in possession
      const occupantsKey = "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:";
      expect(fieldValues.get(occupantsKey)).toContain('Sonia Shezadi');

      // Q6 - Notice type
      expect(fieldValues.get('6. Other type of notice')).toContain('Notice seeking possession');

      // Frequency - Monthly selected
      expect(fieldValues.get('3(b) The current rent is payable each month')).toBe('X');
    });
  });
});
