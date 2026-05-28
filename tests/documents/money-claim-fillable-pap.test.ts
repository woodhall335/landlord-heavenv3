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

  it('does not ask again for tenant details already collected in the wizard', async () => {
    const templateData = {
      landlord_full_name: 'Alice Landlord',
      claimant_reference: 'MC-001',
      tenant_full_name: 'Sam Tenant',
      property_address: '1 Rental Street',
      property_postcode: 'LS1 1AA',
      total_claim_amount: 3005,
    };

    const replyForm = await makeReplyFormFillable(await createRenderedPapPdf(), templateData);
    const financialStatement = await makeFinancialStatementFillable(
      await createRenderedPapPdf(),
      templateData
    );

    const replyFields = (await PDFDocument.load(replyForm)).getForm().getFields().map((field) => field.getName());
    const statementFields = (await PDFDocument.load(financialStatement)).getForm().getFields().map((field) => field.getName());

    expect(replyFields).not.toContain('debtor.full_name');
    expect(replyFields).not.toContain('debtor.address');
    expect(replyFields).not.toContain('debtor.postcode');
    expect(statementFields).not.toContain('debtor.full_name');
    expect(statementFields).not.toContain('debtor.address');
    expect(statementFields).not.toContain('debtor.postcode');
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
    expect(fields).not.toContain('outgoings.mortgage');
    expect(fields).not.toContain('assets.property_owned_outright');
    expect(fields).not.toContain('assets.property_mortgaged');
    expect(fields).not.toContain('assets.property_mortgage_outstanding');
    expect(fields).not.toContain('assets.property_value');
    expect(fields).toContain('priority_debts.details');
    expect(fields).toContain('payment_offer.amount');
  });
});
