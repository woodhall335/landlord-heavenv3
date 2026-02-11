import fs from 'node:fs/promises';
import path from 'node:path';
import { discoverStaticPageRoutes } from '../src/lib/seo/static-route-inventory.shared.mjs';

const ROOT = process.cwd();
const ALLOWLIST_PATH = path.join(ROOT, 'scripts', 'seo-sitemap-allowlist.json');
const SITEMAP_ENTRIES_PATH = path.join(ROOT, 'audit-output', 'seo-current', 'sitemap_entries.json');

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
  const sitemapRaw = await fs.readFile(SITEMAP_ENTRIES_PATH, 'utf8');
  const entries = JSON.parse(sitemapRaw);
  return new Set(entries.map((entry) => entry.path));
}

async function run() {
  const [allowlistRaw, sitemapPaths, staticRoutes] = await Promise.all([
    fs.readFile(ALLOWLIST_PATH, 'utf8'),
    loadSitemapPaths(),
    discoverStaticPageRoutes(),
  ]);

  const allowlistJson = JSON.parse(allowlistRaw);
  const intentionalExclusions = new Set(allowlistJson.intentionallyExcludedRoutes || []);

  const eligibleRoutes = staticRoutes.filter((route) => isPublicStaticIndexablePath(route, intentionalExclusions));
  const missingFromSitemap = eligibleRoutes.filter((route) => !sitemapPaths.has(route));

  if (missingFromSitemap.length > 0) {
    console.error('Sitemap coverage check failed. Public static routes missing from sitemap:');
    missingFromSitemap.forEach((route) => console.error(`- ${route}`));
    console.error('\nIf any route should remain off-sitemap intentionally, add it to scripts/seo-sitemap-allowlist.json.');
    process.exit(1);
  }

  console.log(`Sitemap coverage check passed. Checked ${eligibleRoutes.length} eligible static routes (${staticRoutes.length} total static routes discovered).`);
}

run().catch((error) => {
  console.error('Sitemap coverage check crashed:', error.message);
  process.exit(1);
});
