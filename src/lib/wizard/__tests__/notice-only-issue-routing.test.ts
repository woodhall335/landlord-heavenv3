import { describe, expect, it } from 'vitest';

import { getWizardFixTargetForIssue } from '../notice-only-issue-routing';

describe('wizard issue routing', () => {
  it('routes notice expiry blockers to the notice service review field', () => {
    expect(
      getWizardFixTargetForIssue({
        code: 'NOTICE_PERIOD_TOO_SHORT',
        fields: ['notice_expiry_date'],
      }),
    ).toEqual({ step: 'review', field: 'notice_expiry_date' });
  });

  it('routes ground detail blockers to ground evidence and preserves the field', () => {
    expect(
      getWizardFixTargetForIssue({
        code: 'GROUND_DETAIL_MISSING',
        fields: ['ground_1a.decision_date'],
      }),
    ).toEqual({ step: 'ground_details', field: 'ground_1a.decision_date' });
  });

  it('routes compliance blockers to pre-notice checks', () => {
    expect(
      getWizardFixTargetForIssue({
        code: 'COMPLIANCE_FIELD_MISSING',
        fields: ['breathing_space_checked'],
      }),
    ).toEqual({ step: 'section8_compliance', field: 'breathing_space_checked' });
  });
});
