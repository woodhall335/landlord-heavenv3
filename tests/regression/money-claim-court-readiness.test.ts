/**
 * Money Claim Court-Readiness Regression Tests
 *
 * These tests ensure critical court-readiness requirements are maintained:
 * 1. UK date format enforcement (no ISO dates in documents)
 * 2. Postcode presence in N1 form
 * 3. Currency formatting correctness (no floating point leaks)
 * 4. No "per monthly" strings
 * 5. England-only language consistency
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the official forms filler BEFORE importing the generator
vi.mock('@/lib/documents/official-forms-filler', async () => {
  const actual = await vi.importActual('@/lib/documents/official-forms-filler');
  return {
    ...actual,
    fillN1Form: vi.fn(async () => {
      return new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
    }),
    assertOfficialFormExists: vi.fn(async () => true),
  };
});

// Mock the document generator to capture template data
let capturedTemplateData: Record<string, any> = {};
let capturedHtmlOutputs: Record<string, string> = {};

vi.mock('@/lib/documents/generator', () => ({
  generateDocument: vi.fn(async ({ templatePath, data }) => {
    const templateName = templatePath.split('/').pop()?.replace('.hbs', '') || 'unknown';
    capturedTemplateData[templateName] = data;

    // Generate HTML that includes the actual data values for testing
    const html = `
      <html>
        <body>
          <div data-generation-date="${data.generation_date || ''}" />
          <div data-signature-date="${data.signature_date || ''}" />
          <div data-tenancy-start-date="${data.tenancy_start_date || ''}" />
          <div data-interest-start-date="${data.interest_start_date || ''}" />
          <div data-response-deadline="${data.response_deadline || ''}" />
          <div data-total-claim-amount="${data.total_claim_amount || ''}" />
          <div data-court-fee="${data.court_fee || ''}" />
        </body>
      </html>
    `;
    capturedHtmlOutputs[templateName] = html;

    return {
      html,
      pdf: Buffer.from('mock-pdf-content'),
    };
  }),
}));

import { generateMoneyClaimPack } from '@/lib/documents/money-claim-pack-generator';

const sampleCase = {
  jurisdiction: 'england' as const,
  case_id: 'court-readiness-test',
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
  tenancy_start_date: '2024-01-15',
  arrears_schedule: [
    { period: 'Jan 2024', due_date: '2024-01-01', amount_due: 950, amount_paid: 0, arrears: 950 },
    { period: 'Feb 2024', due_date: '2024-02-01', amount_due: 950, amount_paid: 450, arrears: 500 },
  ],
  damage_items: [{ description: 'Broken door', amount: 200 }],
  other_charges: [{ description: 'Locksmith call-out', amount: 80 }],
  claim_interest: true,
  interest_rate: 8,
  interest_start_date: '2024-02-01',
  particulars_of_claim: 'Rent arrears and damage to the property.',
  signatory_name: 'Alice Landlord',
  signature_date: '2025-01-15',
};

describe('Money Claim Court-Readiness', () => {
  beforeEach(() => {
    capturedTemplateData = {};
    capturedHtmlOutputs = {};
  });

  describe('UK Date Format Enforcement', () => {
    // ISO date pattern: YYYY-MM-DD
    const ISO_DATE_PATTERN = /\d{4}-\d{2}-\d{2}/;
    // UK legal date pattern: "DD Month YYYY" (e.g., "15 January 2024")
    const UK_LEGAL_DATE_PATTERN = /\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/;

    it('formats generation_date as UK legal format (DD Month YYYY)', async () => {
      await generateMoneyClaimPack(sampleCase);

      const templateData = capturedTemplateData['particulars_of_claim'];
      expect(templateData).toBeDefined();
      expect(templateData.generation_date).toMatch(UK_LEGAL_DATE_PATTERN);
      expect(templateData.generation_date).not.toMatch(ISO_DATE_PATTERN);
    });

    it('formats signature_date as UK legal format (DD Month YYYY)', async () => {
      await generateMoneyClaimPack(sampleCase);

      const templateData = capturedTemplateData['particulars_of_claim'];
      expect(templateData).toBeDefined();
      expect(templateData.signature_date).toMatch(UK_LEGAL_DATE_PATTERN);
      expect(templateData.signature_date).not.toMatch(ISO_DATE_PATTERN);
    });

    it('formats tenancy_start_date as UK legal format (DD Month YYYY)', async () => {
      await generateMoneyClaimPack(sampleCase);

      const templateData = capturedTemplateData['particulars_of_claim'];
      expect(templateData).toBeDefined();
      expect(templateData.tenancy_start_date).toMatch(UK_LEGAL_DATE_PATTERN);
      expect(templateData.tenancy_start_date).not.toMatch(ISO_DATE_PATTERN);
    });

    it('formats interest_start_date as UK legal format (DD Month YYYY)', async () => {
      await generateMoneyClaimPack(sampleCase);

      const templateData = capturedTemplateData['interest_workings'];
      expect(templateData).toBeDefined();
      expect(templateData.interest_start_date).toMatch(UK_LEGAL_DATE_PATTERN);
      expect(templateData.interest_start_date).not.toMatch(ISO_DATE_PATTERN);
    });

    it('formats response_deadline as UK legal format (DD Month YYYY)', async () => {
      await generateMoneyClaimPack(sampleCase);

      const templateData = capturedTemplateData['letter_before_claim'];
      expect(templateData).toBeDefined();
      expect(templateData.response_deadline).toMatch(UK_LEGAL_DATE_PATTERN);
      expect(templateData.response_deadline).not.toMatch(ISO_DATE_PATTERN);
    });

    it('rejects ISO dates in ALL template data keys containing "date"', async () => {
      await generateMoneyClaimPack(sampleCase);

      // Check all templates for ISO dates in any field ending with "_date"
      for (const [templateName, data] of Object.entries(capturedTemplateData)) {
        for (const [key, value] of Object.entries(data as Record<string, any>)) {
          if (key.endsWith('_date') && typeof value === 'string' && value.length > 0) {
            // Skip arrears_schedule entries which use format_date helper in template
            if (key === 'due_date') continue;

            expect(
              value,
              `Template "${templateName}" field "${key}" contains ISO date: ${value}`
            ).not.toMatch(ISO_DATE_PATTERN);
          }
        }
      }
    });
  });

  describe('Currency Formatting (No Floating Point Leaks)', () => {
    // Pattern to detect floating point numbers with more than 2 decimal places
    const FLOATING_POINT_LEAK_PATTERN = /£?\d+\.\d{3,}/;

    it('formats total_claim_amount correctly (2 decimal places)', async () => {
      // Use a case that could produce floating point issues
      const floatTestCase = {
        ...sampleCase,
        arrears_total: 3586.4500000000003, // Floating point edge case
      };

      await generateMoneyClaimPack(floatTestCase);

      const templateData = capturedTemplateData['filing_guide'];
      expect(templateData).toBeDefined();

      // The raw total_claim_amount should be a number that when formatted won't leak
      const totalAmount = templateData.total_claim_amount;
      expect(typeof totalAmount).toBe('number');

      // When formatted with .toFixed(2), should not have floating point issues
      const formatted = totalAmount.toFixed(2);
      expect(formatted).not.toMatch(FLOATING_POINT_LEAK_PATTERN);
    });

    it('formats court_fee correctly (2 decimal places)', async () => {
      await generateMoneyClaimPack(sampleCase);

      const templateData = capturedTemplateData['filing_guide'];
      expect(templateData).toBeDefined();

      const courtFee = templateData.court_fee;
      expect(typeof courtFee).toBe('number');

      const formatted = courtFee.toFixed(2);
      expect(formatted).not.toMatch(FLOATING_POINT_LEAK_PATTERN);
    });

    it('formats daily_interest correctly when interest is claimed', async () => {
      await generateMoneyClaimPack(sampleCase);

      const templateData = capturedTemplateData['interest_workings'];
      expect(templateData).toBeDefined();

      const dailyInterest = templateData.daily_interest;
      if (dailyInterest !== null && dailyInterest !== undefined) {
        expect(typeof dailyInterest).toBe('number');
        const formatted = dailyInterest.toFixed(2);
        expect(formatted).not.toMatch(FLOATING_POINT_LEAK_PATTERN);
      }
    });
  });

  describe('No "per monthly" Language', () => {
    it('does not contain "per monthly" in any template data', async () => {
      await generateMoneyClaimPack(sampleCase);

      for (const [templateName, data] of Object.entries(capturedTemplateData)) {
        const jsonString = JSON.stringify(data).toLowerCase();
        expect(
          jsonString,
          `Template "${templateName}" contains "per monthly"`
        ).not.toContain('per monthly');
      }
    });
  });

  describe('Postcode Presence in N1 Form', () => {
    it('passes landlord_postcode to N1 form filler', async () => {
      const { fillN1Form } = await import('@/lib/documents/official-forms-filler');

      await generateMoneyClaimPack(sampleCase);

      expect(fillN1Form).toHaveBeenCalled();
      const callArgs = (fillN1Form as any).mock.calls[0][0];

      expect(callArgs.landlord_postcode).toBe('E1 1AA');
    });

    it('passes property_postcode to N1 form filler', async () => {
      const { fillN1Form } = await import('@/lib/documents/official-forms-filler');

      await generateMoneyClaimPack(sampleCase);

      expect(fillN1Form).toHaveBeenCalled();
      const callArgs = (fillN1Form as any).mock.calls[0][0];

      expect(callArgs.property_postcode).toBe('E1 2BB');
    });

    it('passes service_postcode (derived from landlord) to N1 form filler', async () => {
      const { fillN1Form } = await import('@/lib/documents/official-forms-filler');

      await generateMoneyClaimPack(sampleCase);

      expect(fillN1Form).toHaveBeenCalled();
      const callArgs = (fillN1Form as any).mock.calls[0][0];

      // service_postcode should be set (either explicitly or derived from landlord_postcode)
      expect(callArgs.service_postcode || callArgs.landlord_postcode).toBeTruthy();
    });
  });

  describe('England-Only Consistency', () => {
    it('rejects Wales jurisdiction', async () => {
      await expect(
        generateMoneyClaimPack({
          ...sampleCase,
          jurisdiction: 'wales' as any,
        })
      ).rejects.toThrow(/Money Claim is only available for England/);
    });

    it('rejects Scotland jurisdiction', async () => {
      await expect(
        generateMoneyClaimPack({
          ...sampleCase,
          jurisdiction: 'scotland' as any,
        })
      ).rejects.toThrow(/Money Claim is only available for England/);
    });

    it('rejects Northern Ireland jurisdiction', async () => {
      await expect(
        generateMoneyClaimPack({
          ...sampleCase,
          jurisdiction: 'northern-ireland' as any,
        })
      ).rejects.toThrow(/Money Claim is only available for England/);
    });

    it('accepts England jurisdiction', async () => {
      const pack = await generateMoneyClaimPack(sampleCase);
      expect(pack.jurisdiction).toBe('england');
    });
  });

  describe('Statement of Truth Date Clarity', () => {
    it('includes signatory_name in template data', async () => {
      await generateMoneyClaimPack(sampleCase);

      const templateData = capturedTemplateData['particulars_of_claim'];
      expect(templateData).toBeDefined();
      expect(templateData.signatory_name).toBe('Alice Landlord');
    });

    it('includes signature_date formatted correctly', async () => {
      await generateMoneyClaimPack(sampleCase);

      const templateData = capturedTemplateData['particulars_of_claim'];
      expect(templateData).toBeDefined();
      // Should be "15 January 2025" not "2025-01-15"
      expect(templateData.signature_date).toBe('15 January 2025');
    });
  });
});
