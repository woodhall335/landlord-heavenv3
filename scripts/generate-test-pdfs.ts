#!/usr/bin/env tsx
/**
 * Standalone PDF Generator for Testing Template Fixes
 *
 * This script generates Notice Only PDFs directly from templates
 * without requiring Supabase, using the same test data from the E2E script.
 */

import fs from 'fs/promises';
import path from 'path';
import { generateDocument } from '@/lib/documents/generator';
import { mapNoticeOnlyFacts, wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'notice_only');

// Test data for each jurisdiction (from prove-notice-only-e2e.ts)
const testCases = [
  {
    jurisdiction: 'england' as const,
    route: 'section_21',
    fileName: 'section_21.pdf',
    answers: {
      selected_notice_route: 'section_21',
      property_address_line_1: '123 Test Street',
      property_address_line_2: 'Flat 4',
      property_city: 'London',
      property_postcode: 'SW1A 1AA',
      tenant_first_name: 'John',
      tenant_last_name: 'Doe',
      tenant_full_name: 'John Doe',
      landlord_first_name: 'Jane',
      landlord_last_name: 'Smith',
      landlord_full_name: 'Jane Smith',
      landlord_address: '456 Landlord Ave\nLondon\nW1A 0AA',
      tenancy_start_date: '2020-06-01',
      tenancy_type: 'periodic',
      rent_amount: 1200,
      rent_period: 'monthly',
      deposit_amount: 1200,
      deposit_protected: true,
      deposit_scheme: 'DPS',
      deposit_reference: 'DPS123456',
      notice_date: '2025-12-16',
      service_date: '2025-12-16',
      earliest_possession_date: '2026-02-16',
    },
  },
  {
    jurisdiction: 'england' as const,
    route: 'section_8',
    fileName: 'section_8.pdf',
    answers: {
      selected_notice_route: 'section_8',
      property_address_line_1: '123 Test Street',
      property_address_line_2: 'Flat 4',
      property_city: 'London',
      property_postcode: 'SW1A 1AA',
      tenant_first_name: 'John',
      tenant_last_name: 'Doe',
      tenant_full_name: 'John Doe',
      landlord_first_name: 'Jane',
      landlord_last_name: 'Smith',
      landlord_full_name: 'Jane Smith',
      landlord_address: '456 Landlord Ave\nLondon\nW1A 0AA',
      tenancy_start_date: '2020-06-01',
      rent_amount: 1200,
      rent_period: 'monthly',
      arrears_amount: 3600,
      grounds: [8],
      notice_date: '2025-12-16',
      service_date: '2025-12-16',
      earliest_possession_date: '2025-12-30',
    },
  },
  {
    jurisdiction: 'scotland' as const,
    route: 'notice_to_leave',
    fileName: 'notice_to_leave.pdf',
    answers: {
      selected_notice_route: 'notice_to_leave',
      property_address_line_1: '789 Edinburgh Road',
      property_city: 'Edinburgh',
      property_postcode: 'EH1 1AA',
      tenant_first_name: 'Robert',
      tenant_last_name: 'Burns',
      tenant_full_name: 'Robert Burns',
      landlord_first_name: 'Mary',
      landlord_last_name: 'Queen',
      landlord_full_name: 'Mary Queen',
      landlord_address: '101 Castle Street\nEdinburgh\nEH2 3AR',
      tenancy_start_date: '2022-01-01',
      rent_amount: 1000,
      rent_period: 'monthly',
      arrears_amount: 3000,
      scotland_grounds: [1],
      notice_date: '2025-12-16',
      service_date: '2025-12-16',
      earliest_possession_date: '2026-03-16',
    },
  },
  {
    jurisdiction: 'wales' as const,
    route: 'wales_section_173',
    fileName: 'wales_section_173.pdf',
    answers: {
      selected_notice_route: 'wales_section_173',
      property_address_line_1: '22 Dragon Street',
      property_city: 'Cardiff',
      property_postcode: 'CF10 1AA',
      tenant_first_name: 'Dylan',
      tenant_last_name: 'Thomas',
      tenant_full_name: 'Dylan Thomas',
      landlord_first_name: 'Owain',
      landlord_last_name: 'Glyndwr',
      landlord_full_name: 'Owain Glyndwr',
      landlord_address: '33 Prince Street\nCardiff\nCF11 9AB',
      tenancy_start_date: '2020-12-01',
      rent_amount: 900,
      rent_period: 'monthly',
      notice_date: '2025-12-16',
      service_date: '2025-12-16',
      earliest_possession_date: '2026-06-16',
    },
  },
  {
    jurisdiction: 'wales' as const,
    route: 'wales_fault_based',
    fileName: 'wales_fault_based.pdf',
    answers: {
      selected_notice_route: 'wales_fault_based',
      property_address_line_1: '22 Dragon Street',
      property_city: 'Cardiff',
      property_postcode: 'CF10 1AA',
      tenant_first_name: 'Dylan',
      tenant_last_name: 'Thomas',
      tenant_full_name: 'Dylan Thomas',
      landlord_first_name: 'Owain',
      landlord_last_name: 'Glyndwr',
      landlord_full_name: 'Owain Glyndwr',
      landlord_address: '33 Prince Street\nCardiff\nCF11 9AB',
      tenancy_start_date: '2020-12-01',
      rent_amount: 900,
      rent_period: 'monthly',
      wales_breach_type: 'rent_arrears',
      rent_arrears_amount: 2700,
      breach_details: 'Rent arrears of £2700 for 3 months',
      notice_date: '2025-12-16',
      service_date: '2025-12-16',
      earliest_possession_date: '2026-01-15',
    },
  },
];

// Template path mapping - uses canonical notice_only templates for England
const templatePaths: Record<string, string> = {
  section_21: 'uk/england/templates/notice_only/form_6a_section21/notice.hbs',
  section_8: 'uk/england/templates/notice_only/form_3_section8/notice.hbs',
  notice_to_leave: 'uk/scotland/templates/eviction/notice_to_leave.hbs',
  wales_section_173: 'uk/wales/templates/eviction/section173_landlords_notice.hbs',
  wales_fault_based: 'uk/wales/templates/eviction/fault_based_notice.hbs',
};

async function generateTestPDF(
  jurisdiction: 'england' | 'wales' | 'scotland',
  route: string,
  fileName: string,
  answers: Record<string, unknown>
) {
  console.log(`\n📝 Generating ${jurisdiction}/${route}...`);

  try {
    // Convert wizard answers to case facts (same as preview API does)
    const caseFacts = wizardFactsToCaseFacts(answers) as CaseFacts;

    // Map to template data (same as preview API does)
    const templateData = mapNoticeOnlyFacts(answers);

    // Add metadata
    templateData.is_preview = true;
    templateData.generation_date = new Date().toISOString();
    templateData.document_id = `TEST-${Date.now()}`;

    // Add route-specific fixes (mirroring preview API route)
    if (route === 'section_21' && templateData.tenancy_start_date) {
      // Calculate first anniversary date
      const tenancyStart = new Date(templateData.tenancy_start_date);
      const anniversary = new Date(tenancyStart);
      anniversary.setFullYear(anniversary.getFullYear() + 1);
      const firstAnniversaryDate = anniversary.toISOString().split('T')[0];
      templateData.first_anniversary_date = firstAnniversaryDate;
    }

    if (route === 'wales_section_173') {
      // Calculate 6-month expiry date
      const serviceDate = new Date(templateData.service_date || templateData.notice_date);
      const expiry = new Date(serviceDate);
      expiry.setMonth(expiry.getMonth() + 6);
      templateData.expiry_date = expiry.toISOString().split('T')[0];
    }

    if (route === 'wales_fault_based') {
      // Convert breach type enum to display
      const breachType = answers.wales_breach_type as string || 'breach_of_contract';
      templateData.wales_breach_type = breachType === 'rent_arrears' ? 'Rent Arrears' :
                                       breachType === 'anti_social_behaviour' ? 'Anti-Social Behaviour' :
                                       breachType === 'property_damage' ? 'Property Damage' :
                                       breachType === 'unauthorised_occupants' ? 'Unauthorised Occupants' :
                                       breachType === 'breach_of_contract' ? 'Breach of Contract' :
                                       breachType;
    }

    if (route === 'notice_to_leave' && answers.scotland_grounds && (answers.scotland_grounds as any[]).includes(1)) {
      // Add arrears details for Ground 1
      templateData.total_arrears = answers.arrears_amount || 0;
      templateData.arrears_date = templateData.notice_date;
      const arrearsAmount = (answers.arrears_amount as number) || 0;
      const monthlyRent = (answers.rent_amount as number) || 1000;
      templateData.arrears_duration_months = Math.floor(arrearsAmount / monthlyRent);
    }

    // Generate PDF using the document generator
    const templatePath = templatePaths[route];
    if (!templatePath) {
      throw new Error(`No template path defined for route: ${route}`);
    }
    console.log(`   Using template: ${templatePath}`);

    const result = await generateDocument({
      templatePath,
      data: templateData,
      outputFormat: 'pdf',
      isPreview: true,
    });

    if (!result.pdf) {
      throw new Error('PDF generation returned no buffer');
    }

    const pdfBuffer = result.pdf;

    // Ensure output directory exists
    const outputDir = path.join(ARTIFACTS_DIR, jurisdiction);
    await fs.mkdir(outputDir, { recursive: true });

    // Write PDF
    const outputPath = path.join(outputDir, fileName);
    await fs.writeFile(outputPath, pdfBuffer);

    const stats = await fs.stat(outputPath);
    console.log(`   ✅ Generated: ${outputPath} (${stats.size} bytes)`);

    return { success: true, path: outputPath, size: stats.size };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`   ❌ Failed: ${message}`);
    return { success: false, error: message };
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         Standalone PDF Generator - Testing Fixes             ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  console.log(`\n📁 Output directory: ${ARTIFACTS_DIR}\n`);

  const results = [];

  for (const testCase of testCases) {
    const result = await generateTestPDF(
      testCase.jurisdiction,
      testCase.route,
      testCase.fileName,
      testCase.answers
    );
    results.push({ ...testCase, ...result });
  }

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                        SUMMARY                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    failed.forEach(f => {
      console.log(`   - ${f.jurisdiction}/${f.route}: ${f.error}`);
    });
  }

  if (successful.length === results.length) {
    console.log('\n🎉 All PDFs generated successfully!');
    console.log('   Next step: Run audit script to verify content');
    console.log('   Command: npx tsx scripts/audit-notice-only-pdfs.ts');
    process.exit(0);
  } else {
    console.log('\n❌ Some PDFs failed to generate');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
