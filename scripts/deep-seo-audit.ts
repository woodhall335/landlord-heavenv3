import { promises as fs } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'src/app');
const OUT_DIR = path.join(ROOT, 'audit-output', 'seo-current');
const BASE_URL = process.env.SEO_AUDIT_BASE_URL || 'http://localhost:5000';

type RouteRow = {
  routePath: string;
  filePath: string;
  routeType: string;
  dynamic: 'Y' | 'N';
  hasMetadataExport: 'Y' | 'N';
  hasRobotsDirectives: 'Y' | 'N';
  hasCanonicalOrAlternates: 'Y' | 'N';
  hasStructuredDataRender: 'Y' | 'N';
  notes: string;
};

type SitemapEntryDump = {
  url: string;
  path: string;
  lastModified?: string;
  priority?: number;
  changeFrequency?: string;
  mapsToExistingRoute: boolean;
  routeMatchKind: 'static' | 'dynamic' | 'missing';
};

function toPosix(p: string) {
  return p.split(path.sep).join('/');
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fp));
    else files.push(fp);
  }
  return files;
}

function classifyRoute(routePath: string): string {
  if (routePath.startsWith('/api/')) return 'api';
  if (routePath.startsWith('/dashboard')) return 'dashboard';
  if (routePath.startsWith('/auth')) return 'auth';
  if (routePath.startsWith('/wizard')) return 'wizard';
  if (routePath.startsWith('/blog')) return 'blog';
  if (routePath.startsWith('/tools')) return 'tool';
  if (routePath.startsWith('/products')) return 'product';
  if (['/pricing', '/about', '/contact', '/help', '/terms', '/privacy', '/cookies', '/refunds'].includes(routePath)) {
    return 'marketing';
  }
  return 'marketing';
}

function routePathFromFile(relFile: string): string {
  const normalized = toPosix(relFile).replace(/^src\/app/, '');
  if (normalized === '/sitemap.ts') return '/sitemap.xml';
  if (normalized === '/robots.ts') return '/robots.txt';

  const segs = normalized.split('/').filter(Boolean);
  const file = segs.pop()!;
  if (file === 'page.tsx' || file === 'layout.tsx' || file === 'route.ts') {
    const p = '/' + segs.join('/');
    return p === '/' ? '/' : p;
  }
  return '/' + segs.join('/');
}

function routePatternFromPage(routePath: string): RegExp {
  const escaped = routePath
    .split('/')
    .map((seg) => {
      if (!seg) return '';
      if (/^\[\.\.\..+\]$/.test(seg)) return '.+';
      if (/^\[.+\]$/.test(seg)) return '[^/]+';
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp(`^${escaped}$`);
}

function extractBySelector(doc: Document, selector: string, attr?: string) {
  const el = doc.querySelector(selector);
  if (!el) return null;
  if (!attr) return (el.textContent || '').trim();
  return (el.getAttribute(attr) || '').trim() || null;
}

function csvEscape(value: unknown) {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const allFiles = await walk(APP_DIR);
  const targetBaseNames = new Set(['page.tsx', 'layout.tsx', 'route.ts', 'sitemap.ts', 'robots.ts']);
  const routeFiles = allFiles
    .filter((f) => targetBaseNames.has(path.basename(f)))
    .filter((f) => !f.includes('/__tests__/'));

  const routeRows: RouteRow[] = [];
  const staticPageRoutes = new Set<string>();
  const dynamicPageRoutes: string[] = [];

  for (const absFile of routeFiles) {
    const relFile = toPosix(path.relative(ROOT, absFile));
    const routePath = routePathFromFile(relFile);
    const content = await fs.readFile(absFile, 'utf8');
    const dynamic = routePath.includes('[') ? 'Y' : 'N';
    const hasMetadataExport = /export\s+(const\s+metadata|async\s+function\s+generateMetadata|function\s+generateMetadata)/.test(content) ? 'Y' : 'N';
    const hasRobotsDirectives = /(robots\s*:|noindex|nofollow|X-Robots-Tag)/i.test(content) ? 'Y' : 'N';
    const hasCanonicalOrAlternates = /(alternates\s*:|canonical|getCanonicalUrl|rel=\"canonical\")/i.test(content) ? 'Y' : 'N';
    const hasStructuredDataRender = /(application\/ld\+json|jsonLd|structured.?data|@context\"\s*:\s*\"https:\/\/schema\.org)/i.test(content) ? 'Y' : 'N';
    const notes: string[] = [];
    if (/['\"]use client['\"]/.test(content) && hasMetadataExport === 'N' && path.basename(absFile) === 'page.tsx') {
      notes.push('client page with no page-level metadata export');
    }
    if (routePath.startsWith('/api/')) notes.push('api route');

    routeRows.push({
      routePath,
      filePath: relFile,
      routeType: classifyRoute(routePath),
      dynamic,
      hasMetadataExport,
      hasRobotsDirectives,
      hasCanonicalOrAlternates,
      hasStructuredDataRender,
      notes: notes.join('; '),
    });

    if (path.basename(absFile) === 'page.tsx') {
      if (dynamic === 'Y') dynamicPageRoutes.push(routePath);
      else staticPageRoutes.add(routePath);
    }
  }

  routeRows.sort((a, b) => a.routePath.localeCompare(b.routePath) || a.filePath.localeCompare(b.filePath));

  const routesJsonPath = path.join(OUT_DIR, 'route_inventory.json');
  await fs.writeFile(routesJsonPath, JSON.stringify(routeRows, null, 2));
  const routesCsv = [
    ['route_path', 'file_path', 'route_type', 'dynamic', 'has_metadata_export', 'has_robots_directives', 'has_canonical_or_alternates', 'has_structured_data_render', 'notes'].join(','),
    ...routeRows.map((r) => [r.routePath, r.filePath, r.routeType, r.dynamic, r.hasMetadataExport, r.hasRobotsDirectives, r.hasCanonicalOrAlternates, r.hasStructuredDataRender, r.notes].map(csvEscape).join(',')),
  ].join('\n');
  await fs.writeFile(path.join(OUT_DIR, 'route_inventory.csv'), routesCsv);

  const sitemapEntriesRaw = await sitemap();
  const dynamicPatterns = dynamicPageRoutes.map((p) => ({ p, regex: routePatternFromPage(p) }));
  const sitemapEntries: SitemapEntryDump[] = sitemapEntriesRaw.map((entry) => {
    const parsed = new URL(entry.url);
    const p = parsed.pathname;
    const hasStatic = staticPageRoutes.has(p);
    const dynMatch = dynamicPatterns.find((d) => d.regex.test(p));
    return {
      url: entry.url,
      path: p,
      lastModified: entry.lastModified ? new Date(entry.lastModified).toISOString() : undefined,
      priority: entry.priority,
      changeFrequency: entry.changeFrequency,
      mapsToExistingRoute: hasStatic || Boolean(dynMatch),
      routeMatchKind: hasStatic ? 'static' : dynMatch ? 'dynamic' : 'missing',
    };
  });

  await fs.writeFile(path.join(OUT_DIR, 'sitemap_entries.json'), JSON.stringify(sitemapEntries, null, 2));

  const robotsConfig = robots();
  await fs.writeFile(path.join(OUT_DIR, 'robots_rules.json'), JSON.stringify(robotsConfig, null, 2));

  const knownImportantRoutes = [
    '/', '/pricing', '/tools', '/products/notice-only', '/products/complete-pack', '/products/money-claim', '/products/ast', '/blog', '/help', '/contact', '/about', '/ask-heaven', '/eviction-notice', '/money-claim', '/wizard', '/dashboard', '/auth/login'
  ];

  const auditedUrls = new Set<string>([
    ...sitemapEntries.map((e) => `${BASE_URL}${e.path}`),
    ...knownImportantRoutes.map((p) => `${BASE_URL}${p}`),
  ]);

  const robotsDisallow = (() => {
    const r = robotsConfig.rules;
    const rules = Array.isArray(r) ? r : [r];
    return rules.flatMap((x) => Array.isArray(x.disallow) ? x.disallow : (x.disallow ? [x.disallow] : []));
  })();

  const seoRows: Record<string, unknown>[] = [];

  for (const url of Array.from(auditedUrls).sort()) {
    let finalUrl = url;
    let status = 0;
    let redirectCount = 0;
    let html = '';
    let fetchError = '';

    try {
      const res = await fetch(url, { redirect: 'follow' });
      status = res.status;
      finalUrl = res.url;
      html = await res.text();
      redirectCount = finalUrl !== url ? 1 : 0;
    } catch (error) {
      fetchError = error instanceof Error ? error.message : String(error);
    }

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const title = extractBySelector(doc, 'title');
    const description = extractBySelector(doc, 'meta[name="description"]', 'content');
    const robotsMeta = extractBySelector(doc, 'meta[name="robots"]', 'content');
    const canonical = extractBySelector(doc, 'link[rel="canonical"]', 'href');
    const alternates = Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]')).map((el) => ({ hreflang: el.getAttribute('hreflang'), href: el.getAttribute('href') }));
    const ogTitle = extractBySelector(doc, 'meta[property="og:title"]', 'content');
    const ogDescription = extractBySelector(doc, 'meta[property="og:description"]', 'content');
    const ogImage = extractBySelector(doc, 'meta[property="og:image"]', 'content');
    const ogUrl = extractBySelector(doc, 'meta[property="og:url"]', 'content');
    const twitterTitle = extractBySelector(doc, 'meta[name="twitter:title"]', 'content');
    const twitterDescription = extractBySelector(doc, 'meta[name="twitter:description"]', 'content');
    const twitterImage = extractBySelector(doc, 'meta[name="twitter:image"]', 'content');

    const jsonLdBlocks = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
      .map((el) => el.textContent || '')
      .map((txt) => {
        try {
          return JSON.parse(txt);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const ldTypes = jsonLdBlocks.flatMap((block: any) => {
      if (!block) return [];
      if (Array.isArray(block)) return block.map((x) => x?.['@type']).filter(Boolean);
      if (Array.isArray(block['@graph'])) return block['@graph'].map((x: any) => x?.['@type']).filter(Boolean);
      return block['@type'] ? [block['@type']] : [];
    });

    const h1s = Array.from(doc.querySelectorAll('h1')).map((h) => (h.textContent || '').trim()).filter(Boolean);
    const h2Count = doc.querySelectorAll('h2').length;

    const internalLinks = Array.from(doc.querySelectorAll('a[href]'))
      .map((a) => a.getAttribute('href') || '')
      .filter((href) => href.startsWith('/') || href.startsWith(BASE_URL));
    const linkCounts = new Map<string, number>();
    for (const href of internalLinks) {
      const p = href.startsWith('http') ? new URL(href).pathname : href;
      linkCounts.set(p, (linkCounts.get(p) || 0) + 1);
    }
    const topTargets = Array.from(linkCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([p, c]) => `${p}(${c})`).join('; ');

    const normalizedRobots = (robotsMeta || '').toLowerCase();
    const pathName = new URL(url).pathname;

    const blockedByRobots = robotsDisallow.some((rule) => rule !== '/' && pathName.startsWith(rule.replace(/\*$/, '')));
    const noindexMeta = normalizedRobots.includes('noindex');
    const canonicalPointsElsewhere = Boolean(canonical && (() => { try { return new URL(canonical, BASE_URL).pathname !== pathName; } catch { return false; } })());
    const redirectToOther = redirectCount > 0;
    const statusError = status >= 400 || status === 0;
    const soft404 = /not found|page not found|404/i.test(title || '') || /not found/i.test(doc.body?.textContent || '') || (doc.querySelector('main')?.textContent || '').trim().length < 80;

    const indexabilityReasons = [
      blockedByRobots ? 'blocked_by_robots' : '',
      noindexMeta ? 'noindex_meta' : '',
      canonicalPointsElsewhere ? 'canonical_points_elsewhere' : '',
      redirectToOther ? 'redirect_to_other' : '',
      statusError ? 'http_error' : '',
      soft404 ? 'soft_404_signals' : '',
    ].filter(Boolean);

    const indexable = indexabilityReasons.length === 0;
    const canonicalOk = Boolean(canonical && !canonicalPointsElsewhere);

    seoRows.push({
      url,
      path: pathName,
      status,
      finalUrl,
      redirectCount,
      indexable,
      indexabilityReasons,
      title,
      titleLength: title?.length || 0,
      description,
      descriptionLength: description?.length || 0,
      robotsMeta,
      canonical,
      canonicalOk,
      alternateCount: alternates.length,
      alternates,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      twitterTitle,
      twitterDescription,
      twitterImage,
      jsonLdCount: jsonLdBlocks.length,
      jsonLdTypes: Array.from(new Set(ldTypes)),
      h1Count: h1s.length,
      h1Text: h1s.join(' | '),
      h2Count,
      internalLinkCount: internalLinks.length,
      topInternalLinkTargets: topTargets,
      missingTitle: !title,
      missingDescription: !description,
      missingCanonical: !canonical,
      missingOgTitle: !ogTitle,
      missingOgDescription: !ogDescription,
      missingOgImage: !ogImage,
      missingTwitterTitle: !twitterTitle,
      fetchError,
    });
  }

  const titleMap = new Map<string, number>();
  const descMap = new Map<string, number>();
  for (const row of seoRows) {
    const title = String(row.title || '');
    const desc = String(row.description || '');
    if (title) titleMap.set(title, (titleMap.get(title) || 0) + 1);
    if (desc) descMap.set(desc, (descMap.get(desc) || 0) + 1);
  }

  for (const row of seoRows) {
    const title = String(row.title || '');
    const desc = String(row.description || '');
    (row as any).duplicateTitle = title ? (titleMap.get(title)! > 1) : false;
    (row as any).duplicateDescription = desc ? (descMap.get(desc)! > 1) : false;
  }

  await fs.writeFile(path.join(OUT_DIR, 'seo_audit_report.json'), JSON.stringify(seoRows, null, 2));
  const seoHeaders = [
    'url','path','status','finalUrl','redirectCount','indexable','indexabilityReasons','canonicalOk','title','titleLength','description','descriptionLength','robotsMeta','canonical','alternateCount','ogTitle','ogDescription','ogImage','ogUrl','twitterTitle','twitterDescription','twitterImage','jsonLdCount','jsonLdTypes','h1Count','h1Text','h2Count','internalLinkCount','topInternalLinkTargets','missingTitle','missingDescription','missingCanonical','missingOgTitle','missingOgDescription','missingOgImage','missingTwitterTitle','duplicateTitle','duplicateDescription','fetchError'
  ];
  const seoCsv = [
    seoHeaders.join(','),
    ...seoRows.map((row) => seoHeaders.map((h) => csvEscape((row as any)[h])).join(',')),
  ].join('\n');
  await fs.writeFile(path.join(OUT_DIR, 'seo_audit_report.csv'), seoCsv);

  const sitemapPaths = new Set(sitemapEntries.map((e) => e.path));
  const publicStaticRoutes = Array.from(staticPageRoutes).filter((p) => !['/dashboard','/wizard'].some((x) => p === x || p.startsWith(`${x}/`)) && !['/auth','/api','/success'].some((x) => p === x || p.startsWith(`${x}/`)));
  const missingFromSitemap = publicStaticRoutes.filter((p) => !sitemapPaths.has(p));
  const sitemapNon200 = seoRows.filter((r) => sitemapPaths.has(String(r.path)) && Number(r.status) !== 200).map((r) => r.path);
  const sitemapNonIndexable = seoRows.filter((r) => sitemapPaths.has(String(r.path)) && !(r as any).indexable).map((r) => ({ path: r.path, reasons: r.indexabilityReasons }));

  const summary = {
    counts: {
      totalRouteFiles: routeRows.length,
      totalPageRoutes: staticPageRoutes.size + dynamicPageRoutes.length,
      sitemapEntries: sitemapEntries.length,
      sitemapMissingRouteMatches: sitemapEntries.filter((e) => !e.mapsToExistingRoute).length,
      auditedUrls: seoRows.length,
      indexableUrls: seoRows.filter((r) => (r as any).indexable).length,
      duplicateTitles: seoRows.filter((r) => (r as any).duplicateTitle).length,
      duplicateDescriptions: seoRows.filter((r) => (r as any).duplicateDescription).length,
    },
    hostProtocolInconsistencies: {
      sitemapHosts: Array.from(new Set(sitemapEntries.map((e) => new URL(e.url).host))),
      sitemapProtocols: Array.from(new Set(sitemapEntries.map((e) => new URL(e.url).protocol))),
      runtimeBaseUrl: BASE_URL,
    },
    mismatches: {
      sitemapEntriesWithoutRoutes: sitemapEntries.filter((e) => !e.mapsToExistingRoute).map((e) => e.path),
      publicRoutesMissingFromSitemap: missingFromSitemap,
      sitemapUrlsNot200: sitemapNon200,
      sitemapUrlsNonIndexable: sitemapNonIndexable,
    },
  };

  await fs.writeFile(path.join(OUT_DIR, 'seo_audit_summary.json'), JSON.stringify(summary, null, 2));

  const md = [
    '# Deep SEO Audit Summary',
    '',
    `- Total route files: ${summary.counts.totalRouteFiles}`,
    `- Total page routes: ${summary.counts.totalPageRoutes}`,
    `- Sitemap entries: ${summary.counts.sitemapEntries}`,
    `- Audited URLs: ${summary.counts.auditedUrls}`,
    `- Indexable URLs: ${summary.counts.indexableUrls}`,
    `- Duplicate titles: ${summary.counts.duplicateTitles}`,
    `- Duplicate descriptions: ${summary.counts.duplicateDescriptions}`,
    '',
    '## Host/protocol',
    `- Sitemap hosts: ${summary.hostProtocolInconsistencies.sitemapHosts.join(', ')}`,
    `- Sitemap protocols: ${summary.hostProtocolInconsistencies.sitemapProtocols.join(', ')}`,
    `- Runtime base URL: ${summary.hostProtocolInconsistencies.runtimeBaseUrl}`,
    '',
    '## Likely excluded from indexing',
    ...seoRows.filter((r) => !(r as any).indexable).slice(0, 50).map((r) => `- ${r.path}: ${(r.indexabilityReasons as string[]).join(', ')}`),
  ].join('\n');

  await fs.writeFile(path.join(OUT_DIR, 'seo_audit_summary.md'), md);

  console.log(`Wrote SEO audit outputs to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
