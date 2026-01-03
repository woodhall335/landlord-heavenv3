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

describe('answer-questions validation', () => {
  beforeEach(() => {
    mockUpdateWizardFacts.mockResolvedValue({});
    mockGetOrCreateWizardFacts.mockResolvedValue({
      __meta: { product: 'notice_only' },
      selected_notice_route: 'section_8',
      evidence: { files: [] },
    });
    mockApplyDocumentIntelligence.mockReturnValue({ facts: {} });
    mockRunLegalValidator.mockReturnValue({
      validator_key: 'section_8',
      result: null,
      recommendations: [],
      missing_questions: [],
    });
  });

  it('rejects invalid date answers', async () => {
    const request = new Request('http://localhost/api/wizard/answer-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: 'case-1',
        answers: { arrears_start_date: 'not-a-date' },
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.errors[0].factKey).toBe('arrears_start_date');
  });
});
