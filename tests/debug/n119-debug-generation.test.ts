/**
 * Debug test for N119 PDF generation
 * Generates filled PDFs for visual inspection
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { fillN119Form, CaseData } from '@/lib/documents/official-forms-filler';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';

const OUTPUT_DIR = path.join(process.cwd(), 'tests', 'output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load the golden fixture
const fixturePath = path.join(
  process.cwd(),
  'tests/fixtures/complete-pack/england.section8.ground8.case.json'
);
const goldenFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

describe('N119 Debug Generation', () => {
  let caseData: CaseData;
  let unflattenedBytes: Uint8Array;
  let flattenedBytes: Uint8Array;
  let fieldValues: Map<string, string>;

  beforeAll(async () => {
    // Generate case data from fixture
    const result = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
    caseData = result.caseData;

    console.log('\n=== KEY CASE DATA VALUES ===');
    console.log(`tenant_full_name: "${caseData.tenant_full_name}"`);
    console.log(`landlord_full_name: "${caseData.landlord_full_name}"`);
    console.log(`rent_amount: ${caseData.rent_amount}`);
    console.log(`rent_frequency: "${caseData.rent_frequency}"`);
    console.log(`notice_served_date: "${caseData.notice_served_date}"`);
    console.log(`section_8_notice_date: "${caseData.section_8_notice_date}"`);
    console.log(`claim_type: "${caseData.claim_type}"`);

    // Generate unflattened PDF
    unflattenedBytes = await fillN119Form(caseData, { flatten: false });

    // Save unflattened PDF
    const unflattenedPath = path.join(OUTPUT_DIR, 'n119-filled-unflattened.pdf');
    fs.writeFileSync(unflattenedPath, unflattenedBytes);
    console.log(`\n✅ Saved unflattened: ${unflattenedPath}`);

    // Extract field values
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

    // Save field values to JSON
    const fieldValuesPath = path.join(OUTPUT_DIR, 'n119-field-values.json');
    const valuesObj = Object.fromEntries(fieldValues);
    fs.writeFileSync(fieldValuesPath, JSON.stringify(valuesObj, null, 2));
    console.log(`✅ Saved field values: ${fieldValuesPath}`);

    // Generate flattened PDF
    flattenedBytes = await fillN119Form(caseData, { flatten: true });

    // Save flattened PDF
    const flattenedPath = path.join(OUTPUT_DIR, 'n119-filled-flattened.pdf');
    fs.writeFileSync(flattenedPath, flattenedBytes);
    console.log(`✅ Saved flattened: ${flattenedPath}`);
  });

  it('should fill Q2 with tenant name', () => {
    const fieldName = "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:";
    const value = fieldValues.get(fieldName) || '';

    console.log('\n🎯 Q2 (Persons in Possession):');
    console.log(`   Field: "${fieldName}"`);
    console.log(`   Value: "${value}"`);

    expect(value).toBe('Sonia Shezadi');
  });

  it('should mark monthly for Q3(b) frequency', () => {
    const weekValue = fieldValues.get('3(b) The current rent is payable each week') || '';
    const fortnightValue = fieldValues.get('3(b) The current rent is payable each fortnight') || '';
    const monthValue = fieldValues.get('3(b) The current rent is payable each month') || '';

    console.log('\n🎯 Q3(b) (Rent Frequency):');
    console.log(`   week: "${weekValue}"`);
    console.log(`   fortnight: "${fortnightValue}"`);
    console.log(`   month: "${monthValue}"`);

    expect(monthValue).toBe('X');
    expect(weekValue).toBeFalsy();
    expect(fortnightValue).toBeFalsy();
  });

  it('should fill Q6 notice fields', () => {
    const noticeType = fieldValues.get('6. Other type of notice') || '';
    const dayMonth = fieldValues.get('6. Day and month notice served') || '';
    const year = fieldValues.get('6. Year notice served') || '';

    console.log('\n🎯 Q6 (Notice):');
    console.log(`   Type: "${noticeType}"`);
    console.log(`   Day/Month: "${dayMonth}"`);
    console.log(`   Year: "${year}"`);

    expect(noticeType).toContain('Notice seeking possession');
    expect(dayMonth).toMatch(/^\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December)$/);
    expect(year).toMatch(/^\d{2}$/);
  });

  it('should fill defendant and claimant', () => {
    const defendant = fieldValues.get('name of defendant') || '';
    const claimant = fieldValues.get('name of claimant') || '';

    console.log('\n🎯 Names:');
    console.log(`   Defendant: "${defendant}"`);
    console.log(`   Claimant: "${claimant}"`);

    expect(defendant).toBe('Sonia Shezadi');
    expect(claimant).toBe('Tariq Mohammed');
  });

  it('should NOT have broken sentence fragments', () => {
    const allValues = Array.from(fieldValues.values()).join(' ');

    // Check for the specific broken fragment mentioned in the issue
    expect(allValues).not.toContain(') was served on the defendant on 20 .');
    expect(allValues).not.toContain(') was served on the defendant on 20.');
  });

  it('should have all key fields filled', () => {
    console.log('\n=== ALL FILLED FIELDS ===');
    fieldValues.forEach((value, key) => {
      const displayValue = value.length > 60 ? value.substring(0, 60) + '...' : value;
      console.log(`"${key}": "${displayValue}"`);
    });

    // Should have a reasonable number of filled fields
    expect(fieldValues.size).toBeGreaterThan(20);
  });
});
