import { describe, expect, it } from 'vitest';
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';
import { calculateSection8NoticePeriod } from '@/lib/documents/notice-date-calculator';

describe('Section 8 Notice Only - Grounds Rendering', () => {
  it('maps grounds with statutory_text for Form 3 Section 3', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: [
        'Ground 8 - Serious rent arrears',
        'Ground 11 - Persistent delay in paying rent',
      ],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      arrears_at_notice_date: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.grounds).toBeDefined();
    expect(templateData.grounds.length).toBe(2);

    // Check Ground 8
    const ground8 = templateData.grounds.find((g: any) => g.code === 8);
    expect(ground8).toBeDefined();
    expect(ground8.code).toBe(8);
    expect(ground8.title).toBe('Serious rent arrears (at least 8 weeks or 2 months)');
    expect(ground8.statutory_text).toBeDefined();
    expect(ground8.statutory_text).toContain('at least two months\' rent is unpaid');
    expect(ground8.mandatory).toBe(true);
    expect(ground8.particulars).toBeDefined();
    expect(ground8.particulars).toContain('3000');

    // Check Ground 11
    const ground11 = templateData.grounds.find((g: any) => g.code === 11);
    expect(ground11).toBeDefined();
    expect(ground11.code).toBe(11);
    expect(ground11.title).toBe('Persistent delay in paying rent');
    expect(ground11.statutory_text).toBeDefined();
    expect(ground11.statutory_text).toContain('persistently delayed paying rent');
    expect(ground11.mandatory).toBe(false);
  });

  it('derives arrears totals from shared arrears particulars when canonical fields are missing', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['ground_8', 'ground_11'],
      ground_particulars: {
        shared_arrears: {
          amount: '£3,000',
          period: 'October 2025 - December 2025',
        },
        ground_8: {
          summary: 'tenant owes £3000 in rent',
        },
        ground_11: {
          summary: 'repeated late payment narrative',
        },
      },
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      rent_amount: '1000',
      rent_frequency: 'monthly',
      notice_service_date: '2025-12-15',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.total_arrears).toBe(3000);
    expect(templateData.arrears_at_notice_date).toBe(3000);

    const ground8 = templateData.grounds.find((g: any) => g.code === 8);
    const ground11 = templateData.grounds.find((g: any) => g.code === 11);

    expect(ground8?.particulars).toContain('Rent arrears at date of notice: £3000.00');
    expect(ground11?.particulars).toContain('Rent arrears outstanding: £3000.00');
  });

  it('maps ground particulars for Section 4 from wizard facts', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 12 - Breach of tenancy obligation'],
      section8_other_grounds_narrative: 'The tenant has kept a dog in breach of the tenancy agreement clause 5.2 which prohibits pets.',
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    const ground12 = templateData.grounds.find((g: any) => g.code === 12);
    expect(ground12).toBeDefined();
    expect(ground12.particulars).toContain('kept a dog');
    expect(ground12.particulars).toContain('clause 5.2');
  });

  it('handles multiple grounds with correct numbering', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: [
        'Ground 8 - Serious rent arrears',
        'Ground 10 - Some rent arrears',
        'Ground 11 - Persistent delay',
      ],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.grounds.length).toBe(3);
    expect(templateData.grounds[0].code).toBe(8);
    expect(templateData.grounds[1].code).toBe(10);
    expect(templateData.grounds[2].code).toBe(11);

    // All should have statutory_text
    templateData.grounds.forEach((ground: any) => {
      expect(ground.statutory_text).toBeDefined();
      expect(ground.statutory_text.length).toBeGreaterThan(0);
    });
  });

  it('calculates arrears properly for Ground 8 mandatory threshold', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 8 - Serious rent arrears'],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 2500,
      arrears_at_notice_date: 2500,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);
    const ground8 = templateData.grounds[0];

    expect(ground8.particulars).toContain('£2500');
    expect(ground8.particulars).toContain('£2000.00'); // Threshold for monthly
    expect(ground8.particulars).toContain('2 months');
  });

  it('sets ground_numbers and ground_descriptions for checklist', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: [
        'Ground 8 - Serious rent arrears',
        'Ground 11 - Persistent delay',
      ],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // These fields should be created in the preview route
    // This test verifies the grounds array structure is correct
    expect(templateData.grounds).toBeDefined();
    expect(templateData.grounds.length).toBe(2);

    // Verify we can map to ground_descriptions
    const groundDescriptions = templateData.grounds
      .map((g: any) => `Ground ${g.code} – ${g.title}`)
      .join(', ');

    expect(groundDescriptions).toContain('Ground 8');
    expect(groundDescriptions).toContain('Serious rent arrears');
    expect(groundDescriptions).toContain('Ground 11');
    expect(groundDescriptions).toContain('Persistent delay');
  });

  it('handles unknown grounds gracefully', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 99 - Unknown ground'],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.grounds).toBeDefined();
    expect(templateData.grounds.length).toBe(1);
    expect(templateData.grounds[0].code).toBe('99');
    expect(templateData.grounds[0].statutory_text).toBe(''); // Empty for unknown grounds
  });

  it('includes all mandatory ground metadata', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: [
        'Ground 8 - Serious rent arrears',
        'Ground 12 - Breach of tenancy',
      ],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Ground 8 is mandatory
    const ground8 = templateData.grounds.find((g: any) => g.code === 8);
    expect(ground8.mandatory).toBe(true);
    expect(ground8.type).toBe('MANDATORY');

    // Ground 12 is discretionary
    const ground12 = templateData.grounds.find((g: any) => g.code === 12);
    expect(ground12.mandatory).toBe(false);
    expect(ground12.type).toBe('DISCRETIONARY');
  });

  it('normalizes internal ground ids and maps structured particulars', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['ground_8', 'ground_11'],
      ground_particulars: {
        ground_8: {
          factual_summary: 'Tenant owes two months of rent across June and July.',
          evidence: 'Bank statements and rent ledger',
          total_amount_owed: 2500,
          period_of_arrears: 'June 2024 - July 2024',
        },
        ground_11: {
          factual_summary: 'Repeated late payments every month for six months.',
          evidence_available: 'WhatsApp reminders and receipts',
        },
        total_amount_owed: 2500,
      },
      landlord_full_name: 'Landlord',
      tenant_full_name: 'Tenant',
      property_address: '123 Main Street',
      total_arrears: 2500,
      rent_amount: 1250,
      rent_frequency: 'monthly',
      notice_service_date: '2024-02-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.grounds.length).toBe(2);
    const ground8 = templateData.grounds.find((g: any) => g.code === 8);
    const ground11 = templateData.grounds.find((g: any) => g.code === 11);

    expect(ground8.title).toContain('Serious rent arrears');
    expect(ground8.type_label).toBe('Mandatory');
    expect(ground8.particulars).toContain('Total amount owed');
    expect(ground8.particulars).toContain('June 2024 - July 2024');
    expect(ground8.particulars).toContain('Factual summary');
    expect(ground8.evidence).toContain('Bank statements');

    expect(ground11.title).toContain('Persistent delay');
    expect(ground11.type_label).toBe('Discretionary');
    expect(ground11.particulars).toContain('Factual summary');
    expect(ground11.evidence).toContain('WhatsApp');

    const serialized = JSON.stringify(templateData.grounds).toLowerCase();
    expect(serialized).not.toContain('ground_8');
    expect(serialized).not.toContain('ground_11');
  });
});

describe('Section 8 Notice Only - Preview Route Integration', () => {
  it('creates ground_descriptions field for checklist template', () => {
    // This tests the logic that would be in the preview route
    const grounds = [
      { code: 8, title: 'Serious rent arrears (at least 8 weeks or 2 months)' },
      { code: 11, title: 'Persistent delay in paying rent' },
    ];

    const ground_descriptions = grounds
      .map((g: any) => `Ground ${g.code} – ${g.title}`)
      .join(', ');

    expect(ground_descriptions).toBe(
      'Ground 8 – Serious rent arrears (at least 8 weeks or 2 months), Ground 11 – Persistent delay in paying rent'
    );
  });

  it('does not leak internal ground keys like ground_8', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 8 - Serious rent arrears'],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);
    const ground8 = templateData.grounds[0];

    // Should use proper labels, not internal keys
    expect(ground8.code).toBe(8);
    expect(ground8.title).not.toContain('ground_8');
    expect(ground8.title).toContain('rent arrears');
  });

  it('assembles preview-friendly strings for grounds 8 and 11 with particulars', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['ground_8', 'ground_11'],
      ground_particulars: {
        ground_8: {
          factual_summary: 'Missed payments in July and August.',
          evidence: 'Ledger extract',
          total_amount_owed: 2600,
          period_of_arrears: 'July 2024 - August 2024',
        },
      },
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 2600,
      rent_amount: 1300,
      rent_frequency: 'monthly',
      notice_service_date: '2024-03-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    const description = templateData.grounds
      .map((g: any) => `Ground ${g.code} – ${g.title}`)
      .join(', ');

    expect(description).toContain('Ground 8 – Serious rent arrears');
    expect(description).toContain('Ground 11 – Persistent delay');
    expect(description).not.toContain('ground_8');
    expect(description).not.toContain('Ground ,');
    expect(templateData.grounds[0].evidence).toContain('Ledger');
  });
});

describe('Section 8 Notice Only - Ground-Dependent Notice Periods', () => {
  it('calculates 14-day notice period for Ground 8 only', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 8 - Serious rent arrears'],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.notice_period_days).toBe(14);
    expect(templateData.notice_period_description).toBe('2 weeks');
    // Service: Jan 1, +14 days = Jan 15
    expect(templateData.earliest_possession_date).toBe('2024-01-15');
  });

  it('calculates 14-day notice period for Ground 10 (some rent arrears)', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 10 - Some rent arrears'],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 500,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.notice_period_days).toBe(14);
    expect(templateData.notice_period_description).toBe('2 weeks');
    // Service: Jan 1, +14 days = Jan 15
    expect(templateData.earliest_possession_date).toBe('2024-01-15');
  });

  it('calculates 14-day notice period for Ground 11 (persistent delay)', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 11 - Persistent delay in paying rent'],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.notice_period_days).toBe(14);
    expect(templateData.notice_period_description).toBe('2 weeks');
  });

  it('uses same notice period when combining arrears grounds (all 14 days)', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: [
        'Ground 8 - Serious rent arrears',  // 14 days
        'Ground 10 - Some rent arrears',    // 14 days
      ],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // All arrears grounds are 14 days
    expect(templateData.notice_period_days).toBe(14);
    expect(templateData.notice_period_description).toBe('2 weeks');
    expect(templateData.earliest_possession_date).toBe('2024-01-15');
  });

  it('calculates 14-day period for Ground 12 (breach of tenancy)', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 12 - Breach of tenancy obligation'],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.notice_period_days).toBe(14);
    expect(templateData.notice_period_description).toBe('2 weeks');
  });

  it('handles internal ground_8/ground_11 format correctly', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['ground_8', 'ground_11'],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Ground 11 requires 14 days
    expect(templateData.notice_period_days).toBe(14);
    expect(templateData.notice_period_description).toBe('2 weeks');
  });

  it('correctly sets notice period metadata fields', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 10 - Some rent arrears'],
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    expect(templateData.notice_period_days).toBe(14);
    expect(templateData.notice_period_weeks).toBe(2); // ceil(14/7)
    expect(templateData.notice_period_months).toBe(0);
    expect(templateData.notice_period_description).toBe('2 weeks');
  });
});

/**
 * REGRESSION TEST: Verify both notice period implementations are aligned
 *
 * There are TWO implementations of Section 8 notice period calculation:
 * 1. normalize.ts - GROUND_NOTICE_PERIODS + calculateRequiredNoticePeriod()
 * 2. notice-date-calculator.ts - SECTION8_GROUND_NOTICE_PERIODS + calculateSection8NoticePeriod()
 *
 * This test ensures they produce consistent results to prevent future divergence.
 */
describe('Section 8 Notice Period - Implementation Alignment', () => {

  const groundTestCases = [
    { grounds: [8], expected: 14, description: 'Ground 8 (serious arrears) = 14 days' },
    { grounds: [10], expected: 14, description: 'Ground 10 (some arrears) = 14 days' },
    { grounds: [11], expected: 14, description: 'Ground 11 (persistent delay) = 14 days' },
    { grounds: [12], expected: 14, description: 'Ground 12 (breach) = 14 days' },
    { grounds: [8, 10], expected: 14, description: 'Arrears grounds: max(14, 14) = 14 days' },
    { grounds: [8, 11], expected: 14, description: 'Arrears grounds: max(14, 14) = 14 days' },
    { grounds: [8, 10, 11], expected: 14, description: 'All arrears grounds = 14 days' },
    { grounds: [8, 12], expected: 14, description: 'Both 14-day grounds = 14 days' },
    { grounds: [1], expected: 60, description: 'Ground 1 (prior occupation) = 60 days' },
    { grounds: [2], expected: 60, description: 'Ground 2 (mortgagee) = 60 days' },
    { grounds: [17], expected: 14, description: 'Ground 17 (false statement) = 14 days' },
  ];

  it.each(groundTestCases)('$description', ({ grounds, expected }) => {
    // Test notice-date-calculator.ts implementation
    const groundsForCalc = grounds.map(code => ({ code, mandatory: code <= 8 }));
    const result = calculateSection8NoticePeriod({
      grounds: groundsForCalc,
      severity: 'moderate',
      strategy: 'minimum',
      jurisdiction: 'england',
    });

    expect(result.minimum_legal_days).toBe(expected);
  });

  it('mapNoticeOnlyFacts matches calculateSection8NoticePeriod for Ground 10', () => {
    // Test via mapNoticeOnlyFacts (normalize.ts implementation)
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 10 - Some rent arrears'],
      landlord_full_name: 'Test',
      tenant_full_name: 'Tenant',
      property_address: '123 Test St',
      notice_service_date: '2024-01-01',
    };
    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Test via calculateSection8NoticePeriod (notice-date-calculator.ts implementation)
    const calcResult = calculateSection8NoticePeriod({
      grounds: [{ code: 10, mandatory: false }],
      severity: 'moderate',
      strategy: 'minimum',
      jurisdiction: 'england',
    });

    // CRITICAL: Both implementations must agree
    expect(templateData.notice_period_days).toBe(calcResult.minimum_legal_days);
    expect(templateData.notice_period_days).toBe(14);
  });

  it('mapNoticeOnlyFacts matches calculateSection8NoticePeriod for Ground 11', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 11 - Persistent delay'],
      landlord_full_name: 'Test',
      tenant_full_name: 'Tenant',
      property_address: '123 Test St',
      notice_service_date: '2024-01-01',
    };
    const templateData = mapNoticeOnlyFacts(wizardFacts);

    const calcResult = calculateSection8NoticePeriod({
      grounds: [{ code: 11, mandatory: false }],
      severity: 'moderate',
      strategy: 'minimum',
      jurisdiction: 'england',
    });

    // CRITICAL: Both implementations must agree
    expect(templateData.notice_period_days).toBe(calcResult.minimum_legal_days);
    expect(templateData.notice_period_days).toBe(14);
  });

  it('mapNoticeOnlyFacts matches calculateSection8NoticePeriod for mixed grounds 8+10', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds_selection: ['Ground 8 - Serious arrears', 'Ground 10 - Some arrears'],
      landlord_full_name: 'Test',
      tenant_full_name: 'Tenant',
      property_address: '123 Test St',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };
    const templateData = mapNoticeOnlyFacts(wizardFacts);

    const calcResult = calculateSection8NoticePeriod({
      grounds: [
        { code: 8, mandatory: true },
        { code: 10, mandatory: false },
      ],
      severity: 'moderate',
      strategy: 'minimum',
      jurisdiction: 'england',
    });

    // CRITICAL: Both implementations must agree - all arrears grounds are 14 days
    expect(templateData.notice_period_days).toBe(calcResult.minimum_legal_days);
    expect(templateData.notice_period_days).toBe(14);
  });
});
