import { describe, expect, it } from 'vitest';
import {
  getGoldenPackAsset,
  getGoldenPackProofData,
  isGoldenPackKey,
} from '@/lib/marketing/golden-pack-proof';

const EXPECTED_GOLDEN_PACK_KEYS = [
  'notice_only',
  'complete_pack',
  'money_claim',
  'section13_standard',
  'section13_defensive',
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
  'england_lodger_agreement',
] as const;

describe('getGoldenPackProofData', () => {
  it('loads the notice-only golden pack summary from artifacts', () => {
    const data = getGoldenPackProofData('notice_only');

    expect(data).not.toBeNull();
    expect(data?.documentCount).toBe(6);
    expect(data?.featuredEntries).toHaveLength(6);
    expect(data?.featuredEntries[0]?.title).toMatch(/Form 3A notice/i);
    expect(data?.featuredEntries.map((entry) => entry.title)).toContain(
      'Rent Schedule / Arrears Statement'
    );
    expect(data?.totalPages).toBeGreaterThan(0);
    expect(data?.versionToken).toMatch(/\S+/);
    expect(data?.featuredEntries.some((entry) => Boolean(entry.excerpt))).toBe(true);
    expect(data?.featuredEntries.some((entry) => Boolean(entry.pdfHref))).toBe(true);
    expect(data?.featuredEntries.some((entry) => Boolean(entry.thumbnailHref))).toBe(true);
    expect(data?.featuredEntries.some((entry) => Boolean(entry.embedHref))).toBe(true);
  });

  it('loads the complete-pack golden pack summary from artifacts', () => {
    const data = getGoldenPackProofData('complete_pack');

    expect(data).not.toBeNull();
    expect(data?.documentCount).toBeGreaterThanOrEqual(10);
    expect(data?.featuredEntries[0]?.title).toMatch(/Form 3A notice/i);
    expect(data?.featuredEntries.some((entry) => Boolean(entry.embedHref))).toBe(true);
  });

  it('recognizes supported non-eviction and tenancy golden pack keys', () => {
    expect(isGoldenPackKey('money_claim')).toBe(true);
    expect(isGoldenPackKey('section13_standard')).toBe(true);
    expect(isGoldenPackKey('section13_defensive')).toBe(true);
    expect(isGoldenPackKey('england_standard_tenancy_agreement')).toBe(true);
    expect(isGoldenPackKey('england_premium_tenancy_agreement')).toBe(true);
    expect(isGoldenPackKey('england_student_tenancy_agreement')).toBe(true);
    expect(isGoldenPackKey('england_hmo_shared_house_tenancy_agreement')).toBe(true);
    expect(isGoldenPackKey('england_lodger_agreement')).toBe(true);
  });

  it('loads proof data for every supported England golden pack', () => {
    for (const key of EXPECTED_GOLDEN_PACK_KEYS) {
      const data = getGoldenPackProofData(key);

      expect(data, `${key} should resolve from artifacts/golden-packs`).not.toBeNull();
      expect(data?.documentCount, `${key} should expose at least one document`).toBeGreaterThan(0);
      expect(
        data?.featuredEntries.length,
        `${key} should expose at least one previewable PDF sample`
      ).toBeGreaterThan(0);
      expect(
        data?.totalPages,
        `${key} should expose extracted page counts for the sample-proof block`
      ).toBeGreaterThan(0);
      expect(
        data?.featuredEntries.some((entry) => Boolean(entry.embedHref)),
        `${key} should expose embedded sample previews`
      ).toBe(true);
    }
  });

  it('resolves a whitelisted sample PDF asset from the golden pack manifest', () => {
    const asset = getGoldenPackAsset('notice_only', 'section8_notice', 'pdf');

    expect(asset).not.toBeNull();
    expect(asset?.contentType).toBe('application/pdf');
    expect(asset?.fileName).toMatch(/section8_notice\.pdf/i);
  });
});
