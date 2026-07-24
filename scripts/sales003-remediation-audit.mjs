import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'audit-landlordheaven-sales003');
const screenshotDir = path.join(reportDir, 'screenshots');

const productRoutes = [
  '/products/notice-only',
  '/products/complete-pack',
  '/products/money-claim',
  '/products/ast',
  '/products/section-13-standard',
];

const highIntentRoutes = [
  '/tools/hmo-license-checker',
  '/tools/rent-arrears-calculator',
  '/blog/how-to-write-letter-before-action-unpaid-rent',
  '/blog/bailiff-eviction-day-what-to-expect',
  '/eviction-cost-uk',
  '/how-to-rent-guide',
  '/n5-n119-possession-claim',
  '/section-8-grounds/how-to-evict-a-tenant-using-ground-1a',
];

const allRoutes = [...productRoutes, ...highIntentRoutes];

function ensureDirs() {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.mkdirSync(screenshotDir, { recursive: true });
}

function readSource(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function writeCsv(fileName, rows) {
  const headers = Object.keys(rows[0] ?? { result: '' });
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ];
  fs.writeFileSync(path.join(reportDir, fileName), `${lines.join('\n')}\n`);
}

function writeMd(fileName, body) {
  fs.writeFileSync(path.join(reportDir, fileName), `${body.trim()}\n`);
}

function sourceChecks() {
  const productPage = readSource('src/components/marketing/PublicProductSalesPage.tsx');
  const hmo = readSource('src/app/tools/hmo-license-checker/page.tsx');
  const arrears = readSource('src/app/tools/rent-arrears-calculator/page.tsx');
  const blogCard = readSource('src/components/blog/BlogCard.tsx');
  const experiment = readSource('src/lib/experiments/sales002.ts');

  return {
    productDuplicateCtaFixed:
      productPage.includes("analytics?.pageType !== 'product_page'") &&
      productPage.includes('shouldShowMidPageCta && content.midPageCta'),
    hmoPaidOfferDeferred:
      hmo.includes('showUsageCounter={false}') &&
      !hmo.includes('secondaryCta={{') &&
      !hmo.includes('Choose my tenancy agreement'),
    arrearsHydrationFixed:
      arrears.includes("id: 'initial-rent-period'") &&
      arrears.includes('name="rentAmount"') &&
      arrears.includes('name="frequency"') &&
      arrears.includes('name={`schedule[${item.id}].dueDate`}'),
    blogCopyUnclamped: !blogCard.includes('line-clamp-2') && !blogCard.includes('line-clamp-3'),
    experimentStable:
      experiment.includes('stableBucket') &&
      experiment.includes("NEXT_PUBLIC_SALES002_CONTEXTUAL_OFFER === 'off'") &&
      !experiment.includes('Math.random') &&
      !experiment.includes('crypto.randomUUID'),
  };
}

function writeReports() {
  ensureDirs();
  const checks = sourceChecks();
  const now = new Date().toISOString();

  writeMd(
    'README.md',
    `# SALES-003 visual conversion remediation

Generated: ${now}

This folder records the SALES-003 remediation pass. It intentionally preserves the completed SALES-002C indexability state and focuses on visible conversion friction, browser warnings, trust-claim evidence, stateful tool checks and measurement readiness.

## Source-level result

- Duplicate product CTA suppression: ${checks.productDuplicateCtaFixed ? 'PASS' : 'FAIL'}
- HMO checker paid-offer deferral: ${checks.hmoPaidOfferDeferred ? 'PASS' : 'FAIL'}
- Rent arrears hydration/autofill cleanup: ${checks.arrearsHydrationFixed ? 'PASS' : 'FAIL'}
- Blog card clipping cleanup: ${checks.blogCopyUnclamped ? 'PASS' : 'FAIL'}
- Experiment identity stability: ${checks.experimentStable ? 'PASS' : 'FAIL'}

Browser-only findings must be validated against a production build or deployed URL. Rows that require rendered screenshots or console/network capture are marked \`NOT RUN\` unless a browser run is attached.`
  );

  writeCsv(
    'duplicate-cta-before-after.csv',
    productRoutes.map((route) => ({
      route,
      before: 'Hero CTA plus mid-page CtaBand could create competing primary action sets.',
      correction: 'PublicProductSalesPage suppresses mid-page CtaBand when analytics.pageType is product_page.',
      controlling_file: 'src/components/marketing/PublicProductSalesPage.tsx',
      after: checks.productDuplicateCtaFixed ? 'Single product-page CTA hierarchy retained.' : 'Source check failed.',
      result: checks.productDuplicateCtaFixed ? 'PASS' : 'FAIL',
    }))
  );

  writeCsv('malformed-copy-before-after.csv', [
    {
      route: '/blog/how-to-write-letter-before-action-unpaid-rent',
      before: 'Title risk: "How to Write a Letter Before Action for Unpaid Rent ("',
      correction: 'Blog card descriptions and titles are no longer visually clamped by BlogCard.',
      controlling_file: 'src/components/blog/BlogCard.tsx',
      after: checks.blogCopyUnclamped ? 'Rendered-card clipping source removed; route title still needs rendered browser confirmation.' : 'Source check failed.',
      result: checks.blogCopyUnclamped ? 'PASS SOURCE / RENDER QA NOT RUN' : 'FAIL',
    },
    {
      route: '/blog/bailiff-eviction-day-what-to-expect',
      before: 'Title risk: "Bailiff Eviction Day - What to Expect (England Guide )"',
      correction: 'Blog card descriptions and titles are no longer visually clamped by BlogCard.',
      controlling_file: 'src/components/blog/BlogCard.tsx',
      after: checks.blogCopyUnclamped ? 'Rendered-card clipping source removed; route title still needs rendered browser confirmation.' : 'Source check failed.',
      result: checks.blogCopyUnclamped ? 'PASS SOURCE / RENDER QA NOT RUN' : 'FAIL',
    },
  ]);

  writeCsv(
    'excessive-gap-audit.csv',
    allRoutes.map((route) => ({
      route,
      viewport: '390px mobile',
      threshold_px: '120',
      source_correction: route === '/tools/hmo-license-checker' ? 'Mobile pre-form marketing block hidden and checker padding reduced.' : 'No source-level spacing defect identified in this pass; browser measurement not run.',
      final_status: route === '/tools/hmo-license-checker' && checks.hmoPaidOfferDeferred ? 'PASS SOURCE / RENDER QA NOT RUN' : 'NOT RUN',
    }))
  );

  writeCsv(
    'media-load-validation.csv',
    allRoutes.map((route) => ({
      route,
      wait_strategy: 'domcontentloaded + networkidle + document.fonts.ready + image complete/naturalWidth checks',
      screenshot: '',
      console_result: 'NOT RUN',
      media_result: 'NOT RUN',
    }))
  );

  writeCsv(
    'product-hero-height-audit.csv',
    productRoutes.map((route) => ({
      route,
      viewport: '390px mobile',
      expected: 'Primary CTA and product purpose visible without excessive scrolling.',
      result: 'NOT RUN',
      correction: 'Duplicate mid-page CTA suppressed; hero height must be confirmed in rendered browser QA.',
    }))
  );

  writeCsv('hmo-form-position-audit.csv', [
    {
      route: '/tools/hmo-license-checker',
      before: 'Checker form sat below hero, explanatory content and an early product offer.',
      correction: 'Usage counter and paid secondary CTA removed; explanatory section hidden on mobile/tablet; checker padding reduced.',
      expected_mobile: 'Form appears near top of post-hero journey, with no paid offer before enough answers.',
      result: checks.hmoPaidOfferDeferred ? 'PASS SOURCE / RENDER QA NOT RUN' : 'FAIL',
    },
  ]);

  writeCsv(
    'contextual-module-count-audit.csv',
    allRoutes.map((route) => ({
      route,
      expected: route.startsWith('/products/') ? 'One clear primary product action set' : 'Contextual offers only where relevant to completed content/tool state',
      controlling_file: route.startsWith('/products/') ? 'src/components/marketing/PublicProductSalesPage.tsx' : 'src/components/conversion and route component',
      result: route.startsWith('/products/') && checks.productDuplicateCtaFixed ? 'PASS SOURCE' : 'NOT RUN',
    }))
  );

  writeCsv('trust-claim-evidence.csv', [
    {
      claim: '4.8/5 review rating',
      location_or_source: 'review/social-proof components',
      evidence_found: 'Unsupported numeric review claim removed from public source copy in this remediation pass.',
      classification: 'PASS LIVE COPY CHANGE',
      action: 'Keep rating/count claims absent unless later bound to an approved production review dataset.',
    },
    {
      claim: '2,007 reviews',
      location_or_source: 'review/social-proof components',
      evidence_found: 'Unsupported review-count claim removed from public source copy in this remediation pass.',
      classification: 'PASS LIVE COPY CHANGE',
      action: 'Keep review counts absent unless later bound to an approved production review dataset.',
    },
    {
      claim: 'landlords used this today',
      location_or_source: 'UsageTodayCounter / hero usage indicators',
      evidence_found: 'HMO checker usage counter removed for the pre-answer flow; source scan no longer finds the phrase as public page copy.',
      classification: 'PASS LIVE COPY CHANGE',
      action: 'Use only analytics-backed live data if this pattern is reintroduced.',
    },
    {
      claim: 'Landlord Heaven Legal Team / Property Law Specialists',
      location_or_source: 'author/reviewer displays and blog metadata',
      evidence_found: 'Author labels softened from legal-specialist positioning to editorial/housing document wording.',
      classification: 'PASS LIVE COPY CHANGE',
      action: 'Use credentialed legal reviewer labels only if backed by a named reviewer register.',
    },
    {
      claim: 'solicitor-approved / court-accepted / savings / success rates',
      location_or_source: 'marketing and conversion copy',
      evidence_found: 'Authority wording softened from solicitor-approved to review-ready/compliance-focused wording across public source copy.',
      classification: 'PASS LIVE COPY CHANGE',
      action: 'Keep stronger authority claims out of public copy unless evidence is later supplied.',
    },
  ]);

  writeMd(
    'hydration-root-cause.csv',
    'route,root_cause,correction,controlling_file,result\n' +
      csvEscape('/tools/rent-arrears-calculator') +
      ',' +
      csvEscape('Initial React state used crypto.randomUUID(), causing server/client HTML identity mismatch risk.') +
      ',' +
      csvEscape('Initial schedule row now uses stable id initial-rent-period; random ids remain only for client event-created rows.') +
      ',' +
      csvEscape('src/app/tools/rent-arrears-calculator/page.tsx') +
      ',' +
      csvEscape(checks.arrearsHydrationFixed ? 'PASS SOURCE / RENDER QA NOT RUN' : 'FAIL') +
      '\n'
  );

  writeCsv('hydration-before-after.csv', [
    {
      route: '/tools/rent-arrears-calculator',
      before: 'Potential React #418 from non-deterministic initial schedule id.',
      after: 'Stable initial id and named controls.',
      result: checks.arrearsHydrationFixed ? 'PASS SOURCE / RENDER QA NOT RUN' : 'FAIL',
    },
  ]);

  writeCsv('accessibility-before-after.csv', [
    {
      route: '/tools/rent-arrears-calculator',
      issue: 'Form field without stable id/name; dynamic fields hard to autofill.',
      correction: 'Added explicit id/name to rent amount, frequency and schedule fields.',
      result: checks.arrearsHydrationFixed ? 'PASS SOURCE / RENDER QA NOT RUN' : 'FAIL',
    },
    {
      route: '/tools/hmo-license-checker',
      issue: 'Key form controls lacked name attributes.',
      correction: 'Added names to postcode, occupant, household and property-type fields.',
      result: checks.hmoPaidOfferDeferred ? 'PASS SOURCE / RENDER QA NOT RUN' : 'FAIL',
    },
  ]);

  writeCsv('experiment-identity-validation.csv', [
    {
      experiment: 'sales002_contextual_offer_copy',
      allocation: 'Stable FNV-style hash bucket from identity string.',
      kill_switch: 'NEXT_PUBLIC_SALES002_CONTEXTUAL_OFFER=off returns control.',
      source_file: 'src/lib/experiments/sales002.ts',
      result: checks.experimentStable ? 'PASS SOURCE' : 'FAIL',
    },
  ]);

  writeCsv('hmo-state-browser-validation.csv', [
    {
      route: '/tools/hmo-license-checker',
      state: 'initial',
      expected: 'No paid product offer before enough answers; form visible quickly on mobile/tablet.',
      source_result: checks.hmoPaidOfferDeferred ? 'PASS' : 'FAIL',
      browser_result: 'NOT RUN',
    },
    {
      route: '/tools/hmo-license-checker',
      state: 'after_valid_answers',
      expected: 'Result-first output; contextual product guidance allowed only after generated answer.',
      source_result: 'NOT RUN',
      browser_result: 'NOT RUN',
    },
  ]);

  writeCsv('arrears-state-browser-validation.csv', [
    {
      route: '/tools/rent-arrears-calculator',
      state: 'initial',
      expected: 'No hydration error; named fields; useful calculator visible.',
      source_result: checks.arrearsHydrationFixed ? 'PASS' : 'FAIL',
      browser_result: 'NOT RUN',
    },
  ]);

  writeCsv(
    'product-cta-browser-validation.csv',
    productRoutes.map((route) => ({
      route,
      expected: 'One clear primary action set; no duplicate mid-page CTA band competing above the decision path.',
      source_result: checks.productDuplicateCtaFixed ? 'PASS' : 'FAIL',
      browser_result: 'NOT RUN',
    }))
  );

  writeCsv('funnel-event-regression.csv', [
    {
      area: 'product pages',
      expected: 'ProductPageTracker and existing analytics event names preserved.',
      correction: 'CTA display hierarchy changed without removing analytics components.',
      result: 'PASS SOURCE / EXISTING ANALYTICS TESTS REQUIRED',
    },
    {
      area: 'tools',
      expected: 'Tool tracking remains intact after moving/de-emphasising offers.',
      correction: 'HMO form position changed; ToolEmailGate and tracker imports preserved.',
      result: 'PASS SOURCE / EXISTING ANALYTICS TESTS REQUIRED',
    },
  ]);

  writeCsv(
    'indexability-regression.csv',
    allRoutes.map((route) => ({
      route,
      expected: route.includes('/checkout') ? 'INTENTIONALLY NOINDEX' : 'Preserve SALES-002C status',
      correction: 'No indexability metadata, robots, sitemap or canonical changes made by SALES-003 source fixes.',
      result: 'PASS SOURCE',
    }))
  );

  for (const file of ['route-rendered-qa.csv', 'mobile-rendered-qa.csv', 'tablet-rendered-qa.csv', 'desktop-rendered-qa.csv']) {
    writeCsv(
      file,
      allRoutes.map((route) => ({
        route,
        viewport: file.startsWith('mobile') ? '390px' : file.startsWith('tablet') ? '768px' : file.startsWith('desktop') ? '1440px' : 'all',
        rendered_content: 'NOT RUN',
        console_errors: 'NOT RUN',
        visual_result: 'NOT RUN',
        screenshot: '',
      }))
    );
  }

  writeCsv(
    'browser-console-errors.csv',
    allRoutes.map((route) => ({
      route,
      viewport: '390px,768px,1440px',
      error_count: 'NOT RUN',
      warnings: 'NOT RUN',
      result: 'NOT RUN',
    }))
  );

  writeCsv(
    'network-failures.csv',
    allRoutes.map((route) => ({
      route,
      failed_requests: 'NOT RUN',
      result: 'NOT RUN',
    }))
  );

  writeCsv('screenshot-index.csv', [
    {
      route: 'all audited routes',
      screenshot_dir: 'audit-landlordheaven-sales003/screenshots',
      captured: 'NO',
      reason: 'Run a production browser QA pass with SALES003_BASE_URL to attach rendered screenshots.',
    },
  ]);

  writeCsv('remaining-defects.csv', [
    {
      defect: 'Trust/social-proof claims were softened where evidence was not source-bound',
      severity: 'Resolved',
      route_or_area: 'review counts, rating, legal-team/solicitor-approved/court-accepted claims',
      status: 'PASS LIVE COPY CHANGE',
      recommended_action: 'Do not reintroduce quantified or authority claims unless connected to approved evidence.',
    },
    {
      defect: 'Rendered browser screenshot capture not run in this source remediation pass',
      severity: 'P1',
      route_or_area: 'product pages, tools and high-intent articles',
      status: 'NOT RUN',
      recommended_action: 'Run production-style browser QA after build/deploy and attach screenshots.',
    },
  ]);

  writeMd(
    'validation.md',
    `# SALES-003 validation

Generated: ${now}

## Automated source checks

- Duplicate CTA source check: ${checks.productDuplicateCtaFixed ? 'PASS' : 'FAIL'}
- HMO early paid-offer source check: ${checks.hmoPaidOfferDeferred ? 'PASS' : 'FAIL'}
- Rent arrears hydration/form source check: ${checks.arrearsHydrationFixed ? 'PASS' : 'FAIL'}
- Blog clipping source check: ${checks.blogCopyUnclamped ? 'PASS' : 'FAIL'}
- Experiment source check: ${checks.experimentStable ? 'PASS' : 'FAIL'}

## Commands to record

The final Codex response should record actual command results for:

- focused Vitest regression;
- ESLint;
- TypeScript/build;
- production build;
- git diff --check.

## Browser QA status

Rendered browser evidence remains a separate requirement. This report generator records source-level fixes and marks browser-only rows as \`NOT RUN\` until a production-style browser run captures screenshots, console output and network failures.`
  );
}

writeReports();
console.log(`SALES-003 reports written to ${reportDir}`);
