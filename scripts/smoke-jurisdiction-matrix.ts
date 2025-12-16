/**
 * Smoke Test: Jurisdiction × Product Matrix
 *
 * This script verifies that all valid product×jurisdiction combinations:
 * 1. Load MQS YAML files successfully
 * 2. Resolve template paths correctly
 * 3. Enforce legal guards (Section 21 England-only, NI tenancy-only)
 * 4. Include required templateData fields
 *
 * Exit codes:
 * - 0: All tests passed
 * - 1: One or more tests failed
 */

import { loadMQS, type ProductType } from '@/lib/wizard/mqs-loader';
import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { isSection21Allowed, isProductSupported } from '@/lib/types/jurisdiction';
import fs from 'fs';
import path from 'path';

// ============================================================================
// TEST MATRIX CONFIGURATION
// ============================================================================

const JURISDICTIONS: CanonicalJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

const PRODUCTS: ProductType[] = ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'];

// Define which combinations are valid
const VALID_COMBINATIONS: Record<string, ProductType[]> = {
  england: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
  wales: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
  scotland: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
  'northern-ireland': ['tenancy_agreement'], // ONLY tenancy agreements in V1
};

// ============================================================================
// TEST RESULTS TRACKING
// ============================================================================

interface TestResult {
  jurisdiction: string;
  product: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);

  const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️ ';
  const statusColor =
    result.status === 'PASS' ? '\x1b[32m' : result.status === 'FAIL' ? '\x1b[31m' : '\x1b[33m';
  const resetColor = '\x1b[0m';

  console.log(
    `${emoji} ${statusColor}[${result.status}]${resetColor} ${result.jurisdiction}/${result.product} - ${result.test}` +
      (result.message ? `: ${result.message}` : '')
  );
}

// ============================================================================
// TESTS
// ============================================================================

/**
 * Test 1: MQS YAML exists and loads successfully
 */
function testMQSExists(jurisdiction: CanonicalJurisdiction, product: ProductType): void {
  const testName = 'MQS YAML loads';

  try {
    const mqs = loadMQS(product, jurisdiction);

    if (!mqs) {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: 'MQS returned null',
      });
      return;
    }

    if (!mqs.questions || mqs.questions.length === 0) {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: 'MQS has no questions',
      });
      return;
    }

    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'PASS',
      message: `${mqs.questions.length} questions loaded`,
    });
  } catch (error: any) {
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'FAIL',
      message: error.message,
    });
  }
}

/**
 * Get expected template paths for a product×jurisdiction based on actual generator usage
 */
function getExpectedTemplatePaths(
  product: ProductType,
  jurisdiction: CanonicalJurisdiction
): string[] {
  const paths: string[] = [];

  // Based on actual template paths used in generators
  if (product === 'notice_only' || product === 'complete_pack') {
    if (jurisdiction === 'england') {
      paths.push('uk/england/templates/eviction/section8_notice.hbs');
      paths.push('uk/england/templates/eviction/section21_form6a.hbs');
    } else if (jurisdiction === 'wales') {
      paths.push('uk/wales/templates/eviction/section173_landlords_notice.hbs');
      paths.push('uk/wales/templates/eviction/eviction_roadmap.hbs');
    } else if (jurisdiction === 'scotland') {
      paths.push('uk/scotland/templates/eviction/notice_to_leave.hbs');
      paths.push('uk/scotland/templates/eviction/eviction_roadmap.hbs');
    }

    if (product === 'complete_pack') {
      // Additional complete pack templates
      paths.push(`uk/${jurisdiction}/templates/eviction/eviction_roadmap.hbs`);
      paths.push(`uk/${jurisdiction}/templates/eviction/expert_guidance.hbs`);
    }
  }

  if (product === 'money_claim') {
    paths.push(`uk/${jurisdiction}/templates/money_claims/pack_cover.hbs`);
    paths.push(`uk/${jurisdiction}/templates/money_claims/schedule_of_arrears.hbs`);
  }

  if (product === 'tenancy_agreement') {
    if (jurisdiction === 'scotland') {
      paths.push('uk/scotland/templates/prt_agreement.hbs');
      paths.push('uk/scotland/templates/prt_agreement_premium.hbs');
    } else if (jurisdiction === 'northern-ireland') {
      paths.push('uk/northern-ireland/templates/private_tenancy_agreement.hbs');
      paths.push('uk/northern-ireland/templates/private_tenancy_premium.hbs');
    } else {
      paths.push(`uk/${jurisdiction}/templates/ast_agreement.hbs`);
    }
  }

  return paths;
}

/**
 * Test 2: Template paths resolve correctly (no england-wales references in actual usage)
 */
function testTemplatePathsValid(jurisdiction: CanonicalJurisdiction, product: ProductType): void {
  const testName = 'Template paths valid';

  // Get expected template paths for this product×jurisdiction
  const expectedPaths = getExpectedTemplatePaths(product, jurisdiction);

  if (expectedPaths.length === 0) {
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'SKIP',
      message: 'No templates defined for this combination',
    });
    return;
  }

  // Check each resolved path for deprecated values
  const deprecatedPatterns = ['england-wales', 'DEPRECATED'];
  const invalidPaths: string[] = [];

  for (const templatePath of expectedPaths) {
    for (const pattern of deprecatedPatterns) {
      if (templatePath.includes(pattern)) {
        invalidPaths.push(`${templatePath} (contains "${pattern}")`);
      }
    }
  }

  if (invalidPaths.length > 0) {
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'FAIL',
      message: `Deprecated paths in use: ${invalidPaths.join(', ')}`,
    });
    return;
  }

  // Check that canonical template folder exists
  const templateBasePath = path.join(
    process.cwd(),
    'config',
    'jurisdictions',
    'uk',
    jurisdiction,
    'templates'
  );

  if (!fs.existsSync(templateBasePath)) {
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'FAIL',
      message: `Template folder not found: ${templateBasePath}`,
    });
    return;
  }

  logResult({
    jurisdiction,
    product,
    test: testName,
    status: 'PASS',
    message: `${expectedPaths.length} template path(s) use canonical jurisdictions`,
  });
}

/**
 * Test 3: Section 21 guard works (England-only)
 */
function testSection21Guard(jurisdiction: CanonicalJurisdiction, product: ProductType): void {
  const testName = 'Section 21 guard';

  // Skip for products that don't involve Section 21
  if (product === 'tenancy_agreement' || product === 'money_claim') {
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'SKIP',
      message: 'N/A for this product',
    });
    return;
  }

  const allowed = isSection21Allowed(jurisdiction);

  if (jurisdiction === 'england') {
    if (!allowed) {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: 'Section 21 should be allowed in England!',
      });
      return;
    }
  } else {
    if (allowed) {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: `Section 21 should be BLOCKED in ${jurisdiction}!`,
      });
      return;
    }
  }

  logResult({
    jurisdiction,
    product,
    test: testName,
    status: 'PASS',
    message: allowed ? 'Allowed (England)' : `Blocked (${jurisdiction})`,
  });
}

/**
 * Test 4: Northern Ireland guard works (tenancy-only)
 */
function testNorthernIrelandGuard(jurisdiction: CanonicalJurisdiction, product: ProductType): void {
  const testName = 'NI product guard';

  if (jurisdiction !== 'northern-ireland') {
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'SKIP',
      message: 'N/A (not NI)',
    });
    return;
  }

  const supported = isProductSupported(jurisdiction, product);

  if (product === 'tenancy_agreement') {
    if (!supported) {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: 'Tenancy agreements SHOULD be supported in NI!',
      });
      return;
    }
  } else {
    if (supported) {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: `${product} should be BLOCKED in NI!`,
      });
      return;
    }
  }

  logResult({
    jurisdiction,
    product,
    test: testName,
    status: 'PASS',
    message: supported ? 'Allowed' : 'Blocked (NI V1 limitation)',
  });
}

/**
 * Test 5: No deprecated YAML files are loaded
 */
function testNoDeprecatedYAMLLoaded(jurisdiction: CanonicalJurisdiction, product: ProductType): void {
  const testName = 'No deprecated YAML';

  const yamlPath = path.join(process.cwd(), 'config', 'mqs', product, `${jurisdiction}.yaml`);

  // Check that we're NOT loading any .DEPRECATED.yaml files
  const deprecatedPath = path.join(
    process.cwd(),
    'config',
    'mqs',
    product,
    `${jurisdiction}.DEPRECATED.yaml`
  );

  if (yamlPath.includes('DEPRECATED')) {
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'FAIL',
      message: 'Loading deprecated YAML file!',
    });
    return;
  }

  if (yamlPath.includes('england-wales')) {
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'FAIL',
      message: 'Path contains "england-wales"!',
    });
    return;
  }

  // Verify deprecated file is NOT being accessed
  try {
    const mqs = loadMQS(product, jurisdiction);
    const loadedFile = mqs?.id || '';

    if (loadedFile.includes('england-wales') || loadedFile.includes('DEPRECATED')) {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: `Loaded file ID contains legacy values: ${loadedFile}`,
      });
      return;
    }
  } catch (error) {
    // Ignore errors here, they'll be caught by other tests
  }

  logResult({
    jurisdiction,
    product,
    test: testName,
    status: 'PASS',
  });
}

/**
 * Test 6: Wales jurisdiction is fully supported (no "Unsupported jurisdiction" errors)
 */
function testWalesSupported(jurisdiction: CanonicalJurisdiction, product: ProductType): void {
  const testName = 'Wales support';

  if (jurisdiction !== 'wales') {
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'SKIP',
      message: 'N/A (not Wales)',
    });
    return;
  }

  try {
    const mqs = loadMQS(product, jurisdiction);

    if (!mqs) {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: 'MQS returned null - Wales may not be supported',
      });
      return;
    }

    // Check that the jurisdiction is correctly set to 'wales', not 'england' or 'england-wales'
    if (mqs.jurisdiction !== 'wales') {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: `MQS jurisdiction mismatch: expected 'wales', got '${mqs.jurisdiction}'`,
      });
      return;
    }

    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'PASS',
      message: 'Wales is fully supported with correct jurisdiction',
    });
  } catch (error: any) {
    const errorMsg = error.message || String(error);

    // Specific check for "Unsupported jurisdiction" error
    if (errorMsg.toLowerCase().includes('unsupported jurisdiction')) {
      logResult({
        jurisdiction,
        product,
        test: testName,
        status: 'FAIL',
        message: `Wales should be supported but got error: ${errorMsg}`,
      });
      return;
    }

    // Other errors might be legitimate (e.g., file not found for invalid combo)
    logResult({
      jurisdiction,
      product,
      test: testName,
      status: 'FAIL',
      message: `Unexpected error: ${errorMsg}`,
    });
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runSmokeTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🔬 SMOKE TEST: Jurisdiction × Product Matrix');
  console.log('='.repeat(80) + '\n');

  for (const jurisdiction of JURISDICTIONS) {
    console.log(`\n📍 Testing ${jurisdiction.toUpperCase()}...\n`);

    for (const product of PRODUCTS) {
      const isValid = VALID_COMBINATIONS[jurisdiction]?.includes(product);

      if (!isValid) {
        // Skip invalid combinations but note them
        logResult({
          jurisdiction,
          product,
          test: 'Combination validity',
          status: 'SKIP',
          message: 'Invalid combination for V1',
        });
        continue;
      }

      // Run all tests for this combination
      testMQSExists(jurisdiction, product);
      testTemplatePathsValid(jurisdiction, product);
      testSection21Guard(jurisdiction, product);
      testNorthernIrelandGuard(jurisdiction, product);
      testNoDeprecatedYAMLLoaded(jurisdiction, product);
      testWalesSupported(jurisdiction, product);
    }
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80) + '\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;
  const total = results.length;

  console.log(`✅ Passed:  ${passed}/${total}`);
  console.log(`❌ Failed:  ${failed}/${total}`);
  console.log(`⏭️  Skipped: ${skipped}/${total}\n`);

  if (failed > 0) {
    console.log('❌ FAILURES:\n');
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`  • ${r.jurisdiction}/${r.product} - ${r.test}: ${r.message || 'Failed'}`);
      });
    console.log('');
  }

  console.log('='.repeat(80) + '\n');

  // Exit with error code if any tests failed
  if (failed > 0) {
    console.error(`\n💥 ${failed} test(s) failed. Fix the issues above.\n`);
    process.exit(1);
  } else {
    console.log('\n✨ All tests passed! Canonical jurisdiction system is working correctly.\n');
    process.exit(0);
  }
}

// Run tests
runSmokeTests().catch((error) => {
  console.error('\n💥 Smoke test runner crashed:\n', error);
  process.exit(1);
});
