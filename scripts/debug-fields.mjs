import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

async function checkFields(filename) {
  const pdfBytes = await fs.readFile(path.join('public', 'official-forms', filename));
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const actualFields = new Set(form.getFields().map((field) => field.getName()));
  
  console.log(`\n${filename}:`);
  console.log(`Actual fields (${actualFields.size}):`, Array.from(actualFields));
}

await checkFields('n5-eng.pdf');
await checkFields('n119-eng.pdf');
