import { describe, expect, it, vi } from 'vitest';
import { generateMoneyClaimPack } from '@/lib/documents/money-claim-pack-generator';
import * as forms from '@/lib/documents/official-forms-filler';

// Mock the PDF filler to avoid pdf-lib issues in vitest
vi.mock('@/lib/documents/official-forms-filler', async () => {
  const actual = await vi.importActual('@/lib/documents/official-forms-filler');
  return {
    ...actual,
    fillN1Form: vi.fn(async () => {
      // Return a minimal valid PDF structure
      return new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
    }),
    assertOfficialFormExists: vi.fn(async () => {
      // Mock successful assertion
      return true;
    }),
  };
});

// Mock the document generator to avoid Puppeteer issues in vitest
vi.mock('@/lib/documents/generator', () => ({
  generateDocument: vi.fn(async ({ templatePath, data }) => {
    // Return mock HTML and PDF based on template path
    const templateName = templatePath.split('/').pop()?.replace('.hbs', '') || 'unknown';
    const html = `<h1>${templateName}</h1><p>Mock document for ${data.landlord_full_name || 'test'}</p>`;
    return {
      html,
      pdf: Buffer.from('mock-pdf-content'),
    };
  }),
}));

const sampleCase = {
  jurisdiction: 'england-wales' as const,
  case_id: 'case-money-1',
  landlord_full_name: 'Alice Landlord',
  landlord_address: '1 High Street\nLondon',
  landlord_postcode: 'E1 1AA',
  landlord_email: 'alice@example.com',
  tenant_full_name: 'Tom Tenant',
  property_address: '2 High Street\nLondon',
  property_postcode: 'E1 2BB',
  rent_amount: 950,
  rent_frequency: 'monthly' as const,
  payment_day: 1,
  tenancy_start_date: '2024-01-01',
  arrears_schedule: [
    { period: 'Jan 2024', due_date: '2024-01-01', amount_due: 950, amount_paid: 0, arrears: 950 },
    { period: 'Feb 2024', due_date: '2024-02-01', amount_due: 950, amount_paid: 450, arrears: 500 },
  ],
  damage_items: [{ description: 'Broken door', amount: 200 }],
  other_charges: [{ description: 'Locksmith call-out', amount: 80 }],
  interest_start_date: '2024-01-01',
  particulars_of_claim: 'Rent arrears and damage to the property.',
  signatory_name: 'Alice Landlord',
  signature_date: '2025-01-15',
};

describe('Money claim pack generator', () => {
  it('builds the full pack with official N1 PDF', async () => {
    const pack = await generateMoneyClaimPack(sampleCase);

    expect(pack.documents.length).toBeGreaterThanOrEqual(5);
    expect(pack.documents.some((doc) => doc.file_name === 'n1-claim-form.pdf')).toBe(true);
    expect(pack.metadata.includes_official_pdf).toBe(true);
    expect(pack.metadata.total_with_fees).toBeGreaterThan(0);
  });

  it('guards missing N1 PDF with a helpful error', async () => {
    const guardSpy = vi
      .spyOn(forms, 'assertOfficialFormExists')
      .mockRejectedValueOnce(new Error('missing N1'));

    await expect(generateMoneyClaimPack(sampleCase)).rejects.toThrow('N1');
    guardSpy.mockRestore();
  });

  it('rejects unsupported jurisdictions', async () => {
    await expect(
      generateMoneyClaimPack({
        ...sampleCase,
        jurisdiction: 'scotland' as any,
      }),
    ).rejects.toThrow('England & Wales');
  });
});
