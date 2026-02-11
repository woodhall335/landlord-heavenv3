import fs from 'node:fs/promises';
import path from 'node:path';
import { discoverStaticPageRoutes } from '../src/lib/seo/static-route-inventory.shared.mjs';

const ROOT = process.cwd();
const ALLOWLIST_PATH = path.join(ROOT, 'scripts', 'seo-sitemap-allowlist.json');
const BASE_URL = process.env.SEO_AUDIT_BASE_URL || 'http://localhost:5000';

const excludedPrefixes = ['/admin', '/api', '/auth', '/checkout', '/dashboard', '/wizard', '/success'];
const noindexPaths = ['/tenancy-agreements/england-wales', '/refunds'];
const retiredPaths = new Set([
  '/tools/validators/money-claim',
  '/tools/validators/scotland-notice-to-leave',
  '/tools/validators/tenancy-agreement',
  '/tenancy-agreements/premium',
  '/$',
]);

function isPublicStaticIndexablePath(routePath, intentionalExclusions) {
  return (
    !excludedPrefixes.some((prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`))
    && !noindexPaths.includes(routePath)
    && !retiredPaths.has(routePath)
    && !intentionalExclusions.has(routePath)
  );
}

async function loadSitemapPaths() {
  const sitemapUrl = new URL('/sitemap.xml', BASE_URL).toString();
  const response = await fetch(sitemapUrl, { redirect: 'follow' });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${sitemapUrl} (${response.status} ${response.statusText}).`);
  }

  const sitemapXml = await response.text();
  const pathRegex = /<loc>(.*?)<\/loc>/g;
  const sitemapPaths = new Set();
  let match;
  while ((match = pathRegex.exec(sitemapXml))) {
    const loc = match[1]?.trim();
    if (!loc) continue;
    try {
      sitemapPaths.add(new URL(loc).pathname);
    } catch {
      // Ignore malformed loc values so one bad entry does not hide valid paths.
    }
  }

  return { sitemapPaths, sitemapUrl };
}

async function run() {
  const [allowlistRaw, sitemapData, staticRoutes] = await Promise.all([
    fs.readFile(ALLOWLIST_PATH, 'utf8'),
    loadSitemapPaths(),
    discoverStaticPageRoutes(),
  ]);
  const { sitemapPaths, sitemapUrl } = sitemapData;

  const allowlistJson = JSON.parse(allowlistRaw);
  const intentionalExclusions = new Set(allowlistJson.intentionallyExcludedRoutes || []);

  const eligibleRoutes = staticRoutes.filter((route) => isPublicStaticIndexablePath(route, intentionalExclusions));
  const missingFromSitemap = eligibleRoutes.filter((route) => !sitemapPaths.has(route));

  if (missingFromSitemap.length > 0) {
    console.error('Sitemap coverage check failed. Public static routes missing from sitemap:');
    missingFromSitemap.forEach((route) => console.error(`- ${route}`));
    console.error(`\nChecked ${eligibleRoutes.length} eligible static routes (${staticRoutes.length} total static routes discovered) against ${sitemapPaths.size} sitemap entries from ${sitemapUrl}.`);
    console.error('\nIf any route should remain off-sitemap intentionally, add it to scripts/seo-sitemap-allowlist.json.');
    process.exit(1);
  }

  console.log(`Sitemap coverage check passed. Checked ${eligibleRoutes.length} eligible static routes (${staticRoutes.length} total static routes discovered) against ${sitemapPaths.size} sitemap entries from ${sitemapUrl}.`);
}

run().catch((error) => {
  console.error('Sitemap coverage check crashed:', error.message);
  process.exit(1);
});
