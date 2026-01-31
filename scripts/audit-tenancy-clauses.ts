#!/usr/bin/env npx tsx
/**
 * Tenancy Clause Audit Script
 *
 * Verifies that ClauseDiffPreview and TenancyComparisonTable claims
 * are ALWAYS accurate vs the actual HBS template content.
 *
 * Usage:
 *   npm run audit:tenancy-clauses
 *   npx tsx scripts/audit-tenancy-clauses.ts
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Verification failed (UI claims don't match template content)
 */

import {
  runFullVerification,
  generateDiffReport,
} from '../src/lib/tenancy/clause-verifier';

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`
${CYAN}╔════════════════════════════════════════════════════════════╗
║         TENANCY CLAUSE VERIFICATION AUDIT                  ║
╚════════════════════════════════════════════════════════════╝${RESET}

This audit verifies that UI claims in ClauseDiffPreview and
TenancyComparisonTable match actual HBS template content.

Checking templates for:
  • England (Standard + Premium/HMO)
  • Wales (Standard + HMO Occupation Contract)
  • Scotland (Standard + HMO PRT)
  • Northern Ireland (Standard + HMO Private Tenancy)

`);

// Run verification
const report = runFullVerification();

// Generate and print diff report
const diffReport = generateDiffReport(report);
console.log(diffReport);

// Print jurisdiction breakdown
console.log(`
${CYAN}══════════════════════════════════════════════════════════════${RESET}
${BOLD}JURISDICTION BREAKDOWN${RESET}
${CYAN}══════════════════════════════════════════════════════════════${RESET}
`);

for (const [jurisdiction, tiers] of Object.entries(report.jurisdictionResults)) {
  const standardResult = tiers.standard;
  const premiumResult = tiers.premium;

  const standardStatus = standardResult.valid
    ? `${GREEN}✓ PASS${RESET}`
    : `${RED}✗ FAIL${RESET}`;
  const premiumStatus = premiumResult.valid
    ? `${GREEN}✓ PASS${RESET}`
    : `${RED}✗ FAIL${RESET}`;

  console.log(`${BOLD}${jurisdiction.toUpperCase()}${RESET}`);
  console.log(`  Standard: ${standardStatus} (${standardResult.foundClauses.length} clauses found)`);
  console.log(`  Premium:  ${premiumStatus} (${premiumResult.foundClauses.length} clauses found)`);

  if (standardResult.errors.length > 0) {
    console.log(`    ${RED}Errors:${RESET}`);
    for (const error of standardResult.errors) {
      console.log(`      - ${error}`);
    }
  }

  if (premiumResult.errors.length > 0) {
    console.log(`    ${RED}Errors:${RESET}`);
    for (const error of premiumResult.errors) {
      console.log(`      - ${error}`);
    }
  }

  if (standardResult.warnings.length > 0) {
    console.log(`    ${YELLOW}Warnings:${RESET}`);
    for (const warning of standardResult.warnings) {
      console.log(`      - ${warning}`);
    }
  }

  if (premiumResult.warnings.length > 0) {
    console.log(`    ${YELLOW}Warnings:${RESET}`);
    for (const warning of premiumResult.warnings) {
      console.log(`      - ${warning}`);
    }
  }

  console.log('');
}

// Final status
console.log(`
${CYAN}══════════════════════════════════════════════════════════════${RESET}
${BOLD}FINAL STATUS${RESET}
${CYAN}══════════════════════════════════════════════════════════════${RESET}
`);

if (report.valid) {
  console.log(`${GREEN}${BOLD}✓ ALL CHECKS PASSED${RESET}`);
  console.log(`
UI claims in ClauseDiffPreview and TenancyComparisonTable are
consistent with actual HBS template clause markers.

Verified:
  • Premium-only clauses exist in Premium templates
  • Premium-only clauses are absent from Standard templates
  • Core clauses exist in both Standard and Premium
  • Jurisdiction terminology is correct
`);
  process.exit(0);
} else {
  console.log(`${RED}${BOLD}✗ VERIFICATION FAILED${RESET}`);
  console.log(`
${report.summary.totalErrors} error(s), ${report.summary.totalWarnings} warning(s) found.

${YELLOW}How to fix:${RESET}

1. Check that HBS templates have correct clause markers:
   <!-- CLAUSE:CLAUSE_ID --> or {{!-- CLAUSE:CLAUSE_ID --}}

2. Verify ClauseDiffPreview.tsx canonicalId fields match
   the markers in the HBS templates.

3. Run tests to verify:
   npm run test -- tenancy-clause-verification

4. Check the detailed error messages above for specific issues.

${RED}CI will fail until these issues are resolved.${RESET}
`);
  process.exit(1);
}
