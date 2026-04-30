/**
 * Section 8 Bundle Consistency Tests
 *
 * Regression tests to ensure the England Section 8 templates keep a single
 * canonical Form 3A terminology and notice timeline across the support docs.
 */

import * as fs from 'fs';
import * as path from 'path';

const TEMPLATES_BASE = path.join(process.cwd(), 'config/jurisdictions/uk/england/templates');

describe('Section 8 bundle consistency', () => {
  test('court bundle index includes exhibit wiring and court timeline fields', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'eviction/court_bundle_index.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('bundle_exhibit_schedule_of_arrears');
    expect(content).toContain('bundle_exhibit_section8_notice');
    expect(content).toContain('bundle_exhibit_proof_of_service');
    expect(content).toContain('Court');
    expect(content).toContain('Notice expiry date');
    expect(content).toContain('Earliest proceedings date');
    expect(content).toContain('Latest proceedings date');
  });

  test.each([
    'notice_only/form_3_section8/notice.hbs',
    'eviction/service_instructions_section_8.hbs',
    'eviction/checklist_section_8.hbs',
  ])('%s keeps the narrow @page margin override', (templatePath) => {
    const fullPath = path.join(TEMPLATES_BASE, templatePath);
    const content = fs.readFileSync(fullPath, 'utf-8');

    expect(content).toMatch(/@page\s*\{[^}]*margin:\s*10mm/is);
  });

  test('service instructions render both canonical Section 8 support dates', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'eviction/service_instructions_section_8.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('Notice expiry date');
    expect(content).toContain('Earliest proceedings date');
    expect(content).toContain('Latest proceedings date');
    expect(content).toContain('Step 1 — Prepare');
    expect(content).toContain('Step 4 — Align');
    expect(content).toContain('{{notice_name}}');
    expect(content).toContain('Form 3A');
  });

  test('checklist renders both canonical Section 8 support dates', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'eviction/checklist_section_8.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('Notice expiry date');
    expect(content).toContain('Earliest proceedings date');
    expect(content).toContain('Latest proceedings date');
    expect(content).toContain('{{notice_name}}');
  });

  test('proof of service includes expiry and proceedings timeline rows using the canonical notice label', () => {
    const templatePath = path.join(process.cwd(), 'config/jurisdictions/shared/templates/proof_of_service.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('Notice expiry date');
    expect(content).toContain('Earliest proceedings date');
    expect(content).toContain('Latest proceedings date');
    expect(content).toContain('{{notice_name}}');
    expect(content).toContain("{{#unless (or (eq service_method 'hand') (eq service_method 'post') (eq service_method 'recorded_delivery'))}}");
  });

  test('hearing checklist includes the practical contingencies section', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'eviction/hearing_checklist.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('{{#if (or (hasValue notice_service_date) (hasValue notice_expiry_date) (hasValue earliest_proceedings_date))}}');
    expect(content).toContain('Latest proceedings date');
    expect(content).toContain('If the case changes');
    expect(content).toContain('The tenant attends with a defence.');
    expect(content).toContain('The tenant raises housing disrepair or a counterclaim.');
    expect(content).not.toContain('[Enter court name]');
  });

  test('notice template guards optional telephone and secondary signatory blocks', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'notice_only/form_3_section8/notice.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('{{#if (hasValue landlord_phone)}}');
    expect(content).toContain('{{#if (hasValue landlord_2_name)}}');
  });

  test('case summary guards optional notice rows and avoids empty defendant sections', () => {
    const templatePath = path.join(process.cwd(), 'config/jurisdictions/shared/templates/eviction_case_summary.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('{{#if (hasValue notice_expiry_date)}}');
    expect(content).toContain('{{#if (hasValue earliest_proceedings_date)}}');
    expect(content).toContain('{{pack_summary_title}}');
    expect(content).toContain('{{#each compliance_status_items}}');
    expect(content).toContain('drafting_model.caseSummary.defendantCircumstancesParagraphs.length');
  });

  test('shared guidance templates route England Section 8 copy through the canonical drafting model', () => {
    const caseSummaryPath = path.join(process.cwd(), 'config/jurisdictions/shared/templates/case_summary.hbs');
    const evidenceChecklistPath = path.join(
      process.cwd(),
      'config/jurisdictions/shared/templates/evidence_collection_checklist.hbs',
    );
    const coverLetterPath = path.join(
      TEMPLATES_BASE,
      'eviction/cover_letter_to_tenant.hbs',
    );

    const caseSummaryContent = fs.readFileSync(caseSummaryPath, 'utf-8');
    const evidenceChecklistContent = fs.readFileSync(evidenceChecklistPath, 'utf-8');
    const coverLetterContent = fs.readFileSync(coverLetterPath, 'utf-8');

    expect(caseSummaryContent).toContain('drafting_model.caseSummary.narrativeParagraphs.length');
    expect(caseSummaryContent).toContain('drafting_model.previewSummary.readinessItems.length');
    expect(caseSummaryContent).not.toContain('drafting_model.previewSummary.narrativeParagraphs');
    expect(evidenceChecklistContent).toContain('drafting_model.evidenceChecklist.groundSections.length');
    expect(coverLetterContent).toContain('drafting_model.coverLetter.introParagraphs.length');
    expect(coverLetterContent).toContain('{{notice_name}}');
    expect(coverLetterContent).not.toContain('{{notice_title}}');
  });

  test('witness statement only renders the timeline section when timeline content exists', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'eviction/witness-statement.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('{{#if (hasValue witness_statement.timeline)}}');
  });

  test('compliance checklist renders structured Section 8 risk cards', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'eviction/compliance_checklist.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('{{#each compliance_status_items}}');
    expect(content).toContain('{{status_label}}');
    expect(content).toContain('{{next_step_text}}');
    expect(content).toContain('Decision Engine');
  });

  test('what-happens-next template wires the stage handoff and next steps', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'eviction/what_happens_next_section_8.hbs');
    const content = fs.readFileSync(templatePath, 'utf-8');

    expect(content).toContain('{{#each next_steps}}');
    expect(content).toContain('{{#if (eq pack_stage "stage1")}}');
    expect(content).toContain('Stage 2 handoff');
  });
});
