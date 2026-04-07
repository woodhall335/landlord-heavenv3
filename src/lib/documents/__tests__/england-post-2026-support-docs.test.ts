import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function readTemplate(...segments: string[]): string {
  return fs.readFileSync(path.join(repoRoot, ...segments), 'utf8');
}

describe('England Section 8 support document templates', () => {
  it('uses current Form 3A language in the service checklist', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'checklist_section_8.hbs',
    );

    expect(template).toContain('{{notice_name}}');
    expect(template).toContain('Notice expiry date');
    expect(template).toContain('Earliest proceedings date');
  });

  it('uses current Form 3A language in service instructions', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'service_instructions_section_8.hbs',
    );

    expect(template).toContain('{{notice_name}}');
    expect(template).toContain('Earliest proceedings date');
    expect(template).toContain('Form 3A');
  });

  it('uses current Form 3A language in the court filing guide', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'court_filing_guide.hbs',
    );

    expect(template).toContain('drafting_model.courtFilingGuide.overviewParagraphs');
    expect(template).toContain('Form N5');
    expect(template).toContain('Form N119');
  });

  it('uses current Form 3A language in the cover letter', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'cover_letter_to_tenant.hbs',
    );

    expect(template).toContain('{{notice_name}}');
    expect(template).toContain('This letter is not the notice itself.');
  });

  it('routes shared guidance templates through the central drafting model', () => {
    const caseSummary = readTemplate(
      'config',
      'jurisdictions',
      'shared',
      'templates',
      'case_summary.hbs',
    );
    const evidenceChecklist = readTemplate(
      'config',
      'jurisdictions',
      'shared',
      'templates',
      'evidence_collection_checklist.hbs',
    );
    const roadmap = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'eviction_roadmap.hbs',
    );

    expect(caseSummary).toContain('drafting_model.caseSummary.narrativeParagraphs');
    expect(caseSummary).not.toContain('drafting_model.previewSummary.narrativeParagraphs');
    expect(evidenceChecklist).toContain('drafting_model.evidenceChecklist.groundSections.length');
    expect(evidenceChecklist).toContain('drafting_model.evidenceChecklist.collectionItems.length');
    expect(roadmap).toContain('drafting_model.roadmap.noticeStageItems.length');
    expect(roadmap).toContain('drafting_model.roadmap.warningParagraphs.length');
  });
});
