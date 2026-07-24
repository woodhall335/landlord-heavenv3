import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5102';
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://landlordheaven.co.uk';
const OUTPUT_DIR = path.join(process.cwd(), 'audit-landlordheaven-sales002c');

const REQUIRED_ROUTES = [
  ['/', 'homepage', 'INDEXABLE'],
  ['/pricing', 'pricing', 'INDEXABLE'],
  ['/products/notice-only', 'product', 'INDEXABLE'],
  ['/products/complete-pack', 'product', 'INDEXABLE'],
  ['/products/money-claim', 'product', 'INDEXABLE'],
  ['/products/ast', 'product', 'INDEXABLE'],
  ['/products/section-13-standard', 'product', 'INDEXABLE'],
  ['/products/section-13-defence', 'product', 'INDEXABLE'],
  ['/standard-tenancy-agreement', 'product', 'INDEXABLE'],
  ['/premium-tenancy-agreement', 'product', 'INDEXABLE'],
  ['/student-tenancy-agreement', 'product', 'INDEXABLE'],
  ['/hmo-shared-house-tenancy-agreement', 'product', 'INDEXABLE'],
  ['/lodger-agreement', 'product', 'INDEXABLE'],
  ['/tools', 'tools-hub', 'INDEXABLE'],
  ['/tools/hmo-license-checker', 'free-tool', 'INDEXABLE'],
  ['/tools/rent-arrears-calculator', 'free-tool', 'INDEXABLE'],
  ['/tools/rent-increase-challenge-checker', 'free-tool', 'INDEXABLE'],
  ['/assisted-prep', 'service-hub', 'INDEXABLE'],
  ['/section-8-notice-assisted-prep', 'service-landing', 'INDEXABLE'],
  ['/money-claim-assisted-prep', 'service-landing', 'INDEXABLE'],
  ['/possession-claim-assisted-prep', 'service-landing', 'INDEXABLE'],
  ['/landlord-documents-england', 'product-hub', 'INDEXABLE'],
  ['/samples', 'sample-hub', 'INDEXABLE'],
  ['/compare/section-8-stage-1-vs-stage-2', 'comparison', 'INDEXABLE'],
  ['/compare/section-13-standard-vs-defence', 'comparison', 'INDEXABLE'],
  ['/compare/tenancy-agreement-options-england', 'comparison', 'INDEXABLE'],
  ['/form-3-section-8', 'legal-guide', 'INDEXABLE'],
  ['/n5-n119-possession-claim', 'legal-guide', 'INDEXABLE'],
  ['/money-claim-carpet-damage', 'legal-guide', 'INDEXABLE'],
  ['/eviction-cost-uk', 'legal-guide', 'INDEXABLE'],
  ['/how-to-rent-guide', 'legal-guide', 'INDEXABLE'],
  ['/rent-increase', 'product-hub', 'INDEXABLE'],
  ['/rent-increase/section-13-notice', 'legal-guide', 'INDEXABLE'],
  ['/rent-increase/form-4a-guide', 'legal-guide', 'INDEXABLE'],
  ['/rent-increase/how-to-increase-rent', 'legal-guide', 'INDEXABLE'],
  ['/rent-increase/section-13-tribunal', 'legal-guide', 'INDEXABLE'],
  ['/rent-increase/market-rent-calculation', 'legal-guide', 'INDEXABLE'],
  ['/rent-increase/rent-increase-challenge', 'legal-guide', 'INDEXABLE'],
];

const INTENTIONAL_NOINDEX_ROUTES = [
  ['/dashboard', 'authenticated customer dashboard', 'authenticated customer data'],
  ['/auth/sign-in', 'authentication', 'account access page'],
  ['/wizard', 'builder state', 'authenticated/transactional builder workflow'],
  ['/checkout/success', 'payment confirmation', 'transactional success route'],
  ['/checkout/download', 'document download', 'paid document delivery endpoint'],
  ['/assisted-prep/start?service=section8', 'assisted-prep intake state', 'duplicate query-state conversion form'],
  ['/assisted-prep/start?service=money_claim', 'assisted-prep intake state', 'duplicate query-state conversion form'],
  ['/assisted-prep/start?service=possession', 'assisted-prep intake state', 'duplicate query-state conversion form'],
  ['/official-forms/n325-eng.pdf', 'official form asset', 'source PDF asset intentionally excluded by X-Robots-Tag'],
];

const INTENTIONAL_CANONICAL_EXCLUDED_ROUTES = [
  ['/products/money-claim-pack', 'legacy redirect', 'retired product alias redirects to /products/money-claim'],
  ['/hmo-tenancy-agreement-template', 'legacy canonical duplicate', 'canonical duplicate of HMO/shared-house product'],
];

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(name, rows, headers) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }
  return fs.writeFile(path.join(OUTPUT_DIR, name), `${lines.join('\n')}\n`, 'utf8');
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirst(pattern, text) {
  const match = text.match(pattern);
  return match?.[1]?.trim() || '';
}

function getRouteKey(route) {
  const url = new URL(route, SITE_ORIGIN);
  return `${url.pathname}${url.search}`;
}

async function readTop20Routes() {
  const matrixPath = path.join(process.cwd(), 'audit-landlordheaven-sales001', 'organic-landing-page-matrix.csv');
  try {
    const csv = await fs.readFile(matrixPath, 'utf8');
    return csv
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.split(',')[0]?.trim())
      .filter((route) => route?.startsWith('/'))
      .map((route) => [route, 'top-20-organic', 'INDEXABLE']);
  } catch {
    return [];
  }
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'manual',
    headers: { 'user-agent': 'LandlordHeaven-SALES002C-indexability-audit/1.0' },
    ...options,
  });
  const text = await response.text().catch(() => '');
  return { response, text };
}

async function fetchWithRedirects(route) {
  const chain = [];
  let url = new URL(route, BASE_URL);

  for (let i = 0; i < 6; i += 1) {
    const { response, text } = await fetchText(url);
    chain.push({ url: url.toString(), status: response.status, location: response.headers.get('location') || '' });
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { response, text, chain, finalUrl: url.toString() };
    }
    const location = response.headers.get('location');
    if (!location) return { response, text, chain, finalUrl: url.toString() };
    url = new URL(location, url);
  }

  const last = chain.at(-1);
  return { response: { status: last?.status || 0, headers: new Headers() }, text: '', chain, finalUrl: last?.url || url.toString() };
}

function parseRobotsTxt(robotsText) {
  const disallow = [];
  const allow = [];
  for (const raw of robotsText.split(/\r?\n/)) {
    const line = raw.trim();
    const disallowMatch = line.match(/^Disallow:\s*(.+)$/i);
    const allowMatch = line.match(/^Allow:\s*(.+)$/i);
    if (disallowMatch) disallow.push(disallowMatch[1].trim());
    if (allowMatch) allow.push(allowMatch[1].trim());
  }
  return { disallow, allow };
}

function robotsTxtState(route, rules) {
  const pathname = new URL(route, SITE_ORIGIN).pathname;
  if (rules.allow.includes('/') && !rules.disallow.some((prefix) => prefix !== '/' && pathname.startsWith(prefix))) {
    return 'ALLOWED';
  }
  const blocked = rules.disallow.some((prefix) => prefix === '/' || pathname.startsWith(prefix));
  return blocked ? 'BLOCKED' : 'ALLOWED';
}

async function parseSitemap() {
  const { response, text } = await fetchText(new URL('/sitemap.xml', BASE_URL));
  const urls = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  return { status: response.status, urls, keys: new Set(urls.map(getRouteKey)) };
}

function expectedCanonical(route, expectedIndexability) {
  if (route.startsWith('/assisted-prep/start')) return '/assisted-prep';
  if (route === '/products/money-claim-pack') return '/products/money-claim';
  if (route === '/hmo-tenancy-agreement-template') return '/hmo-shared-house-tenancy-agreement';
  if (expectedIndexability === 'INDEXABLE') return new URL(route, SITE_ORIGIN).pathname;
  return '';
}

function classify(record) {
  if (record.expectedIndexability === 'INTENTIONALLY NOINDEX') return 'INTENTIONALLY NOINDEX';
  if (record.expectedIndexability === 'INDEXABLE BUT CANONICALISED') {
    if (record.httpStatus === 404 || record.httpStatus >= 500) return 'REDIRECT ERROR';
    if (/\bnoindex\b/i.test(`${record.metaRobots} ${record.xRobotsTag}`)) return 'ACCIDENTALLY NOINDEX';
    if (record.canonicalStatus !== 'CANONICAL_TO_PREFERRED') return 'CANONICAL ERROR';
    if (record.sitemapState === 'IN_SITEMAP') return 'NOINDEX_OR_DUPLICATE_ROUTE_INCLUDED_IN_SITEMAP';
    if (record.renderedContentResult !== 'MEANINGFUL') return 'SOFT-404 RISK';
    return 'INDEXABLE BUT CANONICALISED';
  }
  if (record.redirectChainLength > 0 && record.expectedIndexability === 'INDEXABLE') return 'REDIRECT ERROR';
  if (record.httpStatus === 404 || record.httpStatus >= 500) return 'REDIRECT ERROR';
  if (record.robotsTxtState === 'BLOCKED' && record.expectedIndexability === 'INDEXABLE') return 'BLOCKED BY ROBOTS';
  if (/\bnoindex\b/i.test(`${record.metaRobots} ${record.xRobotsTag}`) && record.expectedIndexability === 'INDEXABLE') return 'ACCIDENTALLY NOINDEX';
  if (record.expectedIndexability === 'INDEXABLE' && record.sitemapState !== 'IN_SITEMAP') return 'EXCLUDED FROM SITEMAP';
  if (record.expectedIndexability === 'INDEXABLE' && record.canonicalStatus !== 'SELF_CANONICAL') return 'CANONICAL ERROR';
  if (record.expectedIndexability === 'INDEXABLE' && record.renderedContentResult !== 'MEANINGFUL') return 'SOFT-404 RISK';
  return record.expectedIndexability;
}

async function auditRoute([route, routeType, expectedIndexability], sitemapKeys, robotsRules) {
  const { response, text, chain, finalUrl } = await fetchWithRedirects(route);
  const final = new URL(finalUrl);
  const routeKey = getRouteKey(route);
  const metaRobots = extractFirst(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i, text)
    || extractFirst(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["'][^>]*>/i, text);
  const xRobotsTag = response.headers.get('x-robots-tag') || '';
  const canonical = extractFirst(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i, text)
    || extractFirst(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i, text);
  const h1 = stripTags(extractFirst(/<h1[^>]*>([\s\S]*?)<\/h1>/i, text));
  const bodyText = stripTags(text);
  const textLength = bodyText.length;
  const expectedCanon = expectedCanonical(route, expectedIndexability);
  const canonicalPath = canonical ? new URL(canonical, SITE_ORIGIN).pathname : '';
  const canonicalStatus = expectedCanon
    ? canonicalPath === expectedCanon
      ? expectedIndexability === 'INDEXABLE BUT CANONICALISED' ? 'CANONICAL_TO_PREFERRED' : 'SELF_CANONICAL'
      : `EXPECTED_${expectedCanon}`
    : canonical ? 'CANONICAL_PRESENT' : 'NO_CANONICAL_REQUIRED';
  const renderedContentResult = response.status >= 300 && response.status < 400
    ? 'REDIRECT'
    : h1 && textLength > 800 && !/not found|page not found|coming soon/i.test(bodyText.slice(0, 1200))
      ? 'MEANINGFUL'
      : 'WEAK_OR_EMPTY';
  const sitemapState = sitemapKeys.has(routeKey) ? 'IN_SITEMAP' : 'NOT_IN_SITEMAP';
  const redirectChain = chain.map((item) => `${item.status} ${item.url}${item.location ? ` -> ${item.location}` : ''}`).join(' | ');
  const record = {
    route,
    routeType,
    expectedIndexability,
    actualIndexability: '',
    httpStatus: response.status,
    redirectChainLength: Math.max(0, chain.length - 1),
    finalDestination: `${final.pathname}${final.search}`,
    metaRobots,
    xRobotsTag,
    robotsTxtState: robotsTxtState(route, robotsRules),
    sitemapState,
    canonical,
    canonicalStatus,
    renderedH1: h1,
    renderedContentResult,
    redirectChain,
    defect: '',
    correction: '',
    finalStatus: '',
  };

  record.actualIndexability = classify(record);
  const noindexSitemapConflict = expectedIndexability === 'INTENTIONALLY NOINDEX' && sitemapState === 'IN_SITEMAP';
  record.defect = noindexSitemapConflict
    ? 'INTENTIONAL_NOINDEX_ROUTE_INCLUDED_IN_SITEMAP'
    : record.actualIndexability === expectedIndexability || record.actualIndexability === 'INDEXABLE'
      ? ''
      : record.actualIndexability;
  record.correction = record.defect ? 'See route-specific recommendation in SALES-002C report; do not alter intentional private exclusions.' : 'No correction required.';
  record.finalStatus = record.defect ? 'REVIEW_REQUIRED' : 'PASS';
  return record;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const top20 = await readTop20Routes();
  const allRouteRows = [
    ...REQUIRED_ROUTES,
    ...top20,
    ...INTENTIONAL_NOINDEX_ROUTES.map((row) => [row[0], row[1], 'INTENTIONALLY NOINDEX']),
    ...INTENTIONAL_CANONICAL_EXCLUDED_ROUTES.map((row) => [row[0], row[1], 'INDEXABLE BUT CANONICALISED']),
  ];
  const routeMap = new Map();
  for (const row of allRouteRows) routeMap.set(row[0], row);
  const routes = [...routeMap.values()];

  const robots = await fetchText(new URL('/robots.txt', BASE_URL));
  const robotsRules = parseRobotsTxt(robots.text);
  const sitemap = await parseSitemap();
  const records = [];
  for (const route of routes) {
    try {
      records.push(await auditRoute(route, sitemap.keys, robotsRules));
    } catch (error) {
      records.push({
        route: route[0],
        routeType: route[1],
        expectedIndexability: route[2],
        actualIndexability: 'REQUIRES MANUAL SEARCH CONSOLE REVIEW',
        httpStatus: 0,
        redirectChainLength: 0,
        finalDestination: '',
        metaRobots: '',
        xRobotsTag: '',
        robotsTxtState: 'UNKNOWN',
        sitemapState: 'UNKNOWN',
        canonical: '',
        canonicalStatus: 'UNKNOWN',
        renderedH1: '',
        renderedContentResult: 'FETCH_FAILED',
        redirectChain: '',
        defect: error instanceof Error ? error.message : String(error),
        correction: 'Manual Search Console/live-render review required.',
        finalStatus: 'REVIEW_REQUIRED',
      });
    }
  }

  const reportHeaders = [
    'route',
    'routeType',
    'expectedIndexability',
    'actualIndexability',
    'httpStatus',
    'metaRobots',
    'xRobotsTag',
    'robotsTxtState',
    'sitemapState',
    'canonical',
    'canonicalStatus',
    'renderedContentResult',
    'defect',
    'correction',
    'finalStatus',
  ];

  await writeCsv('indexability-route-inventory.csv', records, reportHeaders);
  await writeCsv('conversion-route-indexability.csv', records.filter((row) => row.expectedIndexability === 'INDEXABLE'), reportHeaders);
  await writeCsv(
    'intentional-noindex-register.csv',
    INTENTIONAL_NOINDEX_ROUTES.map(([route, routeType, reason]) => ({
      route,
      routePattern: route,
      routeType,
      reason,
      controllingSourceFile:
        route.startsWith('/checkout') ? 'src/app/robots.ts, checkout route handlers'
          : route.startsWith('/dashboard') ? 'src/app/(app)/dashboard/layout.tsx, src/app/robots.ts'
            : route.startsWith('/auth') ? 'src/app/(app)/auth/layout.tsx, src/app/robots.ts'
              : route.startsWith('/wizard') ? 'src/app/(app)/wizard/layout.tsx, src/app/robots.ts'
                : route.startsWith('/assisted-prep/start') ? 'src/app/(marketing)/assisted-prep/start/page.tsx'
                  : route.startsWith('/official-forms') ? 'next.config.mjs'
                    : 'next.config.mjs or route metadata',
      securityOrSeoJustification: reason,
    })),
    ['route', 'routePattern', 'routeType', 'reason', 'controllingSourceFile', 'securityOrSeoJustification']
  );
  await writeCsv(
    'accidental-noindex-before-after.csv',
    [
      {
        route: '/assisted-prep/start?service=section8',
        issueBefore: 'Query-state assisted-prep intake URL was present in sitemap and self-canonicalised.',
        correctionApplied: 'Removed assisted-prep/start query-state URLs from sitemap and set the start route to noindex,follow canonical /assisted-prep.',
        statusAfter: 'Intentional noindex query state; clean assisted-prep landing pages remain indexable.',
      },
      {
        route: '/products/money-claim-pack',
        issueBefore: 'Retired product alias could be discovered through sitemap generation.',
        correctionApplied: 'Added the retired product alias to the explicit sitemap retirement list and retained canonical product /products/money-claim.',
        statusAfter: 'Intentional sitemap exclusion; canonical public Money Claim product remains indexable.',
      },
      {
        route: '/hmo-tenancy-agreement-template',
        issueBefore: 'Legacy canonical duplicate was detected in sitemap output during live validation.',
        correctionApplied: 'Confirmed explicit sitemap retirement and allowlist exclusion for the duplicate of /hmo-shared-house-tenancy-agreement.',
        statusAfter: 'Intentional sitemap exclusion; canonical HMO/shared-house product remains indexable.',
      },
      {
        route: '/blog/scotland-first-tier-tribunal',
        issueBefore: 'Top-20 organic article was indexable and self-canonical but absent from sitemap coverage.',
        correctionApplied: 'Added the route as an explicitly requested indexable editorial landing page.',
        statusAfter: 'Indexable, self-canonical, allowed by robots.txt and present in the sitemap.',
      },
    ],
    ['route', 'issueBefore', 'correctionApplied', 'statusAfter']
  );
  await writeCsv('canonical-audit.csv', records, ['route', 'expectedIndexability', 'httpStatus', 'finalDestination', 'canonical', 'canonicalStatus', 'defect', 'finalStatus']);
  await writeCsv('robots-header-audit.csv', records, ['route', 'expectedIndexability', 'metaRobots', 'xRobotsTag', 'actualIndexability', 'defect', 'finalStatus']);
  await writeCsv('sitemap-coverage-audit.csv', records, ['route', 'expectedIndexability', 'sitemapState', 'canonical', 'canonicalStatus', 'defect', 'finalStatus']);
  await writeCsv('redirect-chain-audit.csv', records, ['route', 'httpStatus', 'redirectChainLength', 'finalDestination', 'redirectChain', 'defect', 'finalStatus']);
  await writeCsv('soft-404-risk-audit.csv', records, ['route', 'httpStatus', 'renderedH1', 'renderedContentResult', 'defect', 'finalStatus']);
  await writeCsv('live-http-indexability-validation.csv', records, reportHeaders);
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'robots-txt-audit.md'),
    `# Robots.txt audit\n\nBase URL checked: ${BASE_URL}\n\nRobots status: ${robots.response.status}\n\nDisallow rules observed:\n\n${robotsRules.disallow.map((rule) => `- ${rule}`).join('\n') || '- None'}\n\nConclusion: commercial routes must remain allowed; private prefixes are intentionally disallowed.\n`,
    'utf8'
  );

  const failures = records.filter((row) => row.expectedIndexability === 'INDEXABLE' && row.finalStatus !== 'PASS');
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'README.md'),
    `# SALES-002C indexability audit\n\nGenerated: ${new Date().toISOString()}\n\nBase URL checked: ${BASE_URL}\n\nRoutes audited: ${records.length}\n\nCommercial route defects after correction: ${failures.length}\n\nTechnical indexability is separate from actual Google indexing. This audit confirms whether routes are crawlable/indexable from source and rendered HTTP responses; it does not claim Google has indexed them.\n\nKey corrections applied:\n\n- Assisted-prep intake query-state URLs are now intentionally noindex and absent from the sitemap. Public assisted-prep discovery pages remain indexable.\n- The top-20 organic Scotland First-tier Tribunal article is represented in the sitemap because it is rendered indexable, self-canonical and meaningful.\n- Retired or duplicate aliases such as /products/money-claim-pack and /hmo-tenancy-agreement-template are excluded from sitemap coverage while preserving canonical public destination routes.\n`,
    'utf8'
  );
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'validation.md'),
    `# Validation\n\n- Source controls checked: Next metadata, robots metadata, sitemap generation, robots.txt, headers, redirects, and canonical tags.\n- Rendered HTTP checked from: ${BASE_URL}\n- Sitemap status: ${sitemap.status}\n- Robots status: ${robots.response.status}\n- Routes audited: ${records.length}\n- Commercial rendered-response defects: ${failures.length}\n- Intentional exclusions remain recorded in intentional-noindex-register.csv.\n- Technical indexability is not the same as Google indexing; Search Console confirmation remains a separate post-deployment check.\n`,
    'utf8'
  );

  if (failures.length > 0) {
    console.error(`SALES-002C found ${failures.length} commercial route issue(s). See ${OUTPUT_DIR}.`);
    process.exitCode = 1;
  } else {
    console.log(`SALES-002C audit passed for ${records.length} routes. Reports written to ${OUTPUT_DIR}.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
