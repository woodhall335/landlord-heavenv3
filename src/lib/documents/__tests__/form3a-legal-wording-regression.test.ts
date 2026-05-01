import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';

import {
  fillForm3AForm,
  FORM3A_OFFICIAL_FIELD_NAMES,
  type CaseData,
} from '../england-official-form-fillers';
import {
  buildEnglandForm3AGroundsText,
  getEnglandGroundLegalWording,
} from '@/lib/england-possession/legal-wording';

const BASE_FORM3A_CASE_DATA: CaseData = {
  jurisdiction: 'england',
  landlord_full_name: 'Tariq Ahmed Mohammed',
  landlord_address: '45 Park Lane\nLeeds\nWest Yorkshire\nLS1 1AA',
  landlord_phone: '0113 555 0101',
  landlord_email: 'landlord@example.com',
  tenant_full_name: 'Sonia Shezadi',
  property_address: '35 Woodhall Park Avenue\nPudsey\nWest Yorkshire\nLS28 7HF',
  tenancy_start_date: '2023-01-15',
  notice_served_date: '2026-06-01',
  signatory_name: 'Tariq Ahmed Mohammed',
  signatory_capacity: 'landlord',
  signature_date: '2026-06-01',
};

describe('Form 3A legal wording regression', () => {
  it('builds question 4.2 from the official legal wording source for Grounds 8, 10, and 11', async () => {
    const [ground8, ground10, ground11] = await Promise.all([
      getEnglandGroundLegalWording('8'),
      getEnglandGroundLegalWording('10'),
      getEnglandGroundLegalWording('11'),
    ]);

    expect(ground8).toBeTruthy();
    expect(ground10).toBeTruthy();
    expect(ground11).toBeTruthy();

    const expectedGroundsText = [
      `Ground 8 - ${ground8!.title}\n${ground8!.legalWording}`,
      `Ground 10 - ${ground10!.title}\n${ground10!.legalWording}`,
      `Ground 11 - ${ground11!.title}\n${ground11!.legalWording}`,
    ].join('\n\n');

    const builtGroundsText = await buildEnglandForm3AGroundsText(['8', '10', '11']);

    expect(builtGroundsText).toBe(expectedGroundsText);
  });

  it('writes the same official 4.2 wording into the editable Form 3A PDF', async () => {
    const builtGroundsText = await buildEnglandForm3AGroundsText(['8', '10', '11']);

    const pdfBytes = await fillForm3AForm({
      ...BASE_FORM3A_CASE_DATA,
      ground_codes: ['8', '10', '11'],
      form3a_grounds_text: builtGroundsText,
      form3a_explanation:
        'Ground 8, 10, and 11 are relied on for arrears and persistent delay in paying rent.',
    });

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const groundsText = form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.groundsText).getText();

    expect(groundsText).toBe(builtGroundsText);
    expect(groundsText).toContain('Ground 8 - Rent arrears');
    expect(groundsText).toContain('Ground 10 - Any rent arrears');
    expect(groundsText).toContain('Ground 11 - Persistent arrears');
  });
});
