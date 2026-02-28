/**
 * Compliance Timing Facts Builder Tests
 *
 * Tests the canonical buildComplianceTimingDataFromFacts builder that ensures
 * consistent field alias resolution across all endpoints.
 *
 * CRITICAL: These tests verify that the builder correctly resolves all known
 * field aliases to the canonical ComplianceTimingData interface keys.
 */

import { describe, it, expect } from 'vitest';
import {
  buildComplianceTimingDataFromFacts,
  buildComplianceTimingDataWithFallback,
  _FIELD_ALIASES_FOR_TESTING,
} from '@/lib/documents/compliance-timing-facts';
import { validateComplianceTiming } from '@/lib/documents/court-ready-validator';

describe('buildComplianceTimingDataFromFacts', () => {
  describe('Alias Resolution', () => {
    it('resolves tenancy_start_date from preferred key', () => {
      const facts = {
        tenancy_start_date: '2024-01-15',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.tenancy_start_date).toBe('2024-01-15');
    });

    it('resolves tenancy_start_date from legacy alias "tenancy_start"', () => {
      const facts = {
        tenancy_start: '2024-01-15',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.tenancy_start_date).toBe('2024-01-15');
    });

    it('resolves tenancy_start_date from legacy alias "start_date"', () => {
      const facts = {
        start_date: '2024-01-15',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.tenancy_start_date).toBe('2024-01-15');
    });

    it('prefers tenancy_start_date over legacy aliases', () => {
      const facts = {
        tenancy_start_date: '2024-01-15',
        tenancy_start: '2024-01-01',
        start_date: '2023-12-01',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.tenancy_start_date).toBe('2024-01-15');
    });
  });

  describe('Gas Safety Field Mapping', () => {
    it('resolves gas_safety_provided_date from wizard key "gas_safety_served_date"', () => {
      // This is the key inconsistency that caused bugs - wizard uses gas_safety_served_date
      const facts = {
        gas_safety_served_date: '2024-01-10',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.gas_safety_provided_date).toBe('2024-01-10');
    });

    it('resolves gas_safety_provided_date from preferred key', () => {
      const facts = {
        gas_safety_provided_date: '2024-01-10',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.gas_safety_provided_date).toBe('2024-01-10');
    });

    it('prefers gas_safety_provided_date over gas_safety_served_date', () => {
      const facts = {
        gas_safety_provided_date: '2024-01-10',
        gas_safety_served_date: '2024-01-05',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.gas_safety_provided_date).toBe('2024-01-10');
    });

    it('resolves has_gas_at_property from wizard key "has_gas_appliances"', () => {
      // This is another key inconsistency - wizard uses has_gas_appliances
      const facts = {
        has_gas_appliances: true,
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.has_gas_at_property).toBe(true);
    });

    it('resolves has_gas_at_property from preferred key', () => {
      const facts = {
        has_gas_at_property: false,
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.has_gas_at_property).toBe(false);
    });

    it('prefers has_gas_at_property over has_gas_appliances', () => {
      const facts = {
        has_gas_at_property: false,
        has_gas_appliances: true,
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.has_gas_at_property).toBe(false);
    });

    it('resolves gas_safety_check_date from legacy "most_recent_gas_safety_check_date"', () => {
      const facts = {
        most_recent_gas_safety_check_date: '2024-01-05',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.gas_safety_check_date).toBe('2024-01-05');
    });
  });

  describe('How to Rent Field Mapping', () => {
    it('resolves how_to_rent_provided_date from wizard key "how_to_rent_date"', () => {
      // This is another key inconsistency - wizard uses how_to_rent_date
      const facts = {
        how_to_rent_date: '2024-01-12',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.how_to_rent_provided_date).toBe('2024-01-12');
    });

    it('resolves how_to_rent_provided_date from preferred key', () => {
      const facts = {
        how_to_rent_provided_date: '2024-01-12',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.how_to_rent_provided_date).toBe('2024-01-12');
    });

    it('prefers how_to_rent_provided_date over how_to_rent_date', () => {
      const facts = {
        how_to_rent_provided_date: '2024-01-12',
        how_to_rent_date: '2024-01-08',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.how_to_rent_provided_date).toBe('2024-01-12');
    });
  });

  describe('Edge Cases', () => {
    it('handles null facts gracefully', () => {
      const result = buildComplianceTimingDataFromFacts(null);
      expect(result).toEqual({});
    });

    it('handles undefined facts gracefully', () => {
      const result = buildComplianceTimingDataFromFacts(undefined);
      expect(result).toEqual({});
    });

    it('handles empty facts object', () => {
      const result = buildComplianceTimingDataFromFacts({});
      expect(result).toEqual({});
    });

    it('skips undefined values', () => {
      const facts = {
        tenancy_start_date: '2024-01-15',
        gas_safety_served_date: undefined,
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.tenancy_start_date).toBe('2024-01-15');
      expect(result.gas_safety_provided_date).toBeUndefined();
    });

    it('skips null values', () => {
      const facts = {
        tenancy_start_date: '2024-01-15',
        gas_safety_served_date: null,
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.tenancy_start_date).toBe('2024-01-15');
      expect(result.gas_safety_provided_date).toBeUndefined();
    });

    it('skips empty string values', () => {
      const facts = {
        tenancy_start_date: '2024-01-15',
        gas_safety_served_date: '',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.tenancy_start_date).toBe('2024-01-15');
      expect(result.gas_safety_provided_date).toBeUndefined();
    });

    it('does NOT default has_gas_at_property to true when undefined', () => {
      // CRITICAL: Missing has_gas_at_property should remain undefined
      // so the validator can decide how to handle it
      const facts = {
        tenancy_start_date: '2024-01-15',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.has_gas_at_property).toBeUndefined();
    });
  });

  describe('Boolean String Handling', () => {
    it('converts string "true" to boolean true', () => {
      const facts = {
        has_gas_appliances: 'true',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.has_gas_at_property).toBe(true);
    });

    it('converts string "false" to boolean false', () => {
      const facts = {
        has_gas_appliances: 'false',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.has_gas_at_property).toBe(false);
    });

    it('converts string "yes" to boolean true', () => {
      const facts = {
        has_gas_appliances: 'yes',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.has_gas_at_property).toBe(true);
    });

    it('converts string "no" to boolean false', () => {
      const facts = {
        has_gas_appliances: 'no',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.has_gas_at_property).toBe(false);
    });
  });

  describe('Pre-occupation Gas Safety Fields', () => {
    it('resolves gas_safety_before_occupation boolean', () => {
      const facts = {
        gas_safety_before_occupation: true,
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.gas_safety_before_occupation).toBe(true);
    });

    it('resolves gas_safety_before_occupation_date', () => {
      const facts = {
        gas_safety_before_occupation_date: '2024-01-05',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.gas_safety_before_occupation_date).toBe('2024-01-05');
    });

    it('resolves gas_safety_record_served_pre_occupation_date', () => {
      const facts = {
        gas_safety_record_served_pre_occupation_date: '2024-01-08',
      };
      const result = buildComplianceTimingDataFromFacts(facts);
      expect(result.gas_safety_record_served_pre_occupation_date).toBe('2024-01-08');
    });
  });
});

describe('buildComplianceTimingDataWithFallback', () => {
  it('uses evictionCase.tenancy_start_date as fallback', () => {
    const facts = {};
    const evictionCase = {
      tenancy_start_date: '2024-01-15',
    };
    const result = buildComplianceTimingDataWithFallback(facts, evictionCase);
    expect(result.tenancy_start_date).toBe('2024-01-15');
  });

  it('prefers facts over evictionCase fallback', () => {
    const facts = {
      tenancy_start_date: '2024-01-15',
    };
    const evictionCase = {
      tenancy_start_date: '2024-01-01',
    };
    const result = buildComplianceTimingDataWithFallback(facts, evictionCase);
    expect(result.tenancy_start_date).toBe('2024-01-15');
  });

  it('works without evictionCase', () => {
    const facts = {
      tenancy_start_date: '2024-01-15',
    };
    const result = buildComplianceTimingDataWithFallback(facts);
    expect(result.tenancy_start_date).toBe('2024-01-15');
  });
});

describe('Integration: Builder + Validator', () => {
  it('produces valid ComplianceTimingData for validator when dates are before tenancy start', () => {
    // Simulate wizard facts with alias keys
    const wizardFacts = {
      tenancy_start_date: '2024-01-15',
      epc_provided_date: '2024-01-10',          // Before tenancy start
      gas_safety_served_date: '2024-01-10',     // Alias - should be resolved
      has_gas_appliances: true,                  // Alias - should be resolved
      how_to_rent_date: '2024-01-12',           // Alias - should be resolved
    };

    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
    const result = validateComplianceTiming(timingData);

    expect(result.isValid).toBe(true);
    expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  it('correctly blocks when EPC provided after tenancy start', () => {
    const wizardFacts = {
      tenancy_start_date: '2024-01-15',
      epc_provided_date: '2024-01-20',  // AFTER tenancy start
    };

    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
    const result = validateComplianceTiming(timingData);

    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.field === 'epc_timing')).toBe(true);
  });

  it('correctly blocks when gas safety provided after occupation', () => {
    const wizardFacts = {
      tenancy_start_date: '2024-01-15',
      gas_safety_served_date: '2024-01-20',  // AFTER tenancy start, using wizard alias
      has_gas_appliances: true,              // Using wizard alias
    };

    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
    const result = validateComplianceTiming(timingData);

    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.field === 'gas_safety_timing')).toBe(true);
  });

  it('correctly blocks when how to rent provided after tenancy start', () => {
    const wizardFacts = {
      tenancy_start_date: '2024-01-15',
      how_to_rent_date: '2024-01-18',  // AFTER tenancy start, using wizard alias
    };

    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
    const result = validateComplianceTiming(timingData);

    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.field === 'how_to_rent_timing')).toBe(true);
  });

  it('blocks when tenancy_start_date is missing', () => {
    const wizardFacts = {
      epc_provided_date: '2024-01-10',
      // Missing tenancy_start_date
    };

    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
    const result = validateComplianceTiming(timingData);

    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.field === 'tenancy_start_date')).toBe(true);
    expect(result.issues.find(i => i.field === 'tenancy_start_date')?.message).toContain('required');
  });
});

describe('Regression: Annual Renewal Scenario', () => {
  /**
   * REGRESSION TEST: Annual renewal served after tenancy start must NOT cause
   * false failures when pre-occupation served date exists.
   *
   * Scenario:
   * - Tenant moved in: Jan 15, 2025
   * - Pre-occupation CP12 served: Jan 10, 2025 (BEFORE move-in)
   * - Annual renewal CP12 checked/served: Dec 2025 (AFTER move-in, but that's OK for timing)
   *
   * The validator should use the pre-occupation served date for the timing check,
   * NOT the annual renewal date.
   *
   * Note: We use dates within the past 12 months to avoid the separate gas_safety_expiry
   * check from failing.
   */
  it('passes when pre-occupation gas safety was served before move-in, even if annual renewal was served later', () => {
    // Use dates that won't trip the "CP12 must be within 12 months" expiry check
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const sevenMonthsAgo = new Date(now.getTime() - 7 * 30 * 24 * 60 * 60 * 1000);
    const eightMonthsAgo = new Date(now.getTime() - 8 * 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const wizardFacts = {
      tenancy_start_date: formatDate(sevenMonthsAgo),  // Tenancy started 7 months ago
      occupation_date: formatDate(sevenMonthsAgo),

      // Pre-occupation gas safety compliance (8 months ago, before occupation)
      gas_safety_before_occupation: true,
      gas_safety_before_occupation_date: formatDate(eightMonthsAgo),      // Check was done before occupation
      gas_safety_record_served_pre_occupation_date: formatDate(eightMonthsAgo),  // Served to tenant before occupation

      // Annual renewal (3 months ago - after occupation, but within 12 months for expiry check)
      gas_safety_check_date: formatDate(threeMonthsAgo),        // Most recent check
      gas_safety_served_date: formatDate(threeMonthsAgo),       // Annual renewal served after occupation

      has_gas_appliances: true,
    };

    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
    const result = validateComplianceTiming(timingData);

    // Should pass because:
    // 1. Pre-occupation served date is before occupation (timing check passes)
    // 2. Most recent CP12 is within 12 months (expiry check passes)
    expect(result.isValid).toBe(true);
    expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  it('uses pre-occupation served date over general served date for timing validation', () => {
    // Use dates within past 12 months to avoid expiry check failures
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const sevenMonthsAgo = new Date(now.getTime() - 7 * 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const wizardFacts = {
      tenancy_start_date: formatDate(sixMonthsAgo),
      occupation_date: formatDate(sixMonthsAgo),

      // Pre-occupation gas safety compliance (7 months ago, before occupation)
      gas_safety_before_occupation: true,
      gas_safety_record_served_pre_occupation_date: formatDate(sevenMonthsAgo),  // BEFORE occupation - this should be used

      // General served date (which might be an annual renewal) - 3 months ago
      gas_safety_served_date: formatDate(threeMonthsAgo),  // AFTER occupation - should be ignored for timing

      // Need a recent check date for expiry validation
      gas_safety_check_date: formatDate(threeMonthsAgo),

      has_gas_appliances: true,
    };

    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
    const result = validateComplianceTiming(timingData);

    // Should pass because gas_safety_record_served_pre_occupation_date is before occupation
    expect(result.isValid).toBe(true);
  });

  it('fails when ONLY annual renewal date exists and it is after occupation', () => {
    // Use dates within past 12 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const fiveMonthsAgo = new Date(now.getTime() - 5 * 30 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const wizardFacts = {
      tenancy_start_date: formatDate(sixMonthsAgo),
      occupation_date: formatDate(sixMonthsAgo),

      // No pre-occupation compliance, only date provided after occupation
      gas_safety_served_date: formatDate(fiveMonthsAgo),  // AFTER occupation
      gas_safety_check_date: formatDate(fiveMonthsAgo),   // For expiry check

      has_gas_appliances: true,
    };

    const timingData = buildComplianceTimingDataFromFacts(wizardFacts);
    const result = validateComplianceTiming(timingData);

    // Should fail because the only served date is after occupation
    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.field === 'gas_safety_timing')).toBe(true);
  });
});

describe('Alias Precedence Rules Documentation', () => {
  it('documents all alias lists for audit', () => {
    // This test ensures the alias lists are documented and can be inspected
    const aliases = _FIELD_ALIASES_FOR_TESTING;

    // Verify all expected fields have alias lists
    expect(aliases.tenancy_start_date).toContain('tenancy_start_date');
    expect(aliases.gas_safety_provided_date).toContain('gas_safety_served_date');
    expect(aliases.has_gas_at_property).toContain('has_gas_appliances');
    expect(aliases.how_to_rent_provided_date).toContain('how_to_rent_date');

    // Verify preferred keys are first in the list
    expect(aliases.tenancy_start_date[0]).toBe('tenancy_start_date');
    expect(aliases.gas_safety_provided_date[0]).toBe('gas_safety_provided_date');
    expect(aliases.has_gas_at_property[0]).toBe('has_gas_at_property');
    expect(aliases.how_to_rent_provided_date[0]).toBe('how_to_rent_provided_date');
  });
});
