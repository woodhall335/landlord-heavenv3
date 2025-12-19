import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

async function compareFields(filename, expected) {
  const pdfBytes = await fs.readFile(path.join('public', 'official-forms', filename));
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const actualFields = new Set(form.getFields().map((field) => field.getName()));
  
  console.log(`\n${filename}:`);
  expected.forEach((name) => {
    const found = actualFields.has(name);
    if (!found) {
      console.log(`MISSING: "${name}"`);
      console.log(`  Char codes:`, [...name].map(c => c.charCodeAt(0)));
      // Find similar
      const similar = [...actualFields].filter(f => f.toLowerCase().includes(name.toLowerCase().substring(0, 20)));
      if (similar.length) {
        console.log(`  Similar:`, similar[0]);
        console.log(`  Similar char codes:`, [...similar[0]].map(c => c.charCodeAt(0)));
      }
    }
  });
}

await compareFields('n5-eng.pdf', [
  'In the court',
  'Fee account no',
  "claimant's details",
  "defendant's details",
  'possession of',
  'Full name of the person signing the Statement of Truth',
  'Name of claimant's legal representative's firm',
  'Statement of Truth is signed by the Claimant's legal representative (as defined by CPR 2.3(1))',
  'building and street - Claimant's or claimant's legal representative's address to which documents or payments should be sent',
  'Second line of address - Claimant's or claimant's legal representative's address to which documents or payments should be sent',
  'Town or city - Claimant's or claimant's legal representative's address to which documents or payments should be sent',
  'County (optional) - Claimant's or claimant's legal representative's address to which documents or payments should be sent',
  'Postcode - Claimant's or claimant's legal representative's address to which documents or payments should be sent'
]);

await compareFields('n119-eng.pdf', [
  'name of court',
  'name of claimant',
  'name of defendant',
  'The claimant has a right to possession of:',
  'To the best of the claimant's knowledge the following persons are in possession of the property:',
  '3(a) Type of tenancy',
  '3(a) Date of tenancy',
  '3(b) The current rent is',
  '4. (a) The reason the claimant is asking for possession is:',
  '6. Day and month notice served',
  '6. Year notice served',
  '13. The claimant is - other',
  '13. Details if the claimant is some other entity',
  'I believe that the facts stated in these particulars of claim are true',
  'The Claimant believes that the facts stated in these particulars of claim are true. I am authorised by the claimant to sign this statement',
  'Statement of Truth signed by Claimant's legal representative (as defined by CPR 2.3(1))',
  'Name of claimant's legal representative's firm'
]);
