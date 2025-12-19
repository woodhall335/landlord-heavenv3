import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const pdfBytes = fs.readFileSync('public/official-forms/n5-eng.pdf');
const pdfDoc = await PDFDocument.load(pdfBytes);
const form = pdfDoc.getForm();
const fields = form.getFields();

const relevant = fields.filter(f => f.getName().includes('claimant') || f.getName().includes('Claimant'));
console.log('Fields with "claimant" or "Claimant":');
relevant.forEach(f => {
  const name = f.getName();
  console.log(`\nName: "${name}"`);
  console.log(`Hex:  ${Buffer.from(name).toString('hex')}`);
  console.log(`Has curly apostrophe (U+2019): ${name.includes('\u2019')}`);
  console.log(`Has straight apostrophe ('): ${name.includes("'")}`);
});

// Also check the expected value from the test
const expected = "Name of claimant\u2019s legal representative\u2019s firm";
console.log(`\n\nExpected field name:`);
console.log(`Name: "${expected}"`);
console.log(`Hex:  ${Buffer.from(expected).toString('hex')}`);

// Check if it exists
const hasField = fields.some(f => f.getName() === expected);
console.log(`\nDoes PDF have expected field? ${hasField}`);
