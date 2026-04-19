import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { metadata as astMetadata } from '@/app/(marketing)/products/ast/page';
import { metadata as completePackMetadata } from '@/app/(marketing)/products/complete-pack/page';
import { metadata as moneyClaimMetadata } from '@/app/(marketing)/products/money-claim/page';
import { metadata as noticeOnlyMetadata } from '@/app/(marketing)/products/notice-only/page';
import { metadata as hmoMetadata } from '@/app/hmo-shared-house-tenancy-agreement/page';
import { metadata as lodgerMetadata } from '@/app/lodger-agreement/page';
import { metadata as premiumMetadata } from '@/app/premium-tenancy-agreement/page';
import { metadata as rentIncreaseMetadata } from '@/app/rent-increase/page';
import { metadata as standardMetadata } from '@/app/standard-tenancy-agreement/page';
import { metadata as studentMetadata } from '@/app/student-tenancy-agreement/page';
import { OWNER_PAGE_CONTRACTS } from '@/lib/seo/owner-page-contracts';
import {
  discoverSweepableStaticSeoRoutes,
  getSweepableBlogSeoEntries,
  getUnclassifiedSweepableStaticSeoRoutes,
  SUPPLEMENTAL_SWEEP_CLASSIFIED_ROUTES,
} from '@/lib/seo/sitewide-sweep';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

const ownerMetadataByPath = {
  '/products/ast': astMetadata,
  '/products/notice-only': noticeOnlyMetadata,
  '/products/complete-pack': completePackMetadata,
  '/products/money-claim': moneyClaimMetadata,
  '/rent-increase': rentIncreaseMetadata,
  '/standard-tenancy-agreement': standardMetadata,
  '/premium-tenancy-agreement': premiumMetadata,
  '/student-tenancy-agreement': studentMetadata,
  '/hmo-shared-house-tenancy-agreement': hmoMetadata,
  '/lodger-agreement': lodgerMetadata,
} as const;

const OWNER_COMMERCIAL_HREFS = new Set([
  '/products/ast',
  '/products/notice-only',
  '/products/complete-pack',
  '/products/money-claim',
]);

async function getSitemapPathnames(): Promise<string[]> {
  const entries = await sitemap();
  return entries.map((entry) => new URL(entry.url).pathname);
}

describe('sitewide SEO sweep coverage', () => {
  it('keeps non-England public acquisition routes out of the sitemap', async () => {
    const sitemapPaths = await getSitemapPathnames();

    [
      '/wales-tenancy-agreement-template',
      '/private-residential-tenancy-agreement-template',
      '/northern-ireland-tenancy-agreement-template',
      '/eviction-process-wales',
      '/eviction-process-scotland',
      '/occupation-contract-template-wales',
      '/ni-tenancy-agreement-template-free',
    ].forEach((pathname) => {
      expect(sitemapPaths).not.toContain(pathname);
    });
  });

  it('classifies every sweepable static public route with taxonomy, an owner contract, or a supplemental route contract', async () => {
    const routes = await discoverSweepableStaticSeoRoutes();
    const outsideSweep = await getUnclassifiedSweepableStaticSeoRoutes();

    expect(routes).toEqual(expect.arrayContaining([...SUPPLEMENTAL_SWEEP_CLASSIFIED_ROUTES]));
    expect(outsideSweep).toEqual([]);
  });

  it('keeps the owner-page contract metadata aligned to the intended ranking promise', async () => {
    const sitemapPaths = await getSitemapPathnames();

    for (const contract of OWNER_PAGE_CONTRACTS) {
      const metadata = ownerMetadataByPath[contract.pathname as keyof typeof ownerMetadataByPath];
      const combinedMetadataText = [
        asText(metadata.title),
        asText(metadata.description),
        Array.isArray(metadata.keywords) ? metadata.keywords.join(' ') : asText(metadata.keywords),
        asText(metadata.openGraph?.title),
        asText(metadata.openGraph?.description),
      ]
        .join(' ')
        .toLowerCase();

      expect(sitemapPaths).toContain(contract.pathname);
      expect(asText(metadata.alternates?.canonical)).toContain(contract.pathname);

      contract.mustMention.forEach((term) => {
        expect(
          combinedMetadataText,
          `${contract.pathname} should mention ${term} across its metadata surfaces`
        ).toContain(term.toLowerCase());
      });

      contract.forbiddenHeroPhrases?.forEach((term) => {
        expect(
          combinedMetadataText,
          `${contract.pathname} should avoid ${term} in metadata`
        ).not.toContain(term.toLowerCase());
      });
    }
  });

  it('keeps indexable blog posts aligned to one owner path without duplicate internal-owner links', () => {
    const blogEntries = getSweepableBlogSeoEntries().filter((entry) => entry.isIndexable);

    blogEntries.forEach((entry) => {
      expect(entry.canonicalPath.startsWith('/blog/')).toBe(true);
      expect(entry.supportingHrefs[0]).toBe(entry.pillarHref);
      expect(new Set(entry.supportingHrefs).size).toBe(entry.supportingHrefs.length);

      if (entry.region === 'england' && OWNER_COMMERCIAL_HREFS.has(entry.primaryCommercialHref)) {
        expect(
          entry.pillarHref,
          `${entry.slug} should reinforce the same England owner page in both the pillar and commercial link`
        ).toBe(entry.primaryCommercialHref);
      }
    });
  });
});
