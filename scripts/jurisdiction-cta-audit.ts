#!/usr/bin/env npx tsx
/**
 * Jurisdiction CTA Audit Script
 *
 * Scans all blog posts and detects cross-jurisdiction CTA leakage:
 * Scotland/Wales/NI posts should NEVER show England-only CTAs (Section 21/8).
 *
 * Usage: npx tsx scripts/jurisdiction-cta-audit.ts
 *        npm run audit:cta-jurisdiction
 *
 * Exit codes:
 *   0 = No violations found
 *   1 = Violations detected
 */

import * as fs from 'fs';
import * as path from 'path';

// Import the helper function and types
// Note: Using relative path since we're in scripts/
import {
  getNextStepsCTAs,
  detectJurisdiction,
  ENGLAND_ONLY_URLS,
  type NextStepsCTA,
} from '../src/lib/blog/next-steps-cta';

interface BlogPost {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

interface Violation {
  slug: string;
  jurisdiction: string;
  offendingUrls: string[];
}

/**
 * Parse blog posts from posts.tsx file
 */
function parseBlogPosts(postsFilePath: string): BlogPost[] {
  const postsContent = fs.readFileSync(postsFilePath, 'utf-8');
  const posts: BlogPost[] = [];

  // Extract slugs
  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  const slugs: string[] = [];
  let match;
  while ((match = slugRegex.exec(postsContent)) !== null) {
    slugs.push(match[1]);
  }

  // Extract categories
  const categoryRegex = /category:\s*['"]([^'"]+)['"]/g;
  const categories: string[] = [];
  while ((match = categoryRegex.exec(postsContent)) !== null) {
    categories.push(match[1]);
  }

  // Extract tags
  const tagsRegex = /tags:\s*\[([\s\S]*?)\]/g;
  const allTags: string[][] = [];
  while ((match = tagsRegex.exec(postsContent)) !== null) {
    const tagsStr = match[1];
    const tagMatches = tagsStr.match(/['"]([^'"]+)['"]/g) || [];
    const tags = tagMatches.map((t) => t.replace(/['"]/g, ''));
    allTags.push(tags);
  }

  // Build post objects
  for (let i = 0; i < slugs.length; i++) {
    posts.push({
      slug: slugs[i],
      title: slugs[i],
      category: categories[i] || 'Unknown',
      tags: allTags[i] || [],
    });
  }

  return posts;
}

/**
 * Check if a CTA href is an England-only URL
 */
function isEnglandOnlyUrl(href: string): boolean {
  return ENGLAND_ONLY_URLS.some((url) => href.startsWith(url));
}

/**
 * Get all England-only CTAs from a list
 */
function getEnglandOnlyCTAs(ctas: NextStepsCTA[]): string[] {
  return ctas.filter((cta) => isEnglandOnlyUrl(cta.href)).map((cta) => cta.href);
}

/**
 * Main audit function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('JURISDICTION CTA AUDIT');
  console.log('Checking for cross-jurisdiction CTA leakage');
  console.log('='.repeat(60));
  console.log('');

  // Load blog posts
  const postsFilePath = path.join(__dirname, '../src/lib/blog/posts.tsx');
  if (!fs.existsSync(postsFilePath)) {
    console.error(`Error: Blog posts file not found at ${postsFilePath}`);
    process.exit(1);
  }

  const posts = parseBlogPosts(postsFilePath);
  console.log(`Found ${posts.length} blog posts\n`);

  // Counters
  let totalScanned = 0;
  let scotlandCount = 0;
  let walesCount = 0;
  let niCount = 0;
  let violationCount = 0;
  const violations: Violation[] = [];

  // Check each post
  for (const post of posts) {
    totalScanned++;
    const jurisdiction = detectJurisdiction(post.slug);

    // Track non-England posts
    if (jurisdiction === 'scotland') scotlandCount++;
    if (jurisdiction === 'wales') walesCount++;
    if (jurisdiction === 'northern-ireland') niCount++;

    // Only check non-England posts for violations
    if (
      jurisdiction === 'scotland' ||
      jurisdiction === 'wales' ||
      jurisdiction === 'northern-ireland'
    ) {
      const ctas = getNextStepsCTAs({
        slug: post.slug,
        tags: post.tags,
        category: post.category,
      });

      const offendingUrls = getEnglandOnlyCTAs(ctas);

      if (offendingUrls.length > 0) {
        violationCount++;
        violations.push({
          slug: post.slug,
          jurisdiction,
          offendingUrls,
        });
      }
    }
  }

  // Print summary
  console.log('SUMMARY');
  console.log('-'.repeat(50));
  console.log(`Total posts scanned:        ${totalScanned}`);
  console.log(`Scotland posts:             ${scotlandCount}`);
  console.log(`Wales posts:                ${walesCount}`);
  console.log(`Northern Ireland posts:     ${niCount}`);
  console.log(`Non-England posts total:    ${scotlandCount + walesCount + niCount}`);
  console.log('');
  console.log(`VIOLATIONS FOUND:           ${violationCount}`);
  console.log('');

  // Print violations if any
  if (violations.length > 0) {
    console.log('VIOLATIONS DETAIL');
    console.log('-'.repeat(50));
    console.log('slug | jurisdiction | offending_urls');
    console.log('-'.repeat(50));

    for (const v of violations) {
      console.log(`${v.slug} | ${v.jurisdiction} | ${v.offendingUrls.join(', ')}`);
    }

    console.log('');
    console.log('ERROR: Cross-jurisdiction CTA leakage detected!');
    console.log('Fix the CTA logic in src/lib/blog/next-steps-cta.ts');
    process.exit(1);
  }

  console.log('SUCCESS: No cross-jurisdiction CTA leakage detected.');
  console.log('All Scotland/Wales/NI posts have jurisdiction-appropriate CTAs.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
