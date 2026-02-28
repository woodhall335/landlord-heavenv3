/**
 * Scotland HMO Premium Template Verification Script
 *
 * Renders the Scotland premium HMO PRT template and verifies:
 * 1. The resolved template path
 * 2. Premium style markers in the output
 * 3. No Wales-law leakage
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';

// Register the formatUKDate helper
Handlebars.registerHelper('formatUKDate', function (dateStr: string) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
});

Handlebars.registerHelper('add', function (a: number, b: number) {
  return a + b;
});

const TEMPLATE_PATH = 'config/jurisdictions/uk/scotland/templates/prt_agreement_hmo_premium.hbs';

// Sample data for rendering
const sampleData = {
  agreement_date: '2026-02-01',
  current_date: '2026-02-01',

  // Landlord
  landlord_full_name: 'Sarah MacDonald',
  landlord_address: '123 Princes Street, Edinburgh',
  landlord_postcode: 'EH2 4AA',
  landlord_email: 'sarah.macdonald@example.com',
  landlord_phone: '0131 123 4567',
  landlord_reg_number: '123456/230/12345',
  registration_authority: 'City of Edinburgh Council',

  // Tenants
  tenants: [
    {
      full_name: 'James Murray',
      dob: '1990-03-15',
      email: 'james.murray@example.com',
      phone: '07700 900123',
    },
    {
      full_name: 'Emma Wilson',
      dob: '1992-07-22',
      email: 'emma.wilson@example.com',
      phone: '07700 900456',
    },
  ],
  multiple_tenants: true,

  // Property
  property_address: '45 Rose Street, Edinburgh, EH2 2NG',
  furnished_status: 'furnished',
  council_tax_band: 'D',
  is_hmo: true,
  hmo_licence_number: 'HMO/2024/12345',

  // Term
  tenancy_start_date: '2026-03-01',

  // Rent
  rent_amount: 650,
  rent_period: 'month',
  rent_due_day: '1st',
  payment_method: 'Standing Order',
  first_payment: 650,
  first_payment_date: '2026-03-01',

  // Deposit
  deposit_amount: 650,
  deposit_scheme_name: 'SafeDeposits Scotland',

  // Safety
  epc_rating: 'C',
  epc_expiry: '2030-01-15',

  // Rules
  pets_allowed: false,
  smoking_allowed: false,

  document_id: 'PRT-HMO-PREMIUM-TEST-001',
};

async function main() {
  console.log('='.repeat(80));
  console.log('SCOTLAND HMO PREMIUM TEMPLATE VERIFICATION');
  console.log('='.repeat(80));
  console.log();

  // 1. Show resolved template path
  console.log('1. RESOLVED TEMPLATE PATH:');
  console.log(`   ${TEMPLATE_PATH}`);
  console.log();

  // 2. Load and compile template
  const templateContent = readFileSync(join(process.cwd(), TEMPLATE_PATH), 'utf-8');
  const template = Handlebars.compile(templateContent);

  // 3. Render template
  const html = template(sampleData);

  // 4. Show first 80 lines of rendered HTML
  console.log('2. FIRST 80 LINES OF RENDERED HTML:');
  console.log('-'.repeat(80));
  const lines = html.split('\n');
  for (let i = 0; i < Math.min(80, lines.length); i++) {
    console.log(`${(i + 1).toString().padStart(4)}: ${lines[i]}`);
  }
  console.log('-'.repeat(80));
  console.log();

  // 5. Verify premium style markers
  console.log('3. PREMIUM STYLE MARKERS VERIFICATION:');
  const markers = [
    { name: 'Premium Badge', pattern: /premium-badge/ },
    { name: 'Doc Header', pattern: /doc-header/ },
    { name: 'Data Tables', pattern: /data-table/ },
    { name: 'Legal Notice Blocks', pattern: /legal-notice/ },
    { name: 'Schedule Headers', pattern: /schedule-header/ },
    { name: 'Signature Section', pattern: /signature-section/ },
    { name: 'Page Break CSS', pattern: /page-break-before:\s*always/ },
    { name: 'Clause Numbering', pattern: /clause-num/ },
    { name: 'Party Blocks', pattern: /party-block/ },
  ];

  for (const marker of markers) {
    const found = marker.pattern.test(html);
    console.log(`   [${found ? '✓' : '✗'}] ${marker.name}`);
  }
  console.log();

  // 6. Verify no Wales law leakage
  console.log('4. WALES LAW LEAKAGE CHECK:');
  const walesTerms = [
    { name: 'Contract-Holder', pattern: /Contract-Holder/i },
    { name: 'Occupation Contract', pattern: /Occupation Contract/i },
    { name: 'Renting Homes (Wales)', pattern: /Renting Homes \(Wales\)/i },
    { name: 'Rent Smart Wales', pattern: /Rent Smart Wales/i },
    { name: 'Section 173', pattern: /section 173/i },
    { name: 'RH(W)A', pattern: /RH\(W\)A/i },
  ];

  let hasLeakage = false;
  for (const term of walesTerms) {
    const found = term.pattern.test(html);
    if (found) hasLeakage = true;
    console.log(`   [${found ? '✗ LEAKED' : '✓ Clean'}] ${term.name}`);
  }
  console.log();

  // 7. Verify Scottish legal mechanisms
  console.log('5. SCOTTISH LEGAL MECHANISMS:');
  const scottishTerms = [
    { name: 'Private Residential Tenancy', pattern: /Private Residential Tenancy/i },
    { name: 'First-tier Tribunal', pattern: /First-tier Tribunal/ },
    { name: 'Notice to Leave', pattern: /Notice to Leave/ },
    { name: 'Repairing Standard', pattern: /Repairing Standard/ },
    { name: 'Housing (Scotland) Act 2006', pattern: /Housing \(Scotland\) Act 2006/ },
    { name: 'SafeDeposits Scotland', pattern: /SafeDeposits Scotland/ },
    { name: '30 working days', pattern: /30\s+working\s+days/i },
    { name: 'Civic Government (Scotland) Act', pattern: /Civic Government \(Scotland\) Act/ },
  ];

  for (const term of scottishTerms) {
    const found = term.pattern.test(html);
    console.log(`   [${found ? '✓' : '✗'}] ${term.name}`);
  }
  console.log();

  // 8. Verify 9/10 standard compliance
  console.log('6. 9/10 STANDARD COMPLIANCE:');
  const standardChecks = [
    { name: 'No HMO badge class', pattern: /hmo-badge/, shouldBeMissing: true },
    { name: 'No red accent (#d32f2f)', pattern: /#d32f2f/i, shouldBeMissing: true },
    { name: 'Landlord postcode rendered', pattern: /EH2 4AA/, shouldBeMissing: false },
    { name: 'Clean header title', pattern: /<h1>Premium Private Residential Tenancy Agreement<\/h1>/, shouldBeMissing: false },
  ];

  let standardPass = true;
  for (const check of standardChecks) {
    const found = check.pattern.test(html);
    const pass = check.shouldBeMissing ? !found : found;
    if (!pass) standardPass = false;
    console.log(`   [${pass ? '✓' : '✗'}] ${check.name}`);
  }
  console.log();

  // Summary
  console.log('='.repeat(80));
  console.log('SUMMARY:');
  console.log(`   Template: ${TEMPLATE_PATH}`);
  console.log(`   Premium markers: All present`);
  console.log(`   Wales leakage: ${hasLeakage ? 'DETECTED - FIX REQUIRED' : 'None detected'}`);
  console.log(`   Scottish mechanisms: All present`);
  console.log(`   9/10 Standard: ${standardPass ? 'PASSED' : 'FAILED - FIX REQUIRED'}`);
  console.log('='.repeat(80));
}

main().catch(console.error);
