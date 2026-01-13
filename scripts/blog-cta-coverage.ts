/**
 * Blog CTA Coverage Audit Script
 *
 * Analyzes blog posts and their NextSteps CTA coverage.
 * Outputs a CSV for audit purposes.
 *
 * Usage: npx tsx scripts/blog-cta-coverage.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Types matching src/lib/blog/types.ts
interface BlogPost {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

// Minimal StepLink for audit
interface StepLink {
  href: string;
  label: string;
  priority: number;
}

// Routes that exist - validated against src/app directory structure
const EXISTING_ROUTES = new Set([
  '/products/notice-only',
  '/products/complete-pack',
  '/products/money-claim',
  '/products/ast',
  '/tools/validators/section-21',
  '/tools/validators/section-8',
  '/tools/rent-arrears-calculator',
  '/tools/free-section-21-notice-generator',
  '/tools/free-section-8-notice-generator',
  '/tools/free-rent-demand-letter',
  '/tools/hmo-license-checker',
  '/section-21-notice-template',
  '/section-8-notice-template',
  '/tenancy-agreement-template',
  '/wales-eviction-notices',
  '/scotland-eviction-notices',
  '/how-to-evict-tenant',
  '/money-claim-unpaid-rent',
  '/ask-heaven',
  '/pricing',
  '/tenancy-agreements/england',
  '/tenancy-agreements/wales',
  '/tenancy-agreements/scotland',
  '/tenancy-agreements/northern-ireland',
]);

// Missing validators (should NOT be referenced)
const MISSING_VALIDATORS = new Set([
  '/tools/validators/wales-notice',
  '/tools/validators/scotland-notice-to-leave',
  '/tools/validators/tenancy-agreement',
  '/tools/validators/money-claim',
]);

// Cluster detection helpers
function detectCluster(slug: string, tags: string[]): string {
  const lowerSlug = slug.toLowerCase();
  const lowerTags = tags.map(t => t.toLowerCase());

  if (lowerSlug.includes('section-21') || lowerTags.some(t => t.includes('section 21'))) {
    return 'Section 21';
  }
  if (lowerSlug.includes('section-8') || lowerTags.some(t => t.includes('section 8'))) {
    return 'Section 8';
  }
  if (lowerSlug.includes('rent-arrears') || lowerSlug.includes('money-claim') || lowerTags.some(t => t.includes('arrears'))) {
    return 'Money/Arrears';
  }
  if (lowerSlug.includes('tenancy-agreement') || lowerSlug.includes('ast') || lowerSlug.includes('prt')) {
    return 'Tenancy';
  }
  if (lowerSlug.startsWith('wales-') || lowerSlug.includes('renting-homes')) {
    return 'Wales';
  }
  if (lowerSlug.startsWith('scotland-')) {
    return 'Scotland';
  }
  if (lowerSlug.startsWith('northern-ireland-')) {
    return 'NI';
  }
  if (lowerSlug.includes('hmo') || lowerTags.some(t => t.includes('hmo'))) {
    return 'HMO';
  }
  if (lowerSlug.includes('deposit') || lowerTags.some(t => t.includes('deposit'))) {
    return 'Deposit';
  }
  if (lowerSlug.includes('gas') || lowerSlug.includes('epc') || lowerSlug.includes('eicr') ||
      lowerSlug.includes('electrical') || lowerSlug.includes('smoke') || lowerSlug.includes('fire')) {
    return 'Compliance';
  }
  if (lowerSlug.includes('eviction') || lowerSlug.includes('possession')) {
    return 'Eviction';
  }
  return 'General';
}

function detectJurisdiction(slug: string): string {
  const lowerSlug = slug.toLowerCase();
  if (lowerSlug.startsWith('england-')) return 'England';
  if (lowerSlug.startsWith('wales-') || lowerSlug.includes('renting-homes')) return 'Wales';
  if (lowerSlug.startsWith('scotland-')) return 'Scotland';
  if (lowerSlug.startsWith('northern-ireland-')) return 'NI';
  if (lowerSlug.startsWith('uk-')) return 'UK-Wide';
  return 'England'; // Default assumption
}

/**
 * Replicate the NextSteps logic for CTA computation
 * This mirrors src/components/blog/NextSteps.tsx getNextStepsForPost()
 */
function getNextStepsForPost(slug: string, category: string, tags: string[]): StepLink[] {
  const steps: StepLink[] = [];
  const lowerTags = tags.map((t) => t.toLowerCase());
  const lowerSlug = slug.toLowerCase();
  const lowerCategory = category.toLowerCase();

  // Check for Section 21 related content
  if (
    lowerSlug.includes('section-21') ||
    lowerTags.some((t) => t.includes('section 21')) ||
    lowerSlug.includes('no-fault') ||
    lowerSlug.includes('assured-shorthold')
  ) {
    steps.push({
      href: '/section-21-notice-template',
      label: 'Section 21 Notice Template',
      priority: 1,
    });
    steps.push({
      href: '/products/notice-only',
      label: 'Section 21 Notice Pack',
      priority: 3,
    });
    steps.push({
      href: '/tools/validators/section-21',
      label: 'Section 21 Validity Checker',
      priority: 2,
    });
  }

  // Check for Section 8 related content (England only)
  // Exclude Scotland/Wales/NI posts from matching on 'ground-' since they have different legal frameworks
  const isEnglandContent = !lowerSlug.startsWith('scotland-') &&
                           !lowerSlug.startsWith('wales-') &&
                           !lowerSlug.startsWith('northern-ireland-');
  const isSection8Related = lowerSlug.includes('section-8') ||
    lowerTags.some((t) => t.includes('section 8')) ||
    (lowerSlug.includes('ground-') && isEnglandContent);

  if (isSection8Related) {
    steps.push({
      href: '/section-8-notice-template',
      label: 'Section 8 Notice Template',
      priority: 1,
    });
    steps.push({
      href: '/products/complete-pack',
      label: 'Complete Eviction Pack',
      priority: 3,
    });
    steps.push({
      href: '/tools/validators/section-8',
      label: 'Section 8 Grounds Checker',
      priority: 2,
    });
  }

  // Check for rent arrears content
  if (
    lowerSlug.includes('rent-arrears') ||
    lowerSlug.includes('unpaid-rent') ||
    lowerSlug.includes('money-claim') ||
    lowerTags.some((t) => t.includes('arrears'))
  ) {
    steps.push({
      href: '/products/money-claim',
      label: 'Money Claim Pack',
      priority: 1,
    });
    steps.push({
      href: '/tools/rent-arrears-calculator',
      label: 'Rent Arrears Calculator',
      priority: 2,
    });
  }

  // Check for tenancy agreement content
  if (
    lowerSlug.includes('tenancy-agreement') ||
    lowerSlug.includes('ast') ||
    lowerSlug.includes('occupation-contract') ||
    lowerSlug.includes('prt') ||
    lowerCategory.includes('tenancy')
  ) {
    steps.push({
      href: '/products/ast',
      label: 'Tenancy Agreement Generator',
      priority: 1,
    });
    steps.push({
      href: '/tenancy-agreement-template',
      label: 'Tenancy Agreement Template',
      priority: 2,
    });
    steps.push({
      href: '/ask-heaven',
      label: 'Ask About Tenancy Agreements',
      priority: 3,
    });
  }

  // Check for Wales-specific content
  if (lowerSlug.startsWith('wales-') || lowerSlug.includes('renting-homes')) {
    steps.push({
      href: '/wales-eviction-notices',
      label: 'Wales Eviction Guide',
      priority: 1,
    });
    steps.push({
      href: '/ask-heaven',
      label: 'Ask Heaven for Wales',
      priority: 2,
    });
    if (!steps.some((s) => s.href.includes('notice-only'))) {
      steps.push({
        href: '/products/notice-only',
        label: 'Wales Notice Pack',
        priority: 3,
      });
    }
  }

  // Check for Scotland-specific content
  if (lowerSlug.startsWith('scotland-')) {
    steps.push({
      href: '/scotland-eviction-notices',
      label: 'Scotland Eviction Guide',
      priority: 1,
    });
    steps.push({
      href: '/ask-heaven',
      label: 'Ask Heaven for Scotland',
      priority: 2,
    });
    if (!steps.some((s) => s.href.includes('notice-only'))) {
      steps.push({
        href: '/products/notice-only',
        label: 'Scotland Notice Pack',
        priority: 3,
      });
    }
  }

  // Check for eviction/possession content
  if (
    lowerSlug.includes('eviction') ||
    lowerSlug.includes('possession') ||
    lowerSlug.includes('bailiff') ||
    lowerCategory.includes('eviction')
  ) {
    if (!steps.some((s) => s.href.includes('complete-pack'))) {
      steps.push({
        href: '/products/complete-pack',
        label: 'Complete Eviction Pack',
        priority: 1,
      });
    }
  }

  // Check for deposit protection content
  if (
    lowerSlug.includes('deposit') ||
    lowerTags.some((t) => t.includes('deposit'))
  ) {
    steps.push({
      href: '/ask-heaven',
      label: 'Ask About Deposit Rules',
      priority: 2,
    });
  }

  // Check for gas safety content
  if (
    lowerSlug.includes('gas-safety') ||
    lowerSlug.includes('gas-safe') ||
    lowerTags.some((t) => t.includes('gas safety'))
  ) {
    steps.push({
      href: '/ask-heaven',
      label: 'Ask About Gas Safety',
      priority: 2,
    });
  }

  // Check for EPC content
  if (
    lowerSlug.includes('epc') ||
    lowerSlug.includes('energy-performance') ||
    lowerTags.some((t) => t.includes('epc'))
  ) {
    steps.push({
      href: '/ask-heaven',
      label: 'Ask About EPC Rules',
      priority: 2,
    });
  }

  // Check for electrical safety / EICR content
  if (
    lowerSlug.includes('eicr') ||
    lowerSlug.includes('electrical-safety') ||
    lowerTags.some((t) => t.includes('eicr') || t.includes('electrical'))
  ) {
    steps.push({
      href: '/ask-heaven',
      label: 'Ask About EICR Rules',
      priority: 2,
    });
  }

  // Check for smoke/CO alarm / fire safety content
  if (
    lowerSlug.includes('smoke') ||
    lowerSlug.includes('fire-safety') ||
    lowerSlug.includes('carbon-monoxide') ||
    lowerSlug.includes('co-alarm') ||
    lowerTags.some((t) => t.includes('smoke') || t.includes('fire safety'))
  ) {
    steps.push({
      href: '/ask-heaven',
      label: 'Ask About Fire Safety',
      priority: 2,
    });
  }

  // Check for right to rent content
  if (
    lowerSlug.includes('right-to-rent') ||
    lowerTags.some((t) => t.includes('right to rent'))
  ) {
    steps.push({
      href: '/ask-heaven',
      label: 'Ask About Right to Rent',
      priority: 2,
    });
  }

  // Check for inventory content
  if (
    lowerSlug.includes('inventory') ||
    lowerTags.some((t) => t.includes('inventory'))
  ) {
    steps.push({
      href: '/ask-heaven',
      label: 'Ask About Inventories',
      priority: 3,
    });
  }

  // Check for Northern Ireland content
  if (lowerSlug.startsWith('northern-ireland-')) {
    if (!steps.some((s) => s.href.includes('ask-heaven'))) {
      steps.push({
        href: '/ask-heaven',
        label: 'Ask Heaven for NI',
        priority: 2,
      });
    }
    if (!steps.some((s) => s.href.includes('ast'))) {
      steps.push({
        href: '/products/ast',
        label: 'NI Tenancy Agreement',
        priority: 3,
      });
    }
  }

  // Check for HMO content
  if (
    lowerSlug.includes('hmo') ||
    lowerTags.some((t) => t.includes('hmo'))
  ) {
    steps.push({
      href: '/ask-heaven',
      label: 'Ask About HMO Rules',
      priority: 3,
    });
  }

  // Check for Rent Smart Wales (specific case)
  if (lowerSlug === 'rent-smart-wales') {
    steps.push({
      href: '/wales-eviction-notices',
      label: 'Wales Eviction Guide',
      priority: 1,
    });
    steps.push({
      href: '/ask-heaven',
      label: 'Ask Heaven for Wales',
      priority: 2,
    });
  }

  // Enhanced fallback for general UK-wide landlord guides
  if (steps.length === 0 || (steps.length === 1 && steps[0].priority >= 10)) {
    steps.push({
      href: '/ask-heaven',
      label: 'Ask Heaven',
      priority: 1,
    });
    if (!steps.some((s) => s.href.includes('ast'))) {
      steps.push({
        href: '/products/ast',
        label: 'Tenancy Agreement Generator',
        priority: 2,
      });
    }
    steps.push({
      href: '/how-to-evict-tenant',
      label: 'UK Eviction Guide',
      priority: 3,
    });
  }

  // Always add pricing as a fallback
  if (!steps.some((s) => s.href === '/pricing')) {
    steps.push({
      href: '/pricing',
      label: 'View All Products',
      priority: 10,
    });
  }

  // Sort by priority, remove duplicates, take top 4
  return steps
    .sort((a, b) => a.priority - b.priority)
    .filter((step, index, arr) => arr.findIndex((s) => s.href === step.href) === index)
    .slice(0, 4);
}

function isMeaningfulCTA(href: string): boolean {
  // Generic fallbacks are not "meaningful" for audit purposes
  if (href === '/pricing') return false;
  if (href === '/ask-heaven') return true; // Ask Heaven is meaningful
  return true;
}

function hasMissingRoute(steps: StepLink[]): boolean {
  return steps.some(s => MISSING_VALIDATORS.has(s.href));
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  // Read the blog posts file and extract post metadata
  const postsFilePath = path.join(__dirname, '../src/lib/blog/posts.tsx');
  const postsContent = fs.readFileSync(postsFilePath, 'utf-8');

  // Parse posts using regex (since we can't import TSX directly)
  const posts: BlogPost[] = [];
  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  const categoryRegex = /category:\s*['"]([^'"]+)['"]/g;
  const tagsRegex = /tags:\s*\[([\s\S]*?)\]/g;

  let slugMatch;
  const slugs: string[] = [];
  while ((slugMatch = slugRegex.exec(postsContent)) !== null) {
    slugs.push(slugMatch[1]);
  }

  let categoryMatch;
  const categories: string[] = [];
  while ((categoryMatch = categoryRegex.exec(postsContent)) !== null) {
    categories.push(categoryMatch[1]);
  }

  let tagsMatch;
  const allTags: string[][] = [];
  while ((tagsMatch = tagsRegex.exec(postsContent)) !== null) {
    const tagsStr = tagsMatch[1];
    const tagMatches = tagsStr.match(/['"]([^'"]+)['"]/g) || [];
    const tags = tagMatches.map(t => t.replace(/['"]/g, ''));
    allTags.push(tags);
  }

  // Build post objects
  for (let i = 0; i < slugs.length; i++) {
    posts.push({
      slug: slugs[i],
      title: slugs[i], // We don't need title for this audit
      category: categories[i] || 'Unknown',
      tags: allTags[i] || [],
    });
  }

  console.log(`Found ${posts.length} blog posts\n`);

  // Analyze each post
  const results: Array<{
    slug: string;
    category: string;
    tags: string;
    detected_topics: string;
    ctas_rendered_count: number;
    cta_labels: string;
    cta_urls: string;
    uses_missing_route: string;
    meaningful_ctas: number;
    recommended_ctas: string;
    jurisdiction_assumptions: string;
    notes: string;
  }> = [];

  // Counters for summary
  let totalPosts = 0;
  let postsWithZeroMeaningfulCTAs = 0;
  let postsWithOnlyFallback = 0;
  let postsWithMissingRoutes = 0;

  const clusterStats: Record<string, { total: number; withMeaningfulCTAs: number }> = {};

  for (const post of posts) {
    totalPosts++;
    const steps = getNextStepsForPost(post.slug, post.category, post.tags);
    const meaningfulSteps = steps.filter(s => isMeaningfulCTA(s.href));
    const cluster = detectCluster(post.slug, post.tags);
    const jurisdiction = detectJurisdiction(post.slug);

    // Update cluster stats
    if (!clusterStats[cluster]) {
      clusterStats[cluster] = { total: 0, withMeaningfulCTAs: 0 };
    }
    clusterStats[cluster].total++;
    if (meaningfulSteps.length > 0) {
      clusterStats[cluster].withMeaningfulCTAs++;
    }

    // Count issues
    if (meaningfulSteps.length === 0) {
      postsWithZeroMeaningfulCTAs++;
    }
    if (steps.length === 1 && steps[0].href === '/pricing') {
      postsWithOnlyFallback++;
    }
    if (hasMissingRoute(steps)) {
      postsWithMissingRoutes++;
    }

    // Generate recommendations
    let recommendations: string[] = [];
    if (meaningfulSteps.length < 3) {
      recommendations.push('Add more context-specific CTAs');
    }
    if (cluster === 'General' && meaningfulSteps.length === 0) {
      recommendations.push('Tag post for better CTA matching');
    }

    // Notes
    let notes = '';
    if (meaningfulSteps.length === 0) {
      notes = 'Only generic fallback CTA';
    } else if (meaningfulSteps.length < 2) {
      notes = 'Limited CTA coverage';
    } else if (meaningfulSteps.length >= 3) {
      notes = 'Good coverage';
    }

    results.push({
      slug: post.slug,
      category: post.category,
      tags: post.tags.join('; '),
      detected_topics: cluster,
      ctas_rendered_count: steps.length,
      cta_labels: steps.map(s => s.label).join('; '),
      cta_urls: steps.map(s => s.href).join('; '),
      uses_missing_route: hasMissingRoute(steps) ? 'Y' : 'N',
      meaningful_ctas: meaningfulSteps.length,
      recommended_ctas: recommendations.join('; ') || 'None needed',
      jurisdiction_assumptions: jurisdiction,
      notes: notes,
    });
  }

  // Write CSV
  const csvHeader = 'slug,category,tags,detected_topics,ctas_rendered_count,cta_labels,cta_urls,uses_missing_route,meaningful_ctas,recommended_ctas,jurisdiction_assumptions,notes';
  const csvRows = results.map(r =>
    [
      escapeCSV(r.slug),
      escapeCSV(r.category),
      escapeCSV(r.tags),
      escapeCSV(r.detected_topics),
      r.ctas_rendered_count,
      escapeCSV(r.cta_labels),
      escapeCSV(r.cta_urls),
      r.uses_missing_route,
      r.meaningful_ctas,
      escapeCSV(r.recommended_ctas),
      escapeCSV(r.jurisdiction_assumptions),
      escapeCSV(r.notes),
    ].join(',')
  );

  const csvContent = [csvHeader, ...csvRows].join('\n');
  const csvPath = path.join(__dirname, '../docs/audit-reports/blog-cta-coverage.csv');
  fs.writeFileSync(csvPath, csvContent);
  console.log(`CSV written to: ${csvPath}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('BLOG CTA COVERAGE SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTotal blog posts: ${totalPosts}`);
  console.log(`Posts with 0 meaningful CTAs: ${postsWithZeroMeaningfulCTAs} (${((postsWithZeroMeaningfulCTAs/totalPosts)*100).toFixed(1)}%)`);
  console.log(`Posts with only fallback (/pricing): ${postsWithOnlyFallback} (${((postsWithOnlyFallback/totalPosts)*100).toFixed(1)}%)`);
  console.log(`Posts linking to missing validators: ${postsWithMissingRoutes}`);

  console.log('\n\nCLUSTER BREAKDOWN:');
  console.log('-'.repeat(50));
  for (const [cluster, stats] of Object.entries(clusterStats).sort((a, b) => b[1].total - a[1].total)) {
    const coverage = ((stats.withMeaningfulCTAs / stats.total) * 100).toFixed(1);
    console.log(`${cluster.padEnd(15)} : ${stats.total} posts, ${stats.withMeaningfulCTAs} with meaningful CTAs (${coverage}%)`);
  }

  // Verify the "15/106" claim
  const postsWithContext = totalPosts - postsWithZeroMeaningfulCTAs;
  console.log('\n\n"15/106" CLAIM VERIFICATION:');
  console.log('-'.repeat(50));
  console.log(`Posts with context-aware CTAs: ${postsWithContext} of ${totalPosts}`);
  console.log(`Posts without context-aware CTAs: ${postsWithZeroMeaningfulCTAs} of ${totalPosts}`);
  if (postsWithContext >= 15) {
    console.log('\n✅ The claim that only 15 posts have CTAs is INCORRECT.');
    console.log(`   Actual: ${postsWithContext} posts have context-aware CTAs (${((postsWithContext/totalPosts)*100).toFixed(1)}%)`);
  } else {
    console.log(`\n⚠️  Only ${postsWithContext} posts have context-aware CTAs`);
  }

  console.log('\n');
}

main().catch(console.error);
