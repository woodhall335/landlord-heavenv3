import { describe, expect, it } from 'vitest';

import { getNoticeOnlyFixStepForIssue } from '../notice-only-issue-routing';

describe('notice-only issue routing', () => {
  it('routes notice period blockers to the final review/service step', () => {
    expect(
      getNoticeOnlyFixStepForIssue({
        code: 'NOTICE_PERIOD_TOO_SHORT',
        fields: ['notice_expiry_date', 'notice_served_date', 'section8_grounds'],
      }),
    ).toBe('review');
  });

  it('routes grounds, compliance, and ground detail issues to their owning steps', () => {
    expect(getNoticeOnlyFixStepForIssue({ fields: ['section8_grounds'] })).toBe('notice');
    expect(getNoticeOnlyFixStepForIssue({ fields: ['deposit_protected'] })).toBe('section8_compliance');
    expect(getNoticeOnlyFixStepForIssue({ fields: ['ground_1a.sale_steps_taken'] })).toBe('ground_details');
  });
});
