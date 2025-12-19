import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

const expected = [
  'In the court',
  'Fee account no',
  "claimant\u2019s details",
  "defendant\u2019s details",
  'possession of',
  'Full name of the person signing the Statement of Truth',
  "Name of claimant\u2019s legal representative\u2019s firm",
  "Statement of Truth is signed by the Claimant\u2019s legal representative (as defined by CPR 2.3(1))",
  "building and street - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent",
  "Second line of address - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent",
  "Town or city - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent",
  "County (optional) - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent",
  "Postcode - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent"
];

const pdfBytes = await fs.readFile(path.join('public', 'official-forms', 'n5-eng.pdf'));
const pdfDoc = await PDFDocument.load(pdfBytes);
const form = pdfDoc.getForm();
const actualFields = new Set(form.getFields().map((field) => field.getName()));

console.log('Expected fields NOT in PDF:');
expected.forEach((name, i) => {
  if (!actualFields.has(name)) {
    console.log(`  [${i}] MISSING: "${name}"`);
  }
});

console.log('\nFields in PDF:');
Array.from(actualFields).forEach(name => {
  console.log(`  - "${name}"`);
});
