/**
 * PDF Field Inventory Test
 *
 * Lists all form fields in the official court PDFs to identify correct field names.
 */

import { describe, test } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

const FORMS_DIR = path.join(process.cwd(), 'public', 'official-forms');

async function inventoryPdfFields(pdfName: string): Promise<void> {
  const pdfPath = path.join(FORMS_DIR, pdfName);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`PDF: ${pdfName}`);
  console.log('='.repeat(80));

  const pdfBytes = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log(`Total fields: ${fields.length}\n`);

  // Group by field type
  const textFields: string[] = [];
  const checkboxes: string[] = [];
  const dropdowns: string[] = [];
  const others: string[] = [];

  for (const field of fields) {
    const name = field.getName();
    const type = field.constructor.name;

    if (type.includes('Text')) {
      textFields.push(name);
    } else if (type.includes('Check')) {
      checkboxes.push(name);
    } else if (type.includes('Dropdown') || type.includes('Option') || type.includes('Radio')) {
      dropdowns.push(name);
    } else {
      others.push(`${name} (${type})`);
    }
  }

  if (textFields.length > 0) {
    console.log('TEXT FIELDS:');
    console.log('-'.repeat(40));
    textFields.sort().forEach(name => console.log(`  "${name}"`));
    console.log();
  }

  if (checkboxes.length > 0) {
    console.log('CHECKBOXES:');
    console.log('-'.repeat(40));
    checkboxes.sort().forEach(name => console.log(`  "${name}"`));
    console.log();
  }

  if (dropdowns.length > 0) {
    console.log('DROPDOWNS/RADIO:');
    console.log('-'.repeat(40));
    dropdowns.sort().forEach(name => console.log(`  "${name}"`));
    console.log();
  }

  if (others.length > 0) {
    console.log('OTHER FIELDS:');
    console.log('-'.repeat(40));
    others.sort().forEach(name => console.log(`  ${name}`));
    console.log();
  }

  // Search for court-related fields
  console.log('COURT-RELATED FIELDS (containing "court"):');
  console.log('-'.repeat(40));
  const courtFields = fields.filter(f =>
    f.getName().toLowerCase().includes('court') ||
    f.getName().toLowerCase().includes('in the')
  );
  if (courtFields.length === 0) {
    console.log('  (none found)');
  } else {
    courtFields.forEach(f => console.log(`  "${f.getName()}" (${f.constructor.name})`));
  }
  console.log();
}

describe('PDF Field Inventory', () => {
  test('N5 form fields', async () => {
    await inventoryPdfFields('n5-eng.pdf');
  });

  test('N5B form fields', async () => {
    await inventoryPdfFields('n5b-eng.pdf');
  });

  test('N119 form fields', async () => {
    await inventoryPdfFields('n119-eng.pdf');
  });
});
