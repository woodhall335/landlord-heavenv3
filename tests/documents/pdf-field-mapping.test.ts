import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

const formsRoot = path.join(process.cwd(), 'public', 'official-forms');

async function loadFieldNames(formFile: string): Promise<Set<string>> {
  const pdfBytes = await fs.readFile(path.join(formsRoot, formFile));
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  return new Set(form.getFields().map((field) => field.getName()));
}

describe('Official form assets', () => {
  it('includes required England & Wales PDFs', async () => {
    const requiredForms = ['n5-eng.pdf', 'n5b-eng.pdf', 'n119-eng.pdf', 'N1_1224.pdf', 'form_6a.pdf'];

    for (const formFile of requiredForms) {
      await expect(fs.access(path.join(formsRoot, formFile))).resolves.toBeUndefined();
    }
  });

  it('has manifest entries present on disk across jurisdictions', async () => {
    const manifestRaw = await fs.readFile(path.join(formsRoot, 'forms-manifest.json'), 'utf-8');
    const manifest = JSON.parse(manifestRaw);

    const missing: string[] = [];

    for (const [jurisdiction, config] of Object.entries<any>(manifest.jurisdictions)) {
      if (!config.forms) continue;

      for (const formFile of Object.keys(config.forms)) {
        const candidates = [path.join(formsRoot, formFile), path.join(formsRoot, jurisdiction, formFile)];
        const found = await Promise.all(
          candidates.map(async (candidate) =>
            fs
              .access(candidate)
              .then(() => true)
              .catch(() => false)
          )
        );

        if (!found.some(Boolean)) {
          missing.push(`${jurisdiction}/${formFile}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });
});

describe('PDF field mappings align with official forms', () => {
  it('matches critical N5 fields', async () => {
    const fields = await loadFieldNames('n5-eng.pdf');
    const expected = [
      'In the court',
      'Fee account no',
      "claimant's details",
      "defendant's details",
      'possession of',
      'Full name of the person signing the Statement of Truth',
      'Name of claimant’s legal representative’s firm',
      'Statement of Truth is signed by the Claimant’s legal representative (as defined by CPR 2.3(1))',
      'building and street - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent',
      'Second line of address - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent',
      'Town or city - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent',
      'County (optional) - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent',
      'Postcode - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent'
    ];

    expected.forEach((name) => expect(fields.has(name)).toBe(true));
  });

  it('matches critical N5B fields', async () => {
    const fields = await loadFieldNames('n5b-eng.pdf');
    const expected = [
      'Enter the full names of the Claimants',
      'Enter the full names of the Defendants',
      'Name and address of the court',
      'The Claimant is claiming possession of',
      '10a How was the notice served',
      '10c Who served the notice',
      '10d Who was the notice served on',
      'Name of Claimants legal representatives firm',
      'Statement of Truth signature'
    ];

    expected.forEach((name) => expect(fields.has(name)).toBe(true));
  });

  it('matches critical N119 fields', async () => {
    const fields = await loadFieldNames('n119-eng.pdf');
    const expected = [
      'name of court',
      'name of claimant',
      'name of defendant',
      'The claimant has a right to possession of:',
      'To the best of the claimant’s knowledge the following persons are in possession of the property:',
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
      'Statement of Truth signed by Claimant’s legal representative (as defined by CPR 2.3(1))',
      'Name of claimant’s legal representative’s firm'
    ];

    expected.forEach((name) => expect(fields.has(name)).toBe(true));
  });

  it('matches critical N1 fields', async () => {
    const fields = await loadFieldNames('N1_1224.pdf');
    const expected = [
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
      'Text Field 2'
    ];

    expected.forEach((name) => expect(fields.has(name)).toBe(true));
  });

  it('matches critical Form 6A fields', async () => {
    const fields = await loadFieldNames('form_6a.pdf');
    const expected = [
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
      'Signatory address 2'
    ];

    expected.forEach((name) => expect(fields.has(name)).toBe(true));
  });
});
