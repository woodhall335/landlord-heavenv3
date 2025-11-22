/**
 * N1 Field Test - Fill each field with its own name
 *
 * This creates a PDF where each field shows its field name,
 * making it easy to visually identify which generic field is which.
 */

import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const N1_PATH = join(process.cwd(), 'public', 'official-forms', 'N1_1224.pdf');
const OUTPUT_PATH = join(process.cwd(), 'test-n1-field-mapping.pdf');

async function testN1Fields() {
  console.log('📄 Creating N1 test PDF with field names...\n');

  const pdfBytes = readFileSync(N1_PATH);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log(`Found ${fields.length} fields\n`);

  let textCount = 0;
  let checkboxCount = 0;

  fields.forEach((field) => {
    const fieldName = field.getName();
    const fieldType = field.constructor.name;

    console.log(`${fieldName} (${fieldType})`);

    try {
      if (fieldType === 'PDFTextField') {
        const textField = field as any;
        textField.setText(fieldName); // Fill with its own name
        textCount++;
      } else if (fieldType === 'PDFCheckBox') {
        // Leave checkboxes unchecked so we can see the text fields clearly
        checkboxCount++;
      }
    } catch (error) {
      console.warn(`  ⚠️  Could not fill field: ${error}`);
    }
  });

  console.log(`\n✅ Filled ${textCount} text fields`);
  console.log(`✅ Found ${checkboxCount} checkboxes (left unchecked)\n`);

  const filledPdfBytes = await pdfDoc.save();
  writeFileSync(OUTPUT_PATH, filledPdfBytes);

  console.log(`💾 Saved test PDF to: ${OUTPUT_PATH}`);
  console.log('\n📌 Open this PDF to see which field name appears in which position!\n');
}

testN1Fields().catch(console.error);
