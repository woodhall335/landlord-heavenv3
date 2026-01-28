import { describe, expect, it, vi } from 'vitest';

// Mock the official forms filler BEFORE importing the generator
vi.mock('@/lib/documents/official-forms-filler', () => ({
  assertOfficialFormExists: vi.fn().mockResolvedValue(undefined),
  fillN1Form: vi.fn().mockResolvedValue(Buffer.from('PDF_CONTENT')),
}));

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
    const html = `<h1>${templateName}</h1><p>Mock document for ${
      data.landlord_full_name || 'test'
    }</p>`;
    return {
      html,
      pdf: Buffer.from('mock-pdf-content'),
    };
  }),
}));

const sampleCase = {
  jurisdiction: 'england' as const,
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
  it(
    'builds the full pack with official N1 PDF',
    async () => {
      const pack = await generateMoneyClaimPack(sampleCase);

      expect(pack.documents.length).toBeGreaterThanOrEqual(5);
      expect(pack.documents.some((doc) => doc.file_name === '10-n1-claim-form.pdf')).toBe(true);
      expect(pack.metadata.includes_official_pdf).toBe(true);
      expect(pack.metadata.total_with_fees).toBeGreaterThan(0);
    },
    20000, // allow up to 20s for full pack generation
  );

  it(
    'guards missing N1 PDF with a helpful error',
    async () => {
      // Cast to any rather than vi.Mock to avoid namespace/type issues
      (forms.assertOfficialFormExists as any).mockRejectedValueOnce(
        new Error('missing N1'),
      );

      await expect(generateMoneyClaimPack(sampleCase)).rejects.toThrow('missing N1');
    },
    20000, // allow up to 20s for error path too
  );

  it('rejects unsupported jurisdictions', async () => {
    await expect(
      generateMoneyClaimPack({
        ...sampleCase,
        jurisdiction: 'scotland' as any,
      }),
    ).rejects.toThrow('England & Wales');
  });

  describe('pre-generation validation', () => {
    it('fails loudly when landlord name is missing', async () => {
      const invalidCase = {
        ...sampleCase,
        landlord_full_name: '',
      };

      await expect(generateMoneyClaimPack(invalidCase)).rejects.toThrow(
        /Money claim data validation failed/
      );
    });

    it('fails loudly when tenant name is missing', async () => {
      const invalidCase = {
        ...sampleCase,
        tenant_full_name: '',
      };

      await expect(generateMoneyClaimPack(invalidCase)).rejects.toThrow(
        /Money claim data validation failed/
      );
    });

    it('fails loudly when no claim amount exists', async () => {
      const invalidCase = {
        ...sampleCase,
        arrears_total: 0,
        arrears_schedule: [],
        damage_items: [],
        other_charges: [],
      };

      await expect(generateMoneyClaimPack(invalidCase)).rejects.toThrow(
        /Money claim data validation failed/
      );
    });

    it('error message includes human-readable field labels', async () => {
      const invalidCase = {
        ...sampleCase,
        landlord_full_name: '',
        property_address: '',
      };

      try {
        await generateMoneyClaimPack(invalidCase);
        expect.fail('Should have thrown');
      } catch (err: any) {
        expect(err.message).toContain('Claimant');
        expect(err.message).toContain('Property address');
      }
    });
  });

  describe('conditional interest document generation', () => {
    it('excludes interest calculation document when claim_interest is undefined', async () => {
      const caseWithoutInterest = {
        ...sampleCase,
        claim_interest: undefined,
      };

      const pack = await generateMoneyClaimPack(caseWithoutInterest);

      const interestDoc = pack.documents.find(
        (doc) => doc.title === 'Interest calculation' || doc.file_name === '03-interest-calculation.pdf'
      );
      expect(interestDoc).toBeUndefined();
    });

    it('excludes interest calculation document when claim_interest is false', async () => {
      const caseWithInterestFalse = {
        ...sampleCase,
        claim_interest: false,
      };

      const pack = await generateMoneyClaimPack(caseWithInterestFalse);

      const interestDoc = pack.documents.find(
        (doc) => doc.title === 'Interest calculation' || doc.file_name === '03-interest-calculation.pdf'
      );
      expect(interestDoc).toBeUndefined();
    });

    it('includes interest calculation document when claim_interest is true', async () => {
      const caseWithInterest = {
        ...sampleCase,
        claim_interest: true,
        interest_rate: 8,
      };

      const pack = await generateMoneyClaimPack(caseWithInterest);

      const interestDoc = pack.documents.find(
        (doc) => doc.title === 'Interest calculation' || doc.file_name === '03-interest-calculation.pdf'
      );
      expect(interestDoc).toBeDefined();
      expect(interestDoc?.category).toBe('guidance');
      expect(interestDoc?.description).toContain('Section 69');
    });
  });
});
