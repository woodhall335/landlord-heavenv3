import { describe, expect, it } from 'vitest';

import { getASTDocuments } from '@/lib/documents/document-configs';
import { getASTTemplates } from '@/lib/documents/template-configs';

describe('England transition document configs', () => {
  it('shows the 2026 information sheet in preview metadata for existing written England tenancies only', () => {
    const existingWrittenDocs = getASTDocuments('england', 'standard', {
      englandTenancyPurpose: 'existing_written_tenancy',
    });
    const newAgreementDocs = getASTDocuments('england', 'standard', {
      englandTenancyPurpose: 'new_agreement',
    });
    const existingVerbalDocs = getASTDocuments('england', 'standard', {
      englandTenancyPurpose: 'existing_verbal_tenancy',
    });

    expect(existingWrittenDocs.some((doc) => doc.id === 'renters-rights-information-sheet-2026')).toBe(
      true
    );
    expect(newAgreementDocs.some((doc) => doc.id === 'renters-rights-information-sheet-2026')).toBe(
      false
    );
    expect(existingVerbalDocs.some((doc) => doc.id === 'renters-rights-information-sheet-2026')).toBe(
      false
    );
  });

  it('shows the 2026 information sheet in template metadata for existing written England tenancies only', () => {
    const existingWrittenTemplates = getASTTemplates('england', 'standard', {
      englandTenancyPurpose: ' existing_written_tenancy ',
    });
    const newAgreementTemplates = getASTTemplates('england', 'standard', {
      englandTenancyPurpose: 'new_agreement',
    });
    const existingVerbalTemplates = getASTTemplates('england', 'standard', {
      englandTenancyPurpose: 'existing_verbal_tenancy',
    });

    expect(
      existingWrittenTemplates.some(
        (template) =>
          template.id === 'renters-rights-information-sheet-2026' &&
          template.templatePath ===
            'mqs/tenancy_agreement/The_Renters__Rights_Act_Information_Sheet_2026.pdf'
      )
    ).toBe(true);
    expect(
      newAgreementTemplates.some((template) => template.id === 'renters-rights-information-sheet-2026')
    ).toBe(false);
    expect(
      existingVerbalTemplates.some((template) => template.id === 'renters-rights-information-sheet-2026')
    ).toBe(false);
  });

  it('keeps active England templates away from deprecated legacy AST files', () => {
    const standardTemplates = getASTTemplates('england', 'standard');
    const premiumTemplates = getASTTemplates('england', 'premium');

    [...standardTemplates, ...premiumTemplates].forEach((template) => {
      expect(template.templatePath).not.toContain('/deprecated/');
      expect(template.templatePath).not.toContain('\\deprecated\\');
      expect(template.templatePath).not.toBe('uk/england/templates/deprecated/standard_ast.hbs');
      expect(template.templatePath).not.toBe('uk/england/templates/deprecated/premium_ast.hbs');
    });
  });

  it('does not include the stale government model clauses appendix in active England tenancy packs', () => {
    const standardTemplates = getASTTemplates('england', 'standard');
    const premiumTemplates = getASTTemplates('england', 'premium');

    expect(standardTemplates.some((template) => template.id === 'government-model-clauses')).toBe(false);
    expect(premiumTemplates.some((template) => template.id === 'government-model-clauses')).toBe(false);
  });

  it('uses updated England checklist preview wording instead of the old How to Rent checklist label', () => {
    const docs = getASTDocuments('england', 'standard', {
      englandTenancyPurpose: 'new_agreement',
    });

    const checklist = docs.find((doc) => doc.id === 'compliance-checklist');

    expect(checklist?.description).toContain('England written-information or government-guidance duties');
    expect(checklist?.description).not.toContain('How to Rent Guide');
  });
});
