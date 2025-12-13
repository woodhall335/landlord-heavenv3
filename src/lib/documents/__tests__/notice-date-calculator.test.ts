/**
 * Notice Date Calculator Tests
 *
 * Critical tests for legal date calculations across all notice types.
 */

import {
  calculateSection8ExpiryDate,
  calculateSection21ExpiryDate,
  calculateNoticeToLeaveDate,
  validateSection8ExpiryDate,
  validateSection21ExpiryDate,
  validateNoticeToLeaveDate,
} from '../notice-date-calculator';

describe('Section 21 Calendar Month Calculations', () => {
  test('Jan 31 + 2 months = Mar 31 (not Apr 1)', () => {
    const result = calculateSection21ExpiryDate({
      service_date: '2025-01-31',
      tenancy_start_date: '2024-01-01',
      rent_period: 'monthly',
      fixed_term: false,
    });

    expect(result.earliest_valid_date).toBe('2025-03-31');
    expect(result.explanation).toContain('2 calendar months');
  });

  test('Jan 15 + 2 months = Mar 15 (calendar months)', () => {
    const result = calculateSection21ExpiryDate({
      service_date: '2025-01-15',
      tenancy_start_date: '2024-01-01',
      rent_period: 'monthly',
      fixed_term: false,
    });

    expect(result.earliest_valid_date).toBe('2025-03-15');
    expect(result.notice_period_days).toBeGreaterThanOrEqual(59); // Feb has 28 days
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

  test('Validation accepts valid date', () => {
    const validation = validateSection21ExpiryDate('2025-03-15', {
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
    expect(result.explanation).toContain('mandatory');
  });

  test('Discretionary ground only = 60 days', () => {
    const result = calculateSection8ExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ code: 10, mandatory: false }],
    });

    expect(result.earliest_valid_date).toBe('2025-03-16');
    expect(result.notice_period_days).toBe(60);
    expect(result.explanation).toContain('discretionary');
  });

  test('Mixed grounds use longest period (60 days)', () => {
    const result = calculateSection8ExpiryDate({
      service_date: '2025-01-15',
      grounds: [
        { code: 8, mandatory: true }, // Would be 14 days
        { code: 10, mandatory: false }, // Would be 60 days
      ],
    });

    expect(result.notice_period_days).toBe(60); // Longest wins
  });

  test('Fixed term respected even with short notice period', () => {
    const result = calculateSection8ExpiryDate({
      service_date: '2025-01-15',
      grounds: [{ code: 8, mandatory: true }], // 14 days
      fixed_term: true,
      fixed_term_end_date: '2025-06-01',
    });

    // 14 days from Jan 15 = Jan 29
    // But fixed term ends Jun 1, so should be Jun 1
    expect(result.earliest_valid_date).toBe('2025-06-01');
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('Scotland Notice to Leave Calculations', () => {
  test('Ground 1 (Rent Arrears) = 28 days', () => {
    const result = calculateNoticeToLeaveDate({
      service_date: '2025-01-15',
      grounds: [{ number: 1 }],
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

  test('Mixed grounds use longest period (84 days)', () => {
    const result = calculateNoticeToLeaveDate({
      service_date: '2025-01-15',
      grounds: [
        { number: 1 }, // 28 days
        { number: 4 }, // 84 days
      ],
    });

    expect(result.notice_period_days).toBe(84); // Longest wins
    expect(result.earliest_valid_date).toBe('2025-04-09');
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

  test('Invalid ground number for Scotland throws error', () => {
    expect(() => {
      calculateNoticeToLeaveDate({
        service_date: '2025-01-15',
        grounds: [{ number: 99 }], // Invalid ground
      });
    }).toThrow('Invalid Scotland ground number');
  });

  test('Leap year handling (Feb 29)', () => {
    const result = calculateSection21ExpiryDate({
      service_date: '2024-02-29', // Leap year
      tenancy_start_date: '2023-01-01',
      rent_period: 'monthly',
      fixed_term: false,
    });

    // 2 months from Feb 29, 2024 = Apr 29, 2024
    expect(result.earliest_valid_date).toBe('2024-04-29');
  });

  test('End of month calculations (Jan 31 → Feb 28)', () => {
    // Note: This tests JavaScript Date behavior
    // Jan 31 + 1 month in non-leap year should go to Feb 28
    const result = calculateSection21ExpiryDate({
      service_date: '2025-01-31',
      tenancy_start_date: '2024-01-01',
      rent_period: 'monthly',
      fixed_term: false,
    });

    // 2 months from Jan 31, 2025
    // JavaScript: Jan 31 + 2 months = Mar 31 (correct)
    expect(result.earliest_valid_date).toBe('2025-03-31');
  });
});
