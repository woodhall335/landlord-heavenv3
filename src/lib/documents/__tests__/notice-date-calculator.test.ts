/**
 * Notice Date Calculator Tests
 *
 * Critical tests for legal date calculations across all notice types.
 */

import {
  calculateSection8ExpiryDate,
  calculateSection8NoticePeriod,
  calculateSection21ExpiryDate,
  calculateNoticeToLeaveDate,
  calculateScotlandNoticeToLeaveExpiryDate,
  validateSection8ExpiryDate,
  validateSection21ExpiryDate,
  validateNoticeToLeaveDate,
} from '../notice-date-calculator';

describe('Section 21 Calendar Month Calculations', () => {
  test('Jan 31 + 2 months = Mar 31 (not Apr 1) for fixed term', () => {
    // Fixed term: no rent period alignment needed
    const result = calculateSection21ExpiryDate({
      service_date: '2025-01-31',
      tenancy_start_date: '2024-01-01',
      rent_period: 'monthly',
      fixed_term: true,
      fixed_term_end_date: '2025-03-31',
    });

    expect(result.earliest_valid_date).toBe('2025-03-31');
    expect(result.explanation).toContain('2 calendar months');
  });

  test('Jan 15 + 2 months = Mar 15 (calendar months) for fixed term', () => {
    // Fixed term: no rent period alignment needed
    const result = calculateSection21ExpiryDate({
      service_date: '2025-01-15',
      tenancy_start_date: '2024-01-01',
      rent_period: 'monthly',
      fixed_term: true,
      fixed_term_end_date: '2025-03-15',
    });

    expect(result.earliest_valid_date).toBe('2025-03-15');
    expect(result.notice_period_days).toBeGreaterThanOrEqual(59); // Feb has 28 days
  });

  test('Periodic tenancy aligns with rent period (tenancy starts on 1st)', () => {
    // Tenancy starts 1st of month, rent due 1st, so period ends last day of month
    const result = calculateSection21ExpiryDate({
      service_date: '2025-01-15',
      tenancy_start_date: '2024-01-01',
      rent_period: 'monthly',
      fixed_term: false,
    });

    // 2 months from Jan 15 = Mar 15
    // But must align with rent period ending (if rent starts 1st, period ends last day of prev month)
    // So next valid end of period after Mar 15 is Apr 1
    expect(result.earliest_valid_date).toBe('2025-04-01');
    expect(result.explanation).toContain('rent period');
  });

  test('4-month rule enforced (tenancy start Jan 1, service Feb 1)', () => {
    const result = calculateSection21ExpiryDate({
      service_date: '2025-02-01',
      tenancy_start_date: '2025-01-01',
      rent_period: 'monthly',
      fixed_term: false,
    });

    // 2 months from Feb 1 = Apr 1
    // But 4 months from tenancy start (Jan 1) = May 1
    // So earliest should be May 1
    expect(result.earliest_valid_date).toBe('2025-05-01');
    expect(result.explanation).toContain('4 months');
  });

  test('Fixed term end date respected', () => {
    const result = calculateSection21ExpiryDate({
      service_date: '2025-01-15',
      tenancy_start_date: '2024-01-01',
      fixed_term: true,
      fixed_term_end_date: '2025-06-01',
      rent_period: 'monthly',
    });

    // 2 months from Jan 15 = Mar 15
    // But fixed term ends Jun 1
    expect(result.earliest_valid_date).toBe('2025-06-01');
  });

  test('Validation rejects date too early', () => {
    const validation = validateSection21ExpiryDate('2025-02-28', {
      service_date: '2025-01-15',
      tenancy_start_date: '2024-01-01',
      rent_period: 'monthly',
      fixed_term: false,
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors[0]).toContain('calendar months');
  });

  test('Validation accepts valid date aligned with rent period', () => {
    const validation = validateSection21ExpiryDate('2025-04-01', {
      service_date: '2025-01-15',
      tenancy_start_date: '2024-01-01',
      rent_period: 'monthly',
      fixed_term: false,
    });

    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });
});

describe('Section 8 Ground-Based Calculations', () => {
  test('Mandatory ground (Ground 8) = 14 days', () => {
    const result = calculateSection8ExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ code: 8, mandatory: true }],
    });

    expect(result.earliest_valid_date).toBe('2025-01-29');
    expect(result.notice_period_days).toBe(14);
    expect(result.explanation).toContain('14 days');
  });

  test('Ground 12 discretionary = 14 days minimum, 60 recommended', () => {
    // Ground 12 (breach of tenancy) has 14-day minimum with 60-day recommendation
    const result = calculateSection8ExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ code: 12, mandatory: false }],
      strategy: 'minimum', // Use minimum
    });

    expect(result.earliest_valid_date).toBe('2025-01-29');
    expect(result.notice_period_days).toBe(14);
    expect(result.minimum_legal_days).toBe(14);
    expect(result.recommended_days).toBe(60); // Has recommendation
  });

  test('Ground 10 discretionary = 60 days minimum (no recommended)', () => {
    // Ground 10 (some rent arrears) requires 60 days minimum per Housing Act 1988
    const result = calculateSection8ExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ code: 10, mandatory: false }],
      strategy: 'minimum',
    });

    expect(result.earliest_valid_date).toBe('2025-03-16');
    expect(result.notice_period_days).toBe(60);
    expect(result.minimum_legal_days).toBe(60);
    expect(result.recommended_days).toBeUndefined(); // 60 IS the minimum
  });

  test('Mixed grounds use MAXIMUM period to satisfy all grounds', () => {
    // Ground 8 (14 days) + Ground 10 (60 days) = 60 days (max to satisfy both)
    const result = calculateSection8ExpiryDate({
      service_date: '2025-01-15',
      grounds: [
        { code: 8, mandatory: true }, // 14 days
        { code: 10, mandatory: false }, // 60 days (Ground 10/11 require 2 months)
      ],
      strategy: 'minimum',
    });

    expect(result.notice_period_days).toBe(60); // Uses maximum to satisfy Ground 10
  });
});

describe('Scotland Notice to Leave Calculations', () => {
  test('Ground 1 (Rent Arrears) without pre-action = 84 days', () => {
    const result = calculateNoticeToLeaveDate({
      service_date: '2025-01-15',
      grounds: [{ number: 1 }],
      pre_action_completed: false,
    });

    expect(result.earliest_valid_date).toBe('2025-04-09');
    expect(result.notice_period_days).toBe(84);
  });

  test('Ground 1 (Rent Arrears) with pre-action = 28 days', () => {
    const result = calculateNoticeToLeaveDate({
      service_date: '2025-01-15',
      grounds: [{ number: 1 }],
      pre_action_completed: true,
    });

    expect(result.earliest_valid_date).toBe('2025-02-12');
    expect(result.notice_period_days).toBe(28);
  });

  test('Ground 4 (Landlord intends to occupy) = 84 days', () => {
    const result = calculateNoticeToLeaveDate({
      service_date: '2025-01-15',
      grounds: [{ number: 4 }],
    });

    expect(result.earliest_valid_date).toBe('2025-04-09');
    expect(result.notice_period_days).toBe(84);
  });

  test('Mixed grounds use SHORTEST period (NEW POLICY: Math.min)', () => {
    const result = calculateNoticeToLeaveDate({
      service_date: '2025-01-15',
      grounds: [
        { number: 1 }, // 84 days without pre-action
        { number: 4 }, // 84 days
      ],
      pre_action_completed: false,
    });

    expect(result.notice_period_days).toBe(84); // Both 84, so 84
    expect(result.earliest_valid_date).toBe('2025-04-09');
  });

  test('Mixed grounds with pre-action use SHORTEST (28 days)', () => {
    const result = calculateNoticeToLeaveDate({
      service_date: '2025-01-15',
      grounds: [
        { number: 1 }, // 28 days with pre-action
        { number: 4 }, // 84 days
      ],
      pre_action_completed: true,
    });

    expect(result.notice_period_days).toBe(28); // Shortest wins
    expect(result.earliest_valid_date).toBe('2025-02-12');
  });

  test('Validation rejects date too early', () => {
    const validation = validateNoticeToLeaveDate('2025-02-01', {
      service_date: '2025-01-15',
      grounds: [{ number: 1 }], // Needs 28 days
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  test('Validation accepts valid date', () => {
    const validation = validateNoticeToLeaveDate('2025-02-12', {
      service_date: '2025-01-15',
      grounds: [{ number: 1 }],
      pre_action_completed: true, // Ground 1 with pre-action = 28 days (Jan 15 + 28 = Feb 12)
    });

    expect(validation.valid).toBe(true);
  });
});

describe('Edge Cases and Error Handling', () => {
  test('No grounds provided throws error', () => {
    expect(() => {
      calculateSection8ExpiryDate({
        service_date: '2025-01-15',
        grounds: [],
      });
    }).toThrow('At least one ground is required');
  });

  test('Unknown ground number for Scotland defaults to 84 days', () => {
    // NEW POLICY: Unknown grounds default to 84 days instead of throwing
    const result = calculateNoticeToLeaveDate({
      service_date: '2025-01-15',
      grounds: [{ number: 99 }], // Unknown ground
    });

    expect(result.notice_period_days).toBe(84);
  });

  test('Leap year handling (Feb 29) with fixed term', () => {
    const result = calculateSection21ExpiryDate({
      service_date: '2024-02-29', // Leap year
      tenancy_start_date: '2023-01-01',
      rent_period: 'monthly',
      fixed_term: true,
      fixed_term_end_date: '2024-04-29',
    });

    // 2 months from Feb 29, 2024 = Apr 29, 2024
    expect(result.earliest_valid_date).toBe('2024-04-29');
  });

  test('End of month calculations with rent period alignment', () => {
    // Periodic tenancy: must align with rent period
    const result = calculateSection21ExpiryDate({
      service_date: '2025-01-31',
      tenancy_start_date: '2024-01-01', // Rent starts 1st
      rent_period: 'monthly',
      fixed_term: false,
    });

    // 2 months from Jan 31 = Mar 31
    // Must align with rent period (starts 1st), so next period is Apr 1
    expect(result.earliest_valid_date).toBe('2025-04-01');
  });
});

describe('DST-Safe UTC Date Calculations', () => {
  test('Jan 15 + 2 calendar months = Mar 15 (UTC-safe, no DST drift) for fixed term', () => {
    const result = calculateSection21ExpiryDate({
      service_date: '2025-01-15',
      tenancy_start_date: '2024-01-01',
      rent_period: 'monthly',
      fixed_term: true,
      fixed_term_end_date: '2025-03-15',
    });

    expect(result.earliest_valid_date).toBe('2025-03-15');
    expect(result.notice_period_days).toBe(59); // Jan 15 to Mar 15 = 59 days
  });

  test('Leap year Feb 29 + 2 months = Apr 29 (UTC-safe) for fixed term', () => {
    const result = calculateSection21ExpiryDate({
      service_date: '2024-02-29',
      tenancy_start_date: '2023-01-01',
      rent_period: 'monthly',
      fixed_term: true,
      fixed_term_end_date: '2024-04-29',
    });

    expect(result.earliest_valid_date).toBe('2024-04-29');
  });

  test('Scotland 84-day periods do not drift by 1 day (UTC-safe)', () => {
    // Test across DST boundary (UK DST starts last Sunday in March)
    const result = calculateNoticeToLeaveDate({
      service_date: '2025-01-15', // Before DST
      grounds: [{ number: 4 }], // 84 days
    });

    // Should be exactly 84 days later
    expect(result.earliest_valid_date).toBe('2025-04-09');
    expect(result.notice_period_days).toBe(84);

    // Test across autumn DST boundary (ends last Sunday in October)
    const result2 = calculateNoticeToLeaveDate({
      service_date: '2025-07-15', // Before autumn DST
      grounds: [{ number: 4 }], // 84 days
    });

    // Should be exactly 84 days later, no drift
    expect(result2.earliest_valid_date).toBe('2025-10-07');
    expect(result2.notice_period_days).toBe(84);
  });

  test('Section 8 14-day periods do not drift (UTC-safe)', () => {
    // Test across DST boundary
    const result = calculateSection8ExpiryDate({
      service_date: '2025-03-20', // Just before UK DST (last Sunday March)
      grounds: [{ code: 8, mandatory: true }], // 14 days
    });

    expect(result.earliest_valid_date).toBe('2025-04-03');
    expect(result.notice_period_days).toBe(14);
  });
});

// ============================================================================
// NEW UNIFIED LOGIC TESTS (Production-Grade)
// ============================================================================

describe('Section 8 Unified Notice Periods', () => {
  test('Ground 12 (discretionary): 14 days minimum, 60 recommended with disclaimer', () => {
    // Ground 12 (breach of tenancy) has 14-day minimum with 60-day recommendation
    const result = calculateSection8NoticePeriod({
      grounds: [{ code: 12, mandatory: false }],
      strategy: 'minimum',
    });

    expect(result.minimum_legal_days).toBe(14);
    expect(result.recommended_days).toBe(60);
    expect(result.used_days).toBe(14);
    expect(result.explanation_recommended).toContain('not legally required');
    expect(result.explanation_recommended).toContain('Courts may still grant possession');
  });

  test('Ground 14A: Immediate (0 days) regardless of strategy', () => {
    // Ground 14A (domestic violence) is always immediate (0 days)
    const result = calculateSection8NoticePeriod({
      grounds: [{ code: '14A', mandatory: false }],
      strategy: 'recommended', // Strategy doesn't matter for immediate grounds
    });

    expect(result.minimum_legal_days).toBe(0);
    expect(result.used_days).toBe(0);
    expect(result.recommended_days).toBeUndefined(); // No recommendation for immediate grounds
  });

  test('Ground 14 serious ASB: 0 days (immediate)', () => {
    const result = calculateSection8NoticePeriod({
      grounds: [{ code: 14, mandatory: false }],
      severity: 'serious',
    });

    expect(result.minimum_legal_days).toBe(0);
    expect(result.used_days).toBe(0);
    expect(result.recommended_days).toBeUndefined();
    expect(result.explanation_minimum).toContain('immediate court proceedings');
    expect(result.explanation_minimum).toContain('violence');
  });

  test('Ground 14 moderate ASB: 14 days minimum, 60 recommended', () => {
    // Ground 14 with moderate severity (not serious) uses standard 14-day period
    const result = calculateSection8NoticePeriod({
      grounds: [{ code: 14, mandatory: false }],
      severity: 'moderate',
    });

    expect(result.minimum_legal_days).toBe(14);
    expect(result.recommended_days).toBe(60);
    expect(result.used_days).toBe(14);
    expect(result.explanation_minimum).toContain('14 days'); // Standard discretionary period
  });

  test('All other mandatory grounds: 14 days, no recommended', () => {
    const result = calculateSection8NoticePeriod({
      grounds: [{ code: 8, mandatory: true }],
    });

    expect(result.minimum_legal_days).toBe(14);
    expect(result.recommended_days).toBeUndefined();
    expect(result.used_days).toBe(14);
  });

  test('Discretionary grounds (14-day): 14 days minimum, 60 recommended', () => {
    // Ground 12 (breach of tenancy) has 14-day minimum
    const result = calculateSection8NoticePeriod({
      grounds: [{ code: 12, mandatory: false }],
    });

    expect(result.minimum_legal_days).toBe(14);
    expect(result.recommended_days).toBe(60);
    expect(result.used_days).toBe(14);
    expect(result.explanation_recommended).toContain('not legally required');
  });

  test('Discretionary grounds (60-day): Ground 10 = 60 days minimum, no recommended', () => {
    // Ground 10 (some rent arrears) requires 60 days minimum
    const result = calculateSection8NoticePeriod({
      grounds: [{ code: 10, mandatory: false }],
    });

    expect(result.minimum_legal_days).toBe(60);
    expect(result.recommended_days).toBeUndefined(); // 60 IS the minimum
    expect(result.used_days).toBe(60);
    expect(result.explanation_minimum).toContain('Ground 10');
  });

  test('Wales Section 8: Generates warning', () => {
    const result = calculateSection8NoticePeriod({
      grounds: [{ code: 8, mandatory: true }],
      jurisdiction: 'wales',
    });

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('England only');
    expect(result.warnings[0]).toContain('Renting Homes (Wales) Act 2016');
    expect(result.warnings[0]).toContain('may not be valid in Wales');
  });

  test('England Section 8: No warnings', () => {
    const result = calculateSection8NoticePeriod({
      grounds: [{ code: 8, mandatory: true }],
      jurisdiction: 'england',
    });

    expect(result.warnings.length).toBe(0);
  });
});

describe('Scotland Mixed Grounds (Math.min)', () => {
  test('Ground 1 (84 days) + Ground 14 (28 days) = 28 days (shortest)', () => {
    const result = calculateScotlandNoticeToLeaveExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ number: 1 }, { number: 14 }],
      pre_action_completed: false,
    });

    expect(result.notice_period_days).toBe(28); // Shortest wins
    expect(result.explanation).toContain('Shortest applicable period');
  });

  test('Ground 1 with pre-action (28) + Ground 4 (84) = 28 days', () => {
    const result = calculateScotlandNoticeToLeaveExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ number: 1 }, { number: 4 }],
      pre_action_completed: true,
    });

    expect(result.notice_period_days).toBe(28);
    expect(result.explanation).toContain('pre-action');
  });

  test('Ground 1 without pre-action = 84 days', () => {
    const result = calculateScotlandNoticeToLeaveExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ number: 1 }],
      pre_action_completed: false,
    });

    expect(result.notice_period_days).toBe(84);
    expect(result.explanation).toContain('without pre-action: 84 days');
  });

  test('Ground 1 with pre-action = 28 days', () => {
    const result = calculateScotlandNoticeToLeaveExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ number: 1 }],
      pre_action_completed: true,
    });

    expect(result.notice_period_days).toBe(28);
    expect(result.explanation).toContain('with pre-action: 28 days');
  });

  test('Ground 12 with pre-action = 28 days', () => {
    const result = calculateScotlandNoticeToLeaveExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ number: 12 }],
      pre_action_completed: true,
    });

    expect(result.notice_period_days).toBe(28);
  });

  test('Ground 13 (ASB) = 28 days', () => {
    const result = calculateScotlandNoticeToLeaveExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ number: 13 }],
    });

    expect(result.notice_period_days).toBe(28);
    expect(result.explanation).toContain('antisocial behaviour');
  });

  test('Multiple 28-day grounds = 28 days (Math.min)', () => {
    const result = calculateScotlandNoticeToLeaveExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ number: 2 }, { number: 3 }, { number: 13 }],
    });

    expect(result.notice_period_days).toBe(28);
  });
});

describe('Section 8 Fixed Term Handling', () => {
  test('Section 8 does NOT extend to fixed term end', () => {
    const result = calculateSection8ExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ code: 8, mandatory: true }],
      fixed_term: true,
      fixed_term_end_date: '2025-06-01',
    });

    // Section 8 should NOT extend to fixed term end
    // 14 days from Jan 15 = Jan 29
    expect(result.earliest_valid_date).toBe('2025-01-29');
    expect(result.notice_period_days).toBe(14);
  });
});
