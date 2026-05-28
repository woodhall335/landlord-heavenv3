import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { PRODUCTS, type ProductSku } from '@/lib/pricing/products';
import { productSamplePages, productSamplePagePaths } from '@/lib/marketing/product-sample-pages';
import {
  PRODUCT_OWNER_METADATA,
  PRODUCT_OWNER_METADATA_LIST,
} from '@/lib/seo/product-owner-metadata';
import {
  STRUCTURED_PRODUCT_REVIEW_COUNT,
  productSchema,
} from '@/lib/seo/structured-data';

const repoRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const productOwnerPages = [
  {
    path: '/products/notice-only',
    sku: 'notice_only',
    source: 'src/app/(marketing)/products/notice-only/page.tsx',
  },
  {
    path: '/products/complete-pack',
    sku: 'complete_pack',
    source: 'src/app/(marketing)/products/complete-pack/page.tsx',
  },
  {
    path: '/products/money-claim',
    sku: 'money_claim',
    source: 'src/app/(marketing)/products/money-claim/page.tsx',
  },
  {
    path: '/products/section-13-standard',
    sku: 'section13_standard',
    source: 'src/app/(marketing)/products/section-13-standard/page.tsx',
  },
  {
    path: '/products/section-13-defence',
    sku: 'section13_defensive',
    source: 'src/app/(marketing)/products/section-13-defence/page.tsx',
  },
  {
    path: '/standard-tenancy-agreement',
    sku: 'england_standard_tenancy_agreement',
    source: 'src/app/standard-tenancy-agreement/page.tsx',
  },
  {
    path: '/premium-tenancy-agreement',
    sku: 'england_premium_tenancy_agreement',
    source: 'src/app/premium-tenancy-agreement/page.tsx',
  },
  {
    path: '/student-tenancy-agreement',
    sku: 'england_student_tenancy_agreement',
    source: 'src/app/student-tenancy-agreement/page.tsx',
  },
  {
    path: '/hmo-shared-house-tenancy-agreement',
    sku: 'england_hmo_shared_house_tenancy_agreement',
    source: 'src/app/hmo-shared-house-tenancy-agreement/page.tsx',
  },
  {
    path: '/lodger-agreement',
    sku: 'england_lodger_agreement',
    source: 'src/app/lodger-agreement/page.tsx',
  },
] satisfies Array<{ path: string; sku: ProductSku; source: string }>;

const earlyInternalLinks = [
  {
    source: 'src/lib/seo/england-current-framework-pages.ts',
    href: '/products/notice-only',
    anchor: 'Create my Section 8 notice',
  },
  {
    source: 'src/app/how-to-rent-guide/page.tsx',
    href: '/standard-tenancy-agreement',
    anchor: "create a Renters' Rights Act compliant tenancy agreement",
  },
  {
    source: 'src/app/rent-increase/RentIncreaseGuidePage.tsx',
    href: '/products/section-13-standard',
    anchor: 'create your Section 13 rent increase notice',
  },
  {
    source: 'src/app/rent-increase/RentIncreaseGuidePage.tsx',
    href: '/products/section-13-defence',
    anchor: 'prepare for a rent challenge',
  },
  {
    source: 'src/app/tools/hmo-license-checker/page.tsx',
    href: '/hmo-shared-house-tenancy-agreement',
    anchor: 'create an HMO tenancy agreement and house rules pack',
  },
  {
    source: 'src/lib/blog/posts.tsx',
    href: '/products/notice-only',
    anchor: 'create your Section 8 notice',
  },
  {
    source: 'src/lib/blog/posts.tsx',
    href: '/products/complete-pack',
    anchor: 'court pack',
  },
  {
    source: 'src/app/tools/rent-arrears-calculator/page.tsx',
    href: '/products/money-claim',
    anchor: 'prepare a money claim pack for unpaid rent',
  },
  {
    source: 'src/app/rent-arrears-letter-template/page.tsx',
    href: '/products/money-claim',
    hrefExpression: 'moneyClaimProductHref',
    anchor: 'prepare a rent arrears money claim',
  },
  {
    source: 'src/app/assured-periodic-tenancy-agreement/page.tsx',
    href: '/standard-tenancy-agreement',
    anchor: 'Create a validated assured periodic tenancy agreement',
  },
];

const expectedProductMetaDescriptions = {
  noticeOnly:
    'Create an England landlord Section 8 eviction notice file with Form 3A, N215, arrears schedule, service instructions, and pre-service checks.',
  completePack:
    'Evict a tenant through court with an England complete eviction pack: Section 8 possession claim, court forms N5 and N119, evidence, and hearing support.',
  moneyClaim:
    'Recover unpaid rent, property damage, or tenant debt with a landlord money claim pack: letter before claim, particulars, debt schedule, and MCOL/N1 guidance.',
  section13Standard:
    'Create an England Section 13 Form 4A rent increase pack with market evidence, service record, cover letter, and supportable-rent summary.',
  section13Defence:
    'Prepare for a Section 13 rent challenge with Form 4A, market evidence, response wording, legal briefing, and tribunal bundle support.',
  standardTenancy:
    'Create an England standard periodic tenancy agreement pack with current wording, setup records, validation checks, and preview before payment.',
  premiumTenancy:
    'Create a premium England periodic tenancy agreement pack with stronger wording for access, repairs, keys, handover, and management control.',
  studentTenancy:
    'Create an England student tenancy agreement pack with guarantor wording, sharer rules, replacement controls, and end-of-term handover records.',
  hmoTenancy:
    'Create an England HMO or shared-house tenancy agreement pack with house rules, communal-area wording, and shared occupation records.',
  lodgerAgreement:
    'Create a lodger agreement for resident landlords with room-let terms, shared-home rules, notice wording, and move-in records.',
} satisfies Record<keyof typeof PRODUCT_OWNER_METADATA, string>;

const pageCommercialPhraseExpectations = [
  {
    source: 'src/app/(marketing)/products/notice-only/page.tsx',
    phrases: ['solicitor approved section 8 notice file', 'N215 certificate of service'],
    faq: 'Does this use court approved Section 8 documents?',
  },
  {
    source: 'src/app/(marketing)/products/complete-pack/page.tsx',
    phrases: ['solicitor approved Section 8 court file', 'N5 N119 forms'],
    faq: 'Does this use court approved possession claim forms?',
  },
  {
    source: 'src/app/(marketing)/products/money-claim/page.tsx',
    phrases: ['MCOL pack for landlords', 'particulars of claim template'],
    faq: 'Is this a court approved money claim?',
  },
  {
    source: 'src/lib/marketing/section13-products.ts',
    phrases: ['market-supported rent increase file', 'current comparable rental evidence'],
    faq: 'Is this a court approved Section 13 notice?',
  },
  {
    source: 'src/lib/marketing/section13-products.ts',
    phrases: ['Tenant Argument Response Guide', 'Indexed Tribunal Bundle'],
    faq: 'Is this a court approved Tribunal-Ready Rent Increase Pack?',
  },
  {
    source: 'src/app/standard-tenancy-agreement/page.tsx',
    phrases: ['periodic tenancy agreement template', 'current wording'],
    faq: 'Is this a court approved tenancy agreement?',
  },
  {
    source: 'src/app/premium-tenancy-agreement/page.tsx',
    phrases: ['premium periodic tenancy agreement', 'stronger management wording'],
    faq: 'Is this a court approved premium tenancy agreement?',
  },
  {
    source: 'src/app/student-tenancy-agreement/page.tsx',
    phrases: ['student tenancy agreement', 'guarantor agreement for student tenancy'],
    faq: 'Is this a court approved student tenancy agreement?',
  },
  {
    source: 'src/app/hmo-shared-house-tenancy-agreement/page.tsx',
    phrases: ['HMO tenancy agreement template', 'clear house rules'],
    faq: 'Is this a court approved HMO tenancy agreement?',
  },
  {
    source: 'src/app/lodger-agreement/page.tsx',
    phrases: ['lodger room rental agreement template', 'notice wording'],
    faq: 'Is this a court approved lodger agreement?',
  },
] as const;

describe('product owner SEO funnel', () => {
  it('defines commercial metadata for every product owner page', () => {
    expect(PRODUCT_OWNER_METADATA_LIST).toHaveLength(10);

    for (const [key, expectedDescription] of Object.entries(expectedProductMetaDescriptions)) {
      expect(
        PRODUCT_OWNER_METADATA[key as keyof typeof PRODUCT_OWNER_METADATA].description
      ).toBe(expectedDescription);
    }

    for (const metadata of PRODUCT_OWNER_METADATA_LIST) {
      expect(metadata.title).toBeTruthy();
      expect(metadata.description.toLowerCase()).toMatch(
        /create|prepare|recover|evict|current|checked|renters' rights act/
      );
      expect(metadata.description.length).toBeGreaterThanOrEqual(125);
      expect(metadata.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('puts commercial phrase coverage and safe FAQs on every product owner page', () => {
    for (const page of pageCommercialPhraseExpectations) {
      const source = readSource(page.source);
      const faqIndex = source.indexOf(page.faq);
      const nonFaqSource = faqIndex >= 0 ? source.slice(0, faqIndex) : source;

      for (const phrase of page.phrases) {
        expect(source.toLowerCase(), `${page.source} should include ${phrase}`).toContain(
          phrase.toLowerCase()
        );
        expect(
          nonFaqSource.toLowerCase(),
          `${page.source} should include ${phrase} before the FAQ section`
        ).toContain(phrase.toLowerCase());
      }

      expect(source, page.source).toContain(page.faq);
      expect(source, page.source).toContain('Is this legally binding?');
      if (
        page.source === 'src/app/(marketing)/products/notice-only/page.tsx' ||
        page.source === 'src/app/(marketing)/products/complete-pack/page.tsx'
      ) {
        expect(source, page.source).toContain('court-approved');
      } else {
        expect(source, page.source).toContain('pre-approve');
      }
    }
  });

  it('keeps court approved wording limited to the safe FAQ context', () => {
    for (const page of pageCommercialPhraseExpectations) {
      const source = readSource(page.source);
      const matches = [...source.matchAll(/court approved/gi)];

      expect(matches.length, page.source).toBeGreaterThan(0);

      for (const match of matches) {
        const context = source.slice(Math.max(0, match.index! - 80), match.index! + 140);
        expect(context, `${page.source} should keep court approved inside FAQ wording`).toContain(
          'question:'
        );
      }
    }
  });

  it('keeps each individual product owner page to one Product schema block', () => {
    for (const page of productOwnerPages) {
      const source = readSource(page.source);
      expect(source.match(/productSchema\(/g), page.path).toHaveLength(1);
      expect(source, page.path).toContain('PRODUCT_OWNER_METADATA');
    }
  });

  it('emits Product schema with required merchant listing fields', () => {
    for (const page of productOwnerPages) {
      const product = PRODUCTS[page.sku];
      const schema = productSchema({
        name: product.label,
        description: product.description,
        price: product.price.toString(),
        url: `https://landlordheaven.co.uk${page.path}`,
      }) as any;

      expect(schema['@type'], page.path).toBe('Product');
      expect(schema.name, page.path).toBeTruthy();
      expect(schema.description, page.path).toBeTruthy();
      expect(Number.isFinite(Number(schema.offers.price)), page.path).toBe(true);
      expect(schema.offers.priceCurrency, page.path).toBe('GBP');
      expect(schema.offers.availability, page.path).toBe('https://schema.org/InStock');
      expect(String(schema.aggregateRating.ratingValue), page.path).toBe('4.8');
      expect(schema.aggregateRating.reviewCount, page.path).toBe(
        STRUCTURED_PRODUCT_REVIEW_COUNT.toString()
      );
    }
  });

  it('adds early commercial body links from high-traffic support pages', () => {
    for (const link of earlyInternalLinks) {
      const source = readSource(link.source);
      const anchorIndex = source.indexOf(link.anchor);
      const localBodyLinkWindow = source.slice(Math.max(0, anchorIndex - 250), anchorIndex + 450);

      expect(anchorIndex, link.source).toBeGreaterThanOrEqual(0);
      const hasDirectHref = localBodyLinkWindow.includes(link.href);
      const hasHrefExpression =
        'hrefExpression' in link &&
        localBodyLinkWindow.includes(String(link.hrefExpression)) &&
        source.includes(`= '${link.href}'`);

      expect(hasDirectHref || hasHrefExpression, link.source).toBe(true);
    }
  });

  it('adds the indexed samples hub and comparison pages to the sitemap', () => {
    const sitemapSource = readSource('src/app/sitemap.ts');
    const routes = [
      '/samples',
      '/compare/section-8-stage-1-vs-stage-2',
      '/compare/section-13-standard-vs-defence',
      '/compare/tenancy-agreement-options-england',
    ];

    for (const route of routes) {
      expect(sitemapSource).toContain(`path: '${route}'`);
    }

    expect(sitemapSource).toContain('productSamplePagePaths.map');
    expect(productSamplePagePaths).toHaveLength(10);

    for (const route of routes) {
      const routeFile = path.join(repoRoot, 'src/app', route.replace(/^\//, ''), 'page.tsx');
      expect(existsSync(routeFile), route).toBe(true);
    }

    expect(existsSync(path.join(repoRoot, 'src/app/samples/[slug]/page.tsx'))).toBe(true);
  });

  it('powers the samples page from all public golden packs', () => {
    const source = readSource('src/app/samples/page.tsx');

    expect(source).toContain('getGoldenPackProofData(config.packKey)');
    expect(source).toContain('productSamplePages');
    expect(source).toContain('data-testid="golden-pack-sample-card"');

    for (const page of productSamplePages) {
      expect(source).toContain('samplePath');
      expect(page.samplePath).toMatch(/^\/samples\//);
    }
  });

  it('defines all dedicated product sample pages with self-canonical metadata targets', () => {
    const dynamicPageSource = readSource('src/app/samples/[slug]/page.tsx');
    const configSource = readSource('src/lib/marketing/product-sample-pages.ts');

    expect(productSamplePages).toHaveLength(10);
    expect(dynamicPageSource).toContain('getCanonicalUrl(config.samplePath)');
    expect(dynamicPageSource).toContain('Full Sample: {config.productName}');
    expect(dynamicPageSource).toContain('&larr; Back to {config.productName}');
    expect(dynamicPageSource).toContain('<GoldenPackProof data={proof} />');
    expect(dynamicPageSource).toContain('proof.allEntries.map');
    expect(dynamicPageSource).toContain('faqPageSchema(config.faqs)');
    expect(dynamicPageSource).toContain('productSchema({');

    for (const page of productSamplePages) {
      expect(configSource).toContain(`slug: '${page.slug}'`);
      expect(configSource).toContain(`samplePath: '${page.samplePath}'`);
      expect(page.metaDescription.toLowerCase()).toContain(page.targetKeyword.toLowerCase());
      expect(page.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('links each product page to its dedicated sample page near the golden-pack preview', () => {
    const sourceByPack = new Map([
      ['notice_only', 'src/app/(marketing)/products/notice-only/page.tsx'],
      ['complete_pack', 'src/app/(marketing)/products/complete-pack/page.tsx'],
      ['money_claim', 'src/app/(marketing)/products/money-claim/page.tsx'],
      ['section13_standard', 'src/app/(marketing)/products/section-13-standard/page.tsx'],
      ['section13_defensive', 'src/app/(marketing)/products/section-13-defence/page.tsx'],
      ['england_standard_tenancy_agreement', 'src/app/standard-tenancy-agreement/page.tsx'],
      ['england_premium_tenancy_agreement', 'src/app/premium-tenancy-agreement/page.tsx'],
      ['england_student_tenancy_agreement', 'src/app/student-tenancy-agreement/page.tsx'],
      ['england_hmo_shared_house_tenancy_agreement', 'src/app/hmo-shared-house-tenancy-agreement/page.tsx'],
      ['england_lodger_agreement', 'src/app/lodger-agreement/page.tsx'],
    ]);

    for (const page of productSamplePages) {
      const sourcePath = sourceByPack.get(page.packKey);
      expect(sourcePath, page.packKey).toBeTruthy();
      const source = readSource(sourcePath!);
      expect(source).toContain(`getProductSamplePageByPackKey('${page.packKey}')`);
      expect(source).toContain('samplePageHref=');
    }
  });

  it('keeps sample PDF and thumbnail routes crawlable', () => {
    const pdfRoute = readSource('src/app/api/golden-pack-samples/[packKey]/[documentType]/route.ts');
    const embedRoute = readSource(
      'src/app/api/golden-pack-samples/[packKey]/[documentType]/embed/route.ts'
    );
    const thumbnailRoute = readSource(
      'src/app/api/golden-pack-samples/[packKey]/[documentType]/thumbnail/route.ts'
    );

    expect(pdfRoute).toContain("'X-Robots-Tag': 'index, follow'");
    expect(embedRoute).toContain("'X-Robots-Tag': 'index, follow'");
    expect(thumbnailRoute).toContain("'X-Robots-Tag': 'index, follow'");
    expect(pdfRoute).not.toContain('noindex');
    expect(embedRoute).not.toContain('noindex');
    expect(thumbnailRoute).not.toContain('noindex');
  });

  it('keeps the AST hub routing to all five tenancy product owner pages', () => {
    const source = readSource('src/app/(marketing)/products/ast/page.tsx');
    const tenancyRoutes = [
      '/standard-tenancy-agreement',
      '/premium-tenancy-agreement',
      '/student-tenancy-agreement',
      '/hmo-shared-house-tenancy-agreement',
      '/lodger-agreement',
    ];

    for (const route of tenancyRoutes) {
      expect(source).toContain(route);
    }

    expect(source).toContain('/compare/tenancy-agreement-options-england');
  });

  it('keeps the AST hub focused on post-May 2026 periodic tenancy search intent', () => {
    const source = readSource('src/app/(marketing)/products/ast/page.tsx');

    expect(source).toContain("Renters' Rights Act compliant tenancy agreement");
    expect(source).toContain('assured periodic tenancy agreement');
    expect(source).toContain('periodic tenancy agreement');
    expect(source).toContain('From 1 May 2026');
    expect(source).toContain('AST wording is legacy for new lets');
  });

  it('keeps the rent increase hub focused on broad rent increase and Section 13 intent', () => {
    const source = readSource('src/app/rent-increase/page.tsx');

    expect(source).toContain('Rent Increase Guide for England Landlords | Section 13 Form 4A');
    expect(source).toContain('how to increase rent');
    expect(source).toContain('market rent evidence');
    expect(source).toContain('tenant challenge');
    expect(source).toContain('Click to start your Section 13 rent increase pack');
    expect(source).toContain('/wizard/flow?type=rent_increase&product=section13_standard&src=product_page&topic=general');
  });

  it('keeps product funnel conversion events wired to GA4 touchpoints', () => {
    const trackedLinkSource = readSource('src/components/analytics/TrackedLink.tsx');
    const productTrackerSource = readSource('src/components/analytics/ProductPageTracker.tsx');
    const analyticsSource = readSource('src/lib/analytics.ts');
    const previewLayoutSource = readSource('src/components/preview/PreviewPageLayout.tsx');
    const dashboardSource = readSource('src/app/(app)/dashboard/cases/[id]/page.tsx');

    expect(productTrackerSource).toContain('trackProductView');
    expect(analyticsSource).toContain("trackEvent('view_item'");
    expect(trackedLinkSource).toContain('trackAddToCart');
    expect(trackedLinkSource).toContain("href.includes('/wizard')");
    expect(previewLayoutSource).toContain('trackBeginCheckout');
    expect(dashboardSource).toContain('trackPurchase');
  });
});
