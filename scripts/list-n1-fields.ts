/**
 * Script to list form fields in the official N1 PDF
 * Run with: npx tsx scripts/list-n1-fields.ts
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function listFields() {
  const pdfPath = path.join(process.cwd(), 'public/official-forms/N1_1224.pdf');
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log('=== OFFICIAL N1 FORM FIELDS ===');
  console.log('Total fields:', fields.length);
  console.log('');

  fields.forEach((field, i) => {
    const type = field.constructor.name;
    const name = field.getName();
    console.log(`${i + 1}. [${type}] ${name}`);
  });
}

listFields().catch(console.error);
