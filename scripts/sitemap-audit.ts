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
  let errors: string[] = [];
  let warnings: string[] = [];

  console.log(`\n📋 Sitemap Audit: ${sitemapUrl}\n`);
  console.log('─'.repeat(50));

  const xml = await fetchText(sitemapUrl);
  const locs = extractLocs(xml);

  console.log(`\n📊 Total URLs in sitemap: ${locs.length}`);

  // 1. Check for duplicates
  console.log('\n🔍 Checking for duplicate URLs...');
  const duplicates = findDuplicates(locs);
  if (duplicates.length > 0) {
    errors.push(`Found ${duplicates.length} duplicate URL(s): ${duplicates.join(', ')}`);
    console.log(`   ❌ Found ${duplicates.length} duplicate(s)`);
  } else {
    console.log('   ✅ No duplicate URLs found');
  }

  // 2. Check canonical domain
  console.log('\n🔍 Checking canonical domain...');
  const nonCanonical = locs.filter((loc) => !loc.startsWith(SITE_ORIGIN));
  if (nonCanonical.length > 0) {
    errors.push(`${nonCanonical.length} URL(s) don't use canonical domain: ${nonCanonical.slice(0, 5).join(', ')}`);
    console.log(`   ❌ Found ${nonCanonical.length} non-canonical URL(s)`);
  } else {
    console.log('   ✅ All URLs use canonical domain');
  }

  const locSet = new Set(locs);

  // 3. Check blog posts
  console.log('\n🔍 Checking blog posts...');
  const expectedBlogUrls = blogPosts.map((post) => `${SITE_ORIGIN}/blog/${post.slug}`);
  const missingBlog = expectedBlogUrls.filter((loc) => !locSet.has(loc));
  if (missingBlog.length > 0) {
    errors.push(`Missing ${missingBlog.length} blog URL(s): ${missingBlog.slice(0, 5).join(', ')}`);
    console.log(`   ❌ Missing ${missingBlog.length} blog post(s)`);
  } else {
    console.log(`   ✅ All ${blogPosts.length} blog posts present`);
  }

  // 4. Check category pages
  console.log('\n🔍 Checking category pages...');
  const categoryUrls = getValidRegions().map((region) => `${SITE_ORIGIN}/blog/${region}`);
  const missingCategories = categoryUrls.filter((loc) => !locSet.has(loc));
  if (missingCategories.length > 0) {
    errors.push(`Missing ${missingCategories.length} category page(s): ${missingCategories.join(', ')}`);
    console.log(`   ❌ Missing ${missingCategories.length} category page(s)`);
  } else {
    console.log(`   ✅ All ${categoryUrls.length} category pages present`);
  }

  // 5. Check required pages
  console.log('\n🔍 Checking required pages...');
  const requiredPages = [
    '/',
    '/pricing',
    '/blog',
    '/tools',
    '/tools/validators',
    '/products/notice-only',
    '/products/complete-pack',
    '/products/money-claim',
    '/products/ast',
    '/section-21-notice-template',
    '/section-8-notice-template',
    '/tenancy-agreement-template',
  ];

  const missingRequired = requiredPages
    .map((path) => `${SITE_ORIGIN}${path}`)
    .filter((url) => !locSet.has(url));

  if (missingRequired.length > 0) {
    errors.push(`Missing ${missingRequired.length} required page(s): ${missingRequired.join(', ')}`);
    console.log(`   ❌ Missing ${missingRequired.length} required page(s)`);
  } else {
    console.log(`   ✅ All ${requiredPages.length} required pages present`);
  }

  // 6. Check tool pages
  console.log('\n🔍 Checking tool pages...');
  const validatorPages = [
    '/tools/validators/section-21',
    '/tools/validators/section-8',
    '/tools/validators/wales-notice',
    '/tools/validators/scotland-notice-to-leave',
    '/tools/validators/tenancy-agreement',
    '/tools/validators/money-claim',
  ];

  const missingValidators = validatorPages
    .map((path) => `${SITE_ORIGIN}${path}`)
    .filter((url) => !locSet.has(url));

  if (missingValidators.length > 0) {
    warnings.push(`Missing ${missingValidators.length} validator page(s): ${missingValidators.join(', ')}`);
    console.log(`   ⚠️ Missing ${missingValidators.length} validator page(s)`);
  } else {
    console.log(`   ✅ All ${validatorPages.length} validator pages present`);
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log('\n📋 AUDIT SUMMARY\n');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed!\n');
    return;
  }

  if (warnings.length > 0) {
    console.log(`⚠️ Warnings (${warnings.length}):`);
    warnings.forEach((w) => console.log(`   - ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log(`❌ Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`   - ${e}`));
    console.log('');
    throw new Error(`Sitemap audit failed with ${errors.length} error(s)`);
  }
}

run().catch((error) => {
  console.error(`\n❌ ${error.message}\n`);
  process.exit(1);
});
