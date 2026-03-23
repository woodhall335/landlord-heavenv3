import { existsSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

import { getTenancyAgreementPreviewData } from '../tenancyAgreementPreviews';

const EXPECTED_COUNTS = {
  england: { standard: 5, premium: 8 },
  wales: { standard: 3, premium: 6 },
  scotland: { standard: 4, premium: 7 },
  'northern-ireland': { standard: 3, premium: 6 },
} as const;

describe('getTenancyAgreementPreviewData', () => {
  it('returns the expected document counts for every jurisdiction and tier', async () => {
    const previews = await getTenancyAgreementPreviewData();

    for (const [jurisdiction, tiers] of Object.entries(EXPECTED_COUNTS)) {
      expect(previews[jurisdiction as keyof typeof previews].standard).toHaveLength(tiers.standard);
      expect(previews[jurisdiction as keyof typeof previews].premium).toHaveLength(tiers.premium);
    }
  });

  it('includes premium support document previews and Scotland easy read notes', async () => {
    const previews = await getTenancyAgreementPreviewData();

    expect(previews.england.premium.some((doc) => doc.key === 'key_schedule')).toBe(true);
    expect(previews.england.premium.some((doc) => doc.key === 'property_maintenance_guide')).toBe(true);
    expect(previews.england.premium.some((doc) => doc.key === 'checkout_procedure')).toBe(true);
    expect(previews.scotland.standard.some((doc) => doc.key === 'easy_read_notes_scotland')).toBe(true);
    expect(previews.scotland.premium.some((doc) => doc.key === 'easy_read_notes_scotland')).toBe(true);
  });

  it('resolves to preview assets that exist on disk and always provides descriptions', async () => {
    const previews = await getTenancyAgreementPreviewData();

    for (const jurisdiction of Object.keys(previews) as Array<keyof typeof previews>) {
      for (const tier of ['standard', 'premium'] as const) {
        for (const document of previews[jurisdiction][tier]) {
          expect(document.description?.length).toBeGreaterThan(10);

          const assetPath = join(process.cwd(), 'public', document.src.replace(/^\//, ''));
          expect(existsSync(assetPath)).toBe(true);
        }
      }
    }
  });
});
