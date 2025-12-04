/**
 * PDF Form Field Inspector
 *
 * This script inspects all official HMCTS PDF forms and outputs their field names
 * and types, so we can accurately map them in our form filler functions.
 */

import { PDFDocument } from 'pdf-lib';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const FORMS_DIR = join(process.cwd(), 'public', 'official-forms');

async function inspectPDFForm(pdfPath: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📄 Inspecting: ${pdfPath}`);
  console.log('='.repeat(80));

  try {
    const pdfBytes = readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = form.getFields();

    if (fields.length === 0) {
      console.log('⚠️  No form fields found - this may be a non-fillable PDF');
      return;
    }

    console.log(`\n✅ Found ${fields.length} form fields:\n`);

    fields.forEach((field, index) => {
      const name = field.getName();
      const type = field.constructor.name;

      console.log(`${(index + 1).toString().padStart(3)}. ${name}`);
      console.log(`     Type: ${type}`);

      // Try to get more details based on field type
      if (type === 'PDFTextField') {
        const textField = field as any;
        try {
          const maxLength = textField.getMaxLength();
          if (maxLength) {
            console.log(`     Max Length: ${maxLength}`);
          }
        } catch (__) {
          // MaxLength not set
        }
      } else if (type === 'PDFCheckBox') {
        console.log(`     Checkbox`);
      } else if (type === 'PDFRadioGroup') {
        const radioGroup = field as any;
        try {
          const options = radioGroup.getOptions();
          console.log(`     Options: ${options.join(', ')}`);
        } catch (__) {
          // No options
        }
      } else if (type === 'PDFDropdown') {
        const dropdown = field as any;
        try {
          const options = dropdown.getOptions();
          console.log(`     Options: ${options.join(', ')}`);
        } catch (__) {
          // No options
        }
      }

      console.log('');
    });

  } catch (error) {
    console.error(`❌ Error inspecting ${pdfPath}:`, error);
  }
}

async function inspectAllForms() {
  console.log('\n🔍 HMCTS Official Court Forms - Field Inspection Report');
  console.log('='.repeat(80));
  console.log(`Forms directory: ${FORMS_DIR}\n`);

  const pdfFiles = readdirSync(FORMS_DIR)
    .filter(file => file.endsWith('.pdf'))
    .sort();

  if (pdfFiles.length === 0) {
    console.log('❌ No PDF files found in', FORMS_DIR);
    process.exit(1);
  }

  console.log(`Found ${pdfFiles.length} PDF files:\n`);
  pdfFiles.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file}`);
  });

  for (const pdfFile of pdfFiles) {
    const pdfPath = join(FORMS_DIR, pdfFile);
    await inspectPDFForm(pdfPath);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Inspection complete!');
  console.log('='.repeat(80) + '\n');
}

// Run inspection
inspectAllForms().catch(console.error);
