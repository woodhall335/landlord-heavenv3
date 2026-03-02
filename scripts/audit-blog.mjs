#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const POSTS_FILE = path.join(ROOT_DIR, 'src/lib/blog/posts.tsx');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const OUTPUT_DIR = path.join(ROOT_DIR, 'audit-output');
const JSON_REPORT_PATH = path.join(OUTPUT_DIR, 'blog-audit.json');
const MD_REPORT_PATH = path.join(OUTPUT_DIR, 'blog-audit.md');

const args = process.argv.slice(2);
const strictMode = args.includes('--strict');

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
  const marker = 'export const blogPosts';
  const markerIndex = content.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find `export const blogPosts` in posts.tsx');

  const assignmentIndex = content.indexOf('=', markerIndex);
  const arrayStart = content.indexOf('[', assignmentIndex);
  if (arrayStart < 0) throw new Error('Could not find blogPosts array start.');

  const arrayEnd = findMatchingIndex(content, arrayStart, '[', ']');
  if (arrayEnd < 0) throw new Error('Could not find blogPosts array end.');

  return content.slice(arrayStart + 1, arrayEnd);
}

function splitTopLevelObjects(arrayContent) {
  const chunks = [];
  let depth = 0;
  let start = -1;
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
      if (depth === 0) start = i;
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        chunks.push(arrayContent.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return chunks;
}

function extractStringField(block, fieldName) {
  const regex = new RegExp(`${fieldName}\\s*:\\s*(['\"])((?:\\\\.|(?!\\1)[\\s\\S])*)\\1`, 'm');
  const match = block.match(regex);
  return match ? match[2].trim() : '';
}

function extractAuthor(block) {
  const match = block.match(/author\s*:\s*\{([\s\S]*?)\n\s*\},/m);
  if (!match) return { name: '', role: '' };
  return {
    name: extractStringField(match[1], 'name'),
    role: extractStringField(match[1], 'role'),
  };
}

function extractFaqCount(block) {
  const faqsIndex = block.search(/\bfaqs\s*:/);
  if (faqsIndex < 0) return { hasFaqs: false, faqCount: 0 };

  const bracketStart = block.indexOf('[', faqsIndex);
  if (bracketStart < 0) return { hasFaqs: true, faqCount: 0 };

  const bracketEnd = findMatchingIndex(block, bracketStart, '[', ']');
  if (bracketEnd < 0) return { hasFaqs: true, faqCount: 0 };

  const faqsBody = block.slice(bracketStart + 1, bracketEnd);
  const questionMatches = faqsBody.match(/\bquestion\s*:/g);

  return {
    hasFaqs: true,
    faqCount: questionMatches ? questionMatches.length : 0,
  };
}

function makePlaceholderPath(category) {
  const normalized = (category || 'default')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `/images/blog/placeholder-${normalized || 'default'}.svg`;
}

async function fileExistsUnderPublic(imagePath) {
  if (!imagePath || !imagePath.startsWith('/')) return false;
  const absolutePath = path.join(PUBLIC_DIR, imagePath.replace(/^\//, ''));
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

function toIssue(severity, code, message) {
  return { severity, code, message };
}

function buildMarkdown(report) {
  const lines = [];
  lines.push('# Blog Content + Imagery Readiness Audit');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Strict mode: ${report.strictMode ? 'ON' : 'OFF'}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total posts: **${report.summary.totalPosts}**`);
  lines.push(`- Critical issues: **${report.summary.criticalCount}**`);
  lines.push(`- Warnings: **${report.summary.warningCount}**`);
  lines.push('');
  lines.push('## How to run');
  lines.push('');
  lines.push('- `npm run blog:audit` (always exits 0)');
  lines.push('- `npm run blog:audit:strict` (exits non-zero if any CRITICAL issues exist)');
  lines.push('');
  lines.push('## Top 10 offenders');
  lines.push('');

  if (report.topOffenders.length === 0) {
    lines.push('No offenders found.');
  } else {
    for (const offender of report.topOffenders) {
      lines.push(`- **${offender.slug || '(missing-slug)'}** — ${offender.issueCount} issues (${offender.criticalCount} critical / ${offender.warningCount} warning)`);
    }
  }

  lines.push('');
  lines.push('## Per-post details');
  lines.push('');
  lines.push('| Slug | Category | Date | Updated | Hero Image | Exists | FAQ Count | Issues | Recommendations |');
  lines.push('|---|---|---|---|---|---:|---:|---|---|');

  for (const post of report.posts) {
    const issueText = post.issues.length
      ? post.issues.map((i) => `${i.severity}:${i.code}`).join('<br/>')
      : 'None';

    const recommendations = [];
    if (post.recommendations.heroImageFallback) {
      recommendations.push(`hero→${post.recommendations.heroImageFallback}`);
    }
    if (post.recommendations.heroImageAlt) {
      recommendations.push(`alt→${post.recommendations.heroImageAlt}`);
    }

    lines.push(
      `| ${post.slug || '(missing)'} | ${post.category || '(missing)'} | ${post.date || '(missing)'} | ${post.updatedDate || '-'} | ${post.heroImage || '(missing)'} | ${post.heroImageExists ? 'Yes' : 'No'} | ${post.faqCount} | ${issueText} | ${recommendations.join('<br/>') || '-'} |`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

async function main() {
  const rawPostsSource = await fs.readFile(POSTS_FILE, 'utf8');
  const blogPostsArray = extractBlogPostsArray(rawPostsSource);
  const postBlocks = splitTopLevelObjects(blogPostsArray);

  const auditedPosts = [];
  let criticalCount = 0;
  let warningCount = 0;

  for (const block of postBlocks) {
    const slug = extractStringField(block, 'slug');
    const title = extractStringField(block, 'title');
    const category = extractStringField(block, 'category');
    const date = extractStringField(block, 'date');
    const updatedDate = extractStringField(block, 'updatedDate');
    const readTime = extractStringField(block, 'readTime');
    const description = extractStringField(block, 'description');
    const metaDescription = extractStringField(block, 'metaDescription');
    const heroImage = extractStringField(block, 'heroImage');
    const heroImageAlt = extractStringField(block, 'heroImageAlt');
    const author = extractAuthor(block);
    const { hasFaqs, faqCount } = extractFaqCount(block);

    const heroImageExists = await fileExistsUnderPublic(heroImage);
    const issues = [];

    if (!slug) issues.push(toIssue('CRITICAL', 'missing-slug', 'Missing slug.'));
    if (!title) issues.push(toIssue('CRITICAL', 'missing-title', 'Missing title.'));
    if (!date) issues.push(toIssue('CRITICAL', 'missing-date', 'Missing date.'));
    if (!category) issues.push(toIssue('CRITICAL', 'missing-category', 'Missing category.'));

    if (!heroImage) {
      issues.push(toIssue('CRITICAL', 'missing-hero-image', 'Missing heroImage.'));
    } else if (!heroImageExists) {
      issues.push(toIssue('CRITICAL', 'broken-hero-image-path', `heroImage path does not exist under /public: ${heroImage}`));
    }

    if (!heroImageAlt) {
      issues.push(toIssue('WARNING', 'missing-hero-image-alt', 'Missing heroImageAlt.'));
    }

    if (!description && !metaDescription) {
      issues.push(toIssue('WARNING', 'missing-description-metadata', 'Missing description and metaDescription.'));
    }

    if (!author.name || !author.role) {
      issues.push(toIssue('WARNING', 'missing-author', 'Missing author name and/or role.'));
    }

    if (!readTime) {
      issues.push(toIssue('WARNING', 'missing-read-time', 'Missing readTime.'));
    }

    if (hasFaqs && faqCount < 3) {
      issues.push(toIssue('WARNING', 'low-faq-count', `FAQ count is ${faqCount}; expected at least 3 where FAQs exist.`));
    }

    for (const issue of issues) {
      if (issue.severity === 'CRITICAL') criticalCount += 1;
      if (issue.severity === 'WARNING') warningCount += 1;
    }

    const recommendations = {
      heroImageFallback: !heroImage || !heroImageExists ? makePlaceholderPath(category) : '',
      heroImageAlt: !heroImageAlt && title ? `${title} – LandlordHeaven guide` : '',
    };

    auditedPosts.push({
      slug,
      title,
      category,
      date,
      updatedDate,
      author,
      readTime,
      description,
      metaDescription,
      heroImage,
      heroImageExists,
      heroImageAlt,
      faqCount,
      issues,
      recommendations,
    });
  }

  const sortedByIssues = [...auditedPosts].sort((a, b) => b.issues.length - a.issues.length);
  const topOffenders = sortedByIssues.slice(0, 10).map((post) => ({
    slug: post.slug,
    issueCount: post.issues.length,
    criticalCount: post.issues.filter((i) => i.severity === 'CRITICAL').length,
    warningCount: post.issues.filter((i) => i.severity === 'WARNING').length,
  }));

  const report = {
    generatedAt: new Date().toISOString(),
    strictMode,
    source: 'src/lib/blog/posts.tsx',
    summary: {
      totalPosts: auditedPosts.length,
      criticalCount,
      warningCount,
    },
    topOffenders,
    posts: auditedPosts,
  };

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(JSON_REPORT_PATH, JSON.stringify(report, null, 2));
  await fs.writeFile(MD_REPORT_PATH, buildMarkdown(report));

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

main().catch((error) => {
  console.error('Blog audit failed:', error);
  process.exit(1);
});
