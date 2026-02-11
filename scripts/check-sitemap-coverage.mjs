import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'src/app');
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

const toPosix = (p) => p.split(path.sep).join('/');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(absPath)));
    else out.push(absPath);
  }
  return out;
}

function routePathFromFile(relFile) {
  const normalized = toPosix(relFile).replace(/^src\/app/, '');
  const segs = normalized.split('/').filter(Boolean);
  segs.pop(); // page.tsx
  const route = `/${segs.join('/')}`;
  return route === '/' ? '/' : route;
}

function isPublicStaticIndexablePath(routePath) {
  return (
    !excludedPrefixes.some((prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`))
    && !noindexPaths.includes(routePath)
    && !retiredPaths.has(routePath)
  );
}

async function run() {
  const [allFiles, allowlistRaw, sitemapRaw] = await Promise.all([
    walk(APP_DIR),
    fs.readFile(ALLOWLIST_PATH, 'utf8'),
    fs.readFile(SITEMAP_ENTRIES_PATH, 'utf8'),
  ]);

  const allowlist = new Set((JSON.parse(allowlistRaw).intentionallyExcludedRoutes || []));
  const sitemapPaths = new Set(JSON.parse(sitemapRaw).map((entry) => entry.path));

  const staticRoutes = [...new Set(allFiles
    .filter((file) => file.endsWith('/page.tsx'))
    .map((file) => routePathFromFile(toPosix(path.relative(ROOT, file))))
    .filter((route) => !route.includes('[')))].sort((a, b) => a.localeCompare(b));

  const missingFromSitemap = staticRoutes
    .filter((route) => isPublicStaticIndexablePath(route))
    .filter((route) => !allowlist.has(route))
    .filter((route) => !sitemapPaths.has(route));

  if (missingFromSitemap.length > 0) {
    console.error('Sitemap coverage check failed. Missing static indexable routes:');
    missingFromSitemap.forEach((route) => console.error(`- ${route}`));
    process.exit(1);
  }

  console.log(`Sitemap coverage check passed. Checked ${staticRoutes.length} static routes.`);
}

run().catch((error) => {
  console.error('Sitemap coverage check crashed:', error.message);
  process.exit(1);
});
