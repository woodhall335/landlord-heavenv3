import fs from 'fs';
import path from 'path';

const FILES_TO_CHECK = [
  'src/app/(app)/wizard/WizardClientPage.tsx',
  'src/app/(marketing)/about/page.tsx',
  'src/app/(marketing)/blog/page.tsx',
  'src/app/(marketing)/help/page.tsx',
  'src/app/(marketing)/pricing/page.tsx',
  'src/app/products/ast/page.tsx',
  'src/app/products/complete-pack/page.tsx',
  'src/app/products/money-claim/page.tsx',
  'src/app/products/notice-only/page.tsx',
  'src/app/products/section-13-standard/page.tsx',
  'src/components/landing/heroConfigs.tsx',
  'src/components/landing/HomeContent.tsx',
  'src/components/landing/heroConfigs.tsx',
  'src/components/ask-heaven/NextBestActionCard.tsx',
  'src/components/marketing/CommercialBridge.tsx',
  'src/components/seo/CommercialSeoNextStep.tsx',
  'src/lib/blog/product-cta-map.ts',
  'src/lib/blog/next-steps-cta.ts',
  'src/lib/ask-heaven/cta-copy.ts',
  'src/lib/ask-heaven/questions/linking.ts',
  'src/lib/tools/tools.ts',
  'src/lib/marketing/funnelProcessSection.ts',
  'src/lib/marketing/product-sample-pages.ts',
  'src/lib/marketing/section13-products.ts',
  'src/lib/public-products.ts',
  'src/lib/seo/product-owner-metadata.ts',
  'src/app/products/notice-only/page.tsx',
  'src/app/products/complete-pack/page.tsx',
  'src/app/products/money-claim/page.tsx',
  'src/app/products/section-13-standard/page.tsx',
  'src/app/products/section-13-defence/page.tsx',
  'src/app/standard-tenancy-agreement/page.tsx',
  'src/app/premium-tenancy-agreement/page.tsx',
  'src/app/student-tenancy-agreement/page.tsx',
  'src/app/hmo-shared-house-tenancy-agreement/page.tsx',
  'src/app/lodger-agreement/page.tsx',
  'src/app/tenant-not-paying-rent/page.tsx',
  'src/app/tenant-stopped-paying-rent/page.tsx',
  'src/app/tenant-left-without-paying-rent/page.tsx',
  'src/app/tenant-wont-leave/page.tsx',
  'src/app/warrant-of-possession-guide/page.tsx',
  'src/app/warrant-of-possession/page.tsx',
  'src/app/rent-increase/RentIncreaseGuidePage.tsx',
  'src/app/wales-tenancy-agreement-template/page.tsx',
  'src/app/wales-eviction-notices/page.tsx',
  'src/app/tools/rent-arrears-calculator/page.tsx',
  'src/app/tools/hmo-license-checker/page.tsx',
];

const BANNED_PHRASES = [
  'Start the right landlord workflow for your property in England',
  'straight into the guided workflow',
  'The public site is written for landlords',
  'Public product scope:',
  'Prepare the England court-possession route',
  'document-generation and workflow product',
  'England route guides',
  'Choose the route that matches the problem',
  'Start with the route you actually need',
  'current framework',
  'clearer chooser',
  'Used during your generated case pack workflow.',
  'Money Claim Workflow',
  'Current England route -> N5 + N119',
  'Go to eviction notice route',
  'Go to complete eviction route',
  'Go to money claim route',
  'Open Eviction Notice Generator',
  'Start the Eviction Notice Generator',
  'Start the Complete Eviction Pack',
  'Start the Money Claim Pack',
  'Start your court pack',
  'Start England Notice Wizard',
  'Start Agreement Wizard',
  'Start money claim pack',
  'Start money claim',
  'Start Section 8 notice',
  'Start Notice Only',
  'Start Complete Pack',
  'Start Complete Eviction Pack',
  'Start Standard Setup Pack',
  'Start Premium Management Pack',
  'Start Student Tenancy Agreement',
  'Start HMO Management Pack',
  'Start Room Let Pack',
  'Generate a Current England Notice',
  'Generate a Section 173 Notice',
  'Generate a Notice to Leave',
  'Get the Complete Eviction Pack',
  'Start a Money Claim',
  'validated',
  'court-ready',
  'Generate notice pack',
];

const SITEWIDE_INTERNAL_PHRASES = [
  'high-intent search',
  'high-intent visitor',
  'search-intent page',
  'keyword demand',
  'search demand still exists',
  'preserves rankings',
  'commercial handoff',
  'strongest commercial route',
  'transactional paths stay downstream',
  'rank highest in a search result',
  'landlord SEO content',
  'the commercial goal is',
  'product journey',
  'agreement journey',
  'route landscape',
  'broad head terms',
];

const retiredRoutes = new Set<string>(
  Object.keys(
    JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'config/retired-public-routes.json'), 'utf-8')
    ).routeRedirects
  )
);

function collectPageFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectPageFiles(absolute);
    return entry.name === 'page.tsx' ? [absolute] : [];
  });
}

function publicRouteForPage(file: string): string | null {
  const relative = path.relative(path.join(process.cwd(), 'src/app'), file).replaceAll('\\', '/');
  const segments = relative
    .replace(/\/page\.tsx$/, '')
    .split('/')
    .filter((segment) => !/^\(.+\)$/.test(segment));

  if (segments.some((segment) => segment.startsWith('['))) return null;
  if (segments[0] === 'api' || segments[0] === 'dashboard' || segments[0] === 'wizard') return null;
  return segments.length ? `/${segments.join('/')}` : '/';
}

const REACHABLE_STATIC_PAGE_FILES = collectPageFiles(path.join(process.cwd(), 'src/app'))
  .filter((file) => {
    const route = publicRouteForPage(file);
    return route !== null && !retiredRoutes.has(route);
  })
  .map((file) => path.relative(process.cwd(), file).replaceAll('\\', '/'));

describe('Public language sweep regression', () => {
  it('keeps core public pages free of internal or awkward marketing phrasing', () => {
    const contents = [...new Set(FILES_TO_CHECK)].map((file) => ({
      file,
      text: fs.readFileSync(path.join(process.cwd(), file), 'utf-8'),
    }));

    const violations: string[] = [];

    for (const { file, text } of contents) {
      for (const phrase of BANNED_PHRASES) {
        if (text.includes(phrase)) {
          violations.push(`${file}: ${phrase}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('keeps every reachable static page free of internal SEO and funnel terminology', () => {
    const violations: string[] = [];

    for (const file of REACHABLE_STATIC_PAGE_FILES) {
      const text = fs.readFileSync(path.join(process.cwd(), file), 'utf-8').toLowerCase();
      for (const phrase of SITEWIDE_INTERNAL_PHRASES) {
        if (text.includes(phrase.toLowerCase())) violations.push(`${file}: ${phrase}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('does not present the expired Section 21 deadlines as future on reachable pages', () => {
    const staleLegalPhrases = [
      /Section 21 is due to end/i,
      /Section 21 ends 1 May 2026/i,
      /Section 21 is being (?:abolished|phased out)/i,
      /only \d+ days left to serve Section 21/i,
      /last chance to serve a Section 21/i,
      /you can serve a Section 21/i,
    ];
    const violations: string[] = [];

    for (const file of REACHABLE_STATIC_PAGE_FILES) {
      const text = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
      for (const phrase of staleLegalPhrases) {
        if (phrase.test(text)) violations.push(`${file}: ${phrase.source}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('keeps the updated landlord-facing replacements in the core public pages', () => {
    const wizard = fs.readFileSync(
      path.join(process.cwd(), 'src/app/(app)/wizard/WizardClientPage.tsx'),
      'utf-8'
    );
    const noticeOnly = fs.readFileSync(
      path.join(process.cwd(), 'src/app/products/notice-only/page.tsx'),
      'utf-8'
    );
    const completePack = fs.readFileSync(
      path.join(process.cwd(), 'src/app/products/complete-pack/page.tsx'),
      'utf-8'
    );
    const astHub = fs.readFileSync(
      path.join(process.cwd(), 'src/app/products/ast/page.tsx'),
      'utf-8'
    );

    expect(wizard).toContain('Choose the landlord product you need');
    expect(wizard).toContain('Choose the product that matches the job in front of you');
    expect(noticeOnly).toContain("getPublicProductDescriptor('notice_only')");
    expect(fs.readFileSync(path.join(process.cwd(), 'src/lib/public-products.ts'), 'utf-8')).toContain(
      'Create and preview my Form 3A'
    );
    expect(completePack).toContain('Prepare my court pack');
    expect(astHub).toContain('Start with the agreement that fits the let');
    expect(fs.readFileSync(path.join(process.cwd(), 'src/components/landing/HomeContent.tsx'), 'utf-8')).toContain('Prepare my court papers');
    expect(fs.readFileSync(path.join(process.cwd(), 'src/lib/blog/product-cta-map.ts'), 'utf-8')).toContain('Prepare my money claim');
  });
});
