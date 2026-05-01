import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';

import { fillForm3AForm, type CaseData } from '@/lib/documents/official-forms-filler';
import { FORM3A_OFFICIAL_FIELD_NAMES } from '@/lib/documents/england-official-form-fillers';

describe('Form 3A address field mapping', () => {
  it('keeps city and postcode in their own boxes when only a multiline address is supplied', async () => {
    const caseData: CaseData = {
      jurisdiction: 'england',
      landlord_full_name: 'Daniel Mercer',
      landlord_address: '27 Rowan Avenue\nLeeds\nLS8 2PF',
      landlord_phone: '0113 555 0101',
      landlord_email: 'daniel@example.com',
      tenant_full_name: 'Ivy Carleton',
      property_address: '16 Willow Mews\nYork\nYO24 3HX',
      notice_served_date: '2026-05-01',
      ground_codes: ['8', '10'],
      form3a_grounds_text: 'Ground 8 - Serious rent arrears.\nGround 10 - Some rent unpaid.',
      form3a_explanation:
        'The tenant has accrued serious rent arrears and remains in breach despite repeated requests for payment.',
      signatory_name: 'Daniel Mercer',
      signatory_capacity: 'landlord',
      signature_date: '2026-05-01',
    };

    const pdfBytes = await fillForm3AForm(caseData);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    expect(form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.propertyLine1).getText()).toBe('16 Willow Mews');
    expect(form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.propertyLine2).getText()).toBe('York');
    expect(form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.propertyCity).getText() || '').toBe('');
    expect(form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.propertyPostcode).getText()).toBe('YO243HX');

    expect(form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryLine1).getText()).toBe('27 Rowan Avenue');
    expect(form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryLine2).getText()).toBe('Leeds');
    expect(form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryCity).getText() || '').toBe('');
    expect(form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.signatoryPostcode).getText()).toBe('LS82PF');
  });
});
