#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const POSTS_FILE = path.join(ROOT_DIR, 'src/lib/blog/posts.tsx');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const WIZARD_ICONS_DIR = path.join(ROOT_DIR, 'public/images/wizard-icons');
const OUTPUT_DIR = path.join(ROOT_DIR, 'audit-output');
const JSON_REPORT_PATH = path.join(OUTPUT_DIR, 'blog-audit.json');
const MD_REPORT_PATH = path.join(OUTPUT_DIR, 'blog-audit.md');

const strictMode = process.argv.slice(2).includes('--strict');

const SEVERITY = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
};

function findMatchingIndex(source, openIndex, openChar, closeChar) {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    const prev = source[i - 1];
    const next = source[i + 1];

    if (inLineComment) {
      if (char === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (prev === '*' && char === '/') inBlockComment = false;
      continue;
    }

    if (!inSingle && !inDouble && !inTemplate) {
      if (char === '/' && next === '/') {
        inLineComment = true;
        continue;
      }
      if (char === '/' && next === '*') {
        inBlockComment = true;
        continue;
      }
    }

    if (!inDouble && !inTemplate && char === "'" && prev !== '\\') {
      inSingle = !inSingle;
      continue;
    }

    if (!inSingle && !inTemplate && char === '"' && prev !== '\\') {
      inDouble = !inDouble;
      continue;
    }

    if (!inSingle && !inDouble && char === '`' && prev !== '\\') {
      inTemplate = !inTemplate;
      continue;
    }

    if (inSingle || inDouble || inTemplate) continue;

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function extractBlogPostsArray(content) {
  const markerIndex = content.indexOf('export const blogPosts');
  if (markerIndex < 0) throw new Error('Could not locate `export const blogPosts` in src/lib/blog/posts.tsx');

  const assignmentIndex = content.indexOf('=', markerIndex);
  const arrayStart = content.indexOf('[', assignmentIndex);
  if (arrayStart < 0) throw new Error('Could not locate blogPosts array start.');

  const arrayEnd = findMatchingIndex(content, arrayStart, '[', ']');
  if (arrayEnd < 0) throw new Error('Could not locate blogPosts array end.');

  return content.slice(arrayStart + 1, arrayEnd);
}

function splitTopLevelObjects(arrayContent) {
  const objects = [];
  let depth = 0;
  let startIndex = -1;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < arrayContent.length; i += 1) {
    const char = arrayContent[i];
    const prev = arrayContent[i - 1];
    const next = arrayContent[i + 1];

    if (inLineComment) {
      if (char === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (prev === '*' && char === '/') inBlockComment = false;
      continue;
    }

    if (!inSingle && !inDouble && !inTemplate) {
      if (char === '/' && next === '/') {
        inLineComment = true;
        continue;
      }
      if (char === '/' && next === '*') {
        inBlockComment = true;
        continue;
      }
    }

    if (!inDouble && !inTemplate && char === "'" && prev !== '\\') {
      inSingle = !inSingle;
      continue;
    }

    if (!inSingle && !inTemplate && char === '"' && prev !== '\\') {
      inDouble = !inDouble;
      continue;
    }

    if (!inSingle && !inDouble && char === '`' && prev !== '\\') {
      inTemplate = !inTemplate;
      continue;
    }

    if (inSingle || inDouble || inTemplate) continue;

    if (char === '{') {
      if (depth === 0) startIndex = i;
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0 && startIndex >= 0) {
        objects.push(arrayContent.slice(startIndex, i + 1));
        startIndex = -1;
      }
    }
  }

  return objects;
}

function extractStringField(block, key) {
  const re = new RegExp(`${key}\\s*:\\s*(['\"])((?:\\\\.|(?!\\1)[\\s\\S])*)\\1`, 'm');
  const match = block.match(re);
  return match ? match[2].trim() : '';
}

function extractAuthor(block) {
  const authorMatch = block.match(/author\s*:\s*\{([\s\S]*?)\n\s*\},/m);
  if (!authorMatch) return { name: '', role: '' };
  return {
    name: extractStringField(authorMatch[1], 'name'),
    role: extractStringField(authorMatch[1], 'role'),
  };
}

function extractFaqInfo(block) {
  const faqsIndex = block.search(/\bfaqs\s*:/);
  if (faqsIndex < 0) return { faqPresent: false, faqCount: 0 };

  const start = block.indexOf('[', faqsIndex);
  if (start < 0) return { faqPresent: true, faqCount: 0 };

  const end = findMatchingIndex(block, start, '[', ']');
  if (end < 0) return { faqPresent: true, faqCount: 0 };

  const faqsBlock = block.slice(start + 1, end);
  const questions = faqsBlock.match(/\bquestion\s*:/g);
  return { faqPresent: true, faqCount: questions ? questions.length : 0 };
}

function normalizePublicPath(assetPath) {
  if (!assetPath || !assetPath.startsWith('/')) return '';
  return path.join(PUBLIC_DIR, assetPath.replace(/^\//, ''));
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isIsoDate(value) {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function isUrlSafeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function looksLikeReadTime(readTime) {
  return /^\d+\s*min\s*read$/i.test(readTime.trim());
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function recommendWizardIconPath(iconPublicPaths, category, slug) {
  if (iconPublicPaths.length === 0) return '/images/blog/placeholder.svg';
  const key = `${category || 'default'}::${slug || 'default'}`.toLowerCase();
  const index = hashString(key) % iconPublicPaths.length;
  return iconPublicPaths[index];
}

function recommendAlt(title) {
  if (!title) return 'LandlordHeaven guide';
  let alt = `${title} - LandlordHeaven guide`;
  if (alt.length <= 125) return alt;
  const suffix = ' - LandlordHeaven guide';
  const maxTitle = Math.max(20, 125 - suffix.length - 1);
  const shortened = title.slice(0, maxTitle).trimEnd();
  return `${shortened}…${suffix}`;
}

function toIssue(severity, code, message) {
  return { severity, code, message };
}

function buildMarkdown(report) {
  const lines = [];
  lines.push('# Blog Readiness Audit (Content + Imagery)');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Strict mode: ${report.strictMode ? 'ON' : 'OFF'}`);
  lines.push('');
  lines.push('## How to run');
  lines.push('');
  lines.push('- `npm run blog:audit`');
  lines.push('- `npm run blog:audit:strict`');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total posts: **${report.summary.totalPosts}**`);
  lines.push(`- Critical issues: **${report.summary.criticalCount}**`);
  lines.push(`- Warning issues: **${report.summary.warningCount}**`);
  lines.push('');
  lines.push('## Top offenders');
  lines.push('');
  if (report.topOffenders.length === 0) {
    lines.push('- None');
  } else {
    for (const offender of report.topOffenders) {
      lines.push(`- **${offender.slug || '(missing-slug)'}**: ${offender.issueCount} total (${offender.criticalCount} critical / ${offender.warningCount} warning)`);
    }
  }
  lines.push('');
  lines.push('## Per-post details');
  lines.push('');
  lines.push('| Slug | Title | Issues | Recommended hero placeholder | Recommended alt | Meta length | FAQ count |');
  lines.push('|---|---|---|---|---|---:|---:|');

  for (const post of report.posts) {
    const issueText = post.issues.length
      ? post.issues.map((i) => `${i.severity}:${i.code}`).join('<br/>')
      : 'None';
    lines.push(
      `| ${post.slug || '(missing)'} | ${post.title || '(missing)'} | ${issueText} | ${post.recommendations.heroPlaceholder || '-'} | ${post.recommendations.heroImageAlt || '-'} | ${post.metaDescriptionLength} | ${post.faq.present ? post.faq.count : 'N/A'} |`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

async function runAudit() {
  const iconFiles = (await fs.readdir(WIZARD_ICONS_DIR)).sort();
  const iconPublicPaths = iconFiles.map((f) => `/images/wizard-icons/${f}`);

  const rawSource = await fs.readFile(POSTS_FILE, 'utf8');
  const arrayContent = extractBlogPostsArray(rawSource);
  const postBlocks = splitTopLevelObjects(arrayContent);

  const results = [];
  let criticalCount = 0;
  let warningCount = 0;

  for (const block of postBlocks) {
    const slug = extractStringField(block, 'slug');
    const title = extractStringField(block, 'title');
    const category = extractStringField(block, 'category');
    const date = extractStringField(block, 'date');
    const updatedDate = extractStringField(block, 'updatedDate');
    const description = extractStringField(block, 'description');
    const metaDescription = extractStringField(block, 'metaDescription');
    const readTime = extractStringField(block, 'readTime');
    const heroImage = extractStringField(block, 'heroImage');
    const heroImageAlt = extractStringField(block, 'heroImageAlt');
    const author = extractAuthor(block);
    const faq = extractFaqInfo(block);

    const issues = [];

    if (!slug) {
      issues.push(toIssue(SEVERITY.CRITICAL, 'missing-slug', 'slug is missing.'));
    } else if (!isUrlSafeSlug(slug)) {
      issues.push(toIssue(SEVERITY.WARNING, 'slug-not-url-safe', 'slug is not URL-safe (expected lowercase kebab-case).'));
    }

    if (!title) issues.push(toIssue(SEVERITY.CRITICAL, 'missing-title', 'title is missing.'));
    if (!category) issues.push(toIssue(SEVERITY.CRITICAL, 'missing-category', 'category is missing.'));

    if (!date) {
      issues.push(toIssue(SEVERITY.CRITICAL, 'missing-date', 'date is missing.'));
    } else if (!isIsoDate(date)) {
      issues.push(toIssue(SEVERITY.WARNING, 'invalid-date-format', 'date should be valid ISO YYYY-MM-DD.'));
    }

    if (updatedDate === '') {
      issues.push(toIssue(SEVERITY.WARNING, 'updated-date-empty', 'updatedDate is an empty string.'));
    } else if (updatedDate && !isIsoDate(updatedDate)) {
      issues.push(toIssue(SEVERITY.WARNING, 'invalid-updated-date-format', 'updatedDate should be valid ISO YYYY-MM-DD when present.'));
    }

    if (!description) issues.push(toIssue(SEVERITY.CRITICAL, 'missing-description', 'description is missing.'));
    if (!metaDescription) {
      issues.push(toIssue(SEVERITY.CRITICAL, 'missing-meta-description', 'metaDescription is missing.'));
    } else if (metaDescription.length < 120 || metaDescription.length > 160) {
      issues.push(toIssue(SEVERITY.WARNING, 'meta-description-length', 'metaDescription target length is 120-160 characters.'));
    }

    if (!readTime) {
      issues.push(toIssue(SEVERITY.WARNING, 'missing-read-time', 'readTime is missing.'));
    } else if (!looksLikeReadTime(readTime)) {
      issues.push(toIssue(SEVERITY.WARNING, 'read-time-format', 'readTime should resemble "X min read".'));
    }

    if (!author.name) issues.push(toIssue(SEVERITY.WARNING, 'missing-author-name', 'author.name is missing.'));
    if (!author.role) issues.push(toIssue(SEVERITY.WARNING, 'missing-author-role', 'author.role is missing.'));

    let heroImageExists = false;
    if (!heroImage) {
      issues.push(toIssue(SEVERITY.CRITICAL, 'missing-hero-image', 'heroImage is missing.'));
    } else {
      const resolved = normalizePublicPath(heroImage);
      if (!resolved) {
        issues.push(toIssue(SEVERITY.CRITICAL, 'invalid-hero-image-path', 'heroImage must be an absolute /public asset path.'));
      } else {
        heroImageExists = await pathExists(resolved);
        if (!heroImageExists) {
          issues.push(toIssue(SEVERITY.CRITICAL, 'missing-hero-image-file', `heroImage file not found under /public: ${heroImage}`));
        }
      }
    }

    if (!heroImageAlt) {
      issues.push(toIssue(SEVERITY.WARNING, 'missing-hero-image-alt', 'heroImageAlt is missing.'));
    }

    if (!faq.present) {
      issues.push(toIssue(SEVERITY.WARNING, 'faq-not-present', 'FAQ not present.'));
    }

    const postCritical = issues.filter((i) => i.severity === SEVERITY.CRITICAL).length;
    const postWarning = issues.filter((i) => i.severity === SEVERITY.WARNING).length;
    criticalCount += postCritical;
    warningCount += postWarning;

    const recommendedHeroPlaceholder = recommendWizardIconPath(iconPublicPaths, category, slug);

    results.push({
      slug,
      title,
      category,
      date,
      updatedDate,
      description,
      metaDescription,
      metaDescriptionLength: metaDescription.length,
      readTime,
      author,
      heroImage,
      heroImageExists,
      heroImageAlt,
      faq: {
        present: faq.faqPresent,
        count: faq.faqCount,
      },
      issues,
      recommendations: {
        heroPlaceholder: (!heroImage || !heroImageExists) ? recommendedHeroPlaceholder : '',
        heroImageAlt: !heroImageAlt ? recommendAlt(title) : '',
      },
    });
  }

  const topOffenders = [...results]
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      issueCount: post.issues.length,
      criticalCount: post.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
      warningCount: post.issues.filter((i) => i.severity === SEVERITY.WARNING).length,
    }))
    .sort((a, b) => b.issueCount - a.issueCount || b.criticalCount - a.criticalCount)
    .slice(0, 10);

  const report = {
    generatedAt: new Date().toISOString(),
    strictMode,
    source: 'src/lib/blog/posts.tsx',
    summary: {
      totalPosts: results.length,
      criticalCount,
      warningCount,
    },
    topOffenders,
    posts: results,
  };

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(JSON_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(MD_REPORT_PATH, `${buildMarkdown(report)}\n`);

  console.log('Blog audit complete');
  console.log(`- Total posts: ${report.summary.totalPosts}`);
  console.log(`- Critical issues: ${report.summary.criticalCount}`);
  console.log(`- Warning issues: ${report.summary.warningCount}`);
  console.log('- Top offenders:');
  for (const offender of topOffenders) {
    console.log(`  • ${offender.slug || '(missing-slug)'}: ${offender.issueCount} issues (${offender.criticalCount} critical / ${offender.warningCount} warning)`);
  }
  console.log(`- JSON report: ${path.relative(ROOT_DIR, JSON_REPORT_PATH)}`);
  console.log(`- Markdown report: ${path.relative(ROOT_DIR, MD_REPORT_PATH)}`);

  if (strictMode && criticalCount > 0) {
    process.exitCode = 1;
  }
}

runAudit().catch((error) => {
  console.error('Blog audit failed:', error);
  process.exit(1);
});
