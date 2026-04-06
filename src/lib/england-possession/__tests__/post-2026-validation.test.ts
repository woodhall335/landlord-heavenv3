import { describe, expect, it } from 'vitest';

import {
  listEnglandGroundDefinitions,
} from '@/lib/england-possession/ground-catalog';
import {
  calculateEarliestValidPossessionDate,
  validateEnglandPost2026WizardFacts,
} from '@/lib/england-possession/post-2026-validation';

const CORE_ENGLAND_FACTS = {
  section_16e_duties_checked: true,
  breathing_space_checked: true,
  tenant_in_breathing_space: false,
};

describe('England post-2026 validation', () => {
  it('includes the missing post-2026 private-rented grounds in the active catalog', () => {
    const codes = listEnglandGroundDefinitions().map((ground) => ground.code);

    expect(codes).toContain('5B');
    expect(codes).toContain('5H');
    expect(codes).toContain('14A');
  });

  it('blocks Ground 8 when the arrears threshold is not met', () => {
    const result = validateEnglandPost2026WizardFacts({
      ...CORE_ENGLAND_FACTS,
      section8_grounds: ['Ground 8', 'Ground 10'],
      rent_amount: 1200,
      rent_frequency: 'monthly',
      total_arrears: 1000,
    });

    expect(result.blockingIssues.some((issue) => issue.code === 'GROUND_8_THRESHOLD_NOT_MET')).toBe(true);
  });

  it('blocks a notice expiry date that is too short for Ground 1A', () => {
    const result = validateEnglandPost2026WizardFacts({
      ...CORE_ENGLAND_FACTS,
      section8_grounds: ['Ground 1A'],
      tenancy_start_date: '2025-01-01',
      notice_served_date: '2026-04-01',
      notice_expiry_date: '2026-06-01',
    });

    expect(result.blockingIssues.some((issue) => issue.code === 'NOTICE_PERIOD_TOO_SHORT')).toBe(true);
    expect(result.earliestValidDate).toBe('2026-08-01');
  });

  it('blocks unresolved deposit protection failures for most Form 3A grounds', () => {
    const result = validateEnglandPost2026WizardFacts({
      ...CORE_ENGLAND_FACTS,
      section8_grounds: ['Ground 1A'],
      deposit_taken: true,
      deposit_protected: false,
      prescribed_info_served: false,
    });

    expect(result.blockingIssues.some((issue) => issue.code === 'DEPOSIT_PROTECTION_REQUIRED')).toBe(true);
    expect(result.blockingIssues.some((issue) => issue.code === 'PRESCRIBED_INFORMATION_REQUIRED')).toBe(true);
  });

  it('does not apply the deposit blocker when only Ground 7A is used', () => {
    const result = validateEnglandPost2026WizardFacts({
      ...CORE_ENGLAND_FACTS,
      section8_grounds: ['Ground 7A'],
      deposit_taken: true,
      deposit_protected: false,
      prescribed_info_served: false,
    });

    expect(result.blockingIssues.some((issue) => issue.code === 'DEPOSIT_PROTECTION_REQUIRED')).toBe(false);
  });

  it('calculates the earliest valid Form 3A date using calendar months where required', () => {
    expect(calculateEarliestValidPossessionDate('2026-04-01', ['Ground 1A'])).toBe('2026-08-01');
    expect(calculateEarliestValidPossessionDate('2026-04-01', ['Ground 8'])).toBe('2026-04-29');
  });

  it('blocks service or filing when the tenant is in an active breathing space', () => {
    const result = validateEnglandPost2026WizardFacts({
      ...CORE_ENGLAND_FACTS,
      section8_grounds: ['Ground 8'],
      tenant_in_breathing_space: true,
      rent_amount: 1200,
      rent_frequency: 'monthly',
      total_arrears: 4200,
    });

    expect(result.blockingIssues.some((issue) => issue.code === 'TENANT_IN_BREATHING_SPACE')).toBe(true);
  });

  it('does not force a Ground 8 notice expiry date onto a tenancy-period boundary', () => {
    const result = validateEnglandPost2026WizardFacts({
      ...CORE_ENGLAND_FACTS,
      section8_grounds: ['Ground 8'],
      notice_served_date: '2026-06-01',
      notice_expiry_date: '2026-06-29',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      rent_due_day: 1,
      total_arrears: 4200,
    });

    expect(result.earliestValidDate).toBe('2026-06-29');
    expect(result.blockingIssues.some((issue) => issue.code === 'NOTICE_PERIOD_TOO_SHORT')).toBe(false);
  });
});
