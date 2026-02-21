/**
 * Scotland Notice Narrative Builder Tests
 *
 * Tests for the buildScotlandNoticeNarrative utility which generates
 * tribunal-safe narrative text from wizard facts for Scotland Notice to Leave.
 */

import { describe, it, expect } from 'vitest';
import {
  buildScotlandNoticeNarrative,
  buildScotlandEvidenceSummary,
  buildScotlandParticularsStatement,
} from '@/lib/scotland/noticeNarrativeBuilder';

describe('buildScotlandNoticeNarrative', () => {
  describe('Ground 18 (Rent Arrears)', () => {
    it('should build narrative with arrears schedule summary', () => {
      const facts = {
        scotland_eviction_ground: 18,
        scotland_ground_name: 'Rent arrears - 3 consecutive months',
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Main Street',
        property_address_town: 'Edinburgh',
        property_address_postcode: 'EH1 1AA',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        arrears_items: [
          { period_start: '2024-01-01', amount_owed: 1000 },
          { period_start: '2024-02-01', amount_owed: 1000 },
          { period_start: '2024-03-01', amount_owed: 1000 },
        ],
      };

      const result = buildScotlandNoticeNarrative(facts, 'particulars');

      expect(result.suggestedText).toContain('John Landlord');
      expect(result.suggestedText).toContain('Jane Tenant');
      expect(result.suggestedText).toContain('123 Main Street');
      expect(result.suggestedText).toContain('3 consecutive rent period');
      expect(result.suggestedText).toContain('Ground 18 threshold');
      expect(result.missingInputs).toHaveLength(0);
    });

    it('should warn when consecutive streak is less than 3', () => {
      const facts = {
        scotland_eviction_ground: 18,
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Main Street',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        arrears_items: [
          { period_start: '2024-01-01', amount_owed: 1000 },
          { period_start: '2024-02-01', amount_owed: 1000 },
        ],
      };

      const result = buildScotlandNoticeNarrative(facts, 'particulars');

      expect(result.suggestedText).toContain('2 consecutive rent period');
      expect(result.suggestedText).toContain('[Note: Ground 18 requires 3 or more consecutive rent periods');
      expect(result.missingInputs).toContain('Ground 18 threshold not yet met - need 3+ consecutive rent periods');
    });

    it('should warn when arrears schedule is missing', () => {
      const facts = {
        scotland_eviction_ground: 18,
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Main Street',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        // No arrears_items
      };

      const result = buildScotlandNoticeNarrative(facts, 'particulars');

      expect(result.suggestedText).toContain('please complete the arrears schedule');
      expect(result.missingInputs).toContain('Arrears schedule not completed');
    });
  });

  describe('Other grounds', () => {
    it('should build narrative for non-arrears grounds', () => {
      const facts = {
        scotland_eviction_ground: 1,
        scotland_ground_name: 'Landlord intends to sell',
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Main Street',
        property_address_town: 'Edinburgh',
        property_address_postcode: 'EH1 1AA',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
      };

      const result = buildScotlandNoticeNarrative(facts, 'particulars');

      expect(result.suggestedText).toContain('John Landlord');
      expect(result.suggestedText).toContain('Jane Tenant');
      expect(result.suggestedText).toContain('Ground 1');
      expect(result.suggestedText).toContain('First-tier Tribunal');
      expect(result.missingInputs).toHaveLength(0);
    });
  });

  describe('Missing information handling', () => {
    it('should track missing required fields', () => {
      const facts = {
        scotland_eviction_ground: 1,
        // Missing: landlord_full_name, tenant_full_name, property_address, tenancy_start_date, rent_amount
      };

      const result = buildScotlandNoticeNarrative(facts, 'particulars');

      expect(result.missingInputs).toContain('Landlord name');
      expect(result.missingInputs).toContain('Tenant name');
      expect(result.missingInputs).toContain('Property address');
      expect(result.missingInputs).toContain('Tenancy start date');
      expect(result.missingInputs).toContain('Rent amount');
    });

    it('should use placeholders for missing values', () => {
      const facts = {
        scotland_eviction_ground: 1,
      };

      const result = buildScotlandNoticeNarrative(facts, 'particulars');

      expect(result.suggestedText).toContain('[landlord name]');
      expect(result.suggestedText).toContain('[tenant name]');
      expect(result.suggestedText).toContain('[property address]');
      expect(result.suggestedText).toContain('[date]');
      expect(result.suggestedText).toContain('[amount]');
    });

    it('should track missing ground selection', () => {
      const facts = {
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Main Street',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        // Missing: scotland_eviction_ground
      };

      const result = buildScotlandNoticeNarrative(facts, 'particulars');

      expect(result.missingInputs).toContain('Eviction ground not selected');
    });
  });

  describe('Evidence summary mode', () => {
    it('should build concise evidence summary', () => {
      const facts = {
        scotland_eviction_ground: 1,
        scotland_ground_name: 'Landlord intends to sell',
      };

      const result = buildScotlandEvidenceSummary(facts);

      expect(result.suggestedText).toContain('Private Housing (Tenancies) (Scotland) Act 2016');
      expect(result.suggestedText).toContain('Ground 1');
    });
  });

  describe('Particulars statement mode', () => {
    it('should build full particulars statement', () => {
      const facts = {
        scotland_eviction_ground: 1,
        scotland_ground_name: 'Landlord intends to sell',
        landlord_full_name: 'John Landlord',
        tenant_full_name: 'Jane Tenant',
        property_address_line1: '123 Main Street',
        property_address_town: 'Edinburgh',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
      };

      const result = buildScotlandParticularsStatement(facts);

      expect(result.suggestedText).toContain('seeks to recover possession');
      expect(result.suggestedText).toContain('John Landlord');
      expect(result.suggestedText).toContain('123 Main Street');
      expect(result.suggestedText).toContain('tenancy commenced');
    });
  });
});

describe('Date and currency formatting', () => {
  it('should format dates in UK format', () => {
    const facts = {
      scotland_eviction_ground: 1,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: '2023-06-15',
      rent_amount: 1000,
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    // Should format as "15 June 2023" (UK format)
    expect(result.suggestedText).toContain('15');
    expect(result.suggestedText).toContain('June');
    expect(result.suggestedText).toContain('2023');
  });

  it('should format currency with pound symbol', () => {
    const facts = {
      scotland_eviction_ground: 18,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: '2023-01-01',
      rent_amount: 1250.50,
      arrears_items: [
        { period_start: '2024-01-01', amount_owed: 1250.50 },
        { period_start: '2024-02-01', amount_owed: 1250.50 },
        { period_start: '2024-03-01', amount_owed: 1250.50 },
      ],
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    expect(result.suggestedText).toContain('£');
  });
});

describe('Arrears schedule in particulars', () => {
  it('should include arrears schedule summary', () => {
    const facts = {
      scotland_eviction_ground: 18,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: '2023-01-01',
      rent_amount: 1000,
      arrears_items: [
        { period_start: '2024-01-01', amount_owed: 1000 },
        { period_start: '2024-02-01', amount_owed: 1000 },
        { period_start: '2024-03-01', amount_owed: 1000 },
      ],
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    expect(result.suggestedText).toContain('Arrears schedule:');
    expect(result.suggestedText).toContain('January');
    expect(result.suggestedText).toContain('outstanding');
  });

  it('should truncate long arrears schedules', () => {
    const facts = {
      scotland_eviction_ground: 18,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: '2023-01-01',
      rent_amount: 1000,
      arrears_items: [
        { period_start: '2024-01-01', amount_owed: 1000 },
        { period_start: '2024-02-01', amount_owed: 1000 },
        { period_start: '2024-03-01', amount_owed: 1000 },
        { period_start: '2024-04-01', amount_owed: 1000 },
        { period_start: '2024-05-01', amount_owed: 1000 },
        { period_start: '2024-06-01', amount_owed: 1000 },
        { period_start: '2024-07-01', amount_owed: 1000 },
        { period_start: '2024-08-01', amount_owed: 1000 },
      ],
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    // Should show first 6 and indicate there are more
    expect(result.suggestedText).toContain('additional period(s)');
    expect(result.suggestedText).toContain('see full schedule');
  });
});

describe('Invalid date handling (formatDate hardening)', () => {
  it('should use [date] placeholder when tenancy_start_date is invalid', () => {
    const facts = {
      scotland_eviction_ground: 1,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: 'invalid-date-string',
      rent_amount: 1000,
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    // Should NOT contain "Invalid Date" literal string
    expect(result.suggestedText).not.toContain('Invalid Date');
    // Should use placeholder instead
    expect(result.suggestedText).toContain('[date]');
  });

  it('should use [date] placeholder when tenancy_start_date is empty', () => {
    const facts = {
      scotland_eviction_ground: 1,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: '',
      rent_amount: 1000,
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    expect(result.suggestedText).not.toContain('Invalid Date');
    expect(result.suggestedText).toContain('[date]');
  });

  it('should use [date] placeholder when arrears period_start is invalid', () => {
    const facts = {
      scotland_eviction_ground: 18,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: '2023-01-01',
      rent_amount: 1000,
      arrears_items: [
        { period_start: 'garbage', amount_owed: 1000 },
        { period_start: 'also-garbage', amount_owed: 1000 },
        { period_start: 'not-a-date', amount_owed: 1000 },
      ],
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    // Should NOT produce "Invalid Date" in the arrears schedule
    expect(result.suggestedText).not.toContain('Invalid Date');
  });

  it('should format valid ISO date as UK long format', () => {
    const facts = {
      scotland_eviction_ground: 1,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: '2024-12-25',
      rent_amount: 1000,
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    // Should format as "25 December 2024" (UK long format)
    expect(result.suggestedText).toContain('25');
    expect(result.suggestedText).toContain('December');
    expect(result.suggestedText).toContain('2024');
  });
});

describe('Ground 18 uses "rent period(s)" not "month(s)"', () => {
  it('should use "rent period(s)" terminology in threshold met message', () => {
    const facts = {
      scotland_eviction_ground: 18,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: '2023-01-01',
      rent_amount: 1000,
      arrears_items: [
        { period_start: '2024-01-01', amount_owed: 1000 },
        { period_start: '2024-02-01', amount_owed: 1000 },
        { period_start: '2024-03-01', amount_owed: 1000 },
      ],
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    // Should say "consecutive rent periods" not "consecutive months"
    expect(result.suggestedText).toContain('consecutive rent period');
    expect(result.suggestedText).not.toMatch(/consecutive month[s]? of (rent )?arrears/i);
  });

  it('should use "rent period(s)" terminology in threshold not met warning', () => {
    const facts = {
      scotland_eviction_ground: 18,
      landlord_full_name: 'John Landlord',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '123 Main Street',
      tenancy_start_date: '2023-01-01',
      rent_amount: 1000,
      arrears_items: [
        { period_start: '2024-01-01', amount_owed: 1000 },
      ],
    };

    const result = buildScotlandNoticeNarrative(facts, 'particulars');

    // Note should say "rent periods" not "months"
    expect(result.suggestedText).toContain('consecutive rent period');
    expect(result.missingInputs.some(msg => msg.includes('rent period'))).toBe(true);
  });
});
