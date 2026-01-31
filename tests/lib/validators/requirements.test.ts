import { describe, expect, it } from 'vitest';
import { REQUIREMENTS } from '@/lib/validators/requirements';
import { runLegalValidator } from '@/lib/validators/run-legal-validator';

describe('validator requirements schema', () => {
  it('defines required questions and evidence for money claims', () => {
    const definition = REQUIREMENTS.money_claim;

    expect(definition.requiredFacts.length).toBeGreaterThan(0);
    expect(definition.requiredEvidence).toEqual(
      expect.arrayContaining(['bank_statement', 'rent_schedule'])
    );
  });

  it('produces deterministic next questions for missing facts', () => {
    const input = {
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_21',
        evidence: { files: [] },
      },
      analysis: null,
    };

    const first = runLegalValidator(input);
    const second = runLegalValidator(input);

    expect(first.missing_questions).toEqual(second.missing_questions);
    expect(first.recommendations).toEqual(second.recommendations);
  });
});
