import { describe, expect, it } from 'vitest';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';

describe('notice-only preview stage behaviour', () => {
  it('blocks Section 21 when prescribed information is missing at preview', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: false,
      },
      stage: 'preview',
    });

    const failure = result.hardFailures.find((f) => f.code === 'S21-DEPOSIT-NONCOMPLIANT');
    expect(failure).toBeTruthy();
    expect(failure?.affected_question_id).toBe('prescribed_info_given');
  });

  it('fails closed for Northern Ireland notice-only', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'northern-ireland',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {},
      stage: 'preview',
    });

    expect(result.ok).toBe(false);
    expect(result.hardFailures[0]?.code).toBe('NI_NOTICE_UNSUPPORTED');
  });
});
