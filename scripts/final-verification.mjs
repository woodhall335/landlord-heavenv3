import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

const formsRoot = path.join(process.cwd(), 'public', 'official-forms');

async function loadFieldNames(formFile) {
  const pdfBytes = await fs.readFile(path.join(formsRoot, formFile));
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  return new Set(form.getFields().map((field) => field.getName()));
}

// Test N5
const fields = await loadFieldNames('n5-eng.pdf');
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

console.log(`Total expected fields: ${expected.length}`);
console.log(`Total PDF fields: ${fields.size}`);

let missing = 0;
expected.forEach((name) => {
  if (!fields.has(name)) {
    missing++;
    console.log(`\nMISSING: "${name}"`);
    console.log(`  Hex: ${Buffer.from(name).toString('hex')}`);

    // Find closest match
    const similar = Array.from(fields).find(f => {
      return f.toLowerCase().includes(name.substring(0, 20).toLowerCase());
    });
    if (similar) {
      console.log(`  Similar field: "${similar}"`);
      console.log(`  Similar hex:   ${Buffer.from(similar).toString('hex')}`);
    }
  }
});

if (missing === 0) {
  console.log('\n✅ All fields found!');
} else {
  console.log(`\n❌ ${missing} fields missing`);
}

// Show all PDF fields for reference
console.log('\nAll PDF fields:');
Array.from(fields).forEach(f => console.log(`  - ${f}`));
