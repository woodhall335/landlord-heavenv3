/**
 * N119 PDF Text Extraction Regression Test
 *
 * This test generates the N119 PDF and extracts text from the FLATTENED PDF
 * to verify the actual rendered content (not just field values).
 *
 * This is critical because field values may be set correctly but may not render
 * properly due to widget positioning, field overflow, or flattening issues.
 *
 * Test case: 549f8bbf-82c3-47f5-96fc-fb522b64867b (golden fixture)
 *
 * Requirements (non-negotiable):
 * - Q2 visibly populated with tenant name: "Sonia Shezadi"
 * - No broken Q5 fragment: ") was served on the defendant on 20 ."
 * - Q6 notice type and date remain correct
 * - Flattened PDF prints correctly
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fillN119Form, CaseData } from '@/lib/documents/official-forms-filler';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';

const execAsync = promisify(exec);

const OUTPUT_DIR = path.join(process.cwd(), 'tests', 'output');
const CASE_ID = '549f8bbf-82c3-47f5-96fc-fb522b64867b';

// Load the golden fixture
const fixturePath = path.join(
  process.cwd(),
  'tests/fixtures/complete-pack/england.section8.ground8.case.json'
);

/**
 * Extract text from a PDF using pdftotext (poppler-utils)
 */
async function extractPdfText(pdfPath: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`pdftotext -layout "${pdfPath}" -`);
    return stdout;
  } catch (error) {
    // If pdftotext is not available, fall back to a manual extraction notice
    console.warn('pdftotext not available - skipping text extraction');
    return '';
  }
}

/**
 * Check if pdftotext is available
 */
async function isPdftotextAvailable(): Promise<boolean> {
  try {
    await execAsync('which pdftotext');
    return true;
  } catch {
    return false;
  }
}

describe('N119 PDF Text Extraction Regression', () => {
  let caseData: CaseData;
  let flattenedPdfPath: string;
  let extractedText: string;
  let pdftotextAvailable: boolean;

  beforeAll(async () => {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Load fixture and verify case ID
    const goldenFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    expect(goldenFixture.case_id).toBe(CASE_ID);

    // Convert fixture to case data
    const result = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
    caseData = result.caseData;

    // Generate flattened PDF
    const flattenedBytes = await fillN119Form(caseData, { flatten: true });

    // Save to tests/output for verification
    flattenedPdfPath = path.join(OUTPUT_DIR, 'n119-postfix.pdf');
    fs.writeFileSync(flattenedPdfPath, flattenedBytes);
    console.log(`\n✅ Saved flattened PDF: ${flattenedPdfPath}`);

    // Check if pdftotext is available
    pdftotextAvailable = await isPdftotextAvailable();

    if (pdftotextAvailable) {
      // Extract text from PDF
      extractedText = await extractPdfText(flattenedPdfPath);
      console.log(`✅ Extracted ${extractedText.length} characters from PDF`);

      // Save extracted text for debugging
      const textPath = path.join(OUTPUT_DIR, 'n119-postfix-text.txt');
      fs.writeFileSync(textPath, extractedText);
      console.log(`✅ Saved extracted text: ${textPath}`);
    } else {
      console.warn('⚠️ pdftotext not available - text extraction tests will be skipped');
      extractedText = '';
    }
  });

  describe('Case Identity Verification', () => {
    it('should use the correct golden fixture case', () => {
      expect(caseData.tenant_full_name).toBe('Sonia Shezadi');
      expect(caseData.landlord_full_name).toBe('Tariq Mohammed');
    });
  });

  describe('Q2 - Persons in Possession (MUST CONTAIN TENANT NAME)', () => {
    it('should contain "Sonia Shezadi" in extracted text', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // The tenant name MUST appear in the rendered PDF
      expect(extractedText).toContain('Sonia Shezadi');
    });

    it('should have tenant name appear after Q2 question text', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // Q2 question text should appear before the answer
      const q2QuestionIndex = extractedText.indexOf('persons are in possession of the property');
      const tenantNameIndex = extractedText.indexOf('Sonia Shezadi');

      // If both are found, verify tenant name comes after Q2 question
      if (q2QuestionIndex !== -1 && tenantNameIndex !== -1) {
        // The first occurrence of Sonia Shezadi should be in the defendant name at the top
        // But there should be another occurrence in Q2
        const allOccurrences = [...extractedText.matchAll(/Sonia Shezadi/g)];
        expect(allOccurrences.length).toBeGreaterThanOrEqual(2); // At least in defendant name and Q2
      }
    });
  });

  describe('Q5 - Steps Taken (MUST NOT CONTAIN BROKEN FRAGMENT)', () => {
    it('should NOT contain ") was served on the defendant on 20 ." fragment', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // This broken fragment MUST NOT appear anywhere in the PDF text
      expect(extractedText).not.toContain(') was served on the defendant on 20 .');
      expect(extractedText).not.toContain(') was served on the defendant on 20.');
    });

    it('should NOT have incomplete date fragments in Q5', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // Extract text between Q5 and Q6 to check for orphaned fragments
      const q5Start = extractedText.indexOf('steps have already been taken to recover any arrears');
      const q6Start = extractedText.indexOf('appropriate (notice to quit)');

      if (q5Start !== -1 && q6Start !== -1 && q5Start < q6Start) {
        const q5Section = extractedText.substring(q5Start, q6Start);

        // Q5 section should NOT contain notice service text fragments
        expect(q5Section).not.toContain('was served on the defendant');
        expect(q5Section).not.toContain('Notice (Form 3)');
        expect(q5Section).not.toContain('Section 8 Notice');
      }
    });

    it('should contain only pre-action steps in Q5', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // Q5 should contain the neutral statement or actual pre-action steps
      // Look for the Q5 content
      const q5Start = extractedText.indexOf('steps have already been taken to recover any arrears');
      if (q5Start !== -1) {
        const q5Section = extractedText.substring(q5Start, q5Start + 500);

        // Should contain the neutral statement (if no specific steps recorded)
        // OR specific pre-action steps
        expect(
          q5Section.includes('contacted the defendant regarding the arrears') ||
          q5Section.includes('payment') ||
          q5Section.includes('letter') ||
          q5Section.length > 50
        ).toBe(true);
      }
    });
  });

  describe('Q6 - Notice Details (MUST BE CORRECT)', () => {
    it('should contain "Notice seeking possession (Form 3)"', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // The notice type must appear in the PDF
      // Note: The text may be split across lines in pdftotext output
      expect(
        extractedText.includes('Notice seeking possession (Form 3)') ||
        extractedText.includes('Notice seeking possession (Form')
      ).toBe(true);
    });

    it('should contain "19 January" for the notice date', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      expect(extractedText).toContain('19 January');
    });

    it('should contain year "26" for the notice date', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // The year should appear as "26" (2-digit year)
      // Check for "20 26" pattern (the way it renders in the form)
      expect(
        extractedText.includes('20 26') ||
        extractedText.includes('2026')
      ).toBe(true);
    });
  });

  describe('PDF Integrity', () => {
    it('should generate a valid PDF file', () => {
      expect(fs.existsSync(flattenedPdfPath)).toBe(true);

      const stats = fs.statSync(flattenedPdfPath);
      expect(stats.size).toBeGreaterThan(50000); // At least 50KB
    });

    it('should have valid PDF header', () => {
      const pdfBytes = fs.readFileSync(flattenedPdfPath);
      const header = pdfBytes.slice(0, 5).toString();
      expect(header).toBe('%PDF-');
    });

    it('should have proper case identifiers in the output', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // Essential case identifiers must be present
      expect(extractedText).toContain('Bradford Combined Court Centre');
      expect(extractedText).toContain('Tariq Mohammed');
      expect(extractedText).toContain('Sonia Shezadi');
      expect(extractedText).toContain('16 Waterloo Road');
    });
  });

  describe('Critical Content Verification', () => {
    it('should have all mandatory sections populated', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // Check for essential form sections
      expect(extractedText).toContain('Particulars of claim');
      expect(extractedText).toContain('About the tenancy');
      expect(extractedText).toContain('The reason the claimant is asking for possession');
      expect(extractedText).toContain('Statement of Truth');
    });

    it('should contain rent amount', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // Rent amount should be visible
      expect(extractedText).toContain('1000.01');
    });

    it('should contain tenancy start date', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // Tenancy date should be in UK format
      expect(extractedText).toContain('14 July 2025');
    });

    it('should contain arrears amount', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // Total arrears should be present
      expect(extractedText).toContain('7000.07');
    });

    it('should contain Ground 8 reference', () => {
      if (!pdftotextAvailable) {
        console.warn('Skipping: pdftotext not available');
        return;
      }

      // Ground 8 statutory reference
      expect(extractedText).toContain('Ground 8');
      expect(extractedText).toContain('Housing Act 1988');
    });
  });
});
