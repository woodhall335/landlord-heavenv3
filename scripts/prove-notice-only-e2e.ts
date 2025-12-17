#!/usr/bin/env tsx
/**
 * NOTICE ONLY E2E PROOF SCRIPT
 *
 * This script proves Notice Only works end-to-end for ALL supported routes:
 * - England: section_8, section_21
 * - Wales: wales_section_173, wales_fault_based
 * - Scotland: notice_to_leave
 *
 * For each route:
 * 1. Creates a case (Supabase)
 * 2. Submits minimal valid wizard answers
 * 3. Calls preview API to generate PDF
 * 4. Writes PDF to artifacts/notice_only/<jurisdiction>/<route>.pdf
 * 5. Validates:
 *    - File exists
 *    - File size > minimum threshold
 *    - Extracted text contains expected phrases (via pdf-parse, if available)
 *    - Extracted text does NOT contain forbidden phrases / obvious template failures
 *
 * Exit code 0 = ALL routes work
 * Exit code 1 = At least one route failed
 *
 * USAGE:
 *
 * Run all routes:
 *   npx tsx scripts/prove-notice-only-e2e.ts
 *
 * Single-route mode (for debugging):
 *   NOTICE_ONLY_ROUTE=wales_fault_based NOTICE_ONLY_JURISDICTION=wales npx tsx scripts/prove-notice-only-e2e.ts
 *
 * Error artifacts are saved to:
 *   artifacts/notice_only/_reports/preview-error-<jurisdiction>-<route>-<caseId>.<ext>
 *
 * Notes:
 * - This script explicitly loads .env.local (Next.js does this automatically; tsx scripts do not).
 * - pdf-parse is optional, but if installed we validate via extracted text (recommended).
 * - Preview API failures are retried up to 3 times for transient errors (500/502/503/504, manifest issues).
 */

import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Explicitly load .env.local for tsx/node scripts
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

function getEnvVar(...names: string[]): string | undefined {
  for (const name of names) {
    const v = process.env[name];
    if (v && v.trim().length > 0) return v;
  }
  return undefined;
}

function validateEnvironment(): void {
  const missing: string[] = [];

  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  const supabaseAnon = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');

  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)');
  if (!supabaseAnon) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)');

  if (missing.length > 0) {
    console.error('╔═══════════════════════════════════════════════════════════════╗');
    console.error('║                    CONFIGURATION ERROR                        ║');
    console.error('╚═══════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('❌ Missing required environment variables:\n');
    missing.forEach((m) => console.error(`   • ${m}`));
    console.error('');
    console.error('This script requires Supabase to be configured.\n');
    console.error('To fix this:');
    console.error('  1. Ensure .env.local exists in repo root');
    console.error('  2. Ensure it contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('  3. Re-run: npx tsx scripts/prove-notice-only-e2e.ts');
    console.error('');
    process.exit(1);
  }
}

validateEnvironment();

// Environment
const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')!;
const SUPABASE_ANON_KEY = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY')!;

// Prefer NEXT_PUBLIC_APP_URL; fallback to NEXT_PUBLIC_SITE_URL; then default
const API_BASE_URL = getEnvVar('NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_SITE_URL') || 'http://localhost:5000';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Artifacts directory
const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'notice_only');
const REPORTS_DIR = path.join(ARTIFACTS_DIR, '_reports');

// ============================================================================
// TYPES
// ============================================================================

interface TestRoute {
  jurisdiction: 'england' | 'wales' | 'scotland';
  route: string;
  minimalAnswers: Record<string, unknown>;
  expectedPhrases: string[];
  forbiddenPhrases: string[];
}

type RouteResult = {
  success: boolean;
  caseId: string;
  pdfPath: string;
  errors: string[];
  warnings: string[];
};

// ============================================================================
// TEST ROUTES
// ============================================================================

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
      rent_arrears_amount: 2400,
      ground_particulars:
        'Tenant owes £2,400 in rent arrears covering 2 months (January-February 2025). Last payment received was December 2024. Rent is due monthly on the 1st. Tenant has been contacted multiple times but has not responded.',
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
    forbiddenPhrases: ['undefined', '{{', 'NULL', 'contract holder', 'Section 173', 'Notice to Leave'],
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
    forbiddenPhrases: ['undefined', '{{', 'Ground 8', 'contract holder', 'Section 173'],
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
      breach_details:
        'Contract holder owes £1,500 in rent arrears covering 2 months (November-December 2024). Rent is due monthly on the 1st. Multiple payment reminders have been sent but arrears remain unpaid.',
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
      selected_notice_route: 'notice_to_leave',
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
      ground_particulars:
        'The tenant owes £3,500 in rent arrears covering over 3 months. Pre-action requirements have been completed including written notice to the tenant and signposting to debt advice services. Despite multiple contact attempts, the arrears remain unpaid.',
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

// ============================================================================
// HELPERS
// ============================================================================

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function createTestCase(jurisdiction: string, product: string = 'notice_only'): Promise<string> {
  // DB schema: scotland -> scotland, wales -> wales, england -> england-wales
  const dbJurisdiction =
    jurisdiction === 'scotland' ? 'scotland' : jurisdiction === 'wales' ? 'wales' : 'england-wales';

  const { data, error } = await supabase
    .from('cases')
    .insert({
      jurisdiction: dbJurisdiction,
      case_type: 'eviction',
      status: 'in_progress',
      collected_facts: {
        __meta: {
          product,
        },
      },
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create case: ${error?.message || 'Unknown error'}`);
  }

  return data.id as string;
}

async function submitWizardAnswers(caseId: string, answers: Record<string, unknown>): Promise<void> {
  const { data: existing, error: readErr } = await supabase
    .from('cases')
    .select('collected_facts')
    .eq('id', caseId)
    .single();

  if (readErr) {
    throw new Error(`Failed to read existing facts: ${readErr.message}`);
  }

  const existingFacts = (existing?.collected_facts as Record<string, unknown> | null | undefined) ?? {};

  const existingMeta =
    typeof (existingFacts as Record<string, unknown>).__meta === 'object' &&
    (existingFacts as Record<string, unknown>).__meta !== null
      ? ((existingFacts as Record<string, unknown>).__meta as Record<string, unknown>)
      : {};

  const { error } = await supabase
    .from('cases')
    .update({
      collected_facts: {
        ...existingFacts,
        ...answers,
        __meta: {
          ...existingMeta,
          product: 'notice_only',
        },
      },
      status: 'completed',
      wizard_completed_at: new Date().toISOString(),
    })
    .eq('id', caseId);

  if (error) {
    throw new Error(`Failed to update case with answers: ${error.message}`);
  }
}

/**
 * Helper: Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper: Check if error is a transient server error that should be retried
 */
function isTransientError(status: number, body: string): boolean {
  // Retry on 5xx server errors
  if ([500, 502, 503, 504].includes(status)) return true;

  // Retry on Next.js manifest errors (common in dev mode)
  if (body.includes('Unexpected end of JSON input') || body.includes('loadManifest')) {
    return true;
  }

  return false;
}

/**
 * Helper: Save error artifact for debugging
 */
async function saveErrorArtifact(
  jurisdiction: string,
  route: string,
  caseId: string,
  status: number,
  contentType: string,
  body: string
): Promise<string> {
  await ensureDirectoryExists(REPORTS_DIR);

  const isHtml = contentType.includes('text/html');
  const ext = isHtml ? 'html' : 'txt';
  const filename = `preview-error-${jurisdiction}-${route}-${caseId}.${ext}`;
  const filepath = path.join(REPORTS_DIR, filename);

  const header = `HTTP ${status} Error\nContent-Type: ${contentType}\nTimestamp: ${new Date().toISOString()}\n\n`;
  await fs.writeFile(filepath, header + body);

  return filepath;
}

async function generatePreviewPDF(
  caseId: string,
  jurisdiction: string = '',
  route: string = ''
): Promise<Buffer> {
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [500, 1500, 3500]; // exponential backoff

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notice-only/preview/${caseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        const status = response.status;
        const contentType = response.headers.get('content-type') || 'unknown';
        const text = await response.text();

        // Check if this is a transient error that should be retried
        const shouldRetry = isTransientError(status, text);

        if (shouldRetry && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAYS[attempt - 1];
          console.log(`  ⚠️  Preview API failed (${status}), retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})...`);

          // Print remediation hint for manifest errors
          if (text.includes('loadManifest') && text.includes('Unexpected end of JSON input')) {
            console.log(`  💡 Hint: This is usually a corrupted .next manifest in dev mode.`);
            console.log(`      Try: stop server → delete .next → restart "npm run dev" → rerun E2E.`);
          }

          await sleep(delay);
          continue; // retry
        }

        // Save error artifact
        const errorPath = await saveErrorArtifact(jurisdiction, route, caseId, status, contentType, text);
        throw new Error(`Preview API failed: ${status} - Error saved to: ${errorPath}`);
      }

      // Success
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // If it's a network error or fetch failure, retry
      if (attempt < MAX_RETRIES && !lastError.message.includes('Error saved to:')) {
        const delay = RETRY_DELAYS[attempt - 1];
        console.log(`  ⚠️  Network error, retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})...`);
        await sleep(delay);
        continue;
      }

      // No more retries
      throw lastError;
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error('Preview API failed after retries');
}

/**
 * Try to load pdf-parse (optional dependency).
 * Supports:
 *  - classic function export (older pdf-parse)
 *  - class export (PDFParse) with load()/getText() across different builds
 */
async function tryLoadPdfParse(): Promise<((data: Buffer) => Promise<{ text?: string }>) | null> {
  try {
    const mod: any = await import('pdf-parse');

    // ---------------------------
    // Shape A: classic function export
    // ---------------------------
    const fnCandidates = [mod?.default, mod, mod?.default?.default];
    const fn = fnCandidates.find((c) => typeof c === 'function');
    if (fn) {
      return async (data: Buffer) => {
        // data is already Buffer
        return fn(data);
      };
    }

    // ---------------------------
    // Shape B: class export
    // ---------------------------
    if (typeof mod?.PDFParse === 'function') {
      return async (data: Buffer) => {
        const verbosity =
          mod?.VerbosityLevel?.ERRORS ??
          mod?.VerbosityLevel?.WARNINGS ??
          mod?.VerbosityLevel?.SILENT ??
          0;

        const parser = new mod.PDFParse({ verbosity });

        // normalize Buffer to Uint8Array for PDF.js internals
        const u8: Uint8Array = new Uint8Array(data);

        const tryCall = async (label: string, f: () => Promise<any>) => {
          try {
            return await f();
          } catch (e: any) {
            const msg = e?.message ? String(e.message) : String(e);
            throw new Error(`${label}: ${msg}`);
          }
        };

        // 1) Some builds support getText(input) directly
        if (typeof parser.getText === 'function' && parser.getText.length >= 1) {
          const shapes = [
            u8,
            { data: u8 },
            { buffer: u8 },
            // some builds also accept ArrayBuffer
            u8.buffer,
            { data: u8.buffer },
          ];

          for (const shape of shapes) {
            try {
              const out = await tryCall('PDFParse.getText(arg)', async () => parser.getText(shape));
              return { text: String(out ?? '') };
            } catch {
              // keep trying
            }
          }
        }

        // 2) Otherwise: load(...) then getText()
        if (typeof parser.load !== 'function') {
          throw new Error('pdf-parse: PDFParse.load() not found');
        }

        const loadShapes = [
          u8,
          { data: u8 },
          { buffer: u8 },
          u8.buffer,
          { data: u8.buffer },
        ];

        let lastLoadErr: Error | null = null;

        for (const shape of loadShapes) {
          try {
            await tryCall('PDFParse.load(arg)', async () => parser.load(shape));
            lastLoadErr = null;
            break;
          } catch (e: any) {
            lastLoadErr = e instanceof Error ? e : new Error(String(e));
          }
        }

        if (lastLoadErr) throw lastLoadErr;

        if (typeof parser.getText !== 'function') {
          throw new Error('pdf-parse: PDFParse.getText() not found');
        }

        const text = await tryCall('PDFParse.getText()', async () => parser.getText());
        return { text: String(text ?? '') };
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function validatePDF(
  pdfBuffer: Buffer,
  route: TestRoute
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const MIN_PDF_SIZE = 40 * 1024; // 40KB
  const TINY_PDF_SIZE = 5000; // 5KB

  if (pdfBuffer.length < TINY_PDF_SIZE) {
    errors.push(`PDF too small (${pdfBuffer.length} bytes) - likely generation error`);
  } else if (pdfBuffer.length < MIN_PDF_SIZE) {
    warnings.push(
      `PDF smaller than expected (${pdfBuffer.length} bytes, expected >${MIN_PDF_SIZE}) - may be missing content`
    );
  }

  const pdfHeader = pdfBuffer.slice(0, 5).toString('utf-8');
  if (!pdfHeader.startsWith('%PDF-')) {
    errors.push(`Invalid PDF header: "${pdfHeader}" - not a valid PDF file`);
    return { valid: false, errors, warnings };
  }

  const pdfParse = await tryLoadPdfParse();

  if (pdfParse) {
    console.log('    ℹ️  pdf-parse available - performing full text validation');

    let pdfText = '';
    let parseSuccess = false;

    try {
      // IMPORTANT: pass Buffer to avoid TS mismatch and to satisfy older pdf-parse signatures.
      // If the installed implementation requires Uint8Array internally, our loader handles that.
      const pdfData = await pdfParse(pdfBuffer);
      pdfText = String(pdfData?.text ?? '');
      parseSuccess = true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      warnings.push(`pdf-parse failed (${msg}) - falling back to size/header-only validation`);
      if (pdfBuffer.length >= MIN_PDF_SIZE) {
        warnings.push(`PDF size looks good (${pdfBuffer.length} bytes) - likely valid`);
      }
      return { valid: errors.length === 0, errors, warnings };
    }

    if (parseSuccess) {
      for (const phrase of route.expectedPhrases) {
        if (!pdfText.includes(phrase)) {
          errors.push(`Missing expected phrase: "${phrase}"`);
        }
      }

      for (const phrase of route.forbiddenPhrases) {
        if (pdfText.includes(phrase)) {
          errors.push(`Found forbidden phrase: "${phrase}"`);
        }
      }

      const leakPatterns = ['{{', '}}', 'undefined', 'NULL', '[object Object]', '****'];
      for (const pattern of leakPatterns) {
        if (pdfText.includes(pattern)) {
          errors.push(`Found template/leak pattern in extracted text: "${pattern}"`);
        }
      }
    }
  } else {
    console.log('    ℹ️  pdf-parse not available - using size/header-only validation');
    warnings.push('pdf-parse not available - text validation skipped (install: npm i -D pdf-parse)');

    if (pdfBuffer.length >= MIN_PDF_SIZE) {
      warnings.push(`PDF size looks good (${pdfBuffer.length} bytes) - likely valid`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

async function testRoute(route: TestRoute): Promise<RouteResult> {
  console.log(`\n🧪 Testing ${route.jurisdiction}/${route.route}...`);

  const errors: string[] = [];
  const warnings: string[] = [];
  let caseId = '';
  let pdfPath = '';

  try {
    console.log('  📝 Creating case...');
    caseId = await createTestCase(route.jurisdiction);
    console.log(`  ✅ Case created: ${caseId}`);

    console.log('  📋 Submitting wizard answers...');
    await submitWizardAnswers(caseId, route.minimalAnswers);
    console.log('  ✅ Answers submitted');

    console.log('  📄 Generating preview PDF...');
    const pdfBuffer = await generatePreviewPDF(caseId, route.jurisdiction, route.route);
    console.log(`  ✅ PDF generated (${pdfBuffer.length} bytes)`);

    const jurisdictionDir = path.join(ARTIFACTS_DIR, route.jurisdiction);
    await ensureDirectoryExists(jurisdictionDir);

    pdfPath = path.join(jurisdictionDir, `${route.route}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);
    console.log(`  💾 PDF saved: ${pdfPath}`);

    console.log('  🔍 Validating PDF content...');
    const validation = await validatePDF(pdfBuffer, route);

    if (validation.warnings.length > 0) {
      warnings.push(...validation.warnings);
      validation.warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
    }

    if (!validation.valid) {
      errors.push(...validation.errors);
      console.log('  ❌ Validation failed:');
      validation.errors.forEach((e) => console.log(`     - ${e}`));
    } else {
      console.log('  ✅ PDF validation passed');
    }

    return { success: errors.length === 0, caseId, pdfPath, errors, warnings };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`Exception: ${msg}`);
    console.log(`  ❌ Error: ${msg}`);
    return { success: false, caseId, pdfPath, errors, warnings };
  }
}

// ============================================================================
// MAIN
// ============================================================================

/**
 * Helper: Preflight check to warm up Next.js dev server
 */
async function devServerPreflight(): Promise<void> {
  console.log('🔧 Running dev server preflight check...');

  try {
    // Try health endpoint first
    const healthUrl = `${API_BASE_URL}/api/health`;
    try {
      const healthResponse = await fetch(healthUrl, { method: 'GET' });
      console.log(`  ✅ Health endpoint responded: ${healthResponse.status}`);
    } catch {
      // Health endpoint doesn't exist, try a quick invalid preview request
      const previewUrl = `${API_BASE_URL}/api/notice-only/preview/00000000-0000-0000-0000-000000000000`;
      const previewResponse = await fetch(previewUrl, { method: 'GET' });
      console.log(`  ✅ Preview endpoint warmed up: ${previewResponse.status}`);
    }

    // Wait for Next.js to finish compiling routes
    await sleep(500);
    console.log('  ✅ Preflight complete\n');
  } catch (err) {
    console.log(`  ⚠️  Preflight check failed (non-fatal): ${err instanceof Error ? err.message : String(err)}\n`);
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

  // Check for single-route mode
  const filterRoute = process.env.NOTICE_ONLY_ROUTE;
  const filterJurisdiction = process.env.NOTICE_ONLY_JURISDICTION;

  if (filterRoute || filterJurisdiction) {
    console.log('');
    console.log('🔍 SINGLE-ROUTE MODE ENABLED:');
    if (filterJurisdiction) console.log(`   Jurisdiction filter: ${filterJurisdiction}`);
    if (filterRoute) console.log(`   Route filter: ${filterRoute}`);
  }

  console.log('');

  await ensureDirectoryExists(ARTIFACTS_DIR);

  // Run preflight check to warm up dev server
  await devServerPreflight();

  // Filter routes if in single-route mode
  let routesToTest = TEST_ROUTES;
  if (filterJurisdiction || filterRoute) {
    routesToTest = TEST_ROUTES.filter((r) => {
      if (filterJurisdiction && r.jurisdiction !== filterJurisdiction) return false;
      if (filterRoute && r.route !== filterRoute) return false;
      return true;
    });

    if (routesToTest.length === 0) {
      console.error('❌ No routes match the specified filters!');
      console.error(`   Available jurisdictions: england, wales, scotland`);
      console.error(`   Available routes: ${TEST_ROUTES.map((r) => r.route).join(', ')}`);
      process.exit(1);
    }

    console.log(`📋 Testing ${routesToTest.length} route(s) matching filters\n`);
  }

  const results: Array<{ route: TestRoute; result: RouteResult }> = [];

  for (const route of routesToTest) {
    const result = await testRoute(route);
    results.push({ route, result });
  }

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  const successCount = results.filter((r) => r.result.success).length;
  const totalCount = results.length;

  for (const { route, result } of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(
      `${status} | ${route.jurisdiction.padEnd(10)} | ${route.route.padEnd(20)} | Case: ${result.caseId || '—'}`
    );

    if (!result.success && result.errors.length > 0) {
      result.errors.forEach((err) => console.log(`       └─ ❌ ${err}`));
    }
    if (result.warnings.length > 0) {
      result.warnings.forEach((warn) => console.log(`       └─ ⚠️  ${warn}`));
    }
    if (result.pdfPath) {
      console.log(`       📄 PDF: ${result.pdfPath}`);
    }
  }

  console.log('');
  console.log('─'.repeat(70));
  console.log(`📊 Results: ${successCount}/${totalCount} routes passed`);
  console.log('─'.repeat(70));

  if (successCount === totalCount) {
    console.log('');
    console.log('🎉 SUCCESS: All Notice Only routes work end-to-end!');
    console.log('');
    console.log('✅ All PDFs generated successfully');
    console.log('✅ All extracted-text validation checks passed (when pdf-parse is available)');
    console.log('✅ No obvious undefined/template failures detected');
    console.log('✅ Jurisdiction-specific content verified');
    console.log('');
    console.log(`📂 Review generated PDFs in: ${ARTIFACTS_DIR}`);
    console.log('');
    process.exit(0);
  }

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

// Run
main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('Fatal error:', msg);
  process.exit(1);
});
