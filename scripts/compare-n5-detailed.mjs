import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Exact copy from the test file
const expected = [
  'In the court',
  'Fee account no',
  "claimant's details",
  "defendant's details",
  'possession of',
  'Full name of the person signing the Statement of Truth',
  "Name of claimant's legal representative's firm",
  "Statement of Truth is signed by the Claimant's legal representative (as defined by CPR 2.3(1))",
  "building and street - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  "Second line of address - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  "Town or city - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  "County (optional) - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  "Postcode - Claimant's or claimant's legal representative's address to which documents or payments should be sent"
];

const pdfBytes = await fs.readFile(path.join('public', 'official-forms', 'n5-eng.pdf'));
const pdfDoc = await PDFDocument.load(pdfBytes);
const form = pdfDoc.getForm();
const actualFields = form.getFields().map((field) => field.getName());

console.log('Comparison:');
expected.forEach((expName, i) => {
  const found = actualFields.includes(expName);
  if (!found) {
    console.log(`\n[${i}] MISSING: "${expName}"`);
    console.log(`  Expected hex: ${Buffer.from(expName).toString('hex')}`);

    // Find similar field
    const similar = actualFields.find(a => {
      const expClean = expName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const actClean = a.toLowerCase().replace(/[^a-z0-9]/g, '');
      return expClean === actClean;
    });

    if (similar) {
      console.log(`  Found similar: "${similar}"`);
      console.log(`  Actual hex:    ${Buffer.from(similar).toString('hex')}`);

      // Show char differences
      for (let j = 0; j < Math.max(expName.length, similar.length); j++) {
        if (expName[j] !== similar[j]) {
          console.log(`  Diff at pos ${j}: expected '${expName[j]}' (${expName.charCodeAt(j)}) vs actual '${similar[j]}' (${similar.charCodeAt(j)})`);
        }
      }
    }
  } else {
    console.log(`[${i}] ✓ Found: "${expName}"`);
  }
});
