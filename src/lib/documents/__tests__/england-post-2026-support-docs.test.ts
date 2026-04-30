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
    expect(template).toContain('Latest proceedings date');
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
    expect(template).toContain('Step 1 — Prepare');
    expect(template).toContain('Step 2 — Serve');
    expect(template).toContain('Step 3 — Record');
    expect(template).toContain('Step 4 — Align');
    expect(template).toContain('Earliest proceedings date');
    expect(template).toContain('Latest proceedings date');
    expect(template).toContain('Form 3A');
  });

  it('renders the shared eviction case summary as a stage-aware front page', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'shared',
      'templates',
      'eviction_case_summary.hbs',
    );

    expect(template).toContain('{{pack_summary_title}}');
    expect(template).toContain('{{status_label}}');
    expect(template).toContain('{{#each compliance_status_items}}');
    expect(template).toContain('{{#each what_this_pack_does}}');
    expect(template).toContain('{{next_step_text}}');
  });

  it('renders the what-happens-next page for England Section 8 packs', () => {
    const template = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'what_happens_next_section_8.hbs',
    );

    expect(template).toContain('{{#each next_steps}}');
    expect(template).toContain('What Happens Next');
    expect(template).toContain('Stage 2 handoff');
    expect(template).toContain('single continuous file');
  });

  it('renders the new Stage 2 court support templates', () => {
    const courtReadiness = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'compliance_checklist.hbs',
    );
    const courtForms = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'court_forms_guide.hbs',
    );
    const serviceContinuity = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'service_record_notes.hbs',
    );
    const courtEvidence = readTemplate(
      'config',
      'jurisdictions',
      'uk',
      'england',
      'templates',
      'eviction',
      'evidence_checklist_court_stage.hbs',
    );

    expect(courtReadiness).toContain('{{#if key_risk_titles.length}}');
    expect(courtReadiness).toContain('{{#if checklist_title}}');
    expect(courtForms).toContain('Do not change');
    expect(courtForms).toContain('grounds');
    expect(courtForms).toContain('Form N5');
    expect(courtForms).toContain('Form N119');
    expect(serviceContinuity).toContain('This claim relies on the same service record created in Stage 1.');
    expect(serviceContinuity).toContain('N215 reflects the real date, address, and recipient used for service.');
    expect(courtEvidence).toContain('Evidence Required for Hearing');
    expect(courtEvidence).toContain('{{#each evidence_required_sections}}');
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
    expect(template).not.toContain('{{notice_title}}');
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
