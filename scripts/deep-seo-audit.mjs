import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'src/app');
const OUT_DIR = path.join(ROOT, 'audit-output', 'seo-current');
const BASE_URL = process.env.SEO_AUDIT_BASE_URL || 'http://localhost:5000';

const toPosix = (p) => p.split(path.sep).join('/');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(fp));
    else out.push(fp);
  }
  return out;
}

function routePathFromFile(relFile) {
  const normalized = toPosix(relFile).replace(/^src\/app/, '');
  if (normalized === '/sitemap.ts') return '/sitemap.xml';
  if (normalized === '/robots.ts') return '/robots.txt';
  const segs = normalized.split('/').filter(Boolean);
  const file = segs.pop();
  if (['page.tsx', 'layout.tsx', 'route.ts'].includes(file)) {
    const p = '/' + segs.join('/');
    return p === '/' ? '/' : p;
  }
  return '/' + segs.join('/');
}

function classifyRoute(routePath) {
  if (routePath.startsWith('/api/')) return 'api';
  if (routePath.startsWith('/dashboard')) return 'dashboard';
  if (routePath.startsWith('/auth')) return 'auth';
  if (routePath.startsWith('/wizard')) return 'wizard';
  if (routePath.startsWith('/blog')) return 'blog';
  if (routePath.startsWith('/tools')) return 'tool';
  if (routePath.startsWith('/products')) return 'product';
  return 'marketing';
}

function routePatternFromPage(routePath) {
  const escaped = routePath.split('/').map((seg) => {
    if (!seg) return '';
    if (/^\[\.\.\..+\]$/.test(seg)) return '.+';
    if (/^\[.+\]$/.test(seg)) return '[^/]+';
    return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('/');
  return new RegExp(`^${escaped}$`);
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function extractBySelector(doc, selector, attr) {
  const el = doc.querySelector(selector);
  if (!el) return null;
  if (!attr) return (el.textContent || '').trim();
  return (el.getAttribute(attr) || '').trim() || null;
}

function parseSitemapXml(xml) {
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  const items = [];
  let m;
  while ((m = urlRegex.exec(xml))) {
    const block = m[1];
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!loc) continue;
    items.push({
      url: loc,
      lastModified: block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
      priority: block.match(/<priority>(.*?)<\/priority>/)?.[1],
      changeFrequency: block.match(/<changefreq>(.*?)<\/changefreq>/)?.[1],
    });
  }
  return items;
}

function parseRobotsTxt(txt) {
  const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rules = [];
  let current = null;
  let sitemap = null;
  for (const line of lines) {
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey.toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') {
      current = { userAgent: value, allow: [], disallow: [] };
      rules.push(current);
    } else if (key === 'allow' && current) {
      current.allow.push(value);
    } else if (key === 'disallow' && current) {
      current.disallow.push(value);
    } else if (key === 'sitemap') {
      sitemap = value;
    }
  }
  return { rules, sitemap };
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = await walk(APP_DIR);
  const routeFiles = files.filter((f) => ['page.tsx','layout.tsx','route.ts','sitemap.ts','robots.ts'].includes(path.basename(f)) && !f.includes('/__tests__/'));

  const routeRows = [];
  const staticPageRoutes = new Set();
  const dynamicPageRoutes = [];

  for (const abs of routeFiles) {
    const rel = toPosix(path.relative(ROOT, abs));
    const rp = routePathFromFile(rel);
    const content = await fs.readFile(abs, 'utf8');
    const dynamic = rp.includes('[') ? 'Y' : 'N';
    const hasMetadataExport = /export\s+(const\s+metadata|async\s+function\s+generateMetadata|function\s+generateMetadata)/.test(content) ? 'Y':'N';
    const hasRobotsDirectives = /(robots\s*:|noindex|nofollow|x-robots-tag)/i.test(content) ? 'Y':'N';
    const hasCanonicalOrAlternates = /(alternates\s*:|canonical|getCanonicalUrl|rel=\"canonical\")/i.test(content) ? 'Y':'N';
    const hasStructuredDataRender = /(application\/ld\+json|jsonLd|structured.?data|@context\"\s*:\s*\"https:\/\/schema\.org)/i.test(content) ? 'Y':'N';
    const notes = [];
    if (/['\"]use client['\"]/.test(content) && hasMetadataExport === 'N' && path.basename(abs) === 'page.tsx') notes.push('client page with no page-level metadata export');
    if (rp.startsWith('/api/')) notes.push('api route');

    routeRows.push({ routePath: rp, filePath: rel, routeType: classifyRoute(rp), dynamic, hasMetadataExport, hasRobotsDirectives, hasCanonicalOrAlternates, hasStructuredDataRender, notes: notes.join('; ') });

    if (path.basename(abs) === 'page.tsx') {
      if (dynamic === 'Y') dynamicPageRoutes.push(rp);
      else staticPageRoutes.add(rp);
    }
  }

  routeRows.sort((a,b)=>a.routePath.localeCompare(b.routePath)||a.filePath.localeCompare(b.filePath));
  await fs.writeFile(path.join(OUT_DIR,'route_inventory.json'), JSON.stringify(routeRows,null,2));
  const routeHeader = ['route_path','file_path','route_type','dynamic','has_metadata_export','has_robots_directives','has_canonical_or_alternates','has_structured_data_render','notes'];
  const routeCsv = [routeHeader.join(','), ...routeRows.map((r)=>[r.routePath,r.filePath,r.routeType,r.dynamic,r.hasMetadataExport,r.hasRobotsDirectives,r.hasCanonicalOrAlternates,r.hasStructuredDataRender,r.notes].map(csvEscape).join(','))].join('\n');
  await fs.writeFile(path.join(OUT_DIR,'route_inventory.csv'), routeCsv);

  const sitemapXml = await (await fetch(`${BASE_URL}/sitemap.xml`)).text();
  const sitemapParsed = parseSitemapXml(sitemapXml);
  const dynamicPatterns = dynamicPageRoutes.map((p)=>({ p, regex: routePatternFromPage(p) }));
  const sitemapEntries = sitemapParsed.map((e)=>{
    const u = new URL(e.url);
    const p = u.pathname;
    const isStatic = staticPageRoutes.has(p);
    const dyn = dynamicPatterns.find((d)=>d.regex.test(p));
    return { ...e, path:p, mapsToExistingRoute:isStatic||Boolean(dyn), routeMatchKind:isStatic?'static':dyn?'dynamic':'missing' };
  });
  await fs.writeFile(path.join(OUT_DIR,'sitemap_entries.json'), JSON.stringify(sitemapEntries,null,2));

  const robotsTxt = await (await fetch(`${BASE_URL}/robots.txt`)).text();
  const robotsRules = parseRobotsTxt(robotsTxt);
  await fs.writeFile(path.join(OUT_DIR,'robots_rules.json'), JSON.stringify(robotsRules,null,2));

  const known = ['/', '/pricing','/tools','/products/notice-only','/products/complete-pack','/products/money-claim','/products/ast','/blog','/help','/contact','/about','/ask-heaven','/eviction-notice','/money-claim','/wizard','/dashboard','/auth/login'];
  const urls = new Set([...sitemapEntries.map((e)=>`${BASE_URL}${e.path}`), ...known.map((p)=>`${BASE_URL}${p}`)]);
  const disallow = robotsRules.rules.flatMap((r)=>r.disallow || []);

  const seoRows = [];
  for (const url of [...urls].sort()) {
    let status = 0, finalUrl = url, html = '', fetchError='';
    try {
      const res = await fetch(url, { redirect: 'follow' });
      status = res.status;
      finalUrl = res.url;
      html = await res.text();
    } catch (e) { fetchError = e.message; }

    const doc = new JSDOM(html).window.document;
    const title = extractBySelector(doc,'title');
    const description = extractBySelector(doc,'meta[name="description"]','content');
    const robotsMeta = extractBySelector(doc,'meta[name="robots"]','content');
    const canonical = extractBySelector(doc,'link[rel="canonical"]','href');
    const alternates = [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map((el)=>({hreflang:el.getAttribute('hreflang'),href:el.getAttribute('href')}));

    const ogTitle = extractBySelector(doc,'meta[property="og:title"]','content');
    const ogDescription = extractBySelector(doc,'meta[property="og:description"]','content');
    const ogImage = extractBySelector(doc,'meta[property="og:image"]','content');
    const ogUrl = extractBySelector(doc,'meta[property="og:url"]','content');
    const twitterTitle = extractBySelector(doc,'meta[name="twitter:title"]','content');
    const twitterDescription = extractBySelector(doc,'meta[name="twitter:description"]','content');
    const twitterImage = extractBySelector(doc,'meta[name="twitter:image"]','content');

    const jsonLdBlocks = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((el)=>el.textContent || '').map((txt)=>{ try{return JSON.parse(txt);}catch{return null;} }).filter(Boolean);
    const jsonLdTypes = [...new Set(jsonLdBlocks.flatMap((b)=> Array.isArray(b) ? b.map((x)=>x?.['@type']) : Array.isArray(b['@graph']) ? b['@graph'].map((x)=>x?.['@type']) : [b['@type']]).filter(Boolean))];
    const h1s = [...doc.querySelectorAll('h1')].map((h)=>(h.textContent||'').trim()).filter(Boolean);
    const h2Count = doc.querySelectorAll('h2').length;

    const internalLinks = [...doc.querySelectorAll('a[href]')].map((a)=>a.getAttribute('href')||'').filter((href)=>href.startsWith('/')||href.startsWith(BASE_URL));
    const counts = new Map();
    for (const href of internalLinks) {
      const p = href.startsWith('http') ? new URL(href).pathname : href;
      counts.set(p, (counts.get(p)||0)+1);
    }
    const topTargets = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([p,c])=>`${p}(${c})`).join('; ');
    const pth = new URL(url).pathname;
    const blockedByRobots = disallow.some((d)=>d && d !== '/' && pth.startsWith(d));
    const noindexMeta = (robotsMeta||'').toLowerCase().includes('noindex');
    const canonicalPointsElsewhere = canonical ? (()=>{ try{return new URL(canonical, BASE_URL).pathname !== pth;}catch{return false;} })() : false;
    const redirectToOther = finalUrl !== url;
    const httpError = status >= 400 || status === 0;
    const soft404 = /not found|404/i.test(title||'') || /not found/i.test(doc.body?.textContent || '') || (doc.querySelector('main')?.textContent || '').trim().length < 80;
    const indexabilityReasons = [blockedByRobots && 'blocked_by_robots', noindexMeta && 'noindex_meta', canonicalPointsElsewhere && 'canonical_points_elsewhere', redirectToOther && 'redirect_to_other', httpError && '4xx_5xx_or_fetch_error', soft404 && 'soft_404_signals'].filter(Boolean);
    const indexable = indexabilityReasons.length === 0;

    seoRows.push({url,path:pth,status,finalUrl,redirectCount:redirectToOther?1:0,indexable,indexabilityReasons,canonicalOk:Boolean(canonical&&!canonicalPointsElsewhere),title,titleLength:title?.length||0,description,descriptionLength:description?.length||0,robotsMeta,canonical,alternateCount:alternates.length,alternates,ogTitle,ogDescription,ogImage,ogUrl,twitterTitle,twitterDescription,twitterImage,jsonLdCount:jsonLdBlocks.length,jsonLdTypes,h1Count:h1s.length,h1Text:h1s.join(' | '),h2Count,internalLinkCount:internalLinks.length,topInternalLinkTargets:topTargets,missingTitle:!title,missingDescription:!description,missingCanonical:!canonical,missingOgTitle:!ogTitle,missingOgDescription:!ogDescription,missingOgImage:!ogImage,missingTwitterTitle:!twitterTitle,fetchError});
  }

  const tMap = new Map(), dMap = new Map();
  for (const r of seoRows) {
    if (r.title) tMap.set(r.title, (tMap.get(r.title)||0)+1);
    if (r.description) dMap.set(r.description, (dMap.get(r.description)||0)+1);
  }
  for (const r of seoRows) {
    r.duplicateTitle = r.title ? tMap.get(r.title) > 1 : false;
    r.duplicateDescription = r.description ? dMap.get(r.description) > 1 : false;
  }

  await fs.writeFile(path.join(OUT_DIR,'seo_audit_report.json'), JSON.stringify(seoRows,null,2));
  const headers = ['url','path','status','finalUrl','redirectCount','indexable','indexabilityReasons','canonicalOk','title','titleLength','description','descriptionLength','robotsMeta','canonical','alternateCount','ogTitle','ogDescription','ogImage','ogUrl','twitterTitle','twitterDescription','twitterImage','jsonLdCount','jsonLdTypes','h1Count','h1Text','h2Count','internalLinkCount','topInternalLinkTargets','missingTitle','missingDescription','missingCanonical','missingOgTitle','missingOgDescription','missingOgImage','missingTwitterTitle','duplicateTitle','duplicateDescription','fetchError'];
  const csv = [headers.join(','), ...seoRows.map((r)=>headers.map((h)=>csvEscape(r[h])).join(','))].join('\n');
  await fs.writeFile(path.join(OUT_DIR,'seo_audit_report.csv'), csv);

  const sitemapPaths = new Set(sitemapEntries.map((e)=>e.path));
  const publicStaticRoutes = [...staticPageRoutes].filter((p)=>!['/api','/auth','/dashboard','/wizard','/success'].some((x)=>p===x||p.startsWith(`${x}/`)));
  const missingFromSitemap = publicStaticRoutes.filter((p)=>!sitemapPaths.has(p));

  const summary = {
    counts: {
      totalRouteFiles: routeRows.length,
      totalPageRoutes: staticPageRoutes.size + dynamicPageRoutes.length,
      sitemapEntries: sitemapEntries.length,
      sitemapMissingRouteMatches: sitemapEntries.filter((e)=>!e.mapsToExistingRoute).length,
      auditedUrls: seoRows.length,
      indexableUrls: seoRows.filter((r)=>r.indexable).length,
      duplicateTitles: seoRows.filter((r)=>r.duplicateTitle).length,
      duplicateDescriptions: seoRows.filter((r)=>r.duplicateDescription).length,
    },
    hostProtocolInconsistencies: {
      sitemapHosts: [...new Set(sitemapEntries.map((e)=>new URL(e.url).host))],
      sitemapProtocols: [...new Set(sitemapEntries.map((e)=>new URL(e.url).protocol))],
      runtimeBaseUrl: BASE_URL,
    },
    mismatches: {
      codeRoutesVsSitemap_missingFromSitemap: missingFromSitemap,
      sitemapVsRuntime_non200: seoRows.filter((r)=>sitemapPaths.has(r.path) && r.status !== 200).map((r)=>r.path),
      sitemapVsIndexable_nonIndexable: seoRows.filter((r)=>sitemapPaths.has(r.path) && !r.indexable).map((r)=>({path:r.path,reasons:r.indexabilityReasons})),
      sitemapEntriesWithoutRouteMatch: sitemapEntries.filter((e)=>!e.mapsToExistingRoute).map((e)=>e.path),
    },
  };

  await fs.writeFile(path.join(OUT_DIR,'seo_audit_summary.json'), JSON.stringify(summary,null,2));
  const md = `# Deep SEO Audit Summary\n\n- Total route files: ${summary.counts.totalRouteFiles}\n- Total page routes: ${summary.counts.totalPageRoutes}\n- Sitemap entries: ${summary.counts.sitemapEntries}\n- Audited URLs: ${summary.counts.auditedUrls}\n- Indexable URLs: ${summary.counts.indexableUrls}\n- Duplicate titles: ${summary.counts.duplicateTitles}\n- Duplicate descriptions: ${summary.counts.duplicateDescriptions}\n\n## Host/protocol\n- Sitemap hosts: ${summary.hostProtocolInconsistencies.sitemapHosts.join(', ')}\n- Sitemap protocols: ${summary.hostProtocolInconsistencies.sitemapProtocols.join(', ')}\n- Runtime base URL: ${BASE_URL}\n`;
  await fs.writeFile(path.join(OUT_DIR,'seo_audit_summary.md'), md);

  console.log(`Wrote SEO audit outputs to ${OUT_DIR}`);
}

run().catch((err)=>{ console.error(err); process.exit(1); });
