import { describe, expect, it } from 'vitest';

import { metadata as blogMetadata } from '@/app/(marketing)/blog/page';
import { metadata as moneyClaimMetadata } from '@/app/money-claim/page';
import { metadata as refundsMetadata } from '@/app/refunds/page';
import { metadata as termsMetadata } from '@/app/terms/page';
import { normalizeAskHeavenMetaDescription } from '@/lib/ask-heaven/seo-metadata';
import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions/types';
import {
  getRetiredPublicRouteRedirect,
  isRetiredPublicRoute,
} from '@/lib/public-retirements';
import {
  getResidentialLandingHref,
} from '@/lib/residential-letting/products';
import { getPublicResidentialStandaloneProfiles } from '@/lib/residential-letting/standalone-profiles';
import { discoverStaticPageRoutes } from '@/lib/seo/static-route-inventory';

type BingPageAuditFixture = {
  kind: 'page';
  url: string;
  resolveDescription: () => string | Promise<string>;
  minDescriptionLength: number;
  maxDescriptionLength: number;
};

type BingRedirectAuditFixture = {
  kind: 'redirect';
  url: string;
  expectedTarget: string;
};

type BingAuditFixture = BingPageAuditFixture | BingRedirectAuditFixture;

type AskHeavenRouteFixture = {
  slug: string;
  question: string;
  summary: string;
  jurisdictions: AskHeavenQuestion['jurisdictions'];
};

function readDescription(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  return value == null ? '' : String(value);
}

const askHeavenRouteFixtures: AskHeavenRouteFixture[] = [
  {
    slug: 'ast-vs-periodic-tenancy-england',
    question: 'What is the difference between an AST and a periodic tenancy?',
    summary: 'Explains how ASTs become periodic and what that means for landlords.',
    jurisdictions: ['uk-wide'],
  },
  {
    slug: 'adding-tenant-to-existing-agreement',
    question: 'How do I add a tenant to an existing agreement?',
    summary: 'Steps for adding tenants and updating tenancy paperwork correctly.',
    jurisdictions: ['uk-wide'],
  },
  {
    slug: 'scotland-prt-notice-periods-2025',
    question: 'What notice periods apply to Scotland PRTs?',
    summary: 'Notice period guidance for Scotland PRT Notice to Leave steps.',
    jurisdictions: ['scotland'],
  },
  {
    slug: 'can-i-evict-without-court-england',
    question: 'Can I evict a tenant without a court order in England?',
    summary: 'Explains why court orders are required and risks of unlawful eviction.',
    jurisdictions: ['england'],
  },
  {
    slug: 'warrant-of-possession-bailiffs-eviction',
    question: 'How do I get bailiffs after a possession order?',
    summary: 'Overview of warrants of possession and bailiff enforcement in England.',
    jurisdictions: ['england'],
  },
  {
    slug: 'section-21-accelerated-possession-n5b-guide',
    question: 'How does the N5B accelerated possession process work after Section 21?',
    summary: 'Guide to the N5B accelerated possession route after serving Section 21 in England.',
    jurisdictions: ['england'],
  },
  {
    slug: 'section-8-ground-8-mandatory-arrears',
    question: 'How do I rely on Ground 8 for rent arrears in England?',
    summary: 'Ground 8 overview for rent arrears, with evidence and notice tips for England.',
    jurisdictions: ['england'],
  },
  {
    slug: 'section-21-validity-checklist-form-6a',
    question: 'What is the Section 21 validity checklist for Form 6A?',
    summary: 'A step-by-step checklist to ensure Form 6A Section 21 notices are valid in England.',
    jurisdictions: ['england'],
  },
  {
    slug: 'renewing-fixed-term-tenancy-england',
    question: 'Should I renew a fixed-term tenancy or let it roll into periodic?',
    summary: 'Pros, cons, and documentation tips for renewing fixed-term tenancies.',
    jurisdictions: ['uk-wide'],
  },
  {
    slug: 'calculate-rent-arrears-and-interest',
    question: 'How do I calculate rent arrears and interest?',
    summary: 'Guidance on calculating rent arrears totals and interest for England claims.',
    jurisdictions: ['england'],
  },
  {
    slug: 'accelerated-possession-costs-fees',
    question: 'How much does accelerated possession cost in England?',
    summary: 'Cost overview for accelerated possession and court fees in England.',
    jurisdictions: ['england'],
  },
  {
    slug: 'rent-increase-clause-best-practice-uk',
    question: 'What is best practice for rent increase clauses in the UK?',
    summary: 'Explains rent increase clauses and documentation across UK jurisdictions.',
    jurisdictions: ['uk-wide'],
  },
  {
    slug: 'section-173-notice-wales-when-to-use',
    question: 'When should I use a Section 173 notice in Wales?',
    summary: 'Explains when and how to use a Section 173 notice in Wales.',
    jurisdictions: ['wales'],
  },
  {
    slug: 'repayment-plan-template-landlord-tenant',
    question: 'How should I structure a rent arrears repayment plan?',
    summary: 'Best-practice repayment plan guidance for landlords and tenants in England.',
    jurisdictions: ['england'],
  },
  {
    slug: 'section-21-reissue-after-expiry',
    question: 'Can I reissue a Section 21 notice after it expires?',
    summary: 'Explains when and how to reissue Section 21 notices in England.',
    jurisdictions: ['england'],
  },
  {
    slug: 'possession-order-what-happens-next',
    question: 'What happens after I get a possession order in England?',
    summary: 'Explains the steps after a possession order, including enforcement options.',
    jurisdictions: ['england'],
  },
  {
    slug: 'guarantor-liability-for-rent-arrears',
    question: 'Is a guarantor liable for rent arrears?',
    summary: 'Explains guarantor liability for rent arrears and enforcement steps in England.',
    jurisdictions: ['england'],
  },
  {
    slug: 'rent-arrears-and-section-8-grounds',
    question: 'How do rent arrears affect Section 8 grounds?',
    summary: 'Explains how arrears levels connect to Section 8 grounds in England.',
    jurisdictions: ['england'],
  },
  {
    slug: 'small-claims-for-rent-arrears-evidence',
    question: 'What evidence do I need for a small claims rent arrears case?',
    summary: 'Evidence checklist for rent arrears cases in the small claims track.',
    jurisdictions: ['england'],
  },
];

const auditFixtures: BingAuditFixture[] = [
  {
    kind: 'page',
    url: '/blog',
    resolveDescription: () => readDescription(blogMetadata.description),
    minDescriptionLength: 150,
    maxDescriptionLength: 160,
  },
  {
    kind: 'page',
    url: '/money-claim',
    resolveDescription: () => readDescription(moneyClaimMetadata.description),
    minDescriptionLength: 150,
    maxDescriptionLength: 160,
  },
  {
    kind: 'page',
    url: '/terms',
    resolveDescription: () => readDescription(termsMetadata.description),
    minDescriptionLength: 150,
    maxDescriptionLength: 160,
  },
  {
    kind: 'page',
    url: '/refunds',
    resolveDescription: () => readDescription(refundsMetadata.description),
    minDescriptionLength: 150,
    maxDescriptionLength: 160,
  },
  ...askHeavenRouteFixtures.map(
    (fixture): BingPageAuditFixture => ({
      kind: 'page',
      url: `/ask-heaven/${fixture.slug}`,
      resolveDescription: () =>
        normalizeAskHeavenMetaDescription(
          fixture.summary,
          fixture.question,
          fixture.jurisdictions
        ),
      minDescriptionLength: 150,
      maxDescriptionLength: 160,
    })
  ),
  {
    kind: 'redirect',
    url: '/renewal-tenancy-agreement-england',
    expectedTarget: '/tenancy-agreement-template',
  },
  {
    kind: 'redirect',
    url: '/residential-sublet-agreement-england',
    expectedTarget: '/tenancy-agreement-template',
  },
  {
    kind: 'redirect',
    url: '/inventory-schedule-of-condition-england',
    expectedTarget: '/tenancy-agreement-template',
  },
  {
    kind: 'redirect',
    url: '/lease-assignment-agreement-england',
    expectedTarget: '/tenancy-agreement-template',
  },
  {
    kind: 'redirect',
    url: '/guarantor-agreement-england',
    expectedTarget: '/tenancy-agreement-template',
  },
  {
    kind: 'redirect',
    url: '/lease-amendment-england',
    expectedTarget: '/tenancy-agreement-template',
  },
  {
    kind: 'redirect',
    url: '/repayment-plan-agreement-england',
    expectedTarget: '/money-claim',
  },
  {
    kind: 'redirect',
    url: '/flatmate-agreement-england',
    expectedTarget: '/tenancy-agreement-template',
  },
];

const pageFixtures = auditFixtures.filter(
  (fixture): fixture is BingPageAuditFixture => fixture.kind === 'page'
);
const redirectFixtures = auditFixtures.filter(
  (fixture): fixture is BingRedirectAuditFixture => fixture.kind === 'redirect'
);

describe('Bing meta route audit', () => {
  pageFixtures.forEach((fixture) => {
    it(`${fixture.url} stays within the strict ${fixture.minDescriptionLength}-${fixture.maxDescriptionLength} description window`, async () => {
      const description = await fixture.resolveDescription();

      expect(description.length).toBeGreaterThanOrEqual(fixture.minDescriptionLength);
      expect(description.length).toBeLessThanOrEqual(fixture.maxDescriptionLength);
    });
  });

  redirectFixtures.forEach((fixture) => {
    it(`${fixture.url} stays a retired redirect rather than becoming a live landing page`, () => {
      expect(isRetiredPublicRoute(fixture.url)).toBe(true);
      expect(
        getRetiredPublicRouteRedirect(
          `https://landlordheaven.co.uk${fixture.url}?source=bing-meta-audit`
        )
      ).toBe(fixture.expectedTarget);
    });
  });

  it('keeps retired England route paths out of static route discovery and public standalone exports', async () => {
    const staticRoutes = await discoverStaticPageRoutes();
    const publicStandaloneRoutes = getPublicResidentialStandaloneProfiles().map((profile) =>
      getResidentialLandingHref(profile.product)
    );

    redirectFixtures.forEach((fixture) => {
      expect(staticRoutes).not.toContain(fixture.url);
      expect(publicStandaloneRoutes).not.toContain(fixture.url);
    });
  });
});
