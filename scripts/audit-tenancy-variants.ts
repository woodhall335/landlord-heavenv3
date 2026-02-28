#!/usr/bin/env npx tsx
/**
 * Tenancy Variants Audit Script
 *
 * CI/Build guardrail to ensure the 2-variants rule is maintained:
 * 1) Exactly 4 jurisdictions (england, wales, scotland, northern-ireland)
 * 2) Exactly 2 variants per jurisdiction (standard + premium)
 * 3) Standard templates contain NO HMO markers
 * 4) Premium templates contain ALL required HMO markers
 * 5) Pack-contents returns exactly 1 document per tier per jurisdiction
 *
 * Usage:
 *   npx tsx scripts/audit-tenancy-variants.ts
 *   npm run audit:tenancy-variants
 *
 * Exit codes:
 *   0 - All invariants pass
 *   1 - One or more invariants failed
 */

import path from 'path';
import {
  assertTenancyVariantsInvariant,
  createFileSystemTemplateGetter,
  formatAuditTable,
  getSupportedJurisdictions,
  TENANCY_VARIANT_CONFIGS,
} from '../src/lib/products/tenancy-variant-validator';
import { getPackContents } from '../src/lib/products/pack-contents';

const CONFIG_DIR = path.join(process.cwd(), 'config/jurisdictions');

console.log('');
console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║          TENANCY AGREEMENT VARIANTS AUDIT                                    ║');
console.log('║          Enforcing 2-Variants Rule: Standard + Premium (HMO)                 ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
console.log('');

// Run the invariant check
const getContent = createFileSystemTemplateGetter(CONFIG_DIR);

try {
  const result = assertTenancyVariantsInvariant({
    getTemplateContent: getContent,
    getPackContents: (args) => getPackContents(args as any),
    throwOnFailure: false, // Don't throw, we'll handle exit codes ourselves
  });

  // Print the audit table
  console.log(formatAuditTable(result.auditTable));

  // Print warnings if any
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    for (const warning of result.warnings) {
      console.log(`   - ${warning}`);
    }
    console.log('');
  }

  // Print errors if any
  if (result.errors.length > 0) {
    console.log('❌ ERRORS:');
    for (const error of result.errors) {
      console.log(`   - ${error}`);
    }
    console.log('');
  }

  // Final status
  if (result.valid) {
    console.log('✅ AUDIT PASSED: All tenancy variant invariants are satisfied.');
    console.log('');
    console.log('   ✓ 4 jurisdictions configured');
    console.log('   ✓ 2 variants per jurisdiction (standard + premium)');
    console.log('   ✓ Standard templates have NO HMO markers');
    console.log('   ✓ Premium templates have required HMO markers');
    console.log('   ✓ Pack-contents aligned with validator config');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ AUDIT FAILED: One or more invariants violated.');
    console.log('');
    console.log('   The 2-variants rule requires:');
    console.log('   1. Exactly 4 jurisdictions (england, wales, scotland, northern-ireland)');
    console.log('   2. Exactly 2 variants per jurisdiction (standard + premium)');
    console.log('   3. Standard templates: NO HMO markers');
    console.log('   4. Premium templates: MUST have HMO markers');
    console.log('   5. Pack-contents: exactly 1 document per tier per jurisdiction');
    console.log('');
    console.log('   Fix the errors above before merging.');
    console.log('');
    process.exit(1);
  }
} catch (err) {
  console.error('❌ AUDIT ERROR:', err);
  process.exit(1);
}
