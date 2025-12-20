import { describe, expect, it } from 'vitest';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';

describe('notice-only inline validation (wizard stage)', () => {
  it('downgrades Section 21 deposit protection gaps to warnings during wizard', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
      },
      stage: 'wizard',
    });

    expect(result.hardFailures).toHaveLength(0);
    expect(result.warnings.find((w) => w.code === 'S21-DEPOSIT-NONCOMPLIANT')).toBeTruthy();
    const warning = result.warnings.find((w) => w.code === 'S21-DEPOSIT-NONCOMPLIANT');
    expect(warning?.affected_question_id).toBe('deposit_protected_scheme');
  });

  it('leaves Section 8 arrears path unblocked by deposit checks', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_8',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: false,
        section8_grounds: ['Ground 8'],
        notice_service: { notice_date: '2024-01-01' },
      },
      stage: 'wizard',
    });

    expect(result.hardFailures.find((f) => f.code.startsWith('S21-'))).toBeFalsy();
  });
});
