/**
 * Section 8 Bundle Consistency Tests
 *
 * Regression tests to ensure the Section 8 Notice Only pack maintains
 * consistent margins, no duplicate content, and legally accurate guidance.
 */

import * as fs from 'fs';
import * as path from 'path';

const TEMPLATES_BASE = path.join(process.cwd(), 'config/jurisdictions/uk/england/templates');

describe('Section 8 Bundle PDF Consistency', () => {
  describe('Template Margins', () => {
    const templatePaths = [
      'notice_only/form_3_section8/notice.hbs',
      'eviction/service_instructions_section_8.hbs',
      'eviction/checklist_section_8.hbs',
    ];

    test.each(templatePaths)('%s contains @page margin: 10mm override', (templatePath) => {
      const fullPath = path.join(TEMPLATES_BASE, templatePath);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Check for @page rule with 10mm margin
      expect(content).toMatch(/@page\s*\{[^}]*margin:\s*10mm/);
    });
  });

  describe('Service Instructions - No Duplicate Content', () => {
    test('How to Serve heading appears exactly once', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/service_instructions_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Count occurrences of "How to Serve This Notice" as a heading
      const h2Matches = content.match(/<h2[^>]*>How to Serve This Notice<\/h2>/gi) || [];

      expect(h2Matches.length).toBe(1);
    });

    test('Does not contain S21-specific compliance blockers', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/service_instructions_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Should NOT mention S21-specific requirements as S8 validity blockers
      // These are: EPC, How to Rent guide, Gas cert as notice validity requirements
      expect(content).not.toMatch(/Missing compliance requirements.*gas cert.*EPC.*How to Rent/i);
      expect(content).not.toMatch(/Missing compliance requirements \(gas cert, EPC, How to Rent/i);
    });
  });

  describe('Checklist - Legal Accuracy', () => {
    test('Notice period guidance is legally correct (Grounds 10/11 = 60 days)', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/checklist_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Should contain correct notice period guidance
      // 2 months (60 days): Grounds 1, 2, 5, 6, 7, 9, 10, 11, 16
      expect(content).toMatch(/2 months.*60 days.*Grounds? 1.*2.*5.*6.*7.*9.*10.*11.*16/is);

      // 2 weeks (14 days): Grounds 3, 4, 8, 12, 13, 14, 15, 17
      expect(content).toMatch(/2 weeks.*14 days.*Grounds? 3.*4.*8.*12.*13.*14.*15.*17/is);
    });

    test('Does NOT contain incorrect "Grounds 1,2,5-7,9,16: Two weeks" guidance', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/checklist_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // The old incorrect guidance stated these grounds required 2 weeks - WRONG!
      expect(content).not.toMatch(/Grounds?\s*1.*2.*5.*7.*9.*16.*Two weeks/i);
      expect(content).not.toMatch(/Grounds?\s*1.*2.*5.*7.*9.*16.*2\s*weeks/i);
    });

    test('Mixed grounds guidance mentions using longest/maximum period', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/checklist_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Should mention that mixed grounds use the LONGEST period
      expect(content).toMatch(/Mixed grounds.*LONGEST|longest|maximum|MAX/i);
    });

    test('Mandatory ground statement is legally cautious', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/checklist_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Should NOT contain oversimplified blanket statement
      expect(content).not.toMatch(/Court must grant possession.*Grounds 1-8\)/);

      // Should contain more nuanced language about mandatory grounds
      expect(content).toMatch(/mandatory ground|must generally grant/i);
    });
  });

  describe('Keep-Together CSS', () => {
    test('Form 3 has .keep-together utility class', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'notice_only/form_3_section8/notice.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toMatch(/\.keep-together\s*\{[^}]*break-inside:\s*avoid/);
    });

    test('Service Instructions has keep-together CSS', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/service_instructions_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toMatch(/\.keep-together\s*\{[^}]*break-inside:\s*avoid/);
    });

    test('Checklist has keep-together CSS', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/checklist_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toMatch(/\.keep-together\s*\{[^}]*break-inside:\s*avoid/);
    });

    test('Form 3 signature section has page-break-inside: avoid', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'notice_only/form_3_section8/notice.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Section 7 signature block must stay together
      expect(content).toMatch(/\.signature-section\s*\{[^}]*page-break-inside:\s*avoid/);
    });
  });

  describe('Service Method Consistency', () => {
    test('Service Instructions has conditional service method blocks', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/service_instructions_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Should have conditional logic for service_method using eq helper
      // Actual syntax: {{#if (eq service_method "post")}}
      expect(content).toMatch(/\{\{#if \(eq service_method "post"\)\}\}/i);
      expect(content).toMatch(/YOUR CHOSEN METHOD/i);
    });
  });
});

describe('Field Mapping Consistency', () => {
  test('mapNoticeOnlyFacts exposes service_method for templates', () => {
    // This is a sanity check - the actual mapping is tested separately
    const normalizePath = path.join(process.cwd(), 'src/lib/case-facts/normalize.ts');
    const content = fs.readFileSync(normalizePath, 'utf-8');

    // Should expose service_method for template convenience
    expect(content).toMatch(/templateData\.service_method\s*=\s*templateData\.notice_service_method/);
  });
});
