import { describe, expect, it } from 'vitest';
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';

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
