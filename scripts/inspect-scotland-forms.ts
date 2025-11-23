/**
 * Inspect PDF Form Fields
 *
 * Run: npx tsx scripts/inspect-scotland-forms.ts
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

async function inspectPDFFields(pdfPath: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Inspecting: ${path.basename(pdfPath)}`);
  console.log('='.repeat(80));

  try {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`\nTotal Fields: ${fields.length}`);
    console.log('\nField Names and Types:\n');

    fields.forEach((field, index) => {
      const name = field.getName();
      const type = field.constructor.name;
      console.log(`${index + 1}. [${type}] "${name}"`);
    });

    // Also show page count
    const pages = pdfDoc.getPages();
    console.log(`\nTotal Pages: ${pages.length}`);

  } catch (error) {
    console.error(`Error inspecting PDF: ${error}`);
  }
}

async function main() {
  const formsDir = path.join(process.cwd(), 'public', 'official-forms', 'scotland');

  // Inspect Notice to Leave
  await inspectPDFFields(path.join(formsDir, 'notice_to_leave.pdf'));

  // Inspect Form E
  await inspectPDFFields(path.join(formsDir, 'form_e_eviction.pdf'));
}

main();
