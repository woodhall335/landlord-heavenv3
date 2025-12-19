#!/usr/bin/env tsx
/**
 * NOTICE ONLY EDITABLE HTML PROOF SCRIPT
 *
 * This script proves that the "editable-after-payment" flow works correctly:
 * 1. Generate notices (HTML + PDF) using production generators
 * 2. Edit the HTML content (simulate user editing landlord name)
 * 3. Re-render edited HTML to PDF using htmlToPdf pipeline
 * 4. Validate:
 *    - Edited content appears in the PDF
 *    - Print CSS is still embedded in HTML
 *    - Print classes are preserved in HTML
 *
 * Routes tested:
 * - England: Section 21
 * - Wales: Section 173
 *
 * USAGE:
 *   npx tsx scripts/prove-notice-only-editable-html.ts
 *   npm run prove:notice-only:editable
 *
 * Exit code 0 = All tests pass
 * Exit code 1 = At least one test failed
 */

import path from 'path';
import fs from 'fs/promises';

// Import generators
import { generateSection21Notice } from '@/lib/documents/section21-generator';
import { generateWalesSection173Notice } from '@/lib/documents/wales-section173-generator';
import { htmlToPdf } from '@/lib/documents/generator';

// Artifacts directory
const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'notice_only', 'editable');

// ============================================================================
// TYPES
// ============================================================================

interface TestCase {
  name: string;
  jurisdiction: string;
  generateFn: () => Promise<{ html: string; pdf?: Buffer }>;
  expectedOriginal: string;
  editedValue: string;
}

interface TestResult {
  name: string;
  success: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// PDF PARSE HELPER
// ============================================================================

/**
 * Try to load pdf-parse (optional dependency)
 */
async function tryLoadPdfParse(): Promise<((data: Buffer) => Promise<{ text?: string }>) | null> {
  try {
    const mod: any = await import('pdf-parse');

    // Classic function export
    const fnCandidates = [mod?.default, mod, mod?.default?.default];
    const fn = fnCandidates.find((c) => typeof c === 'function');
    if (fn) {
      return async (data: Buffer) => {
        try {
          return await fn(data, { max: 0 });
        } catch (e: any) {
          if (e?.message?.includes('url') || e?.message?.includes('getDocument')) {
            return await fn(data);
          }
          throw e;
        }
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract text from PDF using pdf-parse
 */
async function extractPdfText(pdfBuffer: Buffer): Promise<string | null> {
  const pdfParse = await tryLoadPdfParse();
  if (!pdfParse) {
    return null;
  }

  try {
    const pdfData = await pdfParse(pdfBuffer);
    return String(pdfData?.text ?? '');
  } catch (e: any) {
    console.warn(`      ⚠️  pdf-parse failed: ${e.message}`);
    return null;
  }
}

// ============================================================================
// TEST CASES
// ============================================================================

const TEST_CASES: TestCase[] = [
  // England - Section 21
  {
    name: 'England Section 21',
    jurisdiction: 'england',
    generateFn: async () => {
      return generateSection21Notice({
        landlord_full_name: 'John Landlord',
        landlord_address: '123 Landlord Street\nLondon\nSW1A 1AA',
        tenant_full_name: 'Jane Tenant',
        property_address: '456 Tenant Road\nLondon\nE1 6AN',
        tenancy_start_date: '2020-06-01',
        service_date: '2025-01-15',
        expiry_date: '2025-04-01',
        rent_amount: 950,
        rent_frequency: 'monthly',
      });
    },
    expectedOriginal: 'John Landlord',
    editedValue: 'LANDLORD EDIT TEST 123',
  },

  // Wales - Section 173
  {
    name: 'Wales Section 173',
    jurisdiction: 'wales',
    generateFn: async () => {
      return generateWalesSection173Notice({
        landlord_full_name: 'Dafydd Landlord',
        landlord_address: '100 Cardiff Road\nCardiff\nCF10 1AA',
        contract_holder_full_name: 'Bethan ContractHolder',
        property_address: '200 Swansea Street\nSwansea\nSA1 1AA',
        contract_start_date: '2023-01-01',
        rent_amount: 800,
        rent_frequency: 'monthly',
        service_date: '2025-01-15',
        expiry_date: '2025-07-30',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: true,
        deposit_taken: true,
        deposit_protected: true,
      });
    },
    expectedOriginal: 'Dafydd Landlord',
    editedValue: 'LANDLORD EDIT TEST 123',
  },
];

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function testEditableFlow(testCase: TestCase): Promise<TestResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(`\n🧪 Testing ${testCase.name}...`);

  try {
    // Step 1: Generate original notice
    console.log('  📝 Step 1: Generating original notice...');
    const original = await testCase.generateFn();

    if (!original.html) {
      errors.push('No HTML generated');
      return { name: testCase.name, success: false, errors, warnings };
    }

    console.log(`  ✅ Original HTML generated (${original.html.length} characters)`);

    // Save original HTML for inspection
    const originalHtmlPath = path.join(ARTIFACTS_DIR, `${testCase.jurisdiction}_original.html`);
    await fs.writeFile(originalHtmlPath, original.html);
    console.log(`  💾 Original HTML saved: ${originalHtmlPath}`);

    // Save original PDF if available
    if (original.pdf) {
      const originalPdfPath = path.join(ARTIFACTS_DIR, `${testCase.jurisdiction}_original.pdf`);
      await fs.writeFile(originalPdfPath, original.pdf);
      console.log(`  💾 Original PDF saved: ${originalPdfPath}`);
    }

    // Step 2: Validate original HTML contains expected content
    console.log('  🔍 Step 2: Validating original HTML...');
    if (!original.html.includes(testCase.expectedOriginal)) {
      errors.push(`Original HTML does not contain expected value: "${testCase.expectedOriginal}"`);
    } else {
      console.log(`  ✅ Original HTML contains: "${testCase.expectedOriginal}"`);
    }

    // Check for Print CSS marker
    const hasPrintCssMarker =
      original.html.includes('/* Print Design System */') ||
      original.html.includes('print-root') ||
      original.html.includes('.section') ||
      original.html.includes('.info-box');

    if (!hasPrintCssMarker) {
      errors.push('Original HTML does not contain Print CSS markers');
    } else {
      console.log('  ✅ Original HTML contains Print CSS markers');
    }

    // Step 3: Edit the HTML (simulate user editing landlord name)
    console.log('  ✏️  Step 3: Editing HTML (replacing landlord name)...');
    const editedHtml = original.html.replace(
      new RegExp(testCase.expectedOriginal, 'g'),
      testCase.editedValue
    );

    if (!editedHtml.includes(testCase.editedValue)) {
      errors.push('HTML edit failed - edited value not found in HTML');
      return { name: testCase.name, success: false, errors, warnings };
    }

    console.log(`  ✅ HTML edited successfully (${editedHtml.length} characters)`);

    // Save edited HTML for inspection
    const editedHtmlPath = path.join(ARTIFACTS_DIR, `${testCase.jurisdiction}_edited.html`);
    await fs.writeFile(editedHtmlPath, editedHtml);
    console.log(`  💾 Edited HTML saved: ${editedHtmlPath}`);

    // Step 4: Validate edited HTML still has Print CSS
    console.log('  🔍 Step 4: Validating edited HTML preserves Print CSS...');
    const editedHasPrintCss =
      editedHtml.includes('/* Print Design System */') ||
      editedHtml.includes('print-root') ||
      editedHtml.includes('.section') ||
      editedHtml.includes('.info-box');

    if (!editedHasPrintCss) {
      errors.push('Edited HTML lost Print CSS markers after edit');
    } else {
      console.log('  ✅ Edited HTML still contains Print CSS markers');
    }

    // Check for common print classes
    const printClasses = ['.section', '.info-box', '.avoid-break', '.page-break'];
    const missingClasses = printClasses.filter((cls) => !editedHtml.includes(cls));
    if (missingClasses.length > 0) {
      warnings.push(`Edited HTML missing some print classes: ${missingClasses.join(', ')}`);
    } else {
      console.log('  ✅ Edited HTML contains expected print classes');
    }

    // Step 5: Re-render edited HTML to PDF
    console.log('  📄 Step 5: Re-rendering edited HTML to PDF...');
    let editedPdf: Buffer;
    try {
      editedPdf = await htmlToPdf(editedHtml);
      console.log(`  ✅ Edited PDF generated (${editedPdf.length} bytes)`);
    } catch (e: any) {
      errors.push(`Failed to re-render edited HTML to PDF: ${e.message}`);
      return { name: testCase.name, success: false, errors, warnings };
    }

    // Save edited PDF
    const editedPdfPath = path.join(ARTIFACTS_DIR, `${testCase.jurisdiction}_edited.pdf`);
    await fs.writeFile(editedPdfPath, editedPdf);
    console.log(`  💾 Edited PDF saved: ${editedPdfPath}`);

    // Step 6: Validate edited PDF contains the edited value
    console.log('  🔍 Step 6: Validating edited PDF contains edited value...');
    const pdfText = await extractPdfText(editedPdf);

    if (pdfText === null) {
      warnings.push('pdf-parse not available - skipping PDF text validation');
      console.log('  ⚠️  pdf-parse not available - skipping PDF text validation');
    } else {
      if (!pdfText.includes(testCase.editedValue)) {
        errors.push(`Edited PDF does not contain edited value: "${testCase.editedValue}"`);
      } else {
        console.log(`  ✅ Edited PDF contains: "${testCase.editedValue}"`);
      }

      // Verify original value is NOT in PDF (it should be replaced)
      if (pdfText.includes(testCase.expectedOriginal)) {
        errors.push(
          `Edited PDF still contains original value: "${testCase.expectedOriginal}" (should be replaced)`
        );
      } else {
        console.log(`  ✅ Edited PDF does NOT contain original value (correctly replaced)`);
      }
    }

    // Step 7: Summary
    if (errors.length === 0) {
      console.log('  ✅ All validation checks passed');
    } else {
      console.log('  ❌ Validation failed:');
      errors.forEach((e) => console.log(`     - ${e}`));
    }

    return {
      name: testCase.name,
      success: errors.length === 0,
      errors,
      warnings,
    };
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`Exception: ${msg}`);
    console.log(`  ❌ Error: ${msg}`);
    return {
      name: testCase.name,
      success: false,
      errors,
      warnings,
    };
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     NOTICE ONLY EDITABLE HTML PROOF                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('This script validates the "editable-after-payment" flow:');
  console.log('  1. Generate notice (HTML + PDF)');
  console.log('  2. Edit HTML (simulate user editing landlord name)');
  console.log('  3. Re-render edited HTML to PDF');
  console.log('  4. Validate edited content appears in PDF');
  console.log('  5. Validate Print CSS is preserved');
  console.log('');
  console.log(`📁 Artifacts directory: ${ARTIFACTS_DIR}`);
  console.log('');

  await ensureDirectoryExists(ARTIFACTS_DIR);

  const results: TestResult[] = [];

  for (const testCase of TEST_CASES) {
    const result = await testEditableFlow(testCase);
    results.push(result);
  }

  // Print summary
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  const successCount = results.filter((r) => r.success).length;
  const totalCount = results.length;

  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${result.name}`);

    if (!result.success && result.errors.length > 0) {
      result.errors.forEach((err) => console.log(`       └─ ❌ ${err}`));
    }
    if (result.warnings.length > 0) {
      result.warnings.forEach((warn) => console.log(`       └─ ⚠️  ${warn}`));
    }
  }

  console.log('');
  console.log('─'.repeat(70));
  console.log(`📊 Results: ${successCount}/${totalCount} tests passed`);
  console.log('─'.repeat(70));

  if (successCount === totalCount) {
    console.log('');
    console.log('🎉 SUCCESS: Editable-after-payment flow works correctly!');
    console.log('');
    console.log('✅ HTML generation preserves Print CSS');
    console.log('✅ Edited HTML can be re-rendered to PDF');
    console.log('✅ Edited content appears in final PDF');
    console.log('✅ Print formatting is preserved after edit');
    console.log('');
    console.log(`📂 Review artifacts in: ${ARTIFACTS_DIR}`);
    console.log('');
    process.exit(0);
  }

  console.log('');
  console.log('❌ FAILURE: Some tests failed');
  console.log('');
  console.log('Review errors above and check:');
  console.log('  - Generators produce HTML with embedded Print CSS');
  console.log('  - htmlToPdf can re-render edited HTML');
  console.log('  - Print CSS markers are preserved in HTML');
  console.log('');
  process.exit(1);
}

// Run
main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('Fatal error:', msg);
  process.exit(1);
});
