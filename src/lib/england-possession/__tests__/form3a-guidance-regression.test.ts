import { describe, expect, it } from 'vitest';

import {
  getEnglandForm3ALandlordGuidanceNoticePeriods,
  getEnglandGroundLegalWording,
} from '@/lib/england-possession/legal-wording';
import { getEnglandGroundDefinition } from '@/lib/england-possession/ground-catalog';
import { buildEnglandPossessionDraftingModel } from '@/lib/england-possession/pack-drafting';

function baseData() {
  return {
    property_address: '16 Willow Mews, York, YO24 3HX',
    tenancy_start_date: '2024-02-01',
    notice_service_date: '2026-03-05',
    notice_expiry_date: '2026-04-02',
    earliest_proceedings_date: '2026-04-02',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    total_arrears: 3600,
    arrears_items: [
      { period_start: '2026-01-01', period_end: '2026-01-31', rent_paid: 0, amount_owed: 1200 },
      { period_start: '2026-02-01', period_end: '2026-02-28', rent_paid: 0, amount_owed: 1200 },
      { period_start: '2026-03-01', period_end: '2026-03-31', rent_paid: 0, amount_owed: 1200 },
    ],
  };
}

describe('Form 3A landlord guidance regression', () => {
  it('keeps Grounds 8, 10, and 11 on the four-week notice track from the official landlord guidance', async () => {
    const guidance = await getEnglandForm3ALandlordGuidanceNoticePeriods();

    expect(guidance.fourWeeks).toEqual(expect.arrayContaining(['8', '10', '11']));

    for (const code of ['8', '10', '11'] as const) {
      const definition = getEnglandGroundDefinition(code);
      expect(definition?.noticePeriodLabel).toBe('4 weeks');
      expect(definition?.noticePeriodDays).toBe(28);
    }
  });

  it('keeps the arrears-drafting explanations aligned with the official Ground 8, 10, and 11 explanations', async () => {
    const [ground8, ground10, ground11] = await Promise.all([
      getEnglandGroundLegalWording('8'),
      getEnglandGroundLegalWording('10'),
      getEnglandGroundLegalWording('11'),
    ]);

    expect(ground8?.explanation).toContain('owes at least three months’ rent');
    expect(ground10?.explanation).toContain('tenant owes any amount of rent');
    expect(ground11?.explanation).toContain('repeatedly delayed paying rent');

    const model = buildEnglandPossessionDraftingModel({
      ...baseData(),
      ground_codes: ['8', '10', '11'],
    });
    const noticeText = model.noticeExplanationParagraphs.join(' ');

    expect(noticeText).toContain('Ground 8 is relied on as the serious rent arrears ground.');
    expect(noticeText).toContain('Ground 10 is relied on because rent lawfully due was unpaid when the notice was served');
    expect(noticeText).toContain('Ground 11 is relied on because the rent account shows repeated delay and irregularity in paying rent lawfully due.');
  });
});
