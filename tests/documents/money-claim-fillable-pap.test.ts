import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';

import {
  makeFinancialStatementFillable,
  makeReplyFormFillable,
} from '@/lib/documents/money-claim-fillable-pap';

async function createRenderedPapPdf() {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText('Claimant: Alice Landlord', { x: 40, y: 790, size: 10, font });
  page.drawText('Reference: MC-001', { x: 40, y: 775, size: 10, font });
  page.drawText('Amount claimed: £3005.00', { x: 40, y: 760, size: 10, font });
  return Buffer.from(await pdf.save());
}

describe('money claim PAP fillable PDFs', () => {
  it('adds editable fields to the Reply Form PDF', async () => {
    const fillable = await makeReplyFormFillable(await createRenderedPapPdf(), {
      landlord_full_name: 'Alice Landlord',
      claimant_reference: 'MC-001',
      total_claim_amount: 3005,
    });

    const pdf = await PDFDocument.load(fillable);
    const fields = pdf.getForm().getFields().map((field) => field.getName());

    expect(fields).toContain('debtor.full_name');
    expect(fields).toContain('response.dispute_explanation');
    expect(fields).toContain('response.payment_offer_amount');
    expect(fields).toContain('signature.date');
  });

  it('adds editable fields to the Financial Statement PDF', async () => {
    const fillable = await makeFinancialStatementFillable(await createRenderedPapPdf(), {
      landlord_full_name: 'Alice Landlord',
      claimant_reference: 'MC-001',
      total_claim_amount: 3005,
    });

    const pdf = await PDFDocument.load(fillable);
    const fields = pdf.getForm().getFields().map((field) => field.getName());

    expect(fields).toContain('income.wages');
    expect(fields).toContain('outgoings.rent_or_mortgage');
    expect(fields).toContain('priority_debts.details');
    expect(fields).toContain('payment_offer.amount');
  });
});
