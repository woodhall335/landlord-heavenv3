/**
 * Section 21 Validity Tests
 *
 * Tests for the Section 21 notice validity calculator.
 * Verifies:
 * - 4-month service restriction
 * - 2-month minimum notice period
 * - Fixed term constraints
 * - Break clause handling
 * - 6-month lapse policy
 */

import { describe, expect, it } from 'vitest';
import {
  validateSection21Notice,
  canServeSection21Now,
  calculateSection21ExpiryDateSimple,
  type Section21ValidationParams,
} from '../section21-validity';

// =============================================================================
// RULE 1: First 4 Months Restriction (SERVICE DATE)
// =============================================================================

describe('Section 21 Validity - First 4 Months Restriction', () => {
  it('MUST BLOCK notice served within first 4 months of tenancy', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2026-01-15',
      service_date: '2026-03-01', // Only ~1.5 months after start
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('S21_FIRST_4_MONTHS_BLOCK');
    expect(result.earliestServiceDate).toBe('2026-05-15'); // 4 months after Jan 15
  });

  it('MUST ALLOW notice served exactly 4 months after tenancy start', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2026-01-15',
      service_date: '2026-05-15', // Exactly 4 months
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    expect(result.isValid).toBe(true);
    const fourMonthsError = result.errors.find(e => e.code === 'S21_FIRST_4_MONTHS_BLOCK');
    expect(fourMonthsError).toBeUndefined();
  });

  it('MUST ALLOW notice served after 4 months', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15', // ~22 months after start
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    expect(result.isValid).toBe(true);
    const fourMonthsError = result.errors.find(e => e.code === 'S21_FIRST_4_MONTHS_BLOCK');
    expect(fourMonthsError).toBeUndefined();
  });
});

// =============================================================================
// RULE 2: Minimum 2 Calendar Months Notice
// =============================================================================

describe('Section 21 Validity - Minimum 2 Months Notice', () => {
  it('MUST calculate expiry as service date + 2 months for periodic tenancy', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15',
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    expect(result.computedExpiryDate).toBe('2026-03-15'); // Jan 15 + 2 months
    expect(result.noticePeriodDays).toBe(59); // ~2 months
  });

  it('MUST handle end-of-month edge cases correctly', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-31', // Jan 31 + 2 months = Mar 31
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    // Jan 31 + 2 months = Mar 31 (not Apr 1)
    expect(result.computedExpiryDate).toBe('2026-03-31');
  });

  it('MUST handle February correctly', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2025-12-31', // Dec 31 + 2 months = Feb 28/29
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    // Dec 31 + 2 months in 2026 (non-leap year) = Feb 28
    expect(result.computedExpiryDate).toBe('2026-02-28');
  });
});

// =============================================================================
// RULE 3: Fixed Term Constraint (No Break Clause)
// =============================================================================

describe('Section 21 Validity - Fixed Term (No Break Clause)', () => {
  it('MUST extend expiry to fixed term end if 2-month period ends earlier', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15',
      is_fixed_term: true,
      fixed_term_end_date: '2026-06-30',
      has_break_clause: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    // 2 months from Jan 15 = Mar 15, but fixed term ends Jun 30
    // So expiry must be Jun 30
    expect(result.computedExpiryDate).toBe('2026-06-30');
  });

  it('MUST keep 2-month expiry if fixed term ends earlier', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15',
      is_fixed_term: true,
      fixed_term_end_date: '2026-02-28', // Fixed term ends before 2-month notice
      has_break_clause: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    // Fixed term ends Feb 28, 2 months from service is Mar 15
    // Must use the later date: Mar 15
    expect(result.computedExpiryDate).toBe('2026-03-15');
  });
});

// =============================================================================
// RULE 4: Break Clause Handling
// =============================================================================

describe('Section 21 Validity - Break Clause', () => {
  it('MUST allow expiry on/after break clause date (before fixed term end)', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15',
      is_fixed_term: true,
      fixed_term_end_date: '2026-06-30',
      has_break_clause: true,
      break_clause_date: '2026-03-01', // Break clause before 2-month expiry
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    // 2 months from Jan 15 = Mar 15
    // Break clause allows exit from Mar 1
    // So expiry = max(Mar 15, Mar 1) = Mar 15
    expect(result.computedExpiryDate).toBe('2026-03-15');
  });

  it('MUST extend expiry to break clause date if 2-month period ends earlier', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15',
      is_fixed_term: true,
      fixed_term_end_date: '2026-06-30',
      has_break_clause: true,
      break_clause_date: '2026-04-15', // Break clause after 2-month expiry
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    // 2 months from Jan 15 = Mar 15
    // Break clause date = Apr 15
    // expiry = max(Mar 15, Apr 15) = Apr 15
    expect(result.computedExpiryDate).toBe('2026-04-15');
  });

  it('MUST treat "not sure" about break clause as no break clause (conservative)', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15',
      is_fixed_term: true,
      fixed_term_end_date: '2026-06-30',
      has_break_clause: false,
      break_clause_uncertain: true,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    // Should treat as no break clause and extend to fixed term end
    expect(result.computedExpiryDate).toBe('2026-06-30');
    // Should have warning about uncertain break clause
    const warning = result.warnings.find(w => w.code === 'S21_BREAK_CLAUSE_UNCERTAIN');
    expect(warning).toBeTruthy();
  });
});

// =============================================================================
// RULE 5: 6-Month Lapse Policy
// =============================================================================

describe('Section 21 Validity - 6-Month Lapse Policy', () => {
  it('MUST BLOCK if expiry date is after 6-month lapse deadline', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2020-03-15', // Old tenancy (4-month rule passed)
      service_date: '2026-01-15',
      is_fixed_term: true,
      fixed_term_end_date: '2026-09-30', // Fixed term ends after 6-month lapse
      has_break_clause: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    // Service date: Jan 15, 2026
    // 6-month lapse: Jul 15, 2026
    // Fixed term end: Sep 30, 2026
    // Expiry would be Sep 30, which is AFTER lapse date
    expect(result.isValid).toBe(false);
    const lapseError = result.errors.find(e => e.code === 'S21_NOTICE_WILL_LAPSE');
    expect(lapseError).toBeTruthy();
  });

  it('MUST calculate noticeUsableUntil as service date + 6 months', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15',
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    expect(result.noticeUsableUntil).toBe('2026-07-15'); // Jan 15 + 6 months
  });
});

// =============================================================================
// PROPOSED EXPIRY DATE VALIDATION
// =============================================================================

describe('Section 21 Validity - Proposed Expiry Date', () => {
  it('MUST reject proposed expiry that is too early', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15',
      proposed_expiry_date: '2026-02-15', // Only 1 month from service
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    expect(result.isValid).toBe(false);
    const expiryError = result.errors.find(e => e.code === 'S21_EXPIRY_TOO_EARLY');
    expect(expiryError).toBeTruthy();
  });

  it('MUST accept proposed expiry that is valid', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-03-15',
      service_date: '2026-01-15',
      proposed_expiry_date: '2026-05-15', // 4 months from service (valid)
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    expect(result.isValid).toBe(true);
    expect(result.computedExpiryDate).toBe('2026-05-15');
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

describe('Section 21 Validity - Helper Functions', () => {
  describe('canServeSection21Now', () => {
    it('MUST return canServe=false if within first 4 months', () => {
      // Assume today is within 4 months of this recent date
      const recentStart = new Date();
      recentStart.setMonth(recentStart.getMonth() - 1); // 1 month ago
      const result = canServeSection21Now(recentStart.toISOString().split('T')[0]);

      expect(result.canServe).toBe(false);
      expect(result.reason).toContain('Cannot serve Section 21');
    });

    it('MUST return canServe=true if after first 4 months', () => {
      // Old tenancy - well past 4 months
      const oldStart = '2020-01-15';
      const result = canServeSection21Now(oldStart);

      expect(result.canServe).toBe(true);
      expect(result.reason).toContain('can be served now');
    });
  });

  describe('calculateSection21ExpiryDateSimple', () => {
    it('MUST return computed expiry date', () => {
      const params: Section21ValidationParams = {
        tenancy_start_date: '2024-03-15',
        service_date: '2026-01-15',
        is_fixed_term: false,
        rent_period: 'monthly',
      };

      const result = calculateSection21ExpiryDateSimple(params);

      expect(result.expiryDate).toBe('2026-03-15');
      expect(result.expiryDateFormatted).toBe('15 March 2026');
      expect(result.noticePeriodDays).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// COMBINED SCENARIOS
// =============================================================================

describe('Section 21 Validity - Combined Scenarios', () => {
  it('handles typical periodic tenancy scenario', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2023-06-15',
      service_date: '2026-01-15',
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    expect(result.isValid).toBe(true);
    expect(result.computedExpiryDate).toBe('2026-03-15');
    expect(result.noticePeriodDays).toBeGreaterThanOrEqual(59);
    expect(result.errors).toHaveLength(0);
  });

  it('handles fixed term with break clause scenario', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2024-01-15',
      service_date: '2026-01-15',
      is_fixed_term: true,
      fixed_term_end_date: '2026-12-31',
      has_break_clause: true,
      break_clause_date: '2026-06-15',
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    expect(result.isValid).toBe(true);
    // Break clause date (Jun 15) is later than 2-month minimum (Mar 15)
    expect(result.computedExpiryDate).toBe('2026-06-15');
  });

  it('blocks service within 4 months even with valid expiry', () => {
    const params: Section21ValidationParams = {
      tenancy_start_date: '2026-01-01',
      service_date: '2026-02-01', // Only 1 month after start
      proposed_expiry_date: '2026-06-01', // Valid 4-month expiry
      is_fixed_term: false,
      rent_period: 'monthly',
    };

    const result = validateSection21Notice(params);

    // Should be blocked by 4-month SERVICE restriction
    expect(result.isValid).toBe(false);
    expect(result.errors[0].code).toBe('S21_FIRST_4_MONTHS_BLOCK');
  });
});
