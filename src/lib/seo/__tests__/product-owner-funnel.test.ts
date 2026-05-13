import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { PRODUCTS, type ProductSku } from '@/lib/pricing/products';
import { productSamplePages, productSamplePagePaths } from '@/lib/marketing/product-sample-pages';
import { PRODUCT_OWNER_METADATA_LIST } from '@/lib/seo/product-owner-metadata';
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
    source: 'src/app/how-to-rent-guide/page.tsx',
    href: '/standard-tenancy-agreement',
    anchor: 'download a solicitor-approved tenancy agreement',
  },
  {
    source: 'src/app/rent-increase/RentIncreaseGuidePage.tsx',
    href: '/products/section-13-standard',
    anchor: 'serve your Form 4A notice instantly',
  },
  {
    source: 'src/app/tools/hmo-license-checker/page.tsx',
    href: '/hmo-shared-house-tenancy-agreement',
    anchor: 'get your HMO-compliant tenancy agreement',
  },
  {
    source: 'src/lib/blog/posts.tsx',
    href: '/products/notice-only',
    anchor: 'start your Section 8 eviction with the official Form 3A',
  },
  {
    source: 'src/app/tools/rent-arrears-calculator/page.tsx',
    href: '/products/money-claim',
    anchor: 'recover rent arrears via Money Claim Online',
  },
  {
    source: 'src/app/rent-arrears-letter-template/page.tsx',
    href: '/products/money-claim',
    hrefExpression: 'moneyClaimProductHref',
    anchor: 'escalate to a formal money claim with our court pack',
  },
  {
    source: 'src/app/assured-periodic-tenancy-agreement/page.tsx',
    href: '/standard-tenancy-agreement',
    anchor: 'Buy the full periodic tenancy agreement with prescribed information',
  },
];

describe('product owner SEO funnel', () => {
  it('defines commercial metadata for every product owner page', () => {
    expect(PRODUCT_OWNER_METADATA_LIST).toHaveLength(10);

    for (const metadata of PRODUCT_OWNER_METADATA_LIST) {
      expect(metadata.title).toBeTruthy();
      expect(metadata.description).toContain('solicitor-approved');
      expect(metadata.description).toContain('4.8/5');
      expect(metadata.description.length).toBeGreaterThanOrEqual(115);
      expect(metadata.description.length).toBeLessThanOrEqual(155);
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
        description: `Solicitor-approved ${product.description}`,
        price: product.price.toString(),
        url: `https://landlordheaven.co.uk${page.path}`,
      }) as any;

      expect(schema['@type'], page.path).toBe('Product');
      expect(schema.name, page.path).toBeTruthy();
      expect(schema.description, page.path).toContain('Solicitor-approved');
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
