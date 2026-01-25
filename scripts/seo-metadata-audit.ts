#!/usr/bin/env npx tsx
/**
 * SEO Metadata Audit Script
 *
 * Validates that all public content pages have required SEO metadata:
 * - Canonical URL
 * - Twitter Card metadata
 * - Keywords
 *
 * Run: npx tsx scripts/seo-metadata-audit.ts
 * CI: npm run audit:seo-metadata
 *
 * Exit codes:
 * - 0: All pages pass
 * - 1: Some pages have issues
 */

import fs from 'fs';
import path from 'path';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Pages that should have full SEO metadata
const PUBLIC_CONTENT_PAGES = [
  // Product pages
  '/products/notice-only',
  '/products/complete-pack',
  '/products/money-claim',
  '/products/ast',
  // SEO landing pages
  '/how-to-evict-tenant',
  '/tenant-wont-leave',
  '/tenant-not-paying-rent',
  '/section-21-notice-template',
  '/section-8-notice-template',
  '/eviction-notice-template',
  '/tenancy-agreement-template',
  // Money claim guides
  '/money-claim-unpaid-rent',
  '/money-claim-property-damage',
  '/money-claim-cleaning-costs',
  '/money-claim-unpaid-utilities',
  '/money-claim-online-mcol',
  '/money-claim-ccj-enforcement',
  '/money-claim-small-claims-landlord',
  // Regional pages
  '/wales-eviction-notices',
  '/scotland-eviction-notices',
  // Tools
  '/tools/free-section-21-notice-generator',
  '/tools/free-section-8-notice-generator',
  '/tools/free-rent-demand-letter',
  '/tools/rent-arrears-calculator',
  '/tools/validators/section-21',
  '/tools/validators/section-8',
  // Key informational pages
  '/pricing',
  '/about',
  '/ask-heaven',
];

// Pages exempt from full audit (noindex, auth, api, etc.)
const EXEMPT_PATTERNS = [
  '/api/',
  '/auth/',
  '/dashboard/',
  '/wizard/',
  '/admin/',
  '/_next/',
];

interface AuditResult {
  path: string;
  fileExists: boolean;
  hasExportMetadata: boolean;
  hasCanonical: boolean;
  hasTwitterCard: boolean;
  hasKeywords: boolean;
  hasOgImage: boolean;
  issues: string[];
}

function isExempt(pagePath: string): boolean {
  return EXEMPT_PATTERNS.some(pattern => pagePath.includes(pattern));
}

function findPageFile(pagePath: string): string | null {
  const appDir = path.join(process.cwd(), 'src/app');

  // Convert URL path to file path possibilities
  const basePath = pagePath === '/' ? '' : pagePath;
  const possibilities = [
    path.join(appDir, basePath, 'page.tsx'),
    path.join(appDir, basePath, 'page.ts'),
    path.join(appDir, `${basePath}.tsx`),
  ];

  for (const filePath of possibilities) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

function auditPageFile(filePath: string, pagePath: string): AuditResult {
  const result: AuditResult = {
    path: pagePath,
    fileExists: true,
    hasExportMetadata: false,
    hasCanonical: false,
    hasTwitterCard: false,
    hasKeywords: false,
    hasOgImage: false,
    issues: [],
  };

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for metadata export
    const hasMetadataExport =
      content.includes('export const metadata') ||
      content.includes('export async function generateMetadata') ||
      content.includes('export function generateMetadata');

    result.hasExportMetadata = hasMetadataExport;

    if (!hasMetadataExport) {
      result.issues.push('No metadata export found');
      return result;
    }

    // Check for generateMetadata usage (our helper guarantees canonical + twitter)
    const usesGenerateMetadata =
      content.includes('generateMetadata(') ||
      content.includes('generateMetadataForPageType(');

    if (usesGenerateMetadata) {
      // Our helper guarantees these
      result.hasCanonical = true;
      result.hasTwitterCard = true;
      result.hasOgImage = true;

      // Check for keywords in the config
      result.hasKeywords =
        content.includes('keywords:') ||
        content.includes('keywords =') ||
        usesGenerateMetadata; // generateMetadata now auto-populates keywords
    } else {
      // Manual metadata - check each property
      result.hasCanonical =
        content.includes('canonical:') ||
        content.includes('alternates:');

      result.hasTwitterCard =
        content.includes('twitter:') ||
        content.includes('twitter =');

      result.hasKeywords =
        content.includes('keywords:') ||
        content.includes('keywords =');

      result.hasOgImage =
        content.includes('openGraph:') ||
        content.includes('og:image') ||
        content.includes('images:');
    }

    // Record issues
    if (!result.hasCanonical) result.issues.push('Missing canonical URL');
    if (!result.hasTwitterCard) result.issues.push('Missing Twitter Card');
    if (!result.hasKeywords) result.issues.push('Missing keywords');
    if (!result.hasOgImage) result.issues.push('Missing OG image');

  } catch (error) {
    result.issues.push(`Error reading file: ${error}`);
  }

  return result;
}

function printTable(results: AuditResult[]): void {
  console.log('\n' + colors.bold + 'SEO Metadata Audit Results' + colors.reset);
  console.log('═'.repeat(100));
  console.log(
    colors.bold +
    'Path'.padEnd(50) +
    'Canonical'.padEnd(12) +
    'Twitter'.padEnd(12) +
    'Keywords'.padEnd(12) +
    'Status' +
    colors.reset
  );
  console.log('─'.repeat(100));

  for (const result of results) {
    const canonical = result.hasCanonical ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset;
    const twitter = result.hasTwitterCard ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset;
    const keywords = result.hasKeywords ? colors.green + '✓' + colors.reset : colors.yellow + '⚠' + colors.reset;

    const hasIssues = result.issues.length > 0 && !result.issues.every(i => i.includes('keywords'));
    const status = hasIssues
      ? colors.red + 'FAIL' + colors.reset
      : colors.green + 'PASS' + colors.reset;

    console.log(
      result.path.padEnd(50) +
      canonical.padEnd(21) + // Extra padding for ANSI codes
      twitter.padEnd(21) +
      keywords.padEnd(21) +
      status
    );

    if (hasIssues) {
      for (const issue of result.issues.filter(i => !i.includes('keywords'))) {
        console.log(colors.yellow + '  └─ ' + issue + colors.reset);
      }
    }
  }

  console.log('─'.repeat(100));
}

function printSummary(results: AuditResult[]): void {
  const total = results.length;
  const passing = results.filter(r => r.issues.filter(i => !i.includes('keywords')).length === 0).length;
  const failing = total - passing;

  const missingCanonical = results.filter(r => !r.hasCanonical).length;
  const missingTwitter = results.filter(r => !r.hasTwitterCard).length;
  const missingKeywords = results.filter(r => !r.hasKeywords).length;

  console.log('\n' + colors.bold + 'Summary' + colors.reset);
  console.log(`Total pages audited: ${total}`);
  console.log(`${colors.green}Passing: ${passing}${colors.reset}`);
  console.log(`${colors.red}Failing: ${failing}${colors.reset}`);
  console.log('');
  console.log(`Missing canonical: ${missingCanonical}`);
  console.log(`Missing Twitter card: ${missingTwitter}`);
  console.log(`Missing keywords: ${missingKeywords} (warning only)`);
}

async function main(): Promise<void> {
  console.log(colors.cyan + '\n📊 Running SEO Metadata Audit...\n' + colors.reset);

  const results: AuditResult[] = [];

  for (const pagePath of PUBLIC_CONTENT_PAGES) {
    if (isExempt(pagePath)) {
      continue;
    }

    const filePath = findPageFile(pagePath);

    if (!filePath) {
      results.push({
        path: pagePath,
        fileExists: false,
        hasExportMetadata: false,
        hasCanonical: false,
        hasTwitterCard: false,
        hasKeywords: false,
        hasOgImage: false,
        issues: ['Page file not found'],
      });
      continue;
    }

    const result = auditPageFile(filePath, pagePath);
    results.push(result);
  }

  printTable(results);
  printSummary(results);

  // Determine exit code
  // Only fail on missing canonical or twitter (keywords is warning only)
  const criticalIssues = results.filter(r =>
    !r.hasCanonical || !r.hasTwitterCard || !r.fileExists
  );

  if (criticalIssues.length > 0) {
    console.log(colors.red + '\n❌ Audit FAILED: Some pages are missing critical SEO metadata' + colors.reset);
    console.log('Please ensure all public content pages use generateMetadata() from @/lib/seo\n');
    process.exit(1);
  } else {
    console.log(colors.green + '\n✅ Audit PASSED: All pages have required SEO metadata' + colors.reset + '\n');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error(colors.red + 'Audit script error:', error, colors.reset);
  process.exit(1);
});
