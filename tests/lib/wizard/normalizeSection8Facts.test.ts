/**
 * Tests for Section 8 Facts Normalization
 *
 * Regression tests for the bug where notice_only + section_8 + ground_8 cases
 * fail document generation because:
 * 1. arrears_total is not set (stored under issues.rent_arrears.total_arrears)
 * 2. ground_particulars.ground_8.summary is not set (stored as section8_details)
 *
 * The normalizeSection8Facts function backfills these fields before validation.
 */

import {
  normalizeSection8Facts,
  validateSection8FactsPresent,
} from '@/lib/wizard/normalizeSection8Facts';

describe('normalizeSection8Facts', () => {
  describe('arrears_total backfill', () => {
    it('should backfill arrears_total from issues.rent_arrears.total_arrears', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 8 - Serious rent arrears'],
        issues: {
          rent_arrears: {
            total_arrears: 3600,
          },
        },
      };

      normalizeSection8Facts(facts);

      expect(facts.arrears_total).toBe(3600);
    });

    it('should backfill arrears_total from total_arrears', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8'],
        total_arrears: 2400,
      };

      normalizeSection8Facts(facts);

      expect(facts.arrears_total).toBe(2400);
    });

    it('should backfill arrears_total from arrears_amount', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 8'],
        arrears_amount: 1800,
      };

      normalizeSection8Facts(facts);

      // arrears_total should be set from arrears_amount
      expect(facts.arrears_total).toBe(1800);
    });

    it('should NOT overwrite existing arrears_total', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8'],
        arrears_total: 5000,
        issues: {
          rent_arrears: {
            total_arrears: 3600,
          },
        },
      };

      normalizeSection8Facts(facts);

      // Should keep the original value
      expect(facts.arrears_total).toBe(5000);
    });

    it('should handle currency-formatted strings', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8'],
        total_arrears: '£3,600.00',
      };

      normalizeSection8Facts(facts);

      expect(facts.arrears_total).toBe(3600);
    });

    it('should NOT backfill arrears for non-arrears grounds', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_14'], // Nuisance, not arrears
        total_arrears: 1000,
      };

      normalizeSection8Facts(facts);

      // arrears_total should not be set for non-arrears grounds
      expect(facts.arrears_total).toBeUndefined();
    });

    it('should compute arrears_total from arrears_items when no total is available', () => {
      // This is the critical case that caused the Stripe webhook 500 error
      // arrears_items exist but arrears_total is not set
      const facts: Record<string, any> = {
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 8 - Serious rent arrears'],
        arrears_items: [
          { period_start: '2024-01-01', arrears_amount: 1200 },
          { period_start: '2024-02-01', arrears_amount: 1200 },
          { period_start: '2024-03-01', arrears_amount: 1200 },
        ],
        // NOTE: arrears_total is NOT set - this caused NOTICE_ONLY_VALIDATION_FAILED
      };

      normalizeSection8Facts(facts);

      // Should compute arrears_total from arrears_items
      expect(facts.arrears_total).toBe(3600);
      expect(facts.arrears_amount).toBe(3600);
    });

    it('should compute arrears_total from nested issues.rent_arrears.arrears_items', () => {
      const facts: Record<string, any> = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8'],
        issues: {
          rent_arrears: {
            arrears_items: [
              { period_start: '2024-01-01', amount_owed: 1500 },
              { period_start: '2024-02-01', amount_owed: 1500 },
            ],
            // total_arrears is NOT set
          },
        },
      };

      normalizeSection8Facts(facts);

      // Should compute from nested arrears_items
      expect(facts.arrears_total).toBe(3000);
    });

    it('should handle arrears_items with different field names for amounts', () => {
      const facts: Record<string, any> = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8'],
        arrears_items: [
          { period: 'Jan', balance: 1000 },
          { period: 'Feb', amount_due: 1000 },
          { period: 'Mar', amount: 1000 },
        ],
      };

      normalizeSection8Facts(facts);

      expect(facts.arrears_total).toBe(3000);
    });

    it('should handle string amounts with currency formatting', () => {
      const facts: Record<string, any> = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8'],
        arrears_items: [
          { period: 'Jan', arrears_amount: '£1,200.00' },
          { period: 'Feb', arrears_amount: '£1,200.00' },
        ],
      };

      normalizeSection8Facts(facts);

      expect(facts.arrears_total).toBe(2400);
    });
  });

  describe('ground_particulars backfill', () => {
    it('should backfill ground_particulars.ground_8.summary from section8_details', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 8 - Serious rent arrears'],
        section8_details: 'Tenant owes £3,600 in rent arrears from January to March 2024.',
      };

      normalizeSection8Facts(facts);

      expect(facts.ground_particulars).toBeDefined();
      expect(facts.ground_particulars.ground_8).toBeDefined();
      expect(facts.ground_particulars.ground_8.summary).toBe(
        'Tenant owes £3,600 in rent arrears from January to March 2024.'
      );
    });

    it('should generate summary from arrears data when section8_details is missing', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8'],
        issues: {
          rent_arrears: {
            total_arrears: 3000,
            arrears_items: [
              { period_start: '2024-01-01', rent_due: 1000, rent_paid: 0 },
              { period_start: '2024-02-01', rent_due: 1000, rent_paid: 0 },
              { period_start: '2024-03-01', rent_due: 1000, rent_paid: 0 },
            ],
          },
        },
        rent_amount: 1000,
        rent_frequency: 'monthly',
      };

      normalizeSection8Facts(facts);

      expect(facts.ground_particulars?.ground_8?.summary).toBeDefined();
      expect(facts.ground_particulars.ground_8.summary).toContain('£3,000');
    });

    it('should NOT overwrite existing ground_particulars.ground_8.summary', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8'],
        ground_particulars: {
          ground_8: {
            summary: 'Existing summary should not be overwritten',
          },
        },
        section8_details: 'This should not replace the existing summary',
      };

      normalizeSection8Facts(facts);

      expect(facts.ground_particulars.ground_8.summary).toBe(
        'Existing summary should not be overwritten'
      );
    });

    it('should handle flat ground_particulars string containing ground mention', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8'],
        ground_particulars: 'Ground 8: Tenant has accumulated over £3,000 in arrears.',
      };

      normalizeSection8Facts(facts);

      // Should not transform the flat string (it already contains Ground 8 mention)
      expect(typeof facts.ground_particulars).toBe('string');
    });

    it('should backfill for multiple arrears grounds', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_8', 'ground_10', 'ground_11'],
        section8_details: 'Persistent late payments and current arrears of £2,500.',
        total_arrears: 2500,
        rent_amount: 1000,
        rent_frequency: 'monthly',
      };

      normalizeSection8Facts(facts);

      // Should backfill for all arrears grounds (8, 10, 11)
      expect(facts.ground_particulars?.ground_8?.summary).toBeDefined();
      expect(facts.ground_particulars?.ground_10?.summary).toBeDefined();
      expect(facts.ground_particulars?.ground_11?.summary).toBeDefined();
    });

    it('should use section8_details for non-arrears grounds too', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: ['ground_14'],
        section8_details: 'Tenant has caused persistent nuisance to neighbours.',
      };

      normalizeSection8Facts(facts);

      expect(facts.ground_particulars?.ground_14?.summary).toBe(
        'Tenant has caused persistent nuisance to neighbours.'
      );
    });
  });

  describe('non-Section 8 cases', () => {
    it('should NOT modify facts for Section 21 route', () => {
      const facts = {
        selected_notice_route: 'section_21',
        total_arrears: 3000,
        section8_details: 'Some details',
      };

      const originalFacts = { ...facts };
      normalizeSection8Facts(facts);

      // Should not add arrears_total or ground_particulars
      expect(facts.arrears_total).toBeUndefined();
      expect(facts.ground_particulars).toBeUndefined();
    });

    it('should NOT modify facts for Wales Section 173', () => {
      const facts = {
        selected_notice_route: 'wales_section_173',
        total_arrears: 3000,
      };

      normalizeSection8Facts(facts);

      expect(facts.arrears_total).toBeUndefined();
    });

    it('should NOT modify facts for Scotland Notice to Leave', () => {
      const facts = {
        selected_notice_route: 'notice_to_leave',
        total_arrears: 3000,
      };

      normalizeSection8Facts(facts);

      expect(facts.arrears_total).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null facts', () => {
      expect(() => normalizeSection8Facts(null as any)).not.toThrow();
      expect(normalizeSection8Facts(null as any)).toBeNull();
    });

    it('should handle undefined facts', () => {
      expect(() => normalizeSection8Facts(undefined as any)).not.toThrow();
      expect(normalizeSection8Facts(undefined as any)).toBeUndefined();
    });

    it('should handle empty facts object', () => {
      const facts = {};
      normalizeSection8Facts(facts);
      expect(facts).toEqual({});
    });

    it('should handle missing section8_grounds', () => {
      const facts = {
        selected_notice_route: 'section_8',
        total_arrears: 3000,
      };

      normalizeSection8Facts(facts);

      // Should not backfill without grounds
      expect(facts.arrears_total).toBeUndefined();
    });

    it('should handle empty section8_grounds array', () => {
      const facts = {
        selected_notice_route: 'section_8',
        section8_grounds: [],
        total_arrears: 3000,
      };

      normalizeSection8Facts(facts);

      // Should not backfill without grounds
      expect(facts.arrears_total).toBeUndefined();
    });
  });
});

describe('validateSection8FactsPresent', () => {
  it('should return valid=true when all required fields present', () => {
    const facts = {
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_8'],
      arrears_total: 3000,
      ground_particulars: {
        ground_8: {
          summary: 'Tenant owes 3 months rent',
        },
      },
    };

    const result = validateSection8FactsPresent(facts);

    expect(result.valid).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it('should return valid=false when arrears_total missing for Ground 8', () => {
    const facts = {
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_8'],
      ground_particulars: {
        ground_8: {
          summary: 'Some summary',
        },
      },
    };

    const result = validateSection8FactsPresent(facts);

    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain('arrears_total');
  });

  it('should return valid=false when ground_particulars missing', () => {
    const facts = {
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_8'],
      arrears_total: 3000,
    };

    const result = validateSection8FactsPresent(facts);

    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain('ground_particulars.ground_8.summary');
  });

  it('should accept flat ground_particulars with ground mention', () => {
    const facts = {
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_8'],
      arrears_total: 3000,
      ground_particulars: 'Ground 8: Tenant owes £3000 in rent arrears',
    };

    const result = validateSection8FactsPresent(facts);

    expect(result.valid).toBe(true);
  });
});

describe('Regression: notice_only + section_8 + ground_8 document generation', () => {
  /**
   * This test simulates the exact bug scenario:
   * - Facts have issues.rent_arrears.total_arrears but NOT arrears_total
   * - Facts have section8_details but NOT ground_particulars.ground_8.summary
   *
   * After normalization, both should be present for gating validation.
   */
  it('should backfill missing fields from a real case scenario', () => {
    const realCaseFacts = {
      selected_notice_route: 'section_8',
      section8_grounds: ['Ground 8 - Serious rent arrears (2+ months)'],
      issues: {
        rent_arrears: {
          total_arrears: 4500,
          arrears_items: [
            { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1500, rent_paid: 0 },
            { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1500, rent_paid: 0 },
            { period_start: '2024-03-01', period_end: '2024-03-31', rent_due: 1500, rent_paid: 0 },
          ],
        },
      },
      total_arrears: 4500, // May also be at top level
      section8_details: 'The tenant has failed to pay rent for January, February, and March 2024, totalling £4,500 in arrears.',
      landlord_full_name: 'John Smith',
      tenant_full_name: 'Jane Doe',
      property_address_line1: '123 Main Street',
      property_city: 'London',
      property_postcode: 'SW1A 1AA',
      rent_amount: 1500,
      rent_frequency: 'monthly',
      tenancy_start_date: '2023-01-01',
    };

    // Before normalization: arrears_total and ground_particulars.ground_8 are missing
    expect(realCaseFacts.arrears_total).toBeUndefined;

    normalizeSection8Facts(realCaseFacts);

    // After normalization: both should be present
    expect(realCaseFacts.arrears_total).toBe(4500);
    expect(realCaseFacts.ground_particulars).toBeDefined();
    expect(realCaseFacts.ground_particulars.ground_8).toBeDefined();
    expect(realCaseFacts.ground_particulars.ground_8.summary).toBe(
      'The tenant has failed to pay rent for January, February, and March 2024, totalling £4,500 in arrears.'
    );

    // Validation should now pass
    const validation = validateSection8FactsPresent(realCaseFacts);
    expect(validation.valid).toBe(true);
    expect(validation.missingFields).toHaveLength(0);
  });

  it('should generate summary from arrears_items when section8_details is missing', () => {
    const factsWithoutDetails = {
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_8'],
      issues: {
        rent_arrears: {
          total_arrears: 3000,
          arrears_items: [
            { period_start: '2024-01-01', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
            { period_start: '2024-02-01', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
            { period_start: '2024-03-01', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
          ],
        },
      },
      rent_amount: 1000,
      rent_frequency: 'monthly',
    };

    normalizeSection8Facts(factsWithoutDetails);

    // Should have generated a summary from arrears data
    expect(factsWithoutDetails.arrears_total).toBe(3000);
    expect(factsWithoutDetails.ground_particulars?.ground_8?.summary).toBeDefined();
    expect(factsWithoutDetails.ground_particulars.ground_8.summary).toContain('£3,000');
    expect(factsWithoutDetails.ground_particulars.ground_8.summary).toContain('3 unpaid rent period');
  });
});
