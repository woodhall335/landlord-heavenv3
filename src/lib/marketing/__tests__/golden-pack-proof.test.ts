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
  'wales_fixed_standard_occupation_contract',
  'wales_periodic_standard_occupation_contract',
  'scotland_standard_prt',
  'northern_ireland_standard_tenancy_agreement',
] as const;

describe('getGoldenPackProofData', () => {
  it('loads the notice-only golden pack summary from artifacts', () => {
    const data = getGoldenPackProofData('notice_only');

    expect(data).not.toBeNull();
    expect(data?.documentCount).toBe(8);
    expect(data?.featuredEntries).toHaveLength(8);
    expect(data?.featuredEntries[0]?.title).toMatch(/Case Summary/i);
    expect(data?.featuredEntries.map((entry) => entry.title)).toContain('Form 3A notice');
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
    expect(data?.featuredEntries[0]?.title).toMatch(/Case Summary/i);
    expect(data?.featuredEntries.map((entry) => entry.title)).toContain('Form 3A notice');
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
    expect(isGoldenPackKey('wales_fixed_standard_occupation_contract')).toBe(true);
    expect(isGoldenPackKey('wales_periodic_standard_occupation_contract')).toBe(true);
    expect(isGoldenPackKey('scotland_standard_prt')).toBe(true);
    expect(isGoldenPackKey('northern_ireland_standard_tenancy_agreement')).toBe(true);
  });

  it('loads proof data for every supported golden pack', () => {
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

  it('keeps each regional sample pack mapped to its real jurisdiction-specific PDFs', () => {
    const walesFixed = getGoldenPackProofData('wales_fixed_standard_occupation_contract');
    const walesPeriodic = getGoldenPackProofData('wales_periodic_standard_occupation_contract');
    const scotland = getGoldenPackProofData('scotland_standard_prt');
    const northernIreland = getGoldenPackProofData('northern_ireland_standard_tenancy_agreement');

    expect(walesFixed?.featuredEntries[0]).toMatchObject({
      title: 'Fixed-Term Standard Occupation Contract',
      pageCount: 35,
    });
    expect(walesPeriodic?.featuredEntries[0]).toMatchObject({
      title: 'Periodic Standard Occupation Contract',
      pageCount: 40,
    });
    expect(scotland?.featuredEntries.map((entry) => entry.title)).toContain(
      'Statutory Terms Supporting Notes (April 2024)'
    );
    expect(northernIreland?.featuredEntries.map((entry) => entry.title)).toContain(
      'Tenancy Information Notice'
    );
    expect(northernIreland?.featuredEntries.map((entry) => entry.title)).toContain(
      'Northern Ireland Rent Book'
    );
  });

  it('resolves a whitelisted sample PDF asset from the golden pack manifest', () => {
    const asset = getGoldenPackAsset('notice_only', 'section8_notice', 'pdf');

    expect(asset).not.toBeNull();
    expect(asset?.contentType).toBe('application/pdf');
    expect(asset?.fileName).toMatch(/section8_notice\.pdf/i);
  });
});
