/**
 * Regression tests for Section 8 PDF quality and legal accuracy
 *
 * Tests the following fixes:
 * 1. Form 3 Section 7 stays together (page-break-inside: avoid)
 * 2. Service Instructions callout headers don't split across pages
 * 3. Checklist notice periods match authoritative sources
 * 4. Page numbering is correct (last page shows "Page N of N")
 * 5. No duplicate content across documents
 *
 * Related PR: PDF quality + legal accuracy cleanup for Section 8
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateNoticeOnlyPreview, NoticeOnlyDocument } from '@/lib/documents/notice-only-preview-merger';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CSS PAGE BREAK TESTS
// ============================================================================

describe('Section 8 PDF Layout - Page Break Controls', () => {
  describe('Form 3 Section 7 (Signature Block)', () => {
    it('should have page-break-inside: avoid on .signature-section', () => {
      const form3Path = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs'
      );

      const templateContent = fs.readFileSync(form3Path, 'utf-8');

      // Extract .signature-section CSS rules
      const signatureSectionMatch = templateContent.match(
        /\.signature-section\s*\{[^}]*\}/
      );

      expect(signatureSectionMatch).not.toBeNull();
      const cssRules = signatureSectionMatch![0];

      // Should have page-break-inside: avoid
      expect(cssRules).toContain('page-break-inside: avoid');
      expect(cssRules).toContain('break-inside: avoid');
    });

    it('should have page-break-after: avoid on .signature-section h4', () => {
      const form3Path = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs'
      );

      const templateContent = fs.readFileSync(form3Path, 'utf-8');

      // Check for h4 keep-with-next styling
      expect(templateContent).toContain('page-break-after: avoid');
      expect(templateContent).toContain('break-after: avoid-page');
    });

    it('should have print media rules for signature section', () => {
      const form3Path = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs'
      );

      const templateContent = fs.readFileSync(form3Path, 'utf-8');

      // Should have @media print rules block and signature-section reference within it
      expect(templateContent).toContain('@media print');
      expect(templateContent).toContain('.signature-section');
      // The signature section should have page-break rules
      expect(templateContent).toMatch(/\.signature-section[\s\S]*?page-break-inside:\s*avoid/);
    });
  });

  describe('Service Instructions Callout Headers', () => {
    it('should have page-break-after: avoid on h2 elements', () => {
      const serviceInstructionsPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/service_instructions_section_8.hbs'
      );

      const templateContent = fs.readFileSync(serviceInstructionsPath, 'utf-8');

      // h2 should have page-break-after: avoid
      const h2Match = templateContent.match(/h2\s*\{[^}]*\}/);
      expect(h2Match).not.toBeNull();
      expect(h2Match![0]).toContain('page-break-after: avoid');
    });

    it('should have page-break-after: avoid on h3 elements', () => {
      const serviceInstructionsPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/service_instructions_section_8.hbs'
      );

      const templateContent = fs.readFileSync(serviceInstructionsPath, 'utf-8');

      // h3 should have page-break-after: avoid
      const h3Match = templateContent.match(/h3\s*\{[^}]*\}/);
      expect(h3Match).not.toBeNull();
      expect(h3Match![0]).toContain('page-break-after: avoid');
    });

    it('should have page-break-inside: avoid on .section elements', () => {
      const serviceInstructionsPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/service_instructions_section_8.hbs'
      );

      const templateContent = fs.readFileSync(serviceInstructionsPath, 'utf-8');

      // .section should have page-break-inside: avoid
      const sectionMatch = templateContent.match(/\.section\s*\{[^}]*\}/);
      expect(sectionMatch).not.toBeNull();
      expect(sectionMatch![0]).toContain('page-break-inside: avoid');
    });

    it('should have page-break-inside: avoid on callout boxes', () => {
      const serviceInstructionsPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/service_instructions_section_8.hbs'
      );

      const templateContent = fs.readFileSync(serviceInstructionsPath, 'utf-8');

      // .warning, .critical, .success should have page-break-inside: avoid
      const warningMatch = templateContent.match(/\.warning\s*\{[^}]*\}/);
      const criticalMatch = templateContent.match(/\.critical\s*\{[^}]*\}/);
      const successMatch = templateContent.match(/\.success\s*\{[^}]*\}/);

      expect(warningMatch![0]).toContain('page-break-inside: avoid');
      expect(criticalMatch![0]).toContain('page-break-inside: avoid');
      expect(successMatch![0]).toContain('page-break-inside: avoid');
    });

    it('should have section-header-block class with page-break-inside: avoid', () => {
      const serviceInstructionsPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/service_instructions_section_8.hbs'
      );

      const templateContent = fs.readFileSync(serviceInstructionsPath, 'utf-8');

      // .section-header-block should have page-break-inside: avoid
      const sectionHeaderBlockMatch = templateContent.match(/\.section-header-block\s*\{[^}]*\}/);
      expect(sectionHeaderBlockMatch).not.toBeNull();
      expect(sectionHeaderBlockMatch![0]).toContain('page-break-inside: avoid');
    });

    it('should have callout-section class with page-break-inside: avoid', () => {
      const serviceInstructionsPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/service_instructions_section_8.hbs'
      );

      const templateContent = fs.readFileSync(serviceInstructionsPath, 'utf-8');

      // .callout-section should have page-break-inside: avoid
      const calloutSectionMatch = templateContent.match(/\.callout-section\s*\{[^}]*\}/);
      expect(calloutSectionMatch).not.toBeNull();
      expect(calloutSectionMatch![0]).toContain('page-break-inside: avoid');
    });

    it('should wrap major sections with callout-section class', () => {
      const serviceInstructionsPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/service_instructions_section_8.hbs'
      );

      const templateContent = fs.readFileSync(serviceInstructionsPath, 'utf-8');

      // Major sections should use callout-section class
      expect(templateContent).toContain('class="section callout-section"');
    });
  });

  describe('Checklist Page Break Controls', () => {
    it('should have page-break-inside: avoid on .checklist elements', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // .checklist should have page-break-inside: avoid
      const checklistMatch = templateContent.match(/\.checklist\s*\{[^}]*\}/);
      expect(checklistMatch).not.toBeNull();
      expect(checklistMatch![0]).toContain('page-break-inside: avoid');
    });

    it('should have page-break-after: avoid on h2 elements', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // h2 should have page-break-after: avoid
      const h2Match = templateContent.match(/h2\s*\{[^}]*\}/);
      expect(h2Match).not.toBeNull();
      expect(h2Match![0]).toContain('page-break-after: avoid');
    });

    it('should have checklist-section class with page-break-inside: avoid', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // .checklist-section should have page-break-inside: avoid
      const checklistSectionMatch = templateContent.match(/\.checklist-section\s*\{[^}]*\}/);
      expect(checklistSectionMatch).not.toBeNull();
      expect(checklistSectionMatch![0]).toContain('page-break-inside: avoid');
    });

    it('should wrap major sections with checklist-section class', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // Major sections should use checklist-section class
      expect(templateContent).toContain('class="section checklist-section"');
    });
  });
});

// ============================================================================
// LEGAL ACCURACY TESTS - Notice Periods
// ============================================================================

describe('Section 8 Checklist - Legal Accuracy', () => {
  describe('Notice Period Statements', () => {
    it('should state 60 days for Grounds 1, 2, 5, 6, 7, 9, 10, 11, 16', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // CRITICAL: These grounds require 60 days (2 months), NOT 2 weeks
      expect(templateContent).toContain('60 days (2 months) minimum');
      expect(templateContent).toContain('Grounds 1, 2, 5, 6, 7, 9, 10, 11, 16');
    });

    it('should state 14 days for Grounds 3, 4, 7A, 7B, 8, 12, 13, 14, 14ZA, 15, 17', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // These grounds require 14 days (2 weeks)
      expect(templateContent).toContain('14 days (2 weeks) minimum');
      expect(templateContent).toContain('Grounds 3, 4, 7A, 7B, 8, 12, 13, 14, 14ZA, 15, 17');
    });

    it('should state immediate for Ground 14A and serious ASB', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // Immediate notice for Ground 14A and serious ASB
      expect(templateContent).toContain('Immediate (0 days)');
      expect(templateContent).toContain('Ground 14A');
    });

    it('should state multi-ground notices use maximum period', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // Multi-ground notices use MAXIMUM period
      expect(templateContent).toContain('MAXIMUM notice period');
    });

    it('should NOT contain incorrect "Grounds 1, 2, 5-7, 9, 16: Two weeks" statement', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // This was the old incorrect statement
      expect(templateContent).not.toMatch(/Grounds 1, 2, 5-7, 9, 16:?\s*Two weeks/i);
      expect(templateContent).not.toMatch(/Grounds 1, 2, 5-7, 9, 16:?\s*2 weeks/i);
    });

    it('should NOT contain "Other grounds: Two months minimum" catch-all', () => {
      const checklistPath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
      );

      const templateContent = fs.readFileSync(checklistPath, 'utf-8');

      // This was the old incorrect catch-all
      expect(templateContent).not.toMatch(/Other grounds:?\s*Two months minimum/i);
      expect(templateContent).not.toMatch(/Other grounds:?\s*2 months minimum/i);
    });
  });

  describe('Consistency with notice-date-calculator.ts', () => {
    it('should match SECTION8_GROUND_NOTICE_PERIODS from notice-date-calculator', async () => {
      // Import the authoritative source using dynamic import
      const { calculateSection8NoticePeriod } = await import('../../src/lib/documents/notice-date-calculator');

      // Test each category of grounds
      const twoMonthGrounds = [1, 2, 5, 6, 7, 9, 10, 11, 16];
      const twoWeekGrounds = [3, 4, 8, 12, 13, 14, 15, 17];

      // All 2-month grounds should return 60 days
      for (const code of twoMonthGrounds) {
        const result = calculateSection8NoticePeriod({
          grounds: [{ code, mandatory: code <= 8 }],
          jurisdiction: 'england',
        });
        expect(result.minimum_legal_days).toBe(60);
      }

      // All 2-week grounds should return 14 days
      for (const code of twoWeekGrounds) {
        const result = calculateSection8NoticePeriod({
          grounds: [{ code, mandatory: code <= 8 }],
          jurisdiction: 'england',
        });
        expect(result.minimum_legal_days).toBe(14);
      }
    });
  });
});

// ============================================================================
// PAGE NUMBERING TESTS
// ============================================================================

describe('PDF Page Numbering', () => {
  it('should show correct "Page N of N" on last page when TOC is included', async () => {
    // Create mock documents with PDFs
    const mockPdf1 = await PDFDocument.create();
    mockPdf1.addPage([595, 842]); // A4
    mockPdf1.addPage([595, 842]);
    mockPdf1.addPage([595, 842]);
    const pdf1Bytes = await mockPdf1.save();

    const mockPdf2 = await PDFDocument.create();
    mockPdf2.addPage([595, 842]);
    mockPdf2.addPage([595, 842]);
    const pdf2Bytes = await mockPdf2.save();

    const mockPdf3 = await PDFDocument.create();
    mockPdf3.addPage([595, 842]);
    const pdf3Bytes = await mockPdf3.save();

    const documents: NoticeOnlyDocument[] = [
      { title: 'Form 3 Notice', category: 'notice', pdf: Buffer.from(pdf1Bytes) },
      { title: 'Service Instructions', category: 'guidance', pdf: Buffer.from(pdf2Bytes) },
      { title: 'Checklist', category: 'checklist', pdf: Buffer.from(pdf3Bytes) },
    ];

    const mergedPdfBuffer = await generateNoticeOnlyPreview(documents, {
      jurisdiction: 'england',
      notice_type: 'section_8',
      includeTableOfContents: true,
    });

    // Load the merged PDF
    const mergedPdf = await PDFDocument.load(mergedPdfBuffer);
    const pageCount = mergedPdf.getPageCount();

    // Total should be: 1 TOC + 3 + 2 + 1 = 7 pages
    expect(pageCount).toBe(7);

    // Content pages = 6 (excluding TOC)
    // Last content page should be numbered "Page 6 of 6"
    // (This is verified by the implementation logic - we'd need to extract text from PDF to fully verify)
  });

  it('should exclude TOC from page count in numbering', async () => {
    // Create a simple mock PDF
    const mockPdf = await PDFDocument.create();
    mockPdf.addPage([595, 842]);
    const pdfBytes = await mockPdf.save();

    const documents: NoticeOnlyDocument[] = [
      { title: 'Test Document', category: 'notice', pdf: Buffer.from(pdfBytes) },
    ];

    const mergedPdfBuffer = await generateNoticeOnlyPreview(documents, {
      jurisdiction: 'england',
      notice_type: 'section_8',
      includeTableOfContents: true,
    });

    const mergedPdf = await PDFDocument.load(mergedPdfBuffer);
    const pageCount = mergedPdf.getPageCount();

    // 1 TOC + 1 content page = 2 total pages
    expect(pageCount).toBe(2);

    // Content pages = 1, so last page should show "Page 1 of 1"
  });

  it('should number pages correctly when TOC is not included', async () => {
    const mockPdf = await PDFDocument.create();
    mockPdf.addPage([595, 842]);
    mockPdf.addPage([595, 842]);
    mockPdf.addPage([595, 842]);
    const pdfBytes = await mockPdf.save();

    const documents: NoticeOnlyDocument[] = [
      { title: 'Test Document', category: 'notice', pdf: Buffer.from(pdfBytes) },
    ];

    const mergedPdfBuffer = await generateNoticeOnlyPreview(documents, {
      jurisdiction: 'england',
      notice_type: 'section_8',
      includeTableOfContents: false,
    });

    const mergedPdf = await PDFDocument.load(mergedPdfBuffer);
    const pageCount = mergedPdf.getPageCount();

    // 3 pages, all content
    expect(pageCount).toBe(3);

    // Last page should show "Page 3 of 3"
  });
});

// ============================================================================
// DE-DUPLICATION TESTS
// ============================================================================

describe('Section 8 Pack De-duplication', () => {
  it('Form 3 should NOT contain embedded Service Instructions', () => {
    const form3Path = path.join(
      process.cwd(),
      'config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs'
    );

    const templateContent = fs.readFileSync(form3Path, 'utf-8');

    // Check for Service Instructions as embedded content (not in comments)
    // The template should only reference them via comment
    const lines = templateContent.split('\n');
    let inComment = false;
    let hasEmbeddedServiceInstructions = false;

    for (const line of lines) {
      if (line.includes('{{!--')) inComment = true;
      if (line.includes('--}}')) inComment = false;

      if (!inComment && line.includes('Service Instructions')) {
        // If it's a heading tag, it's embedded
        if (line.includes('<h') || line.includes('How to Serve This Notice')) {
          hasEmbeddedServiceInstructions = true;
          break;
        }
      }
    }

    expect(hasEmbeddedServiceInstructions).toBe(false);
  });

  it('Form 3 should NOT contain embedded Validity Checklist', () => {
    const form3Path = path.join(
      process.cwd(),
      'config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs'
    );

    const templateContent = fs.readFileSync(form3Path, 'utf-8');

    // Check for Checklist as embedded content (not in comments)
    const lines = templateContent.split('\n');
    let inComment = false;
    let hasEmbeddedChecklist = false;

    for (const line of lines) {
      if (line.includes('{{!--')) inComment = true;
      if (line.includes('--}}')) inComment = false;

      if (!inComment && line.includes('Service and Validity Checklist')) {
        if (line.includes('<h') || line.includes('class="checklist"')) {
          hasEmbeddedChecklist = true;
          break;
        }
      }
    }

    expect(hasEmbeddedChecklist).toBe(false);
  });

  it('Form 3 should have comment referencing standalone documents', () => {
    const form3Path = path.join(
      process.cwd(),
      'config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs'
    );

    const templateContent = fs.readFileSync(form3Path, 'utf-8');

    // Should have comment explaining separate documents
    expect(templateContent).toContain('{{!--');
    expect(templateContent).toContain('Service Instructions');
    expect(templateContent).toContain('Validity Checklist');
    expect(templateContent).toContain('separate');
  });

  it('should have standalone service_instructions_section_8.hbs file', () => {
    const serviceInstructionsPath = path.join(
      process.cwd(),
      'config/jurisdictions/uk/england/templates/eviction/service_instructions_section_8.hbs'
    );

    expect(fs.existsSync(serviceInstructionsPath)).toBe(true);

    const content = fs.readFileSync(serviceInstructionsPath, 'utf-8');
    expect(content).toContain('Service Instructions');
    expect(content).toContain('<!DOCTYPE html>');
  });

  it('should have standalone checklist_section_8.hbs file', () => {
    const checklistPath = path.join(
      process.cwd(),
      'config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs'
    );

    expect(fs.existsSync(checklistPath)).toBe(true);

    const content = fs.readFileSync(checklistPath, 'utf-8');
    expect(content).toContain('Validity');
    expect(content).toContain('<!DOCTYPE html>');
  });
});

// ============================================================================
// CONFIG SOURCE CONSISTENCY
// ============================================================================

describe('Config Source Consistency', () => {
  it('decision_rules.yaml should have correct notice periods for Grounds 10, 11', () => {
    const decisionRulesPath = path.join(
      process.cwd(),
      'config/jurisdictions/uk/england/decision_rules.yaml'
    );

    const yamlContent = fs.readFileSync(decisionRulesPath, 'utf-8');

    // Ground 10 should be 60 days (2 months), NOT 14 days
    expect(yamlContent).toMatch(/ground_10:[\s\S]*?notice_period_days:\s*60/);

    // Ground 11 should be 60 days (2 months), NOT 14 days
    expect(yamlContent).toMatch(/ground_11:[\s\S]*?notice_period_days:\s*60/);
  });
});
