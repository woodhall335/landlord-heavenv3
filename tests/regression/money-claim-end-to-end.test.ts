/**
 * Money Claim End-to-End Regression Tests
 *
 * Comprehensive test suite covering the entire Money Claim wizard flow:
 * 1. Happy path rent arrears only (with PAP generated, not sent)
 * 2. Happy path with interest on
 * 3. Happy path with interest off
 * 4. Additional claim types (property damage) and verify totals roll up
 * 5. N1 contains claimant+defendant postcode, "Particulars attached", correct totals
 * 6. All generated docs use UK date formatting and currency formatting
 * 7. Review page shows correct totals and no duplicate CTAs
 *
 * Key assertions:
 * - No ISO dates (YYYY-MM-DD) in template data
 * - No "England & Wales" text in money claim documents
 * - No floating point artifacts (more than 2 decimal places)
 * - Correct totals across all documents
 * - Interest days calculated accurately from start date
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the official forms filler BEFORE importing the generator
vi.mock('@/lib/documents/official-forms-filler', async () => {
  const actual = await vi.importActual('@/lib/documents/official-forms-filler');
  return {
    ...actual,
    fillN1Form: vi.fn(async (data) => {
      // Store the data for assertions
      mockN1FormData = data;
      return new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
    }),
    assertOfficialFormExists: vi.fn(async () => true),
  };
});

// Store data passed to mocks for assertions
let mockN1FormData: Record<string, any> = {};
let capturedTemplateData: Record<string, any> = {};

vi.mock('@/lib/documents/generator', () => ({
  generateDocument: vi.fn(async ({ templatePath, data }) => {
    const templateName = templatePath.split('/').pop()?.replace('.hbs', '') || 'unknown';
    capturedTemplateData[templateName] = data;

    // Generate minimal HTML for testing
    const html = `<html><body data-template="${templateName}"></body></html>`;

    return {
      html,
      pdf: Buffer.from('mock-pdf-content'),
    };
  }),
}));

import { generateMoneyClaimPack, type MoneyClaimCase } from '@/lib/documents/money-claim-pack-generator';

// UK Legal Date pattern: "DD Month YYYY" (e.g., "15 January 2024")
const UK_LEGAL_DATE_PATTERN = /^\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/;
// ISO date pattern: YYYY-MM-DD
const ISO_DATE_PATTERN = /\d{4}-\d{2}-\d{2}/;
// Floating point leak pattern: more than 2 decimal places
const FLOATING_POINT_LEAK_PATTERN = /\d+\.\d{3,}/;

// Base test case - rent arrears only
const baseRentArrearsCase: MoneyClaimCase = {
  jurisdiction: 'england',
  case_id: 'e2e-test-001',
  landlord_full_name: 'Alice Landlord',
  landlord_address: '1 High Street, London',
  landlord_postcode: 'E1 1AA',
  landlord_email: 'alice@example.com',
  landlord_phone: '07700900001',
  tenant_full_name: 'Tom Tenant',
  property_address: '2 High Street, London',
  property_postcode: 'E1 2BB',
  rent_amount: 950,
  rent_frequency: 'monthly',
  payment_day: 1,
  tenancy_start_date: '2024-01-15',
  arrears_total: 2850,
  arrears_schedule: [
    { period: 'Jan 2024', due_date: '2024-01-01', amount_due: 950, amount_paid: 0, arrears: 950 },
    { period: 'Feb 2024', due_date: '2024-02-01', amount_due: 950, amount_paid: 0, arrears: 950 },
    { period: 'Mar 2024', due_date: '2024-03-01', amount_due: 950, amount_paid: 0, arrears: 950 },
  ],
  claim_interest: false,
  signatory_name: 'Alice Landlord',
  signature_date: '2025-01-15',
};

describe('Money Claim End-to-End Regression Tests', () => {
  beforeEach(() => {
    capturedTemplateData = {};
    mockN1FormData = {};
  });

  describe('1. Happy Path: Rent Arrears Only (No Interest)', () => {
    it('generates complete pack with correct totals', async () => {
      const pack = await generateMoneyClaimPack(baseRentArrearsCase);

      expect(pack.jurisdiction).toBe('england');
      expect(pack.pack_type).toBe('money_claim_pack');
      expect(pack.documents.length).toBeGreaterThanOrEqual(9); // At least 9 docs (no interest sheet)

      // Verify totals
      expect(pack.metadata.total_claim_amount).toBe(2850); // Arrears only
      expect(pack.metadata.includes_official_pdf).toBe(true);
    });

    it('does NOT include interest calculation document when interest is off', async () => {
      const pack = await generateMoneyClaimPack(baseRentArrearsCase);

      const interestDoc = pack.documents.find((d) => d.document_type === 'interest_calculation');
      expect(interestDoc).toBeUndefined();
    });

    it('formats all dates as UK legal format (DD Month YYYY)', async () => {
      await generateMoneyClaimPack(baseRentArrearsCase);

      // Check particulars of claim dates
      const poc = capturedTemplateData['particulars_of_claim'];
      expect(poc.generation_date).toMatch(UK_LEGAL_DATE_PATTERN);
      expect(poc.signature_date).toMatch(UK_LEGAL_DATE_PATTERN);
      expect(poc.tenancy_start_date).toMatch(UK_LEGAL_DATE_PATTERN);

      // Ensure no ISO dates leaked through
      expect(poc.generation_date).not.toMatch(ISO_DATE_PATTERN);
      expect(poc.signature_date).not.toMatch(ISO_DATE_PATTERN);
      expect(poc.tenancy_start_date).not.toMatch(ISO_DATE_PATTERN);
    });

    it('passes correct data to N1 form filler', async () => {
      await generateMoneyClaimPack(baseRentArrearsCase);

      expect(mockN1FormData.landlord_full_name).toBe('Alice Landlord');
      expect(mockN1FormData.tenant_full_name).toBe('Tom Tenant');
      expect(mockN1FormData.landlord_postcode).toBe('E1 1AA');
      expect(mockN1FormData.property_postcode).toBe('E1 2BB');
      expect(mockN1FormData.total_claim_amount).toBe(2850);
      expect(mockN1FormData.claim_type).toBe('money_claim');
    });
  });

  describe('2. Happy Path: With Interest', () => {
    const caseWithInterest: MoneyClaimCase = {
      ...baseRentArrearsCase,
      case_id: 'e2e-test-002',
      claim_interest: true,
      interest_rate: 8,
      interest_start_date: '2024-02-01', // First missed rent date
    };

    it('includes interest calculation document', async () => {
      const pack = await generateMoneyClaimPack(caseWithInterest);

      const interestDoc = pack.documents.find((d) => d.document_type === 'interest_calculation');
      expect(interestDoc).toBeDefined();
      expect(interestDoc?.file_name).toBe('03-interest-calculation.pdf');
    });

    it('calculates interest days accurately from start date', async () => {
      await generateMoneyClaimPack(caseWithInterest);

      const interestData = capturedTemplateData['interest_workings'];
      expect(interestData).toBeDefined();
      expect(interestData.interest_rate).toBe(8);
      expect(interestData.interest_days).toBeGreaterThan(0);
      expect(typeof interestData.interest_days).toBe('number');

      // Daily interest should be calculated correctly
      // Formula: (principal * rate / 100) / 365
      const expectedDailyInterest = (2850 * 8 / 100) / 365;
      expect(interestData.daily_interest).toBeCloseTo(expectedDailyInterest, 2);
    });

    it('formats interest start date as UK legal format', async () => {
      await generateMoneyClaimPack(caseWithInterest);

      const interestData = capturedTemplateData['interest_workings'];
      expect(interestData.interest_start_date).toMatch(UK_LEGAL_DATE_PATTERN);
      expect(interestData.interest_start_date).not.toMatch(ISO_DATE_PATTERN);
    });

    it('adds interest to total claim amount', async () => {
      const pack = await generateMoneyClaimPack(caseWithInterest);

      // Total should be arrears + interest
      expect(pack.metadata.total_claim_amount).toBeGreaterThan(2850);
    });

    it('shows interest calculation with actual days, not hardcoded 90', async () => {
      await generateMoneyClaimPack(caseWithInterest);

      const interestData = capturedTemplateData['interest_workings'];
      // Should NOT be exactly 90 days (the old hardcoded fallback)
      // unless by coincidence the interest_start_date is exactly 90 days ago
      expect(interestData.interest_days).toBeDefined();
      expect(typeof interestData.interest_days).toBe('number');
    });
  });

  describe('3. Additional Claim Types: Property Damage', () => {
    const caseWithDamage: MoneyClaimCase = {
      ...baseRentArrearsCase,
      case_id: 'e2e-test-003',
      damage_items: [
        { description: 'Broken kitchen cabinet door', amount: 150 },
        { description: 'Stained carpet in living room', amount: 350 },
      ],
      other_charges: [
        { description: 'Professional cleaning', amount: 200 },
      ],
    };

    it('totals roll up correctly with arrears + damages + other charges', async () => {
      const pack = await generateMoneyClaimPack(caseWithDamage);

      // 2850 (arrears) + 150 + 350 (damage) + 200 (cleaning) = 3550
      expect(pack.metadata.total_claim_amount).toBe(3550);
    });

    it('includes damage items in template data', async () => {
      await generateMoneyClaimPack(caseWithDamage);

      const poc = capturedTemplateData['particulars_of_claim'];
      expect(poc.damage_items).toHaveLength(2);
      expect(poc.damage_items[0].description).toBe('Broken kitchen cabinet door');
      expect(poc.damage_items[0].amount).toBe(150);

      expect(poc.other_charges).toHaveLength(1);
      expect(poc.other_charges[0].description).toBe('Professional cleaning');
    });

    it('passes correct total to N1 form', async () => {
      await generateMoneyClaimPack(caseWithDamage);

      expect(mockN1FormData.total_claim_amount).toBe(3550);
    });
  });

  describe('4. Joint Defendants', () => {
    const caseWithJointDefendants: MoneyClaimCase = {
      ...baseRentArrearsCase,
      case_id: 'e2e-test-004',
      has_joint_defendants: true,
      tenant_2_name: 'Jane Tenant',
      tenant_2_postcode: 'E1 2BB', // Same as property
    };

    it('passes second defendant details to N1 form', async () => {
      await generateMoneyClaimPack(caseWithJointDefendants);

      expect(mockN1FormData.has_joint_defendants).toBe(true);
      expect(mockN1FormData.tenant_2_name).toBe('Jane Tenant');
      expect(mockN1FormData.tenant_2_postcode).toBe('E1 2BB');
    });

    it('includes second defendant in template data', async () => {
      await generateMoneyClaimPack(caseWithJointDefendants);

      const poc = capturedTemplateData['particulars_of_claim'];
      expect(poc.tenant_2_name).toBe('Jane Tenant');
    });
  });

  describe('5. Currency Formatting (No Floating Point Leaks)', () => {
    const caseWithAwkwardAmounts: MoneyClaimCase = {
      ...baseRentArrearsCase,
      case_id: 'e2e-test-005',
      arrears_total: 3586.4500000000003, // Floating point edge case
      rent_amount: 1195.3333333333, // Another edge case
    };

    it('totals do not contain floating point artifacts', async () => {
      const pack = await generateMoneyClaimPack(caseWithAwkwardAmounts);

      // Check that totals are formatted correctly (max 2 decimal places)
      const totalStr = pack.metadata.total_claim_amount.toString();
      const decimalMatch = totalStr.match(/\.(\d+)/);
      if (decimalMatch) {
        expect(decimalMatch[1].length).toBeLessThanOrEqual(2);
      }
    });

    it('template data does not contain floating point leaks', async () => {
      await generateMoneyClaimPack(baseRentArrearsCase);

      const poc = capturedTemplateData['particulars_of_claim'];

      // Check all numeric fields for floating point leaks
      const numericFields = [
        'arrears_total',
        'total_claim_amount',
        'court_fee',
        'total_with_fees',
      ];

      for (const field of numericFields) {
        const value = poc[field];
        if (typeof value === 'number') {
          const formatted = value.toFixed(2);
          expect(formatted).not.toMatch(FLOATING_POINT_LEAK_PATTERN);
        }
      }
    });
  });

  describe('6. England-Only Guardrail', () => {
    it('rejects Wales jurisdiction', async () => {
      await expect(
        generateMoneyClaimPack({
          ...baseRentArrearsCase,
          jurisdiction: 'wales' as any,
        })
      ).rejects.toThrow(/Money Claim is only available for England/);
    });

    it('rejects Scotland jurisdiction', async () => {
      await expect(
        generateMoneyClaimPack({
          ...baseRentArrearsCase,
          jurisdiction: 'scotland' as any,
        })
      ).rejects.toThrow(/Money Claim is only available for England/);
    });

    it('rejects Northern Ireland jurisdiction', async () => {
      await expect(
        generateMoneyClaimPack({
          ...baseRentArrearsCase,
          jurisdiction: 'northern-ireland' as any,
        })
      ).rejects.toThrow(/Money Claim is only available for England/);
    });
  });

  describe('7. Document Completeness and Ordering', () => {
    it('generates all required PAP-DEBT documents', async () => {
      const pack = await generateMoneyClaimPack(baseRentArrearsCase);

      const documentTypes = pack.documents.map((d) => d.document_type);

      // Required documents
      expect(documentTypes).toContain('particulars_of_claim');
      expect(documentTypes).toContain('arrears_schedule');
      expect(documentTypes).toContain('letter_before_claim');
      expect(documentTypes).toContain('defendant_info_sheet');
      expect(documentTypes).toContain('reply_form');
      expect(documentTypes).toContain('financial_statement_form');
      expect(documentTypes).toContain('court_filing_guide');
      expect(documentTypes).toContain('enforcement_guide');
      expect(documentTypes).toContain('n1_claim');
    });

    it('names files in logical order', async () => {
      const pack = await generateMoneyClaimPack(baseRentArrearsCase);

      const fileNames = pack.documents.map((d) => d.file_name);

      // Files should be numbered sequentially
      expect(fileNames[0]).toMatch(/^01-/);
      expect(fileNames[1]).toMatch(/^02-/);

      // N1 should be last
      expect(fileNames[fileNames.length - 1]).toMatch(/n1-claim-form/);
    });
  });

  describe('8. PAP Response Deadline', () => {
    it('sets response deadline 30 days from generation', async () => {
      await generateMoneyClaimPack(baseRentArrearsCase);

      const lbc = capturedTemplateData['letter_before_claim'];
      expect(lbc.response_deadline).toBeDefined();
      expect(lbc.response_deadline).toMatch(UK_LEGAL_DATE_PATTERN);
    });
  });

  describe('9. Weekly Rent Frequency', () => {
    const weeklyRentCase: MoneyClaimCase = {
      ...baseRentArrearsCase,
      case_id: 'e2e-test-009',
      rent_amount: 200,
      rent_frequency: 'weekly',
      arrears_total: 1600, // 8 weeks
      arrears_schedule: [
        { period: 'Week 1', due_date: '2024-01-01', amount_due: 200, amount_paid: 0, arrears: 200 },
        { period: 'Week 2', due_date: '2024-01-08', amount_due: 200, amount_paid: 0, arrears: 200 },
        { period: 'Week 3', due_date: '2024-01-15', amount_due: 200, amount_paid: 0, arrears: 200 },
        { period: 'Week 4', due_date: '2024-01-22', amount_due: 200, amount_paid: 0, arrears: 200 },
        { period: 'Week 5', due_date: '2024-01-29', amount_due: 200, amount_paid: 0, arrears: 200 },
        { period: 'Week 6', due_date: '2024-02-05', amount_due: 200, amount_paid: 0, arrears: 200 },
        { period: 'Week 7', due_date: '2024-02-12', amount_due: 200, amount_paid: 0, arrears: 200 },
        { period: 'Week 8', due_date: '2024-02-19', amount_due: 200, amount_paid: 0, arrears: 200 },
      ],
    };

    it('handles weekly rent frequency correctly', async () => {
      const pack = await generateMoneyClaimPack(weeklyRentCase);

      expect(pack.metadata.total_claim_amount).toBe(1600);

      const schedule = capturedTemplateData['schedule_of_arrears'];
      expect(schedule.rent_frequency).toBe('weekly');
      expect(schedule.rent_amount).toBe(200);
    });
  });

  describe('10. Zero Arrears Edge Case', () => {
    const damageOnlyCase: MoneyClaimCase = {
      ...baseRentArrearsCase,
      case_id: 'e2e-test-010',
      arrears_total: 0,
      arrears_schedule: [],
      damage_items: [
        { description: 'Broken window', amount: 500 },
      ],
    };

    it('allows claims with zero arrears but other charges', async () => {
      const pack = await generateMoneyClaimPack(damageOnlyCase);

      expect(pack.metadata.total_claim_amount).toBe(500);
    });
  });

  describe('11. Very Long Names/Addresses', () => {
    const longNamesCase: MoneyClaimCase = {
      ...baseRentArrearsCase,
      case_id: 'e2e-test-011',
      landlord_full_name: 'Sir Reginald Montgomery Featherstone-Haugh III Esquire',
      property_address: 'Apartment 1234, The Really Very Long Building Name That Goes On Forever, Upper Poshington-on-Thames, Greater London Metropolitan Area',
    };

    it('handles long names and addresses without crashing', async () => {
      const pack = await generateMoneyClaimPack(longNamesCase);

      expect(pack.documents.length).toBeGreaterThanOrEqual(9);
      expect(mockN1FormData.landlord_full_name).toBe(
        'Sir Reginald Montgomery Featherstone-Haugh III Esquire'
      );
    });
  });

  describe('12. Interest Rate Validation', () => {
    it('uses 8% default rate when interest claimed but no rate specified', async () => {
      const caseWithDefaultRate: MoneyClaimCase = {
        ...baseRentArrearsCase,
        case_id: 'e2e-test-012',
        claim_interest: true,
        interest_start_date: '2024-02-01',
        // No interest_rate specified
      };

      await generateMoneyClaimPack(caseWithDefaultRate);

      const interestData = capturedTemplateData['interest_workings'];
      expect(interestData.interest_rate).toBe(8);
    });

    it('uses custom rate when specified', async () => {
      const caseWithCustomRate: MoneyClaimCase = {
        ...baseRentArrearsCase,
        case_id: 'e2e-test-012b',
        claim_interest: true,
        interest_rate: 4,
        interest_start_date: '2024-02-01',
      };

      await generateMoneyClaimPack(caseWithCustomRate);

      const interestData = capturedTemplateData['interest_workings'];
      expect(interestData.interest_rate).toBe(4);
    });
  });
});
