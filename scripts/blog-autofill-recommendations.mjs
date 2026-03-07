#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const POSTS_FILE = path.join(ROOT, 'src/lib/blog/posts.tsx');
const AUDIT_FILE = path.join(ROOT, 'audit-output/blog-audit.json');
const OUTPUT_DIR = path.join(ROOT, 'recommendations-output');

const strict = process.argv.includes('--strict');
const todayIso = new Date().toISOString().slice(0, 10);

const categoryIconMap = {
  'Legal Updates': '/images/wizard-icons/49-warning.png',
  Eviction: '/images/wizard-icons/06-notice-details.png',
  'Section 8': '/images/wizard-icons/14-section-8.png',
  'Section 21': '/images/wizard-icons/13-section-21.png',
  'Rent Arrears': '/images/wizard-icons/15-rent-arrears.png',
  Compliance: '/images/wizard-icons/05-compliance.png',
  Court: '/images/wizard-icons/09-court.png',
  Tenancy: '/images/wizard-icons/04-tenancy.png',
  Guides: '/images/wizard-icons/12-summary-cards.png',
};

function fail(msg, code = 1) {
  console.error(`[blog:recommend] ${msg}`);
  process.exit(code);
}

function ensurePostsFile() {
  if (!fs.existsSync(POSTS_FILE)) {
    fail('posts source file not found: src/lib/blog/posts.tsx');
  }
}

function extractArrayObjects(source, arrayName) {
  const marker = `export const ${arrayName}`;
  const idx = source.indexOf(marker);
  if (idx === -1) throw new Error(`Could not find ${arrayName}`);
  const startBracket = source.indexOf('[', idx);
  const endMarker = '\n];';
  const endIdx = source.indexOf(endMarker, startBracket);
  if (startBracket === -1 || endIdx === -1) throw new Error(`Could not locate ${arrayName} array block`);

  const arrayText = source.slice(startBracket + 1, endIdx);
  const objectRegex = /^  \{\n    slug:\s*'[^']+'[\s\S]*?^  \},?$/gm;
  return Array.from(arrayText.matchAll(objectRegex), (m) => m[0]);
}

function readField(objText, field) {
  const m = objText.match(new RegExp(`\\b${field}:\\s*'([^']*)'`, 'm'));
  return m ? m[1] : '';
}

function parsePosts(source) {
  return extractArrayObjects(source, 'blogPosts')
    .map((text) => ({
      raw: text,
      slug: readField(text, 'slug'),
      title: readField(text, 'title'),
      category: readField(text, 'category'),
      date: readField(text, 'date'),
      updatedDate: readField(text, 'updatedDate'),
      metaDescription: readField(text, 'metaDescription'),
      heroImage: readField(text, 'heroImage'),
      heroImageAlt: readField(text, 'heroImageAlt'),
    }))
    .filter((p) => p.slug);
}

function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00Z`).getTime();
  const b = new Date(`${dateB}T00:00:00Z`).getTime();
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function stableHash(input) {
  return Number.parseInt(crypto.createHash('sha1').update(input).digest('hex').slice(0, 8), 16);
}

function listWizardIcons() {
  const iconsDir = path.join(ROOT, 'public/images/wizard-icons');
  if (!fs.existsSync(iconsDir)) return [];
  return fs
    .readdirSync(iconsDir)
    .filter((n) => /\.(png|svg|webp)$/i.test(n))
    .sort()
    .map((n) => `/images/wizard-icons/${n}`);
}

function cleanJurisdictionHint(post) {
  const s = `${post.slug} ${post.title} ${post.category}`.toLowerCase();
  if (s.includes('wales')) return 'Wales';
  if (s.includes('scotland') || s.includes('prt')) return 'Scotland';
  if (s.includes('northern-ireland') || s.includes('northern ireland') || s.includes(' ni ')) return 'Northern Ireland';
  if (s.includes('england')) return 'England';
  return 'UK landlords';
}

function truncateAtWord(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen + 1);
  const idx = cut.lastIndexOf(' ');
  return (idx > 0 ? cut.slice(0, idx) : cut.slice(0, maxLen)).trim();
}

function buildFaq(post, idx, jurisdiction) {
  const topic = post.title.replace(/[:|].*$/, '').trim();
  const baseQuestions = [
    `What should landlords check first when handling ${topic.toLowerCase()} in ${jurisdiction}?`,
    `How can landlords document evidence for ${topic.toLowerCase()} efficiently?`,
    `What timeline should landlords expect for ${topic.toLowerCase()} in ${jurisdiction}?`,
    `How should landlords communicate with tenants during ${topic.toLowerCase()} steps?`,
    `What records should landlords keep after ${topic.toLowerCase()} actions are completed?`,
    `When should landlords seek specialist help for ${topic.toLowerCase()}?`,
  ];
  const answer = `Landlords should keep a written checklist, align dates and paperwork, and focus on clear evidence for each step. In ${jurisdiction}, process details can vary by tenancy type and notice route, so use accurate records and factual communication. Review tenancy documents before serving or responding to notices to reduce avoidable delays. This is guidance, not legal advice.`;
  return {
    question: baseQuestions[idx % baseQuestions.length],
    answer,
    confidence: Number((0.77 + idx * 0.03).toFixed(2)),
    sourcesUsed: 'none',
  };
}

function makeMetaProposal(post, jurisdiction, variant) {
  const base =
    variant === 'A'
      ? `${post.title}: practical steps for ${jurisdiction} landlords, key timelines, paperwork checks, and common mistakes to avoid before action.`
      : `A clear ${jurisdiction} landlord guide to ${post.title.toLowerCase()}, with evidence tips, notice planning, and risk-aware next steps for UK landlords.`;
  const text = truncateAtWord(base, 160);
  const expanded =
    text.length < 130
      ? truncateAtWord(`${text} Written for UK landlords who want compliant, practical decisions.`, 160)
      : text;
  return { variant, text: expanded, charCount: expanded.length };
}

function ensureAudit(posts) {
  if (fs.existsSync(AUDIT_FILE)) return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));

  const generated = {
    generatedAt: `${todayIso}T00:00:00.000Z`,
    source: 'generated-by-blog-autofill-recommendations',
    posts: posts.map((p) => {
      const metaLen = (p.metaDescription || '').length;
      const warnings = [];
      if (!p.metaDescription) warnings.push('meta-description-missing');
      if (metaLen > 0 && (metaLen < 130 || metaLen > 160)) warnings.push('meta-description-length');
      return { slug: p.slug, warnings, metaDescriptionLength: metaLen };
    }),
  };

  fs.mkdirSync(path.dirname(AUDIT_FILE), { recursive: true });
  fs.writeFileSync(AUDIT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
  return generated;
}

function csvEscape(value) {
  const s = `${value ?? ''}`;
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

ensurePostsFile();
const postsSource = fs.readFileSync(POSTS_FILE, 'utf8');
const posts = parsePosts(postsSource);
if (posts.length === 0) fail('No blog posts could be parsed from src/lib/blog/posts.tsx');

let audit;
try {
  audit = ensureAudit(posts);
} catch (err) {
  if (strict) fail(`Cannot read or generate audit-output/blog-audit.json: ${err.message}`);
  audit = { posts: [] };
}

const auditMap = new Map((audit.posts || []).map((p) => [p.slug, p]));
const wizardIcons = listWizardIcons();

const recommendations = {};
let editorialCount = 0;
let updatedDateRecCount = 0;
let metaProposalCount = 0;
let faqEntryCount = 0;
let heroImageRecCount = 0;
let heroAltRecCount = 0;

for (const post of posts) {
  const jurisdiction = cleanJurisdictionHint(post);
  const rec = {
    slug: post.slug,
    title: post.title,
    recommendedUpdatedDate: '',
    updatedDateReason: '',
    needsEditorialReview: false,
    faqRecommendations: [],
    metaDescriptionProposals: [],
    recommendedHeroImage: '',
    recommendedHeroImageFallback: '',
    recommendedHeroImageAlt: '',
  };

  if (!post.updatedDate) {
    const olderThan90 = isValidISODate(post.date) ? daysBetween(post.date, todayIso) > 90 : true;
    rec.recommendedUpdatedDate = olderThan90 ? todayIso : post.date || todayIso;
    rec.updatedDateReason = olderThan90
      ? 'updatedDate missing and date is older than 90 days; recommend today and editorial review'
      : 'updatedDate missing; recommend using existing publish date as baseline';
    rec.needsEditorialReview = olderThan90;
    updatedDateRecCount += 1;
  } else if (!isValidISODate(post.updatedDate)) {
    rec.recommendedUpdatedDate = isValidISODate(post.date) ? post.date : todayIso;
    rec.updatedDateReason = 'updatedDate exists but is invalid; recommend a valid ISO date';
    rec.needsEditorialReview = true;
    updatedDateRecCount += 1;
  }

  const faqCount = 3 + (stableHash(post.slug) % 4);
  for (let i = 0; i < faqCount; i += 1) rec.faqRecommendations.push(buildFaq(post, i, jurisdiction));
  faqEntryCount += rec.faqRecommendations.length;

  const postAudit = auditMap.get(post.slug);
  const metaLen = (post.metaDescription || '').length;
  const weakMeta = !post.metaDescription || metaLen < 130 || metaLen > 160;
  const flaggedMeta =
    weakMeta ||
    (postAudit?.warnings || []).includes('meta-description-length') ||
    (postAudit?.warnings || []).includes('meta-description-missing');
  if (flaggedMeta) {
    rec.metaDescriptionProposals = [makeMetaProposal(post, jurisdiction, 'A'), makeMetaProposal(post, jurisdiction, 'B')];
    metaProposalCount += 2;
  }

  const heroMissing = !post.heroImage || !/^\/images\//.test(post.heroImage);
  if (heroMissing) {
    const catIcon = categoryIconMap[post.category] || '';
    const fallbackIcon = wizardIcons.length
      ? wizardIcons[stableHash(post.slug) % wizardIcons.length]
      : '/images/blog/placeholder.svg';
    rec.recommendedHeroImage = catIcon || fallbackIcon;
    rec.recommendedHeroImageFallback = '/images/blog/placeholder.svg';
    heroImageRecCount += 1;
  }

  const weakAlt = !post.heroImageAlt || post.heroImageAlt.trim().length < 20;
  if (weakAlt) {
    rec.recommendedHeroImageAlt = truncateAtWord(`${post.title} – LandlordHeaven guide`, 110);
    heroAltRecCount += 1;
  }

  if (rec.needsEditorialReview) editorialCount += 1;
  recommendations[post.slug] = rec;
}

const summary = {
  generatedAt: `${todayIso}T00:00:00.000Z`,
  todayIso,
  totalPostsProcessed: posts.length,
  postsNeedingEditorialReview: editorialCount,
  updatedDateRecommendations: updatedDateRecCount,
  faqEntriesGenerated: faqEntryCount,
  metaDescriptionProposalsGenerated: metaProposalCount,
  heroImageRecommendations: heroImageRecCount,
  heroImageAltRecommendations: heroAltRecCount,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, 'blog-recommendations.json'), `${JSON.stringify({ summary, posts: recommendations }, null, 2)}\n`);

const allRecs = Object.values(recommendations);
const priority = allRecs.filter((r) => r.needsEditorialReview);
const updatedRows = allRecs.filter((r) => r.recommendedUpdatedDate);
const metaRows = allRecs.filter((r) => r.metaDescriptionProposals.length === 2);

const md = [
  '# Blog Autofill Recommendations',
  '',
  '## Executive summary',
  '',
  `- Total posts processed: **${summary.totalPostsProcessed}**`,
  `- Posts needing editorial review: **${summary.postsNeedingEditorialReview}**`,
  `- Updated date recommendations: **${summary.updatedDateRecommendations}**`,
  `- Meta description proposals generated: **${summary.metaDescriptionProposalsGenerated}**`,
  `- FAQ entries generated: **${summary.faqEntriesGenerated}**`,
  '',
  '## Top priority posts (needsEditorialReview=true)',
  '',
  priority.length
    ? '| Slug | Reason |\n|---|---|\n' + priority.map((r) => `| ${r.slug} | ${r.updatedDateReason} |`).join('\n')
    : '_None_',
  '',
  '## Updated date recommendations',
  '',
  '| Slug | Recommended updatedDate | Needs editorial review | Reason |',
  '|---|---|---|---|',
  ...updatedRows.map(
    (r) => `| ${r.slug} | ${r.recommendedUpdatedDate} | ${r.needsEditorialReview} | ${r.updatedDateReason} |`,
  ),
  '',
  '## Meta description A/B proposals',
  '',
  '| Slug | Variant A | Variant B |',
  '|---|---|---|',
  ...metaRows.map(
    (r) =>
      `| ${r.slug} | ${r.metaDescriptionProposals[0].text} (${r.metaDescriptionProposals[0].charCount}) | ${r.metaDescriptionProposals[1].text} (${r.metaDescriptionProposals[1].charCount}) |`,
  ),
  '',
  '## FAQ count per post',
  '',
  '| Slug | FAQ count |',
  '|---|---|',
  ...allRecs.map((r) => `| ${r.slug} | ${r.faqRecommendations.length} |`),
  '',
].join('\n');
fs.writeFileSync(path.join(OUTPUT_DIR, 'blog-recommendations.md'), md);

const csvHeader = [
  'slug',
  'recommendedUpdatedDate',
  'needsEditorialReview',
  'metaA',
  'metaB',
  'faqQ1',
  'faqA1',
  'faqQ2',
  'faqA2',
  'faqQ3',
  'faqA3',
];

const csvRows = [csvHeader.join(',')];
for (const rec of allRecs) {
  const row = [
    rec.slug,
    rec.recommendedUpdatedDate,
    rec.needsEditorialReview,
    rec.metaDescriptionProposals[0]?.text || '',
    rec.metaDescriptionProposals[1]?.text || '',
    rec.faqRecommendations[0]?.question || '',
    rec.faqRecommendations[0]?.answer || '',
    rec.faqRecommendations[1]?.question || '',
    rec.faqRecommendations[1]?.answer || '',
    rec.faqRecommendations[2]?.question || '',
    rec.faqRecommendations[2]?.answer || '',
  ].map(csvEscape);
  csvRows.push(row.join(','));
}
fs.writeFileSync(path.join(OUTPUT_DIR, 'blog-recommendations.csv'), `${csvRows.join('\n')}\n`);

let proposedSource = postsSource;
for (const rec of allRecs) {
  if (!rec.recommendedUpdatedDate && !rec.recommendedHeroImage && !rec.recommendedHeroImageAlt) continue;
  const slugNeedle = `slug: '${rec.slug}'`;
  const slugIdx = proposedSource.indexOf(slugNeedle);
  if (slugIdx === -1) continue;

  const startIdx = proposedSource.lastIndexOf('  {', slugIdx);
  const nextIdx = proposedSource.indexOf('\n  },', slugIdx);
  const closeIdx = nextIdx === -1 ? proposedSource.indexOf('\n  }', slugIdx) : nextIdx;
  if (startIdx === -1 || closeIdx === -1) continue;

  let obj = proposedSource.slice(startIdx, closeIdx + 5);
  if (rec.recommendedUpdatedDate) {
    if (/\bupdatedDate:\s*'[^']*'/.test(obj)) {
      obj = obj.replace(/\bupdatedDate:\s*'[^']*'/, `updatedDate: '${rec.recommendedUpdatedDate}'`);
    } else {
      obj = obj.replace(/(\bdate:\s*'[^']*',\n)/, `$1    updatedDate: '${rec.recommendedUpdatedDate}',\n`);
    }
  }
  if (rec.recommendedHeroImage && /\bheroImage:\s*'[^']*'/.test(obj)) {
    obj = obj.replace(/\bheroImage:\s*'[^']*'/, `heroImage: '${rec.recommendedHeroImage}'`);
  }
  if (rec.recommendedHeroImageAlt && /\bheroImageAlt:\s*'[^']*'/.test(obj)) {
    obj = obj.replace(/\bheroImageAlt:\s*'[^']*'/, `heroImageAlt: '${rec.recommendedHeroImageAlt}'`);
  }

  proposedSource = proposedSource.slice(0, startIdx) + obj + proposedSource.slice(closeIdx + 5);
}

const tmpDir = fs.mkdtempSync(path.join(ROOT, '.tmp-blog-recommend-'));
const originalTmp = path.join(tmpDir, 'posts.original.tsx');
const proposedTmp = path.join(tmpDir, 'posts.proposed.tsx');
fs.writeFileSync(originalTmp, postsSource);
fs.writeFileSync(proposedTmp, proposedSource);

const diff = spawnSync('git', ['diff', '--no-index', originalTmp, proposedTmp], { encoding: 'utf8' });
let normalizedDiff = (diff.stdout || '')
  .replaceAll(originalTmp, 'src/lib/blog/posts.tsx')
  .replaceAll(proposedTmp, 'src/lib/blog/posts.tsx');
if (normalizedDiff) {
  normalizedDiff = normalizedDiff
    .replace(/^diff --git .*$/m, 'diff --git a/src/lib/blog/posts.tsx b/src/lib/blog/posts.tsx')
    .replace(/^--- .*$/m, '--- a/src/lib/blog/posts.tsx')
    .replace(/^\+\+\+ .*$/m, '+++ b/src/lib/blog/posts.tsx');
}
fs.writeFileSync(path.join(OUTPUT_DIR, 'blog-recommendations.patch'), normalizedDiff || '# No proposed changes\n');
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`total posts processed: ${summary.totalPostsProcessed}`);
console.log(`posts needing editorial review: ${summary.postsNeedingEditorialReview}`);
console.log(`meta proposals generated: ${summary.metaDescriptionProposalsGenerated}`);
console.log(`faq entries generated: ${summary.faqEntriesGenerated}`);
console.log(`output folder path: ${OUTPUT_DIR}`);
