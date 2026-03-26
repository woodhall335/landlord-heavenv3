/**
 * Sitemap Audit Script
 *
 * Validates the sitemap.xml for:
 * - No duplicate URLs
 * - All blog posts are included
 * - All category pages are included
 * - URLs use canonical domain
 * - Required pages are present
 */

import { blogPosts } from '../src/lib/blog/posts';
import { SITE_ORIGIN } from '../src/lib/seo/urls';
import { getValidRegions } from '../src/lib/blog/categories';

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Sitemap-Audit/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function extractLocs(xml: string) {
  const locs: string[] = [];
  const regex = /<loc>([^<]+)<\/loc>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(xml)) !== null) {
    locs.push(match[1]);
  }

  return locs;
}

function findDuplicates(urls: string[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const url of urls) {
    if (seen.has(url)) {
      duplicates.push(url);
    } else {
      seen.add(url);
    }
  }

  return duplicates;
}

async function run() {
  const baseUrl = process.env.SEO_AUDIT_BASE_URL || SITE_ORIGIN;
  const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString();
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(`\nSitemap Audit: ${sitemapUrl}\n`);
  console.log('-'.repeat(50));

  const xml = await fetchText(sitemapUrl);
  const locs = extractLocs(xml);

  console.log(`\nTotal URLs in sitemap: ${locs.length}`);

  console.log('\nChecking for duplicate URLs...');
  const duplicates = findDuplicates(locs);
  if (duplicates.length > 0) {
    errors.push(`Found ${duplicates.length} duplicate URL(s): ${duplicates.join(', ')}`);
    console.log(`   FAIL Found ${duplicates.length} duplicate(s)`);
  } else {
    console.log('   PASS No duplicate URLs found');
  }

  console.log('\nChecking canonical domain...');
  const nonCanonical = locs.filter((loc) => !loc.startsWith(SITE_ORIGIN));
  if (nonCanonical.length > 0) {
    errors.push(
      `${nonCanonical.length} URL(s) do not use canonical domain: ${nonCanonical.slice(0, 5).join(', ')}`
    );
    console.log(`   FAIL Found ${nonCanonical.length} non-canonical URL(s)`);
  } else {
    console.log('   PASS All URLs use canonical domain');
  }

  const locSet = new Set(locs);

  console.log('\nChecking blog posts...');
  const expectedBlogUrls = blogPosts.map((post) => `${SITE_ORIGIN}/blog/${post.slug}`);
  const missingBlog = expectedBlogUrls.filter((loc) => !locSet.has(loc));
  if (missingBlog.length > 0) {
    errors.push(`Missing ${missingBlog.length} blog URL(s): ${missingBlog.slice(0, 5).join(', ')}`);
    console.log(`   FAIL Missing ${missingBlog.length} blog post(s)`);
  } else {
    console.log(`   PASS All ${blogPosts.length} blog posts present`);
  }

  console.log('\nChecking category pages...');
  const categoryUrls = getValidRegions().map((region) => `${SITE_ORIGIN}/blog/${region}`);
  const missingCategories = categoryUrls.filter((loc) => !locSet.has(loc));
  if (missingCategories.length > 0) {
    errors.push(`Missing ${missingCategories.length} category page(s): ${missingCategories.join(', ')}`);
    console.log(`   FAIL Missing ${missingCategories.length} category page(s)`);
  } else {
    console.log(`   PASS All ${categoryUrls.length} category pages present`);
  }

  console.log('\nChecking required pages...');
  const requiredPages = [
    '/',
    '/pricing',
    '/blog',
    '/tools',
    '/eviction-notice',
    '/products/notice-only',
    '/products/complete-pack',
    '/products/money-claim',
    '/products/ast',
    '/section-21-notice-template',
    '/section-8-notice-template',
    '/tenancy-agreement-template',
  ];

  const missingRequired = requiredPages
    .map((routePath) => `${SITE_ORIGIN}${routePath}`)
    .filter((url) => !locSet.has(url));

  if (missingRequired.length > 0) {
    errors.push(`Missing ${missingRequired.length} required page(s): ${missingRequired.join(', ')}`);
    console.log(`   FAIL Missing ${missingRequired.length} required page(s)`);
  } else {
    console.log(`   PASS All ${requiredPages.length} required pages present`);
  }

  console.log('\nChecking tool pages...');
  const toolPages = [
    '/eviction-notice',
    '/tools/rent-arrears-calculator',
    '/tools/free-rent-demand-letter',
  ];

  const missingTools = toolPages
    .map((routePath) => `${SITE_ORIGIN}${routePath}`)
    .filter((url) => !locSet.has(url));

  if (missingTools.length > 0) {
    warnings.push(`Missing ${missingTools.length} tool page(s): ${missingTools.join(', ')}`);
    console.log(`   WARN Missing ${missingTools.length} tool page(s)`);
  } else {
    console.log(`   PASS All ${toolPages.length} tool pages present`);
  }

  console.log(`\n${'-'.repeat(50)}`);
  console.log('\nAUDIT SUMMARY\n');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('PASS All checks passed\n');
    return;
  }

  if (warnings.length > 0) {
    console.log(`WARNINGS (${warnings.length}):`);
    warnings.forEach((warning) => console.log(`   - ${warning}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log(`ERRORS (${errors.length}):`);
    errors.forEach((error) => console.log(`   - ${error}`));
    console.log('');
    throw new Error(`Sitemap audit failed with ${errors.length} error(s)`);
  }
}

run().catch((error) => {
  console.error(`\nERROR ${error.message}\n`);
  process.exit(1);
});
