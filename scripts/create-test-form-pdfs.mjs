/**
 * Script to create minimal test PDFs with form fields for testing
 * These are NOT official court forms - they're minimal fixtures for CI/testing
 * Real official PDFs should be placed in public/official-forms/ for production
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createTestPDFWithFields(filename, title, fields, subdirectory = '') {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const form = pdfDoc.getForm();

  const { height } = page.getSize();

  // Title
  page.drawText(title, {
    x: 50,
    y: height - 50,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Test fixture notice
  page.drawText('TEST FIXTURE - NOT AN OFFICIAL COURT FORM', {
    x: 50,
    y: height - 70,
    size: 8,
    font: boldFont,
    color: rgb(0.7, 0, 0),
  });

  // Add form fields
  let yPosition = height - 100;
  fields.forEach((fieldName) => {
    const textField = form.createTextField(fieldName);
    textField.addToPage(page, {
      x: 50,
      y: yPosition - 15,
      width: 400,
      height: 15,
    });
    yPosition -= 20;
  });

  const pdfBytes = await pdfDoc.save();
  const basePath = subdirectory
    ? path.join(__dirname, '..', 'public', 'official-forms', subdirectory)
    : path.join(__dirname, '..', 'public', 'official-forms');

  // Ensure directory exists
  fs.mkdirSync(basePath, { recursive: true });

  const outputPath = path.join(basePath, filename);
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`✓ Created ${subdirectory ? subdirectory + '/' : ''}${filename} with ${fields.length} fields`);
}

async function main() {
  console.log('Creating test PDF fixtures with form fields...\n');

  // N5 - Claim for possession of property
  await createTestPDFWithFields('n5-eng.pdf', 'N5 - Claim for Possession (Test Fixture)', [
    "In the court",
    "Fee account no",
    "claimant\u2019s details",
    "defendant\u2019s details",
    "possession of",
    "Full name of the person signing the Statement of Truth",
    "Name of claimant\u2019s legal representative\u2019s firm",
    "Statement of Truth is signed by the Claimant\u2019s legal representative (as defined by CPR 2.3(1))",
    "building and street - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent",
    "Second line of address - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent",
    "Town or city - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent",
    "County (optional) - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent",
    "Postcode - Claimant\u2019s or claimant\u2019s legal representative\u2019s address to which documents or payments should be sent",
  ]);

  // N5B - Claim for possession (accelerated procedure)
  await createTestPDFWithFields('n5b-eng.pdf', 'N5B - Accelerated Possession (Test Fixture)', [
    'Enter the full names of the Claimants',
    'Enter the full names of the Defendants',
    'Name and address of the court',
    'The Claimant is claiming possession of',
    '10a How was the notice served',
    '10c Who served the notice',
    '10d Who was the notice served on',
    'Name of Claimants legal representatives firm',
    'Statement of Truth signature',
  ]);

  // N119 - Particulars of claim for possession
  await createTestPDFWithFields('n119-eng.pdf', 'N119 - Particulars of Claim (Test Fixture)', [
    "name of court",
    "name of claimant",
    "name of defendant",
    "The claimant has a right to possession of:",
    "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:",
    "3(a) Type of tenancy",
    "3(a) Date of tenancy",
    "3(b) The current rent is",
    "4. (a) The reason the claimant is asking for possession is:",
    "6. Day and month notice served",
    "6. Year notice served",
    "13. The claimant is - other",
    "13. Details if the claimant is some other entity",
    "I believe that the facts stated in these particulars of claim are true",
    "The Claimant believes that the facts stated in these particulars of claim are true. I am authorised by the claimant to sign this statement",
    "Statement of Truth signed by Claimant\u2019s legal representative (as defined by CPR 2.3(1))",
    "Name of claimant\u2019s legal representative\u2019s firm",
  ]);

  // N1 - Claim form (money claims)
  await createTestPDFWithFields('N1_1224.pdf', 'N1 - Claim Form (Test Fixture)', [
    'Text35',
    'Text36',
    'Text21',
    'Text22',
    'Text23',
    'Text Field 48',
    'Text25',
    'Text26',
    'Text27',
    'Text28',
    'Text Field 28',
    'Check Box40',
    'Check Box42',
    'Check Box43',
    'Text30',
    'Check Box45',
    'Check Box47',
    'Check Box46',
    'Check Box49',
    'Text Field 47',
    'Text31',
    'Text32',
    'Text33',
    'Text Field 46',
    'Text Field 45',
    'Text Field 44',
    'Text Field 10',
    'Text Field 9',
    'Text Field 8',
    'Text Field 7',
    'Text34',
    'Text Field 6',
    'Text Field 4',
    'Text Field 3',
    'Text Field 2',
  ]);

  // Form 6A - Section 21 notice
  await createTestPDFWithFields('form_6a.pdf', 'Form 6A - Section 21 Notice (Test Fixture)', [
    'Premises address',
    'leaving date DD/MM/YYYYY',
    'Name 1',
    'Name 2',
    'Address 1',
    'Signatory telephone1',
    'Signatory telephone2',
    'Check Box 1',
    'Signatory Name 1',
    'Signatory name 2 ',
    'Signed 1',
    'Date 2 ',
    'Signatory Telephone 1',
    'Signatory Telephone 2',
    'Signatory address 1',
    'Signatory address 2',
  ]);

  // Scotland forms
  await createTestPDFWithFields(
    'notice_to_leave.pdf',
    'Notice to Leave - Scotland (Test Fixture)',
    [], // Non-fillable as per test expectation
    'scotland'
  );

  await createTestPDFWithFields(
    'form_e_eviction.pdf',
    'Form E - Eviction Order Application (Test Fixture)',
    ['1', '2', '3', '4', '5', '6', '7', 'grounds', 'reqd attach', 'TEL', 'eml'],
    'scotland'
  );

  await createTestPDFWithFields(
    'simple_procedure_claim_form.pdf',
    'Simple Procedure Claim Form (Test Fixture)',
    [],
    'scotland'
  );

  await createTestPDFWithFields(
    'simple_procedure_response_form.pdf',
    'Simple Procedure Response Form (Test Fixture)',
    [],
    'scotland'
  );

  // Create forms-manifest.json
  const manifest = {
    jurisdictions: {
      england: {
        forms: {
          'n5-eng.pdf': { name: 'N5 - Claim for Possession', fillable: true },
          'n5b-eng.pdf': { name: 'N5B - Accelerated Possession', fillable: true },
          'n119-eng.pdf': { name: 'N119 - Particulars of Claim', fillable: true },
          'N1_1224.pdf': { name: 'N1 - Claim Form', fillable: true },
          'form_6a.pdf': { name: 'Form 6A - Section 21 Notice', fillable: true },
        },
      },
      scotland: {
        forms: {
          'notice_to_leave.pdf': { name: 'AT6 - Notice to Leave', fillable: false },
          'form_e_eviction.pdf': { name: 'Form E - Eviction Order Application', fillable: true },
          'simple_procedure_claim_form.pdf': { name: 'Form 3A - Simple Procedure Claim', fillable: false },
          'simple_procedure_response_form.pdf': { name: 'Form 4A - Simple Procedure Response', fillable: false },
        },
      },
    },
  };

  const manifestPath = path.join(__dirname, '..', 'public', 'official-forms', 'forms-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✓ Created forms-manifest.json');

  console.log('\n✅ All test PDF fixtures created successfully!');
  console.log('\n⚠️  NOTE: These are TEST FIXTURES only.');
  console.log('   For production, official court forms should be obtained from:');
  console.log('   - England & Wales: https://www.gov.uk/government/collections/hmcts-forms');
  console.log('   - Scotland: https://www.scotcourts.gov.uk/ and https://www.gov.scot/');
}

main().catch((err) => {
  console.error('Error creating test PDF fixtures:', err);
  process.exit(1);
});
