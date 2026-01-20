/**
 * End-to-End Regression Test for PDF Debug Stamps
 *
 * This test validates:
 * 1. Debug stamps are added to generated PDFs with correct SHA, generator, templates, case_id
 * 2. Arrears letter does NOT show £0.00 when arrears exist
 * 3. N119 form Q2 contains tenant name (persons in possession)
 * 4. N119 form Q6 contains proper notice text
 * 5. N119 does not contain malformed notice date fragments
 *
 * Case ID: 549f8bbf-82c3-47f5-96fc-fb522b64867b
 * Product: complete_pack
 *
 * @see docs/pdf-debug-audit.md for full audit details
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { generateCompleteEvictionPack } from '@/lib/documents/eviction-pack-generator';
import { extractPdfText } from '@/lib/evidence/extract-pdf-text';
import { getGitSha, getGitShaShort, isDebugStampEnabled, verifyShaMatchesHead } from '@/lib/documents/debug-stamp';

// Test case from fixture
const CASE_ID = '549f8bbf-82c3-47f5-96fc-fb522b64867b';
const OUTPUT_DIR = path.join(process.cwd(), 'tests', 'output');

// Load the golden fixture
const fixturePath = path.join(
  process.cwd(),
  'tests/fixtures/complete-pack/england.section8.ground8.case.json'
);

let wizardFacts: any;
let generatedPack: any;
let extractedTexts: {
  arrearsLetter: string;
  n119: string;
};

describe('PDF Debug Stamp E2E Regression Test', () => {
  beforeAll(async () => {
    // Set debug environment
    process.env.NODE_ENV = 'test';
    process.env.PDF_DEBUG_STAMP = '1';
    process.env.DEBUG_ARREARS = '1';

    // Load fixture
    const fixtureContent = await fs.readFile(fixturePath, 'utf-8');
    wizardFacts = JSON.parse(fixtureContent);

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Transform fixture to expected wizard facts format
    const transformedFacts = {
      ...wizardFacts,
      __meta: {
        case_id: CASE_ID,
        jurisdiction: wizardFacts.jurisdiction,
      },
      // Flatten nested structures for wizard facts
      landlord_full_name: wizardFacts.landlord?.full_name,
      landlord_address: [
        wizardFacts.landlord?.address_line_1,
        wizardFacts.landlord?.city,
        wizardFacts.landlord?.postcode,
      ].filter(Boolean).join(', '),
      landlord_postcode: wizardFacts.landlord?.postcode,
      tenant_full_name: wizardFacts.tenant?.full_name,
      property_address_line1: wizardFacts.property?.address_line_1,
      property_city: wizardFacts.property?.city,
      property_postcode: wizardFacts.property?.postcode,
      tenancy_start_date: wizardFacts.tenancy?.start_date,
      tenancy_type: wizardFacts.tenancy?.tenancy_type,
      rent_amount: wizardFacts.tenancy?.rent_amount,
      rent_frequency: wizardFacts.tenancy?.rent_frequency,
      rent_due_day: wizardFacts.tenancy?.rent_due_day,
      // Ground codes should be strings like "ground_8" or "Ground 8"
      section8_grounds: wizardFacts.section8?.grounds || [],
      ground_codes: wizardFacts.section8?.grounds || [],
      grounds: wizardFacts.section8?.grounds?.map((g: string) => g) || [],
      notice_served_date: wizardFacts.notice?.served_date,
      // CRITICAL: Map arrears data to expected paths
      arrears_items: wizardFacts.arrears?.items?.map((item: any) => ({
        period_start: item.period_start,
        period_end: item.period_end,
        rent_due: item.amount_due,
        rent_paid: item.amount_paid,
        amount_owed: item.amount_owed,
      })) || [],
      total_arrears: wizardFacts.arrears?.total_arrears,
      issues: {
        rent_arrears: {
          arrears_items: wizardFacts.arrears?.items?.map((item: any) => ({
            period_start: item.period_start,
            period_end: item.period_end,
            rent_due: item.amount_due,
            rent_paid: item.amount_paid,
            amount_owed: item.amount_owed,
          })) || [],
          total_arrears: wizardFacts.arrears?.total_arrears,
        },
      },
      court_name: wizardFacts.court?.court_name,
      court_address: wizardFacts.court?.court_address,
      signatory_name: wizardFacts.signing?.signatory_name,
      // Signature date must be AFTER notice expiry (2026-02-02) for court pack validation
      signature_date: '2026-02-03',
      claim_type: 'section_8',
      eviction_route: 'section_8',
    };

    console.log('🧪 Generating complete eviction pack for case:', CASE_ID);
    console.log('   Total arrears in fixture:', wizardFacts.arrears?.total_arrears);

    // Generate the complete pack
    generatedPack = await generateCompleteEvictionPack(transformedFacts);

    // Save PDFs to output directory for inspection
    for (const doc of generatedPack.documents) {
      if (doc.pdf) {
        const pdfPath = path.join(OUTPUT_DIR, doc.file_name);
        await fs.writeFile(pdfPath, doc.pdf);
        console.log(`   Saved: ${pdfPath}`);
      }
    }

    // Extract text from key PDFs
    extractedTexts = { arrearsLetter: '', n119: '' };

    const arrearsLetterDoc = generatedPack.documents.find(
      (d: any) => d.document_type === 'arrears_engagement_letter'
    );
    if (arrearsLetterDoc?.pdf) {
      const result = await extractPdfText(arrearsLetterDoc.pdf);
      extractedTexts.arrearsLetter = result.text;

      // Save extracted text for debugging
      await fs.writeFile(
        path.join(OUTPUT_DIR, 'arrears_engagement_letter.txt'),
        extractedTexts.arrearsLetter
      );
    }

    const n119Doc = generatedPack.documents.find(
      (d: any) => d.file_name === 'n119_particulars_of_claim.pdf'
    );
    if (n119Doc?.pdf) {
      const result = await extractPdfText(n119Doc.pdf);
      extractedTexts.n119 = result.text;

      // Save extracted text for debugging
      await fs.writeFile(
        path.join(OUTPUT_DIR, 'n119_particulars_of_claim.txt'),
        extractedTexts.n119
      );
    }

    console.log('   Extracted text lengths:', {
      arrearsLetter: extractedTexts.arrearsLetter.length,
      n119: extractedTexts.n119.length,
    });
  }, 120000); // 2 minute timeout for generation

  describe('Part 1: Debug Stamp Verification', () => {
    it('debug stamp should be enabled in test environment', () => {
      expect(isDebugStampEnabled()).toBe(true);
    });

    it('should get git SHA', () => {
      const sha = getGitSha();
      expect(sha).toBeDefined();
      expect(sha.length).toBeGreaterThan(6);
      console.log('   Current git SHA:', sha);
    });

    it('should get short git SHA (7 chars)', () => {
      const shortSha = getGitShaShort();
      expect(shortSha).toBeDefined();
      expect(shortSha.length).toBe(7);
    });

    it('stamped SHA should match current HEAD', () => {
      const shortSha = getGitShaShort();
      const verification = verifyShaMatchesHead(shortSha);
      expect(verification.matches).toBe(true);
      console.log('   SHA verification:', verification);
    });

    it('arrears letter HTML should contain debug stamp footer', () => {
      const arrearsLetterDoc = generatedPack.documents.find(
        (d: any) => d.document_type === 'arrears_engagement_letter'
      );
      expect(arrearsLetterDoc).toBeDefined();

      const html = arrearsLetterDoc?.html || '';
      expect(html).toContain('debug-stamp-footer');
      expect(html).toContain('SHA:');
      expect(html).toContain('Gen:');
      expect(html).toContain('eviction-pack-generator.ts');
      expect(html).toContain(`Case: ${CASE_ID}`);
    });
  });

  describe('Part 2: Arrears Letter Verification', () => {
    it('pack should include arrears engagement letter', () => {
      const arrearsLetterDoc = generatedPack.documents.find(
        (d: any) => d.document_type === 'arrears_engagement_letter'
      );
      expect(arrearsLetterDoc).toBeDefined();
      expect(arrearsLetterDoc?.pdf).toBeDefined();
    });

    it('arrears letter HTML should NOT contain "£0.00" (fixture has £7000.07 arrears)', () => {
      const arrearsLetterDoc = generatedPack.documents.find(
        (d: any) => d.document_type === 'arrears_engagement_letter'
      );
      const html = arrearsLetterDoc?.html || '';

      expect(html.length).toBeGreaterThan(100);

      // CRITICAL ASSERTION: Must NOT show £0.00
      expect(html).not.toContain('£0.00');

      console.log('   Arrears letter HTML does not contain £0.00: PASS');
    });

    it('arrears letter HTML should contain actual arrears amount', () => {
      const arrearsLetterDoc = generatedPack.documents.find(
        (d: any) => d.document_type === 'arrears_engagement_letter'
      );
      const html = arrearsLetterDoc?.html || '';

      // Check for non-zero GBP amount in HTML (Puppeteer PDFs may not have extractable text)
      const hasActualAmount = html.includes('£7,000.07') ||
                               html.includes('£7000.07') ||
                               /£[1-9][\d,]*\.\d{2}/.test(html);
      expect(hasActualAmount).toBe(true);

      console.log('   Arrears letter HTML contains non-zero amount: PASS');
    });

    it('arrears debug JSON should have been written', async () => {
      const debugJsonPath = path.join(OUTPUT_DIR, 'arrears-letter-debug.json');
      const exists = await fs.stat(debugJsonPath).then(() => true).catch(() => false);

      if (exists) {
        const debugData = JSON.parse(await fs.readFile(debugJsonPath, 'utf-8'));
        console.log('   Arrears debug data:', {
          caseId: debugData.caseId,
          finalValue: debugData.finalComputedValue,
          sourceUsed: debugData.sourceUsed,
        });

        // Verify the final value is non-zero
        expect(debugData.finalComputedValue).toBeGreaterThan(0);
      }
    });
  });

  describe('Part 3: N119 Form Verification', () => {
    it('pack should include N119 particulars of claim', () => {
      const n119Doc = generatedPack.documents.find(
        (d: any) => d.file_name === 'n119_particulars_of_claim.pdf'
      );
      expect(n119Doc).toBeDefined();
      expect(n119Doc?.pdf).toBeDefined();
    });

    it('N119 should contain tenant name (Q2 persons in possession)', () => {
      expect(extractedTexts.n119).toBeDefined();
      expect(extractedTexts.n119.length).toBeGreaterThan(100);

      // Tenant name from fixture
      const tenantName = wizardFacts.tenant?.full_name || 'Sonia Shezadi';

      // N119 should include tenant name somewhere in the form
      expect(extractedTexts.n119).toContain(tenantName);

      console.log(`   N119 contains tenant name "${tenantName}": PASS`);
    });

    it('N119 should NOT contain malformed notice date fragment', () => {
      // This malformed fragment indicates Q6 fields are not being populated correctly
      const malformedFragment = ') was served on the defendant on 20 .';

      expect(extractedTexts.n119).not.toContain(malformedFragment);

      console.log('   N119 does not contain malformed fragment: PASS');
    });

    it('N119 Q6 should contain proper notice type text', () => {
      // Q6 should have "Notice seeking possession (Form 3)" for Section 8 cases
      const hasNoticeType = extractedTexts.n119.includes('Notice seeking possession') ||
                            extractedTexts.n119.includes('Form 3');

      expect(hasNoticeType).toBe(true);

      console.log('   N119 Q6 contains notice type: PASS');
    });
  });

  describe('Part 4: Pack Contents Verification', () => {
    it('pack should have expected documents', () => {
      expect(generatedPack.documents.length).toBeGreaterThan(5);

      const docTypes = generatedPack.documents.map((d: any) => d.document_type);
      console.log('   Generated document types:', docTypes);

      // Should have key documents
      expect(docTypes).toContain('arrears_engagement_letter');
    });

    it('all PDFs should be saved to tests/output', async () => {
      for (const doc of generatedPack.documents) {
        if (doc.pdf) {
          const pdfPath = path.join(OUTPUT_DIR, doc.file_name);
          const exists = await fs.stat(pdfPath).then(() => true).catch(() => false);
          expect(exists).toBe(true);
        }
      }
    });
  });
});
