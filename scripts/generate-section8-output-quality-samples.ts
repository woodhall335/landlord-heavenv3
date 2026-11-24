#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

import { fillForm3AForm } from '../src/lib/documents/england-official-form-fillers';

const OUTPUT_DIR = path.join(process.cwd(), 'tmp', 'pdfs', 'section8-output-quality');

const baseData = {
  jurisdiction: 'england',
  landlord_full_name: 'Alexandra Catherine Montgomery',
  landlord_address: '45 Park Lane\nSuite 4\nLeeds\nWest Yorkshire\nLS1 1AA',
  landlord_phone: '0113 555 0101',
  landlord_email: 'alexandra.montgomery@example.com',
  tenant_full_name: 'Christopher James Richardson',
  tenant_2_name: 'Eleanor Margaret Richardson',
  property_address: 'Apartment 14, The Courtyard\n187 Long Residential Avenue\nLeeds\nWest Yorkshire\nLS12 4AB',
  tenancy_start_date: '2024-02-01',
  notice_served_date: '2026-06-01',
  notice_expiry_date: '2026-10-01',
  signatory_name: 'Alexandra Catherine Montgomery',
  signatory_capacity: 'landlord',
  signature_date: '2026-06-01',
};

const chronology = Array.from(
  { length: 90 },
  (_, index) => (
    `Chronology item ${index + 1}. The landlord records the event, the date, the communication sent to the tenant, ` +
    'and the supporting material retained for the court. This statement is kept complete and readable.'
  ),
).join('\n\n');

const scenarios = [
  {
    fileName: '01-standard-rent-arrears.pdf',
    data: {
      ...baseData,
      ground_codes: ['8', '10'],
      rent_amount: 1200,
      rent_frequency: 'monthly',
      total_arrears: 4200,
      form3a_explanation:
        'Ground 8 and Ground 10 are relied on because rent remains unpaid. The attached rent schedule records each missed payment and the balance outstanding at the date of service.',
    },
  },
  {
    fileName: '02-multiple-long-statutory-grounds.pdf',
    data: {
      ...baseData,
      ground_codes: ['6', '7A', '8', '10'],
      form3a_explanation:
        'The selected grounds are supported by the tenancy agreement, rent schedule, correspondence and incident records. Each ground is relied on separately on the facts stated in the supporting evidence.',
    },
  },
  {
    fileName: '03-long-particulars-pagination.pdf',
    data: {
      ...baseData,
      ground_codes: ['12'],
      form3a_explanation: chronology,
    },
  },
] as const;

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const scenario of scenarios) {
    const bytes = await fillForm3AForm(scenario.data);
    const pdf = await PDFDocument.load(bytes);
    const outputPath = path.join(OUTPUT_DIR, scenario.fileName);
    await fs.writeFile(outputPath, bytes);
    console.log(`${scenario.fileName}: ${pdf.getPageCount()} pages, ${pdf.getForm().getFields().length} editable fields`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
