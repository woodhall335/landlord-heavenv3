import { describe, expect, it } from 'vitest';

import {
  EVIDENCE_INDEX_FOOTER,
  buildGenericEvidenceIndexRows,
  calculateEvidenceStrength,
  getEvidenceItemDisplayState,
  shouldShowEvidenceItem,
} from '../evidence';
import type { ClaimEvidenceCategory } from '../types';

describe('claims evidence evaluator', () => {
  it('evaluates showWhen expressions against mocked answers', () => {
    const item: ClaimEvidenceCategory = {
      id: 'pet_damage_evidence',
      label: 'Pet-related damage evidence',
      helperText: 'Photos and tenancy pet clause.',
      showWhen: 'damage_types.includes("pet_damage")',
    };

    expect(shouldShowEvidenceItem(item, { damage_types: ['pet_damage'] })).toBe(true);
    expect(shouldShowEvidenceItem(item, { damage_types: ['cleaning'] })).toBe(false);
  });

  it('uses keyword triggers across claim_story and problem_summary', () => {
    const item: ClaimEvidenceCategory = {
      id: 'pet_damage_evidence',
      label: 'Pet-related damage evidence',
      helperText: 'Photos and tenancy pet clause.',
      keywordTriggers: ['dog', 'cat', 'pet', 'chewed', 'scratch', 'urine'],
      aiHint: 'Photos are especially valuable.',
    };

    const state = getEvidenceItemDisplayState(item, {
      claim_story: 'The dog chewed the kitchen door.',
      problem_summary: '',
    });

    expect(state.visible).toBe(true);
    expect(state.triggeredByKeyword).toBe(true);
    expect(state.matchedKeyword).toBe('dog');
  });

  it('calculates Strong, Moderate, and Weak evidence strength', () => {
    const visibleItems: ClaimEvidenceCategory[] = [
      { id: 'invoice', label: 'Invoice', helperText: 'Invoice.', requiredForDocument: true },
      { id: 'contract', label: 'Contract', helperText: 'Contract.', recommended: true },
      { id: 'chaser', label: 'Chaser emails', helperText: 'Chasers.', recommended: true },
    ];

    expect(
      calculateEvidenceStrength({
        visibleItems,
        selectedIds: ['invoice', 'contract', 'chaser'],
        descriptions: {
          invoice: 'Shows the invoice amount, issue date, due date, and the defendant details.',
          contract: 'Shows the payment term and agreed scope of work.',
          chaser: 'Shows payment was chased after the due date and ignored.',
        },
      })
    ).toBe('Strong');

    expect(
      calculateEvidenceStrength({
        visibleItems,
        selectedIds: ['invoice'],
        descriptions: { invoice: 'Short note.' },
      })
    ).toBe('Moderate');

    expect(
      calculateEvidenceStrength({
        visibleItems,
        selectedIds: ['contract', 'chaser'],
        descriptions: {
          contract: 'Shows the payment term and agreed scope of work.',
          chaser: 'Shows payment was chased after the due date.',
        },
      })
    ).toBe('Weak');
  });

  it('builds generic evidence index rows with the filing footer', () => {
    const rows = buildGenericEvidenceIndexRows({
      visibleItems: [
        { id: 'invoice', label: 'Invoice', helperText: 'Invoice.' },
        { id: 'messages', label: 'Messages', helperText: 'Messages.' },
      ],
      selectedIds: ['messages'],
      descriptions: { messages: 'Shows the defendant admitted the debt.' },
    });

    expect(rows).toEqual([
      {
        id: 'messages',
        label: 'Messages',
        description: 'Shows the defendant admitted the debt.',
      },
    ]);
    expect(EVIDENCE_INDEX_FOOTER).toContain('attach copies of the evidence');
  });
});
