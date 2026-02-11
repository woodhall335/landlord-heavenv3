import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'audit-output', 'seo-current');
const BASE_URL = process.env.SEO_AUDIT_BASE_URL || 'http://localhost:5000';
const TIMEOUT_MS = 20000;

const known = ['/', '/pricing','/tools','/products/notice-only','/products/complete-pack','/products/money-claim','/products/ast','/blog','/help','/contact','/about','/ask-heaven','/eviction-notice','/money-claim','/wizard','/dashboard','/auth/login'];

const csvEscape=(v)=>{const s=String(v??'');return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s};
const pick=(doc,sel,attr)=>{const el=doc.querySelector(sel);if(!el)return null;return attr?((el.getAttribute(attr)||'').trim()||null):((el.textContent||'').trim()||null)};

async function fetchWithTimeout(url){
  const controller = new AbortController();
  const id = setTimeout(()=>controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url,{redirect:'follow',signal:controller.signal});
    const text = await res.text();
    return {status:res.status,finalUrl:res.url,html:text,error:''};
  } catch(e){
    return {status:0,finalUrl:url,html:'',error:e.message};
  } finally { clearTimeout(id); }
}

async function worker(urls, disallow){
  const out=[];
  for (const url of urls){
    const {status,finalUrl,html,error}=await fetchWithTimeout(url);
    const doc = new JSDOM(html).window.document;
    const title = pick(doc,'title');
    const description = pick(doc,'meta[name="description"]','content');
    const robotsMeta = pick(doc,'meta[name="robots"]','content');
    const canonical = pick(doc,'link[rel="canonical"]','href');
    const alternates = [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map((el)=>({hreflang:el.getAttribute('hreflang'),href:el.getAttribute('href')}));
    const ogTitle = pick(doc,'meta[property="og:title"]','content');
    const ogDescription = pick(doc,'meta[property="og:description"]','content');
    const ogImage = pick(doc,'meta[property="og:image"]','content');
    const ogUrl = pick(doc,'meta[property="og:url"]','content');
    const twitterTitle = pick(doc,'meta[name="twitter:title"]','content');
    const twitterDescription = pick(doc,'meta[name="twitter:description"]','content');
    const twitterImage = pick(doc,'meta[name="twitter:image"]','content');

    const jsonLdBlocks=[...doc.querySelectorAll('script[type="application/ld+json"]')].map((el)=>el.textContent||'').map((txt)=>{try{return JSON.parse(txt)}catch{return null}}).filter(Boolean);
    const jsonLdTypes=[...new Set(jsonLdBlocks.flatMap((b)=>Array.isArray(b)?b.map((x)=>x?.['@type']):Array.isArray(b['@graph'])?b['@graph'].map((x)=>x?.['@type']):[b['@type']]).filter(Boolean))];
    const h1s=[...doc.querySelectorAll('h1')].map((h)=>(h.textContent||'').trim()).filter(Boolean);
    const h2Count=doc.querySelectorAll('h2').length;
    const internalLinks=[...doc.querySelectorAll('a[href]')].map((a)=>a.getAttribute('href')||'').filter((href)=>href.startsWith('/')||href.startsWith(BASE_URL));
    const map=new Map();
    for(const href of internalLinks){const p=href.startsWith('http')?new URL(href).pathname:href;map.set(p,(map.get(p)||0)+1)}
    const topInternal=[...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([p,c])=>`${p}(${c})`).join('; ');

    const pth = new URL(url).pathname;
    const blockedByRobots = disallow.some((d)=>d && d !== '/' && pth.startsWith(d));
    const noindexMeta = (robotsMeta||'').toLowerCase().includes('noindex');
    const canonicalPointsElsewhere = canonical ? (()=>{try{return new URL(canonical,BASE_URL).pathname!==pth}catch{return false}})() : false;
    const redirectToOther = finalUrl !== url;
    const httpError = status>=400 || status===0;
    const soft404 = status === 200 && (/not found|404/i.test(title||'') || /not found/i.test((doc.querySelector('main')?.textContent||'').slice(0, 2000)));
    const indexabilityReasons=[blockedByRobots&&'blocked_by_robots',noindexMeta&&'noindex_meta',canonicalPointsElsewhere&&'canonical_points_elsewhere',redirectToOther&&'redirect_to_other',httpError&&'4xx_5xx_or_fetch_error',soft404&&'soft_404_signals'].filter(Boolean);

    out.push({url,path:pth,status,finalUrl,redirectCount:redirectToOther?1:0,indexable:indexabilityReasons.length===0,indexabilityReasons,canonicalOk:Boolean(canonical&&!canonicalPointsElsewhere),title,titleLength:title?.length||0,description,descriptionLength:description?.length||0,robotsMeta,canonical,alternateCount:alternates.length,alternates,ogTitle,ogDescription,ogImage,ogUrl,twitterTitle,twitterDescription,twitterImage,jsonLdCount:jsonLdBlocks.length,jsonLdTypes,h1Count:h1s.length,h1Text:h1s.join(' | '),h2Count,internalLinkCount:internalLinks.length,topInternalLinkTargets:topInternal,missingTitle:!title,missingDescription:!description,missingCanonical:!canonical,missingOgTitle:!ogTitle,missingOgDescription:!ogDescription,missingOgImage:!ogImage,missingTwitterTitle:!twitterTitle,fetchError:error});
  }
  return out;
}

async function run(){
  const sitemapEntries = JSON.parse(await fs.readFile(path.join(OUT_DIR,'sitemap_entries.json'),'utf8'));
  const robotsRules = JSON.parse(await fs.readFile(path.join(OUT_DIR,'robots_rules.json'),'utf8'));
  const disallow = (robotsRules.rules||[]).flatMap((r)=>r.disallow||[]);
  const urls=[...new Set([...sitemapEntries.map((e)=>`${BASE_URL}${e.path}`),...known.map((p)=>`${BASE_URL}${p}`)])].sort();

  const chunks=[[],[],[],[],[],[]];
  urls.forEach((u,i)=>chunks[i%chunks.length].push(u));
  const results=(await Promise.all(chunks.map((c)=>worker(c,disallow)))).flat();
  results.sort((a,b)=>a.path.localeCompare(b.path));

  const tMap=new Map(),dMap=new Map();
  for(const r of results){if(r.title)tMap.set(r.title,(tMap.get(r.title)||0)+1);if(r.description)dMap.set(r.description,(dMap.get(r.description)||0)+1)}
  for(const r of results){r.duplicateTitle=r.title?tMap.get(r.title)>1:false;r.duplicateDescription=r.description?dMap.get(r.description)>1:false}

  await fs.writeFile(path.join(OUT_DIR,'seo_audit_report.json'),JSON.stringify(results,null,2));
  const headers=['url','path','status','finalUrl','redirectCount','indexable','indexabilityReasons','canonicalOk','title','titleLength','description','descriptionLength','robotsMeta','canonical','alternateCount','ogTitle','ogDescription','ogImage','ogUrl','twitterTitle','twitterDescription','twitterImage','jsonLdCount','jsonLdTypes','h1Count','h1Text','h2Count','internalLinkCount','topInternalLinkTargets','missingTitle','missingDescription','missingCanonical','missingOgTitle','missingOgDescription','missingOgImage','missingTwitterTitle','duplicateTitle','duplicateDescription','fetchError'];
  const csv=[headers.join(','),...results.map((r)=>headers.map((h)=>csvEscape(r[h])).join(','))].join('\n');
  await fs.writeFile(path.join(OUT_DIR,'seo_audit_report.csv'),csv);

  const sitemapPaths=new Set(sitemapEntries.map((e)=>e.path));
  const summary=JSON.parse(await fs.readFile(path.join(OUT_DIR,'seo_audit_summary.json'),'utf8').catch(()=>'{"counts":{},"hostProtocolInconsistencies":{},"mismatches":{}}'));
  summary.counts={auditedUrls:results.length,indexableUrls:results.filter((r)=>r.indexable).length,duplicateTitles:results.filter((r)=>r.duplicateTitle).length,duplicateDescriptions:results.filter((r)=>r.duplicateDescription).length};
  summary.hostProtocolInconsistencies={sitemapHosts:[...new Set(sitemapEntries.map((e)=>new URL(e.url).host))],sitemapProtocols:[...new Set(sitemapEntries.map((e)=>new URL(e.url).protocol))],runtimeBaseUrl:BASE_URL};
  summary.mismatches={...summary.mismatches,sitemapVsRuntime_non200:results.filter((r)=>sitemapPaths.has(r.path)&&r.status!==200).map((r)=>r.path),sitemapVsIndexable_nonIndexable:results.filter((r)=>sitemapPaths.has(r.path)&&!r.indexable).map((r)=>({path:r.path,reasons:r.indexabilityReasons}))};
  await fs.writeFile(path.join(OUT_DIR,'seo_audit_summary.json'),JSON.stringify(summary,null,2));

  const md=`# Deep SEO Audit Summary\n\n- Audited URLs: ${results.length}\n- Indexable URLs: ${summary.counts.indexableUrls}\n- Duplicate titles: ${summary.counts.duplicateTitles}\n- Duplicate descriptions: ${summary.counts.duplicateDescriptions}\n\n## Non-indexable samples\n${results.filter((r)=>!r.indexable).slice(0,40).map((r)=>`- ${r.path}: ${r.indexabilityReasons.join(', ')}`).join('\n')}\n`;
  await fs.writeFile(path.join(OUT_DIR,'seo_audit_summary.md'),md);
  console.log('runtime crawl complete', results.length);
}

run().catch((e)=>{console.error(e);process.exit(1)});
