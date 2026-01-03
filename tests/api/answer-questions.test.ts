import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/wizard/answer-questions/route';

const mockUpdateWizardFacts = vi.fn();
const mockGetOrCreateWizardFacts = vi.fn();
const mockRunLegalValidator = vi.fn();
const mockApplyDocumentIntelligence = vi.fn();

vi.mock('@/lib/case-facts/store', () => ({
  updateWizardFacts: (...args: any[]) => mockUpdateWizardFacts(...args),
  getOrCreateWizardFacts: (...args: any[]) => mockGetOrCreateWizardFacts(...args),
}));

vi.mock('@/lib/validators/run-legal-validator', () => ({
  runLegalValidator: (...args: any[]) => mockRunLegalValidator(...args),
}));

vi.mock('@/lib/wizard/document-intel', () => ({
  applyDocumentIntelligence: (...args: any[]) => mockApplyDocumentIntelligence(...args),
}));

vi.mock('@/lib/evidence/map-evidence-to-facts', () => ({
  mapEvidenceToFacts: ({ facts }: any) => facts,
}));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { id: 'case-1', user_id: 'user-1', jurisdiction: 'england' },
            error: null,
          }),
        }),
      }),
    }),
  }),
  getServerUser: async () => ({ id: 'user-1' }),
}));

describe('answer-questions route', () => {
  let factsState: Record<string, any>;

  beforeEach(() => {
    factsState = { __meta: { product: 'notice_only' }, evidence: { files: [] } };
    mockUpdateWizardFacts.mockImplementation(async (_client: any, _caseId: string, updater: any) => {
      factsState = updater(factsState);
      return factsState;
    });
    mockGetOrCreateWizardFacts.mockImplementation(async () => factsState);
    mockApplyDocumentIntelligence.mockReturnValue({ facts: factsState });
    mockRunLegalValidator.mockReturnValue({
      validator_key: 'section_21',
      result: { status: 'warning', blockers: [], warnings: [], upsell: null },
      recommendations: [],
      missing_questions: [],
    });
  });

  it('updates answers and returns validation', async () => {
    const request = new Request('http://localhost/api/wizard/answer-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: 'case-1',
        answers: { deposit_protected: 'yes' },
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.validation_summary.status).toBe('warning');
    expect(factsState.deposit_protected).toBe('yes');
  });
});
