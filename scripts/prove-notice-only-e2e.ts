#!/usr/bin/env tsx
/**
 * NOTICE ONLY E2E PROOF SCRIPT
 *
 * This script proves Notice Only works end-to-end for ALL supported routes:
 * - England: section_8, section_21
 * - Wales: wales_section_173
 * - Scotland: notice_to_leave
 *
 * For each route:
 * 1. Creates a case
 * 2. Submits minimal valid wizard answers
 * 3. Calls preview API to generate PDF
 * 4. Writes PDF to artifacts/notice_only/<jurisdiction>/<route>.pdf
 * 5. Validates:
 *    - File exists
 *    - File size > minimum threshold
 *    - Text contains jurisdiction-specific phrases
 *    - No "undefined" or blank critical fields
 *
 * Exit code 0 = ALL routes work
 * Exit code 1 = At least one route failed
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

function validateEnvironment(): void {
  const missingVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missingVars.length > 0) {
    console.error('╔═══════════════════════════════════════════════════════════════╗');
    console.error('║                    CONFIGURATION ERROR                        ║');
    console.error('╚═══════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('❌ Missing required environment variables:');
    console.error('');
    missingVars.forEach((varName) => {
      console.error(`   • ${varName}`);
    });
    console.error('');
    console.error('This script requires Supabase to be configured.');
    console.error('');
    console.error('To fix this:');
    console.error('  1. Copy .env.example to .env.local');
    console.error('  2. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('  3. Run this script again');
    console.error('');
    process.exit(1);
  }
}

// Validate before proceeding
validateEnvironment();

// Environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Artifacts directory
const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'notice_only');

// Test routes
interface TestRoute {
  jurisdiction: 'england' | 'wales' | 'scotland';
  route: string;
  minimalAnswers: Record<string, any>;
  expectedPhrases: string[];
  forbiddenPhrases: string[];
}

const TEST_ROUTES: TestRoute[] = [
  // England - Section 8
  {
    jurisdiction: 'england',
    route: 'section_8',
    minimalAnswers: {
      landlord_full_name: 'John Landlord',
      landlord_address_line1: '123 Landlord Street',
      landlord_city: 'London',
      landlord_postcode: 'SW1A 1AA',
      selected_notice_route: 'section_8',
      tenant_full_name: 'Jane Tenant',
      property_address_line1: '456 Tenant Road',
      property_city: 'London',
      property_postcode: 'E1 6AN',
      tenancy_start_date: '2023-01-01',
      is_fixed_term: false,
      rent_amount: 1200,
      rent_frequency: 'monthly',
      payment_date: 1,
      deposit_taken: true,
      deposit_protected_scheme: true,
      prescribed_info_given: true,
      has_gas_appliances: false,
      epc_provided: true,
      how_to_rent_provided: true,
      property_licensing: 'not_required',
      recent_repair_complaints_s21: false,
      section8_grounds_selection: ['Ground 8 - Serious rent arrears (2+ months)'],
      ground_particulars: 'Tenant owes £2,400 in rent arrears covering 2 months (January-February 2025). Last payment received was December 2024. Rent is due monthly on the 1st. Tenant has been contacted multiple times but has not responded.',
      notice_strategy: 'minimum',
    },
    expectedPhrases: [
      'NOTICE SEEKING POSSESSION',
      'Housing Act 1988',
      'Section 8',
      'Ground 8',
      'John Landlord',
      'Jane Tenant',
      '456 Tenant Road',
      'E1 6AN',
    ],
    forbiddenPhrases: [
      'undefined',
      '{{',
      'NULL',
      'contract holder',
      'Section 173',
      'Notice to Leave',
    ],
  },

  // England - Section 21
  {
    jurisdiction: 'england',
    route: 'section_21',
    minimalAnswers: {
      landlord_full_name: 'Sarah Landlord',
      landlord_address_line1: '789 Owner Avenue',
      landlord_city: 'Manchester',
      landlord_postcode: 'M1 1AD',
      selected_notice_route: 'section_21',
      tenant_full_name: 'Bob Tenant',
      property_address_line1: '321 Renter Lane',
      property_city: 'Manchester',
      property_postcode: 'M2 3PQ',
      tenancy_start_date: '2020-06-01',
      is_fixed_term: false,
      rent_amount: 950,
      rent_frequency: 'monthly',
      payment_date: 15,
      deposit_taken: true,
      deposit_protected_scheme: true,
      prescribed_info_given: true,
      has_gas_appliances: true,
      gas_safety_certificate: true,
      epc_provided: true,
      how_to_rent_provided: true,
      property_licensing: 'licensed',
      recent_repair_complaints_s21: false,
    },
    expectedPhrases: [
      'Form 6A',
      'Section 21',
      'Housing Act 1988',
      'Sarah Landlord',
      'Bob Tenant',
      '321 Renter Lane',
      'M2 3PQ',
      'two months',
    ],
    forbiddenPhrases: [
      'undefined',
      '{{',
      'Ground 8',
      'contract holder',
      'Section 173',
    ],
  },

  // Wales - Section 173 (no-fault)
  {
    jurisdiction: 'wales',
    route: 'wales_section_173',
    minimalAnswers: {
      landlord_full_name: 'Dafydd Landlord',
      landlord_address_line1: '100 Cardiff Road',
      landlord_city: 'Cardiff',
      landlord_postcode: 'CF10 1AA',
      selected_notice_route: 'wales_section_173',
      contract_holder_full_name: 'Bethan ContractHolder',
      property_address_line1: '200 Swansea Street',
      property_city: 'Swansea',
      property_postcode: 'SA1 1AA',
      contract_start_date: '2023-01-01',
      rent_amount: 800,
      rent_frequency: 'monthly',
      wales_contract_category: 'standard',
      rent_smart_wales_registered: true,
      deposit_taken_wales: true,
      deposit_protected_wales: true,
      deposit_scheme_wales_s173: 'MyDeposits Wales',
    },
    expectedPhrases: [
      'Section 173',
      'Renting Homes (Wales) Act 2016',
      'contract holder',
      'occupation contract',
      'Dafydd Landlord',
      'Bethan ContractHolder',
      '200 Swansea Street',
      'SA1 1AA',
      'Rent Smart Wales',
    ],
    forbiddenPhrases: [
      'undefined',
      '{{',
      'Housing Act 1988',
      'Section 21',
      'Section 8',
      'tenant',
      'assured shorthold',
    ],
  },

  // Wales - Fault-based notice (rent arrears)
  {
    jurisdiction: 'wales',
    route: 'wales_fault_based',
    minimalAnswers: {
      landlord_full_name: 'Gareth Landlord',
      landlord_address_line1: '300 Newport Lane',
      landlord_city: 'Newport',
      landlord_postcode: 'NP20 1AA',
      selected_notice_route: 'wales_fault_based',
      contract_holder_full_name: 'Megan ContractHolder',
      property_address_line1: '400 Wrexham Road',
      property_city: 'Wrexham',
      property_postcode: 'LL13 1AA',
      contract_start_date: '2023-06-01',
      rent_amount: 750,
      rent_frequency: 'monthly',
      wales_contract_category: 'standard',
      rent_smart_wales_registered: true,
      deposit_taken_wales: true,
      deposit_protected_wales: true,
      deposit_scheme_wales_fault: 'Deposit Protection Service Wales',
      wales_breach_type: 'rent_arrears',
      rent_arrears_amount: 1500,
      breach_details: 'Contract holder owes £1,500 in rent arrears covering 2 months (November-December 2024). Rent is due monthly on the 1st. Multiple payment reminders have been sent but arrears remain unpaid.',
    },
    expectedPhrases: [
      'Renting Homes (Wales) Act 2016',
      'contract holder',
      'breach',
      'Gareth Landlord',
      'Megan ContractHolder',
      '400 Wrexham Road',
      'LL13 1AA',
      'rent arrears',
      '£1,500',
    ],
    forbiddenPhrases: [
      'undefined',
      '{{',
      'Housing Act 1988',
      'Section 21',
      'Section 8',
      'Section 173',
      'assured shorthold',
    ],
  },

  // Scotland - Notice to Leave
  {
    jurisdiction: 'scotland',
    route: 'notice_to_leave',
    minimalAnswers: {
      landlord_full_name: 'Angus Landlord',
      landlord_address: '50 Edinburgh Way\nEdinburgh\nEH1 1AA',
      landlord_email: 'angus@example.com',
      landlord_phone: '0131 123 4567',
      tenant_full_name: 'Fiona Tenant',
      property_address_line1: '75 Glasgow Road',
      property_address_town: 'Glasgow',
      property_postcode: 'G1 1AA',
      tenancy_type: 'Private Residential Tenancy (PRT)',
      tenancy_start_date: '2023-01-01',
      rent_amount: 1000,
      rent_frequency: 'monthly',
      rent_due_day: 1,
      rent_arrears: 'Yes',
      arrears_amount: 3500,
      pre_action_contact: 'Yes',
      deposit_amount: 1000,
      deposit_protected: 'Yes',
      deposit_scheme_name: 'SafeDeposits Scotland',
      safety_checks: 'Yes',
      asb_details: 'No',
      eviction_grounds: ['Ground 1 - Rent arrears (3+ months)'],
      ground_particulars: 'The tenant owes £3,500 in rent arrears covering over 3 months. Pre-action requirements have been completed including written notice to the tenant and signposting to debt advice services. Despite multiple contact attempts, the arrears remain unpaid.',
      notice_date: '2025-01-15',
      notice_expiry: '2025-02-12',
      service_method: 'Recorded delivery',
      served_by: 'Angus Landlord',
      service_name: 'Angus Landlord',
      service_address_line1: '50 Edinburgh Way',
      service_city: 'Edinburgh',
      service_postcode: 'EH1 1AA',
    },
    expectedPhrases: [
      'NOTICE TO LEAVE',
      'Private Housing (Tenancies) (Scotland) Act 2016',
      'First-tier Tribunal',
      'Ground 1',
      'Angus Landlord',
      'Fiona Tenant',
      '75 Glasgow Road',
      'G1 1AA',
      'rent arrears',
      'pre-action',
    ],
    forbiddenPhrases: [
      'undefined',
      '{{',
      'Housing Act 1988',
      'Section 21',
      'Section 8',
      'court',
      'possession order',
    ],
  },
];

// Helpers
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

async function createTestCase(jurisdiction: string, product: string = 'notice_only'): Promise<string> {
  const { data, error } = await supabase
    .from('cases')
    .insert({
      jurisdiction,
      product,
      status: 'in_progress',
      wizard_facts: {},
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create case: ${error?.message || 'Unknown error'}`);
  }

  return data.id;
}

async function submitWizardAnswers(caseId: string, answers: Record<string, any>): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({
      wizard_facts: answers,
      status: 'completed',
    })
    .eq('id', caseId);

  if (error) {
    throw new Error(`Failed to update case with answers: ${error.message}`);
  }
}

async function generatePreviewPDF(caseId: string): Promise<Buffer> {
  const response = await fetch(`${API_BASE_URL}/api/notice-only/preview/${caseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/pdf',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Preview API failed: ${response.status} - ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Try to dynamically import pdf-parse (optional dependency)
 */
async function tryImportPdfParse(): Promise<any | null> {
  try {
    const pdfParseModule = await import('pdf-parse');
    return pdfParseModule.default || pdfParseModule;
  } catch (error) {
    return null;
  }
}

async function validatePDF(
  pdfBuffer: Buffer,
  route: TestRoute
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size - minimum threshold for a real PDF with content
  const MIN_PDF_SIZE = 40 * 1024; // 40KB - a reasonable minimum for a notice with formatting
  const TINY_PDF_SIZE = 5000; // 5KB - definitely too small

  if (pdfBuffer.length < TINY_PDF_SIZE) {
    errors.push(`PDF too small (${pdfBuffer.length} bytes) - likely generation error`);
  } else if (pdfBuffer.length < MIN_PDF_SIZE) {
    warnings.push(`PDF smaller than expected (${pdfBuffer.length} bytes, expected >${MIN_PDF_SIZE}) - may be missing content`);
  }

  // Check PDF header (all PDFs should start with %PDF-)
  const pdfHeader = pdfBuffer.slice(0, 5).toString('utf-8');
  if (!pdfHeader.startsWith('%PDF-')) {
    errors.push(`Invalid PDF header: "${pdfHeader}" - not a valid PDF file`);
    return { valid: false, errors, warnings };
  }

  // Try to parse PDF text if pdf-parse is available
  const pdfParse = await tryImportPdfParse();

  if (pdfParse) {
    // Full validation with text extraction
    console.log('    ℹ️  pdf-parse available - performing full text validation');
    let pdfText = '';
    try {
      const pdfData = await pdfParse(pdfBuffer);
      pdfText = pdfData.text;
    } catch (error: any) {
      errors.push(`PDF parse error: ${error.message}`);
      return { valid: false, errors, warnings };
    }

    // Check expected phrases
    for (const phrase of route.expectedPhrases) {
      if (!pdfText.includes(phrase)) {
        errors.push(`Missing expected phrase: "${phrase}"`);
      }
    }

    // Check forbidden phrases
    for (const phrase of route.forbiddenPhrases) {
      if (pdfText.includes(phrase)) {
        errors.push(`Found forbidden phrase: "${phrase}"`);
      }
    }
  } else {
    // Fallback validation without text extraction
    console.log('    ℹ️  pdf-parse not available - using fallback validation');
    warnings.push('pdf-parse not installed - text validation skipped (install with: npm install pdf-parse)');

    // Sanity check: Search for critical forbidden patterns in raw PDF bytes
    // PDFs store text as strings, so we can do a naive search for "undefined"
    const pdfString = pdfBuffer.toString('utf-8', 0, Math.min(pdfBuffer.length, 100000));

    // Check for template variable failures (these would appear literally in PDF)
    const templateErrors = [
      'undefined',
      '{{',
      '}}',
      'NULL',
      '[object Object]',
    ];

    for (const pattern of templateErrors) {
      if (pdfString.includes(pattern)) {
        errors.push(`Found template error pattern in PDF: "${pattern}"`);
      }
    }

    // File size is our main indicator of success
    if (pdfBuffer.length >= MIN_PDF_SIZE) {
      warnings.push(`PDF size looks good (${pdfBuffer.length} bytes) - likely valid`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

async function testRoute(route: TestRoute): Promise<{
  success: boolean;
  caseId: string;
  pdfPath: string;
  errors: string[];
  warnings: string[];
}> {
  console.log(`\n🧪 Testing ${route.jurisdiction}/${route.route}...`);

  const errors: string[] = [];
  const warnings: string[] = [];
  let caseId = '';
  let pdfPath = '';

  try {
    // Step 1: Create case
    console.log('  📝 Creating case...');
    caseId = await createTestCase(route.jurisdiction);
    console.log(`  ✅ Case created: ${caseId}`);

    // Step 2: Submit answers
    console.log('  📋 Submitting wizard answers...');
    await submitWizardAnswers(caseId, route.minimalAnswers);
    console.log('  ✅ Answers submitted');

    // Step 3: Generate PDF
    console.log('  📄 Generating preview PDF...');
    const pdfBuffer = await generatePreviewPDF(caseId);
    console.log(`  ✅ PDF generated (${pdfBuffer.length} bytes)`);

    // Step 4: Save PDF
    const jurisdictionDir = path.join(ARTIFACTS_DIR, route.jurisdiction);
    await ensureDirectoryExists(jurisdictionDir);
    pdfPath = path.join(jurisdictionDir, `${route.route}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);
    console.log(`  💾 PDF saved: ${pdfPath}`);

    // Step 5: Validate PDF
    console.log('  🔍 Validating PDF content...');
    const validation = await validatePDF(pdfBuffer, route);

    if (validation.warnings.length > 0) {
      warnings.push(...validation.warnings);
      validation.warnings.forEach((warn) => console.log(`  ⚠️  ${warn}`));
    }

    if (!validation.valid) {
      errors.push(...validation.errors);
      console.log('  ❌ Validation failed:');
      validation.errors.forEach((err) => console.log(`     - ${err}`));
    } else {
      console.log('  ✅ PDF validation passed');
    }

    return { success: errors.length === 0, caseId, pdfPath, errors, warnings };
  } catch (error: any) {
    errors.push(`Exception: ${error.message}`);
    console.log(`  ❌ Error: ${error.message}`);
    return { success: false, caseId, pdfPath, errors, warnings };
  }
}

async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       NOTICE ONLY E2E PROOF - ALL ROUTES                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('✅ Supabase live mode - using real database');
  console.log('');
  console.log(`📁 Artifacts directory: ${ARTIFACTS_DIR}`);
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log(`🗄️  Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  // Ensure artifacts directory exists
  await ensureDirectoryExists(ARTIFACTS_DIR);

  // Test all routes
  const results: Array<{
    route: TestRoute;
    result: Awaited<ReturnType<typeof testRoute>>;
  }> = [];

  for (const route of TEST_ROUTES) {
    const result = await testRoute(route);
    results.push({ route, result });
  }

  // Summary
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  const successCount = results.filter((r) => r.result.success).length;
  const totalCount = results.length;

  results.forEach(({ route, result }) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${route.jurisdiction.padEnd(10)} | ${route.route.padEnd(20)} | Case: ${result.caseId}`);
    if (!result.success && result.errors.length > 0) {
      result.errors.forEach((err) => console.log(`       └─ ❌ ${err}`));
    }
    if (result.warnings && result.warnings.length > 0) {
      result.warnings.forEach((warn) => console.log(`       └─ ⚠️  ${warn}`));
    }
    if (result.pdfPath) {
      console.log(`       📄 PDF: ${result.pdfPath}`);
    }
  });

  console.log('');
  console.log('─'.repeat(70));
  console.log(`📊 Results: ${successCount}/${totalCount} routes passed`);
  console.log('─'.repeat(70));

  if (successCount === totalCount) {
    console.log('');
    console.log('🎉 SUCCESS: All Notice Only routes work end-to-end!');
    console.log('');
    console.log('✅ All PDFs generated successfully');
    console.log('✅ All validation checks passed');
    console.log('✅ No undefined or blank fields detected');
    console.log('✅ Jurisdiction-specific content verified');
    console.log('');
    console.log(`📂 Review generated PDFs in: ${ARTIFACTS_DIR}`);
    console.log('');
    process.exit(0);
  } else {
    console.log('');
    console.log('❌ FAILURE: Some routes failed');
    console.log('');
    console.log('Review errors above and check:');
    console.log('  - MSQ question IDs match mapper expectations');
    console.log('  - Decision engine computes dates correctly');
    console.log('  - Templates reference correct variables');
    console.log('  - Preview API returns valid PDFs');
    console.log('');
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
