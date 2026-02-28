/**
 * Debug N119 Filled PDF Generator
 *
 * Generates both filled (non-flattened) and flattened versions of the N119
 * for visual inspection and debugging.
 *
 * Usage:
 *   npx ts-node scripts/debug-n119-filled.ts
 *
 * Output:
 *   - tests/output/n119-filled-unflattened.pdf
 *   - tests/output/n119-filled-flattened.pdf
 *   - tests/output/n119-field-values.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { PDFDocument } from 'pdf-lib';

// Dynamic import of local modules
async function main() {
  const OUTPUT_DIR = join(process.cwd(), 'tests', 'output');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load the golden fixture
  const fixturePath = join(
    process.cwd(),
    'tests/fixtures/complete-pack/england.section8.ground8.case.json'
  );
  const goldenFixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

  console.log('🔍 Debug N119 PDF Generator\n');
  console.log('='.repeat(60));

  // Import the necessary modules
  const { wizardFactsToEnglandWalesEviction } = await import(
    '../src/lib/documents/eviction-wizard-mapper'
  );
  const { fillN119Form } = await import('../src/lib/documents/official-forms-filler');

  // Generate case data from fixture
  console.log('📋 Converting fixture to case data...');
  const result = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
  const caseData = result.caseData;

  console.log('');
  console.log('=== KEY CASE DATA VALUES ===');
  console.log(`tenant_full_name: "${caseData.tenant_full_name}"`);
  console.log(`landlord_full_name: "${caseData.landlord_full_name}"`);
  console.log(`rent_amount: ${caseData.rent_amount}`);
  console.log(`rent_frequency: "${caseData.rent_frequency}"`);
  console.log(`notice_served_date: "${caseData.notice_served_date}"`);
  console.log(`section_8_notice_date: "${caseData.section_8_notice_date}"`);
  console.log(`claim_type: "${caseData.claim_type}"`);
  console.log('');

  // Generate UNFLATTENED PDF
  console.log('📄 Generating unflattened N119...');
  const unflattenedBytes = await fillN119Form(caseData, { flatten: false });

  const unflattenedPath = join(OUTPUT_DIR, 'n119-filled-unflattened.pdf');
  writeFileSync(unflattenedPath, unflattenedBytes);
  console.log(`✅ Saved: ${unflattenedPath}`);

  // Extract field values from unflattened PDF
  console.log('');
  console.log('📊 Extracting field values from unflattened PDF...');

  const pdfDoc = await PDFDocument.load(unflattenedBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  const fieldValues: Record<string, string> = {};
  form.getFields().forEach((field) => {
    const name = field.getName();
    try {
      const textField = form.getTextField(name);
      const value = textField.getText() || '';
      if (value) {
        fieldValues[name] = value;
      }
    } catch {
      try {
        const checkbox = form.getCheckBox(name);
        if (checkbox.isChecked()) {
          fieldValues[name] = 'CHECKED';
        }
      } catch {
        // Skip
      }
    }
  });

  // Save field values to JSON
  const fieldValuesPath = join(OUTPUT_DIR, 'n119-field-values.json');
  writeFileSync(fieldValuesPath, JSON.stringify(fieldValues, null, 2));
  console.log(`✅ Saved: ${fieldValuesPath}`);

  // Generate FLATTENED PDF
  console.log('');
  console.log('📄 Generating flattened N119...');
  const flattenedBytes = await fillN119Form(caseData, { flatten: true });

  const flattenedPath = join(OUTPUT_DIR, 'n119-filled-flattened.pdf');
  writeFileSync(flattenedPath, flattenedBytes);
  console.log(`✅ Saved: ${flattenedPath}`);

  // Print summary of key fields
  console.log('');
  console.log('='.repeat(60));
  console.log('KEY FIELD VALUES:');
  console.log('='.repeat(60));

  const keyFields = [
    "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:",
    '3(b) The current rent is payable each month',
    '3(b) The current rent is payable each week',
    '3(b) The current rent is payable each fortnight',
    '6. Other type of notice',
    '6. Day and month notice served',
    '6. Year notice served',
    'name of defendant',
    'name of claimant',
  ];

  console.log('');
  console.log('🎯 Q2 (Persons in Possession):');
  const q2Value =
    fieldValues[
      "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:"
    ] || '(empty)';
  console.log(`   Value: "${q2Value}"`);

  console.log('');
  console.log('🎯 Q3(b) (Rent Frequency):');
  console.log(`   week: "${fieldValues['3(b) The current rent is payable each week'] || ''}"`);
  console.log(
    `   fortnight: "${fieldValues['3(b) The current rent is payable each fortnight'] || ''}"`
  );
  console.log(`   month: "${fieldValues['3(b) The current rent is payable each month'] || ''}"`);

  console.log('');
  console.log('🎯 Q6 (Notice):');
  console.log(`   Type: "${fieldValues['6. Other type of notice'] || ''}"`);
  console.log(`   Day/Month: "${fieldValues['6. Day and month notice served'] || ''}"`);
  console.log(`   Year: "${fieldValues['6. Year notice served'] || ''}"`);

  console.log('');
  console.log('🎯 Other Key Fields:');
  console.log(`   Defendant: "${fieldValues['name of defendant'] || ''}"`);
  console.log(`   Claimant: "${fieldValues['name of claimant'] || ''}"`);

  console.log('');
  console.log('='.repeat(60));
  console.log('✅ Debug generation complete!');
  console.log('');
  console.log('To inspect the PDFs:');
  console.log(`  - Unflattened: ${unflattenedPath}`);
  console.log(`  - Flattened: ${flattenedPath}`);
  console.log(`  - Field values: ${fieldValuesPath}`);
}

main().catch(console.error);
