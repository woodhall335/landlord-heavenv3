import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';

import {
  fillForm3AForm,
  FORM3A_OFFICIAL_FIELD_NAMES,
} from '../england-official-form-fillers';
import {
  buildEnglandForm3AGroundsText,
  EnglandForm3ALegalWordingError,
  getEnglandForm3AGroundLegalWordingMap,
  getEnglandGroundLegalWording,
} from '@/lib/england-possession/legal-wording';
import { extractPdfText } from '@/lib/evidence/extract-pdf-text';

const BASE_FORM3A_CASE_DATA = {
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

function normalizeText(value: string | undefined | null): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

describe('Form 3A legal wording regression', () => {
  it('exposes a canonical ground-id legal wording map for Form 3A question 4.2', async () => {
    const wordingMap = await getEnglandForm3AGroundLegalWordingMap();

    expect(wordingMap.ground_8?.title).toBe('Rent arrears');
    expect(wordingMap.ground_10?.title).toBe('Any rent arrears');
    expect(wordingMap.ground_8?.legalWording).toContain('thirteen weeks’ rent is');
    expect(wordingMap.ground_10?.legalWording).toContain('Some rent lawfully due from the tenant');
  });

  it('builds question 4.2 with full statutory wording for Ground 8 only', async () => {
    const ground8 = await getEnglandGroundLegalWording('8');
    const builtGroundsText = await buildEnglandForm3AGroundsText(['8']);

    expect(builtGroundsText).toBe(`Ground 8 – ${ground8!.title}\n${ground8!.legalWording}`);
    expect(builtGroundsText).toContain('thirteen weeks’ rent is');
    expect(normalizeText(builtGroundsText)).not.toBe('Ground 8 Rent arrears Ground 8');
  });

  it('builds question 4.2 with full statutory wording for Ground 10 only', async () => {
    const ground10 = await getEnglandGroundLegalWording('10');
    const builtGroundsText = await buildEnglandForm3AGroundsText(['Ground 10 - Any rent arrears']);

    expect(builtGroundsText).toBe(`Ground 10 – ${ground10!.title}\n${ground10!.legalWording}`);
    expect(builtGroundsText).toContain('Some rent lawfully due from the tenant');
    expect(normalizeText(builtGroundsText)).not.toBe('Ground 10 Any rent arrears Ground 10');
  });

  it('concatenates Ground 8 and Ground 10 legal wording cleanly', async () => {
    const [ground8, ground10] = await Promise.all([
      getEnglandGroundLegalWording('8'),
      getEnglandGroundLegalWording('10'),
    ]);

    const expectedGroundsText = [
      `Ground 8 – ${ground8!.title}\n${ground8!.legalWording}`,
      `Ground 10 – ${ground10!.title}\n${ground10!.legalWording}`,
    ].join('\n\n');
    const builtGroundsText = await buildEnglandForm3AGroundsText(['8', '10']);

    expect(builtGroundsText).toBe(expectedGroundsText);
    expect(builtGroundsText).toContain('\n\nGround 10 – Any rent arrears');
    expect(builtGroundsText).not.toContain('[object Object]');
    expect(builtGroundsText).not.toMatch(/\b(undefined|null)\b/i);
  });

  it('writes legal wording into question 4.2 and keeps question 4.3 factual', async () => {
    const explanation = 'The tenant owes three months of rent and has not cleared the arrears after reminders.';
    const builtGroundsText = await buildEnglandForm3AGroundsText(['8', '10']);

    const pdfBytes = await fillForm3AForm({
      ...BASE_FORM3A_CASE_DATA,
      ground_codes: ['8', '10'],
      form3a_grounds_text: 'Ground 8 - Rent arrears Ground 8 Ground 10 - Any rent arrears Ground 10',
      form3a_explanation: explanation,
    });

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const groundsText = form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.groundsText).getText();
    const explanationText = form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.explanationText).getText();

    expect(groundsText).toBe(builtGroundsText);
    expect(groundsText).toContain('thirteen weeks’ rent is');
    expect(groundsText).toContain('Some rent lawfully due from the tenant');
    expect(explanationText).toBe(explanation);
    expect(explanationText).not.toContain('Both at the date of the service of the notice');
  });

  it('continues long multi-ground wording onto the Form 3A extra sheet', async () => {
    const pdfBytes = await fillForm3AForm({
      ...BASE_FORM3A_CASE_DATA,
      ground_codes: ['6', '7A', '8', '10'],
      form3a_explanation: 'The facts relied on are set out in the arrears schedule and supporting evidence.',
    });

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const groundsText = form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.groundsText).getText();
    const extraSheetText = form.getTextField(FORM3A_OFFICIAL_FIELD_NAMES.text.extraSheetText).getText();
    const combinedText = `${groundsText}\n${extraSheetText}`;

    expect(groundsText).toContain('Continued on the Form 3A extra sheet.');
    expect(extraSheetText).toContain('Question 4.2 continued');
    expect(combinedText).toContain('Ground 6 – Redevelopment');
    expect(combinedText).toContain('Ground 7A – Severe antisocial or criminal behaviour');
    expect(combinedText).toContain('Ground 10 – Any rent arrears');
    expect(normalizeText(combinedText)).not.toMatch(/\b(undefined|null)\b/i);
  });

  it('rejects generation when a selected ground has no statutory wording mapping', async () => {
    await expect(buildEnglandForm3AGroundsText(['14A'])).rejects.toMatchObject({
      code: 'FORM3A_LEGAL_WORDING_MISSING',
      missingGrounds: ['Ground 14A'],
    } satisfies Partial<EnglandForm3ALegalWordingError>);
  });

  it('extracts the generated PDF text layer with the full question 4.2 statutory wording', async () => {
    const pdfBytes = await fillForm3AForm({
      ...BASE_FORM3A_CASE_DATA,
      ground_codes: ['8', '10'],
      form3a_explanation: 'The tenant is in arrears and the landlord relies on the selected rent arrears grounds.',
    });
    const flattenedDoc = await PDFDocument.load(pdfBytes);
    flattenedDoc.getForm().flatten();
    const flattenedBytes = await flattenedDoc.save();

    const extracted = await extractPdfText(Buffer.from(flattenedBytes), 6);
    const extractedText = normalizeText(extracted.text);

    expect(extractedText).toContain('Rent arrears');
    expect(extractedText).toContain('thirteen weeks');
    expect(extractedText).toContain('Some rent lawfully due from the tenant');
    expect(extractedText).not.toContain('Ground 8 Rent arrears Ground 8 Ground 10');
  });
});
