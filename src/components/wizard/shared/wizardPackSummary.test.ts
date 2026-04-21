import { describe, expect, it } from 'vitest';

import { getWizardPackSummary } from './wizardPackSummary';

describe('getWizardPackSummary', () => {
  it('keeps Notice Only focused on notice-stage documents', () => {
    const summary = getWizardPackSummary('notice_only', [
      { id: 'case_basics', label: 'Notice Basics', isCurrent: true, isComplete: false },
      { id: 'parties', label: 'Parties', isCurrent: false, isComplete: true },
      { id: 'review', label: 'Review', isCurrent: false, isComplete: false },
    ]);

    expect(summary.includedDocuments).toContain('Form 3A notice');
    expect(summary.includedDocuments).toContain('Service instructions');
    expect(summary.includedDocuments).not.toContain('Form N5');
    expect(summary.includedDocuments).not.toContain('Form N119');
    expect(summary.outstandingSections).toContain('Review');
  });

  it('keeps Complete Pack focused on notice plus court documents', () => {
    const summary = getWizardPackSummary('complete_pack', [
      { id: 'case_basics', label: 'Possession Basics', isCurrent: true, isComplete: false, hasIssue: true },
      { id: 'evidence', label: 'Evidence', isCurrent: false, isComplete: false },
      { id: 'review', label: 'Review', isCurrent: false, isComplete: false },
    ]);

    expect(summary.includedDocuments).toContain('Form 3A notice');
    expect(summary.includedDocuments).toContain('Form N5');
    expect(summary.includedDocuments).toContain('Form N119');
    expect(summary.sectionsNeedingAttention).toContain('Possession Basics');
  });

  it('surfaces step-specific document focus for the current step', () => {
    const summary = getWizardPackSummary(
      'notice_only',
      [
        { id: 'notice', label: 'Notice Details', isCurrent: true, isComplete: false },
        { id: 'review', label: 'Review', isCurrent: false, isComplete: false },
      ],
      'notice'
    );

    expect(summary.currentStepDocuments).toContain('Form 3A notice');
    expect(summary.currentStepDocuments).toContain('Service instructions');
    expect(summary.currentStepDocuments).toContain('Service and validity checklist');
  });

  it('maps Section 13 defensive proof and visual previews into the shared summary', () => {
    const summary = getWizardPackSummary(
      'section13_defensive',
      [
        { id: 'proposal', label: 'Proposal', isCurrent: true, isComplete: false },
        { id: 'preview', label: 'Preview', isCurrent: false, isComplete: false },
      ],
      'proposal'
    );

    expect(summary.includedDocuments).toContain('Form 4A rent increase notice');
    expect(summary.includedDocuments).toContain('Tribunal argument summary');
    expect(summary.currentStepDocuments).toContain('Proof of service record');
    expect(summary.proofCards.some((card) => card.title === 'Tribunal bundle')).toBe(true);
    expect(summary.proofPreviews.some((preview) => preview.title === 'Form 4A notice')).toBe(true);
    expect(summary.proofPreviews.some((preview) => preview.title === 'Tribunal argument summary')).toBe(true);
  });
});
