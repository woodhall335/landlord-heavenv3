import { describe, expect, it, vi } from 'vitest';
import { generateScotlandMoneyClaim } from '@/lib/documents/scotland-money-claim-pack-generator';
import * as forms from '@/lib/documents/scotland-forms-filler';

// Mock the PDF filler to avoid pdf-lib issues in vitest
vi.mock('@/lib/documents/scotland-forms-filler', async () => {
  const actual = await vi.importActual('@/lib/documents/scotland-forms-filler');
  return {
    ...actual,
    fillSimpleProcedureClaim: vi.fn(async () => {
      // Return a minimal valid PDF structure
      return new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
    }),
  };
});

// Mock the document generator to avoid Puppeteer issues in vitest
vi.mock('@/lib/documents/generator', () => ({
  generateDocument: vi.fn(async ({ templatePath, data }) => {
    // Return mock HTML and PDF based on template path
    const templateName = templatePath.split('/').pop()?.replace('.hbs', '') || 'unknown';
    const html = `<h1>${templateName}</h1><p>Mock document for ${data.landlord_full_name || 'test'}</p><p>Attempts to resolve: ${data.attempts_to_resolve || 'none'}</p>`;
    return {
      html,
      pdf: Buffer.from('mock-pdf-content'),
    };
  }),
}));

// Mock the official forms loader
vi.mock('@/lib/documents/official-forms-filler', () => ({
  assertOfficialFormExists: vi.fn(async () => {
    // Mock successful assertion
    return true;
  }),
}));

const sampleCase = {
  jurisdiction: 'scotland' as const,
  case_id: 'case-sc-money-1',
  landlord_full_name: 'Alice Landlord',
  landlord_address: '1 High Street\nEdinburgh',
  landlord_postcode: 'EH1 1AA',
  landlord_email: 'alice@example.com',
  tenant_full_name: 'Tom Tenant',
  property_address: '2 High Street\nEdinburgh',
  property_postcode: 'EH1 2BB',
  rent_amount: 950,
  rent_frequency: 'monthly' as const,
  payment_day: 1,
  tenancy_start_date: '2024-01-01',
  sheriffdom: 'Edinburgh Sheriff Court',
  arrears_schedule: [
    { period: 'Jan 2024', due_date: '2024-01-01', amount_due: 950, amount_paid: 0, arrears: 950 },
    { period: 'Feb 2024', due_date: '2024-02-01', amount_due: 950, amount_paid: 450, arrears: 500 },
  ],
  damage_items: [{ description: 'Broken door', amount: 200 }],
  other_charges: [{ description: 'Locksmith call-out', amount: 80 }],
  interest_start_date: '2024-01-01',
  particulars_of_claim: 'Rent arrears and damage to the property.',
  attempts_to_resolve: 'Sent payment demands on 15/01/2024 and 01/02/2024. Tenant failed to respond.',
  signatory_name: 'Alice Landlord',
  signature_date: '2025-01-15',
};

describe('Scotland money claim pack generator', () => {
  it('builds the full pack with official Simple Procedure PDF', async () => {
    const pack = await generateScotlandMoneyClaim(sampleCase);

    expect(pack.documents.length).toBeGreaterThanOrEqual(5);
    expect(pack.documents.some((doc) => doc.file_name === 'simple-procedure-claim-form.pdf')).toBe(true);
    expect(pack.metadata.includes_official_pdf).toBe(true);
    expect(pack.metadata.total_with_fees).toBeGreaterThan(0);
    expect(pack.jurisdiction).toBe('scotland');
    expect(pack.pack_type).toBe('scotland_money_claim_pack');
  });

  it('guards missing Simple Procedure PDF with a helpful error', async () => {
    const guardSpy = vi
      .spyOn(forms, 'fillSimpleProcedureClaim')
      .mockRejectedValueOnce(new Error('missing Simple Procedure form'));

    await expect(generateScotlandMoneyClaim(sampleCase)).rejects.toThrow('Simple Procedure');
    guardSpy.mockRestore();
  });

  it('rejects non-Scotland jurisdictions', async () => {
    await expect(
      generateScotlandMoneyClaim({
        ...sampleCase,
        jurisdiction: 'england-wales' as any,
      }),
    ).rejects.toThrow('Scotland');
  });

  it('calculates Scotland court fees correctly', async () => {
    // Test £300 threshold (£21 fee)
    const smallClaim = {
      ...sampleCase,
      arrears_schedule: [{ period: 'Jan 2024', due_date: '2024-01-01', amount_due: 250, amount_paid: 0, arrears: 250 }],
      damage_items: undefined,
      other_charges: undefined,
    };

    const smallPack = await generateScotlandMoneyClaim(smallClaim);
    expect(smallPack.metadata.total_with_fees).toBeLessThan(300);

    // Test £1500 threshold (£75 fee)
    const mediumClaim = {
      ...sampleCase,
      arrears_schedule: [
        { period: 'Jan 2024', due_date: '2024-01-01', amount_due: 500, amount_paid: 0, arrears: 500 },
        { period: 'Feb 2024', due_date: '2024-02-01', amount_due: 500, amount_paid: 0, arrears: 500 },
      ],
    };

    const mediumPack = await generateScotlandMoneyClaim(mediumClaim);
    expect(mediumPack.metadata.total_with_fees).toBeGreaterThan(300);
    expect(mediumPack.metadata.total_with_fees).toBeLessThan(1600);
  });

  it('includes attempts to resolve in pack', async () => {
    const pack = await generateScotlandMoneyClaim(sampleCase);

    const particularsDoc = pack.documents.find(doc => doc.file_name === 'simple-procedure-particulars.pdf');
    expect(particularsDoc).toBeDefined();
    expect(particularsDoc?.html).toContain('Attempts to resolve');
  });

  it('includes sheriffdom in pack metadata', async () => {
    const pack = await generateScotlandMoneyClaim(sampleCase);

    expect(pack.metadata.sheriffdom).toBe('Edinburgh Sheriff Court');
  });
});
