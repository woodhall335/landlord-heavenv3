#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync(path.resolve('public/images/blog/blog-image-manifest.json'), 'utf8'));

const KEYWORD_TEMPLATE_MAP = [
  { match: /renters reform|law|act/i, key: 'law-reform' },
  { match: /section 21|form 6a/i, key: 'section-21' },
  { match: /section 8|grounds/i, key: 'section-8' },
  { match: /tenancy|agreement|ast|prt/i, key: 'tenancy-agreements' },
  { match: /notice|eviction/i, key: 'product-notice-wizard' },
  { match: /money claim|arrears/i, key: 'money-claim' },
  { match: /scotland/i, key: 'region-scotland' },
  { match: /wales/i, key: 'region-wales' },
  { match: /northern ireland|ni/i, key: 'region-ni' },
];

const OVERUSED_OR_GENERIC_TEMPLATE_KEYS = new Set(['section-21','section-8','tenancy-agreements','money-claim','rent-arrears','court-process','eviction-timeline','product-notice-wizard']);

const HERO_POOL_BUCKETS = [
  { id: 'regions', test: /scotland|wales|northern ireland|ni/, pool: ['region-scotland','region-wales','region-ni','law-reform','forms-paperwork','format-step-by-step'] },
  { id: 'money-claims', test: /money claim|arrears|mcol|county court|small claims|debt/, pool: ['money-claim','product-money-claim','rent-arrears','court-process','format-calculator','forms-paperwork','format-checklist'] },
  { id: 'compliance-safety', test: /compliance|safety|gas|electrical|fire|epc|eicr|certificate|licensing/, pool: ['compliance-certificate','safety-gas','safety-electrical','safety-fire','format-checklist','forms-paperwork','law-reform'] },
  { id: 'tenancy-agreements', test: /tenancy|agreement|ast|prt|occupation contract|joint tenancy/, pool: ['tenancy-agreements','product-ast-builder','format-comparison','format-step-by-step','forms-paperwork','compliance-certificate'] },
  { id: 'eviction-guides', test: /eviction|section 8|section 21|notice|possession|bailiff|tribunal|ground/, pool: ['section-21','section-8','product-notice-wizard','product-complete-pack','eviction-timeline','court-process','forms-paperwork','law-reform'] },
  { id: 'default', test: /.*/, pool: ['format-step-by-step','format-comparison','forms-paperwork','law-reform','court-process','compliance-certificate'] },
];

const heroesByTemplateKey = new Map(manifest.heroes.map((entry) => [entry.templateKey, entry.path.replace(/^public/, '')]));
const ogByTemplateKey = new Map(manifest.og.map((entry) => [entry.templateKey, entry.path.replace(/^public/, '')]));
const placeholders = manifest.placeholders.filter((entry) => /^lh-blog-placeholder-v\d+\.webp$/.test(entry.file)).sort((a,b)=>a.file.localeCompare(b.file));
const placeholderOgMap = new Map(manifest.placeholders.filter((entry) => /^lh-blog-placeholder-v\d+-og\.webp$/.test(entry.file)).map((entry)=>[entry.file.replace(/^lh-blog-placeholder-v(\d+)-og\.webp$/,'$1'),entry.path.replace(/^public/,'')]));

function stableHash(value) { let hash = 0; for (let i=0;i<value.length;i++) hash=(hash*31+value.charCodeAt(i))>>>0; return hash; }
function parsePosts(source) {
  const posts=[];
  const postRegex=/\{\s*slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?tags:\s*\[([\s\S]*?)\],[\s\S]*?targetKeyword:\s*'([^']+)'/g;
  let m; while((m=postRegex.exec(source))!==null){const tags=[...m[4].matchAll(/'([^']+)'/g)].map((x)=>x[1]);posts.push({slug:m[1],title:m[2],category:m[3],tags,targetKeyword:m[5]});}
  return posts;
}

function placeholderForSlug(slug){const i=stableHash(slug)%placeholders.length;const hero=placeholders[i].path.replace(/^public/,'');const version=placeholders[i].file.replace(/^lh-blog-placeholder-v(\d+)\.webp$/,'$1');const og=placeholderOgMap.get(version)??'/images/blog/placeholders/lh-blog-placeholder-v1-og.webp';return{hero,og};}
function resolve(post){
  const explicit=KEYWORD_TEMPLATE_MAP.find((x)=>x.match.test(`${post.title} ${post.targetKeyword}`))?.key;
  if(explicit && heroesByTemplateKey.has(explicit) && ogByTemplateKey.has(explicit) && !OVERUSED_OR_GENERIC_TEMPLATE_KEYS.has(explicit)) return {hero:heroesByTemplateKey.get(explicit), strategy:'explicit', placeholder:placeholderForSlug(post.slug).hero};
  const haystack=`${post.title} ${post.targetKeyword} ${post.category} ${post.tags.join(' ')}`.toLowerCase();
  if(explicit){
    const bucket=HERO_POOL_BUCKETS.find((b)=>b.test.test(haystack))??HERO_POOL_BUCKETS[HERO_POOL_BUCKETS.length-1];
    const pool=bucket.pool.filter((key)=>heroesByTemplateKey.has(key)&&ogByTemplateKey.has(key));
    if(pool.length>0){const key=pool[stableHash(post.slug)%pool.length];return {hero:heroesByTemplateKey.get(key),strategy:'rotated',placeholder:placeholderForSlug(post.slug).hero};}
  }
  return {hero:placeholderForSlug(post.slug).hero, strategy:'placeholder', placeholder:placeholderForSlug(post.slug).hero};
}

const posts = parsePosts(fs.readFileSync(path.resolve('src/lib/blog/posts.tsx'), 'utf8'));
const heroUsage=new Map(), placeholderUsage=new Map(); let explicit=0,rotated=0,fallback=0;
for(const post of posts){const r=resolve(post);const h=heroUsage.get(r.hero)??{count:0,slugs:[]};h.count++;h.slugs.push(post.slug);heroUsage.set(r.hero,h);const p=placeholderUsage.get(r.placeholder)??{count:0,slugs:[]};p.count++;p.slugs.push(post.slug);placeholderUsage.set(r.placeholder,p);if(r.strategy==='explicit')explicit++;if(r.strategy==='rotated')rotated++;if(r.strategy==='placeholder')fallback++;}

console.log('Blog image distribution audit');
console.log('============================');
console.log(`Total posts processed: ${posts.length}`);
console.log(`Explicit hero mapping: ${explicit}`);
console.log(`Rotated hero mapping: ${rotated}`);
console.log(`Placeholder fallback: ${fallback}`);
console.log('\nTop 20 most-used hero images (after rotation):');
[...heroUsage.entries()].sort((a,b)=>b[1].count-a[1].count).slice(0,20).forEach(([k,v])=>console.log(`- ${String(v.count).padStart(3,' ')} × ${k} (e.g. ${v.slugs.slice(0,4).join(', ')})`));
console.log('\nPlaceholder usage distribution (v1..v9):');
[...placeholderUsage.entries()].sort((a,b)=>a[0].localeCompare(b[0])).forEach(([k,v])=>{const m=k.match(/-v(\d+)\.webp$/);console.log(`- ${m?`v${m[1]}`:'unknown'}: ${v.count}`)});
console.log('\nOverused hero threshold check (>= 20 uses):');
const over=[...heroUsage.entries()].filter(([,v])=>v.count>=20).sort((a,b)=>b[1].count-a[1].count); if(over.length===0) console.log('- none'); else over.forEach(([k,v])=>console.log(`- ${v.count} × ${k}`));
process.exit(0);
