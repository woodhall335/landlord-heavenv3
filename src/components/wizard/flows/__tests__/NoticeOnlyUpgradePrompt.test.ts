import { describe, expect, it } from 'vitest';
import { getNoticeOnlyUpgradePrompt } from '../NoticeOnlySectionFlow';

describe('getNoticeOnlyUpgradePrompt', () => {
  it('recommends complete pack when a Ground 8 arrears case already has a schedule', () => {
    const prompt = getNoticeOnlyUpgradePrompt(
      {
        eviction_route: 'section_8',
        section8_grounds: ['Ground 8 - Serious rent arrears', 'Ground 10 - Some rent arrears'],
        arrears_items: [
          {
            period_start: '2026-01-01',
            period_end: '2026-01-31',
            rent_due: 800,
            rent_paid: 0,
            amount_owed: 800,
          },
        ],
      } as any,
      'england'
    );

    expect(prompt).not.toBeNull();
    expect(prompt?.title).toMatch(/full possession pack/i);
    expect(prompt?.benefits).toContain(
      'Moves this same case into Stage 2 without re-entering the notice basics'
    );
  });

  it('does not recommend complete pack for a non-England or low-complexity notice flow', () => {
    expect(
      getNoticeOnlyUpgradePrompt(
        {
          eviction_route: 'section_8',
          section8_grounds: ['Ground 12 - Breach of tenancy obligation'],
        } as any,
        'wales'
      )
    ).toBeNull();
  });
});
