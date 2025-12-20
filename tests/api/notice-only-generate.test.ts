import { describe, expect, it } from 'vitest';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';

describe('notice-only generate stage compliance', () => {
  it('blocks Section 21 when prescribed information not served', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: false,
      },
      stage: 'generate',
    });

    expect(result.hardFailures.length).toBeGreaterThan(0);
    expect(result.hardFailures[0]?.affected_question_id).toBe('prescribed_info_given');
  });
});
