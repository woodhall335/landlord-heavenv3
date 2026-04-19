import { describe, expect, it } from 'vitest';
import { getGoldenPackAsset, getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';

describe('getGoldenPackProofData', () => {
  it('loads the notice-only golden pack summary from artifacts', () => {
    const data = getGoldenPackProofData('notice_only');

    expect(data).not.toBeNull();
    expect(data?.documentCount).toBe(5);
    expect(data?.featuredEntries.length).toBeGreaterThan(0);
    expect(data?.featuredEntries[0]?.title).toMatch(/Form 3A notice/i);
    expect(data?.totalPages).toBeGreaterThan(0);
    expect(data?.versionToken).toMatch(/\S+/);
    expect(data?.featuredEntries.some((entry) => Boolean(entry.excerpt))).toBe(true);
    expect(data?.featuredEntries.some((entry) => Boolean(entry.pdfHref))).toBe(true);
    expect(data?.featuredEntries.some((entry) => Boolean(entry.thumbnailHref))).toBe(true);
    expect(data?.featuredEntries.some((entry) => Boolean(entry.embedHref))).toBe(true);
  });

  it('loads the standard tenancy golden pack summary from artifacts', () => {
    const data = getGoldenPackProofData('england_standard_tenancy_agreement');

    expect(data).not.toBeNull();
    expect(data?.documentCount).toBeGreaterThanOrEqual(5);
    expect(data?.featuredEntries[0]?.title).toMatch(/Standard Tenancy Agreement/i);
    expect(data?.remainingTitles.length).toBeGreaterThanOrEqual(0);
  });

  it('resolves a whitelisted sample PDF asset from the golden pack manifest', () => {
    const asset = getGoldenPackAsset('notice_only', 'section8_notice', 'pdf');

    expect(asset).not.toBeNull();
    expect(asset?.contentType).toBe('application/pdf');
    expect(asset?.fileName).toMatch(/section8_notice\.pdf/i);
  });
});
